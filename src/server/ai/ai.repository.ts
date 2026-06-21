// Repository layer — the ONLY layer that owns the data source.
// Holds its own in-memory seed: the ordered step plan template and the AI agent roster.

import type { AiAgent, GenerationStep } from "./ai.types";

// The fixed, ordered generation plan. This is the moat made literal:
// five product layers (Database, Pages, Components, Workflows, APIs) generated
// together from a single prompt, then deployed.
const STEP_PLAN: GenerationStep[] = [
  { key: "analyze", label: "Analyze prompt", layer: "analysis" },
  { key: "database", label: "Generate Database", layer: "database" },
  { key: "pages", label: "Generate Pages", layer: "pages" },
  { key: "components", label: "Generate Components", layer: "components" },
  { key: "workflows", label: "Generate Workflows", layer: "workflows" },
  { key: "apis", label: "Generate APIs", layer: "apis" },
  { key: "deploy", label: "Deploy", layer: "deploy" },
];

// Cleared: no demo agent roster.
const AGENTS: AiAgent[] = [];

export class AiRepository {
  /** Returns a fresh copy so callers can't mutate the seed template. */
  stepPlan(): GenerationStep[] {
    return STEP_PLAN.map((s) => ({ ...s }));
  }

  agents(): AiAgent[] {
    return AGENTS.map((a) => ({ ...a }));
  }
}

export const aiRepository = new AiRepository();
