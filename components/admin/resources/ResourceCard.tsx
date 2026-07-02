"use client";

import { Trash2 } from "lucide-react";
import { LibraryDocumentPreview } from "@/components/sections/LibraryDocumentPreview";
import { ToggleField } from "@/components/admin/content/ToggleField";
import type { AdminLibraryItem } from "@/lib/admin/resources/types";

type ResourceCardProps = {
  item: AdminLibraryItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisible: (visible: boolean) => void;
};

function ItemThumbnail({ item }: { item: AdminLibraryItem }) {
  if (item.fileUrl) {
    return (
      <LibraryDocumentPreview
        fileKind={item.fileKind}
        fileName={item.fileName}
        compact
        className="h-full"
      />
    );
  }

  return (
    <LibraryDocumentPreview
      fileKind={item.kind === "paper" ? "document" : "other"}
      compact
      className="h-full opacity-80"
    />
  );
}

export function ResourceCard({
  item,
  onEdit,
  onDelete,
  onToggleVisible,
}: ResourceCardProps) {
  return (
    <article className="overflow-hidden rounded-[14px] border border-navy-800/8 bg-white shadow-sm">
      <button
        type="button"
        onClick={onEdit}
        className="relative block h-36 w-full bg-[#18263a]"
      >
        <ItemThumbnail item={item} />
      </button>

      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-body-muted">
            {item.subtitle}
          </p>
          <button
            type="button"
            onClick={onEdit}
            className="mt-1 text-left text-sm font-semibold leading-snug text-navy-800"
          >
            {item.title}
          </button>
          {item.fileName ? (
            <p className="mt-1 truncate text-xs text-body-muted">{item.fileName}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-navy-800/6 pt-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="text-xs font-medium text-navy-800/70 transition-colors hover:text-navy-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1 text-xs font-medium text-red-600/80 transition-colors hover:text-red-600"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          </div>
        </div>

        <ToggleField
          label="Visible on site"
          checked={item.visible}
          onChange={onToggleVisible}
        />
      </div>
    </article>
  );
}

export function ResourceCardGrid({
  items,
  emptyMessage,
  onEdit,
  onDelete,
  onToggleVisible,
}: {
  items: AdminLibraryItem[];
  emptyMessage: string;
  onEdit: (item: AdminLibraryItem) => void;
  onDelete: (item: AdminLibraryItem) => void;
  onToggleVisible: (item: AdminLibraryItem, visible: boolean) => void;
}) {
  if (!items.length) {
    return (
      <p className="pt-6 text-sm text-body-muted">{emptyMessage}</p>
    );
  }

  return (
    <div className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <ResourceCard
          key={item.id}
          item={item}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
          onToggleVisible={(visible) => onToggleVisible(item, visible)}
        />
      ))}
    </div>
  );
}
