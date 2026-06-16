import { actionTypeByKey } from "./event-recipes";

export type EventTrigger =
  | "on_click"
  | "on_submit"
  | "on_view"
  | "on_load"
  | "on_hover"
  | "on_change"
  | "on_double_click"
  | "on_success"
  | "on_error"
  | "on_interval";

export interface EventAction {
  id: string;
  type: string;
  config: Record<string, string>;
}

export interface EventHandler {
  id: string;
  trigger: EventTrigger;
  actions: EventAction[];
}

export const TRIGGER_LABELS: Record<EventTrigger, string> = {
  on_click: "On click",
  on_submit: "On submit",
  on_view: "On view (enters viewport)",
  on_load: "On load",
  on_hover: "On hover",
  on_change: "On change",
  on_double_click: "On double-click",
  on_success: "On success",
  on_error: "On error",
  on_interval: "On interval",
};

export const TRIGGERS = Object.keys(TRIGGER_LABELS) as EventTrigger[];

export interface ActionConfigField {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "enum" | "ref" | "map" | "richtext";
  values?: string[];
  required?: boolean;
  refKind?: string;
}

export interface ActionTypeDef {
  type: string;
  label: string;
  description: string;
  icon: string;
  configFields: ActionConfigField[];
}

// e.g. "On click → run workflow, show toast"
export function summarizeHandler(h: EventHandler): string {
  const trigger = TRIGGER_LABELS[h.trigger] ?? h.trigger;
  if (h.actions.length === 0) return `${trigger} → (no actions)`;
  const labels = h.actions.map((a) => actionTypeByKey(a.type)?.label.toLowerCase() ?? a.type);
  return `${trigger} → ${labels.join(", ")}`;
}
