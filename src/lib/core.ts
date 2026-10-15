export type ProviderKind = "openai" | "gemini";

export type ModelInfo = {
  id: string;
  inputRate?: number;
  outputRate?: number;
  note?: string;
};

export type Provider = {
  id: string;
  label: string;
  kind: ProviderKind;
  baseUrl: string;
  models: ModelInfo[];
  keyUrl: string;
  description: string;
};

export const PROVIDERS: Provider[] = [
  {
    id: "openai",
    label: "OpenAI",
    kind: "openai",
    baseUrl: "https://api.openai.com/v1",
    models: [
      { id: "gpt-4o-mini", note: "Rapide · vision" },
      { id: "gpt-4o", inputRate: 2.5, outputRate: 10, note: "Vision · multimodal" },
      { id: "o3-mini", inputRate: 1.1, outputRate: 4.4, note: "Raisonnement" },
    ],
    keyUrl: "https://platform.openai.com/api-keys",
    description: "GPT-4o, o3 et modèles OpenAI",
  },
  {
    id: "groq",
    label: "Groq",
    kind: "openai",
    baseUrl: "https://api.groq.com/openai/v1",
    models: [
      { id: "llama-3.3-70b-versatile", inputRate: 0.59, outputRate: 0.79, note: "Rapide · recommandé" },
      { id: "llama-3.1-8b-instant", note: "Très rapide" },
      { id: "deepseek-r1-distill-llama-70b", note: "Raisonnement · tool calling limité" },
    ],
    keyUrl: "https://console.groq.com/keys",
    description: "Inférence rapide, Llama et autres modèles",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    kind: "openai",
    baseUrl: "https://api.deepseek.com/v1",
    models: [
      { id: "deepseek-chat", inputRate: 0.27, outputRate: 1.1, note: "Généraliste · outils" },
      { id: "deepseek-reasoner", inputRate: 0.55, outputRate: 2.19, note: "Raisonnement" },
    ],
    keyUrl: "https://platform.deepseek.com/api_keys",
    description: "Chat et raisonnement DeepSeek",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    kind: "openai",
    baseUrl: "https://openrouter.ai/api/v1",
    models: [{ id: "openrouter/auto", note: "Auto-router" }, { id: "openai/gpt-4o-mini" }],
    keyUrl: "https://openrouter.ai/keys",
    description: "Un accès à de nombreux modèles",
  },
  {
    id: "mistral",
    label: "Mistral AI",
    kind: "openai",
    baseUrl: "https://api.mistral.ai/v1",
    models: [
      { id: "mistral-small-latest", note: "Rapide" },
      { id: "mistral-large-latest", note: "Modèle avancé" },
      { id: "codestral-latest", note: "Code · outils non garantis" },
    ],
    keyUrl: "https://console.mistral.ai/api-keys",
    description: "Modèles Mistral et Codestral",
  },
  {
    id: "google",
    label: "Google Gemini",
    kind: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    models: [
      { id: "gemini-2.0-flash", note: "Rapide · multimodal" },
      { id: "gemini-2.5-flash", note: "Thinking · multimodal" },
      { id: "gemini-1.5-pro", note: "Contexte étendu" },
    ],
    keyUrl: "https://aistudio.google.com/app/apikey",
    description: "Gemini, multimodal et raisonnement",
  },
  {
    id: "kilo",
    label: "Kilo Gateway",
    kind: "openai",
    baseUrl: "https://api.kilo.ai/api/gateway",
    models: [],
    keyUrl: "https://app.kilo.ai",
    description: "Gateway OpenAI-compatible · charger les modèles",
  },
  {
    id: "llm7",
    label: "LLM7",
    kind: "openai",
    baseUrl: "https://api.llm7.io/v1",
    models: [],
    keyUrl: "https://token.llm7.io",
    description: "Provider OpenAI-compatible · charger les modèles",
  },
  {
    id: "airforce",
    label: "Airforce",
    kind: "openai",
    baseUrl: "https://api.airforce/v1",
    models: [],
    keyUrl: "https://airforce",
    description: "Provider OpenAI-compatible · charger les modèles",
  },
  {
    id: "custom",
    label: "Personnalisé",
    kind: "openai",
    baseUrl: "https://api.exemple.com/v1",
    models: [{ id: "gpt-4o-mini" }],
    keyUrl: "",
    description: "Endpoint compatible OpenAI configurable",
  },
];

export const DEFAULT_SYSTEM_PROMPT =
  "Tu es un assistant utile, précis et honnête. Réponds dans la langue de l'utilisateur. Si tu ne sais pas, dis-le clairement.";

export type ChatImage = { name: string; dataUrl: string; mimeType: string };
export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "notice";
  content: string;
  images?: ChatImage[];
  reasoning?: string;
  providerId?: string;
  model?: string;
  usage?: { input: number; output: number; cost: number; costKnown: boolean; durationMs: number; tokensPerSecond?: number };
  status?: "streaming" | "stopped";
  errorNotes?: string[];
};
export type UsageRow = {
  id: string;
  providerId: string;
  model: string;
  input: number;
  output: number;
  cost: number;
  costKnown?: boolean;
  ts: number;
};
export type PromptItem = { id: string; title: string; body: string; tag: string };
export type CouncilExpert = { id: string; providerId: string; model: string };

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ProviderMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> | null;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
};

export type StreamResult = {
  content: string;
  reasoning: string;
  toolCalls: ToolCall[];
  usage?: { input: number; output: number };
};

export class ProviderRequestError extends Error {
  status: number;
  providerId: string;
  constructor(providerId: string, status: number, message: string) {
    super(message);
    this.name = "ProviderRequestError";
    this.providerId = providerId;
    this.status = status;
  }
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export function readLocal<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(`nexus.${key}`);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(`nexus.${key}`, JSON.stringify(value));
  } catch {
    // Quota or private-mode errors do not prevent the current session from working.
  }
}

export function getProvider(providerId: string): Provider {
  return PROVIDERS.find((provider) => provider.id === providerId) ?? PROVIDERS[0];
}

export function getBaseUrl(providerId: string, customUrl: string): string {
  if (providerId === "custom") {
    const url = new URL(customUrl.trim());
    if (url.protocol !== "https:") throw new Error("L'endpoint personnalisé doit utiliser HTTPS pour protéger la clé API.");
    return url.toString().replace(/\/+$/, "");
  }
  return getProvider(providerId).baseUrl.replace(/\/+$/, "");
}

export function modelOptions(providerId: string, extraModels: Record<string, string[]>): ModelInfo[] {
  const known = getProvider(providerId).models;
  const extra = extraModels[providerId] ?? [];
  const existing = new Set(known.map((model) => model.id));
  return [...known, ...extra.filter((id) => !existing.has(id)).map((id) => ({ id }))];
}

export function estimateTokens(value: unknown): number {
  let text: string;
  try {
    text = typeof value === "string" ? value : JSON.stringify(value) ?? "";
  } catch {
    text = String(value);
  }
  return Math.max(1, Math.ceil(text.length / 4));
}

export function estimateCost(providerId: string, modelId: string, input: number, output: number): { cost: number; known: boolean } {
  const model = modelOptions(providerId, {})
    .find((candidate) => candidate.id === modelId) ?? getProvider(providerId).models.find((candidate) => candidate.id === modelId);
  if (model?.inputRate === undefined || model.outputRate === undefined) return { cost: 0, known: false };
  return { cost: (input * model.inputRate + output * model.outputRate) / 1_000_000, known: true };
}

export function formatCost(cost: number): string {
  if (cost >= 1) return `$${cost.toFixed(2)}`;
  if (cost >= 0.01) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(5)}`;
}

export function errorLabel(status: number, message: string): string {
  const labels: Record<number, string> = {
    401: "🔑 Clé API invalide ou expirée — vérifiez le Vault",
    402: "💳 Crédits insuffisants chez ce provider",
    403: "🚫 Accès refusé pour ce modèle ou cette clé",
    404: "🔍 Modèle introuvable — vérifiez son identifiant",
    408: "⏱ Délai dépassé, réessayez",
    422: "📄 Requête refusée par le provider",
    429: "🚦 Quota ou rate limit atteint — patientez ou changez de provider",
  };
  if (labels[status]) return `${labels[status]} (${message})`;
  if (status >= 500) return `⚠️ Erreur côté provider (${status}) — ${message}`;
  return message;
}

export function supportsTools(providerId: string, model: string): "yes" | "no" | "unknown" {
  const rules: Record<string, { yes: string[]; no: string[] }> = {
    openai: { yes: ["gpt-4o", "gpt-4.1", "gpt-4-turbo", "o3", "o4"], no: [] },
    groq: { yes: ["llama-3.3", "llama-3.1", "qwen3", "kimi", "gpt-oss"], no: ["deepseek-r1", "distill"] },
    deepseek: { yes: ["deepseek-chat"], no: ["deepseek-reasoner", "deepseek-r1"] },
    mistral: { yes: ["mistral-large", "mistral-small", "mistral-medium", "ministral"], no: ["codestral"] },
    google: { yes: ["gemini-1.5", "gemini-2.0", "gemini-2.5"], no: ["gemma"] },
  };
  const rule = rules[providerId];
  if (!rule) return "unknown";
  if (rule.yes.some((prefix) => model.startsWith(prefix))) return "yes";
  if (rule.no.some((prefix) => model.startsWith(prefix))) return "no";
  return "unknown";
}

export function translateHttpError(status: number, body: unknown): string {
  let message = `Erreur HTTP ${status}`;
  if (body && typeof body === "object") {
    const record = body as { error?: { message?: string } | string; message?: string };
    if (typeof record.error === "string") message = record.error;
    else if (record.error?.message) message = record.error.message;
    else if (record.message) message = record.message;
  }
  return errorLabel(status, message);
}

function abortableSleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    const abort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", abort, { once: true });
  });
}

export async function fetchRetry(
  url: string,
  init: RequestInit,
  signal: AbortSignal,
  tries = 3,
): Promise<Response> {
  let lastError: unknown;
  const retryable = new Set([408, 429, 500, 502, 503, 504]);
  for (let attempt = 1; attempt <= tries; attempt += 1) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    try {
      const response = await fetch(url, { ...init, signal });
      if (!retryable.has(response.status) || attempt === tries) return response;
      try {
        await response.body?.cancel();
      } catch {
        // The response is discarded before retry.
      }
      await abortableSleep(900 * attempt + Math.random() * 400, signal);
    } catch (error) {
      if (signal.aborted || (error instanceof DOMException && error.name === "AbortError")) throw error;
      lastError = error;
      if (attempt === tries) throw error;
      await abortableSleep(900 * attempt + Math.random() * 400, signal);
    }
  }
  throw lastError ?? new Error("Échec réseau");
}

export async function checkedJson(response: Response, providerId: string): Promise<any> {
  let body: any = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok) {
    let detail = `Erreur HTTP ${response.status}`;
    if (body?.error?.message) detail = body.error.message;
    else if (typeof body?.error === "string") detail = body.error;
    else if (body?.message) detail = body.message;
    throw new ProviderRequestError(providerId, response.status, errorLabel(response.status, detail));
  }
  return body;
}

function openAIMessages(messages: ProviderMessage[], system: string): any[] {
  const all: ProviderMessage[] = system ? [{ role: "system", content: system }, ...messages] : messages;
  return all.map((message) => {
    if (Array.isArray(message.content) && message.role === "user") {
      return {
        role: message.role,
        content: message.content.map((part) =>
          part.type === "text"
            ? { type: "text", text: part.text }
            : { type: "image_url", image_url: { url: part.image_url.url } },
        ),
      };
    }
    if (message.role === "assistant") {
      return {
        role: "assistant",
        content: message.content ?? "",
        ...(message.tool_calls?.length ? { tool_calls: message.tool_calls } : {}),
      };
    }
    if (message.role === "tool") {
      return { role: "tool", tool_call_id: message.tool_call_id, name: message.name, content: message.content ?? "" };
    }
    return { role: message.role, content: message.content ?? "" };
  });
}

function geminiContents(messages: ProviderMessage[]): any[] {
  const contents: any[] = [];
  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index];
    if (message.role === "system") continue;
    if (message.role === "tool") {
      const parts: any[] = [];
      while (index < messages.length && messages[index].role === "tool") {
        const toolMessage = messages[index];
        parts.push({
          functionResponse: {
            name: toolMessage.name ?? "tool",
            response: { result: toolMessage.content ?? "" },
          },
        });
        index += 1;
      }
      index -= 1;
      contents.push({ role: "user", parts });
      continue;
    }
    if (message.role === "assistant" && message.tool_calls?.length) {
      const parts: any[] = [];
      if (typeof message.content === "string" && message.content.trim()) parts.push({ text: message.content });
      for (const call of message.tool_calls) {
        let args: unknown = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch {
          args = { invalidArguments: call.function.arguments };
        }
        parts.push({ functionCall: { name: call.function.name, args } });
      }
      contents.push({ role: "model", parts });
      continue;
    }
    const parts: any[] = [];
    if (Array.isArray(message.content)) {
      for (const part of message.content) {
        if (part.type === "text") parts.push({ text: part.text });
        else {
          const match = part.image_url.url.match(/^data:([^;]+);base64,(.+)$/s);
          if (match) parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
        }
      }
    } else if (message.content) {
      parts.push({ text: message.content });
    }
    contents.push({ role: message.role === "assistant" ? "model" : "user", parts: parts.length ? parts : [{ text: " " }] });
  }
  return contents;
}

function parseDataEvent(raw: string): any[] {
  const events: any[] = [];
  const lines = raw.split("\n");
  let data: string[] = [];
  for (const sourceLine of lines) {
    const line = sourceLine.replace(/\r$/, "");
    if (!line) {
      if (data.length) {
        const joined = data.join("\n");
        if (joined !== "[DONE]") {
          try {
            events.push(JSON.parse(joined));
          } catch {
            // Ignore keepalive/malformed SSE frames without terminating the stream.
          }
        }
        data = [];
      }
    } else if (line.startsWith("data:")) {
      data.push(line.slice(5).replace(/^ /, ""));
    }
  }
  if (data.length) {
    const joined = data.join("\n");
    if (joined !== "[DONE]") {
      try {
        events.push(JSON.parse(joined));
      } catch {
        // An incomplete tail is ignored.
      }
    }
  }
  return events;
}

async function* readSse(response: Response, signal: AbortSignal): AsyncGenerator<any> {
  if (!response.body) throw new Error("Le provider n'a pas ouvert de flux de réponse.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  try {
    while (true) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      const { done, value } = await reader.read();
      if (done) break;
      pending += decoder.decode(value, { stream: true });
      pending = pending.replace(/\r\n/g, "\n");
      const chunks = pending.split(/\n\n/);
      pending = chunks.pop() ?? "";
      for (const chunk of chunks) {
        for (const event of parseDataEvent(`${chunk}\n\n`)) yield event;
      }
    }
    pending += decoder.decode();
    if (pending.trim()) {
      for (const event of parseDataEvent(`${pending}\n\n`)) yield event;
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // Reader may already be released by the browser.
    }
  }
}

export type ToolDefinition = { type: "function"; function: { name: string; description: string; parameters: Record<string, unknown> } };

function geminiSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(geminiSchema);
  if (!schema || typeof schema !== "object") return schema;
  const source = schema as Record<string, any>;
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(source)) {
    if (key === "additionalProperties") continue;
    if (key === "type" && typeof value === "string") {
      const types: Record<string, string> = { object: "OBJECT", array: "ARRAY", string: "STRING", number: "NUMBER", integer: "INTEGER", boolean: "BOOLEAN" };
      result.type = types[value.toLowerCase()] ?? value.toUpperCase();
    } else if (key === "properties") {
      result.properties = Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([name, child]) => [name, geminiSchema(child)]));
    } else result[key] = geminiSchema(value);
  }
  return result;
}

export async function streamCompletion(options: {
  provider: Provider;
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ProviderMessage[];
  system: string;
  signal: AbortSignal;
  tools?: ToolDefinition[];
  onDelta?: (kind: "content" | "reasoning", text: string) => void;
}): Promise<StreamResult> {
  const { provider, baseUrl, apiKey, model, messages, system, signal, tools = [], onDelta } = options;
  const result: StreamResult = { content: "", reasoning: "", toolCalls: [] };
  if (!apiKey) throw new Error("Aucune clé API enregistrée pour ce provider.");

  let url: string;
  let init: RequestInit;
  if (provider.kind === "gemini") {
    url = `${baseUrl}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`;
    const systemText = messages.find((message) => message.role === "system")?.content;
    const effectiveSystem = typeof systemText === "string" ? systemText : system;
    const functionDeclarations = tools.map((tool) => ({ name: tool.function.name, description: tool.function.description, parameters: geminiSchema(tool.function.parameters) }));
    const body: any = {
      contents: geminiContents(messages.filter((message) => message.role !== "system")),
      generationConfig: { temperature: 0.7 },
    };
    if (effectiveSystem) body.systemInstruction = { parts: [{ text: effectiveSystem }] };
    if (functionDeclarations.length) body.tools = [{ functionDeclarations }];
    init = { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify(body) };
  } else {
    url = `${baseUrl}/chat/completions`;
    const headers: Record<string, string> = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
    if (provider.id === "openrouter") {
      headers["HTTP-Referer"] = window.location.origin;
      headers["X-Title"] = "Nexus AI Hub";
    }
    const body: any = { model, messages: openAIMessages(messages, system), stream: true };
    if (tools.length) {
      body.tools = tools;
      body.tool_choice = "auto";
    }
    init = { method: "POST", headers, body: JSON.stringify(body) };
  }

  const response = await fetchRetry(url, init, signal);
  if (!response.ok) {
    let errorBody: any = null;
    try {
      errorBody = await response.json();
    } catch {
      try { errorBody = { message: await response.text() }; } catch { errorBody = null; }
    }
    const detail = errorBody?.error?.message ?? errorBody?.error ?? errorBody?.message ?? `Erreur HTTP ${response.status}`;
    const label = errorLabel(response.status, String(detail));
    throw new ProviderRequestError(provider.id, response.status, label);
  }

  const openAiCalls = new Map<number, ToolCall>();
  for await (const event of readSse(response, signal)) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const streamError = event?.error ?? (event?.type === "error" ? event : null);
    if (streamError) {
      const status = Number(streamError.code ?? streamError.status ?? 0);
      const detail = String(streamError.message ?? streamError.error?.message ?? "Erreur reçue dans le flux SSE.");
      throw new ProviderRequestError(provider.id, Number.isFinite(status) ? status : 0, status ? errorLabel(status, detail) : detail);
    }
    if (provider.kind === "gemini") {
      const metadata = event.usageMetadata;
      if (metadata) result.usage = { input: metadata.promptTokenCount ?? 0, output: metadata.candidatesTokenCount ?? 0 };
      for (const part of event.candidates?.[0]?.content?.parts ?? []) {
        if (typeof part.text === "string" && part.text) {
          if (part.thought === true) {
            result.reasoning += part.text;
            onDelta?.("reasoning", part.text);
          } else {
            result.content += part.text;
            onDelta?.("content", part.text);
          }
        }
        if (part.functionCall?.name) {
          const call = part.functionCall;
          result.toolCalls.push({ id: `call_${uid()}`, type: "function", function: { name: call.name, arguments: JSON.stringify(call.args ?? {}) } });
        }
      }
    } else {
      if (event.usage) result.usage = { input: event.usage.prompt_tokens ?? 0, output: event.usage.completion_tokens ?? 0 };
      const delta = event.choices?.[0]?.delta;
      if (!delta) continue;
      const text = typeof delta.content === "string"
        ? delta.content
        : Array.isArray(delta.content)
          ? delta.content.map((part: any) => (typeof part?.text === "string" ? part.text : "")).join("")
          : "";
      if (text) {
        result.content += text;
        onDelta?.("content", text);
      }
      const reasoning = delta.reasoning_content ?? delta.reasoning;
      if (typeof reasoning === "string" && reasoning) {
        result.reasoning += reasoning;
        onDelta?.("reasoning", reasoning);
      }
      for (const partial of delta.tool_calls ?? []) {
        const index = Number(partial.index ?? openAiCalls.size);
        let call = openAiCalls.get(index);
        if (!call) {
          call = { id: partial.id ?? `call_${uid()}`, type: "function", function: { name: "", arguments: "" } };
          openAiCalls.set(index, call);
        }
        if (partial.id) call.id = partial.id;
        if (partial.function?.name) call.function.name += partial.function.name;
        if (partial.function?.arguments) call.function.arguments += partial.function.arguments;
      }
    }
  }
  if (provider.kind === "openai") {
    result.toolCalls = [...openAiCalls.entries()].sort(([a], [b]) => a - b).map(([, call]) => call);
  }
  return result;
}

export function textFromMessages(messages: ProviderMessage[]): string {
  return messages.map((message) => {
    if (typeof message.content === "string") return message.content;
    if (Array.isArray(message.content)) return message.content.map((part) => part.type === "text" ? part.text : "[image]").join(" ");
    return "";
  }).join("\n");
}
