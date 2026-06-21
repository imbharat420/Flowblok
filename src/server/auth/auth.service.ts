// Auth business logic: registration, password login, email-OTP issuance and
// verification. Sessions are created by the route after verify() succeeds.

import { randomInt } from "node:crypto";
import { authRepository, AuthRepository } from "./auth.repository";
import { hashPassword, verifyPassword, hashCode } from "./password";
import { sendMail, verificationEmail } from "@/server/email/mailer";
import type { DbUser } from "@/server/db/schema";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export type AuthResult =
  | { ok: true; email: string; name: string; devCode?: string }
  | { ok: false; error: string };

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  private async issueOtp(email: string, name: string, purpose: "register" | "login"): Promise<AuthResult> {
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    await this.repo.createVerification({
      email,
      codeHash: hashCode(code, email),
      purpose,
      expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    });
    const mail = verificationEmail(code);
    const sent = await sendMail({ to: email, subject: mail.subject, html: mail.html, text: mail.text });
    if (!sent.ok) {
      console.error("[auth] failed to send verification email:", sent.error);
      return { ok: false, error: "Couldn't send your verification code. Please try again shortly." };
    }
    // Expose the code to the client ONLY in non-production dev mode (no provider
    // configured). Never return the OTP in a production response — that would
    // defeat the email second factor.
    const exposeCode = sent.dev && process.env.NODE_ENV !== "production";
    return { ok: true, email, name, devCode: exposeCode ? code : undefined };
  }

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const existing = await this.repo.findUserByEmail(email);
    if (existing?.verified) {
      return { ok: false, error: "An account with this email already exists. Try signing in." };
    }
    let user = existing;
    if (!user) {
      user = await this.repo.createUser({ email, passwordHash: hashPassword(password), name: name.trim() });
    } else {
      await this.repo.setPassword(user.id, hashPassword(password));
    }
    return this.issueOtp(user.email, user.name, "register");
  }

  async startLogin(email: string, password: string): Promise<AuthResult> {
    const user = await this.repo.findUserByEmail(email);
    if (!user) return { ok: false, error: "No account found for that email." };
    if (!verifyPassword(password, user.passwordHash)) {
      return { ok: false, error: "Incorrect email or password." };
    }
    return this.issueOtp(user.email, user.name, "login");
  }

  async resend(email: string): Promise<AuthResult> {
    const user = await this.repo.findUserByEmail(email);
    if (!user) return { ok: false, error: "Nothing to resend — start over." };
    return this.issueOtp(user.email, user.name, "login");
  }

  async verify(email: string, code: string): Promise<{ ok: true; user: DbUser } | { ok: false; error: string }> {
    const v = await this.repo.latestVerification(email);
    const user = await this.repo.findUserByEmail(email);
    if (!v || !user) return { ok: false, error: "No verification in progress. Please start again." };
    if (Date.now() > Date.parse(v.expiresAt)) {
      await this.repo.clearVerifications(email);
      return { ok: false, error: "That code expired. Request a new one." };
    }
    if (v.attempts >= MAX_ATTEMPTS) {
      await this.repo.clearVerifications(email);
      return { ok: false, error: "Too many attempts. Request a new code." };
    }
    if (hashCode(code, email) !== v.codeHash) {
      await this.repo.bumpAttempts(v.id, v.attempts + 1);
      return { ok: false, error: "That code isn't right. Try again." };
    }
    await this.repo.markVerified(user.id);
    await this.repo.clearVerifications(email);
    return { ok: true, user: { ...user, verified: true } };
  }
}

export const authService = new AuthService();
