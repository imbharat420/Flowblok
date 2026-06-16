"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import type { Paginated, Story } from "@/lib/types";
import { FileText, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Reuses the shared content API (GET /api/content?contentType=page) — no new server.
type ContentResponse = Paginated<Story>;

const SKELETON_ROWS = 7;

export default function PagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<Story[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/content?contentType=page")
      .then((r) => r.json())
      .then((d: ContentResponse) => {
        if (!active) return;
        setPages(d.items ?? []);
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Search is filtered client-side over the page-type set.
  const filtered = useMemo(() => {
    if (!pages) return [];
    const q = search.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
    );
  }, [pages, search]);

  const columns: Column<Story>[] = [
    {
      key: "name",
      header: "Name",
      render: (p) => (
        <span className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
          <span className="font-medium text-fg">{p.name}</span>
          <span className="font-mono text-[11px] text-fg-subtle">/{p.slug}</span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <StatusPill status={p.status} />,
    },
    {
      key: "author",
      header: "Author",
      className: "hidden lg:table-cell text-fg-muted",
      render: (p) => p.author,
    },
    {
      key: "updatedAt",
      header: "Updated",
      align: "right",
      className: "nums hidden sm:table-cell text-[12px] text-fg-subtle",
      render: (p) =>
        new Date(p.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    },
  ];

  return (
    <>
      <Topbar title="Pages" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1200px]">
          <PageHeader
            title="Pages"
            description="Every page-type entry in this space — open one to edit it in the visual builder."
            actions={
              <Button variant="primary" onClick={() => router.push("/content")}>
                <Plus className="h-3.5 w-3.5" /> New page
              </Button>
            }
          />

          {/* search */}
          <div className="mb-4 flex max-w-[320px] items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-fg-subtle" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pages…"
              className="w-full bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-subtle"
            />
          </div>

          {loading ? (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-2.5 font-medium text-fg-muted">Name</th>
                    <th className="px-4 py-2.5 font-medium text-fg-muted">Status</th>
                    <th className="hidden px-4 py-2.5 font-medium text-fg-muted lg:table-cell">
                      Author
                    </th>
                    <th className="hidden px-4 py-2.5 text-right font-medium text-fg-muted sm:table-cell">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td colSpan={4} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <DataTable<Story>
              columns={columns}
              rows={filtered}
              getKey={(p) => p.id}
              onRowClick={(p) => router.push(`/editor/${p.id}`)}
              empty={
                <EmptyState
                  icon={FileText}
                  title={search ? "No pages match" : "No pages yet"}
                  description={
                    search
                      ? "Try a different search term."
                      : "Create your first page to start building in the visual editor."
                  }
                  action={
                    !search ? (
                      <Button variant="primary" onClick={() => router.push("/content")}>
                        <Plus className="h-3.5 w-3.5" /> New page
                      </Button>
                    ) : undefined
                  }
                />
              }
            />
          )}

          {!loading && pages && (
            <p className="mt-3 text-[12px] text-fg-muted">
              Showing <span className="nums text-fg">{filtered.length}</span> of{" "}
              <span className="nums text-fg">{pages.length}</span> pages · served by{" "}
              <span className="font-mono text-fg-subtle">GET /api/content?contentType=page</span>
            </p>
          )}
        </div>
      </main>
    </>
  );
}
