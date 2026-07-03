/** Desktop research layout — matches lg breakpoint (1024px+). */
export const RESEARCH_DESKTOP_MIN_WIDTH = 1024;

export function isResearchDesktopWidth(width: number) {
  return width >= RESEARCH_DESKTOP_MIN_WIDTH;
}
