"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { adminLabelClass } from "@/components/admin/admin-styles";
import { normalizeResearchLibraryCategories } from "@/lib/cms/research-library-content";
import type { LibraryCategory } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

type LibraryCategoriesOrderEditorProps = {
  value: unknown;
  onChange: (categories: LibraryCategory[]) => void;
};

export function LibraryCategoriesOrderEditor({
  value,
  onChange,
}: LibraryCategoriesOrderEditorProps) {
  const categories = normalizeResearchLibraryCategories(value);

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= categories.length) return;

    const next = [...categories];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    onChange(next);
  };

  return (
    <div className="mt-6 space-y-4 border-t border-navy-800/6 pt-4">
      <div>
        <p className={adminLabelClass}>Category order</p>
        <p className="mt-1 text-xs text-body-muted">
          Controls the Resources sidebar order on the live homepage. Move items
          up or down, then publish.
        </p>
      </div>

      <ol className="flex flex-col gap-2">
        {categories.map((category, index) => (
          <li
            key={category}
            className="flex items-center gap-3 rounded-[12px] border border-navy-800/10 bg-paper-50 px-3 py-2.5"
          >
            <span className="w-8 shrink-0 font-mono text-xs font-medium tabular-nums text-body-muted">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1 text-sm font-medium text-navy-800">
              {category}
            </span>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                aria-label={`Move ${category} up`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-[8px] border border-navy-800/10 bg-white text-navy-800 transition-colors",
                  index === 0
                    ? "cursor-not-allowed opacity-40"
                    : "hover:bg-navy-800/5",
                )}
              >
                <ChevronUp className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label={`Move ${category} down`}
                disabled={index === categories.length - 1}
                onClick={() => move(index, 1)}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-[8px] border border-navy-800/10 bg-white text-navy-800 transition-colors",
                  index === categories.length - 1
                    ? "cursor-not-allowed opacity-40"
                    : "hover:bg-navy-800/5",
                )}
              >
                <ChevronDown className="size-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
