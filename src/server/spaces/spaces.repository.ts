// Spaces repository (Postgres/Drizzle). A space is a "site"/workspace owned by
// an account; all content/workflows hang off it. Owner-scoped throughout.

import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import type { CreateSpaceInput, Space } from "./spaces.types";
import { getDb } from "@/server/db/client";
import { spaces as t } from "@/server/db/schema";

type Row = typeof t.$inferSelect;
const iso = (v: string | null) => (v ? new Date(v).toISOString() : null);

function rowToSpace(r: Row): Space {
  return {
    id: r.id,
    name: r.name,
    plan: r.plan as Space["plan"],
    status: r.status as Space["status"],
    members: r.members,
    region: r.region,
    createdAt: new Date(r.createdAt).toISOString(),
    archivedAt: iso(r.archivedAt),
    purgeAt: iso(r.purgeAt),
  };
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "site";
}

const ARCHIVE_DAYS = 30;

export class SpacesRepository {
  async findAllForOwner(ownerId: string): Promise<Space[]> {
    const db = await getDb();
    const rows = await db.select().from(t).where(eq(t.ownerId, ownerId)).orderBy(desc(t.createdAt));
    return rows.map(rowToSpace);
  }

  async findById(id: string): Promise<Space | undefined> {
    const db = await getDb();
    const rows = await db.select().from(t).where(eq(t.id, id)).limit(1);
    return rows[0] ? rowToSpace(rows[0]) : undefined;
  }

  // Confirm a space belongs to an owner (authorization helper).
  async ownedBy(id: string, ownerId: string): Promise<boolean> {
    const db = await getDb();
    const rows = await db.select({ id: t.id }).from(t).where(and(eq(t.id, id), eq(t.ownerId, ownerId))).limit(1);
    return rows.length > 0;
  }

  async create(ownerId: string, input: CreateSpaceInput & { niche?: string }): Promise<Space> {
    const db = await getDb();
    const [row] = await db
      .insert(t)
      .values({
        id: "spc_" + randomUUID().slice(0, 12),
        ownerId,
        name: input.name,
        slug: slugify(input.name),
        niche: input.niche ?? "general",
        plan: input.plan ?? "Starter",
        region: input.region ?? "us-east-1",
        status: "active",
        members: 1,
      })
      .returning();
    return rowToSpace(row);
  }

  async archive(id: string): Promise<Space | undefined> {
    const db = await getDb();
    const now = new Date();
    const [row] = await db
      .update(t)
      .set({
        archivedAt: now.toISOString(),
        purgeAt: new Date(now.getTime() + ARCHIVE_DAYS * 86400000).toISOString(),
        updatedAt: now.toISOString(),
      })
      .where(eq(t.id, id))
      .returning();
    return row ? rowToSpace(row) : undefined;
  }

  async restore(id: string): Promise<Space | undefined> {
    const db = await getDb();
    const [row] = await db
      .update(t)
      .set({ archivedAt: null, purgeAt: null, updatedAt: new Date().toISOString() })
      .where(eq(t.id, id))
      .returning();
    return row ? rowToSpace(row) : undefined;
  }
}

export const spacesRepository = new SpacesRepository();
