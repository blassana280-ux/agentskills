import { fetchRetry, type ToolDefinition } from "./core";

const objectSchema = (properties: Record<string, unknown>, required: string[] = []) => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});
const stringField = (description: string, extra: Record<string, unknown> = {}) => ({ type: "string", description, ...extra });

export const AGENT_TOOLS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "calculator",
      description: "Calcule une expression arithmétique. N'utilise jamais le calcul mental pour les opérations chiffrées.",
      parameters: objectSchema({ expression: stringField("Expression arithmétique, par exemple (125 * 1.18) / 4") }, ["expression"]),
    },
  },
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Recherche réellement des pages Wikipédia en français ou en anglais et retourne les extraits et sources.",
      parameters: objectSchema({ query: stringField("Termes de recherche"), language: stringField("Langue fr ou en", { enum: ["fr", "en"] }) }, ["query"]),
    },
  },
  {
    type: "function",
    function: {
      name: "github_search_repos",
      description: "Recherche des dépôts GitHub publics correspondant à la requête.",
      parameters: objectSchema({ query: stringField("Requête GitHub, par exemple react typescript"), limit: { type: "integer", description: "Nombre de résultats (1 à 10)", minimum: 1, maximum: 10 } }, ["query"]),
    },
  },
  {
    type: "function",
    function: {
      name: "github_list_my_repos",
      description: "Liste les dépôts récents accessibles au PAT GitHub enregistré dans le Vault.",
      parameters: objectSchema({}),
    },
  },
  {
    type: "function",
    function: {
      name: "github_get_file",
      description: "Lit le contenu d'un fichier ou liste les entrées d'un dossier dans un dépôt GitHub.",
      parameters: objectSchema({ owner: stringField("Propriétaire du dépôt"), repo: stringField("Nom du dépôt"), path: stringField("Chemin du fichier ou dossier", { default: "" }), ref: stringField("Branche, tag ou commit optionnel") }, ["owner", "repo"]),
    },
  },
  {
    type: "function",
    function: {
      name: "github_list_issues",
      description: "Liste les issues d'un dépôt GitHub, sans les pull requests.",
      parameters: objectSchema({ owner: stringField("Propriétaire du dépôt"), repo: stringField("Nom du dépôt"), state: stringField("État recherché", { enum: ["open", "closed", "all"], default: "open" }) }, ["owner", "repo"]),
    },
  },
  {
    type: "function",
    function: {
      name: "github_create_issue",
      description: "Crée une issue GitHub. Action destructive/sensible : l'utilisateur doit l'autoriser visuellement.",
      parameters: objectSchema({ owner: stringField("Propriétaire du dépôt"), repo: stringField("Nom du dépôt"), title: stringField("Titre de l'issue"), body: stringField("Description de l'issue"), labels: { type: "array", items: { type: "string" }, description: "Labels optionnels" } }, ["owner", "repo", "title", "body"]),
    },
  },
  {
    type: "function",
    function: {
      name: "github_write_file",
      description: "Crée ou met à jour un fichier dans un dépôt GitHub et génère un commit. Action sensible : l'utilisateur doit l'autoriser visuellement.",
      parameters: objectSchema({ owner: stringField("Propriétaire du dépôt"), repo: stringField("Nom du dépôt"), path: stringField("Chemin du fichier"), content: stringField("Contenu UTF-8 complet du fichier"), message: stringField("Message du commit"), branch: stringField("Branche optionnelle") }, ["owner", "repo", "path", "content", "message"]),
    },
  },
];

export type AgentToolName = (typeof AGENT_TOOLS)[number]["function"]["name"];
export type ToolContext = { githubPat: string; signal: AbortSignal };

class ToolHttpError extends Error {
  constructor(status: number, detail: string) {
    super(`GitHub a répondu ${status} : ${detail}`);
    this.name = "ToolHttpError";
  }
}

function clippedJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function requiredString(args: Record<string, any>, key: string): string {
  const value = args[key];
  if (typeof value !== "string" || !value.trim()) throw new Error(`Le paramètre « ${key} » est requis.`);
  return value.trim();
}

function repoEndpoint(owner: string, repo: string, tail = ""): string {
  const safeOwner = owner.trim();
  const safeRepo = repo.trim();
  if (!/^[\w.-]+$/.test(safeOwner) || !/^[\w.-]+$/.test(safeRepo)) throw new Error("Nom de dépôt GitHub invalide.");
  const path = tail.split("/").filter(Boolean).map((part) => encodeURIComponent(part)).join("/");
  return `https://api.github.com/repos/${encodeURIComponent(safeOwner)}/${encodeURIComponent(safeRepo)}${path ? `/${path}` : ""}`;
}

function githubHeaders(pat: string, withBody = false): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${pat}`,
    "X-GitHub-Api-Version": "2022-11-28",
    ...(withBody ? { "Content-Type": "application/json" } : {}),
  };
}

async function githubJson(url: string, context: ToolContext, init: RequestInit = {}): Promise<any> {
  const response = await fetchRetry(url, { ...init, headers: { ...githubHeaders(context.githubPat, Boolean(init.body)), ...(init.headers as Record<string, string> ?? {}) } }, context.signal);
  let body: any = null;
  try { body = await response.json(); } catch { body = null; }
  if (!response.ok) throw new ToolHttpError(response.status, body?.message ?? "requête refusée");
  return body;
}

function requirePat(context: ToolContext): void {
  if (!context.githubPat) throw new Error("PAT GitHub manquant : ajoutez-le dans le Vault pour utiliser les outils GitHub.");
}

function tokenizeExpression(expression: string): string[] {
  if (!expression.trim()) throw new Error("Expression vide.");
  if (!/^[\d\s+\-*/().,%]+$/.test(expression)) throw new Error("Caractères non autorisés. Seuls les nombres et opérateurs arithmétiques sont acceptés.");
  const normalized = expression.replace(/,/g, ".");
  const tokens = normalized.match(/\d+(?:\.\d*)?|\.\d+|[%()+\-*/]/g) ?? [];
  if (tokens.join("").replace(/\s/g, "") !== normalized.replace(/\s/g, "")) throw new Error("Expression arithmétique invalide.");
  return tokens;
}

export function calculate(expression: string): number {
  const tokens = tokenizeExpression(expression);
  let position = 0;
  const peek = () => tokens[position];
  const consume = () => tokens[position++];

  const parsePrimary = (): number => {
    const token = consume();
    if (token === undefined) throw new Error("Expression incomplète.");
    let value: number;
    if (token === "(") {
      value = parseExpression();
      if (consume() !== ")") throw new Error("Parenthèse fermante manquante.");
    } else if (token === "+") {
      value = parsePrimary();
    } else if (token === "-") {
      value = -parsePrimary();
    } else if (/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) {
      value = Number(token);
    } else {
      throw new Error(`Élément inattendu : ${token}`);
    }
    while (peek() === "%") {
      consume();
      value /= 100;
    }
    return value;
  };

  const parseTerm = (): number => {
    let value = parsePrimary();
    while (peek() === "*" || peek() === "/") {
      const operator = consume();
      const right = parsePrimary();
      if (operator === "/" && right === 0) throw new Error("Division par zéro.");
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  };

  const parseExpression = (): number => {
    let value = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const operator = consume();
      const right = parseTerm();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  };

  const result = parseExpression();
  if (position !== tokens.length) throw new Error(`Opérateur inattendu : ${tokens[position]}`);
  if (!Number.isFinite(result)) throw new Error("Le résultat n'est pas un nombre fini.");
  return Number(result.toPrecision(12));
}

async function searchWikipedia(query: string, language: string, signal: AbortSignal): Promise<string> {
  const lang = language === "en" ? "en" : "fr";
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=5&format=json&origin=*`;
  const response = await fetchRetry(url, { headers: { Accept: "application/json" } }, signal);
  let data: any = null;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok) throw new Error(`Recherche Wikipédia impossible (HTTP ${response.status}).`);
  const results = data?.query?.search ?? [];
  if (!results.length) return `Aucun résultat Wikipédia pour « ${query} ».`;
  return clippedJson(results.map((item: any) => ({
    title: item.title,
    snippet: String(item.snippet ?? "").replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#039;/g, "'"),
    url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(String(item.title ?? "").replace(/ /g, "_"))}`,
  })));
}

function utf8Base64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let start = 0; start < bytes.length; start += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(start, Math.min(start + 0x8000, bytes.length)));
  }
  return btoa(binary);
}

export async function executeTool(name: string, args: Record<string, any>, context: ToolContext): Promise<string> {
  try {
    switch (name) {
      case "calculator": {
        const expression = requiredString(args, "expression");
        return clippedJson({ expression, result: calculate(expression) });
      }
      case "web_search":
        return await searchWikipedia(requiredString(args, "query"), args.language === "en" ? "en" : "fr", context.signal);
      case "github_search_repos": {
        const query = requiredString(args, "query");
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=${Math.min(10, Math.max(1, Number(args.limit) || 5))}`;
        const headers: Record<string, string> = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
        if (context.githubPat) headers.Authorization = `Bearer ${context.githubPat}`;
        const response = await fetchRetry(url, { headers }, context.signal);
        let body: any = null;
        try { body = await response.json(); } catch { body = null; }
        if (!response.ok) throw new Error(`Recherche GitHub impossible (HTTP ${response.status}) : ${body?.message ?? "erreur API"}`);
        return clippedJson((body?.items ?? []).map((repo: any) => ({ full_name: repo.full_name, description: repo.description, url: repo.html_url, stars: repo.stargazers_count, language: repo.language })));
      }
      case "github_list_my_repos": {
        requirePat(context);
        const data = await githubJson("https://api.github.com/user/repos?per_page=30&sort=updated", context);
        return clippedJson((data ?? []).map((repo: any) => ({ full_name: repo.full_name, description: repo.description, private: repo.private, url: repo.html_url, updated_at: repo.updated_at })));
      }
      case "github_get_file": {
        requirePat(context);
        const owner = requiredString(args, "owner");
        const repo = requiredString(args, "repo");
        const path = typeof args.path === "string" ? args.path.trim() : "";
        const ref = typeof args.ref === "string" ? args.ref.trim() : "";
        const endpoint = `${repoEndpoint(owner, repo, `contents/${path}`)}${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;
        const response = await fetchRetry(endpoint, { headers: githubHeaders(context.githubPat) }, context.signal);
        let body: any = null;
        try { body = await response.json(); } catch { body = null; }
        if (!response.ok) throw new ToolHttpError(response.status, body?.message ?? "lecture impossible");
        if (Array.isArray(body)) return clippedJson(body.map((entry: any) => ({ name: entry.name, path: entry.path, type: entry.type, url: entry.html_url })));
        if (body?.type !== "file") return clippedJson({ message: "Le chemin ne désigne pas un fichier.", type: body?.type, path: body?.path });
        if (body.encoding !== "base64" || typeof body.content !== "string") throw new Error("GitHub n'a pas fourni de contenu base64 lisible pour ce fichier.");
        const bytes = Uint8Array.from(atob(body.content.replace(/\s/g, "")), (character) => character.charCodeAt(0));
        return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
      }
      case "github_list_issues": {
        requirePat(context);
        const owner = requiredString(args, "owner");
        const repo = requiredString(args, "repo");
        const state = ["open", "closed", "all"].includes(args.state) ? args.state : "open";
        const data = await githubJson(`${repoEndpoint(owner, repo, "issues")}?state=${state}&per_page=100`, context);
        return clippedJson((data ?? []).filter((issue: any) => !issue.pull_request).map((issue: any) => ({ number: issue.number, title: issue.title, state: issue.state, url: issue.html_url, labels: issue.labels?.map((label: any) => label.name), created_at: issue.created_at })));
      }
      case "github_create_issue": {
        requirePat(context);
        const owner = requiredString(args, "owner");
        const repo = requiredString(args, "repo");
        const title = requiredString(args, "title");
        const body = typeof args.body === "string" ? args.body : "";
        const payload: Record<string, unknown> = { title, body };
        if (Array.isArray(args.labels)) payload.labels = args.labels.filter((label: unknown) => typeof label === "string");
        const issue = await githubJson(repoEndpoint(owner, repo, "issues"), context, { method: "POST", body: JSON.stringify(payload) });
        return clippedJson({ number: issue.number, title: issue.title, url: issue.html_url, state: issue.state, result: "Issue créée" });
      }
      case "github_write_file": {
        requirePat(context);
        const owner = requiredString(args, "owner");
        const repo = requiredString(args, "repo");
        const path = requiredString(args, "path").replace(/^\/+/, "");
        if (path.split("/").some((part) => part === "..")) throw new Error("Le chemin ne peut pas contenir de segment '..'.");
        const content = typeof args.content === "string" ? args.content : "";
        const message = requiredString(args, "message");
        const branch = typeof args.branch === "string" ? args.branch.trim() : "";
        const fileUrl = repoEndpoint(owner, repo, `contents/${path}`);
        let sha: string | undefined;
        const current = await fetchRetry(fileUrl, { headers: githubHeaders(context.githubPat) }, context.signal);
        if (current.ok) {
          const existing = await current.json();
          if (existing?.type !== "file" || typeof existing.sha !== "string") throw new Error("Le chemin existe, mais GitHub ne le reconnaît pas comme un fichier modifiable.");
          sha = existing.sha;
        } else if (current.status !== 404) {
          let details: any = null;
          try { details = await current.json(); } catch { details = null; }
          throw new ToolHttpError(current.status, details?.message ?? "lecture du SHA préalable impossible");
        }
        const payload: Record<string, unknown> = { message, content: utf8Base64(content) };
        if (sha) payload.sha = sha;
        if (branch) payload.branch = branch;
        const result = await githubJson(fileUrl, context, { method: "PUT", body: JSON.stringify(payload) });
        return clippedJson({ path: result.content?.path ?? path, sha: result.content?.sha, commit: result.commit?.sha, url: result.content?.html_url, result: sha ? "Fichier mis à jour et commit créé" : "Fichier créé et commit créé" });
      }
      default:
        throw new Error(`Outil inconnu : ${name}`);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    const message = error instanceof Error ? error.message : String(error);
    return `ERREUR OUTIL — ${message}`;
  }
}
