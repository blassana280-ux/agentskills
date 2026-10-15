import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Markdown from "./components/Markdown";
import {
  DEFAULT_SYSTEM_PROMPT,
  PROVIDERS,
  ProviderRequestError,
  estimateCost,
  estimateTokens,
  errorLabel,
  fetchRetry,
  formatCost,
  getBaseUrl,
  getProvider,
  modelOptions,
  readLocal,
  streamCompletion,
  supportsTools,
  textFromMessages,
  uid,
  writeLocal,
  type ChatImage,
  type ChatMessage,
  type CouncilExpert,
  type ProviderMessage,
  type PromptItem,
  type UsageRow,
} from "./lib/core";
import { decryptVault, encryptVault } from "./lib/crypto";
import { AGENT_TOOLS, executeTool } from "./lib/tools";
import "./styles.css";

const UsageChart = React.lazy(() => import("./components/UsageChart"));

type TabId = "chat" | "agent" | "council" | "vault" | "costs" | "prompts";
type AgentEvent =
  | { id: string; type: "step"; title: string }
  | { id: string; type: "reasoning" | "thought"; content: string }
  | { id: string; type: "tool"; name: string; arguments: string; status: "running" | "success" | "error" | "refused"; result?: string }
  | { id: string; type: "final"; content: string }
  | { id: string; type: "info"; content: string };
type CouncilEntry = CouncilExpert & { status: "pending" | "running" | "done" | "error"; content: string; error?: string; usage?: UsageRow };
type CouncilRun = { id: string; question: string; entries: CouncilEntry[]; cost: number; moderator: { providerId: string; model: string; status: "pending" | "running" | "done" | "error"; content: string; error?: string } };
type Confirmation = { tool: string; args: Record<string, unknown>; resolve: (allowed: boolean) => void };
type VaultData = { keys: Record<string, string>; extraModels: Record<string, string[]>; customUrl: string; githubPat: string; prompts: PromptItem[]; system: string };

const NAV: { id: TabId; label: string; icon: string; caption: string }[] = [
  { id: "chat", label: "Chat", icon: "◌", caption: "Conversation" },
  { id: "agent", label: "Agent", icon: "✳", caption: "Automatisation" },
  { id: "council", label: "Council", icon: "⌘", caption: "Débat multi-IA" },
  { id: "vault", label: "Vault", icon: "▣", caption: "Clés & providers" },
  { id: "costs", label: "Coûts", icon: "▥", caption: "Usage & budget" },
  { id: "prompts", label: "Prompts", icon: "▤", caption: "Bibliothèque" },
];
const DESTRUCTIVE_TOOLS = new Set(["github_write_file", "github_create_issue"]);
const AGENT_SYSTEM = `Tu es Nexus, un agent ReAct autonome qui travaille en français.
Tu avances par étapes courtes : réfléchir, appeler les outils natifs disponibles, observer leurs résultats, corriger ta stratégie et continuer.
RÈGLES STRICTES :
- N'invente jamais le résultat d'un outil. Seul son retour réel constitue une preuve.
- Si un outil échoue, analyse l'erreur et tente une correction raisonnable, sans boucle répétitive.
- Si une tâche nécessite GitHub et que le PAT manque, signale-le clairement.
- Utilise calculator pour tout calcul numérique et web_search/GitHub pour toute information externe vérifiable. Cite les liens des sources consultées.
- Toute création/modification GitHub sensible exige l'autorisation explicite de l'utilisateur dans l'interface. Si elle est refusée, n'insiste pas et propose une alternative sûre.
- Ne révèle ni ne recopie de clé, token ou secret.
- Termine par une réponse finale concise, structurée en Markdown, avec les actions réellement effectuées et les limites.`;
const COUNCIL_EXPERT_SYSTEM = "Tu es un expert participant à un conseil multi-IA. Réponds de façon autonome, argumentée et concise à la question. Sépare faits, hypothèses et recommandation. N'invente pas de sources.";
const COUNCIL_MODERATOR_SYSTEM = `Tu es le modérateur impartial d'un conseil multi-IA. Analyse toutes les contributions fournies et produis une synthèse en français avec ces sections : Consensus, Divergences, Recommandation tranchée, Points à vérifier. Signale les contradictions et les incertitudes; ne prétends pas avoir vérifié les faits.`;

function defaultCouncilRows(keys: Record<string, string>): CouncilExpert[] {
  const fallbackProviders = PROVIDERS.filter((provider) => ["openai", "groq", "deepseek"].includes(provider.id));
  const selected = PROVIDERS.filter((provider) => keys[provider.id]).slice(0, 3);
  for (const provider of fallbackProviders) {
    if (selected.length >= 3) break;
    if (!selected.some((item) => item.id === provider.id)) selected.push(provider);
  }
  return selected.slice(0, 3).map((provider) => ({
    id: uid(),
    providerId: provider.id,
    model: modelOptions(provider.id, {})[0]?.id ?? "",
  }));
}

function defaultCouncilModerator(keys: Record<string, string>) {
  const provider = PROVIDERS.find((item) => keys[item.id]) ?? getProvider("openai");
  return { providerId: provider.id, model: modelOptions(provider.id, {})[0]?.id ?? "gpt-4o-mini" };
}

function defaultMessageHistory(): ChatMessage[] {
  const data = readLocal<ChatMessage[]>("chat", []);
  if (!Array.isArray(data)) return [];
  return data.slice(-60).map((message) => ({ ...message, images: undefined, status: undefined }))
    .filter((message) => ["user", "assistant", "notice"].includes(message.role) && typeof message.content === "string");
}

function toProviderMessages(messages: ChatMessage[]): ProviderMessage[] {
  return messages.filter((message): message is ChatMessage & { role: "user" | "assistant" } => message.role === "user" || message.role === "assistant").map((message) => {
    if (message.role === "user" && message.images?.length) {
      return {
        role: "user",
        content: [
          ...(message.content ? [{ type: "text" as const, text: message.content }] : []),
          ...message.images.map((image) => ({ type: "image_url" as const, image_url: { url: image.dataUrl } })),
        ],
      };
    }
    return { role: message.role, content: message.content };
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ProviderRequestError) return error.message;
  if (error instanceof Error) return error.name === "AbortError" ? "Génération interrompue." : error.message;
  return String(error);
}

function clipForModel(value: string, max: number): string {
  if (value.length <= max) return value;
  const marker = `\n\n[… résultat tronqué à ${max} caractères pour le contexte.]`;
  return `${value.slice(0, Math.max(0, max - marker.length))}${marker}`;
}

function clipForDisplay(value: string, max: number): string {
  if (value.length <= max) return value;
  const marker = "\n[… tronqué à l'affichage]";
  return `${value.slice(0, Math.max(0, max - marker.length))}${marker}`;
}

function addUsageRow(row: UsageRow, setter: React.Dispatch<React.SetStateAction<UsageRow[]>>) {
  setter((current) => [row, ...current].slice(0, 5000));
}

function SelectProvider({
  value,
  onChange,
  keys,
  includeAll = true,
}: {
  value: string;
  onChange: (value: string) => void;
  keys?: Record<string, string>;
  includeAll?: boolean;
}) {
  return (
    <select className="select-control" value={value} onChange={(event) => onChange(event.target.value)} aria-label="Provider">
      {includeAll && <option value="">Choisir un provider</option>}
      {PROVIDERS.map((provider) => <option value={provider.id} key={provider.id}>{keys ? `${keys[provider.id] ? "●" : "○"} ` : ""}{provider.label}</option>)}
    </select>
  );
}

function SelectModel({
  providerId,
  value,
  onChange,
  extraModels,
}: {
  providerId: string;
  value: string;
  onChange: (value: string) => void;
  extraModels: Record<string, string[]>;
}) {
  const models = modelOptions(providerId, extraModels);
  return (
    <select className="select-control model-select" value={value} onChange={(event) => onChange(event.target.value)} aria-label="Modèle">
      {models.length ? models.map((item) => <option value={item.id} key={item.id}>{item.id}</option>) : <option value="">Chargez les modèles depuis le Vault</option>}
      {value && !models.some((item) => item.id === value) && <option value={value}>{value}</option>}
    </select>
  );
}

function FileImage({ image, onRemove }: { image: ChatImage; onRemove?: () => void }) {
  return (
    <div className="image-preview" title={image.name}>
      <img src={image.dataUrl} alt={image.name} />
      <span>{image.name}</span>
      {onRemove && <button type="button" className="image-remove" onClick={onRemove} aria-label={`Retirer ${image.name}`}>×</button>}
    </div>
  );
}

function ToolBadge({ providerId: selectedProviderId, model: selectedModel }: { providerId: string; model: string }) {
  const support = supportsTools(selectedProviderId, selectedModel);
  const label = support === "yes" ? "Tool calling compatible" : support === "no" ? "Tool calling non supporté" : "Compatibilité tool calling inconnue";
  return <span className={`tool-compat ${support}`} title={label}>{support === "yes" ? "✓ Supporté" : support === "no" ? "! Limité" : "? À vérifier"}</span>;
}

function App() {
  const [tab, setTab] = useState<TabId>("chat");
  const [dark, setDark] = useState(() => readLocal("dark", true));
  const [keys, setKeys] = useState<Record<string, string>>(() => readLocal("keys", {}));
  const [keyDrafts, setKeyDrafts] = useState<Record<string, string>>(() => readLocal("keys", {}));
  const [githubPat, setGithubPat] = useState(() => readLocal("githubPat", ""));
  const [patDraft, setPatDraft] = useState(() => readLocal("githubPat", ""));
  const [extraModels, setExtraModels] = useState<Record<string, string[]>>(() => readLocal("extraModels", {}));
  const [customUrl, setCustomUrl] = useState(() => readLocal("customUrl", "https://api.exemple.com/v1"));
  const [customUrlDraft, setCustomUrlDraft] = useState(() => readLocal("customUrl", "https://api.exemple.com/v1"));
  const [providerId, setProviderId] = useState(() => readLocal("provider", "openai"));
  const [model, setModel] = useState(() => readLocal("model", "gpt-4o-mini"));
  const [fallback, setFallback] = useState(() => readLocal("fallback", true));
  const [systemPrompt, setSystemPrompt] = useState(() => readLocal("system", DEFAULT_SYSTEM_PROMPT));
  const [chat, setChat] = useState<ChatMessage[]>(defaultMessageHistory);
  const [chatStreaming, setChatStreaming] = useState(false);
  const [composer, setComposer] = useState("");
  const [composerImages, setComposerImages] = useState<ChatImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const [systemEditorOpen, setSystemEditorOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [keysStatus, setKeysStatus] = useState<Record<string, { loading: boolean; message: string; error?: boolean }>>({});
  const [usage, setUsage] = useState<UsageRow[]>(() => readLocal("usage", []));
  const [prompts, setPrompts] = useState<PromptItem[]>(() => readLocal("prompts", []));
  const [promptForm, setPromptForm] = useState({ title: "", body: "", tag: "Général" });
  const [agentProvider, setAgentProvider] = useState(() => readLocal("agent.provider", "groq"));
  const [agentModel, setAgentModel] = useState(() => readLocal("agent.model", "llama-3.3-70b-versatile"));
  const [agentMaxSteps, setAgentMaxSteps] = useState<number>(() => readLocal("agent.maxSteps", 6));
  const [agentMission, setAgentMission] = useState("");
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentEvents, setAgentEvents] = useState<AgentEvent[]>([]);
  const [missionCost, setMissionCost] = useState(0);
  const [pendingConfirmation, setPendingConfirmation] = useState<Confirmation | null>(null);
  const [councilRows, setCouncilRows] = useState<CouncilExpert[]>(() => {
    const saved = readLocal<CouncilExpert[]>("council.rows", []);
    return saved.length >= 2 ? saved.slice(0, 4) : defaultCouncilRows(readLocal("keys", {}));
  });
  const [councilMod, setCouncilMod] = useState(() => readLocal("council.mod", defaultCouncilModerator(readLocal("keys", {}))));
  const [councilQuestion, setCouncilQuestion] = useState("");
  const [councilRunning, setCouncilRunning] = useState(false);
  const [councilRun, setCouncilRun] = useState<CouncilRun | null>(null);
  const [vaultPassphrase, setVaultPassphrase] = useState("");
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [vaultNotice, setVaultNotice] = useState("");
  const [vaultError, setVaultError] = useState("");

  const chatRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatAbortRef = useRef<AbortController | null>(null);
  const chatBusyRef = useRef(false);
  const agentAbortRef = useRef<AbortController | null>(null);
  const agentBusyRef = useRef(false);
  const councilAbortRef = useRef<AbortController[]>([]);
  const councilBusyRef = useRef(false);
  const confirmResolverRef = useRef<((allowed: boolean) => void) | null>(null);

  const totalCost = useMemo(() => usage.reduce((sum, row) => sum + (row.costKnown === false ? 0 : row.cost), 0), [usage]);
  const currentProvider = getProvider(providerId);
  const agentToolSupport = supportsTools(agentProvider, agentModel);
  const pageTitle = NAV.find((item) => item.id === tab) ?? NAV[0];
  const paletteItems = useMemo(() => PROVIDERS.flatMap((provider) => {
    const models = modelOptions(provider.id, extraModels);
    return models.map((item) => ({ provider, model: item.id }));
  }).filter(({ provider, model: modelId }) => `${provider.label} ${modelId}`.toLowerCase().includes(paletteQuery.toLowerCase())), [extraModels, paletteQuery]);
  const usageByProvider = useMemo(() => PROVIDERS.map((provider) => {
    const rows = usage.filter((row) => row.providerId === provider.id);
    const costKnown = rows.some((row) => row.costKnown !== false);
    return { provider: provider.label, count: rows.length, cost: rows.reduce((sum, row) => sum + (row.costKnown === false ? 0 : row.cost), 0), costKnown };
  }).filter((row) => row.count), [usage]);

  useEffect(() => { writeLocal("dark", dark); document.documentElement.dataset.theme = dark ? "dark" : "light"; }, [dark]);
  useEffect(() => { writeLocal("keys", keys); }, [keys]);
  useEffect(() => { writeLocal("githubPat", githubPat); }, [githubPat]);
  useEffect(() => { writeLocal("extraModels", extraModels); }, [extraModels]);
  useEffect(() => { writeLocal("customUrl", customUrl); }, [customUrl]);
  useEffect(() => { writeLocal("provider", providerId); }, [providerId]);
  useEffect(() => { writeLocal("model", model); }, [model]);
  useEffect(() => { writeLocal("fallback", fallback); }, [fallback]);
  useEffect(() => { writeLocal("system", systemPrompt); }, [systemPrompt]);
  useEffect(() => { writeLocal("agent.provider", agentProvider); }, [agentProvider]);
  useEffect(() => { writeLocal("agent.model", agentModel); }, [agentModel]);
  useEffect(() => { writeLocal("agent.maxSteps", agentMaxSteps); }, [agentMaxSteps]);
  useEffect(() => { writeLocal("council.rows", councilRows); }, [councilRows]);
  useEffect(() => { writeLocal("council.mod", councilMod); }, [councilMod]);
  useEffect(() => { writeLocal("usage", usage); }, [usage]);
  useEffect(() => { writeLocal("prompts", prompts); }, [prompts]);
  useEffect(() => {
    if (chatStreaming) return;
    writeLocal("chat", chat.slice(-60).map(({ images: _images, status: _status, ...message }) => message));
  }, [chat, chatStreaming]);
  useEffect(() => {
    if (!chatStreaming) return;
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [chat, chatStreaming]);

  const stopChat = useCallback(() => { chatAbortRef.current?.abort(); }, []);
  const stopAgent = useCallback(() => {
    agentAbortRef.current?.abort();
    if (confirmResolverRef.current) {
      confirmResolverRef.current(false);
      confirmResolverRef.current = null;
      setPendingConfirmation(null);
    }
  }, []);
  const stopCouncil = useCallback(() => { councilAbortRef.current.forEach((controller) => controller.abort()); }, []);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); setPaletteOpen(true); setPaletteQuery(""); return;
      }
      if (event.key === "Escape") {
        if (pendingConfirmation) {
          event.preventDefault(); confirmResolverRef.current?.(false); confirmResolverRef.current = null; setPendingConfirmation(null);
        } else if (paletteOpen) setPaletteOpen(false);
        else if (chatBusyRef.current) stopChat();
        else if (agentBusyRef.current) stopAgent();
        else if (councilBusyRef.current) stopCouncil();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [paletteOpen, pendingConfirmation, stopChat, stopAgent, stopCouncil]);

  const addUsage = useCallback((row: UsageRow) => addUsageRow(row, setUsage), []);
  const setChatField = (id: string, patch: Partial<ChatMessage>) => setChat((current) => current.map((message) => message.id === id ? { ...message, ...patch } : message));

  const attachFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    const room = Math.max(0, 4 - composerImages.length);
    const selected = imageFiles.slice(0, room);
    if (!selected.length) return;
    const images = await Promise.all(selected.map((file) => new Promise<ChatImage>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, dataUrl: String(reader.result), mimeType: file.type });
      reader.onerror = () => reject(new Error(`Lecture impossible : ${file.name}`));
      reader.readAsDataURL(file);
    }).catch((error) => {
      setChat((current) => [...current, { id: uid(), role: "notice", content: error instanceof Error ? error.message : "Image illisible." }]);
      return null;
    })));
    setComposerImages((current) => [...current, ...images.filter((image): image is ChatImage => Boolean(image))].slice(0, 4));
  };

  const sendChat = async () => {
    const text = composer.trim();
    if (chatBusyRef.current || (!text && composerImages.length === 0)) return;
    const attachments = composerImages;
    const userMessage: ChatMessage = { id: uid(), role: "user", content: text, images: attachments };
    const assistantMessage: ChatMessage = { id: uid(), role: "assistant", content: "", status: "streaming" };
    const history = [...chat.filter((message) => message.role === "user" || message.role === "assistant"), userMessage].slice(-60);
    const conversation = toProviderMessages(history);
    setChat((current) => [...current, userMessage, assistantMessage].slice(-60));
    setComposer(""); setComposerImages([]);
    chatBusyRef.current = true; setChatStreaming(true);
    const controller = new AbortController(); chatAbortRef.current = controller;
    const candidates = fallback ? [providerId, ...PROVIDERS.filter((provider) => keys[provider.id] && provider.id !== providerId).map((provider) => provider.id)] : [providerId];
    const failures: string[] = [];
    let succeeded = false;
    for (let index = 0; index < candidates.length; index += 1) {
      const candidateId = candidates[index];
      const candidateProvider = getProvider(candidateId);
      const candidateModel = candidateId === providerId ? model : modelOptions(candidateId, extraModels)[0]?.id ?? "";
      const nextCandidate = candidates[index + 1];
      if (!keys[candidateId]) {
        failures.push(`${candidateProvider.label} (${candidateModel || "modèle par défaut"}) : aucune clé enregistrée dans le Vault${nextCandidate ? ` → bascule vers ${getProvider(nextCandidate).label}…` : ""}`);
        if (!fallback) break;
        continue;
      }
      setChatField(assistantMessage.id, { content: "", reasoning: "", providerId: candidateId, model: candidateModel });
      try {
        const started = performance.now();
        const result = await streamCompletion({
          provider: candidateProvider, baseUrl: getBaseUrl(candidateId, customUrl), apiKey: keys[candidateId], model: candidateModel,
          messages: conversation, system: systemPrompt, signal: controller.signal,
          onDelta: (kind, delta) => setChat((current) => current.map((message) => message.id !== assistantMessage.id ? message : {
            ...message,
            [kind === "content" ? "content" : "reasoning"]: `${message[kind === "content" ? "content" : "reasoning"] ?? ""}${delta}`,
            providerId: candidateId, model: candidateModel,
          })),
        });
        if (controller.signal.aborted) break;
        const durationMs = Math.max(1, performance.now() - started);
        const input = result.usage?.input || estimateTokens(`${systemPrompt}\n${textFromMessages(conversation)}`);
        const output = result.usage?.output || estimateTokens(`${result.content}${result.reasoning}`);
        const pricing = estimateCost(candidateId, candidateModel, input, output);
        const usageRow: UsageRow = { id: uid(), providerId: candidateId, model: candidateModel, input, output, cost: pricing.cost, costKnown: pricing.known, ts: Date.now() };
        addUsage(usageRow);
        setChatField(assistantMessage.id, {
          content: result.content || "Le provider a terminé sans renvoyer de texte.", reasoning: result.reasoning,
          providerId: candidateId, model: candidateModel,
          usage: { input, output, cost: pricing.cost, costKnown: pricing.known, durationMs, tokensPerSecond: output / (durationMs / 1000) },
          status: undefined, errorNotes: failures,
        });
        succeeded = true; break;
      } catch (error) {
        if (controller.signal.aborted || (error instanceof Error && error.name === "AbortError")) break;
        const detail = getErrorMessage(error);
        failures.push(`⚠️ ${candidateProvider.label} (${candidateModel || "modèle par défaut"}) : ${detail}${nextCandidate ? ` → bascule vers ${getProvider(nextCandidate).label}…` : ""}`);
        if (!fallback) break;
      }
    }
    if (controller.signal.aborted) setChatField(assistantMessage.id, { status: "stopped", errorNotes: failures });
    else if (!succeeded) setChatField(assistantMessage.id, {
      content: failures.length ? "Tous les providers sélectionnés ont échoué. Vérifiez les détails ci-dessus et votre configuration dans le Vault." : "Aucun provider n'est disponible. Ajoutez une clé API dans le Vault.",
      status: undefined, errorNotes: failures,
    });
    chatAbortRef.current = null; chatBusyRef.current = false; setChatStreaming(false);
  };

  const startAgent = async () => {
    if (agentBusyRef.current || !agentMission.trim()) return;
    const selectedProvider = getProvider(agentProvider);
    const selectedModel = agentModel || modelOptions(agentProvider, extraModels)[0]?.id || "";
    const controller = new AbortController(); agentAbortRef.current = controller;
    agentBusyRef.current = true; setAgentRunning(true); setAgentEvents([]); setMissionCost(0);
    const pushEvent = (event: AgentEvent) => setAgentEvents((current) => [...current, event]);
    const patchEvent = (id: string, patch: Partial<AgentEvent>) => setAgentEvents((current) => current.map((event) => event.id === id ? { ...event, ...patch } as AgentEvent : event));
    const conversations: ProviderMessage[] = [{ role: "user", content: agentMission.trim() }];
    let totalMissionCost = 0;
    try {
      for (let step = 1; step <= agentMaxSteps; step += 1) {
        if (controller.signal.aborted) break;
        pushEvent({ id: uid(), type: "step", title: `Étape ${step} / ${agentMaxSteps}${step === agentMaxSteps ? " · synthèse finale sans outils" : ""}` });
        const reasoningId = uid(); const thoughtId = uid(); const started = performance.now();
        let reasoningAdded = false; let thoughtAdded = false;
        const allowTools = step < agentMaxSteps;
        const result = await streamCompletion({
          provider: selectedProvider, baseUrl: getBaseUrl(agentProvider, customUrl), apiKey: keys[agentProvider] ?? "", model: selectedModel,
          messages: conversations, system: AGENT_SYSTEM, signal: controller.signal, tools: allowTools ? AGENT_TOOLS : [],
          onDelta: (kind, delta) => {
            if (kind === "reasoning") {
              if (!reasoningAdded) { reasoningAdded = true; pushEvent({ id: reasoningId, type: "reasoning", content: delta }); }
              else setAgentEvents((current) => current.map((event) => event.id === reasoningId && event.type === "reasoning" ? { ...event, content: event.content + delta } : event));
            } else {
              if (!thoughtAdded) { thoughtAdded = true; pushEvent({ id: thoughtId, type: "thought", content: delta }); }
              else setAgentEvents((current) => current.map((event) => event.id === thoughtId && event.type === "thought" ? { ...event, content: event.content + delta } : event));
            }
          },
        });
        if (controller.signal.aborted) break;
        const input = result.usage?.input || estimateTokens(`${AGENT_SYSTEM}\n${textFromMessages(conversations)}${allowTools ? JSON.stringify(AGENT_TOOLS) : ""}`);
        const output = result.usage?.output || estimateTokens(`${result.content}${result.reasoning}${JSON.stringify(result.toolCalls)}`);
        const pricing = estimateCost(agentProvider, selectedModel, input, output);
        addUsage({ id: uid(), providerId: agentProvider, model: selectedModel, input, output, cost: pricing.cost, costKnown: pricing.known, ts: Date.now() });
        totalMissionCost += pricing.known ? pricing.cost : 0; setMissionCost(totalMissionCost);
        if (!result.toolCalls.length || !allowTools) {
          pushEvent({ id: uid(), type: "final", content: result.content || "La réponse finale ne contient pas de texte." });
          break;
        }
        conversations.push({ role: "assistant", content: result.content || "", tool_calls: result.toolCalls });
        for (const call of result.toolCalls) {
          if (controller.signal.aborted) break;
          const toolId = uid(); let parsedArgs: Record<string, any> = {}; let resultText = "";
          let eventStatus: "success" | "error" | "refused" = "success";
          try {
            const parsed = JSON.parse(call.function.arguments || "{}");
            if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("Les arguments doivent être un objet JSON.");
            parsedArgs = parsed;
          } catch (error) { eventStatus = "error"; resultText = `Arguments JSON invalides : ${error instanceof Error ? error.message : String(error)}`; }
          const displayArgs = JSON.stringify(parsedArgs, null, 2);
          pushEvent({ id: toolId, type: "tool", name: call.function.name, arguments: displayArgs, status: resultText ? "error" : "running" });
          if (!resultText && DESTRUCTIVE_TOOLS.has(call.function.name)) {
            const allowed = await new Promise<boolean>((resolve) => {
              confirmResolverRef.current = resolve;
              setPendingConfirmation({ tool: call.function.name, args: parsedArgs, resolve });
              if (controller.signal.aborted) { confirmResolverRef.current = null; setPendingConfirmation(null); resolve(false); }
              else controller.signal.addEventListener("abort", () => {
                confirmResolverRef.current = null; setPendingConfirmation(null); resolve(false);
              }, { once: true });
            });
            confirmResolverRef.current = null; setPendingConfirmation(null);
            if (!allowed) { eventStatus = "refused"; resultText = "Action refusée par l'utilisateur. N'insiste pas et propose une alternative sans modification."; }
          }
          if (!resultText) resultText = await executeTool(call.function.name, parsedArgs, { githubPat, signal: controller.signal });
          if (resultText.startsWith("ERREUR OUTIL")) eventStatus = "error";
          if (controller.signal.aborted && !resultText) resultText = "Action interrompue par l'utilisateur.";
          patchEvent(toolId, { status: eventStatus, result: resultText } as Partial<AgentEvent>);
          conversations.push({ role: "tool", tool_call_id: call.id, name: call.function.name, content: clipForModel(resultText, 6000) });
        }
      }
      if (controller.signal.aborted) pushEvent({ id: uid(), type: "info", content: "Mission arrêtée par l'utilisateur. Les outils déjà terminés ne sont pas annulés." });
    } catch (error) {
      if (controller.signal.aborted || (error instanceof Error && error.name === "AbortError")) pushEvent({ id: uid(), type: "info", content: "Mission arrêtée. La demande réseau a été annulée." });
      else pushEvent({ id: uid(), type: "info", content: getErrorMessage(error) });
    } finally {
      agentAbortRef.current = null; agentBusyRef.current = false; setAgentRunning(false);
      confirmResolverRef.current = null; setPendingConfirmation(null);
    }
  };

  const askConfirmation = (allowed: boolean) => {
    const resolve = confirmResolverRef.current; confirmResolverRef.current = null; setPendingConfirmation(null); resolve?.(allowed);
  };

  const startCouncil = async () => {
    if (councilBusyRef.current || !councilQuestion.trim()) return;
    const id = uid();
    const entries: CouncilEntry[] = councilRows.map((expert) => ({ ...expert, status: "pending", content: "" }));
    const run: CouncilRun = { id, question: councilQuestion.trim(), entries, cost: 0, moderator: { providerId: councilMod.providerId, model: councilMod.model, status: "pending", content: "" } };
    setCouncilRun(run); councilBusyRef.current = true; setCouncilRunning(true);
    const controllers = entries.map(() => new AbortController()); councilAbortRef.current = controllers;
    try {
      const settlements = await Promise.allSettled(entries.map(async (entry, index) => {
        const provider = getProvider(entry.providerId); const controller = controllers[index];
        setCouncilRun((current) => current?.id !== id ? current : { ...current, entries: current.entries.map((item) => item.id === entry.id ? { ...item, status: "running", error: undefined } : item) });
        try {
          const response = await streamCompletion({
            provider, baseUrl: getBaseUrl(entry.providerId, customUrl), apiKey: keys[entry.providerId] ?? "", model: entry.model,
            messages: [{ role: "user", content: run.question }], system: COUNCIL_EXPERT_SYSTEM, signal: controller.signal,
            onDelta: (kind, delta) => {
              if (kind !== "content") return;
              setCouncilRun((current) => current?.id !== id ? current : { ...current, entries: current.entries.map((item) => item.id === entry.id ? { ...item, content: item.content + delta } : item) });
            },
          });
          const input = response.usage?.input || estimateTokens(run.question + COUNCIL_EXPERT_SYSTEM);
          const output = response.usage?.output || estimateTokens(`${response.content}${response.reasoning}`);
          const pricing = estimateCost(entry.providerId, entry.model, input, output);
          const usageRow: UsageRow = { id: uid(), providerId: entry.providerId, model: entry.model, input, output, cost: pricing.cost, costKnown: pricing.known, ts: Date.now() };
          addUsage(usageRow);
          setCouncilRun((current) => current?.id !== id ? current : { ...current, cost: current.cost + (pricing.known ? pricing.cost : 0), entries: current.entries.map((item) => item.id === entry.id ? { ...item, status: "done", content: response.content || item.content || "Réponse vide.", usage: usageRow } : item) });
          return response.content;
        } catch (error) {
          const detail = getErrorMessage(error);
          setCouncilRun((current) => current?.id !== id ? current : { ...current, entries: current.entries.map((item) => item.id === entry.id ? { ...item, status: "error", error: detail } : item) });
          throw error;
        }
      }));
      if (controllers.some((controller) => controller.signal.aborted)) return;
      const successful = settlements.flatMap((settlement, index) => settlement.status === "fulfilled" ? [{ expert: entries[index], content: settlement.value }] : []);
      if (!successful.length) {
        setCouncilRun((current) => current?.id !== id ? current : { ...current, moderator: { ...current.moderator, status: "error", error: "Aucun expert n'a répondu; la synthèse ne peut pas être générée." } });
        return;
      }
      const moderatorProvider = getProvider(councilMod.providerId);
      if (!keys[councilMod.providerId]) {
        setCouncilRun((current) => current?.id !== id ? current : { ...current, moderator: { ...current.moderator, status: "error", error: `Clé API absente pour le modérateur ${moderatorProvider.label}. Les réponses des experts sont conservées.` } });
        return;
      }
      const contributions = successful.map(({ expert, content }, index) => `EXPERT ${index + 1} — ${getProvider(expert.providerId).label} / ${expert.model}\n${content}`).join("\n\n---\n\n");
      const controller = new AbortController(); controllers.push(controller);
      setCouncilRun((current) => current?.id !== id ? current : { ...current, moderator: { ...current.moderator, status: "running", error: undefined } });
      try {
        const response = await streamCompletion({
          provider: moderatorProvider, baseUrl: getBaseUrl(councilMod.providerId, customUrl), apiKey: keys[councilMod.providerId], model: councilMod.model,
          messages: [{ role: "user", content: `QUESTION DU CONSEIL\n${run.question}\n\nCONTRIBUTIONS DES EXPERTS\n${contributions}` }],
          system: COUNCIL_MODERATOR_SYSTEM, signal: controller.signal,
          onDelta: (kind, delta) => {
            if (kind !== "content") return;
            setCouncilRun((current) => current?.id !== id ? current : { ...current, moderator: { ...current.moderator, content: current.moderator.content + delta } });
          },
        });
        const input = response.usage?.input || estimateTokens(run.question + contributions + COUNCIL_MODERATOR_SYSTEM);
        const output = response.usage?.output || estimateTokens(`${response.content}${response.reasoning}`);
        const pricing = estimateCost(councilMod.providerId, councilMod.model, input, output);
        addUsage({ id: uid(), providerId: councilMod.providerId, model: councilMod.model, input, output, cost: pricing.cost, costKnown: pricing.known, ts: Date.now() });
        setCouncilRun((current) => current?.id !== id ? current : { ...current, cost: current.cost + (pricing.known ? pricing.cost : 0), moderator: { ...current.moderator, status: "done", content: response.content || current.moderator.content } });
      } catch (error) {
        setCouncilRun((current) => current?.id !== id ? current : { ...current, moderator: { ...current.moderator, status: "error", error: getErrorMessage(error) } });
      }
    } finally {
      councilAbortRef.current = []; councilBusyRef.current = false; setCouncilRunning(false);
    }
  };

  const saveKey = (id: string) => {
    const value = (keyDrafts[id] ?? "").trim();
    setKeys((current) => ({ ...current, ...(value ? { [id]: value } : {}) }));
    setKeyDrafts((current) => ({ ...current, [id]: value }));
    setKeysStatus((current) => ({ ...current, [id]: { loading: false, message: value ? "Clé enregistrée localement." : "Aucune clé renseignée.", error: !value } }));
  };
  const deleteKey = (id: string) => {
    setKeys((current) => { const next = { ...current }; delete next[id]; return next; });
    setKeyDrafts((current) => { const next = { ...current }; delete next[id]; return next; });
    setKeysStatus((current) => ({ ...current, [id]: { loading: false, message: "Clé supprimée de ce navigateur." } }));
  };
  const loadModels = async (providerIdToLoad: string) => {
    const provider = getProvider(providerIdToLoad);
    if (!keys[providerIdToLoad]) {
      setKeysStatus((current) => ({ ...current, [providerIdToLoad]: { loading: false, message: "Enregistrez une clé avant de tester le provider.", error: true } })); return;
    }
    setKeysStatus((current) => ({ ...current, [providerIdToLoad]: { loading: true, message: "Connexion au provider…" } }));
    const controller = new AbortController();
    try {
      const headers: Record<string, string> = provider.kind === "gemini" ? { "x-goog-api-key": keys[providerIdToLoad] } : { Authorization: `Bearer ${keys[providerIdToLoad]}` };
      if (providerIdToLoad === "openrouter") { headers["HTTP-Referer"] = window.location.origin; headers["X-Title"] = "Nexus AI Hub"; }
      const response = await fetchRetry(`${getBaseUrl(providerIdToLoad, customUrl)}/models`, { headers }, controller.signal);
      let body: any = null; try { body = await response.json(); } catch { body = null; }
      if (!response.ok) throw new Error(errorLabel(response.status, body?.error?.message ?? body?.message ?? `HTTP ${response.status}`));
      const list: any[] = body?.data ?? body?.models ?? [];
      const ids = [...new Set(list.map((item) => String(item.id ?? item.name ?? "").replace(/^models\//, "")).filter(Boolean))].slice(0, 200);
      if (!ids.length) throw new Error("Le endpoint /models n'a renvoyé aucun identifiant exploitable.");
      setExtraModels((current) => ({ ...current, [providerIdToLoad]: ids }));
      setKeysStatus((current) => ({ ...current, [providerIdToLoad]: { loading: false, message: `${ids.length} modèle${ids.length > 1 ? "s" : ""} chargé${ids.length > 1 ? "s" : ""}.` } }));
    } catch (error) { setKeysStatus((current) => ({ ...current, [providerIdToLoad]: { loading: false, message: getErrorMessage(error), error: true } })); }
  };
  const saveCustomUrl = () => {
    try {
      const url = new URL(customUrlDraft.trim());
      if (url.protocol !== "https:") throw new Error("L'endpoint personnalisé doit utiliser HTTPS afin de ne pas exposer la clé API.");
      setCustomUrl(url.toString().replace(/\/+$/, ""));
      setKeysStatus((current) => ({ ...current, custom: { loading: false, message: "Endpoint HTTPS enregistré." } }));
    } catch (error) { setKeysStatus((current) => ({ ...current, custom: { loading: false, message: getErrorMessage(error), error: true } })); }
  };
  const exportVault = async () => {
    setVaultError(""); setVaultNotice("");
    if (vaultPassphrase.length < 8) { setVaultError("La phrase secrète doit contenir au moins 8 caractères."); return; }
    try {
      const data: VaultData = { keys, extraModels, customUrl, githubPat, prompts, system: systemPrompt };
      setExportText(await encryptVault(vaultPassphrase, data)); setVaultNotice("Export chiffré prêt. Copiez le payload et conservez-le dans un endroit sûr.");
    } catch (error) { setVaultError(getErrorMessage(error)); }
  };
  const importVault = async () => {
    setVaultError(""); setVaultNotice("");
    try {
      const data = await decryptVault(vaultPassphrase, importText) as Partial<VaultData>;
      if (!data || typeof data !== "object" || !data.keys || typeof data.keys !== "object") throw new Error("Le contenu déchiffré n'a pas la structure de Vault attendue.");
      const nextKeys = Object.fromEntries(Object.entries(data.keys).filter(([id, key]) => PROVIDERS.some((provider) => provider.id === id) && typeof key === "string"));
      const nextExtras = Object.fromEntries(Object.entries(data.extraModels ?? {}).filter(([id, models]) => PROVIDERS.some((provider) => provider.id === id) && Array.isArray(models)).map(([id, models]) => [id, (models as unknown[]).filter((item): item is string => typeof item === "string").slice(0, 200)]));
      const nextPrompts = Array.isArray(data.prompts) ? data.prompts.filter((prompt) => prompt && typeof prompt.title === "string" && typeof prompt.body === "string").slice(0, 500) : prompts;
      const nextPat = typeof data.githubPat === "string" ? data.githubPat : "";
      const nextUrl = typeof data.customUrl === "string" ? data.customUrl : customUrl;
      const parsedUrl = new URL(nextUrl);
      if (parsedUrl.protocol !== "https:") throw new Error("L'export contient un endpoint personnalisé non HTTPS; import refusé pour protéger les clés.");
      const safeUrl = parsedUrl.toString();
      const nextSystem = typeof data.system === "string" ? data.system : systemPrompt;
      setKeys(nextKeys); setKeyDrafts(nextKeys); setGithubPat(nextPat); setPatDraft(nextPat);
      setExtraModels(nextExtras); setPrompts(nextPrompts); setCustomUrl(safeUrl); setCustomUrlDraft(safeUrl); setSystemPrompt(nextSystem);
      setVaultNotice("Vault déchiffré et restauré localement."); setImportText("");
    } catch (error) { setVaultError(getErrorMessage(error)); }
  };
  const selectActiveProvider = (id: string) => { setProviderId(id); setModel(modelOptions(id, extraModels)[0]?.id ?? ""); };
  const choosePaletteModel = (id: string, selectedModel: string) => { setProviderId(id); setModel(selectedModel); setPaletteOpen(false); setTab("chat"); };
  const addPrompt = () => {
    if (!promptForm.title.trim() || !promptForm.body.trim()) return;
    const next: PromptItem = { id: uid(), title: promptForm.title.trim(), body: promptForm.body.trim(), tag: promptForm.tag.trim() || "Général" };
    setPrompts((current) => [next, ...current]); setPromptForm({ title: "", body: "", tag: "Général" });
  };
  const injectPrompt = (body: string) => {
    setComposer((current) => current.trim() ? `${current.trim()}\n\n${body}` : body);
    setTab("chat"); window.setTimeout(() => composerRef.current?.focus(), 0);
  };
  const persistCouncilRow = (id: string, patch: Partial<CouncilExpert>) => setCouncilRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));

  const exportUsage = () => {
    const blob = new Blob([JSON.stringify(usage, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "nexus-usage.json"; anchor.click(); URL.revokeObjectURL(url);
  };
  const clearConversation = () => {
    if (chatBusyRef.current) stopChat();
    setChat([]); setComposer(""); setComposerImages([]);
  };
  const renderChatMessage = (message: ChatMessage) => {
    if (message.role === "notice") return <div className="chat-notice" key={message.id}>ⓘ {message.content}</div>;
    const isUser = message.role === "user";
    return (
      <article className={`message-row ${isUser ? "user-row" : "assistant-row"}`} key={message.id}>
        {!isUser && <div className="message-avatar assistant-avatar">✳</div>}
        <div className={`message-card ${isUser ? "user-message" : "assistant-message"}`}>
          {!isUser && <div className="message-topline">
            <span className="message-name">Nexus</span>
            {message.providerId && <span className="mini-provider">{getProvider(message.providerId).label} · {message.model}</span>}
            {message.status === "streaming" && <span className="streaming-label"><i /> En direct</span>}
            {message.status === "stopped" && <span className="stopped-label">Interrompu</span>}
          </div>}
          {isUser && <div className="message-name user-message-name">Vous</div>}
          {message.errorNotes?.map((note, index) => <div className="message-error-note" key={`${message.id}-error-${index}`}>{note}</div>)}
          {message.images?.length ? <div className="message-images">{message.images.map((image) => <FileImage image={image} key={image.name + image.dataUrl.slice(0, 32)} />)}</div> : null}
          {message.content ? <Markdown content={message.content} /> : message.status === "streaming" ? <div className="typing-indicator"><i /><i /><i /><span>Connexion au modèle…</span></div> : null}
          {!isUser && message.reasoning && <details className="reasoning-box"><summary><span>🧠</span> Raisonnement natif <em>{message.usage ? `${(message.usage.durationMs / 1000).toFixed(1)} s · ${message.usage.tokensPerSecond?.toFixed(1) ?? "—"} tok/s` : ""}</em></summary><div className="reasoning-content">{message.reasoning}</div></details>}
          {!isUser && message.usage && <div className="usage-line">
            <span>{message.usage.input.toLocaleString("fr-FR")} in · {message.usage.output.toLocaleString("fr-FR")} out</span>
            <span>{message.usage.costKnown ? formatCost(message.usage.cost) : "Tarif non renseigné"}</span>
            <span>{(message.usage.durationMs / 1000).toFixed(1)} s</span>
          </div>}
        </div>
        {isUser && <div className="message-avatar user-avatar">M</div>}
      </article>
    );
  };

  return (
    <div className={`app-shell ${dark ? "theme-dark" : "theme-light"}`}>
      <aside className="sidebar">
        <button className="brand-lockup" onClick={() => setTab("chat")} aria-label="Nexus AI Hub, accueil">
          <span className="brand-mark">N</span>
          <span className="brand-copy"><strong>NEXUS</strong><small>AI HUB</small></span>
          <span className="brand-version">BETA</span>
        </button>
        <div className="sidebar-label">ESPACE DE TRAVAIL</div>
        <nav className="side-nav" aria-label="Navigation principale">
          {NAV.map((item) => <button key={item.id} className={`nav-item ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}>
            <span className="nav-icon">{item.icon}</span><span className="nav-copy"><b>{item.label}</b><small>{item.caption}</small></span>
            {tab === item.id && <span className="nav-active-dot" />}
          </button>)}
        </nav>
        <div className="sidebar-spacer" />
        <section className="session-card">
          <div className="session-card-top"><span className="session-icon">◷</span><span>Session</span><span className="session-live"><i /> LOCAL</span></div>
          <strong>{formatCost(totalCost)}</strong>
          <small>Coût suivi · {usage.length} requête{usage.length === 1 ? "" : "s"}</small>
          <button onClick={() => setTab("costs")}>Voir l'activité <span>↗</span></button>
        </section>
        <div className="sidebar-footer">
          <span className="privacy-pip" /> Secrets stockés localement
          <button className="sidebar-theme" onClick={() => setDark((value) => !value)} title="Changer le thème">{dark ? "☼" : "☾"}</button>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark small">N</span><b>NEXUS</b></div>
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-divider">/</span><strong>{pageTitle.label}</strong></div>
          <div className="topbar-actions">
            <div className={`connection-pill ${keys[providerId] ? "connected" : "disconnected"}`}><i /> {keys[providerId] ? `${currentProvider.label} · clé présente` : "Aucune clé active"}</div>
            <button className="model-pill" onClick={() => { setPaletteOpen(true); setPaletteQuery(""); }} title="Changer de modèle (Ctrl+K)">
              <span className="model-spark">✦</span><span>{currentProvider.label} <b>·</b> {model}</span><kbd>⌘ K</kbd>
            </button>
            <button className="icon-button theme-toggle" onClick={() => setDark((value) => !value)} aria-label="Changer le thème" title="Changer le thème">{dark ? "☼" : "☾"}</button>
          </div>
        </header>
        <nav className="mobile-nav" aria-label="Navigation mobile">
          {NAV.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><span>{item.icon}</span>{item.label}</button>)}
        </nav>

        <main className="main-content" key={tab}>
          {tab === "chat" && <section className="workspace-page chat-page">
            <div className="page-heading chat-heading">
              <div><div className="eyebrow"><span className="eyebrow-line" /> ESPACE DE CONVERSATION</div><h1>Bonjour, <span className="gradient-text">que construisons-nous ?</span></h1><p>Un espace privé pour penser, créer et avancer avec vos modèles.</p></div>
              <button className="button button-ghost" onClick={clearConversation} disabled={!chat.length && !composer}><span>⌫</span> Nouvelle conversation</button>
            </div>
            <div className="chat-toolbar panel-card">
              <div className="toolbar-selection">
                <label><span>Provider</span><SelectProvider value={providerId} onChange={selectActiveProvider} includeAll={false} /></label>
                <label><span>Modèle</span><SelectModel providerId={providerId} value={model} onChange={setModel} extraModels={extraModels} /></label>
              </div>
              <div className="toolbar-right">
                <label className="toggle-row" title="Essayer les autres providers enregistrés en cas d'échec"><span>Fallback auto</span><button type="button" role="switch" aria-checked={fallback} className={`switch ${fallback ? "on" : ""}`} onClick={() => setFallback((value) => !value)}><i /></button></label>
                <button className={`button button-quiet ${systemEditorOpen ? "selected" : ""}`} onClick={() => setSystemEditorOpen((value) => !value)}>⚙ <span>Prompt système</span></button>
              </div>
            </div>
            {systemEditorOpen && <div className="system-editor panel-card"><div><b>Instructions système</b><span>Ce texte est conservé dans le navigateur.</span></div><textarea value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} rows={3} aria-label="Prompt système" /></div>}
            <div className={`chat-surface ${dragging ? "dragging" : ""}`} ref={chatRef}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }}
              onDrop={(event) => { event.preventDefault(); setDragging(false); void attachFiles(event.dataTransfer.files); }}>
              {dragging && <div className="drop-overlay"><span>＋</span><b>Déposez vos images</b><small>Jusqu'à 4 images, envoyées au provider sélectionné</small></div>}
              {chat.length === 0 ? <div className="chat-empty">
                <div className="empty-orbit"><span className="orbit-ring ring-one" /><span className="orbit-ring ring-two" /><span className="empty-core">✦</span><span className="orbit-satellite sat-one">◌</span><span className="orbit-satellite sat-two">✧</span></div>
                <span className="empty-overline">VOTRE ESPACE IA PRIVÉ</span><h2>Une idée en tête ?<br /><span>On est prêt à explorer.</span></h2>
                <p>Connectez une clé depuis le Vault, puis lancez une conversation. Chaque réponse vient directement de votre modèle.</p>
                <div className="suggestion-grid">
                  {["Aide-moi à clarifier une idée", "Résume un texte ou un document", "Explique un concept simplement"].map((suggestion) => <button key={suggestion} onClick={() => { setComposer(suggestion); composerRef.current?.focus(); }}>{suggestion}<span>↗</span></button>)}
                </div>
                {!keys[providerId] && <button className="empty-vault-link" onClick={() => setTab("vault")}>Ajouter une clé API <span>→</span></button>}
              </div> : <div className="message-list">{chat.map(renderChatMessage)}</div>}
            </div>
            <div className={`composer-wrap ${dragging ? "drop-ready" : ""}`}>
              {composerImages.length > 0 && <div className="composer-images">{composerImages.map((image, index) => <FileImage image={image} key={image.name + index} onRemove={() => setComposerImages((current) => current.filter((_, position) => position !== index))} />)}</div>}
              <div className="composer-box">
                <textarea ref={composerRef} value={composer} onChange={(event) => setComposer(event.target.value)} onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void sendChat(); }
                }} placeholder="Écrivez votre message…" rows={2} aria-label="Votre message" disabled={chatStreaming} />
                <div className="composer-footer">
                  <div className="composer-tools">
                    <button className="icon-button attach-button" onClick={() => fileInputRef.current?.click()} title="Joindre des images" aria-label="Joindre des images" disabled={chatStreaming || composerImages.length >= 4}>＋</button>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(event) => { if (event.target.files) void attachFiles(event.target.files); event.currentTarget.value = ""; }} />
                    <span>Images · jusqu'à 4</span><span className="composer-divider" />
                    <span className="privacy-small"><i /> Privé & local</span>
                  </div>
                  <div className="send-actions">
                    {chatStreaming && <button className="button button-stop" onClick={stopChat}>■ Arrêter</button>}
                    <button className="send-button" onClick={() => void sendChat()} disabled={chatStreaming || (!composer.trim() && composerImages.length === 0)} aria-label="Envoyer le message">↑</button>
                  </div>
                </div>
              </div>
              <div className="composer-hint">Entrée pour envoyer <span>·</span> Maj + Entrée pour un saut de ligne <span>·</span> Échap pour arrêter</div>
            </div>
          </section>}

          {tab === "agent" && <section className="workspace-page agent-page">
            <div className="page-heading">
              <div><div className="eyebrow"><span className="eyebrow-line" /> AUTOMATISATION GUIDÉE</div><h1>Agent <span className="heading-symbol">✳</span></h1><p>Décomposez une mission. Nexus réfléchit, utilise des outils réels et vous demande avant toute action sensible.</p></div>
              <div className="agent-cost-chip"><span>COÛT DE MISSION</span><b>{formatCost(missionCost)}</b></div>
            </div>
            <div className="agent-setup panel-card">
              <div className="agent-controls">
                <label><span>Provider de l'agent</span><SelectProvider value={agentProvider} onChange={(id) => { setAgentProvider(id); setAgentModel(modelOptions(id, extraModels)[0]?.id ?? ""); }} includeAll={false} /></label>
                <label className="wide-control"><span>Modèle</span><SelectModel providerId={agentProvider} value={agentModel} onChange={setAgentModel} extraModels={extraModels} /></label>
                <label><span>Budget d'étapes</span><select className="select-control" value={agentMaxSteps} onChange={(event) => setAgentMaxSteps(Number(event.target.value))}><option value={3}>3 étapes</option><option value={6}>6 étapes</option><option value={10}>10 étapes</option></select></label>
                <div className="compat-wrap"><span>Compatibilité outils</span><ToolBadge providerId={agentProvider} model={agentModel} /></div>
              </div>
              <label className="mission-label"><span>Votre mission</span><textarea value={agentMission} onChange={(event) => setAgentMission(event.target.value)} rows={4} placeholder="Ex. Analyse les issues ouvertes de owner/repo et propose une priorisation. Ne crée rien sans me demander." disabled={agentRunning} /></label>
              <div className="agent-form-footer"><div className="agent-trust"><span>🛡️</span> Les commits et créations d'issues requièrent votre approbation.</div>
                {agentRunning ? <button className="button button-stop" onClick={stopAgent}>■ Arrêter la mission</button> : <button className="button button-primary" onClick={() => void startAgent()} disabled={!agentMission.trim()}><span>✳</span> Lancer l'agent <span className="button-arrow">→</span></button>}
              </div>
            </div>
            <div className="timeline-heading"><div><span className="eyebrow">JOURNAL D'EXÉCUTION</span><h2>Timeline de la mission</h2></div>{agentRunning && <span className="running-badge"><i /> En cours</span>}</div>
            {agentEvents.length === 0 ? <div className="panel-card timeline-empty"><div className="timeline-empty-icon">⟡</div><div><b>En attente d'une mission</b><p>La réflexion, les appels d'outils, les résultats et la synthèse apparaîtront ici au fil de l'exécution.</p></div></div> : <div className="agent-timeline">
              {agentEvents.map((event) => {
                if (event.type === "step") return <div className="timeline-step" key={event.id}><span>{event.title}</span></div>;
                if (event.type === "reasoning") return <details className="timeline-reasoning" key={event.id}><summary><span>🧠</span> Raisonnement natif</summary><div>{event.content}</div></details>;
                if (event.type === "thought") return <div className="timeline-thought" key={event.id}><span>💭</span><div><small>RÉFLEXION</small><Markdown content={event.content} /></div></div>;
                if (event.type === "tool") return <div className={`timeline-tool tool-${event.status}`} key={event.id}>
                  <div className="tool-event-head"><span className="tool-event-icon">🔧</span><div><b>{event.name}</b><small>{event.status === "running" ? "Exécution réelle en cours…" : event.status === "success" ? "Résultat reçu" : event.status === "refused" ? "Refusé par l'utilisateur" : "Erreur"}</small></div><span className="tool-status-icon">{event.status === "running" ? "◌" : event.status === "success" ? "✓" : event.status === "refused" ? "⊘" : "!"}</span></div>
                  <details className="tool-details"><summary>Arguments et résultat</summary><strong>Arguments</strong><pre>{event.arguments}</pre>{event.result && <><strong>Observation</strong><pre>{clipForDisplay(event.result, 4000)}</pre></>}</details>
                </div>;
                if (event.type === "final") return <div className="timeline-final" key={event.id}><div className="final-label"><span>✓</span> SYNTHÈSE FINALE</div><Markdown content={event.content} /></div>;
                return <div className="timeline-info" key={event.id}>ⓘ {event.content}</div>;
              })}
            </div>}
          </section>}

          {tab === "council" && <section className="workspace-page council-page">
            <div className="page-heading">
              <div><div className="eyebrow"><span className="eyebrow-line" /> INTELLIGENCE COLLECTIVE</div><h1>AI <span className="gradient-text">Council</span></h1><p>Faites répondre plusieurs modèles en parallèle, puis demandez à un modérateur de synthétiser les points de vue.</p></div>
              {councilRun && <div className="agent-cost-chip"><span>COÛT DU DÉBAT</span><b>{formatCost(councilRun.cost)}</b></div>}
            </div>
            <div className="council-config panel-card">
              <div className="section-title-row"><div><span className="eyebrow">LES INTERVENANTS</span><h2>Experts & modérateur</h2></div><span className="muted-caption">2 à 4 experts · streaming en parallèle</span></div>
              <div className="expert-config-grid">
                {councilRows.map((row, index) => <div className="expert-config-card" key={row.id}>
                  <div className="expert-number">0{index + 1}</div><div className="expert-fields">
                    <label><span>Expert {index + 1}</span><SelectProvider value={row.providerId} onChange={(id) => persistCouncilRow(row.id, { providerId: id, model: modelOptions(id, extraModels)[0]?.id ?? "" })} includeAll={false} /></label>
                    <label><span>Modèle</span><SelectModel providerId={row.providerId} value={row.model} onChange={(nextModel) => persistCouncilRow(row.id, { model: nextModel })} extraModels={extraModels} /></label>
                  </div>
                  {councilRows.length > 2 && <button className="icon-button remove-expert" onClick={() => setCouncilRows((current) => current.filter((item) => item.id !== row.id))} aria-label={`Retirer l'expert ${index + 1}`}>×</button>}
                </div>)}
                {councilRows.length < 4 && <button className="add-expert-card" onClick={() => setCouncilRows((current) => [...current, { id: uid(), providerId: "openai", model: modelOptions("openai", extraModels)[0]?.id ?? "" }])}><span>＋</span><b>Ajouter un expert</b><small>Jusqu'à 4 participants</small></button>}
              </div>
              <div className="moderator-config"><span className="moderator-avatar">⌘</span><div className="moderator-label"><b>Modérateur</b><small>Analyse consensus & divergences</small></div>
                <SelectProvider value={councilMod.providerId} onChange={(id) => setCouncilMod({ providerId: id, model: modelOptions(id, extraModels)[0]?.id ?? "" })} includeAll={false} />
                <SelectModel providerId={councilMod.providerId} value={councilMod.model} onChange={(nextModel) => setCouncilMod((current) => ({ ...current, model: nextModel }))} extraModels={extraModels} />
              </div>
            </div>
            <div className="council-question panel-card">
              <label><span className="eyebrow">QUESTION À DÉBATTRE</span><textarea value={councilQuestion} onChange={(event) => setCouncilQuestion(event.target.value)} rows={3} placeholder="Posez une question qui mérite plusieurs perspectives…" disabled={councilRunning} /></label>
              <div className="council-question-footer"><span><i /> Les experts répondent réellement depuis leurs APIs respectives.</span>{councilRunning ? <button className="button button-stop" onClick={stopCouncil}>■ Arrêter le débat</button> : <button className="button button-primary" onClick={() => void startCouncil()} disabled={!councilQuestion.trim()}>Lancer le débat <span>→</span></button>}</div>
            </div>
            {councilRun && <div className="council-results">
              <div className="section-title-row council-results-title"><div><span className="eyebrow">CONTRIBUTIONS</span><h2>Le débat en direct</h2></div><span className="muted-caption">{councilRun.entries.filter((entry) => entry.status === "done").length}/{councilRun.entries.length} réponses</span></div>
              <div className="expert-result-grid" style={{ gridTemplateColumns: `repeat(${Math.min(councilRun.entries.length, 3)}, minmax(0, 1fr))` }}>
                {councilRun.entries.map((entry, index) => <article className="expert-result-card panel-card" key={entry.id}>
                  <div className="result-card-head"><span className="expert-number">0{index + 1}</span><div><b>{getProvider(entry.providerId).label}</b><small>{entry.model}</small></div><span className={`result-status ${entry.status}`}>{entry.status === "done" ? "✓" : entry.status === "running" ? <i /> : entry.status === "error" ? "!" : "·"}</span></div>
                  {entry.error ? <div className="council-error">{entry.error}</div> : entry.content ? <Markdown content={entry.content} /> : <div className="council-pending">{entry.status === "running" ? "Réponse en cours…" : "En attente"}</div>}
                </article>)}
              </div>
              <article className="moderator-result panel-card"><div className="moderator-result-head"><span className="moderator-avatar">⌘</span><div><b>Synthèse du modérateur</b><small>{getProvider(councilRun.moderator.providerId).label} · {councilRun.moderator.model}</small></div><span className={`result-status ${councilRun.moderator.status}`}>{councilRun.moderator.status === "done" ? "✓" : councilRun.moderator.status === "running" ? <i /> : councilRun.moderator.status === "error" ? "!" : "·"}</span></div>
                {councilRun.moderator.error ? <div className="council-error">{councilRun.moderator.error}</div> : councilRun.moderator.content ? <Markdown content={councilRun.moderator.content} /> : <div className="council-pending">{councilRun.moderator.status === "running" ? "Le modérateur confronte les réponses…" : "La synthèse commencera après les réponses des experts."}</div>}
              </article>
            </div>}
          </section>}

          {tab === "vault" && <section className="workspace-page vault-page">
            <div className="page-heading">
              <div><div className="eyebrow"><span className="eyebrow-line" /> GESTION LOCALE DES IDENTIFIANTS</div><h1>Votre <span className="gradient-text">Vault</span></h1><p>Les clés restent dans le stockage de ce navigateur. Elles ne sont envoyées qu'au provider choisi.</p></div>
              <div className="vault-privacy-badge"><span>▣</span> LOCAL-FIRST <small>Vos secrets ne passent pas par Nexus.</small></div>
            </div>
            <div className="security-callout"><span>🔒</span><div><b>Stockage local non chiffré dans ce prototype</b><p>Le localStorage est accessible à toute personne utilisant ce profil navigateur. Utilisez l'export AES-GCM ci-dessous pour une sauvegarde chiffrée; ne partagez jamais votre appareil avec des secrets déverrouillés.</p></div></div>
            <div className="vault-section-heading"><div><span className="eyebrow">01 / PROVIDERS</span><h2>Clés API</h2></div><span className="muted-caption">{Object.values(keys).filter(Boolean).length} configuré{Object.values(keys).filter(Boolean).length === 1 ? "" : "s"}</span></div>
            <div className="provider-vault-grid">
              {PROVIDERS.map((provider) => {
                const status = keysStatus[provider.id];
                const selected = providerId === provider.id;
                return <article className={`provider-card panel-card ${selected ? "provider-selected" : ""}`} key={provider.id}>
                  <div className="provider-card-head"><div className="provider-monogram">{provider.label.slice(0, 1)}</div><div className="provider-title"><b>{provider.label}</b><small>{provider.description}</small></div><span className={`key-state ${keys[provider.id] ? "ready" : "missing"}`}><i />{keys[provider.id] ? "Prêt" : "Clé absente"}</span></div>
                  {provider.id === "custom" && <div className="custom-url-field"><label>URL de base HTTPS</label><div className="custom-url-row"><input value={customUrlDraft} onChange={(event) => setCustomUrlDraft(event.target.value)} placeholder="https://api.example.com/v1" aria-label="URL du provider personnalisé" /><button className="button button-quiet" onClick={saveCustomUrl}>Appliquer</button></div></div>}
                  <label className="secret-input-label"><span>Clé API</span><input type="password" autoComplete="new-password" value={keyDrafts[provider.id] ?? ""} onChange={(event) => setKeyDrafts((current) => ({ ...current, [provider.id]: event.target.value }))} placeholder={keys[provider.id] ? "Clé enregistrée · saisir pour remplacer" : "Collez votre clé ici"} aria-label={`Clé API ${provider.label}`} /></label>
                  <div className="provider-card-actions"><button className="button button-primary button-small" onClick={() => saveKey(provider.id)}>Enregistrer</button><button className="button button-quiet button-small" onClick={() => void loadModels(provider.id)} disabled={status?.loading}>{status?.loading ? "Connexion…" : "Tester / modèles"}</button>{keys[provider.id] && <button className="button button-danger-quiet button-small" onClick={() => deleteKey(provider.id)}>Supprimer</button>}</div>
                  {status?.message && <div className={`provider-status ${status.error ? "error" : ""}`}>{status.error ? "⚠ " : "✓ "}{status.message}</div>}
                  <div className="provider-card-foot"><button className={`text-button ${selected ? "is-selected" : ""}`} onClick={() => selectActiveProvider(provider.id)}>{selected ? "✓ Provider actif" : "Utiliser dans le Chat →"}</button>{provider.keyUrl && <a href={provider.keyUrl} target="_blank" rel="noreferrer">Obtenir une clé ↗</a>}</div>
                </article>;
              })}
            </div>
            <div className="vault-section-heading github-heading"><div><span className="eyebrow">02 / OUTILS AGENT</span><h2>Accès GitHub</h2></div></div>
            <article className="github-vault-card panel-card"><div className="github-icon">⌘</div><div className="github-vault-content"><div className="github-vault-title"><div><b>Personal Access Token</b><small>{githubPat ? "PAT enregistré localement" : "Aucun PAT configuré"}</small></div><span className={`key-state ${githubPat ? "ready" : "missing"}`}><i />{githubPat ? "Connecté" : "Optionnel"}</span></div>
                <p>Utilisé uniquement par les outils GitHub de l'Agent, directement vers <code>api.github.com</code>. Fine-grained PAT recommandé : <b>Contents: Read-only</b> pour consulter, <b>Contents: Read & Write</b> pour committer, et <b>Issues: Read/Write</b> selon vos outils.</p>
                <div className="github-pat-row"><input type="password" autoComplete="new-password" value={patDraft} onChange={(event) => setPatDraft(event.target.value)} placeholder={githubPat ? "PAT enregistré · saisir pour remplacer" : "github_pat_…"} aria-label="Personal Access Token GitHub" /><button className="button button-primary button-small" onClick={() => { setGithubPat(patDraft.trim()); setPatDraft(patDraft.trim()); }}>Enregistrer le PAT</button>{githubPat && <button className="button button-danger-quiet button-small" onClick={() => { setGithubPat(""); setPatDraft(""); }}>Supprimer</button>}</div>
                <div className="github-vault-note"><span>ⓘ</span> Le PAT peut créer ou modifier des fichiers/issues seulement après votre confirmation dans l'Agent.</div>
              </div></article>
            <div className="vault-section-heading export-heading"><div><span className="eyebrow">03 / SAUVEGARDE</span><h2>Export chiffré</h2></div></div>
            <div className="vault-crypto-grid">
              <article className="crypto-card panel-card"><div className="crypto-card-title"><span>⤓</span><div><b>Exporter votre Vault</b><small>AES-GCM 256 · PBKDF2 / SHA-256 · 250 000 itérations</small></div></div>
                <label className="secret-input-label"><span>Phrase secrète (8 caractères minimum)</span><input type="password" value={vaultPassphrase} onChange={(event) => setVaultPassphrase(event.target.value)} placeholder="Phrase secrète forte" /></label>
                <button className="button button-primary" onClick={() => void exportVault()}>Chiffrer et préparer l'export <span>→</span></button>
                {exportText && <textarea className="payload-area" value={exportText} readOnly rows={7} aria-label="Payload d'export chiffré" />}
              </article>
              <article className="crypto-card panel-card"><div className="crypto-card-title"><span>⤒</span><div><b>Importer un Vault</b><small>Les données actuelles concernées seront remplacées.</small></div></div>
                <label className="secret-input-label"><span>Même phrase secrète</span><input type="password" value={vaultPassphrase} onChange={(event) => setVaultPassphrase(event.target.value)} placeholder="Phrase secrète de l'export" /></label>
                <textarea className="payload-area import-area" value={importText} onChange={(event) => setImportText(event.target.value)} rows={4} placeholder="Collez ici le payload nexus-vault…" aria-label="Payload à importer" />
                <button className="button button-secondary" onClick={() => void importVault()} disabled={!importText.trim()}>Déchiffrer et restaurer <span>→</span></button>
              </article>
            </div>
            {vaultError && <div className="vault-feedback error">⚠ {vaultError}</div>}{vaultNotice && <div className="vault-feedback success">✓ {vaultNotice}</div>}
          </section>}

          {tab === "costs" && <section className="workspace-page costs-page">
            <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> OBSERVABILITÉ PERSONNELLE</div><h1>Coûts & <span className="gradient-text">usage</span></h1><p>Suivez les tokens consommés par modèle. Les tarifs inconnus restent explicitement non estimés.</p></div>
              <div className="cost-page-actions"><button className="button button-quiet" onClick={exportUsage} disabled={!usage.length}>↓ Exporter JSON</button><button className="button button-danger-quiet" onClick={() => { setUsage([]); writeLocal("usage", []); }}>Réinitialiser</button></div></div>
            <div className="metrics-grid"><div className="metric-card panel-card"><span>COÛT ESTIMÉ</span><strong>{formatCost(totalCost)}</strong><small>Tarifs publics configurés · USD</small><span className="metric-orb">$</span></div><div className="metric-card panel-card"><span>REQUÊTES</span><strong>{usage.length.toLocaleString("fr-FR")}</strong><small>Chat, Agent & Council</small><span className="metric-orb purple">↗</span></div><div className="metric-card panel-card"><span>TOKENS ENTRANTS</span><strong>{usage.reduce((sum, row) => sum + row.input, 0).toLocaleString("fr-FR")}</strong><small>Fournis aux modèles</small><span className="metric-orb blue">↓</span></div><div className="metric-card panel-card"><span>TOKENS SORTANTS</span><strong>{usage.reduce((sum, row) => sum + row.output, 0).toLocaleString("fr-FR")}</strong><small>Générés par les modèles</small><span className="metric-orb green">↑</span></div></div>
            <div className="analytics-grid">
              <article className="panel-card chart-card"><div className="section-title-row"><div><span className="eyebrow">RÉPARTITION</span><h2>Coût par provider</h2></div><span className="chart-legend"><i /> USD estimés</span></div>
                {usageByProvider.length ? <React.Suspense fallback={<div className="chart-empty"><span>▥</span><small>Chargement du graphique…</small></div>}><UsageChart data={usageByProvider} /></React.Suspense> : <div className="chart-empty"><span>▥</span><b>Pas encore de données d'usage</b><small>Les lignes apparaissent après une réponse réelle d'un modèle.</small></div>}
              </article>
              <article className="panel-card provider-usage-card"><div className="section-title-row"><div><span className="eyebrow">ACTIVITÉ</span><h2>Providers utilisés</h2></div></div>
                {usageByProvider.length ? usageByProvider.map((item) => <div className="provider-usage-row" key={item.provider}><span className="provider-usage-dot" /><b>{item.provider}</b><span>{item.count} req.</span><strong>{item.costKnown ? formatCost(item.cost) : "—"}</strong></div>) : <div className="small-empty">Votre activité réelle s'affichera ici.</div>}
                <div className="chart-disclaimer">Les coûts sont calculés à partir des tarifs inscrits au catalogue Nexus. Les tarifs inconnus ne sont pas estimés.</div>
              </article>
            </div>
            <article className="panel-card usage-table-card"><div className="section-title-row"><div><span className="eyebrow">JOURNAL LOCAL</span><h2>Historique des requêtes</h2></div><span className="muted-caption">{usage.length} ligne{usage.length === 1 ? "" : "s"}</span></div>
              {usage.length ? <div className="table-scroll"><table><thead><tr><th>DATE</th><th>PROVIDER / MODÈLE</th><th>ENTRÉE</th><th>SORTIE</th><th>COÛT ESTIMÉ</th></tr></thead><tbody>{usage.slice(0, 200).map((row) => <tr key={row.id}><td>{new Date(row.ts).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</td><td><b>{getProvider(row.providerId).label}</b><small>{row.model}</small></td><td>{row.input.toLocaleString("fr-FR")}</td><td>{row.output.toLocaleString("fr-FR")}</td><td>{row.costKnown === false ? <span className="muted-caption">Non tarifé</span> : formatCost(row.cost)}</td></tr>)}</tbody></table></div> : <div className="table-empty"><span>◷</span><b>Aucune requête enregistrée</b><small>Ajoutez une clé API puis envoyez un premier message.</small></div>}
            </article>
          </section>}

          {tab === "prompts" && <section className="workspace-page prompts-page">
            <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> VOTRE BIBLIOTHÈQUE LOCALE</div><h1>Prompt <span className="gradient-text">Library</span></h1><p>Conservez vos instructions utiles et réinjectez-les dans le Chat en un clic.</p></div><div className="prompt-count"><strong>{prompts.length.toString().padStart(2, "0")}</strong><span>PROMPTS</span></div></div>
            <div className="prompt-library-layout">
              <form className="prompt-create-card panel-card" onSubmit={(event) => { event.preventDefault(); addPrompt(); }}><div className="create-card-icon">＋</div><span className="eyebrow">NOUVEAU PROMPT</span><h2>Capturez une bonne idée.</h2><p>Vos prompts ne quittent pas ce navigateur.</p>
                <label><span>Titre</span><input value={promptForm.title} onChange={(event) => setPromptForm((current) => ({ ...current, title: event.target.value }))} placeholder="Ex. Brief de lancement" /></label>
                <label><span>Tag</span><input value={promptForm.tag} onChange={(event) => setPromptForm((current) => ({ ...current, tag: event.target.value }))} placeholder="Marketing, Code…" /></label>
                <label><span>Contenu du prompt</span><textarea value={promptForm.body} onChange={(event) => setPromptForm((current) => ({ ...current, body: event.target.value }))} rows={7} placeholder="Rédigez une instruction réutilisable…" /></label>
                <button className="button button-primary" type="submit" disabled={!promptForm.title.trim() || !promptForm.body.trim()}>Enregistrer dans la bibliothèque <span>→</span></button>
              </form>
              <div className="prompt-library-list"><div className="section-title-row"><div><span className="eyebrow">VOTRE COLLECTION</span><h2>Prompts enregistrés</h2></div></div>
                {prompts.length ? <div className="prompt-cards">{prompts.map((prompt) => <article className="prompt-card panel-card" key={prompt.id}><div className="prompt-card-top"><span className="prompt-tag">{prompt.tag || "Général"}</span><button className="icon-button delete-prompt" aria-label={`Supprimer ${prompt.title}`} onClick={() => setPrompts((current) => current.filter((item) => item.id !== prompt.id))}>×</button></div><h3>{prompt.title}</h3><p>{prompt.body}</p><div className="prompt-card-footer"><span>{prompt.body.length.toLocaleString("fr-FR")} caractères</span><button className="text-button" onClick={() => injectPrompt(prompt.body)}>Insérer dans le Chat <span>↗</span></button></div></article>)}</div> : <div className="panel-card prompt-empty"><span>▤</span><b>Votre bibliothèque commence ici</b><p>Créez votre premier prompt. Il sera disponible hors connexion et pourra être ajouté au Chat sans effacer le texte déjà saisi.</p></div>}
              </div>
            </div>
          </section>}
        </main>
      </div>

      {paletteOpen && <div className="modal-backdrop palette-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setPaletteOpen(false); }}>
        <section className="palette-modal" role="dialog" aria-modal="true" aria-label="Changer de modèle"><div className="palette-search"><span>⌕</span><input autoFocus value={paletteQuery} onChange={(event) => setPaletteQuery(event.target.value)} placeholder="Rechercher un provider ou un modèle…" onKeyDown={(event) => { if (event.key === "Escape") setPaletteOpen(false); }} /><kbd>ESC</kbd></div>
          <div className="palette-results">{paletteItems.length ? paletteItems.map(({ provider, model: modelId }) => <button className={`palette-item ${provider.id === providerId && modelId === model ? "current" : ""}`} key={`${provider.id}:${modelId}`} onClick={() => choosePaletteModel(provider.id, modelId)}><span className="provider-monogram palette-monogram">{provider.label.slice(0, 1)}</span><span className="palette-model-copy"><b>{provider.label}</b><small>{modelId}</small></span><span className={`palette-key-state ${keys[provider.id] ? "ready" : "missing"}`}>{keys[provider.id] ? "● prêt" : "○ clé absente"}</span><span className="palette-arrow">↵</span></button>) : <div className="palette-no-results">Aucun provider ou modèle trouvé.</div>}</div>
          <div className="palette-footer"><span>↑↓ Parcourir</span><span>↵ Sélectionner</span><span>ESC Fermer</span></div>
        </section>
      </div>}

      {pendingConfirmation && <div className="modal-backdrop confirmation-backdrop"><section className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><div className="confirm-shield">🛡️</div><span className="eyebrow danger-eyebrow">APPROBATION REQUISE</span><h2 id="confirm-title">Autoriser cette action GitHub ?</h2><p>L'agent demande une opération qui modifie votre dépôt. Rien ne sera envoyé avant votre décision.</p><div className="confirmation-action-name"><span>OUTIL</span><b>{pendingConfirmation.tool}</b></div><div className="confirmation-args"><span>ARGUMENTS TRANSMIS</span><pre>{JSON.stringify(pendingConfirmation.args, null, 2)}</pre></div><div className="confirmation-buttons"><button className="button button-quiet" onClick={() => askConfirmation(false)}>Refuser</button><button className="button button-danger" onClick={() => askConfirmation(true)}>Autoriser l'action <span>→</span></button></div><small className="confirm-footnote">Le PAT reste local et sera utilisé uniquement vers api.github.com.</small></section></div>}
    </div>
  );
}

export default App;
