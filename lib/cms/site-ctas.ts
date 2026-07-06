export const RESEARCH_PAGE_CTA = {
  label: "View research page",
  href: "/research",
} as const;

const LEGACY_RESEARCH_CTA_LABEL =
  /explore\s+(the\s+)?(full\s+)?(research|evidence)|explore\s+nebraska/i;

/** Maps old homepage CTA copy to the current Research / Nebraska routes. */
export function resolveResearchPageCta(
  cta: { label?: string; href?: string } | null | undefined,
): { label: string; href: string } {
  const label = typeof cta?.label === "string" ? cta.label.trim() : "";
  const href = typeof cta?.href === "string" ? cta.href.trim() : "";

  if (
    !label ||
    LEGACY_RESEARCH_CTA_LABEL.test(label) ||
    href === "/nebraska-data" ||
    href === "/evidence" ||
    href === ""
  ) {
    return { ...RESEARCH_PAGE_CTA };
  }

  return {
    label,
    href: href || RESEARCH_PAGE_CTA.href,
  };
}

export function sanitizeMentalHealthForPublish(
  content: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...content };
  delete next.label;
  delete next.points;

  const cta =
    typeof next.cta === "object" && next.cta !== null
      ? (next.cta as { label?: string; href?: string })
      : undefined;

  next.cta = resolveResearchPageCta(cta);

  return next;
}
