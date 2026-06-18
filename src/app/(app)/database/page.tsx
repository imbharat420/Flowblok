"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { PromptModal } from "@/components/ui/prompt-modal";
import { cn } from "@/lib/cn";
import type {
  DbTable,
  FieldType,
  TableField,
  TableRelation,
} from "@/server/database/database.types";
import { Database, Plus, KeyRound, Link2, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface TableDetail extends DbTable {
  endpoints: Array<{ method: string; path: string; summary: string }>;
}

const FIELD_TYPE_LABEL: Record<FieldType, string> = {
  text: "Text",
  number: "Number",
  boolean: "Boolean",
  date: "Date",
  relation: "Relation",
  json: "JSON",
};

const METHOD_TONE: Record<string, string> = {
  GET: "text-info",
  POST: "text-ok",
  PUT: "text-warn",
  DELETE: "text-err",
};

export default function DatabasePage() {
  const [tables, setTables] = useState<DbTable[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TableDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const createTable = (name: string) => {
    const table: DbTable = {
      id: `tbl_${Date.now().toString(36)}`,
      name: name.trim().toLowerCase().replace(/\s+/g, "_"),
      description: "New table",
      fields: [{ name: "id", type: "text", required: true }],
      relations: [],
      records: 0,
      updatedAt: new Date().toISOString(),
    };
    setTables((prev) => [table, ...(prev ?? [])]);
    setCreateOpen(false);
  };

  useEffect(() => {
    fetch("/api/database/tables")
      .then((r) => r.json())
      .then((d: { items: DbTable[] }) => {
        setTables(d.items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setDetail(null);
    setDetailLoading(true);
    fetch(`/api/database/tables/${selectedId}`)
      .then(async (r) => {
        if (r.ok) return (await r.json()) as TableDetail;
        // A created-but-unsaved table has no server record — render its detail
        // from the local row instead of crashing on the 404 error body.
        const local = (tables ?? []).find((t) => t.id === selectedId);
        return local ? { ...local, endpoints: [] } : null;
      })
      .then((d) => {
        setDetail(d);
        setDetailLoading(false);
      })
      .catch(() => setDetailLoading(false));
  }, [selectedId, tables]);

  const columns: Column<DbTable>[] = [
    {
      key: "name",
      header: "Name",
      render: (t) => (
        <span className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded bg-surface-2 text-fg-muted">
            <Database className="h-3.5 w-3.5" />
          </span>
          <span className="font-mono text-[13px] font-medium text-fg">{t.name}</span>
        </span>
      ),
    },
    {
      key: "fields",
      header: "Fields",
      align: "right",
      render: (t) => <span className="nums text-fg-muted">{t.fields.length}</span>,
    },
    {
      key: "records",
      header: "Records",
      align: "right",
      render: (t) => <span className="nums text-fg">{t.records.toLocaleString()}</span>,
    },
    {
      key: "api",
      header: "Auto-API",
      align: "right",
      render: () => (
        <Badge tone="ok" dot>
          REST + GraphQL
        </Badge>
      ),
    },
  ];

  return (
    <>
      <Topbar title="Database" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1200px]">
          <PageHeader
            title="Database"
            description="Visual table builder. Every table auto-generates a typed REST + GraphQL + OpenAPI layer."
            actions={
              <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> New table
              </Button>
            }
          />

          {loading ? (
            <div className="overflow-hidden rounded-lg border border-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-b border-border p-3.5 last:border-0">
                  <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
                </div>
              ))}
            </div>
          ) : (
            <DataTable<DbTable>
              columns={columns}
              rows={tables ?? []}
              getKey={(t) => t.id}
              onRowClick={(t) => setSelectedId(t.id)}
              empty={
                <EmptyState
                  icon={Database}
                  title="No tables yet"
                  description="Create your first table to auto-generate a typed API."
                  action={
                    <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
                      <Plus className="h-3.5 w-3.5" /> New table
                    </Button>
                  }
                />
              }
            />
          )}

          {!loading && tables && tables.length > 0 && (
            <p className="mt-3 text-[12px] text-fg-muted">
              <span className="nums text-fg">{tables.length}</span> tables · served by{" "}
              <span className="font-mono text-fg-subtle">GET /api/database/tables</span> (controller →
              service → repository)
            </p>
          )}
        </div>
      </main>

      <Drawer
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title={detail ? detail.name : "Table"}
      >
        {detailLoading || !detail ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 w-full animate-pulse rounded bg-surface-2" />
            ))}
          </div>
        ) : (
          <TableDetailView detail={detail} />
        )}
      </Drawer>

      {createOpen && (
        <PromptModal
          title="Create a new table"
          label="Table name"
          placeholder="e.g. invoices"
          submitLabel="Create table"
          onClose={() => setCreateOpen(false)}
          onSubmit={createTable}
        />
      )}
    </>
  );
}

function TableDetailView({ detail }: { detail: TableDetail }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-surface-2 text-fg-muted">
          <Database className="h-4 w-4" />
        </span>
        <div>
          <p className="font-mono text-[13px] font-medium text-fg">{detail.name}</p>
          <p className="text-[12px] text-fg-muted">{detail.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Fields" value={detail.fields.length} />
        <Stat label="Records" value={detail.records} />
        <Stat label="Relations" value={detail.relations.length} />
      </div>

      <section>
        <p className="label-caps mb-2">Fields</p>
        <FieldsTable fields={detail.fields} />
      </section>

      <section>
        <p className="label-caps mb-2">Relations</p>
        <RelationsList relations={detail.relations} />
      </section>

      <section>
        <div className="mb-2 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-accent" />
          <p className="label-caps">Auto-generated endpoints</p>
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          {detail.endpoints.map((e) => (
            <div
              key={`${e.method} ${e.path}`}
              className="flex items-center gap-3 border-b border-border px-3 py-2 last:border-0"
            >
              <span
                className={cn(
                  "nums w-14 shrink-0 font-mono text-[11px] font-semibold",
                  METHOD_TONE[e.method] ?? "text-fg-muted",
                )}
              >
                {e.method}
              </span>
              <span className="font-mono text-[12px] text-fg">{e.path}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-fg-subtle">
          Every table auto-generates a typed REST + GraphQL + OpenAPI surface — no boilerplate, no
          migrations to hand-write.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 px-3 py-2">
      <p className="nums text-[16px] font-semibold text-fg">{value.toLocaleString()}</p>
      <p className="text-[11px] text-fg-muted">{label}</p>
    </div>
  );
}

function FieldsTable({ fields }: { fields: TableField[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-left text-[12px]">
        <thead>
          <tr className="border-b border-border bg-surface">
            <th className="px-3 py-2 font-medium text-fg-muted">Field</th>
            <th className="px-3 py-2 font-medium text-fg-muted">Type</th>
            <th className="px-3 py-2 text-right font-medium text-fg-muted">Required</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f.name} className="border-b border-border last:border-0">
              <td className="px-3 py-2 font-mono text-fg">
                <span className="flex items-center gap-1.5">
                  {f.type === "relation" ? (
                    <Link2 className="h-3 w-3 text-fg-subtle" />
                  ) : f.name === "id" ? (
                    <KeyRound className="h-3 w-3 text-fg-subtle" />
                  ) : null}
                  {f.name}
                </span>
              </td>
              <td className="px-3 py-2">
                <span className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px] text-fg-muted">
                  {FIELD_TYPE_LABEL[f.type]}
                </span>
              </td>
              <td className="px-3 py-2 text-right">
                {f.required ? (
                  <span className="text-[11px] font-medium text-warn">Required</span>
                ) : (
                  <span className="text-[11px] text-fg-subtle">Optional</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RelationsList({ relations }: { relations: TableRelation[] }) {
  if (relations.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-3 text-[12px] text-fg-subtle">
        No relations defined.
      </p>
    );
  }
  return (
    <div className="space-y-1.5">
      {relations.map((r) => (
        <div
          key={`${r.kind}:${r.to}`}
          className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2"
        >
          <span className="flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5 text-fg-subtle" />
            <span className="font-mono text-[12px] text-fg">{r.to}</span>
          </span>
          <Badge tone={r.kind === "has_many" ? "info" : "accent"}>
            {r.kind === "has_many" ? "has many" : "belongs to"}
          </Badge>
        </div>
      ))}
    </div>
  );
}
