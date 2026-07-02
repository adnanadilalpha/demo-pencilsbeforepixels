/**
 * Normalizes Westside school names so score and FRL rows align.
 */
export function normalizeSchoolName(name: string) {
  return name
    .replace(
      /\b(ELEMENTARY SCHOOL|ELEMENTARY SCH|MIDDLE SCHOOL|CARL A|ROAD|HILLS)\b/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}
