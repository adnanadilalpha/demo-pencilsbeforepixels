import type { OptOutSubmissionStatus } from "@/lib/admin/opt-out/types";
import { cn } from "@/lib/utils";

type OptOutStatusBadgeProps = {
  status: OptOutSubmissionStatus;
};

export function OptOutStatusBadge({ status }: OptOutStatusBadgeProps) {
  const isDownloaded = status === "downloaded";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 font-mono text-[11px] font-medium leading-[16.5px]",
        isDownloaded
          ? "bg-[#eff6ff] text-[#1447e6]"
          : "bg-[#eef1f7] text-[#5a6a8a]",
      )}
    >
      {status}
    </span>
  );
}
