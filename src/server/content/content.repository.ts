// Content repository (Postgres/Drizzle). Stories are space-scoped; pages are
// just stories whose contentType is a page type. Version history lives in the
// story_versions table (newest first, capped on read).

import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import type { BlockNode, Folder, Story, StoryVersion } from "@/lib/types";
import { getDb } from "@/server/db/client";
import { stories as t, storyVersions as v, type DbStory } from "@/server/db/schema";

function rowToStory(r: DbStory): Story {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    contentType: r.contentType,
    status: r.status as Story["status"],
    folder: r.folder ?? null,
    author: r.author,
    updatedAt: new Date(r.updatedAt).toISOString(),
    content: r.content,
  };
}

function kebabCase(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export class ContentRepository {
  async findAllForSpace(spaceId: string): Promise<Story[]> {
    const db = await getDb();
    const rows = await db.select().from(t).where(eq(t.spaceId, spaceId)).orderBy(desc(t.updatedAt));
    return rows.map(rowToStory);
  }

  async findById(id: string): Promise<Story | undefined> {
    const db = await getDb();
    const rows = await db.select().from(t).where(eq(t.id, id)).limit(1);
    return rows[0] ? rowToStory(rows[0]) : undefined;
  }

  async spaceOf(id: string): Promise<string | undefined> {
    const db = await getDb();
    const rows = await db.select({ spaceId: t.spaceId }).from(t).where(eq(t.id, id)).limit(1);
    return rows[0]?.spaceId;
  }

  async create(spaceId: string, input: { name: string; contentType?: string; author?: string }): Promise<Story> {
    const db = await getDb();
    const contentType = input.contentType ?? "page";
    const content: BlockNode = {
      component: "page",
      props: { title: input.name },
      children: [{ component: "hero", props: { headline: input.name, subline: "Built with Flowblok" } }],
    };
    const [row] = await db
      .insert(t)
      .values({
        id: "st_" + randomUUID().slice(0, 12),
        spaceId,
        name: input.name,
        slug: kebabCase(input.name),
        contentType,
        status: "draft",
        author: input.author ?? "You",
        content,
      })
      .returning();
    return rowToStory(row);
  }

  async update(id: string, patch: Partial<Story>, label = "Manual save"): Promise<Story | undefined> {
    const db = await getDb();
    const set: Partial<DbStory> = { updatedAt: new Date().toISOString() };
    if (patch.name !== undefined) set.name = patch.name;
    if (patch.status !== undefined) set.status = patch.status;
    if (patch.folder !== undefined) set.folder = patch.folder;
    if (patch.content !== undefined) set.content = patch.content;
    const [row] = await db.update(t).set(set).where(eq(t.id, id)).returning();
    if (!row) return undefined;
    if (patch.content !== undefined) await this.snapshot(row, label);
    return rowToStory(row);
  }

  private async snapshot(row: DbStory, label: string): Promise<void> {
    const db = await getDb();
    await db.insert(v).values({
      id: "ver_" + randomUUID().slice(0, 12),
      storyId: row.id,
      author: row.author,
      label,
      content: row.content,
    });
  }

  async listVersions(id: string): Promise<StoryVersion[]> {
    const db = await getDb();
    let rows = await db.select().from(v).where(eq(v.storyId, id)).orderBy(desc(v.at)).limit(50);
    if (!rows.length) {
      const story = (await db.select().from(t).where(eq(t.id, id)).limit(1))[0];
      if (story) {
        await this.snapshot(story, "Initial version");
        rows = await db.select().from(v).where(eq(v.storyId, id)).orderBy(desc(v.at)).limit(50);
      }
    }
    return rows.map((r) => ({ id: r.id, at: new Date(r.at).toISOString(), author: r.author, label: r.label, content: r.content }));
  }

  async restore(id: string, versionId: string): Promise<Story | undefined> {
    const db = await getDb();
    const ver = (await db.select().from(v).where(and(eq(v.id, versionId), eq(v.storyId, id))).limit(1))[0];
    if (!ver) return undefined;
    return this.update(id, { content: ver.content }, "Restored from " + ver.label);
  }

  async remove(id: string): Promise<Story | undefined> {
    const db = await getDb();
    const [row] = await db.delete(t).where(eq(t.id, id)).returning();
    return row ? rowToStory(row) : undefined;
  }

  // Folders derived from the stories' folder field within a space.
  async listFoldersForSpace(spaceId: string): Promise<Folder[]> {
    const all = await this.findAllForSpace(spaceId);
    const counts = new Map<string, number>();
    for (const s of all) {
      if (s.folder) counts.set(s.folder, (counts.get(s.folder) ?? 0) + 1);
    }
    return [...counts.entries()].map(([name, storyCount]) => ({ id: kebabCase(name), name, storyCount }));
  }
}

export const contentRepository = new ContentRepository();
