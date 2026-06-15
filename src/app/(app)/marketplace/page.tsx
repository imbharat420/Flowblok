"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { PageHeader } from "@/components/ui/page-header";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import type {
  MarketplaceItem,
  MarketplaceItemType,
} from "@/server/marketplace/marketplace.types";
import {
  LayoutTemplate,
  Plug,
  Workflow as WorkflowIcon,
  Bot,
  Palette,
  Star,
  Download,
  Store,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface MarketplaceResponse {
  items: MarketplaceItem[];
  total: number;
  meta: {
    types: MarketplaceItemType[];
    countsByType: Record<string, number>;
    platformFee: number;
  };
}

const TYPE_META: Record<MarketplaceItemType, { icon: LucideIcon; tone: BadgeTone }> = {
  Template: { icon: LayoutTemplate, tone: "info" },
  Plugin: { icon: Plug, tone: "accent" },
  Workflow: { icon: WorkflowIcon, tone: "ok" },
  Agent: { icon: Bot, tone: "warn" },
  Theme: { icon: Palette, tone: "neutral" },
};

const TYPE_ORDER: MarketplaceItemType[] = ["Template", "Plugin", "Workflow", "Agent", "Theme"];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < Math.round(rating) ? "fill-warn text-warn" : "text-fg-subtle",
          )}
        />
      ))}
      <span className="nums ml-1 text-[11px] text-fg-muted">{rating.toFixed(1)}</span>
    </span>
  );
}

function Card({ item, installing, onInstall }: { item: MarketplaceItem; installing: boolean; onInstall: () => void }) {
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;
  return (
    <div className="group flex flex-col rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-surface-2 text-fg-muted group-hover:text-accent">
          <Icon className="h-4 w-4" />
        </span>
        <Badge tone={meta.tone} dot>
          {item.type}
        </Badge>
      </div>

      <p className="mt-3 text-[14px] font-medium text-fg">{item.name}</p>
      <p className="mt-0.5 text-[12px] text-fg-muted">
        {item.category} · by {item.author}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <Stars rating={item.rating} />
        <span className="flex items-center gap-1 text-[12px] text-fg-muted">
          <Download className="h-3 w-3" />
          <span className="nums">{item.installs.toLocaleString()}</span>
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className={cn("text-[14px] font-semibold", item.price === 0 ? "text-ok" : "text-fg")}>
          {item.price === 0 ? "Free" : <span className="nums">${item.price}</span>}
        </span>
        <Button variant="primary" size="sm" onClick={onInstall} disabled={installing}>
          <Download className="h-3.5 w-3.5" /> {installing ? "Installing…" : "Install"}
        </Button>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [data, setData] = useState<MarketplaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<MarketplaceItemType | "all">("all");
  const [installing, setInstalling] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (active !== "all") params.set("type", active);
    fetch(`/api/marketplace?${params.toString()}`)
      .then((r) => r.json())
      .then((d: MarketplaceResponse) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [active]);

  const counts = data?.meta.countsByType ?? {};
  const totalAll = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts],
  );

  const chips: Array<{ key: MarketplaceItemType | "all"; label: string; count: number }> = [
    { key: "all", label: "All", count: totalAll },
    ...TYPE_ORDER.filter((t) => (counts[t] ?? 0) > 0).map((t) => ({
      key: t,
      label: t,
      count: counts[t] ?? 0,
    })),
  ];

  function handleInstall(id: string) {
    setInstalling((s) => ({ ...s, [id]: true }));
    setTimeout(() => setInstalling((s) => ({ ...s, [id]: false })), 1200);
  }

  return (
    <>
      <Topbar title="Marketplace" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1200px]">
          <PageHeader
            title="Marketplace"
            description="Templates, plugins, workflows, agents and themes from the Flowblok community."
            actions={
              <Badge tone="accent" dot>
                Creators keep 80% — 20% platform fee
              </Badge>
            }
          />

          {/* type filter chips */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                  active === c.key
                    ? "border-border-strong bg-surface-3 text-fg"
                    : "border-border bg-surface text-fg-muted hover:text-fg",
                )}
              >
                {c.label}
                <span className="nums text-[11px] text-fg-subtle">{c.count}</span>
              </button>
            ))}
          </div>

          {/* loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[180px] animate-pulse rounded-lg border border-border bg-surface"
                />
              ))}
            </div>
          )}

          {/* grid */}
          {!loading && data && data.items.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((item) => (
                <Card
                  key={item.id}
                  item={item}
                  installing={!!installing[item.id]}
                  onInstall={() => handleInstall(item.id)}
                />
              ))}
            </div>
          )}

          {/* empty */}
          {!loading && data && data.items.length === 0 && (
            <EmptyState
              icon={Store}
              title="Nothing in this category yet"
              description="No listings match this type. Try another filter or check back soon."
              action={
                <Button variant="secondary" size="sm" onClick={() => setActive("all")}>
                  Show all
                </Button>
              }
            />
          )}

          {!loading && data && data.items.length > 0 && (
            <p className="mt-4 text-[12px] text-fg-muted">
              Showing <span className="nums text-fg">{data.items.length}</span> listing
              {data.items.length === 1 ? "" : "s"} · served by{" "}
              <span className="font-mono text-fg-subtle">GET /api/marketplace</span> (controller →
              service → repository)
            </p>
          )}
        </div>
      </main>
    </>
  );
}
