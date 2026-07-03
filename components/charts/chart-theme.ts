/** Shared, accessible chart typography (12px mobile → 14px sm+). */

export const chartTickDark =
  "fill-navy-800 font-sans text-xs tabular-nums sm:text-sm";
export const chartTickMutedDark =
  "fill-navy-800/75 font-sans text-xs tabular-nums sm:text-sm";

export const chartTickLight =
  "fill-white/90 font-sans text-sm tabular-nums sm:text-base";

export const chartAxisLabelDark =
  "fill-navy-800 font-sans text-xs font-medium sm:text-sm";
export const chartAxisLabelMutedDark =
  "fill-navy-800/75 font-sans text-xs font-medium sm:text-sm";

export const chartAxisLabelLight =
  "fill-white/90 font-sans text-sm font-medium sm:text-base";

export const chartCategoryLabelDark =
  "fill-navy-800/75 font-sans text-[11px] sm:text-xs";

export const chartCategoryLabelCompactDark =
  "fill-navy-800/75 font-sans text-xs sm:text-sm";

export const chartTitleDark =
  "font-sans text-xs font-semibold uppercase tracking-[0.16em] text-navy-800/65 sm:text-sm";
export const chartTitleLight =
  "font-sans text-sm font-semibold uppercase tracking-[0.14em] text-white/85 sm:text-base";

export const chartLegendDark = "text-xs text-navy-800/75 sm:text-sm";
export const chartLegendLight = "text-sm text-white/80 sm:text-base";

export const chartCategoryLabelLight =
  "text-sm font-medium text-white/90 sm:text-base";

export const chartCaptionLight =
  "text-sm font-medium text-white/80 sm:text-base";

export const chartCaptionDark =
  "text-xs font-medium uppercase tracking-wide text-navy-800/65 sm:text-sm";
export const chartCaptionMutedDark =
  "text-xs uppercase tracking-wide text-navy-800/60 sm:text-sm";

export const chartTooltipTitle = "text-sm font-semibold leading-tight text-slate-50";
export const chartTooltipLabel = "text-xs leading-tight text-slate-50/70 sm:text-sm";
export const chartTooltipValue =
  "text-right text-xs font-medium leading-tight text-gold-accent sm:text-sm";

/** Extra room for larger axis labels in custom-SVG charts. */
export const CHART_ACADEMIC_PADDING = {
  top: 12,
  right: 16,
  bottom: 56,
  left: 52,
} as const;

export const CHART_BAR_PADDING = {
  top: 20,
  right: 16,
  bottom: 68,
  left: 52,
} as const;

export const CHART_RESEARCH_BAR_PADDING = {
  top: 36,
  right: 24,
  bottom: 88,
  left: 56,
} as const;

export const CHART_NAEP_PADDING = {
  top: 16,
  right: 24,
  bottom: 48,
  left: 52,
} as const;

/** Plot area height for the Evidence research tab (title sits outside this box). */
export const RESEARCH_CHART_PLOT_HEIGHT =
  "h-[280px] min-h-[280px] md:h-[340px] md:min-h-[340px] lg:h-[420px] lg:min-h-[420px]";

/**
 * Research tab typography — compact on mobile/tablet; `lg:` matches desktop chart scale.
 * Use only in evidence/research components (not academic charts).
 */
export const researchBodyText =
  "text-sm leading-[1.45] text-[#6b7280] md:text-base lg:text-[17px] lg:leading-[1.55]";
export const researchBodyTextItalic =
  "text-sm italic leading-relaxed text-[#6b7280] md:text-base lg:text-[17px] lg:leading-[1.55]";
export const researchChartTickDark =
  "fill-navy-800 font-sans text-[10px] tabular-nums md:text-[11px] lg:text-sm";
export const researchChartTickMutedDark =
  "fill-navy-800/75 font-sans text-[10px] tabular-nums md:text-[11px] lg:text-sm";
export const researchChartAxisLabelDark =
  "fill-navy-800 font-sans text-[10px] font-medium md:text-[11px] lg:text-sm";
export const researchChartAxisLabelMutedDark =
  "fill-navy-800/75 font-sans text-[10px] font-medium md:text-[11px] lg:text-sm";
export const researchChartCategoryLabelDark =
  "fill-navy-800/75 font-sans text-[9px] md:text-[10px] lg:text-xs";
export const researchChartCategoryLabelCompactDark =
  "fill-navy-800/75 font-sans text-[9px] md:text-[10px] lg:text-xs";
export const researchChartTitleDark =
  "font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-800/65 md:text-[11px] lg:text-sm";
export const researchChartCaptionDark =
  "text-[10px] font-medium uppercase tracking-wide text-navy-800/65 md:text-[11px] lg:text-sm";
export const researchChartCaptionMutedDark =
  "text-[10px] uppercase tracking-wide text-navy-800/60 md:text-[11px] lg:text-sm";
export const researchChartLegendDark =
  "text-[10px] text-navy-800/75 md:text-[11px] lg:text-[17px] lg:leading-snug";
