"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import type { Asset, AssetListResult, AssetType } from "@/server/assets/assets.types";
import {
  Check,
  Copy,
  FileText,
  Film,
  Image as ImageIcon,
  Library,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

// Per-type visual language: icon + a quiet tinted placeholder + badge tone.
const TYPE_META: Record<
  AssetType,
  { icon: LucideIcon; tile: string; iconColor: string; tone: "info" | "accent" | "warn"; label: string }
> = {
  image: {
    icon: ImageIcon,
    tile: "bg-info/10",
    iconColor: "text-info",
    tone: "info",
    label: "Image",
  },
  video: {
    icon: Film,
    tile: "bg-accent/10",
    iconColor: "text-accent",
    tone: "accent",
    label: "Video",
  },
  document: {
    icon: FileText,
    tile: "bg-warn/10",
    iconColor: "text-warn",
    tone: "warn",
    label: "Document",
  },
};

function formatSize(sizeKB: number): string {
  if (sizeKB < 1024) return `${sizeKB} KB`;
  return `${(sizeKB / 1024).toFixed(1)} MB`;
}

function cdnUrl(asset: Asset): string {
  return `https://cdn.flowblok.io/acme-digital/${asset.folder}/${asset.name}`;
}

export default function AssetsPage() {
  const [data, setData] = useState<AssetListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState("all");
  const [selected, setSelected] = useState<Asset | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (folder !== "all") params.set("folder", folder);
    setLoading(true);
    fetch(`/api/assets?${params.toString()}`)
      .then((r) => r.json())
      .then((d: AssetListResult) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [folder]);

  const copyUrl = () => {
    if (!selected) return;
    navigator.clipboard?.writeText(cdnUrl(selected));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const folders = data?.meta.folders ?? [];

  return (
    <>
      <Topbar title="Assets" breadcrumb={["Acme Digital"]} />
      <main className="flex flex-1 overflow-hidden">
        {/* folders rail */}
        <div className="hidden w-[208px] shrink-0 overflow-y-auto border-r border-border bg-surface px-3 py-4 md:block">
          <p className="label-caps px-2 pb-2">Folders</p>
          {(loading && folders.length === 0
            ? [{ id: "all", name: "All assets", count: 0 }]
            : folders
          ).map((f) => {
            const active = folder === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFolder(f.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors",
                  active
                    ? "bg-surface-3 font-medium text-fg"
                    : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                {f.id === "all" ? (
                  <Library className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="truncate">{f.name}</span>
                <span
                  className={cn(
                    "nums ml-auto text-[11px]",
                    active ? "text-fg-muted" : "text-fg-subtle",
                  )}
                >
                  {loading && folders.length === 0 ? "—" : f.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* main grid */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-fg">Media library</h1>
                <p className="mt-1 text-[13px] text-fg-muted">
                  Images, video and documents — served from the Flowblok CDN.
                </p>
              </div>
              <Button variant="primary" size="md">
                <Upload className="h-3.5 w-3.5" /> Upload
              </Button>
            </div>

            {/* loading skeleton */}
            {loading && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border bg-surface p-2">
                    <div className="aspect-[4/3] w-full animate-pulse rounded-md bg-surface-2" />
                    <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-surface-2" />
                    <div className="mt-1.5 h-2.5 w-1/3 animate-pulse rounded bg-surface-2" />
                  </div>
                ))}
              </div>
            )}

            {/* empty */}
            {!loading && data && data.items.length === 0 && (
              <EmptyState
                icon={Library}
                title="No assets in this folder"
                description="Upload images, video or documents to start building your media library."
                action={
                  <Button variant="primary" size="sm">
                    <Upload className="h-3.5 w-3.5" /> Upload
                  </Button>
                }
              />
            )}

            {/* grid */}
            {!loading && data && data.items.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {data.items.map((a) => {
                    const meta = TYPE_META[a.type];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={a.id}
                        onClick={() => {
                          setSelected(a);
                          setCopied(false);
                        }}
                        className="group rounded-lg border border-border bg-surface p-2 text-left transition-colors hover:border-border-strong"
                      >
                        <div
                          className={cn(
                            "grid aspect-[4/3] w-full place-items-center rounded-md",
                            meta.tile,
                          )}
                        >
                          <Icon className={cn("h-7 w-7", meta.iconColor)} />
                        </div>
                        <p className="mt-2 truncate text-[12px] font-medium text-fg" title={a.name}>
                          {a.name}
                        </p>
                        <div className="mt-0.5 flex items-center justify-between text-[11px] text-fg-subtle">
                          <span className="uppercase tracking-wide">{a.type}</span>
                          <span className="nums">{formatSize(a.sizeKB)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-4 text-[12px] text-fg-muted">
                  Showing <span className="nums text-fg">{data.items.length}</span> of{" "}
                  <span className="nums text-fg">{data.total}</span> assets · served by{" "}
                  <span className="font-mono text-fg-subtle">GET /api/assets</span> (controller →
                  service → repository)
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      {/* detail drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Asset"}
        footer={
          selected ? (
            <Button variant="secondary" size="md" className="w-full" onClick={copyUrl}>
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-ok" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy CDN URL
                </>
              )}
            </Button>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-5">
            {/* preview */}
            {(() => {
              const meta = TYPE_META[selected.type];
              const Icon = meta.icon;
              return (
                <div
                  className={cn(
                    "grid aspect-video w-full place-items-center rounded-lg border border-border",
                    meta.tile,
                  )}
                >
                  <Icon className={cn("h-10 w-10", meta.iconColor)} />
                </div>
              );
            })()}

            <div className="flex items-center justify-between">
              <Badge tone={TYPE_META[selected.type].tone} dot>
                {TYPE_META[selected.type].label}
              </Badge>
              <span className="nums text-[12px] text-fg-muted">{formatSize(selected.sizeKB)}</span>
            </div>

            <dl className="space-y-3 text-[13px]">
              <Row label="File name" value={<span className="break-all text-fg">{selected.name}</span>} />
              <Row
                label="Dimensions"
                value={
                  <span className="nums text-fg">{selected.dimensions ?? "—"}</span>
                }
              />
              <Row label="Folder" value={<span className="text-fg">{selected.folder}</span>} />
              <Row
                label="Uploaded"
                value={
                  <span className="text-fg">
                    {new Date(selected.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                }
              />
            </dl>

            <div>
              <p className="label-caps pb-1.5">CDN URL</p>
              <div className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-2.5 py-2">
                <code className="flex-1 truncate font-mono text-[11px] text-fg-muted">
                  {cdnUrl(selected)}
                </code>
                <button
                  onClick={copyUrl}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded text-fg-muted hover:bg-surface-3 hover:text-fg"
                  aria-label="Copy CDN URL"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-ok" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-fg-subtle">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
