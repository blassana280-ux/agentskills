// @vitest-environment node
import { describe, expect, it } from "vitest";
import { decryptVault, encryptVault } from "./crypto";

describe("encrypted Vault envelope", () => {
  it("round-trips data in the versioned nexus-vault payload", async () => {
    const original = { keys: { openai: "secret-local" }, githubPat: "pat-local", prompts: [{ title: "Note" }] };
    const payload = await encryptVault("phrase secrete forte", original);
    const envelope = JSON.parse(payload);
    expect(envelope).toMatchObject({ v: 1, kind: "nexus-vault" });
    expect(envelope.salt).toBeTruthy();
    expect(envelope.iv).toBeTruthy();
    expect(envelope.ct).toBeTruthy();
    expect(await decryptVault("phrase secrete forte", payload)).toEqual(original);
  });

  it("requires an eight-character export passphrase and reports wrong passphrases", async () => {
    await expect(encryptVault("short", {})).rejects.toThrow(/8 caractères/);
    const payload = await encryptVault("correct phrase", { keys: {} });
    await expect(decryptVault("incorrect phrase", payload)).rejects.toThrow(/phrase secrète incorrecte/);
  });
});
