import type { ReactNode } from "react";
import { contentMaxWidthClass, sectionPaddingX } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type ResearchChartSectionProps = {
  showDivider?: boolean;
  noTopPadding?: boolean;
  children: ReactNode;
  className?: string;
};

export function ResearchChartSection({
  showDivider = true,
  noTopPadding = false,
  children,
  className,
}: ResearchChartSectionProps) {
  return (
    <section
      className={cn(showDivider && "border-t border-navy-800/14", className)}
    >
      <div
        className={cn(
          sectionPaddingX,
          noTopPadding
            ? "pb-14 pt-0 sm:pb-16 lg:pb-20"
            : "py-14 sm:py-16 lg:py-20",
        )}
      >
        <div className={cn(contentMaxWidthClass, "mx-auto")}>{children}</div>
      </div>
    </section>
  );
}

export function ResearchChartCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-navy-800/8 bg-white p-4 md:p-6 lg:p-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
