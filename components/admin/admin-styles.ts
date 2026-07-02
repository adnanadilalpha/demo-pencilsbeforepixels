import { modalInputClass } from "@/lib/modal/body-scroll-lock";
import { cn } from "@/lib/utils";

export const adminInputClass = cn(
  modalInputClass,
  "newsletter-input h-11 rounded-4xl px-3 py-2.5",
);

export const adminLabelClass = "text-sm text-navy-800/80";

export const adminCardClass = cn(
  "w-full rounded-lg border border-navy-800/15 bg-paper-50 p-6 shadow-lg sm:p-8 sm:px-10",
);
