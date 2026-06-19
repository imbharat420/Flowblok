// Outbound-request guard. Blocks SSRF to internal/loopback/link-local hosts and
// non-http(s) schemes. Used by the HTTP node and the AI Agent's HTTP tool,
// where a URL can be influenced by workflow data or an LLM.

export function assertSafeUrl(raw: string): URL {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error(`Invalid URL: ${raw.slice(0, 80)}`);
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error(`Blocked URL scheme: ${u.protocol}`);
  }
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const blocked =
    host === "localhost" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".internal") ||
    host.endsWith(".local") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^fc00:/i.test(host) ||
    /^fe80:/i.test(host);
  if (blocked) throw new Error(`Blocked host (private/loopback): ${host}`);
  return u;
}
