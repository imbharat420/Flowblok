"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/cn";
import type { ContentStatus, Folder, Paginated, Story } from "@/lib/types";
import { Folder as FolderIcon, Search, SlidersHorizontal, FileText } from "lucide-react";
import { useEffect, useState } from "react";

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

export default function ContentPage() {
  const [data, setData] = useState<ContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContentStatus | "all">("all");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/content?${params.toString()}`)
        .then((r) => r.json())
        .then((d: ContentResponse) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 120);
    return () => clearTimeout(t);
  }, [search, status]);

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
            </div>

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
                  </tr>
                </thead>
                <tbody>
                  {loading &&
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
                        </td>
                      </tr>
                    ))}

                  {!loading &&
                    data?.items.map((s) => (
                      <tr
                        key={s.id}
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
                      </tr>
                    ))}

                  {!loading && data?.items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
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
    </>
  );
}
