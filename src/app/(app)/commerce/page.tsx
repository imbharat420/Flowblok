"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiCard } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/ui/page-header";
import { PromptModal } from "@/components/ui/prompt-modal";
import { Tabs, type TabDef } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";
import type {
  CommerceStats,
  Coupon,
  Order,
  OrderStatus,
  Product,
  ProductStatus,
} from "@/server/commerce/commerce.types";
import {
  Boxes,
  DollarSign,
  Package,
  ReceiptText,
  ShoppingCart,
  Tags,
  TicketPercent,
  TrendingDown,
  Warehouse,
} from "lucide-react";
import { useEffect, useState } from "react";

// ── helpers ──────────────────────────────────────────────────────────────
function money(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

const LOW_STOCK_THRESHOLD = 10;

const PRODUCT_STATUS: Record<ProductStatus, { tone: BadgeTone; label: string }> = {
  active: { tone: "ok", label: "Active" },
  draft: { tone: "neutral", label: "Draft" },
  out_of_stock: { tone: "err", label: "Out of stock" },
};

const ORDER_STATUS: Record<OrderStatus, { tone: BadgeTone; label: string }> = {
  paid: { tone: "ok", label: "Paid" },
  pending: { tone: "warn", label: "Pending" },
  shipped: { tone: "info", label: "Shipped" },
  refunded: { tone: "neutral", label: "Refunded" },
};

interface ListResponse<T> {
  items: T[];
  total: number;
  stats: CommerceStats;
}

type TabKey = "products" | "orders" | "inventory" | "coupons";

const TABS: TabDef[] = [
  { key: "products", label: "Products", icon: Package },
  { key: "orders", label: "Orders", icon: ReceiptText },
  { key: "inventory", label: "Inventory", icon: Warehouse },
  { key: "coupons", label: "Coupons", icon: TicketPercent },
];

// ── page ─────────────────────────────────────────────────────────────────
export default function CommercePage() {
  const [tab, setTab] = useState<TabKey>("products");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CommerceStats | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const createProduct = (name: string) => {
    const product: Product = {
      id: `prod_${Date.now().toString(36)}`,
      name,
      sku: name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 16) || "SKU",
      price: 0,
      stock: 0,
      status: "draft",
    };
    setProducts((prev) => [product, ...(prev ?? [])]);
    setCreateOpen(false);
  };

  const exportProducts = () => {
    const rows = products ?? [];
    if (rows.length === 0) return;
    const header = ["id", "name", "sku", "price", "stock", "status"];
    const csv = [
      header.join(","),
      ...rows.map((p) => [p.id, `"${p.name.replace(/"/g, '""')}"`, p.sku, p.price, p.stock, p.status].join(",")),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Products + stats power the KPI row, so load them up front.
  useEffect(() => {
    fetch("/api/commerce/products")
      .then((r) => r.json())
      .then((d: ListResponse<Product>) => {
        setProducts(d.items);
        setStats(d.stats);
      })
      .catch(() => setProducts([]));
    // Coupons are seeded client-side from the same module shape (no public route needed).
    setCoupons(SEED_COUPONS);
  }, []);

  // Orders are lazy-loaded on first visit to that tab.
  useEffect(() => {
    if (tab !== "orders" || orders !== null) return;
    fetch("/api/commerce/orders")
      .then((r) => r.json())
      .then((d: ListResponse<Order>) => setOrders(d.items))
      .catch(() => setOrders([]));
  }, [tab, orders]);

  return (
    <>
      <Topbar title="Commerce" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1200px]">
          <PageHeader
            title="Commerce"
            description="Native storefront core — products, orders, inventory and promotions."
            actions={
              <>
                <Button variant="secondary" size="sm" disabled={!products || products.length === 0} onClick={exportProducts}>
                  Export
                </Button>
                <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
                  New product
                </Button>
              </>
            }
          />

          {/* KPI row */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
              label="Revenue"
              value={stats ? money(stats.revenue) : "—"}
              delta={{ value: "+8.2%", positive: true }}
              icon={DollarSign}
            />
            <KpiCard
              label="Orders"
              value={stats ? stats.orders : "—"}
              delta={{ value: "+5", positive: true }}
              icon={ShoppingCart}
            />
            <KpiCard
              label="Avg order value"
              value={stats ? money(stats.aov) : "—"}
              delta={{ value: "+2.1%", positive: true }}
              icon={Boxes}
            />
            <KpiCard
              label="Low stock"
              value={stats ? stats.lowStock : "—"}
              delta={{ value: "needs attention", positive: false }}
              icon={TrendingDown}
            />
          </div>

          <div className="mb-4">
            <Tabs tabs={TABS} active={tab} onChange={(k) => setTab(k as TabKey)} />
          </div>

          {tab === "products" && <ProductsTab products={products} />}
          {tab === "orders" && <OrdersTab orders={orders} />}
          {tab === "inventory" && <InventoryTab products={products} />}
          {tab === "coupons" && <CouponsTab coupons={coupons} />}
        </div>
      </main>

      {createOpen && (
        <PromptModal
          title="Create a new product"
          label="Product name"
          placeholder="e.g. Aurora Desk Lamp"
          submitLabel="Create product"
          onClose={() => setCreateOpen(false)}
          onSubmit={createProduct}
        />
      )}
    </>
  );
}

// ── Products ───────────────────────────────────────────────────────────────
function ProductsTab({ products }: { products: Product[] | null }) {
  if (products === null) return <TableSkeleton cols={5} />;

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
      render: (p) => <span className="font-medium text-fg">{p.name}</span>,
    },
    {
      key: "sku",
      header: "SKU",
      render: (p) => <span className="font-mono text-[11px] text-fg-subtle">{p.sku}</span>,
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      render: (p) => <span className="nums text-fg">{money(p.price)}</span>,
    },
    {
      key: "stock",
      header: "Stock",
      align: "right",
      render: (p) => (
        <span className={cn("nums", p.stock <= LOW_STOCK_THRESHOLD ? "text-warn" : "text-fg-muted")}>
          {p.stock.toLocaleString("en-US")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Badge tone={PRODUCT_STATUS[p.status].tone} dot>
          {PRODUCT_STATUS[p.status].label}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={products}
      getKey={(p) => p.id}
      empty={
        <EmptyState icon={Package} title="No products" description="Add your first product to start selling." />
      }
    />
  );
}

// ── Orders ───────────────────────────────────────────────────────────────
function OrdersTab({ orders }: { orders: Order[] | null }) {
  if (orders === null) return <TableSkeleton cols={5} />;

  const columns: Column<Order>[] = [
    {
      key: "number",
      header: "Order",
      render: (o) => <span className="font-mono text-[12px] font-medium text-fg">{o.number}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      render: (o) => <span className="text-fg">{o.customer}</span>,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (o) => <span className="nums text-fg">{money(o.total)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (o) => (
        <Badge tone={ORDER_STATUS[o.status].tone} dot>
          {ORDER_STATUS[o.status].label}
        </Badge>
      ),
    },
    {
      key: "placedAt",
      header: "Date",
      align: "right",
      render: (o) => (
        <span className="nums text-[12px] text-fg-subtle">
          {new Date(o.placedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={orders}
      getKey={(o) => o.id}
      empty={<EmptyState icon={ReceiptText} title="No orders" description="Orders will appear here once placed." />}
    />
  );
}

// ── Inventory ──────────────────────────────────────────────────────────────
function InventoryTab({ products }: { products: Product[] | null }) {
  if (products === null) return <TableSkeleton cols={3} />;
  if (products.length === 0) {
    return <EmptyState icon={Warehouse} title="No inventory" description="No stocked products yet." />;
  }

  // Scale bars relative to the largest stock so they read meaningfully.
  const max = Math.max(...products.map((p) => p.stock), 1);

  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {products.map((p) => {
        const low = p.stock <= LOW_STOCK_THRESHOLD;
        const pct = Math.max(2, Math.round((p.stock / max) * 100));
        return (
          <div key={p.id} className="flex items-center gap-4 bg-bg px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-fg">{p.name}</p>
              <p className="font-mono text-[11px] text-fg-subtle">{p.sku}</p>
            </div>
            <div className="hidden flex-1 sm:block">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn(
                    "h-full rounded-full",
                    p.stock === 0 ? "bg-err" : low ? "bg-warn" : "bg-accent",
                  )}
                  style={{ width: `${p.stock === 0 ? 100 : pct}%` }}
                />
              </div>
            </div>
            <div className="w-16 text-right">
              <span className={cn("nums text-[13px]", low ? "text-warn" : "text-fg")}>
                {p.stock.toLocaleString("en-US")}
              </span>
            </div>
            <div className="w-28 text-right">
              {p.stock === 0 ? (
                <Badge tone="err" dot>
                  Out
                </Badge>
              ) : low ? (
                <Badge tone="warn" dot>
                  Low
                </Badge>
              ) : (
                <Badge tone="ok" dot>
                  In stock
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Coupons ──────────────────────────────────────────────────────────────
function CouponsTab({ coupons }: { coupons: Coupon[] }) {
  const columns: Column<Coupon>[] = [
    {
      key: "code",
      header: "Code",
      render: (c) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-[12px] font-medium text-fg">
          <Tags className="h-3.5 w-3.5 text-fg-subtle" />
          {c.code}
        </span>
      ),
    },
    {
      key: "percentOff",
      header: "Discount",
      render: (c) => (
        <Badge tone="accent" dot>
          {c.percentOff}% off
        </Badge>
      ),
    },
    {
      key: "uses",
      header: "Uses",
      align: "right",
      render: (c) => <span className="nums text-fg-muted">{c.uses.toLocaleString("en-US")}</span>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={coupons}
      getKey={(c) => c.id}
      empty={<EmptyState icon={TicketPercent} title="No coupons" description="Create a promo code to drive sales." />}
    />
  );
}

// ── shared skeleton ────────────────────────────────────────────────────────
function TableSkeleton({ cols }: { cols: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="border-b border-border bg-surface px-4 py-2.5">
        <div className="h-3 w-24 rounded bg-surface-2" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-border px-4 py-3 last:border-0">
          {Array.from({ length: cols }).map((__, j) => (
            <div key={j} className="h-4 flex-1 animate-pulse rounded bg-surface-2" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Client-side coupon seed (mirrors the repository shape).
const SEED_COUPONS: Coupon[] = [
  { id: "cpn_1", code: "WELCOME10", percentOff: 10, uses: 1284 },
  { id: "cpn_2", code: "SUMMER25", percentOff: 25, uses: 642 },
  { id: "cpn_3", code: "FREESHIP", percentOff: 5, uses: 3110 },
  { id: "cpn_4", code: "VIP40", percentOff: 40, uses: 87 },
  { id: "cpn_5", code: "BUNDLE15", percentOff: 15, uses: 503 },
  { id: "cpn_6", code: "FLASH30", percentOff: 30, uses: 219 },
  { id: "cpn_7", code: "LOYAL20", percentOff: 20, uses: 941 },
  { id: "cpn_8", code: "EARLYBIRD", percentOff: 12, uses: 156 },
];
