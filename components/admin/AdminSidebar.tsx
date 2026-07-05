"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogo } from "@/components/admin/AdminLogo";
import { adminNavItems } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  logoSrc: string;
  mobileOpen?: boolean;
  onNavigate?: () => void;
};

export function AdminSidebar({
  logoSrc,
  mobileOpen = false,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-navy-800/7 bg-white transition-transform duration-200 lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="border-b border-navy-800/6 px-5 py-4">
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className="inline-flex min-h-16 items-center"
        >
          <AdminLogo compact src={logoSrc} />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Admin">
        <ul className="flex flex-col gap-4">
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
    </aside>
  );
}
