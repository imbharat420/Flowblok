// Repository layer for the Pages module.
//
// Pages are a focused view of page-type Stories. To stay DRY and avoid a second
// source of truth that would drift from /content, this repo reads through the
// shared content repository rather than holding a duplicate seed array. The
// page-type filter lives here so the service/controller never see non-page rows.

import { contentRepository, ContentRepository } from "@/server/content/content.repository";
import type { Story } from "@/lib/types";
import { isPageType } from "./pages.types";

export class PagesRepository {
  constructor(private readonly content: ContentRepository = contentRepository) {}

  findAll(): Story[] {
    return this.content.findAll().filter((s) => isPageType(s.contentType));
  }

  findById(id: string): Story | undefined {
    const story = this.content.findById(id);
    return story && isPageType(story.contentType) ? story : undefined;
  }
}

export const pagesRepository = new PagesRepository();
