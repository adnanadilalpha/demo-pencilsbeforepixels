"use client";

import { useMemo, useState } from "react";
import type { EditableLibraryItem } from "@/lib/admin/cms-entity-types";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { libraryCategories } from "@/lib/cms/fallback-data";
import type { LibraryCategory } from "@/lib/cms/types";
import { MediaField } from "@/components/admin/content/MediaField";
import { cn } from "@/lib/utils";

type LibraryItemsEditorProps = {
  items: EditableLibraryItem[];
  onChange: (items: EditableLibraryItem[]) => void;
};

const KIND_LABELS: Record<EditableLibraryItem["kind"], string> = {
  book: "Book",
  paper: "PDF article",
  video: "Video",
  resource: "Resource",
};

export function LibraryItemsEditor({
  items,
  onChange,
}: LibraryItemsEditorProps) {
  const activeCategories = libraryCategories;
  const [activeCategory, setActiveCategory] = useState<LibraryCategory>(
    activeCategories[0] ?? "Books",
  );

  const categoryItems = useMemo(
    () => items.filter((item) => item.category === activeCategory),
    [activeCategory, items],
  );

  const updateItem = (itemId: string | undefined, patch: Partial<EditableLibraryItem>) => {
    onChange(
      items.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    );
  };

  return (
    <div className="mt-6 space-y-4 border-t border-navy-800/6 pt-4">
      <div>
        <p className="text-sm font-semibold text-navy-800">Library items</p>
        <p className="mt-1 text-xs text-body-muted">
          Resource cards shown in each category on the homepage.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-[12px] border border-navy-800/10 bg-paper-50 p-2">
        {activeCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              activeCategory === category
                ? "bg-navy-800 text-white"
                : "text-body-muted hover:bg-white hover:text-navy-800",
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {categoryItems.length === 0 ? (
          <p className="text-sm text-body-muted">No items in this category.</p>
        ) : (
          categoryItems.map((item, index) => (
            <div
              key={item.id ?? `${item.category}-${item.title}-${index}`}
              className="space-y-4 rounded-[12px] border border-navy-800/10 bg-paper-50 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-body-muted">
                {KIND_LABELS[item.kind]}
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <Field
                    label="Title"
                    value={item.title}
                    onChange={(value) => updateItem(item.id, { title: value })}
                  />
                  <Field
                    label="Subtitle"
                    value={item.subtitle}
                    onChange={(value) => updateItem(item.id, { subtitle: value })}
                  />
                  {item.kind === "book" ? (
                    <Field
                      label="View link"
                      value={item.viewUrl ?? ""}
                      onChange={(value) => updateItem(item.id, { viewUrl: value })}
                      placeholder="https://..."
                      hint="Opens in a new tab from the View button on the homepage."
                    />
                  ) : null}
                </div>
                {item.kind === "book" || item.kind === "resource" ? (
                  <MediaField
                    label="Cover image"
                    value={item.image}
                    folder="library"
                    filename={`${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "item"}.jpg`}
                    altText={item.title}
                    variant="bookCover"
                    onChange={(url) => updateItem(item.id, { image: url })}
                  />
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={adminLabelClass}>{label}</label>
      {hint ? <p className="text-xs text-body-muted">{hint}</p> : null}
      <input
        className={adminInputClass}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
