// Repository layer — the ONLY layer that talks to the data source.
// Swap `db` for Prisma/Supabase without touching the service or controller.

import { folders, stories } from "@/server/db";
import type { Folder, Story } from "@/lib/types";

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
}

export const contentRepository = new ContentRepository();
