// Conditional parameter visibility (n8n's displayOptions). A param with a
// `showWhen` only renders when another param's current value matches — this is
// what powers Resource → Operation cascades and "advanced" fields.

import type { NodeParam } from "@/lib/types";

export function isParamVisible(p: NodeParam, config: Record<string, unknown> | undefined): boolean {
  if (!p.showWhen) return true;
  const current = String(config?.[p.showWhen.key] ?? "");
  return p.showWhen.equals.includes(current);
}

export function visibleParams(params: NodeParam[] | undefined, config: Record<string, unknown> | undefined): NodeParam[] {
  return (params ?? []).filter((p) => isParamVisible(p, config));
}
