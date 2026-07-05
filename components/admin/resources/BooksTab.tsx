"use client";

import { Plus, Trash2 } from "lucide-react";
import { ToggleField } from "@/components/admin/content/ToggleField";
import type { AdminBook } from "@/lib/admin/resources/types";
import { cn } from "@/lib/utils";

type BooksTabProps = {
  items: AdminBook[];
  onAdd: () => void;
  onEdit: (item: AdminBook) => void;
  onDelete: (item: AdminBook) => void;
  onToggleVisible: (item: AdminBook, visible: boolean) => void;
};

function BookCoverPreview({ book }: { book: AdminBook }) {
  if (!book.coverUrl) {
    return (
      <div className="flex size-full items-center justify-center text-sm text-white/60">
        No cover
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={book.coverUrl}
      alt={book.title}
      className="absolute inset-0 size-full object-cover object-center"
    />
  );
}

export function BooksTab({
  items,
  onAdd,
  onEdit,
  onDelete,
  onToggleVisible,
}: BooksTabProps) {
  return (
    <div className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((book) => (
        <article
          key={book.id}
          className="overflow-hidden rounded-[14px] border border-navy-800/8 bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => onEdit(book)}
            className="relative block h-36 w-full bg-[#18263a]"
          >
            <BookCoverPreview book={book} />
          </button>

          <div className="space-y-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-body-muted">
                {book.author}
              </p>
              <button
                type="button"
                onClick={() => onEdit(book)}
                className="mt-1 text-left text-sm font-semibold leading-snug text-navy-800"
              >
                {book.title}
              </button>
            </div>

            <div className="flex items-center gap-2 border-t border-navy-800/6 pt-3">
              <button
                type="button"
                onClick={() => onEdit(book)}
                className="text-xs font-medium text-navy-800/70 transition-colors hover:text-navy-800"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(book)}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-600/80 transition-colors hover:text-red-600"
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            </div>

            <ToggleField
              label="Visible on site"
              checked={book.visible}
              onChange={(visible) => onToggleVisible(book, visible)}
            />
          </div>
        </article>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className={cn(
          "flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-navy-800/15 bg-paper-50/50 text-sm font-medium text-body-muted transition-colors hover:border-navy-800/25 hover:bg-white hover:text-navy-800",
        )}
      >
        <Plus className="size-5" />
        Add book
      </button>
    </div>
  );
}
