// Session helpers shared by the app layout, the RBAC guard, and auth routes.
// The session id lives in an httpOnly cookie and resolves to a DB-backed row.

import { cookies } from "next/headers";
import { authRepository } from "./auth.repository";
import type { DbUser } from "@/server/db/schema";

export const SESSION_COOKIE = "flowblok_session";
export const ROLE_COOKIE = "fb_role";

const TTL_DAYS = Number(process.env.SESSION_TTL_DAYS ?? 30);
export const SESSION_MAX_AGE = TTL_DAYS * 24 * 60 * 60; // seconds

export function sessionExpiryISO(): string {
  return new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();
}

/** Resolve the current session from the request cookie, or null. */
export async function getSession(): Promise<{ user: DbUser; sessionId: string } | null> {
  const store = await cookies();
  const sid = store.get(SESSION_COOKIE)?.value;
  if (!sid) return null;
  const session = await authRepository.findSession(sid);
  if (!session) return null;
  if (Date.parse(session.expiresAt) < Date.now()) {
    await authRepository.deleteSession(sid).catch(() => {});
    return null;
  }
  const user = await authRepository.findUserById(session.userId);
  return user ? { user, sessionId: sid } : null;
}
