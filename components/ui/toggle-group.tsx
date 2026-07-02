"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";

export const ToggleGroup = ToggleGroupPrimitive.Root;

export function ToggleGroupItem({
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-[13px] font-normal leading-control text-[#6b7280] transition-colors hover:text-navy-800 disabled:cursor-not-allowed disabled:opacity-50 data-[state=on]:bg-navy-500 data-[state=on]:font-semibold data-[state=on]:text-slate-50",
        className,
      )}
      {...props}
    />
  );
}
