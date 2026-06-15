"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BlockRenderer } from "@/components/builder/block-renderer";
import { PropertiesPanel, type TabKey } from "@/components/builder/properties-panel";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/cn";
import { addChild, getNode, type Path, pathEq, removeNode, updateProps } from "@/lib/blocks";
import type { BlockNode, ComponentDef, Story } from "@/lib/types";
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
} from "lucide-react";

const VIEWPORTS = {
  desktop: { icon: Monitor, width: "100%" },
  tablet: { icon: Tablet, width: "768px" },
  mobile: { icon: Smartphone, width: "390px" },
} as const;
type Viewport = keyof typeof VIEWPORTS;

export default function BuilderPage() {
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
  const [libraryOpen, setLibraryOpen] = useState(false);

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

  const selectedNode = useMemo(
    () => (tree && selected ? getNode(tree, selected) : null),
    [tree, selected],
  );
  const selectedDef = registry.find((d) => d.name === selectedNode?.component) ?? null;
  const defFor = (name: string) => registry.find((d) => d.name === name);

  const onProp = (key: string, value: unknown) => {
    if (!tree || !selected) return;
    setTree(updateProps(tree, selected, { [key]: value }));
    setDirty(true);
  };

  const addBlock = (name: string) => {
    if (!tree) return;
    const def = defFor(name);
    const node: BlockNode = {
      component: name,
      props: Object.fromEntries((def?.fields ?? []).map((f) => [f.key, f.default ?? ""])),
    };
    // add into selected container if it allows children, else to the page root
    const parent: Path =
      selected && getNode(tree, selected) && defFor(getNode(tree, selected)!.component)?.allowChildren
        ? selected
        : [];
    const next = addChild(tree, parent, node);
    setTree(next);
    setDirty(true);
    setLibraryOpen(false);
    const parentNode = getNode(next, parent)!;
    setSelected([...parent, (parentNode.children?.length ?? 1) - 1]);
  };

  const removeSelected = () => {
    if (!tree || !selected) return;
    setTree(removeNode(tree, selected));
    setSelected(null);
    setDirty(true);
  };

  const save = async () => {
    if (!tree) return;
    setSaving(true);
    await fetch(`/api/content/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: tree }),
    });
    setSaving(false);
    setDirty(false);
    setSavedAt(true);
    setTimeout(() => setSavedAt(false), 1800);
  };

  if (!story || !tree) {
    return <div className="grid flex-1 place-items-center text-[13px] text-fg-muted">Loading editor…</div>;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* builder toolbar */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-bg px-4">
        <Link href="/content" className="flex items-center gap-1 text-[13px] text-fg-muted hover:text-fg">
          <ChevronLeft className="h-4 w-4" /> Content
        </Link>
        <div className="h-4 w-px bg-border" />
        <span className="text-[13px] font-medium text-fg">{story.name}</span>
        <StatusPill status={story.status} />

        <div className="flex-1" />

        {/* viewport toggle */}
        <div className="flex items-center gap-0.5 rounded-md border border-border bg-surface p-0.5">
          {(Object.keys(VIEWPORTS) as Viewport[]).map((v) => {
            const Icon = VIEWPORTS[v].icon;
            return (
              <button
                key={v}
                onClick={() => setViewport(v)}
                className={cn(
                  "grid h-7 w-7 place-items-center rounded",
                  viewport === v ? "bg-surface-3 text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>

        <button
          onClick={save}
          disabled={!dirty && !saving}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
            dirty ? "bg-accent text-accent-fg hover:bg-accent-hover" : "border border-border bg-surface text-fg-muted",
          )}
        >
          {savedAt ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? "Saving…" : savedAt ? "Saved" : dirty ? "Save" : "Saved"}
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* block tree */}
        <div className="flex w-[240px] shrink-0 flex-col border-r border-border bg-surface">
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="label-caps flex items-center gap-1.5">
              <Layers className="h-3 w-3" /> Blocks
            </span>
            <button
              onClick={() => setLibraryOpen((v) => !v)}
              className="grid h-6 w-6 place-items-center rounded text-fg-muted hover:bg-surface-2 hover:text-fg"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {libraryOpen && (
            <div className="mx-2 mb-2 rounded-md border border-border bg-bg p-1.5">
              <p className="label-caps px-1.5 pb-1">Add block</p>
              <div className="grid grid-cols-2 gap-1">
                {registry.map((d) => (
                  <button
                    key={d.name}
                    onClick={() => addBlock(d.name)}
                    className="rounded-md border border-border bg-surface px-2 py-1.5 text-left text-[12px] text-fg-muted hover:border-border-strong hover:text-fg"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-1.5 pb-3">
            <TreeRow label="Page" depth={0} active={pathEq(selected, [])} onClick={() => setSelected([])} />
            {(tree.children ?? []).map((c, i) => (
              <TreeBranch
                key={i}
                node={c}
                path={[i]}
                depth={1}
                selected={selected}
                onSelect={setSelected}
                label={(n) => defFor(n.component)?.label ?? n.component}
              />
            ))}
          </div>
        </div>

        {/* canvas */}
        <div className="flex-1 overflow-y-auto bg-surface-2/40 p-6" onClick={() => setSelected(null)}>
          <div
            className="mx-auto rounded-lg border border-border bg-bg p-6 shadow-sm transition-all"
            style={{ maxWidth: VIEWPORTS[viewport].width }}
          >
            <BlockRenderer node={tree} path={[]} selected={selected} onSelect={setSelected} />
          </div>
        </div>

        {/* properties */}
        <div className="relative">
          {selectedNode && (
            <button
              onClick={removeSelected}
              className="absolute right-4 top-2 z-10 flex items-center gap-1 text-[11px] text-fg-muted hover:text-err"
            >
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          )}
          <PropertiesPanel node={selectedNode} def={selectedDef} active={tab} onActive={setTab} onProp={onProp} />
        </div>
      </div>
    </div>
  );
}

function TreeRow({
  label,
  depth,
  active,
  onClick,
}: {
  label: string;
  depth: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{ paddingLeft: `${8 + depth * 14}px` }}
      className={cn(
        "flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left text-[13px]",
        active ? "bg-surface-3 font-medium text-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-accent" : "bg-fg-subtle")} />
      <span className="truncate">{label}</span>
    </button>
  );
}

function TreeBranch({
  node,
  path,
  depth,
  selected,
  onSelect,
  label,
}: {
  node: BlockNode;
  path: Path;
  depth: number;
  selected: Path | null;
  onSelect: (p: Path) => void;
  label: (n: BlockNode) => string;
}) {
  return (
    <>
      <TreeRow label={label(node)} depth={depth} active={pathEq(selected, path)} onClick={() => onSelect(path)} />
      {(node.children ?? []).map((c, i) => (
        <TreeBranch
          key={i}
          node={c}
          path={[...path, i]}
          depth={depth + 1}
          selected={selected}
          onSelect={onSelect}
          label={label}
        />
      ))}
    </>
  );
}
