"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { PageHeader } from "@/components/ui/page-header";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import type {
  ApiCatalogResponse,
  ApiEndpoint,
  HttpMethod,
} from "@/server/apis/apis.types";
import { Plug, Search } from "lucide-react";
import { useEffect, useState } from "react";

const METHOD_TONE: Record<HttpMethod, BadgeTone> = {
  GET: "info",
  POST: "ok",
  PUT: "warn",
  DELETE: "err",
};

const METHOD_FILTERS: Array<{ key: HttpMethod | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "GET", label: "GET" },
  { key: "POST", label: "POST" },
  { key: "PUT", label: "PUT" },
  { key: "DELETE", label: "DELETE" },
];

const API_BASE = "https://api.flowblok.io";

function sampleRequest(ep: ApiEndpoint): string {
  const authLine =
    ep.auth === "JWT" ? `  -H "Authorization: Bearer $FLOWBLOK_TOKEN" \\\n` : "";
  const hasBody = ep.method === "POST" || ep.method === "PUT";
  const bodyLine = hasBody
    ? `  -H "Content-Type: application/json" \\\n  -d '{ "name": "Example" }'`
    : `  -H "Accept: application/json"`;
  return `curl -X ${ep.method} ${API_BASE}${ep.path} \\\n${authLine}${bodyLine}`;
}

function sampleResponse(ep: ApiEndpoint): string {
  if (ep.method === "DELETE") {
    return JSON.stringify({ ok: true, id: "obj_8f2a1c", deleted: true }, null, 2);
  }
  if (ep.method === "GET" && ep.path.includes("{")) {
    return JSON.stringify(
      {
        id: "obj_8f2a1c",
        resource: ep.resource,
        name: "Example object",
        created_at: "2026-06-14T09:31:00Z",
      },
      null,
      2,
    );
  }
  if (ep.method === "GET") {
    return JSON.stringify(
      {
        items: [
          { id: "obj_8f2a1c", name: "Example object", resource: ep.resource },
          { id: "obj_3b91de", name: "Second object", resource: ep.resource },
        ],
        total: 2,
        page: 1,
        per_page: 25,
      },
      null,
      2,
    );
  }
  // POST / PUT
  return JSON.stringify(
    {
      id: "obj_8f2a1c",
      resource: ep.resource,
      name: "Example",
      updated_at: "2026-06-14T09:31:00Z",
    },
    null,
    2,
  );
}

export default function ApisPage() {
  const [data, setData] = useState<ApiCatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<HttpMethod | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ApiEndpoint | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (method !== "all") params.set("method", method);
    if (search) params.set("search", search);
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/apis?${params.toString()}`)
        .then((r) => r.json())
        .then((d: ApiCatalogResponse) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 120);
    return () => clearTimeout(t);
  }, [method, search]);

  const columns: Column<ApiEndpoint>[] = [
    {
      key: "method",
      header: "Method",
      className: "w-[110px]",
      render: (r) => (
        <Badge tone={METHOD_TONE[r.method]} dot>
          {r.method}
        </Badge>
      ),
    },
    {
      key: "path",
      header: "Path",
      render: (r) => <span className="font-mono text-[12px] text-fg">{r.path}</span>,
    },
    {
      key: "resource",
      header: "Resource",
      className: "w-[140px]",
      render: (r) => <span className="capitalize text-fg-muted">{r.resource}</span>,
    },
    {
      key: "auth",
      header: "Auth",
      className: "w-[100px]",
      render: (r) => (
        <Badge tone={r.auth === "JWT" ? "accent" : "neutral"} dot>
          {r.auth}
        </Badge>
      ),
    },
  ];

  const counts = data?.meta.methodBreakdown;

  return (
    <>
      <Topbar title="APIs" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1200px]">
          <PageHeader
            title="APIs"
            description="Every resource in the space is exposed through a typed, versioned REST surface."
            actions={
              <Badge tone="accent" dot>
                REST + GraphQL + Webhooks + OpenAPI — generated automatically
              </Badge>
            }
          />

          {/* controls */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5">
              {METHOD_FILTERS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={cn(
                    "rounded px-2.5 py-1 text-[12px] font-medium transition-colors",
                    method === m.key
                      ? "bg-surface-3 text-fg"
                      : "text-fg-muted hover:text-fg",
                  )}
                >
                  {m.label}
                  {m.key !== "all" && counts && (
                    <span className="nums ml-1.5 text-fg-subtle">
                      {counts[m.key as HttpMethod]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-fg-subtle" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search path, resource or description…"
                className="w-full bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-subtle"
              />
            </div>
          </div>

          {/* table */}
          {loading ? (
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="divide-y divide-border">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="px-4 py-3.5">
                    <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={data?.items ?? []}
              getKey={(r) => r.id}
              onRowClick={(r) => setSelected(r)}
              empty={
                <EmptyState
                  icon={Plug}
                  title="No endpoints match"
                  description="Try a different method filter or search term."
                />
              }
            />
          )}

          {!loading && data && (
            <p className="mt-3 text-[12px] text-fg-muted">
              Showing <span className="nums text-fg">{data.items.length}</span> of{" "}
              <span className="nums text-fg">{data.meta.resources.length}</span> resources ·
              served by{" "}
              <span className="font-mono text-fg-subtle">GET /api/apis</span> (controller →
              service → repository)
            </p>
          )}
        </div>
      </main>

      {/* Try it drawer */}
      <Drawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Try it"
        footer={
          selected ? (
            <p className="text-[11px] text-fg-subtle">
              Read-only preview · {selected.auth === "JWT" ? "Requires a bearer token" : "No auth required"}
            </p>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Badge tone={METHOD_TONE[selected.method]} dot>
                {selected.method}
              </Badge>
              <span className="font-mono text-[12px] text-fg">{selected.path}</span>
            </div>

            <p className="text-[13px] text-fg-muted">{selected.description}</p>

            <div className="flex items-center gap-2 text-[12px]">
              <span className="capitalize text-fg-muted">{selected.resource}</span>
              <span className="text-fg-subtle">·</span>
              <Badge tone={selected.auth === "JWT" ? "accent" : "neutral"} dot>
                {selected.auth}
              </Badge>
            </div>

            <div>
              <p className="label-caps mb-2">Sample request</p>
              <pre className="overflow-x-auto rounded-md border border-border bg-surface-2 p-3 font-mono text-[12px] leading-relaxed text-fg-muted">
                {sampleRequest(selected)}
              </pre>
            </div>

            <div>
              <p className="label-caps mb-2">Sample response · 200</p>
              <pre className="overflow-x-auto rounded-md border border-border bg-surface-2 p-3 font-mono text-[12px] leading-relaxed text-fg">
                {sampleResponse(selected)}
              </pre>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
