import { whatToDoPoints } from "./what-to-do-points";

export const WHAT_TO_DO_FINDINGS_COUNT = 8;

export type GoalFinding = {
  headline: string;
  body: string;
};

export type GoalSectionContent = {
  tagline: string;
  body: string;
  findings: GoalFinding[];
};

const GOAL_SECTION_DEFAULTS = {
  tagline: "Focus over distraction and cognitive friction over swiping.",
  body:
    "Eight findings from national assessments and international studies — grouped so you can follow the story from U.S. classrooms to OECD nations and back to early childhood.",
};

function getFallbackSection(): Record<string, unknown> {
  return {
    ...GOAL_SECTION_DEFAULTS,
    findings: createDefaultGoalFindings(),
  };
}

function readString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Short stat-style prefix before an em dash; longer text is treated as body-only. */
const LEGACY_HEADLINE_MAX_LENGTH = 48;

export function splitLegacyGoalPoint(point: string): GoalFinding {
  const separator = " — ";
  const trimmed = point.trim();
  if (!trimmed) return { headline: "", body: "" };

  const splitIndex = trimmed.indexOf(separator);
  if (splitIndex === -1) {
    return { headline: "", body: trimmed };
  }

  const headline = trimmed.slice(0, splitIndex).trim();
  const body = trimmed.slice(splitIndex + separator.length).trim();

  if (
    headline.length > LEGACY_HEADLINE_MAX_LENGTH ||
    /[.!?]\s/.test(headline)
  ) {
    return { headline: "", body: trimmed };
  }

  return {
    headline,
    body: body || trimmed,
  };
}

export function createDefaultGoalFindings(): GoalFinding[] {
  return whatToDoPoints
    .slice(0, WHAT_TO_DO_FINDINGS_COUNT)
    .map(splitLegacyGoalPoint);
}

function padFindings(findings: GoalFinding[]): GoalFinding[] {
  const defaults = createDefaultGoalFindings();
  const padded = findings.map((finding) => ({
    headline: finding.headline.trim(),
    body: finding.body.trim(),
  }));

  while (padded.length < WHAT_TO_DO_FINDINGS_COUNT) {
    const index = padded.length;
    padded.push(defaults[index] ?? { headline: "", body: "" });
  }

  return padded.slice(0, WHAT_TO_DO_FINDINGS_COUNT);
}

function readStructuredFindings(value: unknown): GoalFinding[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const items = value
    .map((item) => {
      if (typeof item === "string") {
        return splitLegacyGoalPoint(item);
      }

      if (!item || typeof item !== "object") return null;

      const record = item as Record<string, unknown>;
      const headline =
        readString(record.headline) ??
        readString(record.stat) ??
        readString(record.title) ??
        "";
      const body = readString(record.body) ?? "";

      if (!headline && !body) return null;

      return { headline, body };
    })
    .filter((item): item is GoalFinding => item !== null);

  return items.length > 0 ? items : undefined;
}

function readLegacyPointsArray(value: unknown): GoalFinding[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const items = value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );

  return items.length > 0 ? items.map(splitLegacyGoalPoint) : undefined;
}

function readFallbackFindings(): GoalFinding[] {
  return createDefaultGoalFindings();
}

/** Merge CMS / legacy keys with defaults for admin + public rendering. */
export function normalizeGoalSectionContent(
  raw: Record<string, unknown> | null | undefined,
): GoalSectionContent {
  const fallback = getFallbackSection();

  const tagline =
    readString(raw?.tagline) ??
    readString(raw?.headline) ??
    readString(fallback.tagline) ??
    "";
  const body =
    readString(raw?.body) ?? readString(fallback.body) ?? "";
  const findings =
    readStructuredFindings(raw?.findings) ??
    readLegacyPointsArray(raw?.points) ??
    readLegacyPointsArray(raw?.bullets) ??
    readFallbackFindings();

  return {
    tagline,
    body,
    findings: padFindings(findings),
  };
}

/** Published shape stored in Supabase — canonical keys only. */
export function sanitizeGoalSectionForPublish(
  content: Record<string, unknown>,
): Record<string, unknown> {
  const normalized = normalizeGoalSectionContent(content);
  const findings = padFindings(
    normalized.findings.map((finding) => ({
      headline: finding.headline.trim(),
      body: finding.body.trim(),
    })),
  ).filter((finding) => finding.headline || finding.body);

  return {
    tagline: normalized.tagline,
    body: normalized.body,
    findings:
      findings.length > 0 ? findings : createDefaultGoalFindings(),
  };
}

export function resolveGoalFindingItems(findings: GoalFinding[]): GoalFinding[] {
  const trimmed = findings
    .map((finding) => ({
      headline: finding.headline.trim(),
      body: finding.body.trim(),
    }))
    .filter((finding) => finding.headline || finding.body);

  return trimmed.length > 0 ? trimmed : createDefaultGoalFindings();
}
