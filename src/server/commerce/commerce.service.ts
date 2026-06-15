// Service layer — business logic: filtering, derived KPIs. Knows nothing about
// HTTP. Pure, testable, reusable from API routes, RSC or workflows.

import { CommerceRepository, commerceRepository } from "./commerce.repository";
import type { CommerceStats, Coupon, Order, Product, ProductStatus } from "./commerce.types";

export const LOW_STOCK_THRESHOLD = 10;

// Order statuses that count as realized revenue.
const REVENUE_STATUSES = new Set<Order["status"]>(["paid", "shipped"]);

export class CommerceService {
  constructor(private readonly repo: CommerceRepository = commerceRepository) {}

  listProducts(filter?: { status?: ProductStatus; search?: string }): Product[] {
    let items = this.repo.findAllProducts();
    if (filter?.status) items = items.filter((p) => p.status === filter.status);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      );
    }
    return items;
  }

  listOrders(filter?: { status?: Order["status"] }): Order[] {
    let items = this.repo.findAllOrders();
    if (filter?.status) items = items.filter((o) => o.status === filter.status);
    return [...items].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  }

  listCoupons(): Coupon[] {
    return [...this.repo.findAllCoupons()].sort((a, b) => b.uses - a.uses);
  }

  /** Products at or below the low-stock threshold (excludes drafts). */
  lowStockProducts(): Product[] {
    return this.repo
      .findAllProducts()
      .filter((p) => p.status !== "draft" && p.stock <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.stock - b.stock);
  }

  /** Headline KPIs for the dashboard row. */
  stats(): CommerceStats {
    const orders = this.repo.findAllOrders();
    const revenueOrders = orders.filter((o) => REVENUE_STATUSES.has(o.status));
    const revenue = revenueOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = orders.length;
    const aov = revenueOrders.length ? Math.round(revenue / revenueOrders.length) : 0;
    return {
      revenue,
      orders: orderCount,
      aov,
      lowStock: this.lowStockProducts().length,
    };
  }
}

export const commerceService = new CommerceService();
