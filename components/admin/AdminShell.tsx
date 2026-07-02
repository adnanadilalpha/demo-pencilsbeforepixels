"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import type { AdminUserSummary } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  user: AdminUserSummary;
  children: React.ReactNode;
};

export function AdminShell({ user, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
        user={user}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="lg:pl-56">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />
        <main className={cn("px-6 py-6")}>{children}</main>
      </div>
    </div>
  );
}
