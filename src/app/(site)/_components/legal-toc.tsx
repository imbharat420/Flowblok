"use client";

import { useEffect, useState } from "react";

// Sticky table of contents that tracks the section in view and smooth-scrolls.
export function LegalToc({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className="sticky top-28 hidden max-h-[70vh] overflow-y-auto lg:block">
      <p className="kicker mb-4">On this page</p>
      <ul className="space-y-1 border-l border-[var(--line)]">
        {items.map((it) => {
          const on = active === it.id;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                className="-ml-px block border-l-2 py-1.5 pl-4 text-[13px] transition-colors"
                style={{
                  borderColor: on ? "var(--a2)" : "transparent",
                  color: on ? "var(--ink)" : "var(--ink-faint)",
                }}
              >
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
