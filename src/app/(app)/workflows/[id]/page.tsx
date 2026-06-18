"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { getIcon } from "@/lib/icon";
import type { NodeKind, NodeType, Workflow, WorkflowNode } from "@/lib/types";
import { ChevronLeft, Play, Plus, Loader2 } from "lucide-react";

const NODE_W = 184;
const NODE_H = 60;

const KIND_COLOR: Record<NodeKind, string> = {
  trigger: "#22c55e",
  logic: "#f59e0b",
  action: "#2563eb",
  integration: "#a78bfa",
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function WorkflowCanvasPage() {
  const { id } = useParams<{ id: string }>();
  const [wf, setWf] = useState<Workflow | null>(null);
  const [types, setTypes] = useState<NodeType[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const drag = useRef<{ id: string; offX: number; offY: number; el: HTMLElement } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/workflows/${id}`),
      fetch(`/api/workflows/node-types`).then((r) => r.json()),
    ]).then(async ([wfRes, t]) => {
      const found = wfRes.ok ? ((await wfRes.json()) as Workflow) : null;
      // A freshly-created workflow (or an unknown id) has no server record yet —
      // open an empty draft canvas instead of crashing. The display name is
      // carried over from the workflows list via ?name=.
      const fallbackName =
        new URLSearchParams(window.location.search).get("name") ?? "Untitled workflow";
      setWf(
        found && Array.isArray(found.nodes)
          ? found
          : { id, name: fallbackName, status: "draft", nodes: [], connections: [], lastRun: null, runs: 0 },
      );
      setTypes(t.items);
    });
  }, [id]);

  const typeOf = useCallback((t: string) => types.find((x) => x.type === t), [types]);

  // ---- node dragging ----
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = drag.current;
      if (!d) return;
      // Read the canvas rect fresh each move so scrolling stays accurate.
      const rect = d.el.getBoundingClientRect();
      const x = Math.max(0, e.clientX - rect.left - d.offX);
      const y = Math.max(0, e.clientY - rect.top - d.offY);
      setWf((prev) =>
        prev ? { ...prev, nodes: prev.nodes.map((n) => (n.id === d.id ? { ...n, x, y } : n)) } : prev,
      );
    };
    const onUp = () => (drag.current = null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const startDrag = (e: React.MouseEvent, n: WorkflowNode) => {
    const canvas = (e.currentTarget as HTMLElement).closest("[data-canvas]") as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    // Grab offset = pointer position INSIDE the node, in canvas coordinates.
    drag.current = { id: n.id, offX: e.clientX - rect.left - n.x, offY: e.clientY - rect.top - n.y, el: canvas };
    setSelected(n.id);
  };

  const addNode = (t: NodeType) => {
    if (!wf) return;
    const node: WorkflowNode = {
      id: `n_${wf.nodes.length + 1}_${t.type}`,
      type: t.type,
      name: t.label,
      x: 80 + (wf.nodes.length % 4) * 40,
      y: 360,
    };
    setWf({ ...wf, nodes: [...wf.nodes, node] });
    setSelected(node.id);
  };

  const run = async () => {
    if (!wf || running) return;
    setRunning(true);
    setDoneIds(new Set());
    const order = [...wf.nodes].sort((a, b) => a.x - b.x || a.y - b.y);
    for (const n of order) {
      setRunningId(n.id);
      await delay(420);
      setDoneIds((prev) => new Set(prev).add(n.id));
    }
    setRunningId(null);
    setRunning(false);
  };

  const canvasSize = useMemo(() => {
    if (!wf) return { w: 1200, h: 640 };
    const maxX = Math.max(0, ...wf.nodes.map((n) => n.x + NODE_W));
    const maxY = Math.max(0, ...wf.nodes.map((n) => n.y + NODE_H));
    return { w: Math.max(1200, maxX + 300), h: Math.max(640, maxY + 200) };
  }, [wf]);

  if (!wf) {
    return <div className="grid flex-1 place-items-center text-[13px] text-fg-muted">Loading workflow…</div>;
  }

  const selNode = wf.nodes.find((n) => n.id === selected) ?? null;
  const selType = selNode ? typeOf(selNode.type) : null;
  const grouped = groupByCategory(types);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* toolbar */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-bg px-4">
        <Link href="/workflows" className="flex items-center gap-1 text-[13px] text-fg-muted hover:text-fg">
          <ChevronLeft className="h-4 w-4" /> Workflows
        </Link>
        <div className="h-4 w-px bg-border" />
        <span className="text-[13px] font-medium text-fg">{wf.name}</span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ok">
          <span className="h-1.5 w-1.5 rounded-full bg-ok" /> {wf.status}
        </span>
        <div className="flex-1" />
        <span className="nums text-[12px] text-fg-subtle">{wf.runs.toLocaleString()} runs</span>
        <button
          onClick={run}
          disabled={running}
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          {running ? "Running…" : "Test workflow"}
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* node palette */}
        <div className="w-[220px] shrink-0 overflow-y-auto border-r border-border bg-surface px-2 py-3">
          <p className="label-caps px-1.5 pb-2">Add node</p>
          {grouped.map(([cat, items]) => (
            <div key={cat} className="mb-3">
              <p className="px-1.5 pb-1 text-[11px] text-fg-subtle">{cat}</p>
              {items.map((t) => {
                const Icon = getIcon(t.icon);
                return (
                  <button
                    key={t.type}
                    onClick={() => addNode(t)}
                    className="mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                  >
                    <span
                      className="grid h-6 w-6 shrink-0 place-items-center rounded"
                      style={{ background: `${KIND_COLOR[t.kind]}22`, color: KIND_COLOR[t.kind] }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* canvas */}
        <div className="relative flex-1 overflow-auto bg-[#0a0a0a]" onClick={() => setSelected(null)}>
          <div
            data-canvas
            className="relative"
            style={{
              width: canvasSize.w,
              height: canvasSize.h,
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          >
            {/* connections */}
            <svg className="pointer-events-none absolute inset-0" width={canvasSize.w} height={canvasSize.h}>
              {wf.connections.map((c) => {
                const a = wf.nodes.find((n) => n.id === c.from);
                const b = wf.nodes.find((n) => n.id === c.to);
                if (!a || !b) return null;
                const x1 = a.x + NODE_W;
                const y1 = a.y + NODE_H / 2;
                const x2 = b.x;
                const y2 = b.y + NODE_H / 2;
                const mx = (x1 + x2) / 2;
                const active = doneIds.has(c.from) && (doneIds.has(c.to) || runningId === c.to);
                return (
                  <path
                    key={c.id}
                    d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={active ? "#2563eb" : "rgba(255,255,255,0.18)"}
                    strokeWidth={active ? 2 : 1.5}
                  />
                );
              })}
            </svg>

            {/* nodes */}
            {wf.nodes.map((n) => {
              const t = typeOf(n.type);
              const Icon = getIcon(t?.icon ?? "Box");
              const color = KIND_COLOR[t?.kind ?? "action"];
              const isRun = runningId === n.id;
              const isDone = doneIds.has(n.id);
              return (
                <div
                  key={n.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    startDrag(e, n);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "absolute cursor-grab select-none rounded-lg border bg-[#141414] active:cursor-grabbing",
                    selected === n.id ? "border-accent" : "border-[rgba(255,255,255,0.12)]",
                  )}
                  style={{
                    left: n.x,
                    top: n.y,
                    width: NODE_W,
                    height: NODE_H,
                    boxShadow: isRun ? `0 0 0 2px ${color}, 0 0 22px ${color}66` : undefined,
                  }}
                >
                  <div className="flex h-full items-center gap-2.5 px-3">
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-md"
                      style={{ background: `${color}22`, color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-[#fafafa]">{n.name}</span>
                      <span className="block truncate text-[11px] text-[#8a8a8a]">{t?.label ?? n.type}</span>
                    </span>
                    {isDone && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ok" />}
                  </div>
                  {/* ports */}
                  <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-[#0a0a0a] bg-[rgba(255,255,255,0.4)]" />
                  <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-[#0a0a0a] bg-[rgba(255,255,255,0.4)]" />
                </div>
              );
            })}
          </div>
        </div>

        {/* inspector */}
        <aside className="w-[300px] shrink-0 overflow-y-auto border-l border-border bg-surface p-4">
          {selNode ? (
            <>
              <p className="label-caps mb-3">Node · {selType?.kind}</p>
              <label className="block">
                <span className="mb-1 block text-[12px] text-fg-muted">Name</span>
                <input
                  value={selNode.name}
                  onChange={(e) =>
                    setWf({ ...wf, nodes: wf.nodes.map((n) => (n.id === selNode.id ? { ...n, name: e.target.value } : n)) })
                  }
                  className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none"
                />
              </label>
              <div className="mt-3 rounded-md border border-border bg-bg p-3">
                <p className="text-[12px] font-medium text-fg">{selType?.label}</p>
                <p className="mt-1 text-[12px] text-fg-muted">{selType?.description}</p>
              </div>
              <p className="mt-4 text-[12px] text-fg-subtle">
                Node config (credentials, parameters, expressions) renders here in the full builder.
              </p>
            </>
          ) : (
            <div className="mt-8 text-center">
              <p className="text-[13px] text-fg-muted">Select a node to configure it,</p>
              <p className="text-[13px] text-fg-muted">or add one from the palette.</p>
              <button className="mx-auto mt-4 flex items-center gap-1.5 rounded-md border border-border bg-bg px-3 py-1.5 text-[12px] text-fg-muted">
                <Plus className="h-3.5 w-3.5" /> Drag nodes to reposition
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function groupByCategory(types: NodeType[]): Array<[string, NodeType[]]> {
  const map = new Map<string, NodeType[]>();
  for (const t of types) {
    if (!map.has(t.category)) map.set(t.category, []);
    map.get(t.category)!.push(t);
  }
  return [...map.entries()];
}
