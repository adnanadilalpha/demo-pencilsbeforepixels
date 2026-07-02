"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  buildAdminSearchIndex,
  filterAdminSearchEntries,
  type AdminSearchEntry,
} from "@/lib/admin/search-index";
import { cn } from "@/lib/utils";

type AdminSearchDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminSearchDialog({ open, onClose }: AdminSearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const entries = useMemo(() => buildAdminSearchIndex(), []);
  const results = useMemo(
    () => filterAdminSearchEntries(entries, query),
    [entries, query],
  );

  useEffect(() => {
    if (!open) return;

    setQuery("");
    setActiveIndex(0);
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const navigateTo = useCallback(
    (entry: AdminSearchEntry) => {
      onClose();
      router.push(entry.href);
    },
    [onClose, router],
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (results.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % results.length);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((current) =>
          current === 0 ? results.length - 1 : current - 1,
        );
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const target = results[activeIndex];
        if (target) navigateTo(target);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, results, activeIndex, onClose, navigateTo]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-navy-800/30"
        aria-label="Close search"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search admin"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[14px] border border-navy-800/10 bg-white shadow-xl"
      >
        <div className="flex items-center gap-2 border-b border-navy-800/8 px-4 py-3">
          <Search className="size-4 shrink-0 text-body-muted" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages and content…"
            className="min-w-0 flex-1 bg-transparent text-sm text-navy-800 outline-none placeholder:text-navy-800/45"
          />
          <kbd className="hidden rounded border border-navy-800/10 bg-paper-50 px-1.5 py-0.5 font-mono text-[10px] text-body-muted sm:inline">
            esc
          </kbd>
        </div>

        <ul className="max-h-[min(24rem,50vh)] overflow-y-auto py-2">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-body-muted">
              No results for &ldquo;{query.trim()}&rdquo;
            </li>
          ) : (
            results.map((entry, index) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => navigateTo(entry)}
                  className={cn(
                    "flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition-colors",
                    index === activeIndex
                      ? "bg-paper-200/70"
                      : "hover:bg-paper-50",
                  )}
                >
                  <span className="text-sm font-medium text-navy-800">
                    {entry.label}
                  </span>
                  <span className="text-xs text-body-muted">
                    {entry.description}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
