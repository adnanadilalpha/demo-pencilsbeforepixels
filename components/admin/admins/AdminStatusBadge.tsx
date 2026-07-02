import type { AdminMemberStatus } from "@/lib/admin/admins/types";
import { cn } from "@/lib/utils";

type AdminStatusBadgeProps = {
  status: AdminMemberStatus;
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 font-mono text-[11px] font-medium leading-[16.5px] capitalize",
        status === "owner" && "bg-[#fffbeb] text-[#bb4d00]",
        status === "active" && "bg-[#ecfdf5] text-[#007a55]",
        status === "pending" && "bg-[#eef1f7] text-[#5a6a8a]",
      )}
    >
      {status === "owner" ? "Owner" : status}
    </span>
  );
}
