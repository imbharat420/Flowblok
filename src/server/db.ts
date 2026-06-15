// In-memory data source for the first visualization.
// This stands in for the Postgres + RLS layer described in 02-TECHNICAL-ARCHITECTURE.md.
// Repositories read from here; swapping this for Prisma/Supabase later is a single-layer change.

import type { ActivityEvent, Folder, Space, Story } from "@/lib/types";

export const space: Space = {
  id: "spc_290040128750298",
  name: "Acme Digital — Demo Space",
  plan: "Professional",
  counts: {
    pages: 52,
    collections: 18,
    workflows: 43,
    apis: 29,
    users: 220,
    roles: 7,
    aiAgents: 12,
    deployments: 4,
  },
};

export const folders: Folder[] = [
  { id: "fld_home", name: "Home", storyCount: 4 },
  { id: "fld_blog", name: "Blog", storyCount: 9 },
  { id: "fld_products", name: "Products", storyCount: 12 },
  { id: "fld_marketing", name: "Marketing", storyCount: 6 },
  { id: "fld_legal", name: "Legal", storyCount: 3 },
];

function story(
  id: string,
  name: string,
  slug: string,
  contentType: string,
  status: Story["status"],
  folder: string | null,
  author: string,
  updatedAt: string,
): Story {
  return {
    id,
    name,
    slug,
    contentType,
    status,
    folder,
    author,
    updatedAt,
    content: {
      component: contentType,
      props: { title: name },
      children: [
        { component: "hero", props: { headline: name, subline: "Built visually with Flowblok" } },
        { component: "feature_grid", props: { columns: 3 } },
      ],
    },
  };
}

export const stories: Story[] = [
  story("st_001", "Home", "home", "page", "published", "Home", "Dharamraj N.", "2026-06-15T09:12:00Z"),
  story("st_002", "Pricing", "pricing", "page", "published", "Home", "Priya S.", "2026-06-14T16:40:00Z"),
  story("st_003", "About Us", "about", "page", "draft", "Home", "Dharamraj N.", "2026-06-16T08:05:00Z"),
  story("st_004", "Contact", "contact", "page", "review", "Home", "Marco D.", "2026-06-13T11:22:00Z"),
  story("st_005", "Launching Flowblok 1.0", "blog/launching-flowblok", "post", "published", "Blog", "Priya S.", "2026-06-12T10:00:00Z"),
  story("st_006", "Why visual + code beats no-code", "blog/visual-plus-code", "post", "draft", "Blog", "Dharamraj N.", "2026-06-16T07:30:00Z"),
  story("st_007", "Headless CMS in 2026", "blog/headless-2026", "post", "review", "Blog", "Aria K.", "2026-06-11T14:15:00Z"),
  story("st_008", "Aurora Desk Lamp", "products/aurora-lamp", "product", "published", "Products", "Marco D.", "2026-06-10T13:05:00Z"),
  story("st_009", "Nimbus Office Chair", "products/nimbus-chair", "product", "published", "Products", "Marco D.", "2026-06-09T09:45:00Z"),
  story("st_010", "Helix Standing Desk", "products/helix-desk", "product", "draft", "Products", "Aria K.", "2026-06-16T06:50:00Z"),
  story("st_011", "Summer Campaign LP", "marketing/summer", "landing_page", "review", "Marketing", "Priya S.", "2026-06-15T18:20:00Z"),
  story("st_012", "Webinar Signup", "marketing/webinar", "landing_page", "published", "Marketing", "Aria K.", "2026-06-08T12:00:00Z"),
  story("st_013", "Privacy Policy", "legal/privacy", "page", "published", "Legal", "Legal Bot", "2026-05-30T10:00:00Z"),
  story("st_014", "Terms of Service", "legal/terms", "page", "published", "Legal", "Legal Bot", "2026-05-30T10:00:00Z"),
];

export const activity: ActivityEvent[] = [
  { id: "ev_1", actor: "Priya S.", action: "published", target: "Pricing", at: "2026-06-15T16:41:00Z", kind: "publish" },
  { id: "ev_2", actor: "Dharamraj N.", action: "edited", target: "About Us", at: "2026-06-16T08:05:00Z", kind: "edit" },
  { id: "ev_3", actor: "Workflow: Lead Router", action: "ran", target: "Contact form → CRM", at: "2026-06-16T08:02:00Z", kind: "workflow" },
  { id: "ev_4", actor: "Aria K.", action: "created", target: "Helix Standing Desk", at: "2026-06-16T06:50:00Z", kind: "create" },
  { id: "ev_5", actor: "Deploy", action: "shipped", target: "production · build #214", at: "2026-06-16T05:30:00Z", kind: "deploy" },
  { id: "ev_6", actor: "Marco D.", action: "published", target: "Nimbus Office Chair", at: "2026-06-09T09:46:00Z", kind: "publish" },
];
