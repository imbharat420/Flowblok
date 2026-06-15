"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";
import type { ComponentDef, FieldDef, FieldType } from "@/lib/types";
import {
  Blocks,
  Boxes,
  Heading,
  Image as ImageIcon,
  Infinity as InfinityIcon,
  LayoutGrid,
  MousePointerClick,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Square,
  Type,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface ComponentsResponse {
  items: ComponentDef[];
}

// Small inline icon map (lucide name -> component). Generic fallback for unknowns.
const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Heading,
  Type,
  LayoutGrid,
  MousePointerClick,
  Image: ImageIcon,
  ShoppingBag,
  Square,
};
function iconFor(name: string): LucideIcon {
  return ICON_MAP[name] ?? Boxes;
}

const CATEGORY_TONE: Record<ComponentDef["category"], BadgeTone> = {
  layout: "info",
  content: "neutral",
  media: "accent",
  action: "warn",
  commerce: "ok",
};

const FIELD_TONE: Record<FieldType, BadgeTone> = {
  text: "neutral",
  textarea: "neutral",
  number: "info",
  color: "accent",
  select: "warn",
  boolean: "ok",
};

const CATEGORY_LABEL: Record<ComponentDef["category"], string> = {
  layout: "Layout",
  content: "Content",
  media: "Media",
  action: "Action",
  commerce: "Commerce",
};

export default function ComponentsPage() {
  const { can } = useAuth();
  const canEdit = can("edit_components");

  const [data, setData] = useState<ComponentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ComponentDef["category"] | "all">("all");
  const [active, setActive] = useState<ComponentDef | null>(null);

  useEffect(() => {
    fetch("/api/components")
      .then((r) => r.json())
      .then((d: ComponentsResponse) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const items = data?.items ?? [];

  const categories = useMemo(
    () => [...new Set(items.map((c) => c.category))].sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((c) => {
      const matchesSearch =
        !q ||
        c.label.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q);
      const matchesCategory = category === "all" || c.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  const fieldColumns: Column<FieldDef>[] = [
    {
      key: "label",
      header: "Field",
      render: (f) => (
        <span className="font-medium text-fg">
          {f.label}
          {(f.type === "select" || f.type === "boolean") && f.default !== undefined && (
            <span className="ml-2 font-mono text-[11px] text-fg-subtle">
              = {String(f.default)}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "key",
      header: "Key",
      render: (f) => <span className="font-mono text-[12px] text-fg-muted">{f.key}</span>,
    },
    {
      key: "type",
      header: "Type",
      align: "right",
      render: (f) => (
        <Badge tone={FIELD_TONE[f.type]} dot>
          {f.type}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <Topbar title="Components" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1200px]">
          <PageHeader
            title="Components"
            description="The block library that powers the visual builder. Define a schema once, reuse it everywhere."
            actions={
              <Button variant="primary" disabled={!canEdit} title={canEdit ? undefined : "Requires edit_components"}>
                <Plus className="h-3.5 w-3.5" /> Create component
              </Button>
            }
          />

          {/* Infinite Components moat callout */}
          <div className="mb-6 overflow-hidden rounded-lg border border-accent/30 bg-accent/5">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                <InfinityIcon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-semibold text-fg">Infinite Components</p>
                  <Badge tone="accent" dot>
                    AI
                  </Badge>
                </div>
                <p className="mt-1 max-w-[640px] text-[13px] text-fg-muted">
                  Describe a block in plain language and generate a fully-typed component with its field
                  schema — instantly. No fixed cap, no per-component pricing. Competitors ship a capped
                  library; Flowblok ships an unlimited one.
                </p>
              </div>
              <Button
                variant="primary"
                disabled={!canEdit}
                title={canEdit ? undefined : "Requires edit_components"}
                className="shrink-0"
              >
                <Wand2 className="h-3.5 w-3.5" /> Generate with AI
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5">
              <button
                onClick={() => setCategory("all")}
                className={cn(
                  "rounded px-2.5 py-1 text-[12px] font-medium transition-colors",
                  category === "all" ? "bg-surface-3 text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded px-2.5 py-1 text-[12px] font-medium transition-colors",
                    category === c ? "bg-surface-3 text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>

            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-fg-subtle" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search components…"
                className="w-full bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-subtle"
              />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[132px] animate-pulse rounded-lg border border-border bg-surface" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-border">
              <EmptyState
                icon={Blocks}
                title="No components match"
                description="Try a different search or category — or generate a new one with AI."
                action={
                  <Button variant="secondary" onClick={() => { setSearch(""); setCategory("all"); }}>
                    Clear filters
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => {
                const Icon = iconFor(c.icon);
                return (
                  <button
                    key={c.name}
                    onClick={() => setActive(c)}
                    className="group rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid h-8 w-8 place-items-center rounded-md bg-surface-2 text-fg-muted group-hover:text-accent">
                        <Icon className="h-4 w-4" />
                      </span>
                      <Badge tone={CATEGORY_TONE[c.category]} dot>
                        {CATEGORY_LABEL[c.category]}
                      </Badge>
                    </div>
                    <p className="mt-3 text-[14px] font-medium text-fg">{c.label}</p>
                    <p className="font-mono text-[11px] text-fg-subtle">{c.name}</p>
                    <div className="mt-2 flex items-center gap-3 text-[12px] text-fg-muted">
                      <span className="nums">{c.fields.length}</span> fields
                      {c.allowChildren && (
                        <span className="flex items-center gap-1 text-fg-subtle">
                          <Boxes className="h-3 w-3" /> nestable
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && data && (
            <p className="mt-3 text-[12px] text-fg-muted">
              Showing <span className="nums text-fg">{filtered.length}</span> of{" "}
              <span className="nums text-fg">{items.length}</span> components · served by{" "}
              <span className="font-mono text-fg-subtle">GET /api/components</span> (controller → service →
              repository)
            </p>
          )}
        </div>
      </main>

      {/* Schema drawer */}
      <Drawer
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? `${active.label} schema` : "Schema"}
        footer={
          <Button variant="secondary" disabled={!canEdit} className="w-full" title={canEdit ? undefined : "Requires edit_components"}>
            Edit schema
          </Button>
        }
      >
        {active && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-surface-2 text-accent">
                {(() => {
                  const Icon = iconFor(active.icon);
                  return <Icon className="h-4 w-4" />;
                })()}
              </span>
              <div>
                <p className="text-[14px] font-medium text-fg">{active.label}</p>
                <p className="font-mono text-[11px] text-fg-subtle">{active.name}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={CATEGORY_TONE[active.category]} dot>
                {CATEGORY_LABEL[active.category]}
              </Badge>
              <Badge tone="neutral">{active.fields.length} fields</Badge>
              {active.allowChildren && <Badge tone="info" dot>Nestable</Badge>}
            </div>

            <div>
              <p className="label-caps mb-2">Field schema</p>
              <DataTable
                columns={fieldColumns}
                rows={active.fields}
                getKey={(f) => f.key}
                empty={<span className="text-[13px] text-fg-muted">No fields defined.</span>}
              />
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
