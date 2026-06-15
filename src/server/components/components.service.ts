// Component (block) registry — the schema catalog the visual builder uses.
// In the full product these are user-definable + AI-generated ("Infinite Components").

import type { ComponentDef } from "@/lib/types";

const REGISTRY: ComponentDef[] = [
  {
    name: "hero",
    label: "Hero",
    icon: "Sparkles",
    category: "content",
    fields: [
      { key: "headline", label: "Headline", type: "text", default: "Your headline" },
      { key: "subline", label: "Subline", type: "textarea", default: "A short supporting sentence." },
      { key: "align", label: "Alignment", type: "select", options: ["left", "center"], default: "left" },
      { key: "background", label: "Background", type: "color", default: "#121212" },
    ],
  },
  {
    name: "heading",
    label: "Heading",
    icon: "Heading",
    category: "content",
    fields: [
      { key: "text", label: "Text", type: "text", default: "Section heading" },
      { key: "level", label: "Level", type: "select", options: ["h1", "h2", "h3"], default: "h2" },
    ],
  },
  {
    name: "text",
    label: "Text",
    icon: "Type",
    category: "content",
    fields: [{ key: "body", label: "Body", type: "textarea", default: "Write something meaningful here." }],
  },
  {
    name: "feature_grid",
    label: "Feature Grid",
    icon: "LayoutGrid",
    category: "layout",
    allowChildren: true,
    fields: [
      { key: "columns", label: "Columns", type: "number", default: 3 },
      { key: "title", label: "Title", type: "text", default: "Features" },
    ],
  },
  {
    name: "button",
    label: "Button",
    icon: "MousePointerClick",
    category: "action",
    fields: [
      { key: "label", label: "Label", type: "text", default: "Get started" },
      { key: "href", label: "Link", type: "text", default: "#" },
      { key: "variant", label: "Variant", type: "select", options: ["primary", "secondary"], default: "primary" },
    ],
  },
  {
    name: "image",
    label: "Image",
    icon: "Image",
    category: "media",
    fields: [
      { key: "alt", label: "Alt text", type: "text", default: "Image" },
      { key: "ratio", label: "Aspect ratio", type: "select", options: ["16:9", "4:3", "1:1"], default: "16:9" },
    ],
  },
  {
    name: "product_card",
    label: "Product Card",
    icon: "ShoppingBag",
    category: "commerce",
    fields: [
      { key: "title", label: "Title", type: "text", default: "Product name" },
      { key: "price", label: "Price", type: "text", default: "$0.00" },
      { key: "badge", label: "Badge", type: "text", default: "" },
    ],
  },
  {
    name: "container",
    label: "Container",
    icon: "Square",
    category: "layout",
    allowChildren: true,
    fields: [
      { key: "padding", label: "Padding", type: "select", options: ["sm", "md", "lg"], default: "md" },
      { key: "background", label: "Background", type: "color", default: "#0a0a0a" },
    ],
  },
];

export class ComponentsService {
  list(): ComponentDef[] {
    return REGISTRY;
  }

  get(name: string): ComponentDef | undefined {
    return REGISTRY.find((c) => c.name === name);
  }

  /** default props for a freshly added block */
  defaults(name: string): Record<string, unknown> {
    const def = this.get(name);
    if (!def) return {};
    return Object.fromEntries(def.fields.map((f) => [f.key, f.default ?? ""]));
  }
}

export const componentsService = new ComponentsService();
