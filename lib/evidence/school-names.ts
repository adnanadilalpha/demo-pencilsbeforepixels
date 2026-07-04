const SCHOOL_TYPE_SUFFIX =
  /\s+\b(?:Elementary(?:\s+School|\s+Sch\.?)?|Middle(?:\s+School|\s+Sch\.?)?|High(?:\s+School|\s+Sch\.?)?|Elem\.?|ES)\s*$/i;

function stripSchoolTypeSuffix(name: string) {
  let trimmed = name.trim();
  let previous = "";

  while (trimmed !== previous) {
    previous = trimmed;
    trimmed = trimmed.replace(SCHOOL_TYPE_SUFFIX, "").replace(/\s+/g, " ").trim();
  }

  return trimmed;
}

function titleCaseWords(name: string) {
  return name
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Strips redundant school-type suffixes (e.g. "Elementary") for display. */
export function formatSchoolDisplayName(name: string) {
  const stripped = stripSchoolTypeSuffix(name);
  return titleCaseWords(stripped);
}

/** Normalized key for matching score and FRL rows across naming variants. */
export function normalizeSchoolName(name: string) {
  return stripSchoolTypeSuffix(name).toLowerCase();
}
