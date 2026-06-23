"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { getIcon } from "@/lib/icon";
import type { NodeKind, NodeParam, NodeType, Workflow, WorkflowNode, WorkflowRun, WorkflowStatus } from "@/lib/types";
import { SUB_PORTS, SUB_PORT_LABEL, SUB_NODE_PORT, isSubPort, type SubPort } from "@/lib/subnodes";
import { visibleParams } from "@/lib/params";
import { convertN8nWorkflow } from "@/lib/n8n-import";
import { ChevronLeft, ChevronRight, ArrowLeft, Play, Plus, Loader2, Save, Check, Trash2, Spline, X, CircleAlert, ScrollText, SlidersHorizontal, LayoutGrid, ZoomIn, ZoomOut, Maximize, Map as MapIcon, Settings2, MoreHorizontal, MoreVertical, Power, PowerOff, Maximize2, Pencil, Replace, Pin, PinOff, Copy, CopyPlus, Wand2, Workflow as WorkflowIcon, BoxSelect, SquareX, StickyNote, Download, Upload, Link2 } from "lucide-react";
import { NodeDetailView } from "./node-detail-view";

const NODE_W = 184;
const NODE_H = 60;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 1.6;

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
  // Canvas tab: the graph editor vs. the run-results panel (n8n's Editor /
  // Executions tabs). Keeps run output off the canvas so it never overlaps the
  // zoom controls / minimap.
  const [tab, setTab] = useState<"editor" | "executions">("editor");
  // Top-right ⋯ workflow menu (import / export / duplicate / rename).
  const [wfMenu, setWfMenu] = useState(false);
  const [importUrlOpen, setImportUrlOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // "Convert from n8n" panel — paste an n8n export object or fetch one by URL.
  const [n8nOpen, setN8nOpen] = useState(false);
  const [n8nText, setN8nText] = useState("");
  const [n8nUrl, setN8nUrl] = useState("");
  const [n8nMsg, setN8nMsg] = useState<string | null>(null);
  const [n8nBusy, setN8nBusy] = useState(false);
  // Which panel is shown as a bottom sheet on mobile (Canva-style); desktop
  // shows both rails permanently and ignores this.
  const [mobileSheet, setMobileSheet] = useState<"palette" | "inspector" | null>(null);
  // Canvas zoom + minimap (touch pinch, buttons, fit-to-view).
  const [zoom, setZoom] = useState(1);
  const [showMinimap, setShowMinimap] = useState(true);
  const [view, setView] = useState({ sl: 0, st: 0, vw: 0, vh: 0 });
  const [settingsOpen, setSettingsOpen] = useState(false);
  // The node whose ⋯ overflow menu is open (from the on-focus action toolbar).
  const [nodeMenu, setNodeMenu] = useState<string | null>(null);
  // Canvas appearance / behaviour settings.
  const [canvasOpts, setCanvasOpts] = useState({ dashed: false, snap: false, grid: "dots" as "dots" | "lines" | "none" });
  const zoomRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinch = useRef<{ lastDist: number; lastMidX: number; lastMidY: number } | null>(null);
  // Drag-to-pan the empty canvas (hand tool); snapRef lets the global move
  // handler read the live snap setting without re-subscribing.
  const pan = useRef<{ x: number; y: number; sl: number; st: number } | null>(null);
  const snapRef = useRef(false);
  useEffect(() => {
    snapRef.current = canvasOpts.snap;
  }, [canvasOpts.snap]);
  // Close the node ⋯ menu whenever the selection changes (incl. deselect).
  useEffect(() => {
    setNodeMenu(null);
  }, [selected]);
  // Always-fresh completeConnect for the global touch listeners (it reads wf).
  const completeConnectRef = useRef<(to: string) => void>(() => {});
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
  // Resizing a sticky note (corner handle).
  const resize = useRef<{ id: string; startX: number; startY: number; w: number; h: number } | null>(null);
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
    // Shared move logic for both mouse and a single dragging finger.
    const moveAt = (clientX: number, clientY: number) => {
      const rz = resize.current;
      if (rz) {
        const z = zoomRef.current;
        const w = Math.max(140, rz.w + (clientX - rz.startX) / z);
        const h = Math.max(90, rz.h + (clientY - rz.startY) / z);
        setWf((prev) =>
          prev ? { ...prev, nodes: prev.nodes.map((n) => (n.id === rz.id ? { ...n, config: { ...(n.config ?? {}), w, h } } : n)) } : prev,
        );
        return;
      }
      const d = drag.current;
      if (d) {
        // Capture the ref locally — release may null drag.current before this
        // updater runs, so the closure must not read the live ref.
        const rect = d.el.getBoundingClientRect();
        const z = zoomRef.current;
        let x = Math.max(0, (clientX - rect.left) / z - d.offX);
        let y = Math.max(0, (clientY - rect.top) / z - d.offY);
        if (snapRef.current) {
          const G = 20;
          x = Math.round(x / G) * G;
          y = Math.round(y / G) * G;
        }
        setWf((prev) =>
          prev ? { ...prev, nodes: prev.nodes.map((n) => (n.id === d.id ? { ...n, x, y } : n)) } : prev,
        );
      } else if (connect.current) {
        const rect = connect.current.el.getBoundingClientRect();
        const z = zoomRef.current;
        setLinkPos({ x: (clientX - rect.left) / z, y: (clientY - rect.top) / z });
      }
    };
    const reset = () => {
      drag.current = null;
      connect.current = null;
      pan.current = null;
      resize.current = null;
      setConnectFrom(null);
      setLinkPos(null);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (pan.current) {
        const el = scrollRef.current;
        if (el) {
          el.scrollLeft = pan.current.sl - (e.clientX - pan.current.x);
          el.scrollTop = pan.current.st - (e.clientY - pan.current.y);
        }
        return;
      }
      moveAt(e.clientX, e.clientY);
    };
    // Touch: only intercept when dragging a node or wiring a connection (one
    // finger). Empty-canvas pan + two-finger pinch are left to native / pinch.
    const onTouchMove = (e: TouchEvent) => {
      if ((drag.current || connect.current || resize.current) && e.touches.length === 1) {
        e.preventDefault();
        moveAt(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      // Wiring by touch: drop onto whatever node is under the finger.
      if (connect.current) {
        const t = e.changedTouches[0];
        const hit = t && (document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null)?.closest("[data-node-id]");
        const id = hit?.getAttribute("data-node-id");
        if (id && connect.current.from !== id) completeConnectRef.current(id);
      }
      reset();
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", reset);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", reset);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", reset);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", reset);
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

  // Pull a single screen point out of a mouse or touch event.
  const ptOf = (e: React.MouseEvent | React.TouchEvent) =>
    "touches" in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };

  const startDrag = (e: React.MouseEvent | React.TouchEvent, n: WorkflowNode) => {
    const p = ptOf(e);
    const canvas = (e.currentTarget as HTMLElement).closest("[data-canvas]") as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    const z = zoomRef.current;
    drag.current = { id: n.id, offX: (p.x - rect.left) / z - n.x, offY: (p.y - rect.top) / z - n.y, el: canvas };
    setSelected(n.id);
    setSelectedConn(null);
  };

  const startConnect = (e: React.MouseEvent | React.TouchEvent, n: WorkflowNode, port = "main") => {
    e.stopPropagation(); // don't start a node drag
    const p = ptOf(e);
    const canvas = (e.currentTarget as HTMLElement).closest("[data-canvas]") as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    connect.current = { from: n.id, port, el: canvas };
    setConnectFrom(n.id);
    const z = zoomRef.current;
    setLinkPos({ x: (p.x - rect.left) / z, y: (p.y - rect.top) / z });
  };

  // Drag from an AI Agent sub-port (Chat Model / Memory / Tool) onto a sub-node.
  const startSubConnect = (e: React.MouseEvent | React.TouchEvent, agent: WorkflowNode, subPort: SubPort) => {
    e.stopPropagation();
    const p = ptOf(e);
    const canvas = (e.currentTarget as HTMLElement).closest("[data-canvas]") as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    connect.current = { from: agent.id, port: "sub", el: canvas, subTarget: { agentId: agent.id, subPort } };
    setConnectFrom(agent.id);
    const z = zoomRef.current;
    setLinkPos({ x: (p.x - rect.left) / z, y: (p.y - rect.top) / z });
  };

  // Begin resizing a sticky note from its corner handle (mouse or touch).
  const startResize = (e: React.MouseEvent | React.TouchEvent, n: WorkflowNode) => {
    e.stopPropagation();
    const p = ptOf(e);
    resize.current = { id: n.id, startX: p.x, startY: p.y, w: Number(n.config?.w ?? 240), h: Number(n.config?.h ?? 150) };
    setSelected(n.id);
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
  completeConnectRef.current = completeConnect;

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

  const duplicateNode = (nodeId: string) => {
    setWf((prev) => {
      if (!prev) return prev;
      const src = prev.nodes.find((n) => n.id === nodeId);
      if (!src) return prev;
      const nid = `n_${Date.now().toString(36)}`;
      const copy: WorkflowNode = { ...src, id: nid, name: `${src.name} copy`, x: src.x + 40, y: src.y + 40, config: { ...(src.config ?? {}) } };
      return { ...prev, nodes: [...prev.nodes, copy] };
    });
  };

  const copyNode = (nodeId: string) => {
    const n = wf?.nodes.find((x) => x.id === nodeId);
    if (n) navigator.clipboard?.writeText(JSON.stringify(n, null, 2)).catch(() => {});
  };

  // "Tidy up": layered left-to-right auto-layout by longest-path depth (DAG).
  const tidyUp = () => {
    setWf((prev) => {
      if (!prev || prev.nodes.length === 0) return prev;
      const depth = new Map<string, number>(prev.nodes.map((n) => [n.id, 0]));
      let changed = true;
      let guard = 0;
      while (changed && guard++ < 2000) {
        changed = false;
        for (const c of prev.connections) {
          if (isSubPort(c.toPort)) continue;
          const d = (depth.get(c.from) ?? 0) + 1;
          if (d > (depth.get(c.to) ?? 0)) {
            depth.set(c.to, d);
            changed = true;
          }
        }
      }
      const cols = new Map<number, string[]>();
      for (const n of prev.nodes) {
        const d = depth.get(n.id) ?? 0;
        if (!cols.has(d)) cols.set(d, []);
        cols.get(d)!.push(n.id);
      }
      const GX = 260;
      const GY = 120;
      const X0 = 80;
      const Y0 = 80;
      const pos = new Map<string, { x: number; y: number }>();
      for (const [d, ids] of cols) ids.forEach((nid, i) => pos.set(nid, { x: X0 + d * GX, y: Y0 + i * GY }));
      return { ...prev, nodes: prev.nodes.map((n) => (pos.has(n.id) ? { ...n, ...pos.get(n.id)! } : n)) };
    });
  };

  // Add a sticky note at the centre of the current viewport (button / "N" key).
  const addNote = useCallback(() => {
    const el = scrollRef.current;
    const z = zoomRef.current;
    let x = 120;
    let y = 120;
    if (el) {
      x = (el.scrollLeft + el.clientWidth / 2) / z - 120;
      y = (el.scrollTop + el.clientHeight / 2) / z - 75;
    }
    const id = `n_${Date.now().toString(36)}`;
    const node: WorkflowNode = {
      id,
      type: "sticky_note",
      name: "Note",
      x: Math.max(0, x),
      y: Math.max(0, y),
      config: { color: "yellow", content: "", w: 240, h: 150 },
    };
    setWf((prev) => (prev ? { ...prev, nodes: [...prev.nodes, node] } : prev));
    setSelected(id);
    setEditingNote(id);
  }, []);

  // Keyboard shortcut: "N" adds a sticky note (when not typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "n" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement?.tagName;
      if (el === "INPUT" || el === "TEXTAREA" || el === "SELECT") return;
      e.preventDefault();
      addNote();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addNote]);

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
        setTab("executions");
        return;
      }
      setLastRun(result);
      // Stay on the editor so the per-node run animation is visible; surface
      // failures on the Executions tab so they aren't missed.
      if (result.status === "error") setTab("executions");
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

  // ---- workflow import / export (⋯ menu) ----

  // Download the canvas as a JSON file (round-trips with "Import from file").
  const exportJson = () => {
    if (!wf) return;
    const data = { name: wf.name, status: wf.status, nodes: wf.nodes, connections: wf.connections };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${wf.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "workflow"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setWfMenu(false);
  };

  // Replace the current canvas with an imported workflow JSON (our export shape:
  // { name?, nodes[], connections[] }). Imports onto the open workflow, like n8n.
  const applyImported = (raw: unknown): boolean => {
    const data = raw as { name?: unknown; nodes?: unknown; connections?: unknown } | null;
    if (!data || !Array.isArray(data.nodes)) {
      alert("Invalid workflow JSON — expected a { nodes, connections } object.");
      return false;
    }
    setWf((prev) =>
      prev
        ? {
            ...prev,
            name: typeof data.name === "string" && data.name.trim() ? data.name : prev.name,
            nodes: data.nodes as WorkflowNode[],
            connections: Array.isArray(data.connections) ? (data.connections as Workflow["connections"]) : [],
          }
        : prev,
    );
    setSelected(null);
    setSelectedConn(null);
    setLastRun(null);
    setTab("editor");
    return true;
  };

  const importFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        applyImported(JSON.parse(String(reader.result)));
      } catch {
        alert("Could not parse the selected file as JSON.");
      }
    };
    reader.readAsText(file);
  };

  const importFromUrl = async () => {
    const url = importUrl.trim();
    if (!url) return;
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(String(r.status));
      if (applyImported(await r.json())) {
        setImportUrlOpen(false);
        setImportUrl("");
      }
    } catch {
      alert("Could not fetch or parse a workflow from that URL.");
    }
  };

  // Convert an n8n workflow (pasted object or fetched URL) into this flow.
  const importFromN8n = async () => {
    setN8nMsg(null);
    setN8nBusy(true);
    try {
      let raw: unknown = null;
      if (n8nText.trim()) {
        raw = JSON.parse(n8nText);
      } else if (n8nUrl.trim()) {
        const r = await fetch(n8nUrl.trim());
        if (!r.ok) throw new Error(String(r.status));
        raw = await r.json();
      } else {
        setN8nMsg("Paste an n8n workflow JSON, or enter a URL.");
        return;
      }
      const converted = convertN8nWorkflow(raw, new Set(types.map((t) => t.type)));
      if (!converted) {
        setN8nMsg("That doesn't look like an n8n workflow export ({ nodes, connections }).");
        return;
      }
      setWf((prev) =>
        prev
          ? { ...prev, name: converted.name, nodes: converted.nodes, connections: converted.connections }
          : prev,
      );
      setSelected(null);
      setSelectedConn(null);
      setLastRun(null);
      setTab("editor");
      setN8nOpen(false);
      setN8nText("");
      setN8nUrl("");
      const warn = converted.unmapped.length
        ? `\n\n${converted.unmapped.length} unsupported node type(s) became “No Operation” — review them:\n• ${converted.unmapped.join("\n• ")}`
        : "";
      alert(
        `Imported ${converted.nodes.length} node(s) and ${converted.connections.length} connection(s) from n8n. Click Save to persist.${warn}`,
      );
    } catch (e) {
      setN8nMsg(
        e instanceof SyntaxError
          ? "Could not parse that as JSON."
          : "Could not fetch or read a workflow from that URL.",
      );
    } finally {
      setN8nBusy(false);
    }
  };

  // Save a copy as a brand-new workflow and open it.
  const duplicateWorkflow = async () => {
    if (!wf) return;
    setWfMenu(false);
    const created = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${wf.name} copy` }),
    })
      .then((r) => (r.ok ? (r.json() as Promise<Workflow>) : null))
      .catch(() => null);
    if (!created?.id) {
      alert("Could not duplicate this workflow.");
      return;
    }
    await fetch(`/api/workflows/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes: wf.nodes, connections: wf.connections }),
    });
    window.location.href = `/workflows/${created.id}`;
  };

  const renameWorkflow = () => {
    if (!wf) return;
    setWfMenu(false);
    const name = window.prompt("Rename workflow", wf.name)?.trim();
    if (name && name !== wf.name) setWf({ ...wf, name });
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
    const maxX = wf ? Math.max(0, ...wf.nodes.map((n) => n.x + NODE_W)) : 0;
    const maxY = wf ? Math.max(0, ...wf.nodes.map((n) => n.y + NODE_H)) : 0;
    // Always keep the canvas larger than the visible viewport so there's room
    // to pan / wheel-scroll even on a big desktop screen with few nodes (native
    // overflow has no scroll range when content fits, which reads as "drag /
    // scroll not working"). `view.vw/vh` are the scroll container's client size.
    const PAD = 800; // breathing room beyond content and beyond the viewport
    const vw = view.vw || 1400;
    const vh = view.vh || 800;
    return { w: Math.max(maxX + PAD, vw + PAD), h: Math.max(maxY + PAD, vh + PAD) };
  }, [wf, view.vw, view.vh]);

  // minimap geometry (preserves the canvas aspect ratio within a small box)
  const mm = useMemo(() => {
    const MAXW = 148;
    const MAXH = 96;
    const s = Math.min(MAXW / Math.max(1, canvasSize.w), MAXH / Math.max(1, canvasSize.h));
    return { s, w: Math.round(canvasSize.w * s), h: Math.round(canvasSize.h * s) };
  }, [canvasSize]);

  // Sync the minimap viewport rectangle from the scroll container.
  const syncView = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setView({ sl: el.scrollLeft, st: el.scrollTop, vw: el.clientWidth, vh: el.clientHeight });
  }, []);

  // Zoom around a focal point (defaults to viewport centre), keeping that point
  // fixed under the cursor/fingers. Scroll is corrected after the sizer resizes.
  const applyZoom = useCallback(
    (next: number, focal?: { x: number; y: number }) => {
      const el = scrollRef.current;
      const target = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
      const prev = zoomRef.current;
      if (!el) {
        zoomRef.current = target;
        setZoom(target);
        return;
      }
      const rect = el.getBoundingClientRect();
      const fx = focal ? focal.x - rect.left : el.clientWidth / 2;
      const fy = focal ? focal.y - rect.top : el.clientHeight / 2;
      const cx = (el.scrollLeft + fx) / prev;
      const cy = (el.scrollTop + fy) / prev;
      zoomRef.current = target;
      setZoom(target);
      requestAnimationFrame(() => {
        el.scrollLeft = cx * target - fx;
        el.scrollTop = cy * target - fy;
        syncView();
      });
    },
    [syncView],
  );

  const fitView = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !wf || wf.nodes.length === 0) return;
    const minX = Math.min(...wf.nodes.map((n) => n.x));
    const minY = Math.min(...wf.nodes.map((n) => n.y));
    const maxX = Math.max(...wf.nodes.map((n) => n.x + NODE_W));
    const maxY = Math.max(...wf.nodes.map((n) => n.y + NODE_H));
    const pad = 56;
    const z = Math.min(
      ZOOM_MAX,
      Math.max(
        ZOOM_MIN,
        Math.min(el.clientWidth / (maxX - minX + pad * 2), el.clientHeight / (maxY - minY + pad * 2)),
      ),
    );
    zoomRef.current = z;
    setZoom(z);
    requestAnimationFrame(() => {
      el.scrollLeft = minX * z - pad;
      el.scrollTop = minY * z - pad;
      syncView();
    });
  }, [wf, syncView]);

  // Pinch-to-zoom (two fingers). Attached natively so we can preventDefault and
  // stop the page from zooming; one-finger pan stays native via touch-action.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = (e: TouchEvent) =>
      Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY) || 1;
    const midOf = (e: TouchEvent) => ({
      x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
      y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
    });
    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const m = midOf(e);
        pinch.current = { lastDist: dist(e), lastMidX: m.x, lastMidY: m.y };
      }
    };
    // Two-finger gesture = pan (midpoint movement) + zoom (distance change).
    // A swipe keeps the finger distance ~constant, so the deadzone makes it pan
    // rather than zoom erratically; a pinch changes distance and zooms.
    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinch.current) return;
      e.preventDefault();
      const elc = scrollRef.current;
      if (!elc) return;
      const rect = elc.getBoundingClientRect();
      const m = midOf(e);
      const d = dist(e);
      const prev = zoomRef.current;
      const target =
        Math.abs(d - pinch.current.lastDist) > 2
          ? Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev * (d / pinch.current.lastDist)))
          : prev;
      const fx = m.x - rect.left;
      const fy = m.y - rect.top;
      const cx = (elc.scrollLeft + fx) / prev;
      const cy = (elc.scrollTop + fy) / prev;
      const panDX = m.x - pinch.current.lastMidX;
      const panDY = m.y - pinch.current.lastMidY;
      pinch.current.lastDist = d;
      pinch.current.lastMidX = m.x;
      pinch.current.lastMidY = m.y;
      zoomRef.current = target;
      setZoom(target);
      requestAnimationFrame(() => {
        elc.scrollLeft = cx * target - fx - panDX;
        elc.scrollTop = cy * target - fy - panDY;
        syncView();
      });
    };
    const onEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinch.current = null;
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [syncView, wf?.id]);

  // Initialise the minimap viewport once the canvas is mounted.
  useEffect(() => {
    syncView();
  }, [syncView, wf?.id, canvasSize.w, canvasSize.h]);

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

  const gridBg: React.CSSProperties =
    canvasOpts.grid === "lines"
      ? {
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }
      : canvasOpts.grid === "dots"
        ? {
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }
        : {};

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* toolbar */}
      <div className="flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b border-border bg-bg px-3 py-2 sm:px-4 md:h-14 md:flex-nowrap md:gap-3 md:py-0">
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
        {lastRun && (
          <button
            onClick={() => setTab("executions")}
            title="View last run"
            className={cn(
              "hidden items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors sm:inline-flex",
              lastRun.status === "success"
                ? "bg-ok/15 text-ok hover:bg-ok/20"
                : lastRun.status === "error"
                  ? "bg-err/15 text-err hover:bg-err/20"
                  : "bg-surface-2 text-fg-muted",
            )}
          >
            {lastRun.status === "success" ? <Check className="h-3 w-3" /> : <CircleAlert className="h-3 w-3" />}
            Last run {lastRun.status}
          </button>
        )}
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

        {/* ⋯ workflow menu — import / export / duplicate / rename (n8n-style) */}
        <div className="relative">
          <button
            onClick={() => setWfMenu((v) => !v)}
            title="More"
            className={cn(
              "grid h-8 w-8 place-items-center rounded-md border border-border transition-colors hover:border-border-strong",
              wfMenu && "border-border-strong bg-surface-2",
            )}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {wfMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setWfMenu(false)} />
              <div className="absolute right-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-lg border border-border-strong bg-surface p-1 shadow-2xl">
                {[
                  { icon: Pencil, label: "Rename", onClick: renameWorkflow },
                  { icon: CopyPlus, label: "Duplicate", onClick: duplicateWorkflow },
                  { icon: Download, label: "Download", onClick: exportJson, divider: true },
                  { icon: Upload, label: "Import from file…", onClick: () => { setWfMenu(false); fileInputRef.current?.click(); } },
                  { icon: Link2, label: "Import from URL…", onClick: () => { setWfMenu(false); setImportUrlOpen(true); } },
                  { icon: WorkflowIcon, label: "Convert from n8n…", onClick: () => { setWfMenu(false); setN8nMsg(null); setN8nOpen(true); }, divider: true },
                ].map((it, i) => {
                  const Ico = it.icon;
                  return (
                    <button
                      key={i}
                      onClick={it.onClick}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[12.5px] text-fg-muted hover:bg-surface-2 hover:text-fg",
                        it.divider && "mt-1 border-t border-border pt-2",
                      )}
                    >
                      <Ico className="h-3.5 w-3.5 shrink-0" /> {it.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        {/* hidden file picker for "Import from file" */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importFromFile(f);
            e.target.value = ""; // allow re-importing the same file
          }}
        />
      </div>

      <div className="relative flex min-h-0 flex-1 lg:overflow-x-auto">
        {/* shared backdrop for the mobile bottom sheets */}
        {mobileSheet && (
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileSheet(null)} />
        )}

        {/* node palette — n8n-style drill-down ("What happens next?") */}
        <div
          className={cn(
            "flex flex-col overflow-hidden bg-surface",
            "lg:w-[320px] lg:shrink-0 lg:border-r lg:border-border",
            "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-50 max-lg:max-h-[78vh] max-lg:rounded-t-2xl max-lg:border max-lg:border-border max-lg:shadow-2xl max-lg:transition-transform max-lg:duration-300",
            mobileSheet === "palette" ? "max-lg:translate-y-0" : "max-lg:translate-y-[110%]",
          )}
        >
          <div className="mx-auto mb-0.5 mt-2 h-1 w-10 shrink-0 rounded-full bg-border-strong lg:hidden" />
          {/* header */}
          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
            {!q && (palGroup || palActions) && (
              <button onClick={palBack} className="text-fg-muted hover:text-fg" aria-label="Back">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <span className="flex-1 truncate text-[14px] font-semibold text-fg">
              {q ? "Search" : palActions ? actionType?.label : palGroup ? groupMeta?.label : "What happens next?"}
            </span>
            <button
              onClick={() => setMobileSheet(null)}
              title="Close"
              className="grid h-7 w-7 shrink-0 place-items-center rounded text-fg-muted hover:bg-surface-2 hover:text-fg lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
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
        <div className="relative flex-1 lg:min-w-[320px]">
        {/* Editor / Executions tabs — centered at the top, like n8n */}
        <div className="pointer-events-none absolute inset-x-0 top-2.5 z-30 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-0.5 rounded-lg border border-border bg-surface/95 p-0.5 shadow-lg backdrop-blur">
            {([
              { key: "editor", label: "Editor", icon: WorkflowIcon },
              { key: "executions", label: "Executions", icon: ScrollText },
            ] as const).map((t) => {
              const Ico = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1 text-[12.5px] font-medium transition-colors",
                    tab === t.key ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  <Ico className="h-3.5 w-3.5" /> {t.label}
                  {t.key === "executions" && lastRun && (
                    <span
                      className={cn(
                        "ml-0.5 h-1.5 w-1.5 rounded-full",
                        lastRun.status === "success" ? "bg-ok" : lastRun.status === "error" ? "bg-err" : "bg-fg-subtle",
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div
          ref={scrollRef}
          onScroll={syncView}
          className="absolute inset-0 cursor-grab overflow-auto bg-[#0a0a0a] active:cursor-grabbing"
          style={{ touchAction: "pan-x pan-y" }}
          onMouseDown={(e) => {
            // Background press → start panning (nodes stopPropagation, so this
            // only fires on empty canvas).
            if (e.button !== 0) return;
            const el = scrollRef.current;
            if (!el) return;
            pan.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop };
          }}
          onClick={() => {
            setSelected(null);
            setSelectedConn(null);
          }}
        >
          <div style={{ width: canvasSize.w * zoom, height: canvasSize.h * zoom }}>
          <div
            data-canvas
            className="relative"
            style={{
              width: canvasSize.w,
              height: canvasSize.h,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              ...gridBg,
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
                      strokeDasharray={canvasOpts.dashed ? "6 4" : undefined}
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
                const noteW = Number(n.config?.w ?? 240);
                const noteH = Number(n.config?.h ?? 150);
                const isSel = selected === n.id;
                return (
                  <div
                    key={n.id}
                    onMouseDown={(e) => {
                      if (editing) return;
                      e.stopPropagation();
                      startDrag(e, n);
                    }}
                    onTouchStart={(e) => {
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
                      "absolute rounded-lg border p-3",
                      isSel ? "z-10 ring-1 ring-accent" : "",
                      editing ? "cursor-text" : "cursor-grab touch-none select-none active:cursor-grabbing",
                    )}
                    style={{ left: n.x, top: n.y, width: noteW, height: noteH, background: palette.bg, borderColor: palette.border }}
                  >
                    {/* on-focus note toolbar: colours + edit + delete */}
                    {isSel && !editing && (
                      <div
                        className="absolute bottom-full left-0 z-30 mb-1.5 flex items-center gap-1 rounded-lg border border-border-strong bg-surface p-1 shadow-xl"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {Object.keys(NOTE_COLORS).map((c) => (
                          <button
                            key={c}
                            title={c}
                            onClick={() => setNodeConfig(n.id, "color", c)}
                            className={cn(
                              "h-5 w-5 rounded-full border border-black/20 transition-transform hover:scale-110",
                              String(n.config?.color ?? "yellow") === c && "ring-2 ring-accent ring-offset-1 ring-offset-surface",
                            )}
                            style={{ background: NOTE_COLORS[c].border }}
                          />
                        ))}
                        <div className="mx-0.5 h-4 w-px bg-border" />
                        <button title="Edit text" onClick={() => setEditingNote(n.id)} className="grid h-6 w-6 place-items-center rounded text-fg-muted hover:bg-surface-2 hover:text-fg">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button title="Delete" onClick={() => deleteNode(n.id)} className="grid h-6 w-6 place-items-center rounded text-fg-muted hover:bg-err/10 hover:text-err">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {editing ? (
                      <textarea
                        autoFocus
                        value={content}
                        onChange={(e) => setNodeConfig(n.id, "content", e.target.value)}
                        onBlur={() => setEditingNote(null)}
                        className="h-full w-full resize-none bg-transparent text-[12px] leading-relaxed text-fg outline-none"
                      />
                    ) : (
                      <p className="h-full overflow-hidden whitespace-pre-wrap break-words text-[12px] leading-relaxed text-fg">
                        {content || <span className="text-fg-subtle">Double-tap to edit…</span>}
                      </p>
                    )}

                    {/* resize handle */}
                    {isSel && !editing && (
                      <div
                        title="Resize"
                        onMouseDown={(e) => startResize(e, n)}
                        onTouchStart={(e) => startResize(e, n)}
                        className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-nwse-resize touch-none rounded-sm border border-border-strong bg-surface"
                      />
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
              const disabled = Boolean(n.config?._disabled);
              const pinned = Boolean(n.config?._pinned);
              const menuItems: Array<{ icon: typeof Play; label: string; onClick: () => void; danger?: boolean; disabled?: boolean; divider?: boolean }> = [
                { icon: Maximize2, label: "Open", onClick: () => setNdvNode(n.id) },
                { icon: Play, label: "Execute step", onClick: () => run() },
                { icon: Pencil, label: "Rename", onClick: () => setNdvNode(n.id) },
                { icon: Replace, label: "Replace", onClick: () => { setMobileSheet("palette"); setPalGroup(null); setPalActions(null); } },
                { icon: disabled ? Power : PowerOff, label: disabled ? "Activate" : "Deactivate", onClick: () => setNodeConfig(n.id, "_disabled", !disabled) },
                { icon: pinned ? PinOff : Pin, label: pinned ? "Unpin" : "Pin", onClick: () => setNodeConfig(n.id, "_pinned", !pinned) },
                { icon: Copy, label: "Copy", onClick: () => copyNode(n.id) },
                { icon: CopyPlus, label: "Duplicate", onClick: () => duplicateNode(n.id) },
                { icon: Wand2, label: "Tidy up workflow", onClick: () => tidyUp(), divider: true },
                { icon: WorkflowIcon, label: "Convert to sub-workflow", onClick: () => {}, disabled: true },
                { icon: BoxSelect, label: "Select all", onClick: () => {}, disabled: true },
                { icon: SquareX, label: "Clear selection", onClick: () => { setSelected(null); setSelectedConn(null); } },
                { icon: Trash2, label: "Delete", onClick: () => deleteNode(n.id), danger: true, divider: true },
              ];
              return (
                <div
                  key={n.id}
                  data-node-id={n.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    startDrag(e, n);
                  }}
                  onTouchStart={(e) => {
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
                    "absolute cursor-grab touch-none select-none rounded-lg border bg-[#141414] transition-shadow active:cursor-grabbing",
                    selected === n.id ? "z-10 border-accent" : "border-[rgba(255,255,255,0.12)]",
                    disabled && "opacity-50",
                  )}
                  style={{
                    left: n.x,
                    top: n.y,
                    width: NODE_W,
                    height: NODE_H,
                    boxShadow: isRun
                      ? `0 0 0 2px ${color}, 0 0 22px ${color}66`
                      : selected === n.id
                        ? "0 0 0 2px var(--accent), 0 0 0 6px rgba(37,99,235,0.20), 0 12px 32px rgba(0,0,0,0.55)"
                        : undefined,
                  }}
                >
                  {/* on-focus action toolbar (n8n-style): quick actions + ⋯ menu */}
                  {selected === n.id && (
                    <div
                      className="absolute bottom-full left-0 z-30 mb-1.5 flex items-center gap-0.5 rounded-lg border border-border-strong bg-surface p-0.5 shadow-xl"
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <NodeTBtn title="Execute step" onClick={() => run()}><Play className="h-3.5 w-3.5" /></NodeTBtn>
                      <NodeTBtn
                        title={disabled ? "Activate step" : "Deactivate step"}
                        active={disabled}
                        onClick={() => setNodeConfig(n.id, "_disabled", !disabled)}
                      >
                        {disabled ? <Power className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
                      </NodeTBtn>
                      <NodeTBtn title="Delete" danger onClick={() => deleteNode(n.id)}><Trash2 className="h-3.5 w-3.5" /></NodeTBtn>
                      <div className="mx-0.5 h-4 w-px bg-border" />
                      <div className="relative">
                        <NodeTBtn title="More actions" active={nodeMenu === n.id} onClick={() => setNodeMenu((m) => (m === n.id ? null : n.id))}>
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </NodeTBtn>
                        {nodeMenu === n.id && (
                          <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-lg border border-border-strong bg-surface p-1 shadow-2xl">
                            {menuItems.map((it, i) => {
                              const Ico = it.icon;
                              return (
                                <button
                                  key={i}
                                  disabled={it.disabled}
                                  onClick={() => {
                                    if (it.disabled) return;
                                    it.onClick();
                                    setNodeMenu(null);
                                  }}
                                  className={cn(
                                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[12.5px]",
                                    it.divider && "mt-1 border-t border-border pt-2",
                                    it.disabled
                                      ? "cursor-not-allowed text-fg-subtle/50"
                                      : it.danger
                                        ? "text-err hover:bg-err/10"
                                        : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                                  )}
                                >
                                  <Ico className="h-3.5 w-3.5 shrink-0" /> {it.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {pinned && (
                    <span className="absolute -right-1.5 -top-1.5 z-10 grid h-4 w-4 place-items-center rounded-full bg-accent text-accent-fg">
                      <Pin className="h-2.5 w-2.5" />
                    </span>
                  )}
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
                      onTouchStart={(e) => startConnect(e, n, p.port)}
                      style={{ top: `${p.topPct}%`, background: p.color }}
                      className="absolute -right-1.5 h-3 w-3 -translate-y-1/2 cursor-crosshair touch-none rounded-full border-2 border-[#0a0a0a] after:absolute after:-inset-2.5 after:content-[''] hover:brightness-125"
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
                            onTouchStart={(e) => startSubConnect(e, n, sp)}
                            className="relative cursor-crosshair touch-none after:absolute after:-inset-2.5 after:content-['']"
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
          </div>
        </div>

        {/* Executions tab — full panel over the canvas (no bottom overlap with
            the zoom controls / minimap). */}
        {tab === "executions" && (
          <div className="absolute inset-0 z-20 overflow-y-auto bg-bg/95 pt-14 backdrop-blur" onClick={(e) => e.stopPropagation()}>
            {lastRun ? (
              <div className="mx-auto max-w-2xl px-4 pb-8">
                <div className="flex items-center gap-2 py-3 text-[13px]">
                  <ScrollText className="h-4 w-4 text-fg-muted" />
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
                  <span className="text-fg-subtle">· {lastRun.durationMs}ms · {lastRun.trigger}</span>
                </div>
                {lastRun.error && (
                  <p className="mb-2 rounded-md border border-err/30 bg-err/5 px-3 py-2 text-[12px] text-err">{lastRun.error}</p>
                )}
                <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
                  {(lastRun.nodeLogs ?? []).map((nl) => (
                    <li key={nl.nodeId} className="px-4 py-2.5">
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
                        <span className="text-fg-subtle">· {nl.itemsIn}→{nl.itemsOut}</span>
                      </div>
                      {nl.messages.length > 0 && (
                        <p className="mt-0.5 pl-5 text-[11px] text-fg-muted">{nl.messages.join(" · ")}</p>
                      )}
                      {nl.error && <p className="mt-0.5 pl-5 text-[11px] text-err">{nl.error}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="grid h-full place-items-center">
                <div className="text-center">
                  <ScrollText className="mx-auto mb-3 h-7 w-7 text-fg-subtle" />
                  <p className="text-[13px] text-fg-muted">No executions yet.</p>
                  <button
                    onClick={() => { setTab("editor"); run(); }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[12px] font-medium text-accent-fg hover:bg-accent-hover"
                  >
                    <Play className="h-3.5 w-3.5" /> Test workflow
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* zoom + canvas controls — pinned to the canvas viewport; hidden on
            mobile while a bottom sheet is open so they don't overlap it */}
        <div
          className={cn(
            "absolute bottom-3 left-3 z-30 flex items-center gap-0.5 rounded-lg border border-border bg-surface/95 p-1 shadow-lg backdrop-blur",
            mobileSheet && "max-lg:hidden",
            tab !== "editor" && "hidden",
          )}
        >
          <button onClick={() => applyZoom(zoomRef.current - 0.15)} title="Zoom out" className="grid h-7 w-7 place-items-center rounded text-fg-muted hover:bg-surface-2 hover:text-fg">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button onClick={() => applyZoom(1)} title="Reset to 100%" className="nums min-w-[42px] rounded px-1 py-1 text-center text-[11px] font-medium text-fg-muted hover:bg-surface-2 hover:text-fg">
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={() => applyZoom(zoomRef.current + 0.15)} title="Zoom in" className="grid h-7 w-7 place-items-center rounded text-fg-muted hover:bg-surface-2 hover:text-fg">
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="mx-0.5 h-4 w-px bg-border" />
          <button onClick={addNote} title="Add note (N)" className="grid h-7 w-7 place-items-center rounded text-fg-muted hover:bg-surface-2 hover:text-fg">
            <StickyNote className="h-4 w-4" />
          </button>
          <button onClick={fitView} title="Fit to view" className="grid h-7 w-7 place-items-center rounded text-fg-muted hover:bg-surface-2 hover:text-fg">
            <Maximize className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowMinimap((v) => !v)}
            title="Toggle minimap"
            className={cn("grid h-7 w-7 place-items-center rounded hover:bg-surface-2 hover:text-fg", showMinimap ? "text-accent" : "text-fg-muted")}
          >
            <MapIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSettingsOpen((v) => !v)}
            title="Canvas settings"
            className={cn("grid h-7 w-7 place-items-center rounded hover:bg-surface-2 hover:text-fg", settingsOpen ? "text-accent" : "text-fg-muted")}
          >
            <Settings2 className="h-4 w-4" />
          </button>

          {settingsOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-56 rounded-lg border border-border-strong bg-surface p-2 shadow-xl">
              <p className="label-caps px-1.5 pb-1.5">Canvas settings</p>

              <button
                onClick={() => setCanvasOpts((o) => ({ ...o, snap: !o.snap }))}
                className="flex w-full items-center justify-between rounded-md px-1.5 py-1.5 text-[12px] text-fg hover:bg-surface-2"
              >
                <span className="flex items-center gap-2"><LayoutGrid className="h-3.5 w-3.5 text-fg-muted" /> Snap to grid</span>
                <span className={cn("h-3.5 w-3.5 rounded border", canvasOpts.snap ? "border-accent bg-accent" : "border-border-strong")}>
                  {canvasOpts.snap && <Check className="h-3 w-3 text-accent-fg" />}
                </span>
              </button>

              <button
                onClick={() => setCanvasOpts((o) => ({ ...o, dashed: !o.dashed }))}
                className="flex w-full items-center justify-between rounded-md px-1.5 py-1.5 text-[12px] text-fg hover:bg-surface-2"
              >
                <span className="flex items-center gap-2"><Spline className="h-3.5 w-3.5 text-fg-muted" /> Dashed connections</span>
                <span className={cn("h-3.5 w-3.5 rounded border", canvasOpts.dashed ? "border-accent bg-accent" : "border-border-strong")}>
                  {canvasOpts.dashed && <Check className="h-3 w-3 text-accent-fg" />}
                </span>
              </button>

              <div className="mt-1 border-t border-border px-1.5 pb-1 pt-2">
                <p className="mb-1.5 text-[11px] text-fg-muted">Grid</p>
                <div className="flex gap-1">
                  {(["dots", "lines", "none"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setCanvasOpts((o) => ({ ...o, grid: g }))}
                      className={cn(
                        "flex-1 rounded-md border px-1.5 py-1 text-[11px] capitalize transition-colors",
                        canvasOpts.grid === g ? "border-accent bg-accent/10 text-fg" : "border-border text-fg-muted hover:text-fg",
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* minimap — pinned to the canvas viewport; tap to recentre; hidden on
            mobile while a bottom sheet is open */}
        {showMinimap && wf.nodes.length > 0 && tab === "editor" && (
          <div
            className={cn(
              "absolute bottom-3 right-3 z-30 cursor-pointer overflow-hidden rounded-lg border border-border bg-[#0a0a0a]/95 shadow-lg backdrop-blur",
              mobileSheet && "max-lg:hidden",
            )}
            style={{ width: mm.w, height: mm.h }}
            onClick={(e) => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const el = scrollRef.current;
              if (!el) return;
              el.scrollLeft = ((e.clientX - r.left) / mm.s) * zoom - el.clientWidth / 2;
              el.scrollTop = ((e.clientY - r.top) / mm.s) * zoom - el.clientHeight / 2;
              syncView();
            }}
          >
            {wf.nodes.map((n) => (
              <span
                key={n.id}
                className={cn("absolute rounded-[1px]", selected === n.id ? "bg-accent" : "bg-[rgba(255,255,255,0.4)]")}
                style={{ left: n.x * mm.s, top: n.y * mm.s, width: NODE_W * mm.s, height: NODE_H * mm.s }}
              />
            ))}
            <span
              className="absolute border border-accent bg-accent/10"
              style={{ left: (view.sl / zoom) * mm.s, top: (view.st / zoom) * mm.s, width: (view.vw / zoom) * mm.s, height: (view.vh / zoom) * mm.s }}
            />
          </div>
        )}
        </div>

        {/* inspector — permanent right rail on desktop, slide-up sheet on mobile */}
        <aside
          className={cn(
            "flex flex-col bg-surface",
            "lg:w-[300px] lg:shrink-0 lg:border-l lg:border-border",
            "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-50 max-lg:max-h-[72vh] max-lg:rounded-t-2xl max-lg:border max-lg:border-border max-lg:shadow-2xl max-lg:transition-transform max-lg:duration-300",
            mobileSheet === "inspector" ? "max-lg:translate-y-0" : "max-lg:translate-y-[110%]",
          )}
        >
          <div className="mx-auto mb-1 mt-2 h-1 w-10 shrink-0 rounded-full bg-border-strong lg:hidden" />
          <div className="flex items-center justify-between border-b border-border px-3 py-2 lg:hidden">
            <span className="text-[13px] font-medium text-fg">Configure</span>
            <button
              onClick={() => setMobileSheet(null)}
              title="Close"
              className="grid h-7 w-7 place-items-center rounded text-fg-muted hover:bg-surface-2 hover:text-fg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
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
          </div>
        </aside>
      </div>

      {/* mobile tool bar — Canva/Picsart-style quick access to the rails */}
      <div className="flex shrink-0 items-center justify-around border-t border-border bg-surface px-2 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 lg:hidden">
        <button
          onClick={() => setMobileSheet((s) => (s === "palette" ? null : "palette"))}
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 rounded-md py-1 text-[10px] font-medium transition-colors",
            mobileSheet === "palette" ? "text-accent" : "text-fg-muted hover:text-fg",
          )}
        >
          <LayoutGrid className="h-5 w-5" /> Nodes
        </button>
        <button
          onClick={() => setMobileSheet((s) => (s === "inspector" ? null : "inspector"))}
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 rounded-md py-1 text-[10px] font-medium transition-colors",
            mobileSheet === "inspector" ? "text-accent" : "text-fg-muted hover:text-fg",
          )}
        >
          <SlidersHorizontal className="h-5 w-5" /> Edit
        </button>
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
            className="flex h-full w-full max-w-[380px] flex-col border-l border-border-strong bg-surface shadow-2xl"
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

      {/* Import from URL — small modal */}
      {importUrlOpen && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4"
          onClick={() => setImportUrlOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border-strong bg-surface p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-fg-muted" />
              <span className="text-[14px] font-semibold text-fg">Import workflow from URL</span>
            </div>
            <input
              autoFocus
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && importFromUrl()}
              placeholder="https://example.com/workflow.json"
              className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none focus:border-accent"
            />
            <p className="mt-2 text-[11px] text-fg-subtle">
              Expects a Flowblok workflow JSON (a <span className="font-mono">{`{ nodes, connections }`}</span> object, e.g. one made with Download).
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setImportUrlOpen(false)}
                className="rounded-md border border-border px-3 py-1.5 text-[13px] text-fg-muted hover:border-border-strong hover:text-fg"
              >
                Cancel
              </button>
              <button
                onClick={importFromUrl}
                disabled={!importUrl.trim()}
                className="rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-50"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert from n8n — paste an n8n export object or fetch it by URL */}
      {n8nOpen && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4"
          onClick={() => setN8nOpen(false)}
        >
          <div
            className="flex max-h-[88vh] w-full max-w-lg flex-col rounded-xl border border-border-strong bg-surface p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center gap-2">
              <WorkflowIcon className="h-4 w-4 text-fg-muted" />
              <span className="text-[14px] font-semibold text-fg">Convert an n8n workflow</span>
            </div>
            <p className="mb-3 text-[11px] leading-snug text-fg-subtle">
              Paste an n8n workflow JSON (Editor → ⋯ → Download, or "Copy" on selected nodes), or fetch one by URL.
              Node types are mapped to their Flowblok equivalents; anything unsupported becomes a "No Operation" node you can swap out.
            </p>

            <textarea
              value={n8nText}
              onChange={(e) => setN8nText(e.target.value)}
              placeholder={`{\n  "name": "My workflow",\n  "nodes": [ … ],\n  "connections": { … }\n}`}
              className="h-44 w-full resize-y rounded-md border border-border bg-bg px-2.5 py-1.5 font-mono text-[12px] text-fg outline-none focus:border-accent"
            />

            <div className="my-3 flex items-center gap-3 text-[11px] text-fg-subtle">
              <span className="h-px flex-1 bg-border" /> or fetch from a URL <span className="h-px flex-1 bg-border" />
            </div>
            <input
              value={n8nUrl}
              onChange={(e) => setN8nUrl(e.target.value)}
              placeholder="https://example.com/n8n-workflow.json"
              className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none focus:border-accent"
            />

            {n8nMsg && <p className="mt-3 rounded-md border border-err/30 bg-err/5 px-3 py-2 text-[12px] text-err">{n8nMsg}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setN8nOpen(false)}
                className="rounded-md border border-border px-3 py-1.5 text-[13px] text-fg-muted hover:border-border-strong hover:text-fg"
              >
                Cancel
              </button>
              <button
                onClick={importFromN8n}
                disabled={n8nBusy || (!n8nText.trim() && !n8nUrl.trim())}
                className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-50"
              >
                {n8nBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Convert &amp; import
              </button>
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

// Small icon button used in the on-focus node action toolbar.
function NodeTBtn({
  children,
  onClick,
  title,
  danger,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "grid h-7 w-7 place-items-center rounded transition-colors",
        danger
          ? "text-fg-muted hover:bg-err/10 hover:text-err"
          : active
            ? "bg-surface-3 text-fg"
            : "text-fg-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
