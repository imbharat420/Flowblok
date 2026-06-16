// Service layer — business logic: filtering, summary projection and derived stats.
// Knows nothing about HTTP. Pure, testable, reusable from routes or RSC.

import { ApisRepository, apisRepository } from "./apis.repository";
import type { ApiEndpoint, ApiAuth, HttpMethod } from "./apis.types";
import type { EndpointProfile, ProfileAuth } from "./endpoint-profiles";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE"];

export interface ApisListQuery {
  method?: HttpMethod;
  search?: string;
}

// Catalog auth is lowercase (public/jwt/api_key); the explorer renders the
// legacy "JWT"/"Public" badge — public stays Public, everything else is JWT.
function authLabel(auth: ProfileAuth): ApiAuth {
  return auth === "public" ? "Public" : "JWT";
}

// Project a full profile down to the summary the explorer + binder list consume.
// `method` is widened at runtime to include PATCH; the explorer treats unknown
// methods as a neutral badge, so this is safe.
function toSummary(p: EndpointProfile): ApiEndpoint {
  return {
    id: p.id,
    method: p.method as HttpMethod,
    path: p.path,
    resource: p.resource,
    auth: authLabel(p.auth),
    description: p.summary,
    kind: p.kind,
    summary: p.summary,
  };
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
          e.summary.toLowerCase().includes(q),
      );
    }

    // Sort by resource, then path — stable, readable catalog ordering.
    return [...items]
      .sort((a, b) => a.resource.localeCompare(b.resource) || a.path.localeCompare(b.path))
      .map(toSummary);
  }

  getById(id: string): EndpointProfile | null {
    return this.repo.findById(id) ?? null;
  }

  // Count only the four methods the explorer renders; PATCH is folded out so the
  // Record<HttpMethod, number> stays exactly keyed.
  methodBreakdown(): Record<HttpMethod, number> {
    const base = METHODS.reduce<Record<HttpMethod, number>>(
      (acc, m) => {
        acc[m] = 0;
        return acc;
      },
      {} as Record<HttpMethod, number>,
    );
    return this.repo.findAll().reduce((acc, e) => {
      if (METHODS.includes(e.method as HttpMethod)) acc[e.method as HttpMethod] += 1;
      return acc;
    }, base);
  }

  resources(): string[] {
    return [...new Set(this.repo.findAll().map((e) => e.resource))].sort();
  }
}

export const apisService = new ApisService();
