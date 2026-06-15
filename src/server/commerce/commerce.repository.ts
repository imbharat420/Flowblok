// Repository layer — the ONLY layer that talks to the data source.
// Holds its own in-memory seed arrays (swap for Prisma/Supabase later
// without touching the service or controller).

import type { Coupon, Order, Product } from "./commerce.types";

const products: Product[] = [
  { id: "prd_1", name: "Aurora Wireless Headphones", sku: "AUR-WH-001", price: 249, stock: 142, status: "active" },
  { id: "prd_2", name: "Meridian Mechanical Keyboard", sku: "MER-KB-87", price: 159, stock: 38, status: "active" },
  { id: "prd_3", name: "Nimbus USB-C Hub 8-in-1", sku: "NIM-HUB-08", price: 79, stock: 6, status: "active" },
  { id: "prd_4", name: "Halo 4K Webcam", sku: "HAL-CAM-4K", price: 129, stock: 0, status: "out_of_stock" },
  { id: "prd_5", name: "Vesper Desk Mat XL", sku: "VES-MAT-XL", price: 39, stock: 410, status: "active" },
  { id: "prd_6", name: "Cobalt Ergonomic Mouse", sku: "COB-MS-02", price: 69, stock: 9, status: "active" },
  { id: "prd_7", name: "Lumen Monitor Light Bar", sku: "LUM-LB-01", price: 99, stock: 64, status: "active" },
  { id: "prd_8", name: "Drift Laptop Stand", sku: "DRF-LS-12", price: 59, stock: 0, status: "out_of_stock" },
  { id: "prd_9", name: "Pulse Smart Charger 100W", sku: "PUL-CH-100", price: 89, stock: 22, status: "active" },
  { id: "prd_10", name: "Onyx Noise Earbuds Pro", sku: "ONX-EB-PRO", price: 179, stock: 0, status: "draft" },
  { id: "prd_11", name: "Strata Cable Organizer Kit", sku: "STR-CO-KIT", price: 24, stock: 530, status: "active" },
  { id: "prd_12", name: "Glide Trackpad Wireless", sku: "GLD-TP-03", price: 119, stock: 7, status: "active" },
  { id: "prd_13", name: "Beacon Desk Lamp", sku: "BCN-DL-09", price: 84, stock: 48, status: "draft" },
  { id: "prd_14", name: "Tide Portable SSD 2TB", sku: "TID-SSD-2T", price: 199, stock: 31, status: "active" },
];

const orders: Order[] = [
  { id: "ord_1", number: "#10241", customer: "Ava Mitchell", total: 408, status: "paid", placedAt: "2026-06-14T09:12:00Z" },
  { id: "ord_2", number: "#10240", customer: "Noah Bennett", total: 159, status: "shipped", placedAt: "2026-06-13T16:40:00Z" },
  { id: "ord_3", number: "#10239", customer: "Sophia Carter", total: 79, status: "pending", placedAt: "2026-06-13T11:05:00Z" },
  { id: "ord_4", number: "#10238", customer: "Liam Foster", total: 318, status: "paid", placedAt: "2026-06-12T14:22:00Z" },
  { id: "ord_5", number: "#10237", customer: "Mia Reynolds", total: 99, status: "refunded", placedAt: "2026-06-12T08:50:00Z" },
  { id: "ord_6", number: "#10236", customer: "Ethan Walsh", total: 248, status: "shipped", placedAt: "2026-06-11T19:30:00Z" },
  { id: "ord_7", number: "#10235", customer: "Olivia Grant", total: 24, status: "paid", placedAt: "2026-06-11T10:18:00Z" },
  { id: "ord_8", number: "#10234", customer: "James Sutton", total: 199, status: "pending", placedAt: "2026-06-10T13:44:00Z" },
  { id: "ord_9", number: "#10233", customer: "Emma Lawson", total: 188, status: "paid", placedAt: "2026-06-10T07:59:00Z" },
  { id: "ord_10", number: "#10232", customer: "Lucas Hayes", total: 119, status: "shipped", placedAt: "2026-06-09T21:11:00Z" },
  { id: "ord_11", number: "#10231", customer: "Isabella Cruz", total: 69, status: "refunded", placedAt: "2026-06-09T12:03:00Z" },
  { id: "ord_12", number: "#10230", customer: "Mason Doyle", total: 477, status: "paid", placedAt: "2026-06-08T15:27:00Z" },
];

const coupons: Coupon[] = [
  { id: "cpn_1", code: "WELCOME10", percentOff: 10, uses: 1284 },
  { id: "cpn_2", code: "SUMMER25", percentOff: 25, uses: 642 },
  { id: "cpn_3", code: "FREESHIP", percentOff: 5, uses: 3110 },
  { id: "cpn_4", code: "VIP40", percentOff: 40, uses: 87 },
  { id: "cpn_5", code: "BUNDLE15", percentOff: 15, uses: 503 },
  { id: "cpn_6", code: "FLASH30", percentOff: 30, uses: 219 },
  { id: "cpn_7", code: "LOYAL20", percentOff: 20, uses: 941 },
  { id: "cpn_8", code: "EARLYBIRD", percentOff: 12, uses: 156 },
];

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
