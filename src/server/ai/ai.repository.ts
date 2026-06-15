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

const AGENTS: AiAgent[] = [
  {
    id: "designer",
    name: "Designer",
    description: "Composes layouts, theme tokens and infinite components from the brand brief.",
    icon: "Palette",
  },
  {
    id: "developer",
    name: "Developer",
    description: "Wires pages to typed APIs and the generated database schema.",
    icon: "Code2",
  },
  {
    id: "seo",
    name: "SEO",
    description: "Generates metadata, sitemaps and structured data for every route.",
    icon: "Search",
  },
  {
    id: "copywriter",
    name: "Copywriter",
    description: "Drafts on-brand copy for pages, components and email flows.",
    icon: "PenLine",
  },
  {
    id: "crm",
    name: "CRM Agent",
    description: "Builds lead pipelines, contact models and nurture workflows.",
    icon: "Users",
  },
  {
    id: "analytics",
    name: "Analytics Agent",
    description: "Instruments events and assembles dashboards from day one.",
    icon: "BarChart3",
  },
];

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
