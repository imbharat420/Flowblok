"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { AiAgent, GenerationStep } from "@/server/ai/ai.types";
import {
  Sparkles,
  Loader2,
  Check,
  Database,
  LayoutTemplate,
  Boxes,
  Workflow,
  PlugZap,
  Rocket,
  Search as SearchIcon,
  Palette,
  Code2,
  PenLine,
  Users,
  BarChart3,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Story } from "@/lib/types";

// First ~6 words of the prompt, title-cased-ish — used as the generated page name.
function titleFromPrompt(prompt: string): string {
  const words = prompt.trim().split(/\s+/).slice(0, 6).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const EXAMPLES = [
  "Create a luxury school website with admissions + CRM",
  "Jewelry ecommerce store",
  "Hospital portal",
];

// Static agent roster (matches src/server/ai seed). Rendered immediately so the
// surface never looks empty before a generation runs.
const AGENTS: AiAgent[] = [
  { id: "designer", name: "Designer", description: "Composes layouts, theme tokens and infinite components from the brand brief.", icon: "Palette" },
  { id: "developer", name: "Developer", description: "Wires pages to typed APIs and the generated database schema.", icon: "Code2" },
  { id: "seo", name: "SEO", description: "Generates metadata, sitemaps and structured data for every route.", icon: "Search" },
  { id: "copywriter", name: "Copywriter", description: "Drafts on-brand copy for pages, components and email flows.", icon: "PenLine" },
  { id: "crm", name: "CRM Agent", description: "Builds lead pipelines, contact models and nurture workflows.", icon: "Users" },
  { id: "analytics", name: "Analytics Agent", description: "Instruments events and assembles dashboards from day one.", icon: "BarChart3" },
];

const AGENT_ICON: Record<AiAgent["icon"], LucideIcon> = {
  Palette,
  Code2,
  Search: SearchIcon,
  PenLine,
  Users,
  BarChart3,
};

const STEP_ICON: Record<GenerationStep["layer"], LucideIcon> = {
  analysis: Sparkles,
  database: Database,
  pages: LayoutTemplate,
  components: Boxes,
  workflows: Workflow,
  apis: PlugZap,
  deploy: Rocket,
};

// Five layers generated together — the moat, made explicit under the prompt.
const LAYERS = ["Database", "Pages", "Components", "Workflows", "APIs"];

type Phase = "idle" | "running" | "done";

export default function AiPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1); // index being processed
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<Story | null>(null); // the real generated page

  // Create the real Content story once the timeline completes.
  const finishGeneration = useCallback(async (sourcePrompt: string) => {
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: titleFromPrompt(sourcePrompt), contentType: "page" }),
      });
      if (res.status === 403) throw new Error("Your role can't create content.");
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setStory((await res.json()) as Story);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the generated page");
    }
  }, []);

  const runTimeline = useCallback(
    (plan: GenerationStep[], sourcePrompt: string) => {
      let i = 0;
      const tick = () => {
        setCurrentIndex(i);
        window.setTimeout(() => {
          i += 1;
          if (i < plan.length) {
            tick();
          } else {
            setCurrentIndex(plan.length); // all complete
            setPhase("done");
            void finishGeneration(sourcePrompt);
          }
        }, 500);
      };
      tick();
    },
    [finishGeneration],
  );

  const generate = useCallback(async () => {
    if (!prompt.trim() || phase === "running") return;
    setError(null);
    setPhase("running");
    setSteps([]);
    setStory(null);
    setCurrentIndex(-1);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = (await res.json()) as { steps: GenerationStep[] };
      setSteps(data.steps);
      runTimeline(data.steps, prompt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setPhase("idle");
    }
  }, [prompt, phase, runTimeline]);

  const reset = useCallback(() => {
    setPhase("idle");
    setSteps([]);
    setStory(null);
    setCurrentIndex(-1);
    setError(null);
  }, []);

  return (
    <>
      <Topbar title="AI" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1200px]">
          {/* Hero / prompt */}
          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-accent/10 text-accent">
              <Sparkles className="h-4 w-4" />
            </span>
            <Badge tone="accent" dot>
              One prompt — five layers
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Generate a full product from a single prompt
          </h1>
          <p className="mt-1 max-w-[640px] text-[13px] text-fg-muted">
            Database, Pages, Components, Workflows and APIs are generated together — not as separate
            tools you stitch by hand. Infinite Components means the design system stretches to any
            brief without templates.
          </p>

          {/* Prompt card */}
          <div className="mt-5 rounded-lg border border-border bg-surface p-4">
            <label className="label-caps mb-2 block">Describe what you want to build</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Create a luxury school website with admissions + CRM"
              rows={4}
              disabled={phase === "running"}
              className="w-full resize-none rounded-md border border-border bg-bg px-3 py-2.5 text-[14px] text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-border-strong disabled:opacity-60"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-fg-subtle">Try:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  disabled={phase === "running"}
                  onClick={() => setPrompt(ex)}
                  className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[12px] text-fg-muted transition-colors hover:border-border-strong hover:text-fg disabled:opacity-50"
                >
                  {ex}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-fg-subtle">
                {LAYERS.map((l, i) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span className="font-medium text-fg-muted">{l}</span>
                    {i < LAYERS.length - 1 && <span className="text-fg-subtle">·</span>}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {phase === "done" && (
                  <Button variant="ghost" size="md" onClick={reset}>
                    New generation
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="md"
                  onClick={generate}
                  disabled={!prompt.trim() || phase === "running"}
                >
                  {phase === "running" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" /> Generate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && <p className="mt-2 text-[12px] text-err">{error}</p>}
          </div>

          {/* Timeline + success */}
          {phase !== "idle" && (
            <div className="mt-4 rounded-lg border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="label-caps">Generation plan</p>
                <span className="nums text-[11px] text-fg-subtle">
                  {Math.min(currentIndex < 0 ? 0 : currentIndex, steps.length)}/{steps.length}
                </span>
              </div>

              <ol className="space-y-1">
                {steps.map((step, i) => {
                  const Icon = STEP_ICON[step.layer];
                  const isDone = i < currentIndex;
                  const isActive = i === currentIndex && phase === "running";
                  const isPending = i > currentIndex;
                  return (
                    <li
                      key={step.key}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors",
                        isActive && "bg-surface-2",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-colors",
                          isDone && "border-ok/40 bg-ok/10 text-ok",
                          isActive && "border-accent/40 bg-accent/10 text-accent",
                          isPending && "border-border bg-surface-2 text-fg-subtle",
                        )}
                      >
                        {isDone ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : isActive ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Icon className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-[13px]",
                          isDone && "text-fg-muted",
                          isActive && "font-medium text-fg",
                          isPending && "text-fg-subtle",
                        )}
                      >
                        {step.label}
                      </span>
                      {isDone && (
                        <span className="ml-auto text-[11px] text-ok">Done</span>
                      )}
                      {isActive && (
                        <span className="ml-auto text-[11px] text-accent">Working…</span>
                      )}
                    </li>
                  );
                })}
              </ol>

              {phase === "done" && (
                <div className="mt-4 rounded-md border border-ok/30 bg-ok/10 p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-ok/15 text-ok">
                      <Check className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[14px] font-medium text-fg">Your product is live</p>
                      <p className="mt-0.5 text-[13px] text-fg-muted">
                        All five layers were generated and deployed from one prompt — database
                        schema, pages, infinite components, workflows and APIs, fully wired.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {LAYERS.map((l) => (
                          <Badge key={l} tone="ok" dot>
                            {l}
                          </Badge>
                        ))}
                      </div>
                      {story && (
                        <div className="mt-4 flex items-center gap-3">
                          <Button variant="primary" size="md" onClick={() => router.push(`/content/${story.id}`)}>
                            Open generated page <ArrowUpRight className="h-3.5 w-3.5" />
                          </Button>
                          <span className="text-[12px] text-fg-muted">
                            “{story.name}” added to{" "}
                            <span className="font-mono text-fg-subtle">/content/{story.slug}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI agents */}
          <div className="mt-8">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="label-caps">AI agents</p>
                <p className="mt-1 text-[13px] text-fg-muted">
                  A team of specialised agents builds and maintains every layer together.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {AGENTS.map((agent) => {
                const Icon = AGENT_ICON[agent.icon];
                return (
                  <div
                    key={agent.id}
                    className="group rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid h-8 w-8 place-items-center rounded-md bg-surface-2 text-fg-muted transition-colors group-hover:text-accent">
                        <Icon className="h-4 w-4" />
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-fg-subtle transition-colors group-hover:text-fg" />
                    </div>
                    <p className="mt-3 text-[14px] font-medium text-fg">{agent.name}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
                      {agent.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
