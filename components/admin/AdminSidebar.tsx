"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AdminLogo } from "@/components/admin/AdminLogo";
import { adminNavItems } from "@/lib/admin/navigation";
import type { AdminUserSummary } from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  user: AdminUserSummary;
  mobileOpen?: boolean;
  onNavigate?: () => void;
};

export function AdminSidebar({
  user,
  mobileOpen = false,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin");
    router.refresh();
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-navy-800/7 bg-white transition-transform duration-200 lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="border-b border-navy-800/6 px-3 py-3">
        <Link href="/admin/dashboard" onClick={onNavigate} className="inline-flex">
          <AdminLogo compact />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Admin">
        <ul className="flex flex-col gap-0.5">
          {adminNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-full px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gold-500 text-white"
                      : "text-body-muted hover:bg-paper-200/60 hover:text-navy-800",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-navy-800/6 p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-navy-800">{user.name}</p>
            <p className="truncate text-xs text-body-muted">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg p-1.5 text-body-muted transition-colors hover:bg-paper-200 hover:text-navy-800"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
