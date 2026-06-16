import * as Lucide from "lucide-react";
import { Box, type LucideIcon } from "lucide-react";

// Resolve a lucide icon by its PascalCase name. Used by the workflow node palette,
// the events builder, and other catalog-driven surfaces. Falls back to Box for
// unknown names so a bad name never crashes the UI.
const REGISTRY = Lucide as unknown as Record<string, LucideIcon>;

export function getIcon(name: string): LucideIcon {
  return REGISTRY[name] ?? Box;
}
