// Service layer — business logic: filtering and derived stats.
// Knows nothing about HTTP. Pure, testable, reusable from routes or RSC.

import { ApisRepository, apisRepository } from "./apis.repository";
import type { ApiEndpoint, HttpMethod } from "./apis.types";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE"];

export interface ApisListQuery {
  method?: HttpMethod;
  search?: string;
}

export class ApisService {
  constructor(private readonly repo: ApisRepository = apisRepository) {}

  list(query: ApisListQuery = {}): ApiEndpoint[] {
    let items = this.repo.findAll();

    if (query.method) items = items.filter((e) => e.method === query.method);
    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (e) =>
          e.path.toLowerCase().includes(q) ||
          e.resource.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      );
    }

    // Sort by resource, then path — stable, readable catalog ordering.
    return [...items].sort(
      (a, b) => a.resource.localeCompare(b.resource) || a.path.localeCompare(b.path),
    );
  }

  getById(id: string): ApiEndpoint | null {
    return this.repo.findById(id) ?? null;
  }

  methodBreakdown(): Record<HttpMethod, number> {
    const base = METHODS.reduce<Record<HttpMethod, number>>(
      (acc, m) => {
        acc[m] = 0;
        return acc;
      },
      {} as Record<HttpMethod, number>,
    );
    return this.repo.findAll().reduce((acc, e) => {
      acc[e.method] += 1;
      return acc;
    }, base);
  }

  resources(): string[] {
    return [...new Set(this.repo.findAll().map((e) => e.resource))].sort();
  }
}

export const apisService = new ApisService();
