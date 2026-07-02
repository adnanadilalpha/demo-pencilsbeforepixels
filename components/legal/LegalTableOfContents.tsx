"use client";

import { useEffect, useState } from "react";
import type { LegalTocItem } from "@/lib/legal/constants";
import { cn } from "@/lib/utils";

type LegalTableOfContentsProps = {
  items: LegalTocItem[];
};

export function LegalTableOfContents({ items }: LegalTableOfContentsProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sectionElements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: 0,
      },
    );

    for (const element of sectionElements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    event.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  return (
    <>
      <nav
        aria-label="Table of contents"
        className="lg:hidden"
      >
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-gold-500">
          On this page
        </p>
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(event) => handleClick(event, item.id)}
                className={cn(
                  "inline-flex rounded-full border px-3 py-1.5 text-sm leading-none transition-colors",
                  activeId === item.id
                    ? "border-gold-500/30 bg-gold-50 text-navy-800"
                    : "border-paper-300 bg-paper-50 text-body-muted hover:border-navy-400/20 hover:text-navy-800",
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <nav
        aria-label="Table of contents"
        className="hidden lg:block"
      >
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-gold-500">
          On this page
        </p>
        <ul className="flex flex-col gap-1 border-l border-paper-300">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(event) => handleClick(event, item.id)}
                className={cn(
                  "block border-l-2 py-2 pl-4 text-sm leading-snug transition-colors",
                  activeId === item.id
                    ? "border-gold-500 font-medium text-navy-800"
                    : "-ml-px border-transparent text-body-muted hover:border-navy-400/30 hover:text-navy-800",
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
