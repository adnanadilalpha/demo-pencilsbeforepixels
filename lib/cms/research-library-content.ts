import { libraryCategories } from "./fallback-data";
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

  const canonical = trimmed;

  const allowed = new Set<LibraryCategory>(libraryCategories);
  return allowed.has(canonical as LibraryCategory)
    ? (canonical as LibraryCategory)
    : null;
}

export function normalizeResearchLibraryCategories(
  raw: unknown,
): LibraryCategory[] {
  if (!Array.isArray(raw)) {
    return [...libraryCategories];
  }

  const filtered = raw
    .map((category) =>
      typeof category === "string" ? normalizeLibraryCategory(category) : null,
    )
    .filter((category): category is LibraryCategory => category !== null);

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
