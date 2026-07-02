import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export function chartPdfDownloadLabel(chartTitle: string): string {
  let name = chartTitle.replace(/\s*\([^)]*\)/g, "").trim();

  if (name.length <= 12 && name === name.toUpperCase()) {
    name = name
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return name ? `Download ${name} PDF` : "Download PDF";
}

type ResearchPdfLinkProps = {
  url?: string | null;
  label?: string;
  chartTitle?: string;
  className?: string;
};

export function ResearchPdfLink({
  url,
  label,
  chartTitle,
  className,
}: ResearchPdfLinkProps) {
  if (!url?.trim()) return null;

  const text =
    label ?? (chartTitle ? chartPdfDownloadLabel(chartTitle) : "Download PDF");

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium leading-single text-navy-800 transition-opacity hover:opacity-70",
        className,
      )}
    >
      <Download className="size-4 shrink-0" strokeWidth={1} aria-hidden />
      {text}
    </a>
  );
}

type ResearchChartPdfFooterProps = {
  url?: string | null;
  chartTitle: string;
  className?: string;
};

export function ResearchChartPdfFooter({
  url,
  chartTitle,
  className,
}: ResearchChartPdfFooterProps) {
  if (!url?.trim()) return null;

  return (
    <div
      className={cn(
        "mt-4 flex justify-center border-t border-navy-800/8 pt-4",
        className,
      )}
    >
      <ResearchPdfLink url={url} chartTitle={chartTitle} />
    </div>
  );
}
