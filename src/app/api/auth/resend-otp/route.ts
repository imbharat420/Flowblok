// POST /api/auth/resend-otp — re-issue the email OTP for a pending verification.
import { NextResponse } from "next/server";
import { authService } from "@/server/auth/auth.service";
import { clientIp, limitOr429, WINDOWS } from "@/server/auth/rate-limit";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email) return NextResponse.json({ ok: false, error: "Missing email." }, { status: 400 });

  const ip = clientIp(req);
  // Cap resends so the per-code attempt limit can't be reset arbitrarily, and
  // to prevent OTP email bombing of any registered address.
  const limited =
    limitOr429(`resend:${ip}:${email}`, 3, WINDOWS.tenMin) || limitOr429(`resend:ip:${ip}`, 10, WINDOWS.hour);
  if (limited) return NextResponse.json(limited.body, { status: limited.status });

  const result = await authService.resend(email);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
