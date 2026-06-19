// AI Agent node handler.
//
// Per input item, resolves a prompt/model/system and calls the Anthropic
// Messages API to produce a reply, enriching the item with `ai = { model, text }`.
//
// The API key is read ONLY from process.env.ANTHROPIC_API_KEY (no dependency on
// the credentials module — this keeps the handler self-contained). With no key
// set, the node returns a simulated reply so the workflow still runs end-to-end.

import type { ExecItem } from "@/lib/types";
import { registerHandler, type NodeHandler } from "./handlers";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-opus-4-8";

async function callAnthropic(
  key: string,
  model: string,
  prompt: string,
  system: string | undefined,
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  };
  if (system) body.system = system;

  const res = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${text.slice(0, 500)}`);
  }

  let data: { content?: Array<{ text?: string }> };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Anthropic API returned non-JSON response: ${text.slice(0, 500)}`);
  }

  const reply = data.content?.[0]?.text;
  if (typeof reply !== "string") {
    throw new Error(`Anthropic API response missing content[0].text: ${text.slice(0, 500)}`);
  }
  return reply;
}

const aiAgent: NodeHandler = async ({ items, getParam, log }) => {
  const key = process.env.ANTHROPIC_API_KEY;
  const src = items.length ? items : [{ json: {} }];

  if (!key) {
    log("no ANTHROPIC_API_KEY set — returning simulated reply");
    return {
      items: src.map((item) => {
        const prompt = String(getParam("prompt", item) ?? "");
        const model = String(getParam("model", item) ?? DEFAULT_MODEL);
        return { json: { ...item.json, ai: { model, text: "(simulated) " + prompt, simulated: true } } };
      }),
    };
  }

  const out: ExecItem[] = [];
  for (const item of src) {
    const prompt = String(getParam("prompt", item) ?? "");
    const model = String(getParam("model", item) ?? DEFAULT_MODEL);
    const systemRaw = getParam("system", item);
    const system = systemRaw === undefined || systemRaw === "" ? undefined : String(systemRaw);

    log(`${model} · ${prompt.slice(0, 60)}`);
    const text = await callAnthropic(key, model, prompt, system);
    out.push({ json: { ...item.json, ai: { model, text } } });
  }
  return { items: out };
};

registerHandler("ai_agent", aiAgent);
