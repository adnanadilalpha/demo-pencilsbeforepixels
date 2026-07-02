"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { adminInputClass } from "@/components/admin/admin-styles";
import { ResourceCardGrid } from "@/components/admin/resources/ResourceCard";
import type { AdminLibraryItem } from "@/lib/admin/resources/types";
import { cn } from "@/lib/utils";

type LibraryItemsTabProps = {
  items: AdminLibraryItem[];
  emptyMessage: string;
  searchPlaceholder: string;
  onEdit: (item: AdminLibraryItem) => void;
  onDelete: (item: AdminLibraryItem) => void;
  onToggleVisible: (item: AdminLibraryItem, visible: boolean) => void;
};

export function LibraryItemsTab({
  items,
  emptyMessage,
  searchPlaceholder,
  onEdit,
  onDelete,
  onToggleVisible,
}: LibraryItemsTabProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <div className="pt-6">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-body-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          className={cn(adminInputClass, "h-10 pl-9")}
        />
      </div>

      <ResourceCardGrid
        items={filtered}
        emptyMessage={emptyMessage}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleVisible={onToggleVisible}
      />
    </div>
  );
}
