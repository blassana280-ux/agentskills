const ITERATIONS = 250_000;

const toBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary);
};

const fromBase64 = (value: string): Uint8Array => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptVault(passphrase: string, value: unknown): Promise<string> {
  if (passphrase.length < 8) throw new Error("La phrase secrète doit contenir au moins 8 caractères.");
  if (!crypto?.subtle) throw new Error("WebCrypto est indisponible. Ouvrez Nexus via HTTPS ou localhost.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(JSON.stringify(value)),
  ));
  return JSON.stringify({ v: 1, kind: "nexus-vault", salt: toBase64(salt), iv: toBase64(iv), ct: toBase64(ciphertext) }, null, 2);
}

export async function decryptVault(passphrase: string, payload: string): Promise<unknown> {
  if (!crypto?.subtle) throw new Error("WebCrypto est indisponible. Ouvrez Nexus via HTTPS ou localhost.");
  let envelope: any;
  try {
    envelope = JSON.parse(payload);
  } catch {
    throw new Error("Le contenu importé n'est pas un JSON Nexus Vault valide.");
  }
  if (envelope?.v !== 1 || envelope?.kind !== "nexus-vault" || !envelope.salt || !envelope.iv || !envelope.ct) {
    throw new Error("Ce fichier n'est pas un export Nexus Vault compatible.");
  }
  try {
    const key = await deriveKey(passphrase, fromBase64(envelope.salt));
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(envelope.iv) as BufferSource },
      key,
      fromBase64(envelope.ct) as BufferSource,
    );
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch (error) {
    if (error instanceof DOMException && error.name === "OperationError") {
      throw new Error("Déchiffrement impossible : phrase secrète incorrecte ou export altéré.");
    }
    if (error instanceof SyntaxError) throw new Error("Le contenu déchiffré n'est pas un export JSON valide.");
    throw error;
  }
}
