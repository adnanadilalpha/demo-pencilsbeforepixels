/**
 * Normalizes district agency names so score and FRL rows align.
 * Mirrors the reference Nebraska dashboard logic.
 */
export function normalizeDistrictName(name: string) {
  return name
    .replace(/\d+/g, "")
    .replace(
      /\b(PUBLIC SCHOOLS?|SCHOOLS?|SCHOOL|PUBLIC|SCH SYSTEM|SCHS|DIST|R|COMM|DISTRICT)\b/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}
