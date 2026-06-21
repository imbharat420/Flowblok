// Auth data access (Drizzle): accounts (users), email-verification OTPs, and
// sessions. Pure persistence — business rules live in auth.service.ts.

import { randomUUID } from "node:crypto";
import { getDb } from "@/server/db/client";
import { users, emailVerifications, sessions, type DbUser } from "@/server/db/schema";
import { eq, desc, lt } from "drizzle-orm";

export class AuthRepository {
  // ── users ──
  async findUserByEmail(email: string): Promise<DbUser | undefined> {
    const db = await getDb();
    const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    return rows[0];
  }

  async findUserById(id: string): Promise<DbUser | undefined> {
    const db = await getDb();
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0];
  }

  async createUser(input: { email: string; passwordHash: string; name: string }): Promise<DbUser> {
    const db = await getDb();
    const email = input.email.toLowerCase();
    const [row] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        email,
        passwordHash: input.passwordHash,
        name: input.name,
        role: "owner",
        verified: false,
        username: email.split("@")[0],
        firstName: input.name.split(" ")[0] ?? input.name,
        lastName: input.name.split(" ").slice(1).join(" ") || null,
      })
      .returning();
    return row;
  }

  async setPassword(id: string, passwordHash: string): Promise<void> {
    const db = await getDb();
    await db.update(users).set({ passwordHash, updatedAt: new Date().toISOString() }).where(eq(users.id, id));
  }

  async markVerified(id: string): Promise<void> {
    const db = await getDb();
    await db.update(users).set({ verified: true, updatedAt: new Date().toISOString() }).where(eq(users.id, id));
  }

  // ── email verification OTPs ──
  async createVerification(input: { email: string; codeHash: string; purpose: string; expiresAt: string }): Promise<void> {
    const db = await getDb();
    const email = input.email.toLowerCase();
    await db.delete(emailVerifications).where(eq(emailVerifications.email, email)); // one active code per email
    await db.insert(emailVerifications).values({
      id: randomUUID(),
      email,
      codeHash: input.codeHash,
      purpose: input.purpose,
      expiresAt: input.expiresAt,
    });
  }

  async latestVerification(email: string) {
    const db = await getDb();
    const rows = await db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.email, email.toLowerCase()))
      .orderBy(desc(emailVerifications.createdAt))
      .limit(1);
    return rows[0];
  }

  async bumpAttempts(id: string, attempts: number): Promise<void> {
    const db = await getDb();
    await db.update(emailVerifications).set({ attempts }).where(eq(emailVerifications.id, id));
  }

  async clearVerifications(email: string): Promise<void> {
    const db = await getDb();
    await db.delete(emailVerifications).where(eq(emailVerifications.email, email.toLowerCase()));
  }

  // ── sessions ──
  async createSession(input: { userId: string; expiresAt: string; userAgent?: string; ip?: string }): Promise<string> {
    const db = await getDb();
    const id = randomUUID();
    await db.insert(sessions).values({
      id,
      userId: input.userId,
      expiresAt: input.expiresAt,
      userAgent: input.userAgent,
      ip: input.ip,
    });
    return id;
  }

  async findSession(id: string) {
    const db = await getDb();
    const rows = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    return rows[0];
  }

  async deleteSession(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  async deleteExpiredSessions(): Promise<void> {
    const db = await getDb();
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date().toISOString()));
  }
}

export const authRepository = new AuthRepository();
