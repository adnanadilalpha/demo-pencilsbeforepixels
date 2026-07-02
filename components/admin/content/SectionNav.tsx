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
    <aside className="w-44 shrink-0 self-stretch overflow-y-auto border-r border-navy-800/8 bg-paper-50">
      <div className="p-3">
        <p className="px-3 pb-2 pt-2 font-mono text-[10px] font-medium uppercase tracking-widest text-body-muted">
          Sections
        </p>
        <nav className="flex flex-col gap-0.5">
          {sections.map((section) => {
            const active = section.id === activeId;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelect(section.id)}
                className={cn(
                  "rounded-[10px] px-3 py-2 text-left text-sm font-medium transition-colors",
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
