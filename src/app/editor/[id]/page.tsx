"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BlockRenderer } from "@/components/builder/block-renderer";
import { Inspector, type TabKey } from "@/components/editor/inspector";
import { BlockPicker } from "@/components/editor/block-picker";
import { HistoryDrawer } from "@/components/editor/history-drawer";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/cn";
import {
  addChild,
  getNode,
  moveNode,
  type Path,
  pathEq,
  removeNode,
  updateProps,
} from "@/lib/blocks";
import type { BlockNode, ComponentDef, DataBinding, Story } from "@/lib/types";
import {
  ChevronLeft,
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Plus,
  Trash2,
  Layers,
  Check,
  History,
  ArrowUp,
  ArrowDown,
  Rocket,
  CloudUpload,
} from "lucide-react";

const VIEWPORTS = {
  desktop: { icon: Monitor, width: "100%" },
  tablet: { icon: Tablet, width: "768px" },
  mobile: { icon: Smartphone, width: "390px" },
} as const;
type Viewport = keyof typeof VIEWPORTS;

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [tree, setTree] = useState<BlockNode | null>(null);
  const [registry, setRegistry] = useState<ComponentDef[]>([]);
  const [selected, setSelected] = useState<Path | null>(null);
  const [tab, setTab] = useState<TabKey>("design");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<Path | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/content/${id}`).then((r) => r.json()),
      fetch(`/api/components`).then((r) => r.json()),
    ]).then(([s, c]) => {
      setStory(s);
      setTree(s.content);
      setRegistry(c.items);
    });
  }, [id]);

  const selectedNode = useMemo(() => (tree && selected ? getNode(tree, selected) : null), [tree, selected]);
  const selectedDef = registry.find((d) => d.name === selectedNode?.component) ?? null;
  const defFor = (name: string) => registry.find((d) => d.name === name);

  const onProp = (key: string, value: unknown) => {
    if (!tree || !selected) return;
    setTree(updateProps(tree, selected, { [key]: value }));
    setDirty(true);
  };
  const onBinding = (b: DataBinding) => {
    if (!tree || !selected) return;
    setTree(updateProps(tree, selected, { _binding: b }));
    setDirty(true);
  };

  const openPicker = (target: Path) => setPickerTarget(target);
  const addBlock = (name: string) => {
    if (!tree || !pickerTarget) return;
    const def = defFor(name);
    const node: BlockNode = {
      component: name,
      props: Object.fromEntries((def?.fields ?? []).map((f) => [f.key, f.default ?? ""])),
    };
    const next = addChild(tree, pickerTarget, node);
    setTree(next);
    setDirty(true);
    const parentNode = getNode(next, pickerTarget)!;
    setSelected([...pickerTarget, (parentNode.children?.length ?? 1) - 1]);
    setPickerTarget(null);
  };

  const removeSelected = () => {
    if (!tree || !selected) return;
    setTree(removeNode(tree, selected));
    setSelected(null);
    setDirty(true);
  };
  const move = (path: Path, dir: -1 | 1) => {
    if (!tree) return;
    setTree(moveNode(tree, path, dir));
    setDirty(true);
  };

  const save = async () => {
    if (!tree) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/content/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: tree }),
    });
    setSaving(false);
    if (res.status === 403) return setError("You don't have permission to save content.");
    if (!res.ok) return setError(`Save failed (${res.status})`);
    setDirty(false);
    setSavedAt(true);
    setTimeout(() => setSavedAt(false), 1800);
  };

  const publish = async () => {
    if (!tree) return;
    setPublishing(true);
    setError(null);
    const res = await fetch(`/api/content/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: tree, status: "published" }),
    });
    setPublishing(false);
    if (res.status === 403) return setError("You don't have permission to publish.");
    if (!res.ok) return setError(`Publish failed (${res.status})`);
    const updated = (await res.json()) as Story;
    setStory(updated);
    setDirty(false);
  };

  const onRestored = (s: Story) => {
    setStory(s);
    setTree(s.content);
    setSelected(null);
    setDirty(false);
  };

  if (!story || !tree) {
    return <div className="grid flex-1 place-items-center text-[13px] text-fg-muted">Loading editor…</div>;
  }

  const rootIsContainer =
    selected && getNode(tree, selected) && defFor(getNode(tree, selected)!.component)?.allowChildren;

  return (
    <>
      {/* top bar */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-bg px-4">
        <Link href="/content" className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[13px] text-fg-muted hover:bg-surface-2 hover:text-fg">
          <ChevronLeft className="h-4 w-4" /> Content
        </Link>
        <div className="h-4 w-px bg-border" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-medium text-fg">{story.name}</span>
            <StatusPill status={story.status} />
          </div>
          <span className="block truncate font-mono text-[11px] text-fg-subtle">/{story.slug}</span>
        </div>

        <div className="flex-1" />

        {error && <span className="text-[12px] text-err">{error}</span>}

        <div className="flex items-center gap-0.5 rounded-md border border-border bg-surface p-0.5">
          {(Object.keys(VIEWPORTS) as Viewport[]).map((v) => {
            const Icon = VIEWPORTS[v].icon;
            return (
              <button
                key={v}
                onClick={() => setViewport(v)}
                className={cn("grid h-7 w-7 place-items-center rounded", viewport === v ? "bg-surface-3 text-fg" : "text-fg-muted hover:text-fg")}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setHistoryOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] text-fg-muted transition-colors hover:text-fg"
        >
          <History className="h-3.5 w-3.5" /> History
        </button>

        <button
          onClick={save}
          disabled={!dirty && !saving}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
            dirty ? "border border-border bg-surface text-fg hover:border-border-strong" : "border border-border bg-surface text-fg-muted",
          )}
        >
          {savedAt ? <Check className="h-3.5 w-3.5 text-ok" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? "Saving…" : savedAt ? "Saved" : dirty ? "Save" : "Saved"}
        </button>

        <button
          onClick={publish}
          disabled={publishing}
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {publishing ? <CloudUpload className="h-3.5 w-3.5 animate-pulse" /> : <Rocket className="h-3.5 w-3.5" />}
          {publishing ? "Publishing…" : "Publish"}
        </button>
      </div>

      {/* body */}
      <div className="flex min-h-0 flex-1">
        {/* layers */}
        <div className="flex w-[256px] shrink-0 flex-col border-r border-border bg-surface">
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="label-caps flex items-center gap-1.5">
              <Layers className="h-3 w-3" /> Blocks
            </span>
            <button
              onClick={() => openPicker([])}
              title="Add block"
              className="grid h-6 w-6 place-items-center rounded text-fg-muted hover:bg-surface-2 hover:text-fg"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-1.5 pb-3">
            <LayerRow label="Page" depth={0} active={pathEq(selected, [])} onSelect={() => setSelected([])} canAdd onAdd={() => openPicker([])} />
            {(tree.children ?? []).map((c, i) => (
              <LayerBranch
                key={i}
                node={c}
                path={[i]}
                depth={1}
                selected={selected}
                onSelect={setSelected}
                onMove={move}
                onRemove={(p) => {
                  setTree(removeNode(tree, p));
                  setSelected(null);
                  setDirty(true);
                }}
                onAdd={(p) => openPicker(p)}
                label={(n) => defFor(n.component)?.label ?? n.component}
                allowsChildren={(n) => !!defFor(n.component)?.allowChildren}
              />
            ))}
            <button
              onClick={() => openPicker([])}
              className="mt-1 flex w-full items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-1.5 text-[12px] text-fg-muted transition-colors hover:border-accent hover:text-fg"
            >
              <Plus className="h-3.5 w-3.5" /> Add block
            </button>
          </div>
        </div>

        {/* canvas */}
        <div className="flex-1 overflow-y-auto bg-surface-2/40 p-6" onClick={() => setSelected(null)}>
          <div className="mx-auto rounded-lg border border-border bg-bg p-6 shadow-sm transition-all" style={{ maxWidth: VIEWPORTS[viewport].width }}>
            <BlockRenderer node={tree} path={[]} selected={selected} onSelect={setSelected} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                openPicker([]);
              }}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-3 text-[12px] text-fg-muted transition-colors hover:border-accent hover:text-fg"
            >
              <Plus className="h-3.5 w-3.5" /> Add block
            </button>
          </div>
        </div>

        {/* inspector */}
        <div className="relative">
          {selectedNode && (
            <button
              onClick={removeSelected}
              className="absolute right-4 top-2 z-10 flex items-center gap-1 text-[11px] text-fg-muted hover:text-err"
            >
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          )}
          <Inspector node={selectedNode} def={selectedDef} active={tab} onActive={setTab} onProp={onProp} onBinding={onBinding} />
        </div>
      </div>

      <BlockPicker
        open={pickerTarget !== null}
        registry={registry}
        onPick={addBlock}
        onClose={() => setPickerTarget(null)}
        contextLabel={
          pickerTarget && pickerTarget.length && rootIsContainer ? defFor(getNode(tree, pickerTarget)!.component)?.label : "Page"
        }
      />
      <HistoryDrawer open={historyOpen} storyId={id} onClose={() => setHistoryOpen(false)} onRestored={onRestored} />
    </>
  );
}

function LayerRow({
  label,
  depth,
  active,
  onSelect,
  canAdd,
  onAdd,
}: {
  label: string;
  depth: number;
  active: boolean;
  onSelect: () => void;
  canAdd?: boolean;
  onAdd?: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      style={{ paddingLeft: `${8 + depth * 14}px` }}
      className={cn(
        "group flex cursor-pointer items-center gap-2 rounded-md py-1.5 pr-2 text-[13px]",
        active ? "bg-surface-3 font-medium text-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", active ? "bg-accent" : "bg-fg-subtle")} />
      <span className="flex-1 truncate">{label}</span>
      {canAdd && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd?.();
          }}
          className="hidden h-5 w-5 place-items-center rounded text-fg-subtle hover:text-fg group-hover:grid"
        >
          <Plus className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function LayerBranch({
  node,
  path,
  depth,
  selected,
  onSelect,
  onMove,
  onRemove,
  onAdd,
  label,
  allowsChildren,
}: {
  node: BlockNode;
  path: Path;
  depth: number;
  selected: Path | null;
  onSelect: (p: Path) => void;
  onMove: (p: Path, dir: -1 | 1) => void;
  onRemove: (p: Path) => void;
  onAdd: (p: Path) => void;
  label: (n: BlockNode) => string;
  allowsChildren: (n: BlockNode) => boolean;
}) {
  const active = pathEq(selected, path);
  return (
    <>
      <div
        onClick={() => onSelect(path)}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        className={cn(
          "group flex cursor-pointer items-center gap-2 rounded-md py-1.5 pr-1.5 text-[13px]",
          active ? "bg-surface-3 font-medium text-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
        )}
      >
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", active ? "bg-accent" : "bg-fg-subtle")} />
        <span className="flex-1 truncate">{label(node)}</span>
        <span className="hidden items-center gap-0.5 group-hover:flex">
          {allowsChildren(node) && (
            <Handle onClick={(e) => { e.stopPropagation(); onAdd(path); }} title="Add inside"><Plus className="h-3 w-3" /></Handle>
          )}
          <Handle onClick={(e) => { e.stopPropagation(); onMove(path, -1); }} title="Move up"><ArrowUp className="h-3 w-3" /></Handle>
          <Handle onClick={(e) => { e.stopPropagation(); onMove(path, 1); }} title="Move down"><ArrowDown className="h-3 w-3" /></Handle>
          <Handle onClick={(e) => { e.stopPropagation(); onRemove(path); }} title="Remove" danger><Trash2 className="h-3 w-3" /></Handle>
        </span>
      </div>
      {(node.children ?? []).map((c, i) => (
        <LayerBranch
          key={i}
          node={c}
          path={[...path, i]}
          depth={depth + 1}
          selected={selected}
          onSelect={onSelect}
          onMove={onMove}
          onRemove={onRemove}
          onAdd={onAdd}
          label={label}
          allowsChildren={allowsChildren}
        />
      ))}
    </>
  );
}

function Handle({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn("grid h-5 w-5 place-items-center rounded text-fg-subtle hover:text-fg", danger && "hover:text-err")}
    >
      {children}
    </button>
  );
}
