// AUTO-SYNTHESIZED from the platform endpoint design catalog.
// One method-aware EndpointProfile per endpoint (deduped by id, all groups flattened).
// GET => read (response fields render into the block). Non-GET => mutation (request body + result target).
// `resource` falls back to the first path segment when the catalog left it null.

export type ProfileMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ProfileKind = "read" | "mutation";
export type ProfileAuth = "public" | "jwt" | "api_key";
export type ApiFieldType =
  | "string"
  | "number"
  | "boolean"
  | "id"
  | "enum"
  | "date"
  | "array"
  | "object";

export interface ApiFieldSpec {
  name: string;
  type: ApiFieldType;
  required?: boolean;
  description?: string;
  values?: string[];
}

export interface EndpointProfile {
  id: string;
  method: ProfileMethod;
  path: string;
  kind: ProfileKind;
  auth: ProfileAuth;
  resource: string;
  summary: string;
  pathParams: ApiFieldSpec[];
  queryParams: ApiFieldSpec[];
  requestBody: ApiFieldSpec[];
  responseFields: ApiFieldSpec[];
  triggers: string[];
  renderTargets: string[];
  bindingHint: string;
}

export const ENDPOINT_PROFILES: EndpointProfile[] = [
  {
    "id": "ep-content-stories-list",
    "method": "GET",
    "path": "/v2/content/stories",
    "kind": "read",
    "auth": "public",
    "resource": "content",
    "summary": "List stories (pages/posts/products) with pagination, search, folder, status and content-type filters.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "search",
        "type": "string",
        "required": false,
        "description": "Full-text match against story name and slug."
      },
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "draft",
          "review",
          "published"
        ],
        "description": "Filter by publishing status."
      },
      {
        "name": "contentType",
        "type": "enum",
        "required": false,
        "values": [
          "page",
          "post",
          "product"
        ],
        "description": "Filter by content-type / root component."
      },
      {
        "name": "folder",
        "type": "id",
        "required": false,
        "description": "Restrict to a single folder id."
      },
      {
        "name": "sort",
        "type": "enum",
        "required": false,
        "values": [
          "updatedAt",
          "name",
          "status"
        ],
        "description": "Sort key (defaults to updatedAt desc)."
      },
      {
        "name": "page",
        "type": "number",
        "required": false,
        "description": "1-based page number."
      },
      {
        "name": "perPage",
        "type": "number",
        "required": false,
        "description": "Items per page (default 25, max 100)."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of story summary objects (item shape below)."
      },
      {
        "name": "items[].id",
        "type": "id",
        "required": true,
        "description": "Stable story id, e.g. st_001."
      },
      {
        "name": "items[].name",
        "type": "string",
        "required": true,
        "description": "Display name / title of the story."
      },
      {
        "name": "items[].slug",
        "type": "string",
        "required": true,
        "description": "URL slug."
      },
      {
        "name": "items[].contentType",
        "type": "enum",
        "required": true,
        "values": [
          "page",
          "post",
          "product"
        ],
        "description": "Root content-type component."
      },
      {
        "name": "items[].status",
        "type": "enum",
        "required": true,
        "values": [
          "draft",
          "review",
          "published"
        ],
        "description": "Publishing status."
      },
      {
        "name": "items[].folder",
        "type": "id",
        "required": false,
        "description": "Folder id or null."
      },
      {
        "name": "items[].author",
        "type": "string",
        "required": true,
        "description": "Last editor display name."
      },
      {
        "name": "items[].updatedAt",
        "type": "date",
        "required": true,
        "description": "ISO timestamp of last update."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Total matching stories across all pages."
      },
      {
        "name": "page",
        "type": "number",
        "required": true,
        "description": "Current page number."
      },
      {
        "name": "perPage",
        "type": "number",
        "required": true,
        "description": "Page size echoed back."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list",
      "field"
    ],
    "bindingHint": "Bind to a repeater block to render one card/row per story; fires on_load to populate index, archive, or product-grid layouts."
  },
  {
    "id": "ep-content-stories-detail",
    "method": "GET",
    "path": "/v2/content/stories/{id}",
    "kind": "read",
    "auth": "public",
    "resource": "content",
    "summary": "Fetch one story by id including its full nested block content tree and resolved relations.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Story id, e.g. st_001."
      }
    ],
    "queryParams": [
      {
        "name": "version",
        "type": "enum",
        "required": false,
        "values": [
          "draft",
          "published"
        ],
        "description": "Return draft working copy or the published snapshot (default published)."
      },
      {
        "name": "resolveRelations",
        "type": "boolean",
        "required": false,
        "description": "Resolve referenced stories/assets inline."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Story id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Story name / title."
      },
      {
        "name": "slug",
        "type": "string",
        "required": true,
        "description": "URL slug."
      },
      {
        "name": "contentType",
        "type": "enum",
        "required": true,
        "values": [
          "page",
          "post",
          "product"
        ],
        "description": "Root content-type."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "draft",
          "review",
          "published"
        ],
        "description": "Publishing status."
      },
      {
        "name": "folder",
        "type": "id",
        "required": false,
        "description": "Folder id or null."
      },
      {
        "name": "author",
        "type": "string",
        "required": true,
        "description": "Last editor."
      },
      {
        "name": "updatedAt",
        "type": "date",
        "required": true,
        "description": "ISO last-updated timestamp."
      },
      {
        "name": "content",
        "type": "object",
        "required": true,
        "description": "Root BlockNode { component, props, children[] } — the renderable block tree."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "detail",
      "field",
      "form"
    ],
    "bindingHint": "Bind to a single block to fill it with one story; use on_load for a detail page (post/product) or to prefill a form for editing."
  },
  {
    "id": "ep-content-stories-by-slug",
    "method": "GET",
    "path": "/v2/content/stories/by-slug/{slug}",
    "kind": "read",
    "auth": "public",
    "resource": "content",
    "summary": "Resolve a published story by its URL slug (route-driven page rendering).",
    "pathParams": [
      {
        "name": "slug",
        "type": "string",
        "required": true,
        "description": "URL slug, e.g. about-us."
      }
    ],
    "queryParams": [
      {
        "name": "version",
        "type": "enum",
        "required": false,
        "values": [
          "draft",
          "published"
        ],
        "description": "Draft or published copy (default published)."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Resolved story id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Story name."
      },
      {
        "name": "slug",
        "type": "string",
        "required": true,
        "description": "Matched slug."
      },
      {
        "name": "contentType",
        "type": "enum",
        "required": true,
        "values": [
          "page",
          "post",
          "product"
        ],
        "description": "Root content-type."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "draft",
          "review",
          "published"
        ],
        "description": "Publishing status."
      },
      {
        "name": "content",
        "type": "object",
        "required": true,
        "description": "Root BlockNode tree to render."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "detail",
      "field"
    ],
    "bindingHint": "Bind a page-root block to render the story matching the current route slug; resolves on_load before paint."
  },
  {
    "id": "ep-content-stories-create",
    "method": "POST",
    "path": "/v2/content/stories",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "content",
    "summary": "Create a new story (draft) from a content-type schema with an initial block tree.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Story name / title."
      },
      {
        "name": "contentType",
        "type": "enum",
        "required": false,
        "values": [
          "page",
          "post",
          "product"
        ],
        "description": "Root content-type (defaults to page)."
      },
      {
        "name": "folder",
        "type": "id",
        "required": false,
        "description": "Target folder id."
      },
      {
        "name": "slug",
        "type": "string",
        "required": false,
        "description": "Optional explicit slug; auto-derived from name if omitted."
      },
      {
        "name": "content",
        "type": "object",
        "required": false,
        "description": "Initial root BlockNode tree; a default scaffold is generated if omitted."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "New story id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Created story name."
      },
      {
        "name": "slug",
        "type": "string",
        "required": true,
        "description": "Derived or supplied slug."
      },
      {
        "name": "contentType",
        "type": "enum",
        "required": true,
        "values": [
          "page",
          "post",
          "product"
        ],
        "description": "Root content-type."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "draft",
          "review",
          "published"
        ],
        "description": "Always draft on creation."
      },
      {
        "name": "updatedAt",
        "type": "date",
        "required": true,
        "description": "ISO creation timestamp."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "action_button",
      "toast",
      "inline_message",
      "redirect",
      "refresh_block"
    ],
    "bindingHint": "Wire to a New Story form/button; on_submit creates the draft, then toast confirms and redirect opens the editor for the returned id."
  },
  {
    "id": "ep-content-stories-update",
    "method": "PUT",
    "path": "/v2/content/stories/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "content",
    "summary": "Replace a story's editable fields (name, status, full content tree); snapshots a version.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Story id to update."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "name",
        "type": "string",
        "required": false,
        "description": "New story name."
      },
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "draft",
          "review",
          "published"
        ],
        "description": "New publishing status."
      },
      {
        "name": "content",
        "type": "object",
        "required": false,
        "description": "Full replacement root BlockNode tree."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Story id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Updated name."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "draft",
          "review",
          "published"
        ],
        "description": "Updated status."
      },
      {
        "name": "content",
        "type": "object",
        "required": true,
        "description": "Saved BlockNode tree."
      },
      {
        "name": "updatedAt",
        "type": "date",
        "required": true,
        "description": "ISO timestamp of the save."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "action_button",
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to an editor Save action; on_submit persists the whole story and toast/inline_message reports success, refresh_block reloads the canvas."
  },
  {
    "id": "ep-content-stories-patch",
    "method": "PATCH",
    "path": "/v2/content/stories/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "content",
    "summary": "Partially update a story (rename, move folder, retitle) without sending the content tree.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Story id to patch."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "name",
        "type": "string",
        "required": false,
        "description": "New name."
      },
      {
        "name": "slug",
        "type": "string",
        "required": false,
        "description": "New slug."
      },
      {
        "name": "folder",
        "type": "id",
        "required": false,
        "description": "Move to this folder id (null to detach)."
      },
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "draft",
          "review",
          "published"
        ],
        "description": "New status."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Story id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Current name."
      },
      {
        "name": "slug",
        "type": "string",
        "required": true,
        "description": "Current slug."
      },
      {
        "name": "folder",
        "type": "id",
        "required": false,
        "description": "Current folder id or null."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "draft",
          "review",
          "published"
        ],
        "description": "Current status."
      },
      {
        "name": "updatedAt",
        "type": "date",
        "required": true,
        "description": "ISO update timestamp."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "action_button",
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Use for inline rename or a move-to-folder control; on_submit applies the metadata change and toast confirms, then refresh_block updates the list row."
  },
  {
    "id": "ep-content-stories-delete",
    "method": "DELETE",
    "path": "/v2/content/stories/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "content",
    "summary": "Delete a story permanently and detach it from its folder.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Story id to delete."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Id of the deleted story."
      },
      {
        "name": "deleted",
        "type": "boolean",
        "required": true,
        "description": "True when removal succeeded."
      }
    ],
    "triggers": [
      "on_click"
    ],
    "renderTargets": [
      "action_button",
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to a Delete button (with confirm); on_click removes the story, toast confirms and refresh_block drops it from the list."
  },
  {
    "id": "ep-content-stories-publish",
    "method": "POST",
    "path": "/v2/content/stories/{id}/publish",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "content",
    "summary": "Publish a story's current draft, optionally scheduling the release.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Story id to publish."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "publishAt",
        "type": "date",
        "required": false,
        "description": "ISO time to schedule publication; immediate if omitted."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Story id."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "draft",
          "review",
          "published"
        ],
        "description": "Resulting status (published)."
      },
      {
        "name": "publishedAt",
        "type": "date",
        "required": true,
        "description": "ISO timestamp the story went live."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "action_button",
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to a Publish button; on_click promotes the draft live, toast announces success and refresh_block updates the status badge."
  },
  {
    "id": "ep-content-stories-unpublish",
    "method": "POST",
    "path": "/v2/content/stories/{id}/unpublish",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "content",
    "summary": "Revert a published story back to draft so it disappears from public reads.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Story id to unpublish."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Story id."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "draft",
          "review",
          "published"
        ],
        "description": "Resulting status (draft)."
      },
      {
        "name": "updatedAt",
        "type": "date",
        "required": true,
        "description": "ISO timestamp of the change."
      }
    ],
    "triggers": [
      "on_click"
    ],
    "renderTargets": [
      "action_button",
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to an Unpublish action; on_click takes the story offline, toast confirms and refresh_block updates the status badge."
  },
  {
    "id": "ep-content-stories-versions-list",
    "method": "GET",
    "path": "/v2/content/stories/{id}/versions",
    "kind": "read",
    "auth": "jwt",
    "resource": "content",
    "summary": "List a story's saved content snapshots (version history), newest first.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Story id whose versions to list."
      }
    ],
    "queryParams": [
      {
        "name": "limit",
        "type": "number",
        "required": false,
        "description": "Max snapshots to return (default 50)."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of version snapshot objects (item shape below)."
      },
      {
        "name": "items[].id",
        "type": "id",
        "required": true,
        "description": "Version id, e.g. v_3."
      },
      {
        "name": "items[].at",
        "type": "date",
        "required": true,
        "description": "ISO timestamp the snapshot was taken."
      },
      {
        "name": "items[].author",
        "type": "string",
        "required": true,
        "description": "Who saved this version."
      },
      {
        "name": "items[].label",
        "type": "string",
        "required": true,
        "description": "Snapshot label, e.g. Manual save / Restored from ..."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "list",
      "field"
    ],
    "bindingHint": "Bind to a repeater in a version-history panel; on_load lists snapshots a user can preview or restore."
  },
  {
    "id": "ep-content-stories-restore",
    "method": "POST",
    "path": "/v2/content/stories/{id}/versions/{versionId}/restore",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "content",
    "summary": "Restore a story's content tree from a previous version snapshot.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Story id to restore."
      },
      {
        "name": "versionId",
        "type": "id",
        "required": true,
        "description": "Snapshot id to restore from, e.g. v_3."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Story id."
      },
      {
        "name": "content",
        "type": "object",
        "required": true,
        "description": "Restored root BlockNode tree."
      },
      {
        "name": "updatedAt",
        "type": "date",
        "required": true,
        "description": "ISO timestamp of the restore."
      }
    ],
    "triggers": [
      "on_click"
    ],
    "renderTargets": [
      "action_button",
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to a Restore button on a version row; on_click rolls the content back and refresh_block reloads the editor canvas."
  },
  {
    "id": "ep-content-folders-list",
    "method": "GET",
    "path": "/v2/content/folders",
    "kind": "read",
    "auth": "public",
    "resource": "content",
    "summary": "List content folders with their story counts for the content tree / sidebar.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of folder objects (item shape below)."
      },
      {
        "name": "items[].id",
        "type": "id",
        "required": true,
        "description": "Folder id."
      },
      {
        "name": "items[].name",
        "type": "string",
        "required": true,
        "description": "Folder display name."
      },
      {
        "name": "items[].storyCount",
        "type": "number",
        "required": true,
        "description": "Number of stories contained."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "list",
      "field"
    ],
    "bindingHint": "Bind to a sidebar/nav repeater to render folders with counts; on_load populates the content tree."
  },
  {
    "id": "ep-content-folders-create",
    "method": "POST",
    "path": "/v2/content/folders",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "content",
    "summary": "Create a new content folder for organizing stories.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Folder name."
      },
      {
        "name": "parent",
        "type": "id",
        "required": false,
        "description": "Parent folder id for nesting."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "New folder id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Created folder name."
      },
      {
        "name": "storyCount",
        "type": "number",
        "required": true,
        "description": "Story count (0 on creation)."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "action_button",
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Wire to a New Folder form/button; on_submit creates the folder, toast confirms and refresh_block updates the sidebar tree."
  },
  {
    "id": "ep-content-components-list",
    "method": "GET",
    "path": "/v2/content/components",
    "kind": "read",
    "auth": "jwt",
    "resource": "content",
    "summary": "List component (block) schemas in the space — the registry that drives the block library.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "category",
        "type": "enum",
        "required": false,
        "values": [
          "layout",
          "content",
          "media",
          "action",
          "commerce"
        ],
        "description": "Filter by palette category."
      },
      {
        "name": "search",
        "type": "string",
        "required": false,
        "description": "Match against component name or label."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of component-definition objects (item shape below)."
      },
      {
        "name": "items[].name",
        "type": "string",
        "required": true,
        "description": "Machine name matching BlockNode.component."
      },
      {
        "name": "items[].label",
        "type": "string",
        "required": true,
        "description": "Human label shown in the block library."
      },
      {
        "name": "items[].icon",
        "type": "string",
        "required": true,
        "description": "Lucide icon name."
      },
      {
        "name": "items[].category",
        "type": "enum",
        "required": true,
        "values": [
          "layout",
          "content",
          "media",
          "action",
          "commerce"
        ],
        "description": "Palette group."
      },
      {
        "name": "items[].fields",
        "type": "array",
        "required": true,
        "description": "Field definitions { key, label, type, options?, default? }."
      },
      {
        "name": "items[].allowChildren",
        "type": "boolean",
        "required": false,
        "description": "Whether the block can nest children."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "list",
      "field"
    ],
    "bindingHint": "Bind to the block-library palette repeater; on_load lists draggable component types and their schemas."
  },
  {
    "id": "ep-content-components-detail",
    "method": "GET",
    "path": "/v2/content/components/{name}",
    "kind": "read",
    "auth": "jwt",
    "resource": "content",
    "summary": "Fetch a single component schema by name including its full field definitions.",
    "pathParams": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Component machine name, e.g. hero."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Machine name."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Human label."
      },
      {
        "name": "icon",
        "type": "string",
        "required": true,
        "description": "Lucide icon name."
      },
      {
        "name": "category",
        "type": "enum",
        "required": true,
        "values": [
          "layout",
          "content",
          "media",
          "action",
          "commerce"
        ],
        "description": "Palette group."
      },
      {
        "name": "fields",
        "type": "array",
        "required": true,
        "description": "Field defs { key, label, type:(text|textarea|number|color|select|boolean), options?, default? }."
      },
      {
        "name": "allowChildren",
        "type": "boolean",
        "required": false,
        "description": "Whether nesting is allowed."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "detail",
      "form",
      "field"
    ],
    "bindingHint": "Bind to the Design tab inspector; on_load drives the field editor for the selected block from its schema."
  },
  {
    "id": "ep-content-components-create",
    "method": "POST",
    "path": "/v2/content/components",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "content",
    "summary": "Define a new component (block) schema with typed fields.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Unique machine name."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Human label."
      },
      {
        "name": "icon",
        "type": "string",
        "required": false,
        "description": "Lucide icon name."
      },
      {
        "name": "category",
        "type": "enum",
        "required": true,
        "values": [
          "layout",
          "content",
          "media",
          "action",
          "commerce"
        ],
        "description": "Palette group."
      },
      {
        "name": "fields",
        "type": "array",
        "required": true,
        "description": "Field definitions { key, label, type, options?, default? }."
      },
      {
        "name": "allowChildren",
        "type": "boolean",
        "required": false,
        "description": "Allow nested children."
      }
    ],
    "responseFields": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Created component name."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Created label."
      },
      {
        "name": "category",
        "type": "enum",
        "required": true,
        "values": [
          "layout",
          "content",
          "media",
          "action",
          "commerce"
        ],
        "description": "Palette group."
      },
      {
        "name": "fields",
        "type": "array",
        "required": true,
        "description": "Stored field definitions."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "action_button",
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Wire to a component-schema builder form; on_submit registers the block, toast confirms and refresh_block reloads the library."
  },
  {
    "id": "ep-content-components-update",
    "method": "PUT",
    "path": "/v2/content/components/{name}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "content",
    "summary": "Update a component schema's label, icon, category, or field definitions.",
    "pathParams": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Component name to update."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "label",
        "type": "string",
        "required": false,
        "description": "New human label."
      },
      {
        "name": "icon",
        "type": "string",
        "required": false,
        "description": "New lucide icon name."
      },
      {
        "name": "category",
        "type": "enum",
        "required": false,
        "values": [
          "layout",
          "content",
          "media",
          "action",
          "commerce"
        ],
        "description": "New palette group."
      },
      {
        "name": "fields",
        "type": "array",
        "required": false,
        "description": "Replacement field definitions."
      },
      {
        "name": "allowChildren",
        "type": "boolean",
        "required": false,
        "description": "Toggle nesting."
      }
    ],
    "responseFields": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Component name."
      },
      {
        "name": "label",
        "type": "string",
        "required": true,
        "description": "Updated label."
      },
      {
        "name": "category",
        "type": "enum",
        "required": true,
        "values": [
          "layout",
          "content",
          "media",
          "action",
          "commerce"
        ],
        "description": "Updated palette group."
      },
      {
        "name": "fields",
        "type": "array",
        "required": true,
        "description": "Updated field definitions."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "action_button",
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to the schema editor Save action; on_submit persists field changes, toast confirms and refresh_block reloads affected blocks."
  },
  {
    "id": "ep-content-components-delete",
    "method": "DELETE",
    "path": "/v2/content/components/{name}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "content",
    "summary": "Remove a component schema from the registry and detach it from stories.",
    "pathParams": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Component name to delete."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Name of the removed component."
      },
      {
        "name": "deleted",
        "type": "boolean",
        "required": true,
        "description": "True when removal succeeded."
      },
      {
        "name": "detachedCount",
        "type": "number",
        "required": true,
        "description": "Number of story blocks detached from this component."
      }
    ],
    "triggers": [
      "on_click"
    ],
    "renderTargets": [
      "action_button",
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to a Delete button in the component registry (with confirm); on_click removes the schema, toast reports the detached count and refresh_block reloads the library."
  },
  {
    "id": "ep-database-tables-list",
    "method": "GET",
    "path": "/v2/database/tables",
    "kind": "read",
    "auth": "jwt",
    "resource": "database",
    "summary": "List all managed (auto-generated) database tables in the space with row counts and schema metadata.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "search",
        "type": "string",
        "required": false,
        "description": "Filter tables by name substring."
      },
      {
        "name": "page",
        "type": "number",
        "required": false,
        "description": "1-based page number."
      },
      {
        "name": "per_page",
        "type": "number",
        "required": false,
        "description": "Items per page (default 25, max 100)."
      },
      {
        "name": "sort",
        "type": "string",
        "required": false,
        "description": "Sort field, e.g. name or row_count, optionally prefixed with - for desc."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Table id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Table machine name, e.g. products, customers, students."
      },
      {
        "name": "display_name",
        "type": "string",
        "required": false,
        "description": "Human label for the table."
      },
      {
        "name": "row_count",
        "type": "number",
        "required": true,
        "description": "Total rows currently stored."
      },
      {
        "name": "column_count",
        "type": "number",
        "required": false,
        "description": "Number of defined columns."
      },
      {
        "name": "primary_key",
        "type": "string",
        "required": false,
        "description": "Primary key column name."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": false,
        "description": "When the table was created."
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": false,
        "description": "Last schema/data change."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list",
      "detail",
      "field"
    ],
    "bindingHint": "Use on a table picker or admin dashboard block to render one row per managed table; bind on_load and repeat a card/list item per table."
  },
  {
    "id": "ep-database-table-schema-get",
    "method": "GET",
    "path": "/v2/database/tables/{table}",
    "kind": "read",
    "auth": "jwt",
    "resource": "database",
    "summary": "Fetch one managed table's schema: column definitions, types, and constraints.",
    "pathParams": [
      {
        "name": "table",
        "type": "string",
        "required": true,
        "description": "Table machine name, e.g. products."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Table id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Table machine name."
      },
      {
        "name": "display_name",
        "type": "string",
        "required": false,
        "description": "Human label."
      },
      {
        "name": "primary_key",
        "type": "string",
        "required": true,
        "description": "Primary key column."
      },
      {
        "name": "columns",
        "type": "array",
        "required": true,
        "description": "Array of column objects (name, type, nullable, default, unique, enum_values)."
      },
      {
        "name": "row_count",
        "type": "number",
        "required": false,
        "description": "Total rows stored."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": false,
        "description": "Creation timestamp."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "detail",
      "form",
      "field"
    ],
    "bindingHint": "Use to introspect a table before binding rows; drives dynamic form generation and column-aware filters in the binder UI."
  },
  {
    "id": "ep-database-rows-list",
    "method": "GET",
    "path": "/v2/database/tables/{table}/rows",
    "kind": "read",
    "auth": "api_key",
    "resource": "database",
    "summary": "List rows of any managed table (e.g. products, customers, students) with filter, sort, and pagination.",
    "pathParams": [
      {
        "name": "table",
        "type": "string",
        "required": true,
        "description": "Table machine name, e.g. products, customers, students."
      }
    ],
    "queryParams": [
      {
        "name": "filter",
        "type": "object",
        "required": false,
        "description": "Column filters as filter[col][op]=value, ops: eq, neq, gt, gte, lt, lte, like, in."
      },
      {
        "name": "sort",
        "type": "string",
        "required": false,
        "description": "Comma-separated sort columns, prefix - for desc, e.g. -created_at,name."
      },
      {
        "name": "select",
        "type": "array",
        "required": false,
        "description": "Subset of columns to return."
      },
      {
        "name": "page",
        "type": "number",
        "required": false,
        "description": "1-based page number."
      },
      {
        "name": "per_page",
        "type": "number",
        "required": false,
        "description": "Rows per page (default 25, max 100)."
      },
      {
        "name": "search",
        "type": "string",
        "required": false,
        "description": "Full-text search across text columns."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Row primary key."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": false,
        "description": "Row creation timestamp."
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": false,
        "description": "Row last-updated timestamp."
      },
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "Row column values keyed by column name (e.g. products: name string, price number, in_stock boolean; customers: email string, lifecycle enum; students: full_name string, gpa number)."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list",
      "detail",
      "field"
    ],
    "bindingHint": "The core read endpoint: bind to a repeating block (product grid, customer table, student roster) and map row.data fields to block fields; use on_load with filter/sort/pagination params."
  },
  {
    "id": "ep-database-row-get",
    "method": "GET",
    "path": "/v2/database/tables/{table}/rows/{id}",
    "kind": "read",
    "auth": "api_key",
    "resource": "database",
    "summary": "Fetch a single row by primary key from any managed table.",
    "pathParams": [
      {
        "name": "table",
        "type": "string",
        "required": true,
        "description": "Table machine name."
      },
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Row primary key value."
      }
    ],
    "queryParams": [
      {
        "name": "select",
        "type": "array",
        "required": false,
        "description": "Subset of columns to return."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Row primary key."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": false,
        "description": "Creation timestamp."
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": false,
        "description": "Last-updated timestamp."
      },
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "Full row column values keyed by column name."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "detail",
      "form",
      "field"
    ],
    "bindingHint": "Use on a detail page block (single product, customer profile, student record) where the row id comes from a route param or selection; fills one block or prefills an edit form."
  },
  {
    "id": "ep-database-row-create",
    "method": "POST",
    "path": "/v2/database/tables/{table}/rows",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "database",
    "summary": "Insert a new row into any managed table from submitted field values.",
    "pathParams": [
      {
        "name": "table",
        "type": "string",
        "required": true,
        "description": "Table machine name, e.g. products, customers, students."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "Column values for the new row, keyed by column name (e.g. products: {name, price, in_stock}; customers: {email, name, lifecycle}; students: {full_name, gpa, enrolled})."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Generated primary key of the new row."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true,
        "description": "Creation timestamp."
      },
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "The persisted row values, including server-applied defaults."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "redirect",
      "refresh_block",
      "form"
    ],
    "bindingHint": "Bind to a create form block; on_submit maps input fields into data, then show a success toast and refresh_block (or redirect to the new row's detail)."
  },
  {
    "id": "ep-database-row-update",
    "method": "PUT",
    "path": "/v2/database/tables/{table}/rows/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "database",
    "summary": "Replace all column values of an existing row in any managed table.",
    "pathParams": [
      {
        "name": "table",
        "type": "string",
        "required": true,
        "description": "Table machine name."
      },
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Row primary key to replace."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "Full set of column values; omitted columns are reset to defaults/null."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Row primary key."
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": true,
        "description": "Update timestamp."
      },
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "The persisted row values after replacement."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block",
      "form"
    ],
    "bindingHint": "Bind to an edit form prefilled from ep-database-row-get; on_submit sends the full record, then toast success and refresh_block to show updated values."
  },
  {
    "id": "ep-database-row-patch",
    "method": "PATCH",
    "path": "/v2/database/tables/{table}/rows/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "database",
    "summary": "Partially update one or more columns of an existing row in any managed table.",
    "pathParams": [
      {
        "name": "table",
        "type": "string",
        "required": true,
        "description": "Table machine name."
      },
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Row primary key to patch."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "Only the columns to change, keyed by column name (e.g. products: {price}; customers: {lifecycle}; students: {gpa})."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Row primary key."
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": true,
        "description": "Update timestamp."
      },
      {
        "name": "data",
        "type": "object",
        "required": true,
        "description": "The full row after the partial update."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block",
      "field"
    ],
    "bindingHint": "Use for inline edits and quick toggles (e.g. flip products.in_stock, bump students.gpa) from an action button; on_click sends only changed columns and refresh_block."
  },
  {
    "id": "ep-database-row-delete",
    "method": "DELETE",
    "path": "/v2/database/tables/{table}/rows/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "database",
    "summary": "Delete a single row by primary key from any managed table.",
    "pathParams": [
      {
        "name": "table",
        "type": "string",
        "required": true,
        "description": "Table machine name."
      },
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Row primary key to delete."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Primary key of the deleted row."
      },
      {
        "name": "deleted",
        "type": "boolean",
        "required": true,
        "description": "True when the row was removed."
      }
    ],
    "triggers": [
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block",
      "redirect"
    ],
    "bindingHint": "Bind to a delete/remove action button on a row block; on_click confirms then deletes, shows a toast and refresh_block (or redirect away from a detail page)."
  },
  {
    "id": "ep-database-rows-query",
    "method": "POST",
    "path": "/v2/database/tables/{table}/query",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "database",
    "summary": "Run a complex filtered/grouped query against a managed table when params exceed what the URL can carry.",
    "pathParams": [
      {
        "name": "table",
        "type": "string",
        "required": true,
        "description": "Table machine name."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "filters",
        "type": "array",
        "required": false,
        "description": "Array of {column, op, value} conditions combined with AND."
      },
      {
        "name": "or",
        "type": "array",
        "required": false,
        "description": "Array of filter groups combined with OR."
      },
      {
        "name": "sort",
        "type": "array",
        "required": false,
        "description": "Array of {column, direction} sort specs."
      },
      {
        "name": "select",
        "type": "array",
        "required": false,
        "description": "Columns to return."
      },
      {
        "name": "group_by",
        "type": "array",
        "required": false,
        "description": "Columns to group/aggregate by."
      },
      {
        "name": "page",
        "type": "number",
        "required": false,
        "description": "1-based page number."
      },
      {
        "name": "per_page",
        "type": "number",
        "required": false,
        "description": "Rows per page."
      }
    ],
    "responseFields": [
      {
        "name": "rows",
        "type": "array",
        "required": true,
        "description": "Matching rows, each {id, data, created_at, updated_at}."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Total rows matching the query."
      },
      {
        "name": "page",
        "type": "number",
        "required": false,
        "description": "Current page number."
      }
    ],
    "triggers": [
      "on_load",
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "list",
      "detail",
      "field"
    ],
    "bindingHint": "Use behind a search/filter panel block where users build advanced queries; on_submit runs the query and the rows feed a repeating list block."
  },
  {
    "id": "ep-database-rows-bulk-create",
    "method": "POST",
    "path": "/v2/database/tables/{table}/rows/bulk",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "database",
    "summary": "Insert many rows into a managed table in a single request (e.g. CSV import of products/customers/students).",
    "pathParams": [
      {
        "name": "table",
        "type": "string",
        "required": true,
        "description": "Table machine name."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "rows",
        "type": "array",
        "required": true,
        "description": "Array of data objects, one per row to insert."
      },
      {
        "name": "upsert",
        "type": "boolean",
        "required": false,
        "description": "If true, update existing rows on primary-key/unique conflict instead of failing."
      }
    ],
    "responseFields": [
      {
        "name": "inserted_count",
        "type": "number",
        "required": true,
        "description": "Number of rows inserted."
      },
      {
        "name": "updated_count",
        "type": "number",
        "required": false,
        "description": "Number of rows updated when upsert is on."
      },
      {
        "name": "ids",
        "type": "array",
        "required": true,
        "description": "Primary keys of affected rows."
      },
      {
        "name": "errors",
        "type": "array",
        "required": false,
        "description": "Per-row error objects for rows that failed validation."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to an import/upload action button; on_click submits parsed rows, then toast the inserted/updated counts and refresh_block to show the new data."
  },
  {
    "id": "ep-database-rows-bulk-delete",
    "method": "POST",
    "path": "/v2/database/tables/{table}/rows/bulk-delete",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "database",
    "summary": "Delete multiple rows from a managed table by ids or by a filter (bulk delete action).",
    "pathParams": [
      {
        "name": "table",
        "type": "string",
        "required": true,
        "description": "Table machine name."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "ids",
        "type": "array",
        "required": false,
        "description": "Explicit list of row primary keys to delete."
      },
      {
        "name": "filters",
        "type": "array",
        "required": false,
        "description": "Filter conditions selecting rows to delete when ids is omitted."
      }
    ],
    "responseFields": [
      {
        "name": "deleted_count",
        "type": "number",
        "required": true,
        "description": "Number of rows deleted."
      },
      {
        "name": "deleted",
        "type": "boolean",
        "required": true,
        "description": "True when the bulk delete succeeded."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to a bulk-action button driven by selected rows in a list block; on_click deletes the selection, shows a count toast and refresh_block."
  },
  {
    "id": "ep-database-table-count",
    "method": "GET",
    "path": "/v2/database/tables/{table}/count",
    "kind": "read",
    "auth": "api_key",
    "resource": "database",
    "summary": "Return the count of rows in a managed table, optionally filtered (for stat/KPI blocks).",
    "pathParams": [
      {
        "name": "table",
        "type": "string",
        "required": true,
        "description": "Table machine name."
      }
    ],
    "queryParams": [
      {
        "name": "filter",
        "type": "object",
        "required": false,
        "description": "Optional column filters using the same syntax as the rows list endpoint."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "count",
        "type": "number",
        "required": true,
        "description": "Number of rows matching the filter (or total when unfiltered)."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "field",
      "detail"
    ],
    "bindingHint": "Bind to a single-value stat/metric block (e.g. 'In-stock products', 'Active students') mapping count to a field; refresh on_interval for live counters."
  },
  {
    "id": "ep-database-table-export",
    "method": "POST",
    "path": "/v2/database/tables/{table}/export",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "database",
    "summary": "Generate a downloadable export (CSV/JSON) of a managed table's rows, optionally filtered.",
    "pathParams": [
      {
        "name": "table",
        "type": "string",
        "required": true,
        "description": "Table machine name."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "format",
        "type": "enum",
        "required": true,
        "values": [
          "csv",
          "json",
          "xlsx"
        ],
        "description": "Export file format."
      },
      {
        "name": "filters",
        "type": "array",
        "required": false,
        "description": "Optional filter conditions to limit exported rows."
      },
      {
        "name": "columns",
        "type": "array",
        "required": false,
        "description": "Columns to include in the export."
      }
    ],
    "responseFields": [
      {
        "name": "download_url",
        "type": "string",
        "required": true,
        "description": "Signed URL to fetch the generated export file."
      },
      {
        "name": "row_count",
        "type": "number",
        "required": true,
        "description": "Rows included in the export."
      },
      {
        "name": "expires_at",
        "type": "date",
        "required": false,
        "description": "When the download URL expires."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "redirect",
      "action_button"
    ],
    "bindingHint": "Bind to an export/download action button; on_click generates the file then surfaces the download_url via a toast or redirect to start the download."
  },
  {
    "id": "ep-crm-leads-list",
    "method": "GET",
    "path": "/v2/crm/leads",
    "kind": "read",
    "auth": "jwt",
    "resource": "crm",
    "summary": "List leads with status, source, owner and search filters, paginated.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "q",
        "type": "string",
        "required": false,
        "description": "Full-text search across name, email and company."
      },
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "new",
          "working",
          "qualified",
          "unqualified",
          "converted"
        ],
        "description": "Filter by lead status."
      },
      {
        "name": "source",
        "type": "enum",
        "required": false,
        "values": [
          "web_form",
          "referral",
          "ad",
          "event",
          "cold_outreach",
          "import"
        ],
        "description": "Filter by acquisition source."
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false,
        "description": "Filter by assigned sales owner."
      },
      {
        "name": "sort",
        "type": "enum",
        "required": false,
        "values": [
          "created_at",
          "-created_at",
          "score",
          "-score",
          "last_name"
        ],
        "description": "Sort order; prefix with - for descending."
      },
      {
        "name": "page",
        "type": "number",
        "required": false,
        "description": "1-based page number."
      },
      {
        "name": "per_page",
        "type": "number",
        "required": false,
        "description": "Items per page (default 25, max 100)."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of lead objects (the item shape follows)."
      },
      {
        "name": "items[].id",
        "type": "id",
        "required": true,
        "description": "Lead identifier."
      },
      {
        "name": "items[].first_name",
        "type": "string",
        "required": true
      },
      {
        "name": "items[].last_name",
        "type": "string",
        "required": true
      },
      {
        "name": "items[].email",
        "type": "string",
        "required": false
      },
      {
        "name": "items[].phone",
        "type": "string",
        "required": false
      },
      {
        "name": "items[].company_name",
        "type": "string",
        "required": false
      },
      {
        "name": "items[].status",
        "type": "enum",
        "required": true,
        "values": [
          "new",
          "working",
          "qualified",
          "unqualified",
          "converted"
        ]
      },
      {
        "name": "items[].source",
        "type": "enum",
        "required": false,
        "values": [
          "web_form",
          "referral",
          "ad",
          "event",
          "cold_outreach",
          "import"
        ]
      },
      {
        "name": "items[].score",
        "type": "number",
        "required": false,
        "description": "Lead score 0-100."
      },
      {
        "name": "items[].owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "items[].created_at",
        "type": "date",
        "required": true
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Total matching leads."
      },
      {
        "name": "page",
        "type": "number",
        "required": true
      },
      {
        "name": "per_page",
        "type": "number",
        "required": true
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list",
      "field"
    ],
    "bindingHint": "Use for a leads table or inbox; bind to a repeating row block that fires on_load and renders one row per lead in a list."
  },
  {
    "id": "ep-crm-leads-detail",
    "method": "GET",
    "path": "/v2/crm/leads/{id}",
    "kind": "read",
    "auth": "jwt",
    "resource": "crm",
    "summary": "Fetch a single lead with full profile, score and conversion state.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Lead identifier."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true
      },
      {
        "name": "first_name",
        "type": "string",
        "required": true
      },
      {
        "name": "last_name",
        "type": "string",
        "required": true
      },
      {
        "name": "email",
        "type": "string",
        "required": false
      },
      {
        "name": "phone",
        "type": "string",
        "required": false
      },
      {
        "name": "company_name",
        "type": "string",
        "required": false
      },
      {
        "name": "title",
        "type": "string",
        "required": false
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "new",
          "working",
          "qualified",
          "unqualified",
          "converted"
        ]
      },
      {
        "name": "source",
        "type": "enum",
        "required": false,
        "values": [
          "web_form",
          "referral",
          "ad",
          "event",
          "cold_outreach",
          "import"
        ]
      },
      {
        "name": "score",
        "type": "number",
        "required": false
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "converted_contact_id",
        "type": "id",
        "required": false,
        "description": "Set once the lead is converted."
      },
      {
        "name": "notes",
        "type": "string",
        "required": false
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": true
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "detail",
      "form",
      "field"
    ],
    "bindingHint": "Use on a lead detail panel; fires on_load to fill a single block with the lead's profile or to prefill an edit form."
  },
  {
    "id": "ep-crm-leads-create",
    "method": "POST",
    "path": "/v2/crm/leads",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "crm",
    "summary": "Create a new lead (the core 'create lead' action), optionally auto-assigned.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "first_name",
        "type": "string",
        "required": true
      },
      {
        "name": "last_name",
        "type": "string",
        "required": true
      },
      {
        "name": "email",
        "type": "string",
        "required": false
      },
      {
        "name": "phone",
        "type": "string",
        "required": false
      },
      {
        "name": "company_name",
        "type": "string",
        "required": false
      },
      {
        "name": "title",
        "type": "string",
        "required": false
      },
      {
        "name": "source",
        "type": "enum",
        "required": false,
        "values": [
          "web_form",
          "referral",
          "ad",
          "event",
          "cold_outreach",
          "import"
        ]
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false,
        "description": "Assign to a sales owner; omit to use round-robin auto-assignment."
      },
      {
        "name": "notes",
        "type": "string",
        "required": false
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "New lead id."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "new",
          "working",
          "qualified",
          "unqualified",
          "converted"
        ]
      },
      {
        "name": "score",
        "type": "number",
        "required": false
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "redirect",
      "refresh_block"
    ],
    "bindingHint": "Bind a lead capture form here; on_submit maps inputs to the body, shows a success toast, and refreshes the leads list block."
  },
  {
    "id": "ep-crm-leads-update",
    "method": "PATCH",
    "path": "/v2/crm/leads/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "crm",
    "summary": "Update lead fields, status or owner (partial update).",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Lead identifier."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "first_name",
        "type": "string",
        "required": false
      },
      {
        "name": "last_name",
        "type": "string",
        "required": false
      },
      {
        "name": "email",
        "type": "string",
        "required": false
      },
      {
        "name": "phone",
        "type": "string",
        "required": false
      },
      {
        "name": "company_name",
        "type": "string",
        "required": false
      },
      {
        "name": "title",
        "type": "string",
        "required": false
      },
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "new",
          "working",
          "qualified",
          "unqualified",
          "converted"
        ]
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "notes",
        "type": "string",
        "required": false
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "new",
          "working",
          "qualified",
          "unqualified",
          "converted"
        ]
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": true
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to a lead edit form or a quick status dropdown; on_submit patches the lead and refreshes the detail block with a toast."
  },
  {
    "id": "ep-crm-leads-convert",
    "method": "POST",
    "path": "/v2/crm/leads/{id}/convert",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "crm",
    "summary": "Convert a qualified lead into a contact, optional company and optional deal.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Lead to convert."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "create_company",
        "type": "boolean",
        "required": false,
        "description": "Also create/link a company from the lead's company_name."
      },
      {
        "name": "company_id",
        "type": "id",
        "required": false,
        "description": "Link the new contact to an existing company instead of creating one."
      },
      {
        "name": "create_deal",
        "type": "boolean",
        "required": false,
        "description": "Open a deal as part of conversion."
      },
      {
        "name": "deal_name",
        "type": "string",
        "required": false
      },
      {
        "name": "deal_amount",
        "type": "number",
        "required": false
      },
      {
        "name": "pipeline_id",
        "type": "id",
        "required": false,
        "description": "Pipeline for the new deal; defaults to the primary pipeline."
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false
      }
    ],
    "responseFields": [
      {
        "name": "contact_id",
        "type": "id",
        "required": true,
        "description": "The created/linked contact."
      },
      {
        "name": "company_id",
        "type": "id",
        "required": false
      },
      {
        "name": "deal_id",
        "type": "id",
        "required": false
      },
      {
        "name": "lead_id",
        "type": "id",
        "required": true,
        "description": "Now marked status=converted."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "redirect",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to a 'Convert lead' button or modal; on_click converts and typically redirects to the new contact or deal, showing a success toast."
  },
  {
    "id": "ep-crm-contacts-list",
    "method": "GET",
    "path": "/v2/crm/contacts",
    "kind": "read",
    "auth": "jwt",
    "resource": "crm",
    "summary": "List contacts with lifecycle, company and search filters, paginated.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "q",
        "type": "string",
        "required": false,
        "description": "Search across name and email."
      },
      {
        "name": "lifecycle_stage",
        "type": "enum",
        "required": false,
        "values": [
          "subscriber",
          "lead",
          "customer",
          "evangelist",
          "other"
        ],
        "description": "Filter by lifecycle stage."
      },
      {
        "name": "company_id",
        "type": "id",
        "required": false,
        "description": "Only contacts at this company."
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "sort",
        "type": "enum",
        "required": false,
        "values": [
          "created_at",
          "-created_at",
          "last_name",
          "-last_name"
        ]
      },
      {
        "name": "page",
        "type": "number",
        "required": false
      },
      {
        "name": "per_page",
        "type": "number",
        "required": false
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of contact objects (item shape follows)."
      },
      {
        "name": "items[].id",
        "type": "id",
        "required": true
      },
      {
        "name": "items[].first_name",
        "type": "string",
        "required": true
      },
      {
        "name": "items[].last_name",
        "type": "string",
        "required": true
      },
      {
        "name": "items[].email",
        "type": "string",
        "required": false
      },
      {
        "name": "items[].phone",
        "type": "string",
        "required": false
      },
      {
        "name": "items[].company_id",
        "type": "id",
        "required": false
      },
      {
        "name": "items[].company_name",
        "type": "string",
        "required": false
      },
      {
        "name": "items[].lifecycle_stage",
        "type": "enum",
        "required": true,
        "values": [
          "subscriber",
          "lead",
          "customer",
          "evangelist",
          "other"
        ]
      },
      {
        "name": "items[].owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "items[].created_at",
        "type": "date",
        "required": true
      },
      {
        "name": "total",
        "type": "number",
        "required": true
      },
      {
        "name": "page",
        "type": "number",
        "required": true
      },
      {
        "name": "per_page",
        "type": "number",
        "required": true
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list",
      "field"
    ],
    "bindingHint": "Use for a contacts table or directory; bind to a repeating row block that loads on_load and renders one block per contact."
  },
  {
    "id": "ep-crm-contacts-detail",
    "method": "GET",
    "path": "/v2/crm/contacts/{id}",
    "kind": "read",
    "auth": "jwt",
    "resource": "crm",
    "summary": "Fetch a single contact profile with company link and lifecycle stage.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Contact identifier."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true
      },
      {
        "name": "first_name",
        "type": "string",
        "required": true
      },
      {
        "name": "last_name",
        "type": "string",
        "required": true
      },
      {
        "name": "email",
        "type": "string",
        "required": false
      },
      {
        "name": "phone",
        "type": "string",
        "required": false
      },
      {
        "name": "title",
        "type": "string",
        "required": false
      },
      {
        "name": "company_id",
        "type": "id",
        "required": false
      },
      {
        "name": "company_name",
        "type": "string",
        "required": false
      },
      {
        "name": "lifecycle_stage",
        "type": "enum",
        "required": true,
        "values": [
          "subscriber",
          "lead",
          "customer",
          "evangelist",
          "other"
        ]
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "tags",
        "type": "array",
        "required": false,
        "description": "Array of string tags."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": true
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "detail",
      "form",
      "field"
    ],
    "bindingHint": "Use on a contact detail page; loads on_load to fill one block with the profile or prefill an edit form."
  },
  {
    "id": "ep-crm-contacts-create",
    "method": "POST",
    "path": "/v2/crm/contacts",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "crm",
    "summary": "Create a new contact, optionally linked to a company.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "first_name",
        "type": "string",
        "required": true
      },
      {
        "name": "last_name",
        "type": "string",
        "required": true
      },
      {
        "name": "email",
        "type": "string",
        "required": false
      },
      {
        "name": "phone",
        "type": "string",
        "required": false
      },
      {
        "name": "title",
        "type": "string",
        "required": false
      },
      {
        "name": "company_id",
        "type": "id",
        "required": false
      },
      {
        "name": "lifecycle_stage",
        "type": "enum",
        "required": false,
        "values": [
          "subscriber",
          "lead",
          "customer",
          "evangelist",
          "other"
        ]
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "tags",
        "type": "array",
        "required": false
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true
      },
      {
        "name": "lifecycle_stage",
        "type": "enum",
        "required": true,
        "values": [
          "subscriber",
          "lead",
          "customer",
          "evangelist",
          "other"
        ]
      },
      {
        "name": "company_id",
        "type": "id",
        "required": false
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "redirect",
      "refresh_block"
    ],
    "bindingHint": "Bind a 'New contact' form here; on_submit creates the contact, toasts success, and refreshes the contacts list."
  },
  {
    "id": "ep-crm-contacts-update",
    "method": "PUT",
    "path": "/v2/crm/contacts/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "crm",
    "summary": "Update a contact's properties, company link and lifecycle stage.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Contact identifier."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "first_name",
        "type": "string",
        "required": false
      },
      {
        "name": "last_name",
        "type": "string",
        "required": false
      },
      {
        "name": "email",
        "type": "string",
        "required": false
      },
      {
        "name": "phone",
        "type": "string",
        "required": false
      },
      {
        "name": "title",
        "type": "string",
        "required": false
      },
      {
        "name": "company_id",
        "type": "id",
        "required": false
      },
      {
        "name": "lifecycle_stage",
        "type": "enum",
        "required": false,
        "values": [
          "subscriber",
          "lead",
          "customer",
          "evangelist",
          "other"
        ]
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "tags",
        "type": "array",
        "required": false
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true
      },
      {
        "name": "lifecycle_stage",
        "type": "enum",
        "required": true,
        "values": [
          "subscriber",
          "lead",
          "customer",
          "evangelist",
          "other"
        ]
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": true
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to a contact edit form; on_submit saves changes and refreshes the contact detail block with a toast."
  },
  {
    "id": "ep-crm-companies-list",
    "method": "GET",
    "path": "/v2/crm/companies",
    "kind": "read",
    "auth": "jwt",
    "resource": "crm",
    "summary": "List companies (accounts) with industry, size and search filters.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "q",
        "type": "string",
        "required": false,
        "description": "Search by company name or domain."
      },
      {
        "name": "industry",
        "type": "string",
        "required": false
      },
      {
        "name": "size",
        "type": "enum",
        "required": false,
        "values": [
          "1-10",
          "11-50",
          "51-200",
          "201-1000",
          "1000+"
        ],
        "description": "Employee count bucket."
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "sort",
        "type": "enum",
        "required": false,
        "values": [
          "name",
          "-name",
          "created_at",
          "-created_at"
        ]
      },
      {
        "name": "page",
        "type": "number",
        "required": false
      },
      {
        "name": "per_page",
        "type": "number",
        "required": false
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of company objects (item shape follows)."
      },
      {
        "name": "items[].id",
        "type": "id",
        "required": true
      },
      {
        "name": "items[].name",
        "type": "string",
        "required": true
      },
      {
        "name": "items[].domain",
        "type": "string",
        "required": false
      },
      {
        "name": "items[].industry",
        "type": "string",
        "required": false
      },
      {
        "name": "items[].size",
        "type": "enum",
        "required": false,
        "values": [
          "1-10",
          "11-50",
          "51-200",
          "201-1000",
          "1000+"
        ]
      },
      {
        "name": "items[].owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "items[].contact_count",
        "type": "number",
        "required": false
      },
      {
        "name": "items[].open_deal_count",
        "type": "number",
        "required": false
      },
      {
        "name": "items[].created_at",
        "type": "date",
        "required": true
      },
      {
        "name": "total",
        "type": "number",
        "required": true
      },
      {
        "name": "page",
        "type": "number",
        "required": true
      },
      {
        "name": "per_page",
        "type": "number",
        "required": true
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list",
      "field"
    ],
    "bindingHint": "Use for an accounts/companies table; bind to a repeating block that loads on_load and renders one row per company."
  },
  {
    "id": "ep-crm-companies-create",
    "method": "POST",
    "path": "/v2/crm/companies",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "crm",
    "summary": "Create a new company (account) record.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "name",
        "type": "string",
        "required": true
      },
      {
        "name": "domain",
        "type": "string",
        "required": false
      },
      {
        "name": "industry",
        "type": "string",
        "required": false
      },
      {
        "name": "size",
        "type": "enum",
        "required": false,
        "values": [
          "1-10",
          "11-50",
          "51-200",
          "201-1000",
          "1000+"
        ]
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "notes",
        "type": "string",
        "required": false
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true
      },
      {
        "name": "name",
        "type": "string",
        "required": true
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "redirect",
      "refresh_block"
    ],
    "bindingHint": "Bind a 'New company' form here; on_submit creates the account, toasts success, and refreshes the companies list."
  },
  {
    "id": "ep-crm-deals-list",
    "method": "GET",
    "path": "/v2/crm/deals",
    "kind": "read",
    "auth": "jwt",
    "resource": "crm",
    "summary": "List deals as a flat table filtered by stage, owner, pipeline and search.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "q",
        "type": "string",
        "required": false,
        "description": "Search by deal name."
      },
      {
        "name": "pipeline_id",
        "type": "id",
        "required": false
      },
      {
        "name": "stage",
        "type": "enum",
        "required": false,
        "values": [
          "new",
          "qualified",
          "proposal",
          "negotiation",
          "won",
          "lost"
        ],
        "description": "Filter by pipeline stage."
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "company_id",
        "type": "id",
        "required": false
      },
      {
        "name": "sort",
        "type": "enum",
        "required": false,
        "values": [
          "amount",
          "-amount",
          "close_date",
          "-close_date",
          "created_at",
          "-created_at"
        ]
      },
      {
        "name": "page",
        "type": "number",
        "required": false
      },
      {
        "name": "per_page",
        "type": "number",
        "required": false
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of deal objects (item shape follows)."
      },
      {
        "name": "items[].id",
        "type": "id",
        "required": true
      },
      {
        "name": "items[].name",
        "type": "string",
        "required": true
      },
      {
        "name": "items[].amount",
        "type": "number",
        "required": false
      },
      {
        "name": "items[].currency",
        "type": "string",
        "required": false
      },
      {
        "name": "items[].stage",
        "type": "enum",
        "required": true,
        "values": [
          "new",
          "qualified",
          "proposal",
          "negotiation",
          "won",
          "lost"
        ]
      },
      {
        "name": "items[].pipeline_id",
        "type": "id",
        "required": true
      },
      {
        "name": "items[].company_id",
        "type": "id",
        "required": false
      },
      {
        "name": "items[].primary_contact_id",
        "type": "id",
        "required": false
      },
      {
        "name": "items[].owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "items[].close_date",
        "type": "date",
        "required": false
      },
      {
        "name": "items[].probability",
        "type": "number",
        "required": false,
        "description": "Win probability 0-100."
      },
      {
        "name": "items[].created_at",
        "type": "date",
        "required": true
      },
      {
        "name": "total",
        "type": "number",
        "required": true
      },
      {
        "name": "page",
        "type": "number",
        "required": true
      },
      {
        "name": "per_page",
        "type": "number",
        "required": true
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list",
      "field"
    ],
    "bindingHint": "Use for a deals table or forecast list; bind to a repeating block that loads on_load and renders one row per deal."
  },
  {
    "id": "ep-crm-deals-detail",
    "method": "GET",
    "path": "/v2/crm/deals/{id}",
    "kind": "read",
    "auth": "jwt",
    "resource": "crm",
    "summary": "Fetch a single deal with stage, amount, contact and company links.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Deal identifier."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true
      },
      {
        "name": "name",
        "type": "string",
        "required": true
      },
      {
        "name": "amount",
        "type": "number",
        "required": false
      },
      {
        "name": "currency",
        "type": "string",
        "required": false
      },
      {
        "name": "stage",
        "type": "enum",
        "required": true,
        "values": [
          "new",
          "qualified",
          "proposal",
          "negotiation",
          "won",
          "lost"
        ]
      },
      {
        "name": "pipeline_id",
        "type": "id",
        "required": true
      },
      {
        "name": "company_id",
        "type": "id",
        "required": false
      },
      {
        "name": "primary_contact_id",
        "type": "id",
        "required": false
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "close_date",
        "type": "date",
        "required": false
      },
      {
        "name": "probability",
        "type": "number",
        "required": false
      },
      {
        "name": "notes",
        "type": "string",
        "required": false
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": true
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "detail",
      "form",
      "field"
    ],
    "bindingHint": "Use on a deal detail panel; loads on_load to fill one block with the deal or prefill an edit form."
  },
  {
    "id": "ep-crm-pipeline-board",
    "method": "GET",
    "path": "/v2/crm/pipelines/{pipeline_id}/board",
    "kind": "read",
    "auth": "jwt",
    "resource": "crm",
    "summary": "Get a pipeline's deals grouped by stage for a kanban board view.",
    "pathParams": [
      {
        "name": "pipeline_id",
        "type": "id",
        "required": true,
        "description": "Pipeline to render as a board."
      }
    ],
    "queryParams": [
      {
        "name": "owner_id",
        "type": "id",
        "required": false,
        "description": "Only include deals owned by this user."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "pipeline_id",
        "type": "id",
        "required": true
      },
      {
        "name": "pipeline_name",
        "type": "string",
        "required": true
      },
      {
        "name": "stages",
        "type": "array",
        "required": true,
        "description": "Ordered array of stage columns (column shape follows)."
      },
      {
        "name": "stages[].stage",
        "type": "enum",
        "required": true,
        "values": [
          "new",
          "qualified",
          "proposal",
          "negotiation",
          "won",
          "lost"
        ]
      },
      {
        "name": "stages[].label",
        "type": "string",
        "required": true
      },
      {
        "name": "stages[].deal_count",
        "type": "number",
        "required": true
      },
      {
        "name": "stages[].total_amount",
        "type": "number",
        "required": false,
        "description": "Sum of deal amounts in the column."
      },
      {
        "name": "stages[].deals",
        "type": "array",
        "required": true,
        "description": "Deal cards in the column with id, name, amount, owner_id, probability, close_date."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list",
      "field"
    ],
    "bindingHint": "Use for a deal pipeline kanban; bind to a board block that loads on_load and renders one column per stage with deal cards inside."
  },
  {
    "id": "ep-crm-deals-create",
    "method": "POST",
    "path": "/v2/crm/deals",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "crm",
    "summary": "Create a new deal in a pipeline's first (or specified) stage.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "name",
        "type": "string",
        "required": true
      },
      {
        "name": "pipeline_id",
        "type": "id",
        "required": true
      },
      {
        "name": "stage",
        "type": "enum",
        "required": false,
        "values": [
          "new",
          "qualified",
          "proposal",
          "negotiation",
          "won",
          "lost"
        ],
        "description": "Defaults to the pipeline's first stage."
      },
      {
        "name": "amount",
        "type": "number",
        "required": false
      },
      {
        "name": "currency",
        "type": "string",
        "required": false
      },
      {
        "name": "company_id",
        "type": "id",
        "required": false
      },
      {
        "name": "primary_contact_id",
        "type": "id",
        "required": false
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "close_date",
        "type": "date",
        "required": false
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true
      },
      {
        "name": "name",
        "type": "string",
        "required": true
      },
      {
        "name": "stage",
        "type": "enum",
        "required": true,
        "values": [
          "new",
          "qualified",
          "proposal",
          "negotiation",
          "won",
          "lost"
        ]
      },
      {
        "name": "pipeline_id",
        "type": "id",
        "required": true
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "redirect",
      "refresh_block"
    ],
    "bindingHint": "Bind a 'New deal' form here; on_submit creates the deal, toasts success, and refreshes the deals list or pipeline board."
  },
  {
    "id": "ep-crm-deals-move-stage",
    "method": "PATCH",
    "path": "/v2/crm/deals/{id}/stage",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "crm",
    "summary": "Move a deal to a new pipeline stage (the 'move deal stage' action).",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Deal to move."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "stage",
        "type": "enum",
        "required": true,
        "values": [
          "new",
          "qualified",
          "proposal",
          "negotiation",
          "won",
          "lost"
        ],
        "description": "Target stage."
      },
      {
        "name": "probability",
        "type": "number",
        "required": false,
        "description": "Optional updated win probability."
      },
      {
        "name": "lost_reason",
        "type": "string",
        "required": false,
        "description": "Required by some pipelines when moving to 'lost'."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true
      },
      {
        "name": "stage",
        "type": "enum",
        "required": true,
        "values": [
          "new",
          "qualified",
          "proposal",
          "negotiation",
          "won",
          "lost"
        ]
      },
      {
        "name": "probability",
        "type": "number",
        "required": false
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": true
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to a kanban card's drag/drop or a stage dropdown; on_click moves the deal and refreshes the pipeline board with a toast."
  },
  {
    "id": "ep-crm-deals-delete",
    "method": "DELETE",
    "path": "/v2/crm/deals/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "crm",
    "summary": "Delete a deal and remove it from its pipeline.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Deal to delete."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true
      },
      {
        "name": "deleted",
        "type": "boolean",
        "required": true
      }
    ],
    "triggers": [
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to a 'Delete deal' button with confirm; on_click removes the deal, toasts success, and refreshes the deals list or board."
  },
  {
    "id": "ep-crm-activities-list",
    "method": "GET",
    "path": "/v2/crm/activities",
    "kind": "read",
    "auth": "jwt",
    "resource": "crm",
    "summary": "List activities (calls, emails, notes, tasks) for a contact, deal or company.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "contact_id",
        "type": "id",
        "required": false,
        "description": "Filter to one contact's timeline."
      },
      {
        "name": "deal_id",
        "type": "id",
        "required": false
      },
      {
        "name": "company_id",
        "type": "id",
        "required": false
      },
      {
        "name": "type",
        "type": "enum",
        "required": false,
        "values": [
          "call",
          "email",
          "meeting",
          "note",
          "task"
        ],
        "description": "Filter by activity type."
      },
      {
        "name": "sort",
        "type": "enum",
        "required": false,
        "values": [
          "occurred_at",
          "-occurred_at"
        ]
      },
      {
        "name": "page",
        "type": "number",
        "required": false
      },
      {
        "name": "per_page",
        "type": "number",
        "required": false
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of activity objects (item shape follows)."
      },
      {
        "name": "items[].id",
        "type": "id",
        "required": true
      },
      {
        "name": "items[].type",
        "type": "enum",
        "required": true,
        "values": [
          "call",
          "email",
          "meeting",
          "note",
          "task"
        ]
      },
      {
        "name": "items[].subject",
        "type": "string",
        "required": false
      },
      {
        "name": "items[].body",
        "type": "string",
        "required": false
      },
      {
        "name": "items[].contact_id",
        "type": "id",
        "required": false
      },
      {
        "name": "items[].deal_id",
        "type": "id",
        "required": false
      },
      {
        "name": "items[].company_id",
        "type": "id",
        "required": false
      },
      {
        "name": "items[].owner_id",
        "type": "id",
        "required": false
      },
      {
        "name": "items[].occurred_at",
        "type": "date",
        "required": true
      },
      {
        "name": "items[].completed",
        "type": "boolean",
        "required": false
      },
      {
        "name": "total",
        "type": "number",
        "required": true
      },
      {
        "name": "page",
        "type": "number",
        "required": true
      },
      {
        "name": "per_page",
        "type": "number",
        "required": true
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list",
      "field"
    ],
    "bindingHint": "Use for an activity timeline on a contact/deal page; bind to a repeating block that loads on_load and renders one entry per activity."
  },
  {
    "id": "ep-crm-activities-create",
    "method": "POST",
    "path": "/v2/crm/activities",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "crm",
    "summary": "Log a new activity (call, email, note, meeting or task) against a record.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "type",
        "type": "enum",
        "required": true,
        "values": [
          "call",
          "email",
          "meeting",
          "note",
          "task"
        ]
      },
      {
        "name": "subject",
        "type": "string",
        "required": false
      },
      {
        "name": "body",
        "type": "string",
        "required": false
      },
      {
        "name": "contact_id",
        "type": "id",
        "required": false,
        "description": "At least one of contact_id, deal_id or company_id is required."
      },
      {
        "name": "deal_id",
        "type": "id",
        "required": false
      },
      {
        "name": "company_id",
        "type": "id",
        "required": false
      },
      {
        "name": "occurred_at",
        "type": "date",
        "required": false,
        "description": "Defaults to now."
      },
      {
        "name": "due_at",
        "type": "date",
        "required": false,
        "description": "For type=task."
      },
      {
        "name": "owner_id",
        "type": "id",
        "required": false
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true
      },
      {
        "name": "type",
        "type": "enum",
        "required": true,
        "values": [
          "call",
          "email",
          "meeting",
          "note",
          "task"
        ]
      },
      {
        "name": "occurred_at",
        "type": "date",
        "required": true
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind a 'Log activity' form or quick-note box here; on_submit logs the activity and refreshes the activity timeline block."
  },
  {
    "id": "ep-commerce-products-list",
    "method": "GET",
    "path": "/v2/commerce/products",
    "kind": "read",
    "auth": "api_key",
    "resource": "commerce",
    "summary": "Paginated, filterable catalog of products for storefront listing and grids.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "q",
        "type": "string",
        "required": false,
        "description": "Full-text search across product name, SKU, and description."
      },
      {
        "name": "category",
        "type": "string",
        "required": false,
        "description": "Filter by category slug or id."
      },
      {
        "name": "collection",
        "type": "string",
        "required": false,
        "description": "Filter by collection/curation slug."
      },
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "active",
          "draft",
          "archived"
        ],
        "description": "Publication status filter; defaults to active."
      },
      {
        "name": "min_price",
        "type": "number",
        "required": false,
        "description": "Minimum price in minor units."
      },
      {
        "name": "max_price",
        "type": "number",
        "required": false,
        "description": "Maximum price in minor units."
      },
      {
        "name": "in_stock",
        "type": "boolean",
        "required": false,
        "description": "When true, only returns products with available inventory."
      },
      {
        "name": "sort",
        "type": "enum",
        "required": false,
        "values": [
          "relevance",
          "price_asc",
          "price_desc",
          "newest",
          "best_selling"
        ],
        "description": "Result ordering."
      },
      {
        "name": "page",
        "type": "number",
        "required": false,
        "description": "1-based page index."
      },
      {
        "name": "per_page",
        "type": "number",
        "required": false,
        "description": "Items per page (max 100, default 24)."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of product summary objects (the repeatable item shape below)."
      },
      {
        "name": "items[].id",
        "type": "id",
        "required": true,
        "description": "Stable product identifier."
      },
      {
        "name": "items[].sku",
        "type": "string",
        "required": true,
        "description": "Stock-keeping unit code."
      },
      {
        "name": "items[].name",
        "type": "string",
        "required": true,
        "description": "Product display name."
      },
      {
        "name": "items[].slug",
        "type": "string",
        "required": true,
        "description": "URL-safe handle for detail routing."
      },
      {
        "name": "items[].price",
        "type": "number",
        "required": true,
        "description": "Current price in minor units (e.g. cents)."
      },
      {
        "name": "items[].compare_at_price",
        "type": "number",
        "required": false,
        "description": "Original/strikethrough price for showing discounts."
      },
      {
        "name": "items[].currency",
        "type": "string",
        "required": true,
        "description": "ISO 4217 currency code."
      },
      {
        "name": "items[].thumbnail",
        "type": "string",
        "required": false,
        "description": "Primary image URL."
      },
      {
        "name": "items[].in_stock",
        "type": "boolean",
        "required": true,
        "description": "Whether any variant is purchasable."
      },
      {
        "name": "items[].rating",
        "type": "number",
        "required": false,
        "description": "Average review rating 0-5."
      },
      {
        "name": "items[].status",
        "type": "enum",
        "required": true,
        "values": [
          "active",
          "draft",
          "archived"
        ],
        "description": "Publication status."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Total matching products across all pages."
      },
      {
        "name": "page",
        "type": "number",
        "required": true,
        "description": "Current page index."
      },
      {
        "name": "per_page",
        "type": "number",
        "required": true,
        "description": "Page size used."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list",
      "refresh_block"
    ],
    "bindingHint": "Bind to a repeater block to render product cards in a grid or listing page; fires on_load and re-fetches when filter inputs change."
  },
  {
    "id": "ep-commerce-products-detail",
    "method": "GET",
    "path": "/v2/commerce/products/{id}",
    "kind": "read",
    "auth": "api_key",
    "resource": "commerce",
    "summary": "Full product record including variants, media, and attributes for a product detail page.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Product id or slug."
      }
    ],
    "queryParams": [
      {
        "name": "include",
        "type": "array",
        "required": false,
        "description": "Optional expansions, e.g. variants, reviews, related."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Product identifier."
      },
      {
        "name": "sku",
        "type": "string",
        "required": true,
        "description": "Stock-keeping unit code."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Product display name."
      },
      {
        "name": "slug",
        "type": "string",
        "required": true,
        "description": "URL-safe handle."
      },
      {
        "name": "description",
        "type": "string",
        "required": false,
        "description": "Rich product description."
      },
      {
        "name": "price",
        "type": "number",
        "required": true,
        "description": "Current price in minor units."
      },
      {
        "name": "compare_at_price",
        "type": "number",
        "required": false,
        "description": "Original price for discount display."
      },
      {
        "name": "currency",
        "type": "string",
        "required": true,
        "description": "ISO 4217 currency code."
      },
      {
        "name": "images",
        "type": "array",
        "required": false,
        "description": "Array of media URLs/objects."
      },
      {
        "name": "variants",
        "type": "array",
        "required": false,
        "description": "Array of variant objects with id, options, price, and stock."
      },
      {
        "name": "attributes",
        "type": "object",
        "required": false,
        "description": "Key-value spec map (color, size, material, etc.)."
      },
      {
        "name": "in_stock",
        "type": "boolean",
        "required": true,
        "description": "Whether the product is purchasable."
      },
      {
        "name": "inventory_quantity",
        "type": "number",
        "required": false,
        "description": "Aggregate available units."
      },
      {
        "name": "rating",
        "type": "number",
        "required": false,
        "description": "Average review rating 0-5."
      },
      {
        "name": "review_count",
        "type": "number",
        "required": false,
        "description": "Number of reviews."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "active",
          "draft",
          "archived"
        ],
        "description": "Publication status."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "detail",
      "field",
      "form"
    ],
    "bindingHint": "Bind to a single product block on a detail page; populates title, gallery, price, and a variant selector when the page loads with a product id."
  },
  {
    "id": "ep-commerce-products-create",
    "method": "POST",
    "path": "/v2/commerce/products",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "commerce",
    "summary": "Create a new catalog product from an admin or merchant form.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Product display name."
      },
      {
        "name": "sku",
        "type": "string",
        "required": true,
        "description": "Unique stock-keeping unit code."
      },
      {
        "name": "description",
        "type": "string",
        "required": false,
        "description": "Rich product description."
      },
      {
        "name": "price",
        "type": "number",
        "required": true,
        "description": "Price in minor units."
      },
      {
        "name": "compare_at_price",
        "type": "number",
        "required": false,
        "description": "Original/list price for discount display."
      },
      {
        "name": "currency",
        "type": "string",
        "required": true,
        "description": "ISO 4217 currency code."
      },
      {
        "name": "category",
        "type": "string",
        "required": false,
        "description": "Category slug or id."
      },
      {
        "name": "images",
        "type": "array",
        "required": false,
        "description": "Array of media URLs to attach."
      },
      {
        "name": "variants",
        "type": "array",
        "required": false,
        "description": "Initial variant definitions."
      },
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "active",
          "draft",
          "archived"
        ],
        "description": "Initial publication status; defaults to draft."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Newly created product id."
      },
      {
        "name": "sku",
        "type": "string",
        "required": true,
        "description": "Assigned SKU."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Product name."
      },
      {
        "name": "slug",
        "type": "string",
        "required": true,
        "description": "Generated URL handle."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "active",
          "draft",
          "archived"
        ],
        "description": "Resulting status."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true,
        "description": "Creation timestamp."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "redirect",
      "refresh_block"
    ],
    "bindingHint": "Wire to a product-creation form's submit; map inputs to the body and show a success toast then redirect to the new product's detail page."
  },
  {
    "id": "ep-commerce-products-update",
    "method": "PUT",
    "path": "/v2/commerce/products/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "commerce",
    "summary": "Replace/update an existing product's fields from an edit form.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Product id to update."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "name",
        "type": "string",
        "required": false,
        "description": "Updated display name."
      },
      {
        "name": "description",
        "type": "string",
        "required": false,
        "description": "Updated description."
      },
      {
        "name": "price",
        "type": "number",
        "required": false,
        "description": "Updated price in minor units."
      },
      {
        "name": "compare_at_price",
        "type": "number",
        "required": false,
        "description": "Updated list price."
      },
      {
        "name": "category",
        "type": "string",
        "required": false,
        "description": "Updated category."
      },
      {
        "name": "images",
        "type": "array",
        "required": false,
        "description": "Updated media set."
      },
      {
        "name": "variants",
        "type": "array",
        "required": false,
        "description": "Updated variant definitions."
      },
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "active",
          "draft",
          "archived"
        ],
        "description": "Updated publication status."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Product id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Updated name."
      },
      {
        "name": "price",
        "type": "number",
        "required": true,
        "description": "Updated price."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "active",
          "draft",
          "archived"
        ],
        "description": "Updated status."
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": true,
        "description": "Update timestamp."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block",
      "detail"
    ],
    "bindingHint": "Bind to an edit form prefilled from the detail endpoint; on submit it saves changes and shows a success toast while refreshing the detail block."
  },
  {
    "id": "ep-commerce-products-delete",
    "method": "DELETE",
    "path": "/v2/commerce/products/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "commerce",
    "summary": "Delete or archive a product from the catalog.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Product id to delete."
      }
    ],
    "queryParams": [
      {
        "name": "mode",
        "type": "enum",
        "required": false,
        "values": [
          "soft",
          "hard"
        ],
        "description": "Soft archives, hard permanently removes; defaults to soft."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Deleted product id."
      },
      {
        "name": "deleted",
        "type": "boolean",
        "required": true,
        "description": "Whether deletion succeeded."
      },
      {
        "name": "mode",
        "type": "enum",
        "required": true,
        "values": [
          "soft",
          "hard"
        ],
        "description": "Deletion mode applied."
      }
    ],
    "triggers": [
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block",
      "redirect"
    ],
    "bindingHint": "Attach to a delete action button with confirmation; on success show a toast and refresh the product list or redirect back to the catalog."
  },
  {
    "id": "ep-commerce-inventory-detail",
    "method": "GET",
    "path": "/v2/commerce/products/{id}/inventory",
    "kind": "read",
    "auth": "jwt",
    "resource": "commerce",
    "summary": "Per-variant inventory levels and availability for a product across locations.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Product id."
      }
    ],
    "queryParams": [
      {
        "name": "location_id",
        "type": "id",
        "required": false,
        "description": "Restrict to a single warehouse/location."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "product_id",
        "type": "id",
        "required": true,
        "description": "Product the inventory belongs to."
      },
      {
        "name": "levels",
        "type": "array",
        "required": true,
        "description": "Array of per-variant/per-location inventory rows."
      },
      {
        "name": "levels[].variant_id",
        "type": "id",
        "required": true,
        "description": "Variant identifier."
      },
      {
        "name": "levels[].sku",
        "type": "string",
        "required": true,
        "description": "Variant SKU."
      },
      {
        "name": "levels[].location_id",
        "type": "id",
        "required": true,
        "description": "Warehouse/location identifier."
      },
      {
        "name": "levels[].available",
        "type": "number",
        "required": true,
        "description": "Sellable units on hand."
      },
      {
        "name": "levels[].reserved",
        "type": "number",
        "required": true,
        "description": "Units held by open carts/orders."
      },
      {
        "name": "levels[].incoming",
        "type": "number",
        "required": false,
        "description": "Units expected from inbound transfers."
      },
      {
        "name": "levels[].reorder_point",
        "type": "number",
        "required": false,
        "description": "Threshold below which restock is suggested."
      },
      {
        "name": "total_available",
        "type": "number",
        "required": true,
        "description": "Aggregate sellable units."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "detail",
      "field",
      "list",
      "refresh_block"
    ],
    "bindingHint": "Bind to a stock widget or admin inventory table; use on_interval to keep live stock counts fresh and surface low-stock badges."
  },
  {
    "id": "ep-commerce-inventory-adjust",
    "method": "PATCH",
    "path": "/v2/commerce/products/{id}/inventory",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "commerce",
    "summary": "Adjust inventory quantity for a variant at a location (restock, correction, or shrink).",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Product id."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "variant_id",
        "type": "id",
        "required": true,
        "description": "Variant whose stock is changing."
      },
      {
        "name": "location_id",
        "type": "id",
        "required": true,
        "description": "Warehouse/location to adjust."
      },
      {
        "name": "delta",
        "type": "number",
        "required": false,
        "description": "Relative change in units (positive or negative)."
      },
      {
        "name": "available",
        "type": "number",
        "required": false,
        "description": "Absolute count to set instead of a delta."
      },
      {
        "name": "reason",
        "type": "enum",
        "required": false,
        "values": [
          "restock",
          "correction",
          "damage",
          "return",
          "shrinkage"
        ],
        "description": "Reason code for the adjustment."
      }
    ],
    "responseFields": [
      {
        "name": "variant_id",
        "type": "id",
        "required": true,
        "description": "Adjusted variant."
      },
      {
        "name": "location_id",
        "type": "id",
        "required": true,
        "description": "Adjusted location."
      },
      {
        "name": "available",
        "type": "number",
        "required": true,
        "description": "Resulting available units."
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": true,
        "description": "Adjustment timestamp."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block",
      "field"
    ],
    "bindingHint": "Wire to an inventory adjustment form or quick-action button; on success show a toast and refresh the stock count field."
  },
  {
    "id": "ep-commerce-orders-list",
    "method": "GET",
    "path": "/v2/commerce/orders",
    "kind": "read",
    "auth": "jwt",
    "resource": "commerce",
    "summary": "Paginated, filterable list of orders for an account dashboard or admin order table.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "customer_id",
        "type": "id",
        "required": false,
        "description": "Scope to a single customer's orders."
      },
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "pending",
          "paid",
          "fulfilled",
          "shipped",
          "delivered",
          "cancelled",
          "refunded"
        ],
        "description": "Filter by order status."
      },
      {
        "name": "from",
        "type": "date",
        "required": false,
        "description": "Orders placed on or after this date."
      },
      {
        "name": "to",
        "type": "date",
        "required": false,
        "description": "Orders placed on or before this date."
      },
      {
        "name": "sort",
        "type": "enum",
        "required": false,
        "values": [
          "newest",
          "oldest",
          "total_desc",
          "total_asc"
        ],
        "description": "Result ordering."
      },
      {
        "name": "page",
        "type": "number",
        "required": false,
        "description": "1-based page index."
      },
      {
        "name": "per_page",
        "type": "number",
        "required": false,
        "description": "Items per page (default 20)."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of order summary objects (item shape below)."
      },
      {
        "name": "items[].id",
        "type": "id",
        "required": true,
        "description": "Order identifier."
      },
      {
        "name": "items[].number",
        "type": "string",
        "required": true,
        "description": "Human-readable order number."
      },
      {
        "name": "items[].customer_id",
        "type": "id",
        "required": true,
        "description": "Customer who placed the order."
      },
      {
        "name": "items[].status",
        "type": "enum",
        "required": true,
        "values": [
          "pending",
          "paid",
          "fulfilled",
          "shipped",
          "delivered",
          "cancelled",
          "refunded"
        ],
        "description": "Current order status."
      },
      {
        "name": "items[].total",
        "type": "number",
        "required": true,
        "description": "Order grand total in minor units."
      },
      {
        "name": "items[].currency",
        "type": "string",
        "required": true,
        "description": "ISO 4217 currency code."
      },
      {
        "name": "items[].item_count",
        "type": "number",
        "required": true,
        "description": "Number of line items."
      },
      {
        "name": "items[].placed_at",
        "type": "date",
        "required": true,
        "description": "Timestamp the order was placed."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Total matching orders."
      },
      {
        "name": "page",
        "type": "number",
        "required": true,
        "description": "Current page index."
      },
      {
        "name": "per_page",
        "type": "number",
        "required": true,
        "description": "Page size used."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list",
      "refresh_block"
    ],
    "bindingHint": "Bind to a repeater for an order history or admin orders table; on_interval keeps status columns current for fulfillment views."
  },
  {
    "id": "ep-commerce-orders-detail",
    "method": "GET",
    "path": "/v2/commerce/orders/{id}",
    "kind": "read",
    "auth": "jwt",
    "resource": "commerce",
    "summary": "Full order record with line items, totals, addresses, and payment/fulfillment state.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Order id or number."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Order identifier."
      },
      {
        "name": "number",
        "type": "string",
        "required": true,
        "description": "Human-readable order number."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "pending",
          "paid",
          "fulfilled",
          "shipped",
          "delivered",
          "cancelled",
          "refunded"
        ],
        "description": "Current order status."
      },
      {
        "name": "customer_id",
        "type": "id",
        "required": true,
        "description": "Customer who placed the order."
      },
      {
        "name": "line_items",
        "type": "array",
        "required": true,
        "description": "Array of purchased items with product_id, variant_id, name, quantity, unit_price, and line_total."
      },
      {
        "name": "subtotal",
        "type": "number",
        "required": true,
        "description": "Sum of line items before tax/shipping/discounts."
      },
      {
        "name": "discount_total",
        "type": "number",
        "required": false,
        "description": "Total discounts applied."
      },
      {
        "name": "tax_total",
        "type": "number",
        "required": true,
        "description": "Total tax in minor units."
      },
      {
        "name": "shipping_total",
        "type": "number",
        "required": true,
        "description": "Shipping cost in minor units."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Grand total."
      },
      {
        "name": "currency",
        "type": "string",
        "required": true,
        "description": "ISO 4217 currency code."
      },
      {
        "name": "shipping_address",
        "type": "object",
        "required": false,
        "description": "Destination address object."
      },
      {
        "name": "billing_address",
        "type": "object",
        "required": false,
        "description": "Billing address object."
      },
      {
        "name": "payment_status",
        "type": "enum",
        "required": true,
        "values": [
          "unpaid",
          "authorized",
          "paid",
          "partially_refunded",
          "refunded"
        ],
        "description": "Payment state."
      },
      {
        "name": "fulfillment_status",
        "type": "enum",
        "required": true,
        "values": [
          "unfulfilled",
          "partial",
          "fulfilled"
        ],
        "description": "Fulfillment state."
      },
      {
        "name": "placed_at",
        "type": "date",
        "required": true,
        "description": "Order placement timestamp."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "detail",
      "field",
      "list"
    ],
    "bindingHint": "Bind to an order detail block; fills the header/totals and feeds line_items into a nested repeater on the order confirmation or admin order page."
  },
  {
    "id": "ep-commerce-orders-create",
    "method": "POST",
    "path": "/v2/commerce/orders",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "commerce",
    "summary": "Create an order directly (admin/manual or draft order) without the cart flow.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "customer_id",
        "type": "id",
        "required": false,
        "description": "Customer to attach; omit for guest orders."
      },
      {
        "name": "line_items",
        "type": "array",
        "required": true,
        "description": "Array of {variant_id, quantity, price?} to purchase."
      },
      {
        "name": "shipping_address",
        "type": "object",
        "required": false,
        "description": "Destination address."
      },
      {
        "name": "billing_address",
        "type": "object",
        "required": false,
        "description": "Billing address."
      },
      {
        "name": "coupon_code",
        "type": "string",
        "required": false,
        "description": "Discount code to apply."
      },
      {
        "name": "currency",
        "type": "string",
        "required": false,
        "description": "ISO 4217 currency; defaults to store currency."
      },
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "draft",
          "pending"
        ],
        "description": "Initial order status; defaults to pending."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Created order id."
      },
      {
        "name": "number",
        "type": "string",
        "required": true,
        "description": "Assigned order number."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "draft",
          "pending",
          "paid"
        ],
        "description": "Resulting status."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Computed grand total."
      },
      {
        "name": "currency",
        "type": "string",
        "required": true,
        "description": "Order currency."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true,
        "description": "Creation timestamp."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "redirect",
      "refresh_block"
    ],
    "bindingHint": "Wire to a manual/draft order form's submit; on success toast confirmation and redirect to the new order's detail page."
  },
  {
    "id": "ep-commerce-orders-refund",
    "method": "POST",
    "path": "/v2/commerce/orders/{id}/refunds",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "commerce",
    "summary": "Issue a full or partial refund against an order.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Order id to refund."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "amount",
        "type": "number",
        "required": false,
        "description": "Refund amount in minor units; omit for a full refund."
      },
      {
        "name": "line_items",
        "type": "array",
        "required": false,
        "description": "Specific {line_item_id, quantity} to refund for partial item refunds."
      },
      {
        "name": "reason",
        "type": "enum",
        "required": false,
        "values": [
          "requested_by_customer",
          "damaged",
          "fraud",
          "out_of_stock",
          "other"
        ],
        "description": "Reason code for the refund."
      },
      {
        "name": "restock",
        "type": "boolean",
        "required": false,
        "description": "Whether to return refunded units to inventory."
      },
      {
        "name": "note",
        "type": "string",
        "required": false,
        "description": "Internal note for the refund."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Refund identifier."
      },
      {
        "name": "order_id",
        "type": "id",
        "required": true,
        "description": "Order the refund applies to."
      },
      {
        "name": "amount",
        "type": "number",
        "required": true,
        "description": "Refunded amount in minor units."
      },
      {
        "name": "currency",
        "type": "string",
        "required": true,
        "description": "Refund currency."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "pending",
          "succeeded",
          "failed"
        ],
        "description": "Refund processing status."
      },
      {
        "name": "payment_status",
        "type": "enum",
        "required": true,
        "values": [
          "partially_refunded",
          "refunded"
        ],
        "description": "Resulting order payment status."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true,
        "description": "Refund timestamp."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block",
      "detail"
    ],
    "bindingHint": "Attach to a refund action button/form on the order detail page; on success show a toast and refresh the order to reflect the new payment status."
  },
  {
    "id": "ep-commerce-coupons-list",
    "method": "GET",
    "path": "/v2/commerce/coupons",
    "kind": "read",
    "auth": "jwt",
    "resource": "commerce",
    "summary": "List discount coupons/promo codes with their rules and usage for an admin table.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "active",
          "scheduled",
          "expired",
          "disabled"
        ],
        "description": "Filter by coupon status."
      },
      {
        "name": "q",
        "type": "string",
        "required": false,
        "description": "Search by code or name."
      },
      {
        "name": "page",
        "type": "number",
        "required": false,
        "description": "1-based page index."
      },
      {
        "name": "per_page",
        "type": "number",
        "required": false,
        "description": "Items per page (default 20)."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of coupon objects (item shape below)."
      },
      {
        "name": "items[].id",
        "type": "id",
        "required": true,
        "description": "Coupon identifier."
      },
      {
        "name": "items[].code",
        "type": "string",
        "required": true,
        "description": "Redeemable promo code."
      },
      {
        "name": "items[].type",
        "type": "enum",
        "required": true,
        "values": [
          "percentage",
          "fixed_amount",
          "free_shipping"
        ],
        "description": "Discount type."
      },
      {
        "name": "items[].value",
        "type": "number",
        "required": true,
        "description": "Percentage (0-100) or fixed amount in minor units."
      },
      {
        "name": "items[].min_subtotal",
        "type": "number",
        "required": false,
        "description": "Minimum cart subtotal required."
      },
      {
        "name": "items[].usage_limit",
        "type": "number",
        "required": false,
        "description": "Max total redemptions allowed."
      },
      {
        "name": "items[].used_count",
        "type": "number",
        "required": true,
        "description": "Times redeemed so far."
      },
      {
        "name": "items[].starts_at",
        "type": "date",
        "required": false,
        "description": "Activation timestamp."
      },
      {
        "name": "items[].expires_at",
        "type": "date",
        "required": false,
        "description": "Expiry timestamp."
      },
      {
        "name": "items[].status",
        "type": "enum",
        "required": true,
        "values": [
          "active",
          "scheduled",
          "expired",
          "disabled"
        ],
        "description": "Coupon status."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Total matching coupons."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "list",
      "refresh_block"
    ],
    "bindingHint": "Bind to a repeater for an admin promotions table; loads coupon rows with code, value, and usage on page load."
  },
  {
    "id": "ep-commerce-cart-get",
    "method": "GET",
    "path": "/v2/commerce/cart/{id}",
    "kind": "read",
    "auth": "public",
    "resource": "commerce",
    "summary": "Retrieve the current cart with line items and live totals for a mini-cart or cart page.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Cart id or session token."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Cart identifier."
      },
      {
        "name": "line_items",
        "type": "array",
        "required": true,
        "description": "Array of {id, product_id, variant_id, name, thumbnail, quantity, unit_price, line_total}."
      },
      {
        "name": "item_count",
        "type": "number",
        "required": true,
        "description": "Total quantity across line items."
      },
      {
        "name": "subtotal",
        "type": "number",
        "required": true,
        "description": "Sum of line totals in minor units."
      },
      {
        "name": "discount_total",
        "type": "number",
        "required": false,
        "description": "Applied discount amount."
      },
      {
        "name": "tax_total",
        "type": "number",
        "required": false,
        "description": "Estimated tax in minor units."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Estimated grand total."
      },
      {
        "name": "currency",
        "type": "string",
        "required": true,
        "description": "ISO 4217 currency code."
      },
      {
        "name": "coupon_code",
        "type": "string",
        "required": false,
        "description": "Applied promo code, if any."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "detail",
      "list",
      "field",
      "refresh_block"
    ],
    "bindingHint": "Bind to a cart/mini-cart block; line_items feed a repeater while subtotal/total fill summary fields, refreshing whenever the cart changes."
  },
  {
    "id": "ep-commerce-cart-add-item",
    "method": "POST",
    "path": "/v2/commerce/cart/{id}/items",
    "kind": "mutation",
    "auth": "public",
    "resource": "commerce",
    "summary": "Add a product variant to the cart (add-to-cart action).",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Cart id or session token."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "variant_id",
        "type": "id",
        "required": true,
        "description": "Variant to add."
      },
      {
        "name": "quantity",
        "type": "number",
        "required": false,
        "description": "Units to add; defaults to 1."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Cart identifier."
      },
      {
        "name": "item_count",
        "type": "number",
        "required": true,
        "description": "Updated total quantity."
      },
      {
        "name": "subtotal",
        "type": "number",
        "required": true,
        "description": "Updated subtotal in minor units."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Updated grand total."
      },
      {
        "name": "added_item",
        "type": "object",
        "required": true,
        "description": "The line item that was added or incremented."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block",
      "action_button"
    ],
    "bindingHint": "Wire to an Add to Cart button; map the selected variant and quantity, then show a toast and refresh the cart/mini-cart block on success."
  },
  {
    "id": "ep-commerce-cart-update-item",
    "method": "PATCH",
    "path": "/v2/commerce/cart/{id}/items/{item_id}",
    "kind": "mutation",
    "auth": "public",
    "resource": "commerce",
    "summary": "Change quantity of a cart line item or remove it when quantity is zero.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Cart id or session token."
      },
      {
        "name": "item_id",
        "type": "id",
        "required": true,
        "description": "Cart line item to update."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "quantity",
        "type": "number",
        "required": true,
        "description": "New quantity; 0 removes the line item."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Cart identifier."
      },
      {
        "name": "item_count",
        "type": "number",
        "required": true,
        "description": "Updated total quantity."
      },
      {
        "name": "subtotal",
        "type": "number",
        "required": true,
        "description": "Updated subtotal."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Updated grand total."
      },
      {
        "name": "removed",
        "type": "boolean",
        "required": false,
        "description": "True when the line item was removed."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block",
      "list"
    ],
    "bindingHint": "Bind to quantity steppers or a Remove button in the cart line item; on success refresh the cart block to recompute totals."
  },
  {
    "id": "ep-commerce-cart-apply-coupon",
    "method": "POST",
    "path": "/v2/commerce/cart/{id}/coupon",
    "kind": "mutation",
    "auth": "public",
    "resource": "commerce",
    "summary": "Apply or validate a promo code against the cart and recompute discounts.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Cart id or session token."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "code",
        "type": "string",
        "required": true,
        "description": "Promo/coupon code to apply."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Cart identifier."
      },
      {
        "name": "applied",
        "type": "boolean",
        "required": true,
        "description": "Whether the coupon was accepted."
      },
      {
        "name": "coupon_code",
        "type": "string",
        "required": false,
        "description": "The applied code."
      },
      {
        "name": "discount_total",
        "type": "number",
        "required": true,
        "description": "Discount applied in minor units."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Recomputed grand total."
      },
      {
        "name": "message",
        "type": "string",
        "required": false,
        "description": "Validation/error message when not applied."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "inline_message",
      "toast",
      "refresh_block",
      "field"
    ],
    "bindingHint": "Wire to a promo-code input's apply button; show the success/error inline message and refresh the cart totals when applied."
  },
  {
    "id": "ep-commerce-checkout-create",
    "method": "POST",
    "path": "/v2/commerce/checkout",
    "kind": "mutation",
    "auth": "public",
    "resource": "commerce",
    "summary": "Convert a cart into a paid order by submitting contact, address, and payment details.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "cart_id",
        "type": "id",
        "required": true,
        "description": "Cart being checked out."
      },
      {
        "name": "email",
        "type": "string",
        "required": true,
        "description": "Customer contact email."
      },
      {
        "name": "shipping_address",
        "type": "object",
        "required": true,
        "description": "Destination address."
      },
      {
        "name": "billing_address",
        "type": "object",
        "required": false,
        "description": "Billing address; defaults to shipping."
      },
      {
        "name": "shipping_method",
        "type": "string",
        "required": true,
        "description": "Selected shipping rate id."
      },
      {
        "name": "payment_method",
        "type": "object",
        "required": true,
        "description": "Payment token/intent details."
      },
      {
        "name": "coupon_code",
        "type": "string",
        "required": false,
        "description": "Promo code to apply at checkout."
      }
    ],
    "responseFields": [
      {
        "name": "order_id",
        "type": "id",
        "required": true,
        "description": "Created order id."
      },
      {
        "name": "order_number",
        "type": "string",
        "required": true,
        "description": "Human-readable order number."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "paid",
          "pending",
          "requires_action",
          "failed"
        ],
        "description": "Checkout/payment outcome."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Charged total in minor units."
      },
      {
        "name": "currency",
        "type": "string",
        "required": true,
        "description": "Order currency."
      },
      {
        "name": "payment_intent",
        "type": "object",
        "required": false,
        "description": "Payment intent/next-action data when requires_action."
      },
      {
        "name": "confirmation_url",
        "type": "string",
        "required": false,
        "description": "URL of the order confirmation page."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "redirect",
      "refresh_block"
    ],
    "bindingHint": "Wire to the checkout form's Place Order submit; on success redirect to the confirmation page, and surface payment errors as an inline message."
  },
  {
    "id": "ep-workflows-list",
    "method": "GET",
    "path": "/v2/automation/workflows",
    "kind": "read",
    "auth": "jwt",
    "resource": "automation",
    "summary": "List all workflows in the space with status, run counts and node counts.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "active",
          "inactive",
          "draft"
        ],
        "description": "Filter by workflow lifecycle status."
      },
      {
        "name": "search",
        "type": "string",
        "required": false,
        "description": "Fuzzy match on workflow name."
      },
      {
        "name": "sort",
        "type": "enum",
        "required": false,
        "values": [
          "name",
          "lastRun",
          "runs",
          "-lastRun",
          "-runs"
        ],
        "description": "Sort key; prefix with - for descending."
      },
      {
        "name": "page",
        "type": "number",
        "required": false,
        "description": "1-based page index."
      },
      {
        "name": "perPage",
        "type": "number",
        "required": false,
        "description": "Items per page (default 25)."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of workflow summary objects (the item shape below)."
      },
      {
        "name": "items[].id",
        "type": "id",
        "required": true,
        "description": "Workflow id, e.g. wf_lead_router."
      },
      {
        "name": "items[].name",
        "type": "string",
        "required": true,
        "description": "Human-facing workflow name."
      },
      {
        "name": "items[].status",
        "type": "enum",
        "required": true,
        "values": [
          "active",
          "inactive",
          "draft"
        ],
        "description": "Lifecycle status."
      },
      {
        "name": "items[].lastRun",
        "type": "date",
        "required": false,
        "description": "ISO timestamp of the most recent run, or null if never run."
      },
      {
        "name": "items[].runs",
        "type": "number",
        "required": true,
        "description": "Total lifetime run count."
      },
      {
        "name": "items[].nodeCount",
        "type": "number",
        "required": true,
        "description": "Number of nodes in the workflow graph."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Total matching workflows across all pages."
      },
      {
        "name": "page",
        "type": "number",
        "required": true,
        "description": "Current page index."
      },
      {
        "name": "perPage",
        "type": "number",
        "required": true,
        "description": "Page size."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list",
      "refresh_block"
    ],
    "bindingHint": "Use to power a workflow directory or automation dashboard; bind to a repeating block (list) that renders one card per workflow, optionally polling on_interval to keep run counts live."
  },
  {
    "id": "ep-workflows-detail",
    "method": "GET",
    "path": "/v2/automation/workflows/{id}",
    "kind": "read",
    "auth": "jwt",
    "resource": "automation",
    "summary": "Get a single workflow including its full node graph and connections.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Workflow id."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Workflow id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Workflow name."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "active",
          "inactive",
          "draft"
        ],
        "description": "Lifecycle status."
      },
      {
        "name": "lastRun",
        "type": "date",
        "required": false,
        "description": "ISO timestamp of last run, or null."
      },
      {
        "name": "runs",
        "type": "number",
        "required": true,
        "description": "Total lifetime run count."
      },
      {
        "name": "nodes",
        "type": "array",
        "required": true,
        "description": "Array of WorkflowNode { id, type, name, x, y, config? }."
      },
      {
        "name": "connections",
        "type": "array",
        "required": true,
        "description": "Array of WorkflowConnection { id, from, to } edges between nodes."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "detail",
      "field"
    ],
    "bindingHint": "Use on a workflow detail page or canvas block to render one workflow's graph; bind to detail to fill a single block with the workflow's name, status and node/connection arrays."
  },
  {
    "id": "ep-workflows-runs-list",
    "method": "GET",
    "path": "/v2/automation/workflows/{id}/runs",
    "kind": "read",
    "auth": "jwt",
    "resource": "automation",
    "summary": "List execution history (runs) for a workflow with status and duration.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Workflow id."
      }
    ],
    "queryParams": [
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "success",
          "error",
          "running",
          "waiting"
        ],
        "description": "Filter runs by outcome."
      },
      {
        "name": "since",
        "type": "date",
        "required": false,
        "description": "Only runs started on/after this ISO date."
      },
      {
        "name": "page",
        "type": "number",
        "required": false,
        "description": "1-based page index."
      },
      {
        "name": "perPage",
        "type": "number",
        "required": false,
        "description": "Items per page (default 25)."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of run records (the item shape below)."
      },
      {
        "name": "items[].id",
        "type": "id",
        "required": true,
        "description": "Run id, e.g. run_a1b2c3."
      },
      {
        "name": "items[].workflowId",
        "type": "id",
        "required": true,
        "description": "Parent workflow id."
      },
      {
        "name": "items[].status",
        "type": "enum",
        "required": true,
        "values": [
          "success",
          "error",
          "running",
          "waiting"
        ],
        "description": "Run outcome."
      },
      {
        "name": "items[].startedAt",
        "type": "date",
        "required": true,
        "description": "ISO timestamp the run started."
      },
      {
        "name": "items[].finishedAt",
        "type": "date",
        "required": false,
        "description": "ISO timestamp the run finished, or null if still running."
      },
      {
        "name": "items[].durationMs",
        "type": "number",
        "required": false,
        "description": "Total execution time in milliseconds."
      },
      {
        "name": "items[].trigger",
        "type": "string",
        "required": true,
        "description": "Triggering node type, e.g. webhook, schedule, form_submit, manual."
      },
      {
        "name": "items[].error",
        "type": "string",
        "required": false,
        "description": "Error message when status is error."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Total matching runs."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list",
      "refresh_block"
    ],
    "bindingHint": "Use for a run-history table on a workflow detail page; bind to a list block and poll on_interval to surface live run status badges."
  },
  {
    "id": "ep-workflows-run-detail",
    "method": "GET",
    "path": "/v2/automation/workflows/{id}/runs/{runId}",
    "kind": "read",
    "auth": "jwt",
    "resource": "automation",
    "summary": "Get a single workflow run with per-node execution log.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Workflow id."
      },
      {
        "name": "runId",
        "type": "id",
        "required": true,
        "description": "Run id."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Run id."
      },
      {
        "name": "workflowId",
        "type": "id",
        "required": true,
        "description": "Parent workflow id."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "success",
          "error",
          "running",
          "waiting"
        ],
        "description": "Run outcome."
      },
      {
        "name": "startedAt",
        "type": "date",
        "required": true,
        "description": "ISO start timestamp."
      },
      {
        "name": "finishedAt",
        "type": "date",
        "required": false,
        "description": "ISO finish timestamp, or null."
      },
      {
        "name": "durationMs",
        "type": "number",
        "required": false,
        "description": "Total execution time in ms."
      },
      {
        "name": "steps",
        "type": "array",
        "required": true,
        "description": "Per-node log entries { nodeId, type, status, durationMs, output }."
      },
      {
        "name": "input",
        "type": "object",
        "required": false,
        "description": "The payload that triggered the run."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "detail",
      "field"
    ],
    "bindingHint": "Use on a run-inspector view to show one execution's step-by-step log; bind to detail to fill a single block with the run's status and step array."
  },
  {
    "id": "ep-workflows-node-types-list",
    "method": "GET",
    "path": "/v2/automation/node-types",
    "kind": "read",
    "auth": "jwt",
    "resource": "automation",
    "summary": "List the node-type catalog available to the workflow builder palette.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "kind",
        "type": "enum",
        "required": false,
        "values": [
          "trigger",
          "logic",
          "action",
          "integration"
        ],
        "description": "Filter node types by kind."
      },
      {
        "name": "category",
        "type": "string",
        "required": false,
        "description": "Filter by palette group, e.g. Triggers, Actions, Integrations."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of node-type definitions (the item shape below)."
      },
      {
        "name": "items[].type",
        "type": "string",
        "required": true,
        "description": "Stable node type key, e.g. webhook, if, send_email."
      },
      {
        "name": "items[].label",
        "type": "string",
        "required": true,
        "description": "Display label for the palette."
      },
      {
        "name": "items[].icon",
        "type": "string",
        "required": true,
        "description": "lucide-react icon name."
      },
      {
        "name": "items[].kind",
        "type": "enum",
        "required": true,
        "values": [
          "trigger",
          "logic",
          "action",
          "integration"
        ],
        "description": "Node category bucket."
      },
      {
        "name": "items[].category",
        "type": "string",
        "required": true,
        "description": "Palette group heading."
      },
      {
        "name": "items[].description",
        "type": "string",
        "required": true,
        "description": "One-line explanation of the node."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "list",
      "field"
    ],
    "bindingHint": "Use to render the builder's node palette or a docs grid of available automation steps; bind to a list block grouped by category."
  },
  {
    "id": "ep-workflows-create",
    "method": "POST",
    "path": "/v2/automation/workflows",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "automation",
    "summary": "Create a new workflow, optionally seeded with nodes and connections.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Workflow name."
      },
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "active",
          "inactive",
          "draft"
        ],
        "description": "Initial status; defaults to draft."
      },
      {
        "name": "nodes",
        "type": "array",
        "required": false,
        "description": "Optional initial WorkflowNode array { id, type, name, x, y, config? }."
      },
      {
        "name": "connections",
        "type": "array",
        "required": false,
        "description": "Optional initial WorkflowConnection array { id, from, to }."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Newly created workflow id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Workflow name."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "active",
          "inactive",
          "draft"
        ],
        "description": "Resulting status."
      },
      {
        "name": "nodes",
        "type": "array",
        "required": true,
        "description": "Resulting node array."
      },
      {
        "name": "connections",
        "type": "array",
        "required": true,
        "description": "Resulting connection array."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "redirect",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Use behind a New Workflow form or button; on submit it creates the workflow, then redirect to the builder for the returned id and toast success."
  },
  {
    "id": "ep-workflows-update",
    "method": "PUT",
    "path": "/v2/automation/workflows/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "automation",
    "summary": "Replace a workflow's definition (name, nodes, connections, status).",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Workflow id to update."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Workflow name."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "active",
          "inactive",
          "draft"
        ],
        "description": "Lifecycle status."
      },
      {
        "name": "nodes",
        "type": "array",
        "required": true,
        "description": "Full WorkflowNode array to persist."
      },
      {
        "name": "connections",
        "type": "array",
        "required": true,
        "description": "Full WorkflowConnection array to persist."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Workflow id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Updated name."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "active",
          "inactive",
          "draft"
        ],
        "description": "Updated status."
      },
      {
        "name": "nodes",
        "type": "array",
        "required": true,
        "description": "Persisted node array."
      },
      {
        "name": "connections",
        "type": "array",
        "required": true,
        "description": "Persisted connection array."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Use as the Save action on the workflow builder canvas; on click it persists the full graph, then toast confirmation and refresh_block the canvas."
  },
  {
    "id": "ep-workflows-patch-status",
    "method": "PATCH",
    "path": "/v2/automation/workflows/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "automation",
    "summary": "Partially update a workflow, typically to activate, deactivate or rename it.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Workflow id."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "active",
          "inactive",
          "draft"
        ],
        "description": "New lifecycle status."
      },
      {
        "name": "name",
        "type": "string",
        "required": false,
        "description": "New workflow name."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Workflow id."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "active",
          "inactive",
          "draft"
        ],
        "description": "Resulting status."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Resulting name."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "action_button",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Use behind an activate/deactivate toggle or rename inline edit; bind to an action_button that flips status and toasts the new state."
  },
  {
    "id": "ep-workflows-delete",
    "method": "DELETE",
    "path": "/v2/automation/workflows/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "automation",
    "summary": "Delete a workflow and its run history.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Workflow id to delete."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Deleted workflow id."
      },
      {
        "name": "deleted",
        "type": "boolean",
        "required": true,
        "description": "True when deletion succeeded."
      }
    ],
    "triggers": [
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "redirect",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Use behind a Delete button with confirmation; on success toast and redirect back to the workflow list or refresh_block the directory."
  },
  {
    "id": "ep-workflows-run",
    "method": "POST",
    "path": "/v2/automation/workflows/{id}/run",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "automation",
    "summary": "Trigger a manual run of a workflow with an optional input payload.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Workflow id to run."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "input",
        "type": "object",
        "required": false,
        "description": "Arbitrary JSON payload passed to the trigger node."
      },
      {
        "name": "mode",
        "type": "enum",
        "required": false,
        "values": [
          "live",
          "test"
        ],
        "description": "Run in live or test mode; defaults to live."
      }
    ],
    "responseFields": [
      {
        "name": "runId",
        "type": "id",
        "required": true,
        "description": "Id of the started run."
      },
      {
        "name": "workflowId",
        "type": "id",
        "required": true,
        "description": "Workflow id."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "success",
          "error",
          "running",
          "waiting"
        ],
        "description": "Initial run status (often running)."
      },
      {
        "name": "startedAt",
        "type": "date",
        "required": true,
        "description": "ISO timestamp the run started."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "action_button",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Use behind a Run now button to fire a workflow on demand; bind to an action_button, toast the started run, then refresh_block the runs list."
  },
  {
    "id": "ep-workflows-webhook-trigger",
    "method": "POST",
    "path": "/v2/automation/hooks/{hookKey}",
    "kind": "mutation",
    "auth": "api_key",
    "resource": "automation",
    "summary": "Invoke a workflow's public webhook trigger from an external system or block.",
    "pathParams": [
      {
        "name": "hookKey",
        "type": "string",
        "required": true,
        "description": "Public webhook key bound to a workflow's webhook trigger node."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "payload",
        "type": "object",
        "required": false,
        "description": "Event payload forwarded to the workflow as trigger input."
      }
    ],
    "responseFields": [
      {
        "name": "accepted",
        "type": "boolean",
        "required": true,
        "description": "True when the event was queued."
      },
      {
        "name": "runId",
        "type": "id",
        "required": false,
        "description": "Run id if the workflow started synchronously."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit",
      "on_load"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Use to fire a workflow from a public form or button without a logged-in session; bind on_submit to post the form payload and toast acceptance."
  },
  {
    "id": "ep-ai-generate",
    "method": "POST",
    "path": "/v2/ai/generate",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "ai",
    "summary": "Generate a full plan (database, pages, components, workflows, APIs) from one prompt.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "description": "Non-empty natural-language description of the app/site to build."
      },
      {
        "name": "layers",
        "type": "array",
        "required": false,
        "description": "Optional subset of layers to generate: analysis|database|pages|components|workflows|apis|deploy."
      }
    ],
    "responseFields": [
      {
        "name": "prompt",
        "type": "string",
        "required": true,
        "description": "Echo of the submitted prompt."
      },
      {
        "name": "steps",
        "type": "array",
        "required": true,
        "description": "Ordered GenerationStep array (the item shape below)."
      },
      {
        "name": "steps[].key",
        "type": "string",
        "required": true,
        "description": "Stable step key for animation, e.g. analyze, database."
      },
      {
        "name": "steps[].label",
        "type": "string",
        "required": true,
        "description": "Human-facing timeline label."
      },
      {
        "name": "steps[].layer",
        "type": "enum",
        "required": true,
        "values": [
          "analysis",
          "database",
          "pages",
          "components",
          "workflows",
          "apis",
          "deploy"
        ],
        "description": "Which generated layer the step belongs to."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "detail",
      "list",
      "redirect",
      "toast",
      "inline_message"
    ],
    "bindingHint": "Use behind the one-prompt generate box; on submit it returns the ordered step plan to drive a generation timeline (list of steps), then redirect into the new project."
  },
  {
    "id": "ep-ai-agents-list",
    "method": "GET",
    "path": "/v2/ai/agents",
    "kind": "read",
    "auth": "jwt",
    "resource": "ai",
    "summary": "List the AI agent roster (Designer, Developer, SEO, etc.) available for generation.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "required": true,
        "description": "Array of AI agents (the item shape below)."
      },
      {
        "name": "items[].id",
        "type": "id",
        "required": true,
        "description": "Agent id, e.g. designer, developer, seo."
      },
      {
        "name": "items[].name",
        "type": "string",
        "required": true,
        "description": "Agent display name."
      },
      {
        "name": "items[].description",
        "type": "string",
        "required": true,
        "description": "What the agent does."
      },
      {
        "name": "items[].icon",
        "type": "enum",
        "required": true,
        "values": [
          "Palette",
          "Code2",
          "Search",
          "PenLine",
          "Users",
          "BarChart3"
        ],
        "description": "lucide-react icon name resolved on the client."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "list",
      "field"
    ],
    "bindingHint": "Use to render the agent roster on the AI landing surface; bind to a list block that repeats one card per agent with its icon and description."
  },
  {
    "id": "ep-ai-suggest",
    "method": "POST",
    "path": "/v2/ai/suggest",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "ai",
    "summary": "Get AI content/copy or component suggestions for a given block or context.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "context",
        "type": "string",
        "required": true,
        "description": "What to suggest for, e.g. a block id, field name, or freeform brief."
      },
      {
        "name": "kind",
        "type": "enum",
        "required": false,
        "values": [
          "copy",
          "headline",
          "component",
          "image_alt",
          "cta"
        ],
        "description": "Type of suggestion requested; defaults to copy."
      },
      {
        "name": "count",
        "type": "number",
        "required": false,
        "description": "How many alternatives to return (default 3)."
      },
      {
        "name": "tone",
        "type": "string",
        "required": false,
        "description": "Optional tone/brand-voice hint."
      }
    ],
    "responseFields": [
      {
        "name": "suggestions",
        "type": "array",
        "required": true,
        "description": "Array of suggestion objects (the item shape below)."
      },
      {
        "name": "suggestions[].id",
        "type": "id",
        "required": true,
        "description": "Suggestion id for selection/feedback."
      },
      {
        "name": "suggestions[].text",
        "type": "string",
        "required": true,
        "description": "Suggested copy or value."
      },
      {
        "name": "suggestions[].rationale",
        "type": "string",
        "required": false,
        "description": "Why the AI proposed this."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "list",
      "form",
      "inline_message",
      "toast"
    ],
    "bindingHint": "Use behind a Suggest with AI button next to a text field; on click it returns alternatives to show as a pick-list (list) and prefill the field (form) on selection."
  },
  {
    "id": "ep-ai-seo",
    "method": "POST",
    "path": "/v2/ai/seo",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "ai",
    "summary": "Generate SEO metadata (title, description, keywords, OG) for a page or content.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "storyId",
        "type": "id",
        "required": false,
        "description": "Content/story id to analyze; provide this or content."
      },
      {
        "name": "content",
        "type": "string",
        "required": false,
        "description": "Raw text/markup to analyze when no storyId is given."
      },
      {
        "name": "locale",
        "type": "string",
        "required": false,
        "description": "Target locale for the metadata, e.g. en-US."
      }
    ],
    "responseFields": [
      {
        "name": "title",
        "type": "string",
        "required": true,
        "description": "Suggested SEO title tag."
      },
      {
        "name": "description",
        "type": "string",
        "required": true,
        "description": "Suggested meta description."
      },
      {
        "name": "keywords",
        "type": "array",
        "required": true,
        "description": "Suggested keyword strings."
      },
      {
        "name": "ogTitle",
        "type": "string",
        "required": false,
        "description": "Open Graph title."
      },
      {
        "name": "ogDescription",
        "type": "string",
        "required": false,
        "description": "Open Graph description."
      },
      {
        "name": "score",
        "type": "number",
        "required": false,
        "description": "Estimated SEO readiness score 0-100."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "form",
      "detail",
      "field",
      "toast",
      "inline_message"
    ],
    "bindingHint": "Use behind a Generate SEO button on the page settings panel; on click it returns metadata to prefill the SEO form (form) and show the score (field)."
  },
  {
    "id": "ep-auth-login",
    "method": "POST",
    "path": "/v2/auth/login",
    "kind": "mutation",
    "auth": "public",
    "resource": "auth",
    "summary": "Authenticate with email and password, returning a session token and the signed-in user.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "email",
        "type": "string",
        "required": true,
        "description": "User account email address."
      },
      {
        "name": "password",
        "type": "string",
        "required": true,
        "description": "Account password."
      },
      {
        "name": "remember",
        "type": "boolean",
        "required": false,
        "description": "Issue a long-lived session when true."
      },
      {
        "name": "otp",
        "type": "string",
        "required": false,
        "description": "One-time 2FA code, required if MFA is enabled."
      }
    ],
    "responseFields": [
      {
        "name": "token",
        "type": "string",
        "description": "JWT bearer token for subsequent requests."
      },
      {
        "name": "refreshToken",
        "type": "string",
        "description": "Token used to refresh the session."
      },
      {
        "name": "expiresAt",
        "type": "date",
        "description": "Session expiry timestamp."
      },
      {
        "name": "user",
        "type": "object",
        "description": "The authenticated user (id, name, email, role, avatarUrl)."
      },
      {
        "name": "mfaRequired",
        "type": "boolean",
        "description": "True when an OTP step is still pending."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "redirect",
      "toast",
      "inline_message",
      "form"
    ],
    "bindingHint": "Bind to a login form's submit; on success redirect to the dashboard, on failure show an inline error under the form."
  },
  {
    "id": "ep-auth-logout",
    "method": "POST",
    "path": "/v2/auth/logout",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "auth",
    "summary": "Invalidate the current session token and clear the active session.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "everywhere",
        "type": "boolean",
        "required": false,
        "description": "Revoke all of the user's active sessions when true."
      }
    ],
    "responseFields": [
      {
        "name": "success",
        "type": "boolean",
        "description": "True when the session was revoked."
      }
    ],
    "triggers": [
      "on_click"
    ],
    "renderTargets": [
      "redirect",
      "toast",
      "action_button"
    ],
    "bindingHint": "Bind to a logout button; on success redirect to the login page and show a toast."
  },
  {
    "id": "ep-auth-session",
    "method": "GET",
    "path": "/v2/auth/session",
    "kind": "read",
    "auth": "jwt",
    "resource": "auth",
    "summary": "Return the current session state, validity and expiry for the bearer token.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "authenticated",
        "type": "boolean",
        "description": "Whether the token is valid and active."
      },
      {
        "name": "userId",
        "type": "id",
        "description": "Id of the session owner."
      },
      {
        "name": "expiresAt",
        "type": "date",
        "description": "When the session expires."
      },
      {
        "name": "issuedAt",
        "type": "date",
        "description": "When the session was created."
      },
      {
        "name": "scopes",
        "type": "array",
        "description": "Granted capability scopes for this session."
      }
    ],
    "triggers": [
      "on_load",
      "on_interval"
    ],
    "renderTargets": [
      "field",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Use on_load (and on_interval to keep alive) to gate a protected layout; show a re-login inline message when not authenticated."
  },
  {
    "id": "ep-auth-me",
    "method": "GET",
    "path": "/v2/auth/me",
    "kind": "read",
    "auth": "jwt",
    "resource": "auth",
    "summary": "Fetch the profile of the currently signed-in user.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "description": "User id."
      },
      {
        "name": "name",
        "type": "string",
        "description": "Full display name."
      },
      {
        "name": "email",
        "type": "string",
        "description": "Primary email address."
      },
      {
        "name": "avatarUrl",
        "type": "string",
        "description": "Profile image URL."
      },
      {
        "name": "role",
        "type": "enum",
        "values": [
          "owner",
          "admin",
          "manager",
          "developer",
          "editor",
          "viewer"
        ],
        "description": "The user's role in the active space."
      },
      {
        "name": "capabilities",
        "type": "array",
        "description": "Resolved capability keys for the user."
      },
      {
        "name": "lastSeenAt",
        "type": "date",
        "description": "Last activity timestamp."
      }
    ],
    "triggers": [
      "on_load"
    ],
    "renderTargets": [
      "detail",
      "field",
      "form"
    ],
    "bindingHint": "Bind on_load to fill a profile/avatar block or prefill an account-settings form with the current user."
  },
  {
    "id": "ep-identity-users-list",
    "method": "GET",
    "path": "/v2/identity/users",
    "kind": "read",
    "auth": "jwt",
    "resource": "identity",
    "summary": "List members of the space with role, status and pagination.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "q",
        "type": "string",
        "required": false,
        "description": "Search by name or email."
      },
      {
        "name": "role",
        "type": "enum",
        "required": false,
        "values": [
          "owner",
          "admin",
          "manager",
          "developer",
          "editor",
          "viewer"
        ],
        "description": "Filter by role."
      },
      {
        "name": "status",
        "type": "enum",
        "required": false,
        "values": [
          "active",
          "invited",
          "suspended"
        ],
        "description": "Filter by membership status."
      },
      {
        "name": "page",
        "type": "number",
        "required": false,
        "description": "1-based page index."
      },
      {
        "name": "perPage",
        "type": "number",
        "required": false,
        "description": "Items per page (default 25)."
      },
      {
        "name": "sort",
        "type": "enum",
        "required": false,
        "values": [
          "name",
          "-name",
          "lastSeenAt",
          "-lastSeenAt",
          "createdAt",
          "-createdAt"
        ],
        "description": "Sort order."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "description": "Array of user rows; each item has id, name, email, avatarUrl, role, status, lastSeenAt, createdAt."
      },
      {
        "name": "total",
        "type": "number",
        "description": "Total matching users."
      },
      {
        "name": "page",
        "type": "number",
        "description": "Current page index."
      },
      {
        "name": "perPage",
        "type": "number",
        "description": "Page size."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "list",
      "refresh_block"
    ],
    "bindingHint": "Bind on_load to a members table/list, repeating one row block per user; refresh after invite or role changes."
  },
  {
    "id": "ep-identity-users-detail",
    "method": "GET",
    "path": "/v2/identity/users/{id}",
    "kind": "read",
    "auth": "jwt",
    "resource": "identity",
    "summary": "Fetch a single member's full profile, role and membership metadata.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "User id."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "description": "User id."
      },
      {
        "name": "name",
        "type": "string",
        "description": "Full name."
      },
      {
        "name": "email",
        "type": "string",
        "description": "Email address."
      },
      {
        "name": "avatarUrl",
        "type": "string",
        "description": "Profile image URL."
      },
      {
        "name": "role",
        "type": "enum",
        "values": [
          "owner",
          "admin",
          "manager",
          "developer",
          "editor",
          "viewer"
        ],
        "description": "Assigned role."
      },
      {
        "name": "status",
        "type": "enum",
        "values": [
          "active",
          "invited",
          "suspended"
        ],
        "description": "Membership status."
      },
      {
        "name": "capabilities",
        "type": "array",
        "description": "Resolved capabilities for this member."
      },
      {
        "name": "lastSeenAt",
        "type": "date",
        "description": "Last activity timestamp."
      },
      {
        "name": "createdAt",
        "type": "date",
        "description": "When the membership was created."
      }
    ],
    "triggers": [
      "on_load"
    ],
    "renderTargets": [
      "detail",
      "field",
      "form"
    ],
    "bindingHint": "Bind on_load with a selected user id to fill a member detail panel or prefill an edit-role form."
  },
  {
    "id": "ep-identity-users-invite",
    "method": "POST",
    "path": "/v2/identity/users/invite",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "identity",
    "summary": "Invite a person to the space by email with an initial role.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "email",
        "type": "string",
        "required": true,
        "description": "Email address to invite."
      },
      {
        "name": "role",
        "type": "enum",
        "required": true,
        "values": [
          "admin",
          "manager",
          "developer",
          "editor",
          "viewer"
        ],
        "description": "Role to grant on acceptance."
      },
      {
        "name": "name",
        "type": "string",
        "required": false,
        "description": "Optional display name for the invitee."
      },
      {
        "name": "message",
        "type": "string",
        "required": false,
        "description": "Optional note included in the invite email."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "description": "Created invitation/membership id."
      },
      {
        "name": "email",
        "type": "string",
        "description": "Invited email."
      },
      {
        "name": "role",
        "type": "enum",
        "values": [
          "admin",
          "manager",
          "developer",
          "editor",
          "viewer"
        ],
        "description": "Granted role."
      },
      {
        "name": "status",
        "type": "enum",
        "values": [
          "invited"
        ],
        "description": "Always 'invited' on success."
      },
      {
        "name": "invitedAt",
        "type": "date",
        "description": "When the invite was sent."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block",
      "list"
    ],
    "bindingHint": "Bind to an invite form's submit; show a success toast and refresh the members list, or an inline error if the email already exists."
  },
  {
    "id": "ep-identity-users-update",
    "method": "PATCH",
    "path": "/v2/identity/users/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "identity",
    "summary": "Update a member's editable profile fields.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "User id to update."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "name",
        "type": "string",
        "required": false,
        "description": "New display name."
      },
      {
        "name": "avatarUrl",
        "type": "string",
        "required": false,
        "description": "New profile image URL."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "description": "User id."
      },
      {
        "name": "name",
        "type": "string",
        "description": "Updated name."
      },
      {
        "name": "avatarUrl",
        "type": "string",
        "description": "Updated avatar URL."
      },
      {
        "name": "updatedAt",
        "type": "date",
        "description": "When the change was applied."
      }
    ],
    "triggers": [
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "detail",
      "refresh_block"
    ],
    "bindingHint": "Bind to a profile edit form's submit; show a confirmation toast and refresh the member detail block."
  },
  {
    "id": "ep-identity-users-update-role",
    "method": "PUT",
    "path": "/v2/identity/users/{id}/role",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "identity",
    "summary": "Change a member's role within the space.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "User id whose role changes."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "role",
        "type": "enum",
        "required": true,
        "values": [
          "owner",
          "admin",
          "manager",
          "developer",
          "editor",
          "viewer"
        ],
        "description": "New role to assign."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "description": "User id."
      },
      {
        "name": "role",
        "type": "enum",
        "values": [
          "owner",
          "admin",
          "manager",
          "developer",
          "editor",
          "viewer"
        ],
        "description": "Newly assigned role."
      },
      {
        "name": "capabilities",
        "type": "array",
        "description": "Resolved capabilities after the change."
      },
      {
        "name": "updatedAt",
        "type": "date",
        "description": "When the role was changed."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block",
      "detail"
    ],
    "bindingHint": "Bind to a role dropdown's submit or a confirm button; show a toast and refresh the member row/detail."
  },
  {
    "id": "ep-identity-users-suspend",
    "method": "POST",
    "path": "/v2/identity/users/{id}/suspend",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "identity",
    "summary": "Suspend a member, revoking their access until reinstated.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "User id to suspend."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "reason",
        "type": "string",
        "required": false,
        "description": "Optional audit reason for the suspension."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "description": "User id."
      },
      {
        "name": "status",
        "type": "enum",
        "values": [
          "suspended"
        ],
        "description": "Always 'suspended' on success."
      },
      {
        "name": "suspendedAt",
        "type": "date",
        "description": "When the member was suspended."
      }
    ],
    "triggers": [
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "action_button",
      "refresh_block"
    ],
    "bindingHint": "Bind to a suspend action button; confirm via toast and refresh the members list to reflect the new status."
  },
  {
    "id": "ep-identity-users-delete",
    "method": "DELETE",
    "path": "/v2/identity/users/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "identity",
    "summary": "Remove a member from the space permanently.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "User id to remove."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "description": "Removed user id."
      },
      {
        "name": "success",
        "type": "boolean",
        "description": "True when removal succeeded."
      }
    ],
    "triggers": [
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "action_button",
      "refresh_block"
    ],
    "bindingHint": "Bind to a remove/delete action button with confirmation; show a toast and refresh the members list."
  },
  {
    "id": "ep-identity-roles-list",
    "method": "GET",
    "path": "/v2/identity/roles",
    "kind": "read",
    "auth": "jwt",
    "resource": "identity",
    "summary": "List the available roles and their human labels.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "description": "Array of roles; each item has key, label, isSuperAdmin, memberCount."
      },
      {
        "name": "total",
        "type": "number",
        "description": "Number of roles."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "list",
      "field",
      "form"
    ],
    "bindingHint": "Bind on_load to populate a role picker (dropdown/list) or a roles overview block."
  },
  {
    "id": "ep-identity-roles-capabilities",
    "method": "GET",
    "path": "/v2/identity/roles/{role}/capabilities",
    "kind": "read",
    "auth": "jwt",
    "resource": "identity",
    "summary": "Return the capability matrix granted to a specific role.",
    "pathParams": [
      {
        "name": "role",
        "type": "enum",
        "required": true,
        "values": [
          "owner",
          "admin",
          "manager",
          "developer",
          "editor",
          "viewer"
        ],
        "description": "Role key to inspect."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "role",
        "type": "enum",
        "values": [
          "owner",
          "admin",
          "manager",
          "developer",
          "editor",
          "viewer"
        ],
        "description": "The inspected role."
      },
      {
        "name": "capabilities",
        "type": "array",
        "description": "Capability keys granted to this role."
      },
      {
        "name": "isSuperAdmin",
        "type": "boolean",
        "description": "True for the owner/super-admin role with all capabilities."
      }
    ],
    "triggers": [
      "on_load"
    ],
    "renderTargets": [
      "detail",
      "list",
      "field"
    ],
    "bindingHint": "Bind on_load with a selected role to render its capability checklist in a permissions detail block."
  },
  {
    "id": "ep-settings-general-get",
    "method": "GET",
    "path": "/v2/settings/general",
    "kind": "read",
    "auth": "jwt",
    "resource": "settings",
    "summary": "Fetch general space settings such as name, region and environment.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "name",
        "type": "string",
        "description": "Space display name."
      },
      {
        "name": "region",
        "type": "enum",
        "values": [
          "eu-west-1",
          "us-east-1",
          "ap-southeast-1"
        ],
        "description": "Data residency region."
      },
      {
        "name": "environment",
        "type": "enum",
        "values": [
          "production",
          "staging",
          "development"
        ],
        "description": "Current environment."
      },
      {
        "name": "spaceId",
        "type": "id",
        "description": "Unique space identifier."
      }
    ],
    "triggers": [
      "on_load"
    ],
    "renderTargets": [
      "form",
      "detail",
      "field"
    ],
    "bindingHint": "Bind on_load to prefill the general settings form or show the space name/region in a settings header."
  },
  {
    "id": "ep-settings-general-update",
    "method": "PUT",
    "path": "/v2/settings/general",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "settings",
    "summary": "Update general space settings like name and region.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "name",
        "type": "string",
        "required": false,
        "description": "New space name."
      },
      {
        "name": "region",
        "type": "enum",
        "required": false,
        "values": [
          "eu-west-1",
          "us-east-1",
          "ap-southeast-1"
        ],
        "description": "New data residency region."
      }
    ],
    "responseFields": [
      {
        "name": "name",
        "type": "string",
        "description": "Updated space name."
      },
      {
        "name": "region",
        "type": "enum",
        "values": [
          "eu-west-1",
          "us-east-1",
          "ap-southeast-1"
        ],
        "description": "Updated region."
      },
      {
        "name": "updatedAt",
        "type": "date",
        "description": "When settings were saved."
      }
    ],
    "triggers": [
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block",
      "form"
    ],
    "bindingHint": "Bind to the general settings form's submit; show a saved toast and refresh the settings block."
  },
  {
    "id": "ep-settings-billing-get",
    "method": "GET",
    "path": "/v2/settings/billing",
    "kind": "read",
    "auth": "jwt",
    "resource": "settings",
    "summary": "Return the current plan, available plans and usage for billing.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "currentPlan",
        "type": "string",
        "description": "Key of the active plan."
      },
      {
        "name": "plans",
        "type": "array",
        "description": "Available plan cards; each has id, name, price, cadence, tagline, features, current, cta."
      },
      {
        "name": "seatsUsed",
        "type": "number",
        "description": "Seats currently consumed."
      },
      {
        "name": "seatsLimit",
        "type": "number",
        "description": "Seats included in the plan."
      },
      {
        "name": "renewsAt",
        "type": "date",
        "description": "Next renewal/billing date."
      }
    ],
    "triggers": [
      "on_load"
    ],
    "renderTargets": [
      "list",
      "detail",
      "field"
    ],
    "bindingHint": "Bind on_load to render plan cards (list) and current-usage fields on the billing page."
  },
  {
    "id": "ep-settings-billing-change-plan",
    "method": "POST",
    "path": "/v2/settings/billing/plan",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "settings",
    "summary": "Switch the space to a different subscription plan.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "plan",
        "type": "enum",
        "required": true,
        "values": [
          "starter",
          "professional",
          "business",
          "enterprise"
        ],
        "description": "Target plan to subscribe to."
      },
      {
        "name": "billingCycle",
        "type": "enum",
        "required": false,
        "values": [
          "monthly",
          "annual"
        ],
        "description": "Billing cadence."
      }
    ],
    "responseFields": [
      {
        "name": "currentPlan",
        "type": "string",
        "description": "Newly active plan key."
      },
      {
        "name": "effectiveAt",
        "type": "date",
        "description": "When the new plan takes effect."
      },
      {
        "name": "prorated",
        "type": "boolean",
        "description": "Whether the change was prorated."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "redirect",
      "refresh_block"
    ],
    "bindingHint": "Bind to a plan card's upgrade/downgrade button; on success refresh billing or redirect to a checkout/confirmation."
  },
  {
    "id": "ep-settings-domains-list",
    "method": "GET",
    "path": "/v2/settings/domains",
    "kind": "read",
    "auth": "jwt",
    "resource": "settings",
    "summary": "List custom domains attached to the space with verification status.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "description": "Array of domains; each has id, host, primary, status, addedAt."
      },
      {
        "name": "total",
        "type": "number",
        "description": "Number of domains."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list",
      "refresh_block"
    ],
    "bindingHint": "Bind on_load to a domains table; poll on_interval while a domain is pending verification."
  },
  {
    "id": "ep-settings-domains-add",
    "method": "POST",
    "path": "/v2/settings/domains",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "settings",
    "summary": "Attach a new custom domain to the space (starts pending verification).",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "host",
        "type": "string",
        "required": true,
        "description": "Fully-qualified hostname to add."
      },
      {
        "name": "primary",
        "type": "boolean",
        "required": false,
        "description": "Set as the primary domain."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "description": "Created domain id."
      },
      {
        "name": "host",
        "type": "string",
        "description": "The added hostname."
      },
      {
        "name": "status",
        "type": "enum",
        "values": [
          "pending",
          "verified"
        ],
        "description": "Verification status (pending on creation)."
      },
      {
        "name": "addedAt",
        "type": "date",
        "description": "When the domain was added."
      },
      {
        "name": "dnsRecords",
        "type": "array",
        "description": "DNS records the user must set to verify."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block",
      "list",
      "detail"
    ],
    "bindingHint": "Bind to an add-domain form's submit; show a toast, refresh the domains list and surface DNS instructions in a detail block."
  },
  {
    "id": "ep-settings-domains-delete",
    "method": "DELETE",
    "path": "/v2/settings/domains/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "settings",
    "summary": "Detach a custom domain from the space.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Domain id to remove."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "description": "Removed domain id."
      },
      {
        "name": "success",
        "type": "boolean",
        "description": "True when the domain was detached."
      }
    ],
    "triggers": [
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "action_button",
      "refresh_block"
    ],
    "bindingHint": "Bind to a remove-domain action button with confirmation; show a toast and refresh the domains list."
  },
  {
    "id": "ep-settings-toggles-list",
    "method": "GET",
    "path": "/v2/settings/toggles",
    "kind": "read",
    "auth": "jwt",
    "resource": "settings",
    "summary": "List developer/feature toggles and their enabled state.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "items",
        "type": "array",
        "description": "Array of toggles; each has id, label, description, enabled."
      },
      {
        "name": "total",
        "type": "number",
        "description": "Number of toggles."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "list",
      "field"
    ],
    "bindingHint": "Bind on_load to render feature toggle switches in the developer settings panel."
  },
  {
    "id": "ep-settings-toggle-update",
    "method": "PATCH",
    "path": "/v2/settings/toggles/{id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "settings",
    "summary": "Enable or disable a single developer/feature toggle.",
    "pathParams": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Toggle id (e.g. developer_mode, api_access, webhooks)."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "enabled",
        "type": "boolean",
        "required": true,
        "description": "New on/off state for the toggle."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "description": "Toggle id."
      },
      {
        "name": "enabled",
        "type": "boolean",
        "description": "Resulting state."
      },
      {
        "name": "updatedAt",
        "type": "date",
        "description": "When the toggle changed."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block",
      "field"
    ],
    "bindingHint": "Bind to a switch's change/click; optimistically reflect the new state and show an error toast on failure."
  },
  {
    "id": "ep-assets-list",
    "method": "GET",
    "path": "/v2/spaces/{space_id}/assets",
    "kind": "read",
    "auth": "jwt",
    "resource": "spaces",
    "summary": "List media assets in a space with filtering, search, and pagination.",
    "pathParams": [
      {
        "name": "space_id",
        "type": "id",
        "required": true,
        "description": "Space the assets belong to."
      }
    ],
    "queryParams": [
      {
        "name": "page",
        "type": "number",
        "required": false,
        "description": "1-based page index."
      },
      {
        "name": "per_page",
        "type": "number",
        "required": false,
        "description": "Items per page (max 100)."
      },
      {
        "name": "search",
        "type": "string",
        "required": false,
        "description": "Filename / alt text search term."
      },
      {
        "name": "content_type",
        "type": "enum",
        "required": false,
        "values": [
          "image",
          "video",
          "audio",
          "document",
          "all"
        ],
        "description": "Filter by media kind."
      },
      {
        "name": "folder_id",
        "type": "id",
        "required": false,
        "description": "Restrict to a single asset folder."
      },
      {
        "name": "sort_by",
        "type": "enum",
        "required": false,
        "values": [
          "created_at",
          "updated_at",
          "filename",
          "size"
        ],
        "description": "Sort field."
      },
      {
        "name": "order",
        "type": "enum",
        "required": false,
        "values": [
          "asc",
          "desc"
        ],
        "description": "Sort direction."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Asset id (item shape)."
      },
      {
        "name": "filename",
        "type": "string",
        "required": true,
        "description": "Original file name."
      },
      {
        "name": "url",
        "type": "string",
        "required": true,
        "description": "CDN URL of the asset."
      },
      {
        "name": "thumbnail_url",
        "type": "string",
        "required": false,
        "description": "Preview/thumbnail URL."
      },
      {
        "name": "content_type",
        "type": "enum",
        "required": true,
        "values": [
          "image",
          "video",
          "audio",
          "document"
        ],
        "description": "Media kind."
      },
      {
        "name": "mime_type",
        "type": "string",
        "required": true,
        "description": "MIME type, e.g. image/png."
      },
      {
        "name": "size",
        "type": "number",
        "required": true,
        "description": "File size in bytes."
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "description": "Pixel width for images/videos."
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "description": "Pixel height for images/videos."
      },
      {
        "name": "alt",
        "type": "string",
        "required": false,
        "description": "Alt text."
      },
      {
        "name": "folder_id",
        "type": "id",
        "required": false,
        "description": "Containing folder."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true,
        "description": "Upload timestamp."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Total matching assets across all pages."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list"
    ],
    "bindingHint": "Use to populate a media gallery or asset picker grid; bind each item to a repeated thumbnail/card block in a list."
  },
  {
    "id": "ep-assets-detail",
    "method": "GET",
    "path": "/v2/spaces/{space_id}/assets/{asset_id}",
    "kind": "read",
    "auth": "jwt",
    "resource": "spaces",
    "summary": "Fetch full metadata and variants for a single asset.",
    "pathParams": [
      {
        "name": "space_id",
        "type": "id",
        "required": true,
        "description": "Owning space."
      },
      {
        "name": "asset_id",
        "type": "id",
        "required": true,
        "description": "Asset to fetch."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Asset id."
      },
      {
        "name": "filename",
        "type": "string",
        "required": true,
        "description": "Original file name."
      },
      {
        "name": "url",
        "type": "string",
        "required": true,
        "description": "CDN URL."
      },
      {
        "name": "content_type",
        "type": "enum",
        "required": true,
        "values": [
          "image",
          "video",
          "audio",
          "document"
        ],
        "description": "Media kind."
      },
      {
        "name": "mime_type",
        "type": "string",
        "required": true,
        "description": "MIME type."
      },
      {
        "name": "size",
        "type": "number",
        "required": true,
        "description": "Size in bytes."
      },
      {
        "name": "width",
        "type": "number",
        "required": false,
        "description": "Pixel width."
      },
      {
        "name": "height",
        "type": "number",
        "required": false,
        "description": "Pixel height."
      },
      {
        "name": "alt",
        "type": "string",
        "required": false,
        "description": "Alt text."
      },
      {
        "name": "title",
        "type": "string",
        "required": false,
        "description": "Display title."
      },
      {
        "name": "copyright",
        "type": "string",
        "required": false,
        "description": "Copyright/credit line."
      },
      {
        "name": "focus",
        "type": "string",
        "required": false,
        "description": "Focal point coordinates for smart cropping."
      },
      {
        "name": "variants",
        "type": "array",
        "required": false,
        "description": "Generated size/format variants."
      },
      {
        "name": "folder_id",
        "type": "id",
        "required": false,
        "description": "Containing folder."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true,
        "description": "Upload timestamp."
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": true,
        "description": "Last metadata change."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "detail",
      "field",
      "form"
    ],
    "bindingHint": "Use to render a single image/media block or prefill an asset-metadata edit form when one asset is selected."
  },
  {
    "id": "ep-assets-upload",
    "method": "POST",
    "path": "/v2/spaces/{space_id}/assets",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "spaces",
    "summary": "Upload a new media asset (multipart) into a space, optionally into a folder.",
    "pathParams": [
      {
        "name": "space_id",
        "type": "id",
        "required": true,
        "description": "Target space."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "file",
        "type": "object",
        "required": true,
        "description": "Binary file payload (multipart/form-data)."
      },
      {
        "name": "filename",
        "type": "string",
        "required": true,
        "description": "Desired file name."
      },
      {
        "name": "folder_id",
        "type": "id",
        "required": false,
        "description": "Destination folder."
      },
      {
        "name": "alt",
        "type": "string",
        "required": false,
        "description": "Alt text."
      },
      {
        "name": "title",
        "type": "string",
        "required": false,
        "description": "Display title."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "New asset id."
      },
      {
        "name": "url",
        "type": "string",
        "required": true,
        "description": "CDN URL of the uploaded asset."
      },
      {
        "name": "filename",
        "type": "string",
        "required": true,
        "description": "Stored file name."
      },
      {
        "name": "content_type",
        "type": "enum",
        "required": true,
        "values": [
          "image",
          "video",
          "audio",
          "document"
        ],
        "description": "Detected media kind."
      },
      {
        "name": "size",
        "type": "number",
        "required": true,
        "description": "Stored size in bytes."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true,
        "description": "Upload timestamp."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block",
      "field"
    ],
    "bindingHint": "Bind to a file-upload/dropzone control; show a success toast and refresh the asset list, or write the returned URL into an image field."
  },
  {
    "id": "ep-assets-update",
    "method": "PUT",
    "path": "/v2/spaces/{space_id}/assets/{asset_id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "spaces",
    "summary": "Update asset metadata (alt, title, focus, folder).",
    "pathParams": [
      {
        "name": "space_id",
        "type": "id",
        "required": true,
        "description": "Owning space."
      },
      {
        "name": "asset_id",
        "type": "id",
        "required": true,
        "description": "Asset to update."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "alt",
        "type": "string",
        "required": false,
        "description": "Alt text."
      },
      {
        "name": "title",
        "type": "string",
        "required": false,
        "description": "Display title."
      },
      {
        "name": "copyright",
        "type": "string",
        "required": false,
        "description": "Credit line."
      },
      {
        "name": "focus",
        "type": "string",
        "required": false,
        "description": "Focal point coordinates."
      },
      {
        "name": "folder_id",
        "type": "id",
        "required": false,
        "description": "Move to this folder."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Asset id."
      },
      {
        "name": "alt",
        "type": "string",
        "required": false,
        "description": "Updated alt text."
      },
      {
        "name": "title",
        "type": "string",
        "required": false,
        "description": "Updated title."
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": true,
        "description": "Update timestamp."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to an asset-detail edit form's save action; confirm with a toast and refresh the detail block."
  },
  {
    "id": "ep-assets-delete",
    "method": "DELETE",
    "path": "/v2/spaces/{space_id}/assets/{asset_id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "spaces",
    "summary": "Permanently delete an asset from a space.",
    "pathParams": [
      {
        "name": "space_id",
        "type": "id",
        "required": true,
        "description": "Owning space."
      },
      {
        "name": "asset_id",
        "type": "id",
        "required": true,
        "description": "Asset to delete."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Deleted asset id."
      },
      {
        "name": "deleted",
        "type": "boolean",
        "required": true,
        "description": "Always true on success."
      }
    ],
    "triggers": [
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to a delete button on an asset card; show a toast and refresh the asset list on success."
  },
  {
    "id": "ep-marketplace-items-list",
    "method": "GET",
    "path": "/v2/marketplace/items",
    "kind": "read",
    "auth": "jwt",
    "resource": "marketplace",
    "summary": "Browse marketplace items (blocks, plugins, themes, integrations) with category and search filters.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "category",
        "type": "enum",
        "required": false,
        "values": [
          "block",
          "plugin",
          "theme",
          "integration",
          "field_type",
          "all"
        ],
        "description": "Item category filter."
      },
      {
        "name": "search",
        "type": "string",
        "required": false,
        "description": "Search term."
      },
      {
        "name": "pricing",
        "type": "enum",
        "required": false,
        "values": [
          "free",
          "paid",
          "all"
        ],
        "description": "Pricing filter."
      },
      {
        "name": "sort_by",
        "type": "enum",
        "required": false,
        "values": [
          "popular",
          "newest",
          "rating",
          "name"
        ],
        "description": "Sort order."
      },
      {
        "name": "page",
        "type": "number",
        "required": false,
        "description": "1-based page index."
      },
      {
        "name": "per_page",
        "type": "number",
        "required": false,
        "description": "Items per page."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Marketplace item id (item shape)."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Item display name."
      },
      {
        "name": "slug",
        "type": "string",
        "required": true,
        "description": "URL slug."
      },
      {
        "name": "category",
        "type": "enum",
        "required": true,
        "values": [
          "block",
          "plugin",
          "theme",
          "integration",
          "field_type"
        ],
        "description": "Item category."
      },
      {
        "name": "short_description",
        "type": "string",
        "required": true,
        "description": "One-line tagline."
      },
      {
        "name": "icon_url",
        "type": "string",
        "required": false,
        "description": "Item icon/logo."
      },
      {
        "name": "publisher",
        "type": "string",
        "required": true,
        "description": "Author/vendor name."
      },
      {
        "name": "rating",
        "type": "number",
        "required": false,
        "description": "Average star rating (0-5)."
      },
      {
        "name": "install_count",
        "type": "number",
        "required": false,
        "description": "Total installs."
      },
      {
        "name": "pricing",
        "type": "enum",
        "required": true,
        "values": [
          "free",
          "paid"
        ],
        "description": "Pricing model."
      },
      {
        "name": "price",
        "type": "number",
        "required": false,
        "description": "Price in cents if paid."
      },
      {
        "name": "is_installed",
        "type": "boolean",
        "required": true,
        "description": "Whether installed in current space."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Total matching items across pages."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "list"
    ],
    "bindingHint": "Use to render the marketplace browse grid; bind each item to a repeated card showing icon, name, and an install button."
  },
  {
    "id": "ep-marketplace-item-detail",
    "method": "GET",
    "path": "/v2/marketplace/items/{item_id}",
    "kind": "read",
    "auth": "jwt",
    "resource": "marketplace",
    "summary": "Fetch full details for one marketplace item including screenshots and versions.",
    "pathParams": [
      {
        "name": "item_id",
        "type": "id",
        "required": true,
        "description": "Marketplace item to fetch."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Item id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Display name."
      },
      {
        "name": "category",
        "type": "enum",
        "required": true,
        "values": [
          "block",
          "plugin",
          "theme",
          "integration",
          "field_type"
        ],
        "description": "Category."
      },
      {
        "name": "description",
        "type": "string",
        "required": true,
        "description": "Full rich description."
      },
      {
        "name": "publisher",
        "type": "string",
        "required": true,
        "description": "Vendor name."
      },
      {
        "name": "version",
        "type": "string",
        "required": true,
        "description": "Latest version string."
      },
      {
        "name": "screenshots",
        "type": "array",
        "required": false,
        "description": "Gallery image URLs."
      },
      {
        "name": "rating",
        "type": "number",
        "required": false,
        "description": "Average rating."
      },
      {
        "name": "review_count",
        "type": "number",
        "required": false,
        "description": "Number of reviews."
      },
      {
        "name": "install_count",
        "type": "number",
        "required": false,
        "description": "Total installs."
      },
      {
        "name": "pricing",
        "type": "enum",
        "required": true,
        "values": [
          "free",
          "paid"
        ],
        "description": "Pricing model."
      },
      {
        "name": "price",
        "type": "number",
        "required": false,
        "description": "Price in cents if paid."
      },
      {
        "name": "permissions",
        "type": "array",
        "required": false,
        "description": "Scopes the item requests on install."
      },
      {
        "name": "is_installed",
        "type": "boolean",
        "required": true,
        "description": "Installed in current space."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "detail",
      "field"
    ],
    "bindingHint": "Use on a marketplace item detail page to fill the hero block, screenshot carousel, and install/uninstall action area."
  },
  {
    "id": "ep-marketplace-install",
    "method": "POST",
    "path": "/v2/spaces/{space_id}/marketplace/installs",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "spaces",
    "summary": "Install a marketplace item into a space.",
    "pathParams": [
      {
        "name": "space_id",
        "type": "id",
        "required": true,
        "description": "Space to install into."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "item_id",
        "type": "id",
        "required": true,
        "description": "Marketplace item to install."
      },
      {
        "name": "version",
        "type": "string",
        "required": false,
        "description": "Specific version; defaults to latest."
      },
      {
        "name": "config",
        "type": "object",
        "required": false,
        "description": "Initial configuration values for the item."
      }
    ],
    "responseFields": [
      {
        "name": "install_id",
        "type": "id",
        "required": true,
        "description": "Installation record id."
      },
      {
        "name": "item_id",
        "type": "id",
        "required": true,
        "description": "Installed item id."
      },
      {
        "name": "version",
        "type": "string",
        "required": true,
        "description": "Installed version."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "installed",
          "pending",
          "failed"
        ],
        "description": "Install status."
      },
      {
        "name": "installed_at",
        "type": "date",
        "required": true,
        "description": "Install timestamp."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "action_button",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to an Install button on a marketplace card/detail; on success swap the button to Installed and toast confirmation."
  },
  {
    "id": "ep-marketplace-uninstall",
    "method": "DELETE",
    "path": "/v2/spaces/{space_id}/marketplace/installs/{install_id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "spaces",
    "summary": "Uninstall a previously installed marketplace item from a space.",
    "pathParams": [
      {
        "name": "space_id",
        "type": "id",
        "required": true,
        "description": "Space the item is installed in."
      },
      {
        "name": "install_id",
        "type": "id",
        "required": true,
        "description": "Installation record to remove."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "install_id",
        "type": "id",
        "required": true,
        "description": "Removed installation id."
      },
      {
        "name": "uninstalled",
        "type": "boolean",
        "required": true,
        "description": "Always true on success."
      }
    ],
    "triggers": [
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "action_button",
      "refresh_block"
    ],
    "bindingHint": "Bind to an Uninstall/Remove button; on success revert the action button to Install and refresh the installs list."
  },
  {
    "id": "ep-analytics-query",
    "method": "GET",
    "path": "/v2/spaces/{space_id}/analytics/metrics",
    "kind": "read",
    "auth": "jwt",
    "resource": "spaces",
    "summary": "Query aggregated analytics metrics for a space over a time range, scoped by viewer role.",
    "pathParams": [
      {
        "name": "space_id",
        "type": "id",
        "required": true,
        "description": "Space to report on."
      }
    ],
    "queryParams": [
      {
        "name": "metric",
        "type": "enum",
        "required": true,
        "values": [
          "page_views",
          "unique_visitors",
          "api_requests",
          "bandwidth",
          "publishes",
          "asset_downloads"
        ],
        "description": "Metric to aggregate."
      },
      {
        "name": "range",
        "type": "enum",
        "required": true,
        "values": [
          "24h",
          "7d",
          "30d",
          "90d",
          "12m",
          "custom"
        ],
        "description": "Preset time window."
      },
      {
        "name": "from",
        "type": "date",
        "required": false,
        "description": "Custom range start (when range=custom)."
      },
      {
        "name": "to",
        "type": "date",
        "required": false,
        "description": "Custom range end (when range=custom)."
      },
      {
        "name": "interval",
        "type": "enum",
        "required": false,
        "values": [
          "hour",
          "day",
          "week",
          "month"
        ],
        "description": "Bucket granularity."
      },
      {
        "name": "role_scope",
        "type": "enum",
        "required": false,
        "values": [
          "all",
          "viewer",
          "editor",
          "admin"
        ],
        "description": "Restrict to actions by a role; gated by caller permissions."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "metric",
        "type": "enum",
        "required": true,
        "values": [
          "page_views",
          "unique_visitors",
          "api_requests",
          "bandwidth",
          "publishes",
          "asset_downloads"
        ],
        "description": "Echoed metric."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Aggregate value over the range."
      },
      {
        "name": "change_pct",
        "type": "number",
        "required": false,
        "description": "Percent change vs previous period."
      },
      {
        "name": "series",
        "type": "array",
        "required": true,
        "description": "Time-bucketed points: { timestamp:date, value:number }."
      },
      {
        "name": "range",
        "type": "enum",
        "required": true,
        "values": [
          "24h",
          "7d",
          "30d",
          "90d",
          "12m",
          "custom"
        ],
        "description": "Echoed range."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "detail",
      "field",
      "list"
    ],
    "bindingHint": "Use to feed a chart or KPI block; bind total/change_pct to a stat field and series to a chart's data list, refreshing on interval for live dashboards."
  },
  {
    "id": "ep-analytics-top-content",
    "method": "GET",
    "path": "/v2/spaces/{space_id}/analytics/top-content",
    "kind": "read",
    "auth": "jwt",
    "resource": "spaces",
    "summary": "List the top-performing content/pages in a space for a time range.",
    "pathParams": [
      {
        "name": "space_id",
        "type": "id",
        "required": true,
        "description": "Space to report on."
      }
    ],
    "queryParams": [
      {
        "name": "range",
        "type": "enum",
        "required": true,
        "values": [
          "24h",
          "7d",
          "30d",
          "90d"
        ],
        "description": "Time window."
      },
      {
        "name": "metric",
        "type": "enum",
        "required": false,
        "values": [
          "page_views",
          "unique_visitors",
          "avg_time"
        ],
        "description": "Ranking metric."
      },
      {
        "name": "limit",
        "type": "number",
        "required": false,
        "description": "Max rows to return (default 10)."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "story_id",
        "type": "id",
        "required": true,
        "description": "Content/story id (item shape)."
      },
      {
        "name": "title",
        "type": "string",
        "required": true,
        "description": "Content title."
      },
      {
        "name": "slug",
        "type": "string",
        "required": true,
        "description": "Content URL slug."
      },
      {
        "name": "views",
        "type": "number",
        "required": true,
        "description": "View count in range."
      },
      {
        "name": "unique_visitors",
        "type": "number",
        "required": false,
        "description": "Unique visitors in range."
      },
      {
        "name": "avg_time_seconds",
        "type": "number",
        "required": false,
        "description": "Average time on page."
      },
      {
        "name": "change_pct",
        "type": "number",
        "required": false,
        "description": "Change vs previous period."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible",
      "on_interval"
    ],
    "renderTargets": [
      "list"
    ],
    "bindingHint": "Use to render a leaderboard/table block; bind each row to a repeated list item showing title and views."
  },
  {
    "id": "ep-spaces-list",
    "method": "GET",
    "path": "/v2/spaces",
    "kind": "read",
    "auth": "jwt",
    "resource": "spaces",
    "summary": "List spaces the authenticated user can access, with role and plan info.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "search",
        "type": "string",
        "required": false,
        "description": "Filter by space name."
      },
      {
        "name": "role",
        "type": "enum",
        "required": false,
        "values": [
          "owner",
          "admin",
          "editor",
          "viewer"
        ],
        "description": "Filter by caller's role in the space."
      },
      {
        "name": "page",
        "type": "number",
        "required": false,
        "description": "1-based page index."
      },
      {
        "name": "per_page",
        "type": "number",
        "required": false,
        "description": "Items per page."
      }
    ],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Space id (item shape)."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Space name."
      },
      {
        "name": "slug",
        "type": "string",
        "required": true,
        "description": "Space slug."
      },
      {
        "name": "plan",
        "type": "enum",
        "required": true,
        "values": [
          "free",
          "starter",
          "business",
          "enterprise"
        ],
        "description": "Subscription plan."
      },
      {
        "name": "region",
        "type": "enum",
        "required": true,
        "values": [
          "us",
          "eu",
          "ap",
          "ca"
        ],
        "description": "Data region."
      },
      {
        "name": "role",
        "type": "enum",
        "required": true,
        "values": [
          "owner",
          "admin",
          "editor",
          "viewer"
        ],
        "description": "Caller's role."
      },
      {
        "name": "story_count",
        "type": "number",
        "required": false,
        "description": "Number of stories."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true,
        "description": "Creation timestamp."
      },
      {
        "name": "total",
        "type": "number",
        "required": true,
        "description": "Total accessible spaces."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "list"
    ],
    "bindingHint": "Use to render a space switcher or dashboard grid; bind each item to a repeated space card."
  },
  {
    "id": "ep-spaces-detail",
    "method": "GET",
    "path": "/v2/spaces/{space_id}",
    "kind": "read",
    "auth": "jwt",
    "resource": "spaces",
    "summary": "Fetch full settings and usage for a single space.",
    "pathParams": [
      {
        "name": "space_id",
        "type": "id",
        "required": true,
        "description": "Space to fetch."
      }
    ],
    "queryParams": [],
    "requestBody": [],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Space id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Space name."
      },
      {
        "name": "slug",
        "type": "string",
        "required": true,
        "description": "Space slug."
      },
      {
        "name": "plan",
        "type": "enum",
        "required": true,
        "values": [
          "free",
          "starter",
          "business",
          "enterprise"
        ],
        "description": "Subscription plan."
      },
      {
        "name": "region",
        "type": "enum",
        "required": true,
        "values": [
          "us",
          "eu",
          "ap",
          "ca"
        ],
        "description": "Data region."
      },
      {
        "name": "domain",
        "type": "string",
        "required": false,
        "description": "Custom domain."
      },
      {
        "name": "environments",
        "type": "array",
        "required": false,
        "description": "Configured environments."
      },
      {
        "name": "usage",
        "type": "object",
        "required": false,
        "description": "Current usage counters (assets, requests, bandwidth)."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true,
        "description": "Creation timestamp."
      },
      {
        "name": "updated_at",
        "type": "date",
        "required": true,
        "description": "Last update."
      }
    ],
    "triggers": [
      "on_load",
      "on_visible"
    ],
    "renderTargets": [
      "detail",
      "field",
      "form"
    ],
    "bindingHint": "Use to fill a space-overview block or prefill the space settings form when a space is selected."
  },
  {
    "id": "ep-spaces-create",
    "method": "POST",
    "path": "/v2/spaces",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "spaces",
    "summary": "Create a new space.",
    "pathParams": [],
    "queryParams": [],
    "requestBody": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Space name."
      },
      {
        "name": "region",
        "type": "enum",
        "required": true,
        "values": [
          "us",
          "eu",
          "ap",
          "ca"
        ],
        "description": "Data region."
      },
      {
        "name": "plan",
        "type": "enum",
        "required": false,
        "values": [
          "free",
          "starter",
          "business",
          "enterprise"
        ],
        "description": "Initial plan; defaults to free."
      },
      {
        "name": "template_id",
        "type": "id",
        "required": false,
        "description": "Optional starter template to seed content."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "New space id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Space name."
      },
      {
        "name": "slug",
        "type": "string",
        "required": true,
        "description": "Generated slug."
      },
      {
        "name": "region",
        "type": "enum",
        "required": true,
        "values": [
          "us",
          "eu",
          "ap",
          "ca"
        ],
        "description": "Data region."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true,
        "description": "Creation timestamp."
      }
    ],
    "triggers": [
      "on_submit",
      "on_click"
    ],
    "renderTargets": [
      "toast",
      "redirect",
      "inline_message",
      "refresh_block"
    ],
    "bindingHint": "Bind to a create-space form submit; on success toast and redirect into the new space's dashboard."
  },
  {
    "id": "ep-spaces-clone",
    "method": "POST",
    "path": "/v2/spaces/{space_id}/clone",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "spaces",
    "summary": "Clone an existing space, optionally including content and assets.",
    "pathParams": [
      {
        "name": "space_id",
        "type": "id",
        "required": true,
        "description": "Source space to clone."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Name for the cloned space."
      },
      {
        "name": "region",
        "type": "enum",
        "required": false,
        "values": [
          "us",
          "eu",
          "ap",
          "ca"
        ],
        "description": "Target region; defaults to source region."
      },
      {
        "name": "include_content",
        "type": "boolean",
        "required": false,
        "description": "Copy stories/content."
      },
      {
        "name": "include_assets",
        "type": "boolean",
        "required": false,
        "description": "Copy media assets."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "New cloned space id."
      },
      {
        "name": "name",
        "type": "string",
        "required": true,
        "description": "Cloned space name."
      },
      {
        "name": "source_space_id",
        "type": "id",
        "required": true,
        "description": "Origin space id."
      },
      {
        "name": "status",
        "type": "enum",
        "required": true,
        "values": [
          "queued",
          "processing",
          "completed",
          "failed"
        ],
        "description": "Clone job status."
      },
      {
        "name": "created_at",
        "type": "date",
        "required": true,
        "description": "Clone start timestamp."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "redirect",
      "refresh_block"
    ],
    "bindingHint": "Bind to a Clone action/dialog on a space card; show an in-progress inline message and refresh the spaces list when done."
  },
  {
    "id": "ep-spaces-delete",
    "method": "DELETE",
    "path": "/v2/spaces/{space_id}",
    "kind": "mutation",
    "auth": "jwt",
    "resource": "spaces",
    "summary": "Permanently delete a space and all its content.",
    "pathParams": [
      {
        "name": "space_id",
        "type": "id",
        "required": true,
        "description": "Space to delete."
      }
    ],
    "queryParams": [],
    "requestBody": [
      {
        "name": "confirm_name",
        "type": "string",
        "required": true,
        "description": "User must retype the space name to confirm."
      }
    ],
    "responseFields": [
      {
        "name": "id",
        "type": "id",
        "required": true,
        "description": "Deleted space id."
      },
      {
        "name": "deleted",
        "type": "boolean",
        "required": true,
        "description": "Always true on success."
      }
    ],
    "triggers": [
      "on_click",
      "on_submit"
    ],
    "renderTargets": [
      "toast",
      "inline_message",
      "redirect",
      "refresh_block"
    ],
    "bindingHint": "Bind to a danger-zone delete confirm form; on success toast and redirect to the spaces list."
  }
];
