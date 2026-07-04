import { libraryCategories } from "./fallback-data";
import type { LibraryCategory } from "./types";

export const RESEARCH_LIBRARY_CATEGORY_COUNT = libraryCategories.length;

export function normalizeResearchLibraryCategories(
  raw: unknown,
): LibraryCategory[] {
  const allowed = new Set<LibraryCategory>(libraryCategories);

  if (!Array.isArray(raw)) {
    return [...libraryCategories];
  }

  const filtered = raw.filter(
    (category): category is LibraryCategory =>
      typeof category === "string" &&
      category.trim().length > 0 &&
      allowed.has(category as LibraryCategory),
  );

  return filtered.length > 0 ? filtered : [...libraryCategories];
}

export function sanitizeResearchLibraryForPublish(
  content: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...content,
    categories: [...libraryCategories],
  };
}
