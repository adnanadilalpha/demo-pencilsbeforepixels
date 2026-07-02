"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, Search } from "lucide-react";
import type { AdminUserSummary } from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/client";

type AdminHeaderProps = {
  user: AdminUserSummary;
  onMenuClick?: () => void;
  onOpenSearch?: () => void;
};

export function AdminHeader({
  user,
  onMenuClick,
  onOpenSearch,
}: AdminHeaderProps) {
  const router = useRouter();

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin");
    router.refresh();
  }

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

          <button
            type="button"
            onClick={onOpenSearch}
            className="flex max-w-sm flex-1 items-center gap-2 rounded-[10px] border border-navy-800/8 bg-paper-50 px-3 py-2 text-left transition-colors hover:border-navy-800/15 hover:bg-paper-200/60"
          >
            <Search className="size-3.5 shrink-0 text-body-muted" aria-hidden />
            <span className="text-sm font-medium text-body-muted">Search…</span>
            <span className="ml-auto hidden font-mono text-[10px] text-body-muted sm:inline">
              ⌘K
            </span>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2.5 sm:flex">
            <div className="flex size-8 items-center justify-center rounded-full bg-navy-800 text-xs font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-navy-800">
                {user.name}
              </p>
              <p className="truncate text-xs text-body-muted">{user.role}</p>
            </div>
          </div>

          <p className="truncate text-sm font-medium text-navy-800 sm:hidden">
            {user.name}
          </p>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-navy-800/10 bg-paper-50 px-2.5 py-2 text-xs font-medium text-navy-800 transition-colors hover:bg-paper-200 sm:px-3 sm:text-sm"
          >
            <LogOut className="size-3.5 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
