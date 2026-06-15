// Repository layer — owns its in-memory seed array. Swap for Prisma/Supabase
// without touching the service or controller.

import type { DbTable } from "./database.types";

const tables: DbTable[] = [
  {
    id: "tbl_authors",
    name: "authors",
    description: "Content authors and their public profiles.",
    fields: [
      { name: "id", type: "text", required: true },
      { name: "name", type: "text", required: true },
      { name: "email", type: "text", required: true },
      { name: "bio", type: "text", required: false },
      { name: "avatar_url", type: "text", required: false },
      { name: "verified", type: "boolean", required: true },
      { name: "joined_at", type: "date", required: true },
    ],
    relations: [
      { to: "posts", kind: "has_many" },
      { to: "comments", kind: "has_many" },
    ],
    records: 42,
    updatedAt: "2026-06-12T09:24:00.000Z",
  },
  {
    id: "tbl_posts",
    name: "posts",
    description: "Long-form articles authored in the editor.",
    fields: [
      { name: "id", type: "text", required: true },
      { name: "title", type: "text", required: true },
      { name: "slug", type: "text", required: true },
      { name: "body", type: "json", required: true },
      { name: "author_id", type: "relation", required: true },
      { name: "published", type: "boolean", required: true },
      { name: "read_minutes", type: "number", required: false },
      { name: "published_at", type: "date", required: false },
    ],
    relations: [
      { to: "authors", kind: "belongs_to" },
      { to: "categories", kind: "belongs_to" },
      { to: "comments", kind: "has_many" },
    ],
    records: 318,
    updatedAt: "2026-06-15T16:41:00.000Z",
  },
  {
    id: "tbl_categories",
    name: "categories",
    description: "Taxonomy used to group posts and products.",
    fields: [
      { name: "id", type: "text", required: true },
      { name: "name", type: "text", required: true },
      { name: "slug", type: "text", required: true },
      { name: "color", type: "text", required: false },
      { name: "sort_order", type: "number", required: true },
    ],
    relations: [{ to: "posts", kind: "has_many" }],
    records: 14,
    updatedAt: "2026-05-29T11:08:00.000Z",
  },
  {
    id: "tbl_comments",
    name: "comments",
    description: "Threaded reader comments awaiting moderation.",
    fields: [
      { name: "id", type: "text", required: true },
      { name: "post_id", type: "relation", required: true },
      { name: "author_id", type: "relation", required: true },
      { name: "body", type: "text", required: true },
      { name: "approved", type: "boolean", required: true },
      { name: "metadata", type: "json", required: false },
      { name: "created_at", type: "date", required: true },
    ],
    relations: [
      { to: "posts", kind: "belongs_to" },
      { to: "authors", kind: "belongs_to" },
    ],
    records: 1276,
    updatedAt: "2026-06-15T07:52:00.000Z",
  },
  {
    id: "tbl_products",
    name: "products",
    description: "Commerce catalog synced from the storefront.",
    fields: [
      { name: "id", type: "text", required: true },
      { name: "sku", type: "text", required: true },
      { name: "name", type: "text", required: true },
      { name: "price", type: "number", required: true },
      { name: "in_stock", type: "boolean", required: true },
      { name: "attributes", type: "json", required: false },
      { name: "category_id", type: "relation", required: false },
    ],
    relations: [
      { to: "categories", kind: "belongs_to" },
      { to: "orders", kind: "has_many" },
    ],
    records: 587,
    updatedAt: "2026-06-14T13:30:00.000Z",
  },
  {
    id: "tbl_orders",
    name: "orders",
    description: "Customer orders and fulfillment state.",
    fields: [
      { name: "id", type: "text", required: true },
      { name: "order_number", type: "text", required: true },
      { name: "total", type: "number", required: true },
      { name: "currency", type: "text", required: true },
      { name: "paid", type: "boolean", required: true },
      { name: "line_items", type: "json", required: true },
      { name: "placed_at", type: "date", required: true },
    ],
    relations: [{ to: "products", kind: "has_many" }],
    records: 2049,
    updatedAt: "2026-06-15T18:02:00.000Z",
  },
];

export class DatabaseRepository {
  findAll(): DbTable[] {
    return tables;
  }

  findById(id: string): DbTable | undefined {
    return tables.find((t) => t.id === id);
  }
}

export const databaseRepository = new DatabaseRepository();
