// Module-local types for the AI one-prompt generation surface.

export interface GenerationStep {
  /** Stable key for animation tracking. */
  key: string;
  /** Human-facing label shown in the timeline. */
  label: string;
  /** Which of the five generated layers (or meta phase) this step belongs to. */
  layer: "analysis" | "database" | "pages" | "components" | "workflows" | "apis" | "deploy";
}

export interface GeneratePlan {
  prompt: string;
  steps: GenerationStep[];
}

export interface AiAgent {
  id: string;
  name: string;
  description: string;
  /** lucide-react icon name, resolved on the client. */
  icon:
    | "Palette"
    | "Code2"
    | "Search"
    | "PenLine"
    | "Users"
    | "BarChart3";
}
