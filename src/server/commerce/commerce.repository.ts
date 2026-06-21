// Repository layer — the ONLY layer that talks to the data source.
// Holds its own in-memory seed arrays (swap for Prisma/Supabase later
// without touching the service or controller).

import type { Coupon, Order, Product } from "./commerce.types";

// Cleared: commerce starts empty.
const products: Product[] = [];
const orders: Order[] = [];
const coupons: Coupon[] = [];

export class CommerceRepository {
  findAllProducts(): Product[] {
    return products;
  }

  findProductById(id: string): Product | undefined {
    return products.find((p) => p.id === id);
  }

  findAllOrders(): Order[] {
    return orders;
  }

  findOrderById(id: string): Order | undefined {
    return orders.find((o) => o.id === id);
  }

  findAllCoupons(): Coupon[] {
    return coupons;
  }
}

export const commerceRepository = new CommerceRepository();
