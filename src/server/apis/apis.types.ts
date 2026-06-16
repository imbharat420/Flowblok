// Module-local types for the API explorer.

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type ApiAuth = "JWT" | "Public";

// Summary shape consumed by the /apis explorer page (DataTable + drawer).
// `description` is kept as an alias of the catalog `summary` for backward-compat;
// `kind`/`summary` are additive and ignored by the explorer.
export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  resource: string;
  auth: ApiAuth;
  description: string;
  kind?: "read" | "mutation";
  summary?: string;
}

export interface ApiCatalogResponse {
  items: ApiEndpoint[];
  total: number;
  meta: {
    methodBreakdown: Record<HttpMethod, number>;
    resources: string[];
  };
}
