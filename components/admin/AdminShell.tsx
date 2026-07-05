"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSearchDialog } from "@/components/admin/AdminSearchDialog";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import type { AdminUserSummary } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  user: AdminUserSummary;
  logoSrc: string;
  children: React.ReactNode;
};

export function AdminShell({ user, logoSrc, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-dvh bg-paper-50">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-navy-800/30 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <AdminSidebar
        logoSrc={logoSrc}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="lg:pl-56">
        <AdminHeader
          user={user}
          onMenuClick={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <main className={cn("px-6 py-6")}>{children}</main>
      </div>

      <AdminSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}
