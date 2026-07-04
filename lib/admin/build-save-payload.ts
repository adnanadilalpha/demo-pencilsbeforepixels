import type { ContentSavePayload } from "@/lib/admin/content-editor-types";
import type { SectionLocalDraft } from "@/lib/admin/content-local-draft";
import { sanitizeGoalSectionForPublish } from "@/lib/cms/goal-section-content";
import { sanitizeResearchLibraryForPublish } from "@/lib/cms/research-library-content";
import { MISSION_SLIDE_LABELS } from "@/lib/cms/mission-slides";
import { sanitizeMentalHealthForPublish } from "@/lib/cms/site-ctas";
import { normalizeYouTubeUrl } from "@/lib/youtube";

function stripEditorMetaKeys(content: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(content).filter(([key]) => !key.startsWith("_")),
  );
}

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

function buildSavePayload(
  sectionId: string,
  draft: SectionLocalDraft,
): ContentSavePayload {
  let content = stripEditorMetaKeys(draft.content);

  if (sectionId === "goal") {
    content = sanitizeGoalSectionForPublish(content);
  }

  if (sectionId === "hero") {
    content = { ...content };
    delete content.secondaryCta;
  }

  if (sectionId === "mental_health") {
    content = sanitizeMentalHealthForPublish(content);
  }

  if (sectionId === "research_library") {
    content = sanitizeResearchLibraryForPublish(content);
  }

  if (sectionId === "device_opt_out") {
    content = { ...content };
    delete content.secondaryCta;
  }

  const payload: ContentSavePayload = {
    sectionId,
    content,
  };

  if (sectionId === "expert_voices" && draft.expertQuotes) {
    payload.expertQuotes = draft.expertQuotes;
  }

  if (sectionId === "timeline" && draft.timeline) {
    payload.timeline = draft.timeline.map((slide, index) => ({
      ...slide,
      era: MISSION_SLIDE_LABELS[index] ?? slide.era,
    }));
  }

  if (sectionId === "learning_apps" && draft.softwareReviews) {
    payload.softwareReviews = normalizeSoftwareReviews(draft.softwareReviews);
    const { epic } = draft.softwareReviews;
    payload.content = {
      ...payload.content,
      audioTitle: epic.audioTitle ?? "",
      audioDescription: epic.audioDescription ?? "",
      audioSrc: epic.audioSrc ?? "",
    };
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

  return payload;
}

export function buildPublishPayloads(
  sections: Array<[string, SectionLocalDraft]>,
): ContentSavePayload[] {
  return sections.map(([sectionId, draft]) =>
    buildSavePayload(sectionId, draft),
  );
}
