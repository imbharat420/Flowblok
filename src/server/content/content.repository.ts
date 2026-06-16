// Repository layer — the ONLY layer that talks to the data source.
// Swap `db` for Prisma/Supabase without touching the service or controller.

import { folders, stories } from "@/server/db";
import type { Folder, Story, StoryVersion } from "@/lib/types";

// In-memory version history per story (newest first).
const versions: Record<string, StoryVersion[]> = {};
let versionSeq = 0;

export class ContentRepository {
  findAll(): Story[] {
    return stories;
  }

  findById(id: string): Story | undefined {
    return stories.find((s) => s.id === id);
  }

  findBySlug(slug: string): Story | undefined {
    return stories.find((s) => s.slug === slug);
  }

  listFolders(): Folder[] {
    return folders;
  }

  update(id: string, patch: Partial<Story>, label = "Manual save"): Story | undefined {
    const idx = stories.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    stories[idx] = { ...stories[idx], ...patch, updatedAt: new Date().toISOString() };
    if (patch.content) this.snapshot(stories[idx], label);
    return stories[idx];
  }

  private snapshot(story: Story, label: string): void {
    versionSeq += 1;
    const list = versions[story.id] ?? (versions[story.id] = []);
    list.unshift({
      id: "v_" + versionSeq,
      at: new Date().toISOString(),
      author: story.author,
      label,
      content: structuredClone(story.content),
    });
    if (list.length > 50) list.length = 50;
  }

  listVersions(id: string): StoryVersion[] {
    if (!versions[id]) {
      const s = this.findById(id);
      if (s) this.snapshot(s, "Initial version");
    }
    return versions[id] ?? [];
  }

  restore(id: string, versionId: string): Story | undefined {
    const v = (versions[id] ?? []).find((x) => x.id === versionId);
    if (!v) return undefined;
    return this.update(id, { content: structuredClone(v.content) }, "Restored from " + v.label);
  }

  create(input: { name: string; contentType?: string }): Story {
    const contentType = input.contentType ?? "page";
    const story: Story = {
      id: "st_" + String(stories.length + 1).padStart(3, "0"),
      name: input.name,
      slug: kebabCase(input.name),
      contentType,
      status: "draft",
      folder: null,
      author: "Dharamraj N.",
      updatedAt: new Date().toISOString(),
      content: {
        component: "page",
        props: { title: input.name },
        children: [
          { component: "hero", props: { headline: input.name, subline: "Built with Flowblok" } },
        ],
      },
    };
    stories.push(story);
    return story;
  }

  remove(id: string): Story | undefined {
    const idx = stories.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    const [removed] = stories.splice(idx, 1);
    return removed;
  }
}

function kebabCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const contentRepository = new ContentRepository();
