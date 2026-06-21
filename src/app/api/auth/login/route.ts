// POST /api/auth/login — validate credentials, issue an email OTP (2FA step).
import { NextResponse } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { clientIp, limitOr429, WINDOWS } from "@/server/auth/rate-limit";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Enter your email and password." }, { status: 400 });
  }
  const ip = clientIp(req);
  const limited =
    limitOr429(`login:${ip}:${email}`, 5, WINDOWS.fifteenMin) || limitOr429(`login:ip:${ip}`, 30, WINDOWS.fifteenMin);
  if (limited) return NextResponse.json(limited.body, { status: limited.status });

  const result = await authService.startLogin(email, password);
  return NextResponse.json(result, { status: result.ok ? 200 : 401 });
}
