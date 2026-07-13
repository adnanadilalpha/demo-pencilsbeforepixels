import {
  libraryCategories,
  resolvePublicLibraryCategories,
} from "./fallback-data";
import type { LibraryCategory } from "./types";

export const WALLED_GARDEN_CATEGORY = "Walled Garden" as const;
export const RESEARCH_PAPERS_CATEGORY = "Research Papers" as const;

export const RESEARCH_LIBRARY_CATEGORY_COUNT = libraryCategories.length;

export function normalizeLibraryCategory(
  category: string | null | undefined,
): LibraryCategory | null {
  if (typeof category !== "string") return null;

  const trimmed = category.trim();
  if (!trimmed) return null;

  const allowed = new Set<LibraryCategory>(libraryCategories);
  return allowed.has(trimmed as LibraryCategory)
    ? (trimmed as LibraryCategory)
    : null;
}

export function normalizeResearchLibraryCategories(
  raw: unknown,
): LibraryCategory[] {
  return resolvePublicLibraryCategories(
    Array.isArray(raw) ? (raw as LibraryCategory[]) : undefined,
  );
}

export function sanitizeResearchLibraryForPublish(
  content: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...content,
    categories: normalizeResearchLibraryCategories(content.categories),
  };
}
