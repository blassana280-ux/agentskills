import { describe, expect, it } from "vitest";
import { calculate, executeTool } from "./tools";

describe("calculator tool", () => {
  it("evaluates arithmetic with parentheses and precedence", () => {
    expect(calculate("(125 * 1.18) / 5")).toBe(29.5);
    expect(calculate("2 + 3 * 4")).toBe(14);
  });

  it("accepts decimal commas and percentages", () => {
    expect(calculate("12,5 * 2")).toBe(25);
    expect(calculate("15% * 200")).toBe(30);
  });

  it("rejects code, malformed expressions, and division by zero", () => {
    expect(() => calculate("globalThis.alert(1)")).toThrow(/Caractères non autorisés/);
    expect(() => calculate("1 + (2 * 3")).toThrow(/Parenthèse fermante/);
    expect(() => calculate("9 / 0")).toThrow(/Division par zéro/);
  });

  it("returns a dedicated local PAT error instead of attempting a GitHub call", async () => {
    const result = await executeTool("github_list_my_repos", {}, { githubPat: "", signal: new AbortController().signal });
    expect(result).toContain("PAT GitHub manquant");
    expect(result).toMatch(/^ERREUR OUTIL/);
  });
});
