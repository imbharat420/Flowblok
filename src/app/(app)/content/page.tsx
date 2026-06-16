"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { RequireCapability } from "@/components/require-capability";
import { cn } from "@/lib/cn";
import type { ContentStatus, Folder, Paginated, Story } from "@/lib/types";
import { Folder as FolderIcon, Search, SlidersHorizontal, FileText, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CONTENT_TYPES = ["page", "post", "product"] as const;

interface ContentResponse extends Paginated<Story> {
  meta: {
    statusBreakdown: Record<string, number>;
    contentTypes: string[];
    folders: Folder[];
  };
}

const STATUS_TABS: Array<{ key: ContentStatus | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "review", label: "In review" },
  { key: "draft", label: "Draft" },
];

function ContentModule() {
  const router = useRouter();
  const [data, setData] = useState<ContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContentStatus | "all">("all");

  // New-story drawer state
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<(typeof CONTENT_TYPES)[number]>("page");
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    setLoading(true);
    return fetch(`/api/content?${params.toString()}`)
      .then((r) => r.json())
      .then((d: ContentResponse) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(refetch, 120);
    return () => clearTimeout(t);
  }, [refetch]);

  const createStory = useCallback(async () => {
    if (!newName.trim() || creating) return;
    setCreating(true);
    setActionError(null);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), contentType: newType }),
      });
      if (res.status === 403) {
        setActionError("You don't have permission to create content.");
        return;
      }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const story = (await res.json()) as Story;
      router.push(`/content/${story.id}`);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to create story");
    } finally {
      setCreating(false);
    }
  }, [newName, newType, creating, router]);

  const deleteStory = useCallback(
    async (id: string) => {
      setActionError(null);
      try {
        const res = await fetch(`/api/content/${id}`, { method: "DELETE" });
        if (res.status === 403) {
          setActionError("You don't have permission to delete content.");
          return;
        }
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        await refetch();
      } catch (e) {
        setActionError(e instanceof Error ? e.message : "Failed to delete story");
      }
    },
    [refetch],
  );

  return (
    <>
      <Topbar title="Content" breadcrumb={["Acme Digital"]} />
      <main className="flex flex-1 overflow-hidden">
        {/* folders rail (Storyblok-style) */}
        <div className="hidden w-[200px] shrink-0 overflow-y-auto border-r border-border bg-surface px-3 py-4 md:block">
          <p className="label-caps px-2 pb-2">Folders</p>
          <button className="flex w-full items-center gap-2 rounded-md bg-surface-3 px-2 py-1.5 text-[13px] font-medium text-fg">
            <FileText className="h-3.5 w-3.5" /> All stories
            <span className="nums ml-auto text-[11px] text-fg-muted">{data?.total ?? "—"}</span>
          </button>
          {data?.meta.folders.map((f) => (
            <button
              key={f.id}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <FolderIcon className="h-3.5 w-3.5" /> {f.name}
              <span className="nums ml-auto text-[11px] text-fg-subtle">{f.storyCount}</span>
            </button>
          ))}
        </div>

        {/* main list */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto max-w-[1100px]">
            {/* controls */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5">
                {STATUS_TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setStatus(t.key)}
                    className={cn(
                      "rounded px-2.5 py-1 text-[12px] font-medium transition-colors",
                      status === t.key ? "bg-surface-3 text-fg" : "text-fg-muted hover:text-fg",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5">
                <Search className="h-3.5 w-3.5 text-fg-subtle" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search stories…"
                  className="w-full bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-subtle"
                />
              </div>

              <button className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12px] text-fg-muted transition-colors hover:text-fg">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              </button>

              <button
                onClick={() => {
                  setActionError(null);
                  setNewName("");
                  setNewType("page");
                  setCreateOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-[12px] font-medium text-accent-fg transition-colors hover:bg-accent-hover"
              >
                <Plus className="h-3.5 w-3.5" /> New
              </button>
            </div>

            {actionError && (
              <div className="mb-3 rounded-md border border-err/40 bg-err/10 px-3 py-2 text-[12px] text-err">
                {actionError}
              </div>
            )}

            {/* table */}
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-2.5 font-medium text-fg-muted">Name</th>
                    <th className="px-4 py-2.5 font-medium text-fg-muted">Type</th>
                    <th className="px-4 py-2.5 font-medium text-fg-muted">Status</th>
                    <th className="hidden px-4 py-2.5 font-medium text-fg-muted lg:table-cell">Author</th>
                    <th className="hidden px-4 py-2.5 text-right font-medium text-fg-muted sm:table-cell">
                      Updated
                    </th>
                    <th className="w-10 px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {loading &&
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
                        </td>
                      </tr>
                    ))}

                  {!loading &&
                    data?.items.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => router.push(`/content/${s.id}`)}
                        className="cursor-pointer border-b border-border bg-bg transition-colors last:border-0 hover:bg-surface"
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-fg">{s.name}</span>
                          <span className="ml-2 font-mono text-[11px] text-fg-subtle">/{s.slug}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px] text-fg-muted">
                            {s.contentType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill status={s.status} />
                        </td>
                        <td className="hidden px-4 py-3 text-fg-muted lg:table-cell">{s.author}</td>
                        <td className="nums hidden px-4 py-3 text-right text-[12px] text-fg-subtle sm:table-cell">
                          {new Date(s.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void deleteStory(s.id);
                            }}
                            aria-label={`Delete ${s.name}`}
                            className="grid h-7 w-7 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-err/10 hover:text-err"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                  {!loading && data?.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <p className="text-[14px] font-medium text-fg">No stories match</p>
                        <p className="mt-1 text-[13px] text-fg-muted">
                          Try a different search or status filter.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!loading && data && (
              <p className="mt-3 text-[12px] text-fg-muted">
                Showing <span className="nums text-fg">{data.items.length}</span> of{" "}
                <span className="nums text-fg">{data.total}</span> stories · served by{" "}
                <span className="font-mono text-fg-subtle">GET /api/content</span> (controller → service →
                repository)
              </p>
            )}
          </div>
        </div>
      </main>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New story"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="md" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => void createStory()}
              disabled={!newName.trim() || creating}
            >
              {creating ? "Creating…" : "Create story"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label-caps mb-1.5 block">Name</label>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void createStory()}
              placeholder="e.g. Summer Landing Page"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-[14px] text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-border-strong"
            />
          </div>
          <div>
            <label className="label-caps mb-1.5 block">Content type</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as (typeof CONTENT_TYPES)[number])}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-[14px] text-fg outline-none transition-colors focus:border-border-strong"
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          {actionError && <p className="text-[12px] text-err">{actionError}</p>}
        </div>
      </Drawer>
    </>
  );
}

export default function ContentPage() {
  return (
    <RequireCapability capability="edit_content" title="Content">
      <ContentModule />
    </RequireCapability>
  );
}
