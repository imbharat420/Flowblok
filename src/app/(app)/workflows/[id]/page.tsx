"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { getIcon } from "@/lib/icon";
import type { NodeKind, NodeParam, NodeType, Workflow, WorkflowNode, WorkflowRun, WorkflowStatus } from "@/lib/types";
import { ChevronLeft, Play, Plus, Loader2, Save, Check, Trash2, Spline, X, CircleAlert, ScrollText } from "lucide-react";

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
  const [selectedConn, setSelectedConn] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [lastRun, setLastRun] = useState<WorkflowRun | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [linkPos, setLinkPos] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ id: string; offX: number; offY: number; el: HTMLElement } | null>(null);
  const connect = useRef<{ from: string; port: string; el: HTMLElement } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/workflows/${id}`),
      fetch(`/api/workflows/node-types`).then((r) => r.json()),
    ]).then(async ([wfRes, t]) => {
      setTypes(t.items);
      const found = wfRes.ok ? ((await wfRes.json()) as Workflow) : null;
      if (found && Array.isArray(found.nodes)) {
        setWf(found);
        return;
      }
      // Unknown / stale id (e.g. created in a previous server session that has
      // since reset). Create a fresh PERSISTED workflow so Save/Test actually
      // work, and adopt its id — instead of an unsaved client-only draft.
      const fallbackName =
        new URLSearchParams(window.location.search).get("name") ?? "Untitled workflow";
      const created = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fallbackName }),
      })
        .then((r) => (r.ok ? (r.json() as Promise<Workflow>) : null))
        .catch(() => null);
      if (created && Array.isArray(created.nodes)) {
        setWf(created);
        window.history.replaceState(null, "", `/workflows/${created.id}`);
      } else {
        setWf({ id, name: fallbackName, status: "draft", nodes: [], connections: [], lastRun: null, runs: 0 });
      }
    });
  }, [id]);

  const typeOf = useCallback((t: string) => types.find((x) => x.type === t), [types]);

  // ---- node dragging + connection dragging (shared global listeners) ----
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = drag.current;
      if (d) {
        // Capture the ref locally — mouseup may null drag.current before this
        // updater runs, so the closure must not read the live ref.
        const rect = d.el.getBoundingClientRect();
        const x = Math.max(0, e.clientX - rect.left - d.offX);
        const y = Math.max(0, e.clientY - rect.top - d.offY);
        setWf((prev) =>
          prev ? { ...prev, nodes: prev.nodes.map((n) => (n.id === d.id ? { ...n, x, y } : n)) } : prev,
        );
      } else if (connect.current) {
        const rect = connect.current.el.getBoundingClientRect();
        setLinkPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };
    const onUp = () => {
      drag.current = null;
      connect.current = null;
      setConnectFrom(null);
      setLinkPos(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // ---- delete with keyboard ----
  const deleteNode = useCallback((nodeId: string) => {
    setWf((prev) =>
      prev
        ? {
            ...prev,
            nodes: prev.nodes.filter((n) => n.id !== nodeId),
            connections: prev.connections.filter((c) => c.from !== nodeId && c.to !== nodeId),
          }
        : prev,
    );
    setSelected((s) => (s === nodeId ? null : s));
  }, []);

  const deleteConn = useCallback((connId: string) => {
    setWf((prev) => (prev ? { ...prev, connections: prev.connections.filter((c) => c.id !== connId) } : prev));
    setSelectedConn((s) => (s === connId ? null : s));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const el = document.activeElement?.tagName;
      if (el === "INPUT" || el === "TEXTAREA" || el === "SELECT") return; // don't hijack typing
      if (selectedConn) {
        e.preventDefault();
        deleteConn(selectedConn);
      } else if (selected) {
        e.preventDefault();
        deleteNode(selected);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, selectedConn, deleteNode, deleteConn]);

  const startDrag = (e: React.MouseEvent, n: WorkflowNode) => {
    const canvas = (e.currentTarget as HTMLElement).closest("[data-canvas]") as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    drag.current = { id: n.id, offX: e.clientX - rect.left - n.x, offY: e.clientY - rect.top - n.y, el: canvas };
    setSelected(n.id);
    setSelectedConn(null);
  };

  const startConnect = (e: React.MouseEvent, n: WorkflowNode, port = "main") => {
    e.stopPropagation(); // don't start a node drag
    const canvas = (e.currentTarget as HTMLElement).closest("[data-canvas]") as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    connect.current = { from: n.id, port, el: canvas };
    setConnectFrom(n.id);
    setLinkPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const completeConnect = (to: string) => {
    const c = connect.current;
    if (!c || c.from === to) return;
    const { from, port } = c;
    setWf((prev) => {
      if (!prev) return prev;
      if (prev.connections.some((x) => x.from === from && x.to === to && (x.fromPort ?? "main") === port)) return prev;
      const conn = { id: `c_${Date.now().toString(36)}`, from, to, ...(port !== "main" ? { fromPort: port } : {}) };
      return { ...prev, connections: [...prev.connections, conn] };
    });
  };

  const addNode = (t: NodeType) => {
    if (!wf) return;
    const config: Record<string, unknown> = {};
    (t.params ?? []).forEach((p) => {
      if (p.default !== undefined) config[p.key] = p.default;
    });
    const node: WorkflowNode = {
      id: `n_${Date.now().toString(36)}`,
      type: t.type,
      name: t.label,
      x: 80 + (wf.nodes.length % 4) * 40,
      y: 360,
      config,
    };
    setWf({ ...wf, nodes: [...wf.nodes, node] });
    setSelected(node.id);
    setSelectedConn(null);
  };

  const setNodeField = (nodeId: string, patch: Partial<WorkflowNode>) => {
    setWf((prev) =>
      prev ? { ...prev, nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, ...patch } : n)) } : prev,
    );
  };

  const setNodeConfig = (nodeId: string, key: string, value: unknown) => {
    setWf((prev) =>
      prev
        ? {
            ...prev,
            nodes: prev.nodes.map((n) =>
              n.id === nodeId ? { ...n, config: { ...(n.config ?? {}), [key]: value } } : n,
            ),
          }
        : prev,
    );
  };

  // Real execution: persist the canvas, run it through the engine, then replay
  // the per-node run log visually.
  const run = async () => {
    if (!wf || running) return;
    setRunning(true);
    setDoneIds(new Set());
    setRunningId(null);
    try {
      await fetch(`/api/workflows/${wf.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: wf.name, status: wf.status, nodes: wf.nodes, connections: wf.connections }),
      });
      const res = await fetch(`/api/workflows/${wf.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: {} }),
      });
      const result = (await res.json().catch(() => null)) as (WorkflowRun & { error?: string }) | null;
      if (!res.ok || !result || !Array.isArray(result.nodeLogs)) {
        const now = new Date().toISOString();
        setLastRun({
          id: "run_err",
          workflowId: wf.id,
          status: "error",
          trigger: "manual",
          startedAt: now,
          finishedAt: now,
          durationMs: 0,
          nodeLogs: [],
          error: result?.error ?? `Run failed (HTTP ${res.status})`,
        });
        setLogOpen(true);
        return;
      }
      setLastRun(result);
      setLogOpen(true);
      for (const nl of result.nodeLogs) {
        setRunningId(nl.nodeId);
        await delay(260);
        setDoneIds((prev) => new Set(prev).add(nl.nodeId));
      }
    } finally {
      setRunningId(null);
      setRunning(false);
    }
  };

  // Persist the whole canvas (name, status, nodes, connections).
  const save = async () => {
    if (!wf || saving) return;
    setSaving(true);
    const res = await fetch(`/api/workflows/${wf.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: wf.name, status: wf.status, nodes: wf.nodes, connections: wf.connections }),
    });
    setSaving(false);
    if (res.ok) {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    }
  };

  // Activate / pause — persists immediately, like n8n's active toggle.
  const setStatus = async (status: WorkflowStatus) => {
    if (!wf) return;
    setWf({ ...wf, status });
    await fetch(`/api/workflows/${wf.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
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
  const selConn = wf.connections.find((c) => c.id === selectedConn) ?? null;
  const connectSrc = connectFrom ? wf.nodes.find((n) => n.id === connectFrom) : null;
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
        <button
          onClick={() => setStatus(wf.status === "active" ? "inactive" : "active")}
          title="Toggle active"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] font-medium capitalize transition-colors hover:border-border-strong"
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              wf.status === "active" ? "bg-ok" : wf.status === "inactive" ? "bg-warn" : "bg-fg-subtle",
            )}
          />
          <span className={wf.status === "active" ? "text-ok" : "text-fg-muted"}>{wf.status}</span>
        </button>
        <div className="flex-1" />
        <span className="nums text-[12px] text-fg-subtle">{wf.runs.toLocaleString()} runs</span>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-fg transition-colors hover:border-border-strong disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : savedFlash ? (
            <Check className="h-3.5 w-3.5 text-ok" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {saving ? "Saving…" : savedFlash ? "Saved" : "Save"}
        </button>
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
        <div
          className="relative flex-1 overflow-auto bg-[#0a0a0a]"
          onClick={() => {
            setSelected(null);
            setSelectedConn(null);
          }}
        >
          <div
            data-canvas
            className="relative"
            style={{
              width: canvasSize.w,
              height: canvasSize.h,
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
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
                const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
                const active = doneIds.has(c.from) && (doneIds.has(c.to) || runningId === c.to);
                const isSel = selectedConn === c.id;
                return (
                  <g key={c.id}>
                    {/* wide invisible hit target so the thin edge is easy to click */}
                    <path
                      d={d}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={14}
                      style={{ pointerEvents: "stroke", cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedConn(c.id);
                        setSelected(null);
                      }}
                    />
                    <path
                      d={d}
                      fill="none"
                      stroke={
                        isSel
                          ? "#f87171"
                          : active
                            ? "#2563eb"
                            : c.fromPort === "true"
                              ? "rgba(34,197,94,0.55)"
                              : c.fromPort === "false"
                                ? "rgba(248,113,113,0.55)"
                                : "rgba(255,255,255,0.18)"
                      }
                      strokeWidth={isSel ? 2.5 : active ? 2 : 1.5}
                      style={{ pointerEvents: "none" }}
                    />
                  </g>
                );
              })}
              {/* live link being dragged */}
              {connectSrc && linkPos && (
                <path
                  d={`M ${connectSrc.x + NODE_W} ${connectSrc.y + NODE_H / 2} L ${linkPos.x} ${linkPos.y}`}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  style={{ pointerEvents: "none" }}
                />
              )}
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
                  onMouseUp={() => {
                    if (connect.current && connect.current.from !== n.id) completeConnect(n.id);
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
                  {/* output port(s) — drag to connect. If exposes true/false. */}
                  {n.type === "if" ? (
                    <>
                      <span
                        title="True branch"
                        onMouseDown={(e) => startConnect(e, n, "true")}
                        className="absolute -right-1.5 top-1/3 h-3 w-3 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-[#0a0a0a] bg-ok hover:brightness-125"
                      />
                      <span
                        title="False branch"
                        onMouseDown={(e) => startConnect(e, n, "false")}
                        className="absolute -right-1.5 top-2/3 h-3 w-3 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-[#0a0a0a] bg-err hover:brightness-125"
                      />
                    </>
                  ) : (
                    <span
                      title="Drag to connect"
                      onMouseDown={(e) => startConnect(e, n, "main")}
                      className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-[#0a0a0a] bg-[rgba(255,255,255,0.55)] hover:bg-accent"
                    />
                  )}
                  {/* input port */}
                  <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-[#0a0a0a] bg-[rgba(255,255,255,0.4)]" />
                </div>
              );
            })}
          </div>

          {lastRun && logOpen && (
            <div
              className="absolute inset-x-0 bottom-0 z-20 max-h-[45%] overflow-y-auto border-t border-border-strong bg-surface/95 backdrop-blur"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface px-4 py-2">
                <div className="flex items-center gap-2 text-[12px]">
                  <ScrollText className="h-3.5 w-3.5 text-fg-muted" />
                  <span className="font-medium text-fg">Last run</span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium capitalize",
                      lastRun.status === "success"
                        ? "bg-ok/15 text-ok"
                        : lastRun.status === "error"
                          ? "bg-err/15 text-err"
                          : "bg-surface-2 text-fg-muted",
                    )}
                  >
                    {lastRun.status}
                  </span>
                  <span className="text-fg-subtle">
                    · {lastRun.durationMs}ms · {lastRun.trigger}
                  </span>
                </div>
                <button
                  onClick={() => setLogOpen(false)}
                  className="text-fg-muted hover:text-fg"
                  aria-label="Close run log"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {lastRun.error && (
                <p className="border-b border-err/30 bg-err/5 px-4 py-2 text-[12px] text-err">{lastRun.error}</p>
              )}
              <ul className="divide-y divide-border">
                {(lastRun.nodeLogs ?? []).map((nl) => (
                  <li key={nl.nodeId} className="px-4 py-2">
                    <div className="flex items-center gap-2 text-[12px]">
                      {nl.status === "success" ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-ok" />
                      ) : nl.status === "error" ? (
                        <CircleAlert className="h-3.5 w-3.5 shrink-0 text-err" />
                      ) : (
                        <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-fg-subtle" />
                      )}
                      <span className="font-medium text-fg">{nl.nodeName}</span>
                      <span className="font-mono text-[11px] text-fg-subtle">{nl.nodeType}</span>
                      <span className="text-fg-subtle">
                        · {nl.itemsIn}→{nl.itemsOut}
                      </span>
                    </div>
                    {nl.messages.length > 0 && (
                      <p className="mt-0.5 pl-5 text-[11px] text-fg-muted">{nl.messages.join(" · ")}</p>
                    )}
                    {nl.error && <p className="mt-0.5 pl-5 text-[11px] text-err">{nl.error}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* inspector */}
        <aside className="w-[300px] shrink-0 overflow-y-auto border-l border-border bg-surface p-4">
          {selNode ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="label-caps">Node · {selType?.kind}</p>
                <button
                  onClick={() => deleteNode(selNode.id)}
                  title="Delete node"
                  className="flex items-center gap-1 rounded-md border border-err/40 px-2 py-1 text-[11px] font-medium text-err transition-colors hover:bg-err/10"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
              <label className="block">
                <span className="mb-1 block text-[12px] text-fg-muted">Name</span>
                <input
                  value={selNode.name}
                  onChange={(e) => setNodeField(selNode.id, { name: e.target.value })}
                  className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none focus:border-accent"
                />
              </label>

              {selType?.params && selType.params.length > 0 && (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <p className="label-caps">Parameters</p>
                  {selType.params.map((p) => (
                    <ParamField
                      key={p.key}
                      param={p}
                      value={selNode.config?.[p.key]}
                      onChange={(v) => setNodeConfig(selNode.id, p.key, v)}
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 rounded-md border border-border bg-bg p-3">
                <p className="text-[12px] font-medium text-fg">{selType?.label}</p>
                <p className="mt-1 text-[12px] text-fg-muted">{selType?.description}</p>
              </div>
            </>
          ) : selConn ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="label-caps">Connection</p>
                <button
                  onClick={() => deleteConn(selConn.id)}
                  className="flex items-center gap-1 rounded-md border border-err/40 px-2 py-1 text-[11px] font-medium text-err transition-colors hover:bg-err/10"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
              <div className="space-y-2 rounded-md border border-border bg-bg p-3 text-[12px]">
                <div className="flex items-center gap-2">
                  <Spline className="h-3.5 w-3.5 text-fg-subtle" />
                  <span className="text-fg-muted">
                    {wf.nodes.find((n) => n.id === selConn.from)?.name ?? selConn.from}
                    <span className="px-1 text-fg-subtle">→</span>
                    {wf.nodes.find((n) => n.id === selConn.to)?.name ?? selConn.to}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-fg-subtle">Press Delete to remove, or click another item.</p>
            </>
          ) : (
            <div className="mt-8 text-center">
              <p className="text-[13px] text-fg-muted">Select a node to configure it,</p>
              <p className="text-[13px] text-fg-muted">or add one from the palette.</p>
              <div className="mx-auto mt-4 flex max-w-[220px] flex-col gap-1.5 text-left text-[11px] text-fg-subtle">
                <span className="flex items-center gap-1.5">
                  <Plus className="h-3 w-3" /> Click a node in the palette to add it
                </span>
                <span className="flex items-center gap-1.5">
                  <Spline className="h-3 w-3" /> Drag the right dot of a node to connect
                </span>
                <span className="flex items-center gap-1.5">
                  <Trash2 className="h-3 w-3" /> Select + press Delete to remove
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function ParamField({
  param,
  value,
  onChange,
}: {
  param: NodeParam;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const base =
    "w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none focus:border-accent";

  return (
    <label className="block">
      <span className="mb-1 block text-[12px] text-fg-muted">{param.label}</span>
      {param.type === "textarea" ? (
        <textarea
          rows={4}
          value={String(value ?? param.default ?? "")}
          placeholder={param.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(base, "resize-y font-mono text-[12px]")}
        />
      ) : param.type === "select" ? (
        <select
          value={String(value ?? param.default ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        >
          {(param.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : param.type === "boolean" ? (
        <input
          type="checkbox"
          checked={Boolean(value ?? param.default)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
      ) : param.type === "number" ? (
        <input
          type="number"
          value={value === undefined || value === null ? String(param.default ?? "") : String(value)}
          placeholder={param.placeholder}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className={base}
        />
      ) : (
        <input
          type="text"
          value={String(value ?? param.default ?? "")}
          placeholder={param.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      )}
      {param.hint && <span className="mt-1 block text-[11px] text-fg-subtle">{param.hint}</span>}
    </label>
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
