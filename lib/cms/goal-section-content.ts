import { buildFallbackSiteContent } from "./fallback";
import { whatToDoPoints } from "./what-to-do-points";

export const WHAT_TO_DO_FINDINGS_COUNT = 10;

export type GoalSectionContent = {
  label: string;
  tagline: string;
  body: string;
  points: string[];
};

const fallbackSection = buildFallbackSiteContent().sections["homepage.goal"];

function readString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const items = value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );

  return items.length > 0 ? items : undefined;
}

function padFindings(points: string[]): string[] {
  const padded = [...points];

  while (padded.length < WHAT_TO_DO_FINDINGS_COUNT) {
    padded.push("");
  }

  return padded.slice(0, WHAT_TO_DO_FINDINGS_COUNT);
}

/** Merge CMS / legacy keys with defaults for admin + public rendering. */
export function normalizeGoalSectionContent(
  raw: Record<string, unknown> | null | undefined,
): GoalSectionContent {
  const fallback = fallbackSection as Record<string, unknown>;

  const label =
    readString(raw?.label) ?? readString(fallback.label) ?? "What To Do";
  const tagline =
    readString(raw?.tagline) ??
    readString(raw?.headline) ??
    readString(fallback.tagline) ??
    "";
  const body =
    readString(raw?.body) ?? readString(fallback.body) ?? "";
  const points =
    readStringArray(raw?.points) ??
    readStringArray(raw?.findings) ??
    readStringArray(raw?.bullets) ??
    readStringArray(fallback.points) ??
    [...whatToDoPoints];

  return {
    label,
    tagline,
    body,
    points: padFindings(points),
  };
}

/** Published shape stored in Supabase — canonical keys only. */
export function sanitizeGoalSectionForPublish(
  content: Record<string, unknown>,
): Record<string, unknown> {
  const normalized = normalizeGoalSectionContent(content);
  const points = normalized.points
    .map((point) => point.trim())
    .filter(Boolean);

  return {
    label: normalized.label,
    tagline: normalized.tagline,
    body: normalized.body,
    points: points.length > 0 ? points : [...whatToDoPoints],
  };
}

export function resolveGoalFindings(points: string[]): string[] {
  const trimmed = points.map((point) => point.trim()).filter(Boolean);
  return trimmed.length > 0 ? trimmed : [...whatToDoPoints];
}
