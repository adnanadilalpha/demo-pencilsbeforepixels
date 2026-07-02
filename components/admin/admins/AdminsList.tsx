import {
  formatLastActive,
  formatRoleLabel,
  getAdminAvatarClass,
  getAdminInitials,
} from "@/lib/admin/admins/format";
import type { AdminMember } from "@/lib/admin/admins/types";
import { AdminStatusBadge } from "@/components/admin/admins/AdminStatusBadge";
import { cn } from "@/lib/utils";

type AdminsListProps = {
  admins: AdminMember[];
  busyId?: string | null;
  emptyMessage?: string;
  onDelete?: (admin: AdminMember) => void;
};

export function AdminsList({
  admins,
  busyId = null,
  emptyMessage = "No admins yet.",
  onDelete,
}: AdminsListProps) {
  if (!admins.length) {
    return (
      <div className="overflow-hidden rounded-[14px] border border-navy-800/8 bg-white px-6 py-14 text-center text-sm text-body-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-navy-800/8 bg-white">
      {admins.map((admin, index) => {
        const isBusy = busyId === admin.id;

        return (
        <div
          key={admin.id}
          className={cn(
            "flex items-center gap-4 px-5 py-4",
            index > 0 && "border-t border-navy-800/5",
          )}
        >
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
              getAdminAvatarClass(admin.role),
            )}
          >
            {getAdminInitials(admin.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-navy-800">{admin.name}</p>
              <AdminStatusBadge status={admin.status} />
            </div>
            <p className="truncate text-xs text-body-muted">{admin.email}</p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs font-medium text-navy-800">
              {formatRoleLabel(admin.role)}
            </p>
            <p className="font-mono text-[11px] text-[#b0bccc]">
              {formatLastActive(admin.lastLoginAt)}
            </p>
          </div>

          {admin.canDelete && onDelete ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onDelete(admin)}
              className="shrink-0 text-xs font-medium text-red-600/80 transition-colors hover:text-red-600 disabled:opacity-50"
            >
              Delete
            </button>
          ) : null}
        </div>
        );
      })}
    </div>
  );
}
