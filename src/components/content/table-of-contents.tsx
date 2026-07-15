"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "./types";

interface TableOfContentsProps {
  items: TocItem[];
}

/**
 * Sommaire ancré « Sur cette fiche » avec section active (scrollspy).
 * Client léger : un IntersectionObserver, aucun re-render du contenu.
 */
export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string | undefined>(items[0]?.id);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );
    for (const item of items) {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    }
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Sur cette fiche" className="space-y-2">
      <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
        Sur cette fiche
      </p>
      <ul className="space-y-1 border-l">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={activeId === item.id ? "true" : undefined}
              className={cn(
                "-ml-px block border-l-2 py-1 pl-3 text-sm transition-colors",
                activeId === item.id
                  ? "border-primary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
