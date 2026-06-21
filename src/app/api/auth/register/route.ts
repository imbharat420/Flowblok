// POST /api/auth/register — create an unverified account + issue an email OTP.
import { NextResponse } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { clientIp, limitOr429, WINDOWS } from "@/server/auth/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const limited = limitOr429(`register:ip:${clientIp(req)}`, 10, WINDOWS.hour);
  if (limited) return NextResponse.json(limited.body, { status: limited.status });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "");

  if (!name) return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });

  const result = await authService.register(name, email, password);
  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}
