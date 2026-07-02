import type { ContentSavePayload } from "@/lib/admin/content-editor-types";
import type { SectionLocalDraft } from "@/lib/admin/content-local-draft";
import { normalizeYouTubeUrl } from "@/lib/youtube";

function normalizeSoftwareReviews(
  reviews: NonNullable<SectionLocalDraft["softwareReviews"]>,
): NonNullable<ContentSavePayload["softwareReviews"]> {
  return {
    ixl: reviews.ixl,
    epic: {
      ...reviews.epic,
      youtubeId: reviews.epic.youtubeId
        ? normalizeYouTubeUrl(reviews.epic.youtubeId)
        : undefined,
    },
  };
}

export function buildSavePayload(
  sectionId: string,
  draft: SectionLocalDraft,
): ContentSavePayload {
  const payload: ContentSavePayload = {
    sectionId,
    content: draft.content,
  };

  if (sectionId === "expert_voices" && draft.expertQuotes) {
    payload.expertQuotes = draft.expertQuotes;
  }

  if (sectionId === "timeline" && draft.timeline) {
    payload.timeline = draft.timeline;
  }

  if (sectionId === "learning_apps" && draft.softwareReviews) {
    payload.softwareReviews = normalizeSoftwareReviews(draft.softwareReviews);
  }

  if (
    (sectionId === "evidence_research" ||
      sectionId === "evidence_nebraska" ||
      sectionId === "evidence_district_66") &&
    draft.academicDatasets
  ) {
    payload.academicDatasets = draft.academicDatasets;
  }

  if (
    (sectionId === "evidence_nebraska" || sectionId === "evidence_district_66") &&
    draft.evidenceScores
  ) {
    payload.evidenceScores = draft.evidenceScores;
  }

  if (sectionId === "site_settings" && draft.siteSettings) {
    payload.siteSettings = draft.siteSettings;
  }

  if (sectionId === "navigation" && draft.navigation) {
    payload.navigation = draft.navigation;
  }

  if (sectionId === "research_library" && draft.libraryItems) {
    payload.libraryItems = draft.libraryItems;
  }

  if (sectionId === "device_opt_out" && draft.optOutSteps) {
    payload.optOutSteps = draft.optOutSteps;
  }

  if (sectionId === "academic_data" && draft.academicDatasets) {
    payload.academicDatasets = draft.academicDatasets;
  }

  return payload;
}

export function buildPublishPayloads(
  sections: Array<[string, SectionLocalDraft]>,
): ContentSavePayload[] {
  return sections.map(([sectionId, draft]) =>
    buildSavePayload(sectionId, draft),
  );
}
