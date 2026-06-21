"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { getIcon } from "@/lib/icon";
import type { NodeKind, NodeParam, NodeType, Workflow, WorkflowNode, WorkflowRun, WorkflowStatus } from "@/lib/types";
import { SUB_PORTS, SUB_PORT_LABEL, SUB_NODE_PORT, isSubPort, type SubPort } from "@/lib/subnodes";
import { visibleParams } from "@/lib/params";
import { ChevronLeft, ChevronRight, ArrowLeft, Play, Plus, Loader2, Save, Check, Trash2, Spline, X, CircleAlert, ScrollText } from "lucide-react";
import { NodeDetailView } from "./node-detail-view";

const NODE_W = 184;
const NODE_H = 60;

const KIND_COLOR: Record<NodeKind, string> = {
  trigger: "#22c55e",
  logic: "#f59e0b",
  action: "#2563eb",
  integration: "#a78bfa",
  note: "#eab308",
};

// Sticky-note palette (translucent fill + matching border), keyed by the
// node's config.color.
const NOTE_COLORS: Record<string, { bg: string; border: string }> = {
  yellow: { bg: "rgba(234,179,8,0.14)", border: "rgba(234,179,8,0.5)" },
  blue: { bg: "rgba(37,99,235,0.14)", border: "rgba(37,99,235,0.5)" },
  green: { bg: "rgba(34,197,94,0.14)", border: "rgba(34,197,94,0.5)" },
  red: { bg: "rgba(248,113,113,0.14)", border: "rgba(248,113,113,0.5)" },
  purple: { bg: "rgba(167,139,250,0.16)", border: "rgba(167,139,250,0.5)" },
  gray: { bg: "rgba(148,148,148,0.14)", border: "rgba(148,148,148,0.5)" },
};

// Top-level categories of the add-node panel (mirrors n8n's "What happens
// next?" menu). `cats` lists which node-type categories belong to each group.
const PALETTE_GROUPS: Array<{ key: string; label: string; icon: string; desc: string; cats: string[] }> = [
  { key: "ai", label: "AI", icon: "Bot", desc: "Build autonomous agents, summarize or search documents, etc.", cats: ["AI"] },
  { key: "action", label: "Action in an app", icon: "Globe", desc: "Do something in an app or service like Google Sheets, Telegram or Notion", cats: ["Integrations", "Actions"] },
  { key: "data", label: "Data transformation", icon: "Pencil", desc: "Manipulate, filter or convert data", cats: ["Data transformation"] },
  { key: "flow", label: "Flow", icon: "GitBranch", desc: "Branch, merge or loop the flow, etc.", cats: ["Flow"] },
  { key: "core", label: "Core", icon: "Box", desc: "Run code, make HTTP requests, set webhooks, etc.", cats: ["Core", "Notes"] },
  { key: "human", label: "Human review", icon: "CircleCheck", desc: "Request approval via services like Slack and Telegram before making tool calls", cats: ["Human review"] },
  { key: "trigger", label: "Add another trigger", icon: "Zap", desc: "Triggers start your workflow. Workflows can have multiple triggers.", cats: ["Triggers"] },
];

// Order of sub-group headings within a panel (n8n shows Popular first, Other
// last). Unknown headings sort between, in catalog order.
const SUBCAT_ORDER = [
  "Popular", "Agents", "Models", "Chains", "Chat Models", "Memory", "Tools",
  "For beginners", "Other memories", "Recommended Tools", "More tools",
  "Add or remove items", "Combine items", "Convert data", "Miscellaneous",
  "Other AI Nodes", "Other", "",
];

// Heading + intro for each AI Agent sub-port picker (mirrors n8n's panels).
const SUB_PANEL: Record<SubPort, { title: string; banner: string }> = {
  ai_model: {
    title: "Language Models",
    banner:
      "Chat models are designed for interactive conversations and follow instructions well, while text completion models focus on generating continuations of a given text input",
  },
  ai_memory: { title: "Memory", banner: "Memory allows an AI model to remember and reference past interactions with it" },
  ai_tool: { title: "Tools", banner: "Connect tools to let the agent take actions and fetch data." },
};

// Nodes shown in a group in addition to their primary category (n8n cross-lists
// a few — e.g. Webhook / Wait / Execute Sub-workflow appear under Core too).
const CROSS_LIST: Record<string, Array<{ type: string; sub: string }>> = {
  core: [
    { type: "webhook", sub: "Popular" },
    { type: "execute_subworkflow", sub: "Other" },
    { type: "wait", sub: "Other" },
  ],
};

// Output ports for a node type. A single "main" port unless the type declares
// named outputs (If => true/false, Switch => 0..3).
function portsFor(t?: NodeType): Array<{ port: string; topPct: number; color: string }> {
  const outs = t?.outputs;
  if (!outs || outs.length <= 1) return [{ port: "main", topPct: 50, color: "rgba(255,255,255,0.55)" }];
  return outs.map((p, i) => ({
    port: p,
    topPct: ((i + 1) / (outs.length + 1)) * 100,
    color: p === "true" ? "#22c55e" : p === "false" ? "#f87171" : "#a3a3a3",
  }));
}

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
  const [ndvNode, setNdvNode] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [creds, setCreds] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [palQuery, setPalQuery] = useState("");
  const [palGroup, setPalGroup] = useState<string | null>(null);
  const [palActions, setPalActions] = useState<string | null>(null);
  // The AI Agent sub-port whose "+" picker is open (Chat Model / Memory / Tool).
  const [subPicker, setSubPicker] = useState<{ agentId: string; port: SubPort } | null>(null);
  const [subQuery, setSubQuery] = useState("");
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [linkPos, setLinkPos] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ id: string; offX: number; offY: number; el: HTMLElement } | null>(null);
  const connect = useRef<{
    from: string;
    port: string;
    el: HTMLElement;
    subTarget?: { agentId: string; subPort: SubPort };
  } | null>(null);

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

  // Credentials list for credential-picker params.
  useEffect(() => {
    fetch("/api/credentials")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items?: Array<{ id: string; name: string; type: string }> }) => setCreds(d.items ?? []))
      .catch(() => {});
  }, []);

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

  // Drag from an AI Agent sub-port (Chat Model / Memory / Tool) onto a sub-node.
  const startSubConnect = (e: React.MouseEvent, agent: WorkflowNode, subPort: SubPort) => {
    e.stopPropagation();
    const canvas = (e.currentTarget as HTMLElement).closest("[data-canvas]") as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    connect.current = { from: agent.id, port: "sub", el: canvas, subTarget: { agentId: agent.id, subPort } };
    setConnectFrom(agent.id);
    setLinkPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const completeConnect = (to: string) => {
    const c = connect.current;
    if (!c) return;
    // Sub-port drag: attach the released sub-node to the agent's sub-port.
    if (c.subTarget) {
      const { agentId, subPort } = c.subTarget;
      if (to === agentId) return;
      // Only attach a sub-node whose kind matches the port (a Chat Model into
      // ai_model, a Tool into ai_tool, …). Ignore drops on any other node.
      const target = wf?.nodes.find((n) => n.id === to);
      if (!target || SUB_NODE_PORT[target.type] !== subPort) return;
      setWf((prev) => {
        if (!prev) return prev;
        // Chat Model / Memory are single-slot — replace any existing attachment.
        const base =
          subPort === "ai_tool"
            ? prev.connections
            : prev.connections.filter((x) => !(x.to === agentId && x.toPort === subPort));
        if (base.some((x) => x.from === to && x.to === agentId && x.toPort === subPort)) return prev;
        return {
          ...prev,
          connections: [...base, { id: `c_${Date.now().toString(36)}`, from: to, to: agentId, toPort: subPort }],
        };
      });
      return;
    }
    if (c.from === to) return;
    const { from, port } = c;
    setWf((prev) => {
      if (!prev) return prev;
      if (prev.connections.some((x) => x.from === from && x.to === to && (x.fromPort ?? "main") === port)) return prev;
      const conn = { id: `c_${Date.now().toString(36)}`, from, to, ...(port !== "main" ? { fromPort: port } : {}) };
      return { ...prev, connections: [...prev.connections, conn] };
    });
  };

  const addNode = (t: NodeType, overrides?: Record<string, unknown>) => {
    if (!wf) return;
    const config: Record<string, unknown> = {};
    (t.params ?? []).forEach((p) => {
      if (p.default !== undefined) config[p.key] = p.default;
    });
    Object.assign(config, overrides ?? {});
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
    // collapse the add-node panel back to its top level (n8n closes it)
    setPalGroup(null);
    setPalActions(null);
    setPalQuery("");
  };

  // Create a sub-node (Chat Model / Memory / Tool) and attach it to the AI
  // Agent's matching sub-port — what the "+" under each port does in n8n.
  const addSubNode = (agentId: string, port: SubPort, t: NodeType) => {
    setWf((prev) => {
      if (!prev) return prev;
      const agent = prev.nodes.find((n) => n.id === agentId);
      if (!agent) return prev;
      const config: Record<string, unknown> = {};
      (t.params ?? []).forEach((p) => {
        if (p.default !== undefined) config[p.key] = p.default;
      });
      const idx = SUB_PORTS.indexOf(port);
      const id = `n_${Date.now().toString(36)}`;
      const node: WorkflowNode = {
        id, type: t.type, name: t.label, config,
        x: Math.max(0, agent.x + idx * 200 - 120),
        y: agent.y + 180,
      };
      // Chat Model / Memory are single-slot — replace any existing attachment.
      const base =
        port === "ai_tool"
          ? prev.connections
          : prev.connections.filter((c) => !(c.to === agentId && c.toPort === port));
      return {
        ...prev,
        nodes: [...prev.nodes, node],
        connections: [...base, { id: `c_${Date.now().toString(36)}`, from: id, to: agentId, toPort: port }],
      };
    });
    setSubPicker(null);
    setSubQuery("");
  };

  // Click handler for a node row in the add-node panel: app integrations with
  // multiple "actions" drill into a third level; everything else adds directly.
  const pickNode = (t: NodeType) => {
    const opts = t.actionParam ? (t.params?.find((p) => p.key === t.actionParam)?.options ?? []) : [];
    if (t.actionParam && opts.length > 1) {
      setPalActions(t.type);
    } else {
      addNode(t);
    }
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
  const q = palQuery.trim().toLowerCase();
  // Chat Model / Memory / Tool sub-nodes are added from the AI Agent's sub-port
  // "+" picker (not the main panel), so they're excluded here.
  const addable = types.filter((t) => !t.subPort);
  const catGroup = (cat: string) => PALETTE_GROUPS.find((g) => g.cats.includes(cat))?.key;
  const searchHits = q
    ? addable.filter((t) => `${t.label} ${t.category} ${t.description}`.toLowerCase().includes(q))
    : [];
  const groupMeta = PALETTE_GROUPS.find((g) => g.key === palGroup);
  const groupNodes = palGroup ? addable.filter((t) => catGroup(t.category) === palGroup) : [];
  // Sub-group the chosen group's nodes (+ any cross-listed ones), ordered by
  // SUBCAT_ORDER, for the second level of the panel.
  const panelGroups: Array<[string, NodeType[]]> = (() => {
    if (!palGroup) return [];
    const entries: Array<{ t: NodeType; sub: string }> = groupNodes.map((t) => ({ t, sub: t.subcategory ?? "" }));
    for (const x of CROSS_LIST[palGroup] ?? []) {
      const t = typeOf(x.type);
      if (t && !entries.some((e) => e.t.type === t.type)) entries.push({ t, sub: x.sub });
    }
    const m = new Map<string, NodeType[]>();
    for (const e of entries) {
      if (!m.has(e.sub)) m.set(e.sub, []);
      m.get(e.sub)!.push(e.t);
    }
    const idx = (s: string) => {
      const i = SUBCAT_ORDER.indexOf(s);
      return i === -1 ? SUBCAT_ORDER.length - 1 : i;
    };
    return [...m.entries()].sort((a, b) => idx(a[0]) - idx(b[0]));
  })();
  const actionType = palActions ? typeOf(palActions) : null;
  const actionOpts =
    actionType?.actionParam
      ? (actionType.params?.find((p) => p.key === actionType.actionParam)?.options ?? [])
      : [];
  const palBack = () => (palActions ? setPalActions(null) : setPalGroup(null));

  // Sub-port picker: nodes for the open port (ai_model/ai_memory/ai_tool),
  // filtered by its own search and grouped by subgroup.
  const subPickerGroups: Array<[string, NodeType[]]> = (() => {
    if (!subPicker) return [];
    const sq = subQuery.trim().toLowerCase();
    const items = types.filter(
      (t) => t.subPort === subPicker.port && (!sq || `${t.label} ${t.description}`.toLowerCase().includes(sq)),
    );
    const m = new Map<string, NodeType[]>();
    for (const t of items) {
      const k = t.subcategory ?? "";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(t);
    }
    const idx = (s: string) => {
      const i = SUBCAT_ORDER.indexOf(s);
      return i === -1 ? SUBCAT_ORDER.length - 1 : i;
    };
    return [...m.entries()].sort((a, b) => idx(a[0]) - idx(b[0]));
  })();

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
        {/* node palette — n8n-style drill-down ("What happens next?") */}
        <div className="flex w-[320px] shrink-0 flex-col overflow-hidden border-r border-border bg-surface">
          {/* header */}
          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
            {!q && (palGroup || palActions) && (
              <button onClick={palBack} className="text-fg-muted hover:text-fg" aria-label="Back">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <span className="truncate text-[14px] font-semibold text-fg">
              {q ? "Search" : palActions ? actionType?.label : palGroup ? groupMeta?.label : "What happens next?"}
            </span>
          </div>
          {/* search */}
          <div className="shrink-0 px-3 pt-3">
            <input
              value={palQuery}
              onChange={(e) => setPalQuery(e.target.value)}
              placeholder="Search nodes…"
              className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-[12px] text-fg outline-none focus:border-accent"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
            {q ? (
              // flat search across every addable node
              searchHits.length ? (
                searchHits.map((t) => <PaletteNodeRow key={t.type} t={t} onClick={() => pickNode(t)} />)
              ) : (
                <p className="px-2 text-[12px] text-fg-subtle">No nodes match.</p>
              )
            ) : palActions && actionType ? (
              // third level — an integration's actions
              <>
                <p className="px-2 pb-2 text-[12px] text-fg-muted">{actionType.description}</p>
                <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-fg-subtle">
                  Actions ({actionOpts.length})
                </p>
                {actionOpts.map((op) => {
                  const Icon = getIcon(actionType.icon);
                  return (
                    <button
                      key={op}
                      onClick={() => addNode(actionType, { [actionType.actionParam as string]: op })}
                      className="mb-0.5 flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-surface-2"
                    >
                      <span
                        className="grid h-7 w-7 shrink-0 place-items-center rounded"
                        style={{ background: `${KIND_COLOR[actionType.kind]}22`, color: KIND_COLOR[actionType.kind] }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="truncate text-[13px] text-fg">{op}</span>
                    </button>
                  );
                })}
              </>
            ) : palGroup ? (
              // second level — nodes in the chosen group, sub-grouped if defined
              panelGroups.length ? (
                panelGroups.map(([sub, items]) => (
                  <div key={sub || "_"} className="mb-2">
                    {sub && (
                      <p className="px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wide text-fg-subtle">{sub}</p>
                    )}
                    {items.map((t) => (
                      <PaletteNodeRow key={t.type} t={t} onClick={() => pickNode(t)} />
                    ))}
                  </div>
                ))
              ) : (
                <p className="px-2 text-[12px] text-fg-subtle">Nothing here yet.</p>
              )
            ) : (
              // first level — top categories
              PALETTE_GROUPS.map((g, i) => {
                const Icon = getIcon(g.icon);
                return (
                  <button
                    key={g.key}
                    onClick={() => setPalGroup(g.key)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-surface-2",
                      i === PALETTE_GROUPS.length - 1 && "mt-1 border-t border-border pt-3",
                    )}
                  >
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center text-fg-muted">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-fg">{g.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-fg-subtle">{g.desc}</span>
                    </span>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-fg-subtle" />
                  </button>
                );
              })
            )}
          </div>
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
                const isSelEdge = selectedConn === c.id;
                // Sub-node attachment: sub-node (a) → parent agent (b) sub-port,
                // drawn from the agent's bottom up to the sub-node.
                if (isSubPort(c.toPort)) {
                  const idx = SUB_PORTS.indexOf(c.toPort);
                  const px = b.x + (NODE_W * (idx + 0.5)) / 3;
                  const py = b.y + NODE_H + 14;
                  const sx = a.x + NODE_W / 2;
                  const sy = a.y;
                  const sd = `M ${px} ${py} C ${px} ${py + 40}, ${sx} ${sy - 40}, ${sx} ${sy}`;
                  return (
                    <g key={c.id}>
                      <path
                        d={sd}
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
                        d={sd}
                        fill="none"
                        stroke={isSelEdge ? "#f87171" : "rgba(167,139,250,0.65)"}
                        strokeWidth={isSelEdge ? 2.5 : 1.5}
                        strokeDasharray="5 3"
                        style={{ pointerEvents: "none" }}
                      />
                    </g>
                  );
                }
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

            {/* sticky notes — canvas annotations rendered behind the nodes */}
            {wf.nodes
              .filter((n) => n.type === "sticky_note")
              .map((n) => {
                const palette = NOTE_COLORS[String(n.config?.color ?? "yellow")] ?? NOTE_COLORS.yellow;
                const editing = editingNote === n.id;
                const content = String(n.config?.content ?? "");
                return (
                  <div
                    key={n.id}
                    onMouseDown={(e) => {
                      if (editing) return;
                      e.stopPropagation();
                      startDrag(e, n);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingNote(n.id);
                    }}
                    className={cn(
                      "absolute select-none rounded-lg border p-3",
                      selected === n.id ? "ring-1 ring-accent" : "",
                      editing ? "cursor-text" : "cursor-grab active:cursor-grabbing",
                    )}
                    style={{ left: n.x, top: n.y, width: 240, minHeight: 150, background: palette.bg, borderColor: palette.border }}
                  >
                    {editing ? (
                      <textarea
                        autoFocus
                        value={content}
                        onChange={(e) => setNodeConfig(n.id, "content", e.target.value)}
                        onBlur={() => setEditingNote(null)}
                        className="h-[124px] w-full resize-none bg-transparent text-[12px] leading-relaxed text-fg outline-none"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap break-words text-[12px] leading-relaxed text-fg">{content}</p>
                    )}
                  </div>
                );
              })}

            {/* nodes */}
            {wf.nodes
              .filter((n) => n.type !== "sticky_note")
              .map((n) => {
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
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setNdvNode(n.id);
                  }}
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
                  {/* output port(s) — drag to connect. If/Switch expose named ports. */}
                  {portsFor(t).map((p) => (
                    <span
                      key={p.port}
                      title={p.port === "main" ? "Drag to connect" : `${p.port} branch`}
                      onMouseDown={(e) => startConnect(e, n, p.port)}
                      style={{ top: `${p.topPct}%`, background: p.color }}
                      className="absolute -right-1.5 h-3 w-3 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-[#0a0a0a] hover:brightness-125"
                    />
                  ))}
                  {/* branch labels for multi-output nodes */}
                  {(t?.outputs?.length ?? 0) > 1 &&
                    portsFor(t).map((p) => (
                      <span
                        key={`lbl-${p.port}`}
                        style={{ top: `${p.topPct}%` }}
                        className="pointer-events-none absolute right-2 -translate-y-1/2 text-[9px] font-medium text-[#8a8a8a]"
                      >
                        {p.port}
                      </span>
                    ))}
                  {/* input port */}
                  <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-[#0a0a0a] bg-[rgba(255,255,255,0.4)]" />
                  {/* AI Agent sub-ports — drag the dot onto a sub-node, or click
                      "+" to pick & attach one (Chat Model / Memory / Tool) */}
                  {n.type === "ai_agent" && (
                    <div className="absolute inset-x-0 top-full flex justify-around px-1 pt-2">
                      {SUB_PORTS.map((sp) => (
                        <div key={sp} className="flex flex-col items-center gap-1">
                          <button
                            title={`Attach ${SUB_PORT_LABEL[sp]}`}
                            onMouseDown={(e) => startSubConnect(e, n, sp)}
                            className="cursor-crosshair"
                          >
                            <span className="block h-2.5 w-2.5 rounded-full border-2 border-[#0a0a0a] bg-[#a78bfa] hover:brightness-125" />
                          </button>
                          <span className="text-[9px] leading-none text-[#a78bfa]">
                            {SUB_PORT_LABEL[sp]}
                            {sp === "ai_model" && <span className="text-err">*</span>}
                          </span>
                          <button
                            title={`Add ${SUB_PORT_LABEL[sp]}`}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSubPicker({ agentId: n.id, port: sp });
                              setSubQuery("");
                            }}
                            className="grid h-5 w-5 place-items-center rounded border border-[rgba(255,255,255,0.2)] bg-[#1a1a1a] text-[#8a8a8a] hover:border-accent hover:text-accent"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Display Note in Flow — show the node's note as a canvas label */}
                  {Boolean(n.config?._displayNote) && Boolean(n.config?._notes) && n.type !== "ai_agent" && (
                    <div className="pointer-events-none absolute left-0 top-full mt-1 max-w-[220px] rounded bg-[#3a2f0a] px-2 py-1 text-[10px] leading-snug text-[#e9d8a6]">
                      {String(n.config?._notes)}
                    </div>
                  )}
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

              {selType?.params && visibleParams(selType.params, selNode.config).length > 0 && (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <p className="label-caps">Parameters</p>
                  {visibleParams(selType.params, selNode.config).map((p) => (
                    <ParamField
                      key={p.key}
                      param={p}
                      value={selNode.config?.[p.key]}
                      credentials={creds}
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

      {ndvNode &&
        (() => {
          const nd = wf.nodes.find((n) => n.id === ndvNode);
          if (!nd) return null;
          const log = lastRun?.nodeLogs.find((l) => l.nodeId === ndvNode) ?? null;
          return (
            <NodeDetailView
              node={nd}
              nodeType={typeOf(nd.type)}
              runLog={log}
              running={running}
              credentials={creds}
              onChangeName={(name) => setNodeField(nd.id, { name })}
              onChangeConfig={(k, v) => setNodeConfig(nd.id, k, v)}
              onRun={run}
              onClose={() => setNdvNode(null)}
            />
          );
        })()}

      {/* AI Agent sub-port picker — right drawer (Language Models / Memory / Tools) */}
      {subPicker && (
        <div
          className="fixed inset-0 z-[55] flex justify-end bg-black/40"
          onClick={() => {
            setSubPicker(null);
            setSubQuery("");
          }}
        >
          <div
            className="flex h-full w-[380px] flex-col border-l border-border-strong bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
              <span className="text-fg-muted">{(() => { const I = getIcon(subPicker.port === "ai_model" ? "Languages" : subPicker.port === "ai_memory" ? "Brain" : "Wrench"); return <I className="h-4 w-4" />; })()}</span>
              <span className="text-[14px] font-semibold text-fg">{SUB_PANEL[subPicker.port].title}</span>
              <div className="flex-1" />
              <button onClick={() => { setSubPicker(null); setSubQuery(""); }} className="text-fg-muted hover:text-fg" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="shrink-0 px-4 pt-3">
              <input
                value={subQuery}
                onChange={(e) => setSubQuery(e.target.value)}
                placeholder="Search nodes…"
                className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-[12px] text-fg outline-none focus:border-accent"
              />
              <p className="mt-3 rounded-md border border-warn/30 bg-warn/5 px-3 py-2 text-[11px] leading-snug text-fg-muted">
                {SUB_PANEL[subPicker.port].banner}
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
              {subPickerGroups.length ? (
                subPickerGroups.map(([sub, items]) => (
                  <div key={sub || "_"} className="mb-2">
                    {sub && (
                      <p className="px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wide text-fg-subtle">{sub}</p>
                    )}
                    {items.map((t) => (
                      <PaletteNodeRow key={t.type} t={t} onClick={() => addSubNode(subPicker.agentId, subPicker.port, t)} />
                    ))}
                  </div>
                ))
              ) : (
                <p className="px-2 text-[12px] text-fg-subtle">No nodes match.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ParamField({
  param,
  value,
  credentials,
  onChange,
}: {
  param: NodeParam;
  value: unknown;
  credentials?: Array<{ id: string; name: string; type: string }>;
  onChange: (v: unknown) => void;
}) {
  const base =
    "w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none focus:border-accent";

  return (
    <label className="block">
      <span className="mb-1 block text-[12px] text-fg-muted">{param.label}</span>
      {param.type === "credential" ? (
        <select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={base}>
          <option value="">— none —</option>
          {(credentials ?? [])
            .filter((c) => !param.credentialType || c.type === param.credentialType)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
        </select>
      ) : param.type === "textarea" ? (
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

// A node row in the add-node panel: icon + label + description, with a chevron
// for app integrations that drill into an actions sub-level.
function PaletteNodeRow({ t, onClick }: { t: NodeType; onClick: () => void }) {
  const Icon = getIcon(t.icon);
  const hasActions = Boolean(t.actionParam && (t.params?.find((p) => p.key === t.actionParam)?.options?.length ?? 0) > 1);
  return (
    <button
      onClick={onClick}
      className="mb-0.5 flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-surface-2"
    >
      <span
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded"
        style={{ background: `${KIND_COLOR[t.kind]}22`, color: KIND_COLOR[t.kind] }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-fg">{t.label}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-fg-subtle">{t.description}</span>
      </span>
      {hasActions && <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-fg-subtle" />}
    </button>
  );
}
