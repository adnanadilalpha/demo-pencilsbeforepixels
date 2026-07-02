import type { NewsletterSubscriberStatus } from "@/lib/admin/newsletter/types";
import { cn } from "@/lib/utils";

type NewsletterStatusBadgeProps = {
  status: NewsletterSubscriberStatus;
};

export function NewsletterStatusBadge({ status }: NewsletterStatusBadgeProps) {
  const isActive = status === "active";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 font-mono text-[11px] font-medium leading-[16.5px]",
        isActive
          ? "bg-[#ecfdf5] text-[#007a55]"
          : "bg-[#eef1f7] text-[#5a6a8a]",
      )}
    >
      {status}
    </span>
  );
}
