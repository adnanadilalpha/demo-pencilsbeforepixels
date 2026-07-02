"use client";

import type { EditorSection } from "@/lib/admin/content-config";
import { cn } from "@/lib/utils";

type SectionNavProps = {
  sections: EditorSection[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function SectionNav({ sections, activeId, onSelect }: SectionNavProps) {
  return (
    <aside className="shrink-0 border-navy-800/8 bg-paper-50 max-md:border-b md:w-44 md:self-stretch md:overflow-y-auto md:border-r">
      <div className="p-3 max-md:py-2">
        <p className="px-3 pb-2 pt-2 font-mono text-[10px] font-medium uppercase tracking-widest text-body-muted max-md:px-1 max-md:pb-1.5 max-md:pt-0">
          Sections
        </p>
        <nav className="flex flex-col gap-0.5 max-md:-mx-1 max-md:flex-row max-md:gap-1 max-md:overflow-x-auto max-md:pb-1 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
          {sections.map((section) => {
            const active = section.id === activeId;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelect(section.id)}
                className={cn(
                  "rounded-[10px] px-3 py-2 text-left text-sm font-medium transition-colors max-md:shrink-0 max-md:whitespace-nowrap",
                  active
                    ? "bg-gold-500/20 font-semibold text-navy-800"
                    : "text-body-muted hover:bg-white hover:text-navy-800",
                )}
              >
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
