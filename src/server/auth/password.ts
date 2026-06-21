// Password hashing (scrypt, per-password salt) and OTP hashing. OTPs are short
// and short-lived; the real defense is attempt-limiting + expiry (see service),
// the hash just avoids storing the code in cleartext.

import { scryptSync, randomBytes, timingSafeEqual, createHash } from "node:crypto";

export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const dk = scryptSync(pw, salt, 64).toString("hex");
  return `scrypt$${salt}$${dk}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const dk = scryptSync(pw, salt, 64);
  const h = Buffer.from(hash, "hex");
  return dk.length === h.length && timingSafeEqual(dk, h);
}

export function hashCode(code: string, email: string): string {
  return createHash("sha256").update(`${code}:${email.toLowerCase()}:flowblok.otp.v1`).digest("hex");
}
