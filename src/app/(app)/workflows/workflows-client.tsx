"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Workflow as WorkflowIcon, Play, Plus } from "lucide-react";
import { PromptModal } from "@/components/ui/prompt-modal";
import type { WorkflowStatus } from "@/lib/types";

const STATUS_STYLE: Record<WorkflowStatus, { dot: string; text: string; label: string }> = {
  active: { dot: "bg-ok", text: "text-ok", label: "Active" },
  draft: { dot: "bg-fg-subtle", text: "text-fg-muted", label: "Draft" },
  inactive: { dot: "bg-warn", text: "text-warn", label: "Inactive" },
};

export interface WorkflowItem {
  id: string;
  name: string;
  status: WorkflowStatus;
  lastRun: string | null;
  runs: number;
  nodeCount: number;
}

export function WorkflowsClient({ initial }: { initial: WorkflowItem[] }) {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(initial);
  const [createOpen, setCreateOpen] = useState(false);

  const createWorkflow = (name: string) => {
    setWorkflows((prev) => [
      { id: `wf_${Date.now().toString(36)}`, name, status: "draft", lastRun: null, runs: 0, nodeCount: 0 },
      ...prev,
    ]);
    setCreateOpen(false);
  };

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Workflows</h1>
          <p className="mt-1 text-[13px] text-fg-muted">
            Visual automation — triggers, logic and actions. n8n/Boomi power, without the n8n.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-fg transition-colors hover:bg-accent-hover"
        >
          <Plus className="h-3.5 w-3.5" /> New workflow
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {workflows.map((w) => {
          const s = STATUS_STYLE[w.status];
          return (
            <Link
              key={w.id}
              href={`/workflows/${w.id}`}
              className="group rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-surface-2 text-fg-muted group-hover:text-accent">
                  <WorkflowIcon className="h-4 w-4" />
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
                  <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                  <span className={s.text}>{s.label}</span>
                </span>
              </div>
              <p className="mt-3 text-[14px] font-medium text-fg">{w.name}</p>
              <div className="mt-2 flex items-center gap-3 text-[12px] text-fg-muted">
                <span>{w.nodeCount} nodes</span>
                <span className="flex items-center gap-1">
                  <Play className="h-3 w-3" /> <span className="nums">{w.runs.toLocaleString()}</span> runs
                </span>
              </div>
              <p className="mt-1 text-[11px] text-fg-subtle">
                {w.lastRun
                  ? `Last run ${new Date(w.lastRun).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                  : "Never run"}
              </p>
            </Link>
          );
        })}
      </div>

      {createOpen && (
        <PromptModal
          title="Create a new workflow"
          label="Workflow name"
          placeholder="e.g. Lead Router"
          submitLabel="Create workflow"
          onClose={() => setCreateOpen(false)}
          onSubmit={createWorkflow}
        />
      )}
    </div>
  );
}
