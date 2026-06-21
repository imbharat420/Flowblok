// Pluggable transactional email. With RESEND_API_KEY set, sends via the Resend
// HTTP API (no extra dependency). Otherwise it logs to the server console (dev),
// so the OTP flow works end-to-end without configuring a provider.

const FROM = process.env.EMAIL_FROM || "Flowblok <onboarding@flowblok.dev>";
const RESEND_KEY = process.env.RESEND_API_KEY;

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail(msg: MailMessage): Promise<{ ok: boolean; dev: boolean; error?: string }> {
  if (!RESEND_KEY) {
    console.log(`\n[mail:dev] To: ${msg.to}\n[mail:dev] Subject: ${msg.subject}\n[mail:dev] ${msg.text ?? msg.html}\n`);
    return { ok: true, dev: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: msg.to, subject: msg.subject, html: msg.html, text: msg.text }),
    });
    if (!res.ok) return { ok: false, dev: false, error: `Resend ${res.status}: ${(await res.text()).slice(0, 200)}` };
    return { ok: true, dev: false };
  } catch (err) {
    return { ok: false, dev: false, error: (err as Error).message };
  }
}

/** Branded verification-code email. */
export function verificationEmail(code: string): { subject: string; html: string; text: string } {
  return {
    subject: `${code} is your Flowblok verification code`,
    text: `Your Flowblok verification code is ${code}. It expires in 10 minutes.`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:440px;margin:auto;padding:32px;background:#0c0e12;color:#f4f5f7;border-radius:16px">
      <h1 style="font-size:18px;margin:0 0 8px">Verify your email</h1>
      <p style="color:#9aa0aa;font-size:14px;margin:0 0 24px">Enter this code to continue. It expires in 10 minutes.</p>
      <div style="font-size:34px;letter-spacing:10px;font-weight:700;background:linear-gradient(110deg,#3b6cff,#7c5cff,#22d3ee);-webkit-background-clip:text;background-clip:text;color:transparent">${code}</div>
      <p style="color:#5b606b;font-size:12px;margin-top:24px">If you didn't request this, you can ignore this email.</p>
    </div>`,
  };
}
