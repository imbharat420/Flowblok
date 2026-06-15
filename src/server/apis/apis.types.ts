// Module-local types for the API explorer.

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type ApiAuth = "JWT" | "Public";

export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  resource: string;
  auth: ApiAuth;
  description: string;
}

export interface ApiCatalogResponse {
  items: ApiEndpoint[];
  total: number;
  meta: {
    methodBreakdown: Record<HttpMethod, number>;
    resources: string[];
  };
}
