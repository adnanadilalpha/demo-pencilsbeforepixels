import type { EditableLibraryItem, EditableNavLink } from "@/lib/admin/cms-entity-types";
import type { EditableScoreRow } from "@/lib/admin/evidence-scores";
import type { AcademicDatasetCopy } from "@/lib/admin/academic-dataset-defaults";
import type { ExpertQuote, OptOutStep, TimelineSlide, SoftwareReview, SiteSettings } from "@/lib/cms/types";
import { allEditorSections, normalizeContentPageId, type ContentPageId } from "@/lib/admin/content-config";

const STORAGE_KEY = "pbp-admin-content-draft";

const VALID_SECTION_IDS = new Set(allEditorSections.map((section) => section.id));

function isLegacyResearchSectionId(sectionId: string): boolean {
  return sectionId.startsWith("research_");
}

function dedupeSharedPublishDrafts(
  entries: Array<[string, SectionLocalDraft]>,
): Array<[string, SectionLocalDraft]> {
  const result = entries.map(
    ([id, draft]) => [id, { ...draft }] as [string, SectionLocalDraft],
  );

  const academicOwner =
    result.find(([id]) => id === "academic_data")?.[0] ??
    result.find(([id]) => id === "evidence_research")?.[0] ??
    null;

  const scoresOwner =
    result.find(([id]) => id === "evidence_nebraska")?.[0] ??
    result.find(([id]) => id === "evidence_district_66")?.[0] ??
    null;

  for (const [id, draft] of result) {
    if (draft.academicDatasets && id !== academicOwner) {
      delete draft.academicDatasets;
    }
    if (draft.evidenceScores && id !== scoresOwner) {
      delete draft.evidenceScores;
    }
  }

  return result;
}

export function preparePublishSections(
  sections: Record<string, SectionLocalDraft>,
  dirtySectionIds?: string[],
): Array<[string, SectionLocalDraft]> {
  const dirtySet =
    dirtySectionIds && dirtySectionIds.length > 0
      ? new Set(dirtySectionIds)
      : null;
  const mergedResearchContent: Record<string, unknown> = {};
  const validEntries: Array<[string, SectionLocalDraft]> = [];

  for (const [sectionId, draft] of Object.entries(sections)) {
    if (dirtySet && !dirtySet.has(sectionId)) {
      continue;
    }

    if (VALID_SECTION_IDS.has(sectionId)) {
      validEntries.push([sectionId, draft]);
      continue;
    }

    if (isLegacyResearchSectionId(sectionId)) {
      Object.assign(mergedResearchContent, draft.content);
    }
  }

  if (Object.keys(mergedResearchContent).length > 0) {
    const researchIndex = validEntries.findIndex(([id]) => id === "evidence_research");

    if (researchIndex >= 0) {
      const [, draft] = validEntries[researchIndex];
      validEntries[researchIndex] = [
        "evidence_research",
        {
          ...draft,
          content: { ...mergedResearchContent, ...draft.content },
        },
      ];
    } else {
      validEntries.push(["evidence_research", { content: mergedResearchContent }]);
    }
  }

  return dedupeSharedPublishDrafts(validEntries);
}

export function sanitizeLocalDraft(draft: ContentLocalDraft): ContentLocalDraft {
  const page = normalizeContentPageId(draft.page) ?? draft.page;

  return {
    ...draft,
    page: page as ContentPageId | undefined,
    sections: Object.fromEntries(
      preparePublishSections(draft.sections).map(([sectionId, sectionDraft]) => [
        sectionId,
        sectionDraft,
      ]),
    ),
  };
}

export type SectionLocalDraft = {
  content: Record<string, unknown>;
  expertQuotes?: ExpertQuote[];
  timeline?: TimelineSlide[];
  softwareReviews?: {
    epic: SoftwareReview;
    ixl: SoftwareReview;
  };
  academicDatasets?: AcademicDatasetCopy[];
  evidenceScores?: EditableScoreRow[];
  siteSettings?: SiteSettings;
  navigation?: { header: EditableNavLink[]; footer: EditableNavLink[] };
  libraryItems?: EditableLibraryItem[];
  optOutSteps?: OptOutStep[];
};

export type ContentLocalDraft = {
  sections: Record<string, SectionLocalDraft>;
  page?: ContentPageId;
  dirtySections?: string[];
};

export function readLocalDraft(): ContentLocalDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizeLocalDraft(JSON.parse(raw) as ContentLocalDraft);
  } catch {
    return null;
  }
}

export function writeLocalDraft(draft: ContentLocalDraft): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearLocalDraft(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function markSectionDirty(sectionId: string): void {
  if (typeof window === "undefined") return;

  const current = readLocalDraft() ?? { sections: {} };
  const dirty = new Set(current.dirtySections ?? []);
  dirty.add(sectionId);

  writeLocalDraft({
    ...current,
    dirtySections: [...dirty],
  });
}

export function upsertSectionInLocalDraft(
  sectionId: string,
  patch: SectionLocalDraft,
): ContentLocalDraft {
  const current = readLocalDraft() ?? { sections: {} };
  const existing = current.sections[sectionId] ?? { content: {} };

  const next: ContentLocalDraft = {
    ...current,
    sections: {
      ...current.sections,
      [sectionId]: {
        content: { ...existing.content, ...patch.content },
        expertQuotes: patch.expertQuotes ?? existing.expertQuotes,
        timeline: patch.timeline ?? existing.timeline,
        softwareReviews: patch.softwareReviews ?? existing.softwareReviews,
        academicDatasets: patch.academicDatasets ?? existing.academicDatasets,
        evidenceScores: patch.evidenceScores ?? existing.evidenceScores,
        siteSettings: patch.siteSettings ?? existing.siteSettings,
        navigation: patch.navigation ?? existing.navigation,
        libraryItems: patch.libraryItems ?? existing.libraryItems,
        optOutSteps: patch.optOutSteps ?? existing.optOutSteps,
      },
    },
  };

  writeLocalDraft(next);
  return next;
}

export function getSectionFromLocalDraft(
  sectionId: string,
): SectionLocalDraft | null {
  const draft = readLocalDraft();
  return draft?.sections[sectionId] ?? null;
}
