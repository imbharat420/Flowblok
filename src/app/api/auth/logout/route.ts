// POST /api/auth/logout — destroy the session row and clear auth cookies.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authRepository } from "@/server/auth/auth.repository";
import { SESSION_COOKIE, ROLE_COOKIE } from "@/server/auth/session";

export async function POST() {
  const store = await cookies();
  const sid = store.get(SESSION_COOKIE)?.value;
  if (sid) await authRepository.deleteSession(sid).catch(() => {});

  const res = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0, secure });
  res.cookies.set(ROLE_COOKIE, "", { path: "/", maxAge: 0, secure });
  return res;
}
