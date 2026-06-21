// POST /api/auth/verify-otp — verify the 6-digit code, then open a real session.
import { NextResponse } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { authRepository } from "@/server/auth/auth.repository";
import { SESSION_COOKIE, ROLE_COOKIE, SESSION_MAX_AGE, sessionExpiryISO } from "@/server/auth/session";
import { clientIp, limitOr429, WINDOWS } from "@/server/auth/rate-limit";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const email = String(body?.email ?? "").trim().toLowerCase();
  const code = String(body?.code ?? "").trim();
  if (!email || code.length !== 6) {
    return NextResponse.json({ ok: false, error: "Enter the 6-digit code." }, { status: 400 });
  }

  const ip = clientIp(req);
  const limited = limitOr429(`verify:${ip}:${email}`, 10, WINDOWS.fifteenMin);
  if (limited) return NextResponse.json(limited.body, { status: limited.status });

  const result = await authService.verify(email, code);
  if (!result.ok) return NextResponse.json(result, { status: 400 });

  // Create a DB-backed session and set the cookies the app reads.
  const sessionId = await authRepository.createSession({
    userId: result.user.id,
    expiresAt: sessionExpiryISO(),
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  const res = NextResponse.json({ ok: true, name: result.user.name });
  const secure = process.env.NODE_ENV === "production";
  const base = { sameSite: "lax" as const, path: "/", maxAge: SESSION_MAX_AGE, secure };
  res.cookies.set(SESSION_COOKIE, sessionId, { ...base, httpOnly: true });
  // fb_role is read by the RBAC guard + mirrored by the client role switcher.
  res.cookies.set(ROLE_COOKIE, result.user.role, { ...base, httpOnly: false });
  return res;
}
