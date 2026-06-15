// Controller layer — maps HTTP concerns (query parsing, status codes, shapes)
// to service calls. Route handlers are thin adapters that delegate here.

import { CommerceService, commerceService } from "./commerce.service";
import type { Order, ProductStatus } from "./commerce.types";
import type { ApiResult } from "@/server/content/content.controller";

const PRODUCT_STATUSES: ProductStatus[] = ["active", "draft", "out_of_stock"];
const ORDER_STATUSES: Order["status"][] = ["paid", "pending", "shipped", "refunded"];

export class CommerceController {
  constructor(private readonly service: CommerceService = commerceService) {}

  // GET /api/commerce/products
  listProducts(searchParams: URLSearchParams): ApiResult {
    const statusParam = searchParams.get("status");
    const status = PRODUCT_STATUSES.includes(statusParam as ProductStatus)
      ? (statusParam as ProductStatus)
      : undefined;
    const search = searchParams.get("search") ?? undefined;

    const items = this.service.listProducts({ status, search });
    return {
      status: 200,
      body: { items, total: items.length, stats: this.service.stats() },
    };
  }

  // GET /api/commerce/orders
  listOrders(searchParams: URLSearchParams): ApiResult {
    const statusParam = searchParams.get("status");
    const status = ORDER_STATUSES.includes(statusParam as Order["status"])
      ? (statusParam as Order["status"])
      : undefined;

    const items = this.service.listOrders({ status });
    return {
      status: 200,
      body: { items, total: items.length, stats: this.service.stats() },
    };
  }
}

export const commerceController = new CommerceController();
