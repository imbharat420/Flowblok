// Module-local types for the Commerce core. Kept inside the module namespace
// per boundaries — nothing here touches the shared src/lib/types.ts.

export type ProductStatus = "active" | "draft" | "out_of_stock";
export type OrderStatus = "paid" | "pending" | "shipped" | "refunded";

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number; // in whole currency units (USD)
  stock: number;
  status: ProductStatus;
}

export interface Order {
  id: string;
  number: string;
  customer: string;
  total: number;
  status: OrderStatus;
  placedAt: string; // ISO
}

export interface Coupon {
  id: string;
  code: string;
  percentOff: number;
  uses: number;
}

export interface CommerceStats {
  revenue: number; // sum of paid + shipped order totals
  orders: number; // total order count
  aov: number; // average order value
  lowStock: number; // products at/under the low-stock threshold
}
