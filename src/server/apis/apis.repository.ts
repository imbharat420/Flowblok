// Repository layer — the ONLY layer that talks to the data source.
// Holds its own in-memory seed catalog; swap for an OpenAPI introspection
// source without touching the service or controller.

import type { ApiEndpoint } from "./apis.types";

const endpoints: ApiEndpoint[] = [
  // content
  {
    id: "ep-content-list",
    method: "GET",
    path: "/v2/content/stories",
    resource: "content",
    auth: "Public",
    description: "List published stories with pagination, search and status filters.",
  },
  {
    id: "ep-content-get",
    method: "GET",
    path: "/v2/content/stories/{id}",
    resource: "content",
    auth: "Public",
    description: "Fetch a single story by id, including resolved relations.",
  },
  {
    id: "ep-content-create",
    method: "POST",
    path: "/v2/content/stories",
    resource: "content",
    auth: "JWT",
    description: "Create a new story from a content-type schema.",
  },
  {
    id: "ep-content-update",
    method: "PUT",
    path: "/v2/content/stories/{id}",
    resource: "content",
    auth: "JWT",
    description: "Update a story's fields and publishing status.",
  },
  // components
  {
    id: "ep-components-list",
    method: "GET",
    path: "/v2/components",
    resource: "components",
    auth: "JWT",
    description: "List component (block) schemas defined in the space.",
  },
  {
    id: "ep-components-create",
    method: "POST",
    path: "/v2/components",
    resource: "components",
    auth: "JWT",
    description: "Define a new component schema with typed fields.",
  },
  {
    id: "ep-components-delete",
    method: "DELETE",
    path: "/v2/components/{id}",
    resource: "components",
    auth: "JWT",
    description: "Remove a component schema and detach it from stories.",
  },
  // database
  {
    id: "ep-database-query",
    method: "POST",
    path: "/v2/database/tables/{table}/query",
    resource: "database",
    auth: "JWT",
    description: "Run a filtered, paginated query against a managed table.",
  },
  {
    id: "ep-database-list",
    method: "GET",
    path: "/v2/database/tables",
    resource: "database",
    auth: "JWT",
    description: "List managed tables and their row counts.",
  },
  {
    id: "ep-database-insert",
    method: "POST",
    path: "/v2/database/tables/{table}/rows",
    resource: "database",
    auth: "JWT",
    description: "Insert one or more rows into a managed table.",
  },
  // workflows
  {
    id: "ep-workflows-list",
    method: "GET",
    path: "/v2/workflows",
    resource: "workflows",
    auth: "JWT",
    description: "List automation workflows and their run statistics.",
  },
  {
    id: "ep-workflows-trigger",
    method: "POST",
    path: "/v2/workflows/{id}/trigger",
    resource: "workflows",
    auth: "JWT",
    description: "Manually trigger a workflow run with an optional payload.",
  },
  // crm
  {
    id: "ep-crm-contacts",
    method: "GET",
    path: "/v2/crm/contacts",
    resource: "crm",
    auth: "JWT",
    description: "List CRM contacts with segment and lifecycle filters.",
  },
  {
    id: "ep-crm-update",
    method: "PUT",
    path: "/v2/crm/contacts/{id}",
    resource: "crm",
    auth: "JWT",
    description: "Update a contact's properties and lifecycle stage.",
  },
  // commerce
  {
    id: "ep-commerce-products",
    method: "GET",
    path: "/v2/commerce/products",
    resource: "commerce",
    auth: "Public",
    description: "List commerce products with price and inventory data.",
  },
  {
    id: "ep-commerce-order-cancel",
    method: "DELETE",
    path: "/v2/commerce/orders/{id}",
    resource: "commerce",
    auth: "JWT",
    description: "Cancel an order and release reserved inventory.",
  },
];

export class ApisRepository {
  findAll(): ApiEndpoint[] {
    return endpoints;
  }

  findById(id: string): ApiEndpoint | undefined {
    return endpoints.find((e) => e.id === id);
  }
}

export const apisRepository = new ApisRepository();
