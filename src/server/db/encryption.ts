// AES-256-GCM encryption for credential secrets at rest. The key is derived
// from CRED_SECRET (scrypt). In dev a deterministic fallback key is used so the
// app runs without configuration — production MUST set CRED_SECRET.

import { scryptSync, randomBytes, createCipheriv, createDecipheriv } from "node:crypto";

const RAW = process.env.CRED_SECRET;
if (!RAW && process.env.NODE_ENV === "production") {
  // Don't crash the build, but make the misconfiguration loud at runtime.
  console.warn("[security] CRED_SECRET is not set — credential secrets use a weak dev key.");
}
const KEY = scryptSync(RAW ?? "flowblok-dev-insecure-key", "flowblok.cred.salt.v1", 32);
const PREFIX = "v1:";

/** Encrypt a plaintext string → "v1:<base64(iv|tag|ciphertext)>". */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, ct]).toString("base64");
}

/** Decrypt a "v1:" blob back to plaintext. Returns "" on any failure. */
export function decryptSecret(blob: string): string {
  try {
    if (!blob.startsWith(PREFIX)) return blob; // tolerate legacy/plaintext
    const buf = Buffer.from(blob.slice(PREFIX.length), "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ct = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", KEY, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

/** Encrypt/decrypt a secret bag (Record<string,string>) as a JSON blob. */
export function encryptBag(bag: Record<string, string>): string {
  return encryptSecret(JSON.stringify(bag));
}
export function decryptBag(blob: string): Record<string, string> {
  const json = decryptSecret(blob);
  try {
    return json ? (JSON.parse(json) as Record<string, string>) : {};
  } catch {
    return {};
  }
}
