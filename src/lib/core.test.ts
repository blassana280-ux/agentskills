import { afterEach, describe, expect, it, vi } from "vitest";
import { PROVIDERS, estimateCost, errorLabel, getBaseUrl, modelOptions, streamCompletion, supportsTools } from "./core";

afterEach(() => vi.unstubAllGlobals());

describe("provider catalog and local estimates", () => {
  it("returns known, unknown and unsupported tool-calling states", () => {
    expect(supportsTools("openai", "gpt-4o-mini")).toBe("yes");
    expect(supportsTools("groq", "deepseek-r1-distill-llama-70b")).toBe("no");
    expect(supportsTools("openrouter", "some-model")).toBe("unknown");
  });

  it("merges discovered models without duplicating catalog models", () => {
    expect(modelOptions("openai", { openai: ["gpt-4o", "custom-model"] }).map((model) => model.id)).toEqual([
      "gpt-4o-mini", "gpt-4o", "o3-mini", "custom-model",
    ]);
  });

  it("estimates cost only when a matching catalog rate exists", () => {
    expect(estimateCost("deepseek", "deepseek-chat", 1_000_000, 1_000_000)).toEqual({ cost: 1.37, known: true });
    expect(estimateCost("mistral", "codestral-latest", 100, 100)).toEqual({ cost: 0, known: false });
  });

  it("requires HTTPS for a custom endpoint so saved API keys are not sent in cleartext", () => {
    expect(getBaseUrl("custom", "https://gateway.example/v1/" )).toBe("https://gateway.example/v1");
    expect(() => getBaseUrl("custom", "http://gateway.example/v1")).toThrow(/HTTPS/);
  });

  it("translates actionable provider errors", () => {
    expect(errorLabel(401, "invalid_api_key")).toContain("vérifiez le Vault");
    expect(errorLabel(429, "too many requests")).toContain("rate limit");
  });
});

describe("real provider stream adapters", () => {
  const responseWithSse = (frames: string[]) => new Response(new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      for (const frame of frames) controller.enqueue(encoder.encode(frame));
      controller.close();
    },
  }), { status: 200, headers: { "Content-Type": "text/event-stream" } });

  it("streams OpenAI-compatible text, native reasoning, and assembled tool-call fragments", async () => {
    const fetchMock = vi.fn().mockResolvedValue(responseWithSse([
      'data: {"choices":[{"delta":{"content":"Réponse "}}]}\r\n\r\n',
      'data: {"choices":[{"delta":{"reasoning_content":"vérifiée"}}]}\r\n\r\n',
      'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"call-real","type":"function","function":{"name":"calcul","arguments":"{\\"expression\\":\\"1 + "}}]}}]}\r\n\r\n',
      'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"name":"ator","arguments":"2\\"}"}}]}}]}\r\n\r\n',
      "data: [DONE]\r\n\r\n",
    ]));
    vi.stubGlobal("fetch", fetchMock);
    const deltas: string[] = [];
    const provider = PROVIDERS.find((item) => item.id === "openai")!;
    const result = await streamCompletion({
      provider, baseUrl: provider.baseUrl, apiKey: "local-secret", model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Calcule" }], system: "Réponds en français.", signal: new AbortController().signal,
      tools: [{ type: "function", function: { name: "calculator", description: "Calcule", parameters: { type: "object", properties: { expression: { type: "string" } }, required: ["expression"] } } }],
      onDelta: (kind, text) => deltas.push(`${kind}:${text}`),
    });
    expect(result.content).toBe("Réponse ");
    expect(result.reasoning).toBe("vérifiée");
    expect(result.toolCalls).toEqual([{ id: "call-real", type: "function", function: { name: "calculator", arguments: "{\"expression\":\"1 + 2\"}" } }]);
    expect(deltas).toContain("content:Réponse ");
    expect(deltas).toContain("reasoning:vérifiée");
    expect(fetchMock.mock.calls[0][0]).toBe(`${provider.baseUrl}/chat/completions`);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string).tools[0].function.name).toBe("calculator");
  });

  it("uses Gemini's API-key header and native function-call schema", async () => {
    const fetchMock = vi.fn().mockResolvedValue(responseWithSse([
      'data: {"candidates":[{"content":{"parts":[{"text":"réflexion réelle","thought":true},{"text":"résultat"}]}}],"usageMetadata":{"promptTokenCount":8,"candidatesTokenCount":4}}\n\n',
      'data: {"candidates":[{"content":{"parts":[{"functionCall":{"name":"calculator","args":{"expression":"1 + 2"}}}]}}]}\n\n',
    ]));
    vi.stubGlobal("fetch", fetchMock);
    const provider = PROVIDERS.find((item) => item.id === "google")!;
    const result = await streamCompletion({
      provider, baseUrl: provider.baseUrl, apiKey: "gemini-secret", model: "gemini-2.0-flash",
      messages: [{ role: "user", content: "Calcule" }], system: "Système", signal: new AbortController().signal,
      tools: [{ type: "function", function: { name: "calculator", description: "Calcule", parameters: { type: "object", properties: { expression: { type: "string" } }, required: ["expression"] } } }],
    });
    expect(result.reasoning).toBe("réflexion réelle");
    expect(result.content).toBe("résultat");
    expect(result.usage).toEqual({ input: 8, output: 4 });
    expect(result.toolCalls[0].function.name).toBe("calculator");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).not.toContain("gemini-secret");
    expect(new Headers((init as RequestInit).headers).get("x-goog-api-key")).toBe("gemini-secret");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.systemInstruction.parts[0].text).toBe("Système");
    expect(body.tools[0].functionDeclarations[0].parameters.type).toBe("OBJECT");
  });
});
