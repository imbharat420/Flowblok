"use client";

import { cn } from "@/lib/cn";
import type { BlockNode } from "@/lib/types";
import { type Path, pathEq } from "@/lib/blocks";

function s(props: Record<string, unknown>, key: string, fallback = ""): string {
  const v = props[key];
  return typeof v === "string" ? v : v == null ? fallback : String(v);
}

export function BlockRenderer({
  node,
  path,
  selected,
  onSelect,
}: {
  node: BlockNode;
  path: Path;
  selected: Path | null;
  onSelect: (p: Path) => void;
}) {
  const isSelected = pathEq(selected, path);

  const wrap = (children: React.ReactNode) => (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(path);
      }}
      className={cn(
        "group relative cursor-pointer rounded-md transition-shadow",
        isSelected ? "shadow-[0_0_0_2px_var(--accent)]" : "hover:shadow-[0_0_0_1px_var(--border-strong)]",
      )}
    >
      {isSelected && (
        <span className="absolute -top-5 left-0 z-10 rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-fg">
          {node.component}
        </span>
      )}
      {children}
    </div>
  );

  const kids = (node.children ?? []).map((c, i) => (
    <BlockRenderer key={i} node={c} path={[...path, i]} selected={selected} onSelect={onSelect} />
  ));

  switch (node.component) {
    case "hero":
      return wrap(
        <div
          className={cn("rounded-md px-8 py-14", s(node.props, "align") === "center" && "text-center")}
          style={{ background: s(node.props, "background", "#121212") }}
        >
          <h1 className="text-3xl font-semibold tracking-tight text-fg">
            {s(node.props, "headline", "Headline")}
          </h1>
          <p className="mt-2 max-w-xl text-[15px] text-fg-muted">{s(node.props, "subline")}</p>
        </div>,
      );

    case "heading": {
      const level = s(node.props, "level", "h2");
      const size = level === "h1" ? "text-3xl" : level === "h3" ? "text-lg" : "text-2xl";
      return wrap(<div className={cn("px-2 py-1 font-semibold text-fg", size)}>{s(node.props, "text", "Heading")}</div>);
    }

    case "text":
      return wrap(<p className="px-2 py-1 text-[14px] leading-relaxed text-fg-muted">{s(node.props, "body")}</p>);

    case "feature_grid": {
      const cols = Number(node.props.columns) || 3;
      return wrap(
        <div className="rounded-md border border-dashed border-border p-4">
          <p className="label-caps mb-3">{s(node.props, "title", "Features")}</p>
          {kids.length > 0 ? (
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
              {kids}
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
              {Array.from({ length: cols }).map((_, i) => (
                <div key={i} className="rounded-md border border-border bg-surface p-4 text-center text-[12px] text-fg-subtle">
                  Feature {i + 1}
                </div>
              ))}
            </div>
          )}
        </div>,
      );
    }

    case "button":
      return wrap(
        <div className="px-2 py-1">
          <span
            className={cn(
              "inline-flex rounded-md px-3.5 py-1.5 text-[13px] font-medium",
              s(node.props, "variant", "primary") === "primary"
                ? "bg-accent text-accent-fg"
                : "border border-border bg-surface text-fg",
            )}
          >
            {s(node.props, "label", "Button")}
          </span>
        </div>,
      );

    case "image": {
      const ratio = s(node.props, "ratio", "16:9").replace(":", "/");
      return wrap(
        <div className="grid place-items-center rounded-md border border-border bg-surface text-fg-subtle" style={{ aspectRatio: ratio }}>
          <span className="text-[12px]">{s(node.props, "alt", "Image")} · {s(node.props, "ratio", "16:9")}</span>
        </div>,
      );
    }

    case "product_card":
      return wrap(
        <div className="w-48 rounded-md border border-border bg-surface p-3">
          <div className="mb-2 aspect-square rounded bg-surface-2" />
          {s(node.props, "badge") && (
            <span className="mb-1 inline-block rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
              {s(node.props, "badge")}
            </span>
          )}
          <p className="text-[13px] font-medium text-fg">{s(node.props, "title", "Product")}</p>
          <p className="nums text-[13px] text-fg-muted">{s(node.props, "price", "$0.00")}</p>
        </div>,
      );

    case "container":
      return wrap(
        <div
          className={cn(
            "rounded-md border border-dashed border-border",
            s(node.props, "padding", "md") === "lg" ? "p-8" : s(node.props, "padding") === "sm" ? "p-3" : "p-5",
          )}
          style={{ background: s(node.props, "background", "transparent") }}
        >
          {kids.length ? <div className="space-y-3">{kids}</div> : <p className="text-center text-[12px] text-fg-subtle">Empty container</p>}
        </div>,
      );

    default:
      // root "page" or unknown → render children stacked
      return (
        <div className="space-y-4">
          {kids.length ? kids : <p className="py-10 text-center text-[13px] text-fg-subtle">Empty page — add a block from the left.</p>}
        </div>
      );
  }
}
