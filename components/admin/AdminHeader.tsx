"use client";

import { Bell, Menu, Search } from "lucide-react";

type AdminHeaderProps = {
  onMenuClick?: () => void;
};

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-navy-800/7 bg-white px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-navy-800 hover:bg-paper-200 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>

          <div className="flex max-w-sm flex-1 items-center gap-2 rounded-[10px] border border-navy-800/8 bg-paper-50 px-3 py-2">
            <Search className="size-3.5 shrink-0 text-body-muted" aria-hidden />
            <span className="text-sm font-medium text-body-muted">Search…</span>
            <span className="ml-auto hidden font-mono text-[10px] text-body-muted sm:inline">
              ⌘K
            </span>
          </div>
        </div>

        <button
          type="button"
          className="relative rounded-[10px] border border-navy-800/10 bg-paper-50 p-2 text-navy-700 transition-colors hover:bg-paper-200 hover:text-navy-800"
          aria-label="Notifications"
        >
          <Bell className="size-5 stroke-[2.25]" />
          <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full border border-white bg-gold-500" />
        </button>
      </div>
    </header>
  );
}
