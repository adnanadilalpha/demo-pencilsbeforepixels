"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getEditorSection, getSectionsForPage, researchFieldKeys, type ContentPageId } from "@/lib/admin/content-config";
import { buildPublishPayloads } from "@/lib/admin/build-save-payload";
import type { ContentEditorState } from "@/lib/admin/content-editor-types";
import {
  clearLocalDraft,
  getSectionFromLocalDraft,
  markSectionDirty,
  preparePublishSections,
  readLocalDraft,
  upsertSectionInLocalDraft,
  writeLocalDraft,
  type SectionLocalDraft,
} from "@/lib/admin/content-local-draft";
import { getResearchFieldValue } from "@/lib/admin/content-paths";
import type { EditableScoreRow } from "@/lib/admin/evidence-scores";
import { EvidenceScopeEditor } from "@/components/admin/content/EvidenceScopeEditor";
import { ResearchPageEditor } from "@/components/admin/content/ResearchPageEditor";
import { ContentToolbar } from "@/components/admin/content/ContentToolbar";
import { ExpertQuotesEditor } from "@/components/admin/content/ExpertQuotesEditor";
import { SectionForm } from "@/components/admin/content/SectionForm";
import { SectionNav } from "@/components/admin/content/SectionNav";
import { SoftwareReviewsEditor } from "@/components/admin/content/SoftwareReviewsEditor";
import { TimelineEditor } from "@/components/admin/content/TimelineEditor";
import type { MentalHealthLegendItem } from "@/lib/admin/cms-entity-types";
import type { EditableLibraryItem } from "@/lib/admin/cms-entity-types";
import { AcademicDatasetsEditor } from "@/components/admin/content/AcademicDatasetsEditor";
import { LibraryItemsEditor } from "@/components/admin/content/LibraryItemsEditor";
import { MentalHealthLegendEditor } from "@/components/admin/content/MentalHealthLegendEditor";
import { NavigationEditor } from "@/components/admin/content/NavigationEditor";
import { OptOutStepsEditor } from "@/components/admin/content/OptOutStepsEditor";
import { SiteSettingsEditor } from "@/components/admin/content/SiteSettingsEditor";
import type { AcademicDatasetCopy } from "@/lib/admin/academic-dataset-defaults";
import { mergeAcademicDatasetEditorState } from "@/lib/admin/academic-dataset-defaults";
import { normalizeYouTubeUrl } from "@/lib/youtube";
import type {
  ExpertQuote,
  LibraryCategory,
  OptOutStep,
  TimelineSlide,
} from "@/lib/cms/types";

function normalizeSoftwareReviews(
  reviews: ContentEditorState["softwareReviews"],
): ContentEditorState["softwareReviews"] {
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

function mergeSoftwareReviews(
  server: ContentEditorState["softwareReviews"],
  local?: ContentEditorState["softwareReviews"],
): ContentEditorState["softwareReviews"] {
  if (!local) return normalizeSoftwareReviews(server);

  return normalizeSoftwareReviews({
    ixl: { ...server.ixl, ...local.ixl },
    epic: { ...server.epic, ...local.epic },
  });
}

type ContentEditorProps = {
  initialState: ContentEditorState;
};

function buildFormValues(
  state: ContentEditorState,
  sectionId: string,
  localContent?: Record<string, unknown>,
): Record<string, unknown> {
  const editorSection = getEditorSection(sectionId);
  if (!editorSection) return localContent ?? {};

  let base: Record<string, unknown> = {};

  if (sectionId === "evidence_research") {
    base = {
      ...(state.sections["evidence.intro"] ?? {}),
      ...(state.sections["evidence.research_tab"] ?? {}),
    };

    for (const key of researchFieldKeys) {
      base[key] = getResearchFieldValue(state.research, key);
    }
  } else if (editorSection.sectionKey) {
    const sectionContent = state.sections[editorSection.sectionKey] ?? {};
    if (sectionId === "mental_health") {
      base = {
        ...sectionContent,
        chartImage: state.mentalHealthChartImage,
      };
    } else {
      base = { ...sectionContent };
    }
  } else {
    for (const field of editorSection.fields) {
      if (field.key.startsWith("research.")) {
        base[field.key] = getResearchFieldValue(state.research, field.key);
      }
    }
  }

  return localContent ? { ...base, ...localContent } : base;
}

function buildSectionLocalDraft(
  sectionId: string,
  formValues: Record<string, unknown>,
  extras: {
    expertQuotes: ExpertQuote[];
    timeline: TimelineSlide[];
    softwareReviews: ContentEditorState["softwareReviews"];
    academicDatasets: AcademicDatasetCopy[];
    evidenceScores: EditableScoreRow[];
    siteSettings: ContentEditorState["siteSettings"];
    navigation: ContentEditorState["navigation"];
    libraryItems: EditableLibraryItem[];
    optOutSteps: OptOutStep[];
  },
): SectionLocalDraft {
  const draft: SectionLocalDraft = { content: formValues };

  if (sectionId === "expert_voices") {
    draft.expertQuotes = extras.expertQuotes;
  }

  if (sectionId === "timeline") {
    draft.timeline = extras.timeline;
  }

  if (sectionId === "learning_apps") {
    draft.softwareReviews = extras.softwareReviews;
  }

  if (
    sectionId === "academic_data" ||
    sectionId === "evidence_research" ||
    sectionId === "evidence_nebraska" ||
    sectionId === "evidence_district_66"
  ) {
    draft.academicDatasets = extras.academicDatasets;
  }

  if (sectionId === "evidence_nebraska" || sectionId === "evidence_district_66") {
    draft.evidenceScores = extras.evidenceScores;
  }

  if (sectionId === "site_settings") {
    draft.siteSettings = extras.siteSettings;
  }

  if (sectionId === "navigation") {
    draft.navigation = extras.navigation;
  }

  if (sectionId === "research_library") {
    draft.libraryItems = extras.libraryItems;
  }

  if (sectionId === "device_opt_out") {
    draft.optOutSteps = extras.optOutSteps;
  }

  return draft;
}

export function ContentEditor({ initialState }: ContentEditorProps) {
  const localDraft = readLocalDraft();
  const initialPage = localDraft?.page ?? "homepage";
  const initialSectionId =
    getSectionsForPage(initialPage)[0]?.id ?? "hero";

  const [state, setState] = useState(initialState);
  const [page, setPage] = useState<ContentPageId>(initialPage);
  const [activeSectionId, setActiveSectionId] = useState(initialSectionId);
  const [formValues, setFormValues] = useState<Record<string, unknown>>(() => {
    const local = getSectionFromLocalDraft(initialSectionId);
    return buildFormValues(initialState, initialSectionId, local?.content);
  });
  const [expertQuotes, setExpertQuotes] = useState<ExpertQuote[]>(
    getSectionFromLocalDraft("expert_voices")?.expertQuotes ??
      initialState.expertQuotes,
  );
  const [timeline, setTimeline] = useState<TimelineSlide[]>(
    getSectionFromLocalDraft("timeline")?.timeline ?? initialState.timeline,
  );
  const [softwareReviews, setSoftwareReviews] = useState<
    ContentEditorState["softwareReviews"]
  >(() =>
    mergeSoftwareReviews(
      initialState.softwareReviews,
      getSectionFromLocalDraft("learning_apps")?.softwareReviews,
    ),
  );
  const [academicDatasets, setAcademicDatasets] = useState<AcademicDatasetCopy[]>(
    () =>
      mergeAcademicDatasetEditorState(
        initialState.academicDatasets,
        getSectionFromLocalDraft("academic_data")?.academicDatasets ??
          getSectionFromLocalDraft("evidence_research")?.academicDatasets ??
          getSectionFromLocalDraft("evidence_nebraska")?.academicDatasets ??
          getSectionFromLocalDraft("evidence_district_66")?.academicDatasets,
      ),
  );
  const [evidenceScores, setEvidenceScores] = useState<EditableScoreRow[]>([]);
  const [siteSettings, setSiteSettings] = useState(initialState.siteSettings);
  const [navigation, setNavigation] = useState(initialState.navigation);
  const [libraryItems, setLibraryItems] = useState(initialState.libraryItems);
  const [optOutSteps, setOptOutSteps] = useState(initialState.optOutSteps);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const formValuesRef = useRef(formValues);
  const expertQuotesRef = useRef(expertQuotes);
  const timelineRef = useRef(timeline);
  const softwareReviewsRef = useRef(softwareReviews);
  const academicDatasetsRef = useRef(academicDatasets);
  const activeSectionIdRef = useRef(activeSectionId);
  const hydratedSectionRef = useRef<string | null>(null);

  const evidenceScoresRef = useRef(evidenceScores);
  const siteSettingsRef = useRef(siteSettings);
  const navigationRef = useRef(navigation);
  const libraryItemsRef = useRef(libraryItems);
  const optOutStepsRef = useRef(optOutSteps);

  formValuesRef.current = formValues;
  expertQuotesRef.current = expertQuotes;
  timelineRef.current = timeline;
  softwareReviewsRef.current = softwareReviews;
  academicDatasetsRef.current = academicDatasets;
  evidenceScoresRef.current = evidenceScores;
  siteSettingsRef.current = siteSettings;
  navigationRef.current = navigation;
  libraryItemsRef.current = libraryItems;
  optOutStepsRef.current = optOutSteps;
  activeSectionIdRef.current = activeSectionId;

  const draftExtras = () => ({
    expertQuotes: expertQuotesRef.current,
    timeline: timelineRef.current,
    softwareReviews: softwareReviewsRef.current,
    academicDatasets: academicDatasetsRef.current,
    evidenceScores: evidenceScoresRef.current,
    siteSettings: siteSettingsRef.current,
    navigation: navigationRef.current,
    libraryItems: libraryItemsRef.current,
    optOutSteps: optOutStepsRef.current,
  });

  const sections = useMemo(() => getSectionsForPage(page), [page]);
  const activeSection = getEditorSection(activeSectionId);

  const persistCurrentSection = useCallback(
    (sectionId: string) => {
      upsertSectionInLocalDraft(
        sectionId,
        buildSectionLocalDraft(
          sectionId,
          formValuesRef.current,
          draftExtras(),
        ),
      );
    },
    [],
  );

  const loadSection = useCallback(
    (sectionId: string, serverState: ContentEditorState = state) => {
      const local = getSectionFromLocalDraft(sectionId);
      setFormValues(
        buildFormValues(serverState, sectionId, local?.content),
      );

      if (sectionId === "expert_voices") {
        setExpertQuotes(
          local?.expertQuotes ?? serverState.expertQuotes,
        );
      }

      if (sectionId === "timeline") {
        setTimeline(local?.timeline ?? serverState.timeline);
      }

      if (sectionId === "learning_apps") {
        setSoftwareReviews(
          mergeSoftwareReviews(
            serverState.softwareReviews,
            local?.softwareReviews,
          ),
        );
      }

      if (
        sectionId === "academic_data" ||
        sectionId === "evidence_research" ||
        sectionId === "evidence_nebraska" ||
        sectionId === "evidence_district_66"
      ) {
        setAcademicDatasets(
          mergeAcademicDatasetEditorState(
            serverState.academicDatasets,
            local?.academicDatasets,
          ),
        );
      }

      if (sectionId === "evidence_nebraska" || sectionId === "evidence_district_66") {
        setEvidenceScores(local?.evidenceScores ?? []);
      }

      if (sectionId === "site_settings") {
        setSiteSettings(local?.siteSettings ?? serverState.siteSettings);
      }

      if (sectionId === "navigation") {
        setNavigation(local?.navigation ?? serverState.navigation);
      }

      if (sectionId === "research_library") {
        setLibraryItems(local?.libraryItems ?? serverState.libraryItems);
      }

      if (sectionId === "device_opt_out") {
        setOptOutSteps(local?.optOutSteps ?? serverState.optOutSteps);
      }
    },
    [state],
  );

  useEffect(() => {
    const firstSection = getSectionsForPage(page)[0];
    if (!firstSection) return;

    persistCurrentSection(activeSectionIdRef.current);
    setActiveSectionId(firstSection.id);
    loadSection(firstSection.id);

    const draft = readLocalDraft() ?? { sections: {} };
    writeLocalDraft({ ...draft, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    if (hydratedSectionRef.current !== activeSectionId) {
      hydratedSectionRef.current = activeSectionId;
      return;
    }

    const timeout = window.setTimeout(() => {
      markSectionDirty(activeSectionId);
      persistCurrentSection(activeSectionId);
      const draft = readLocalDraft() ?? { sections: {} };
      writeLocalDraft({ ...draft, page });
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [formValues, expertQuotes, timeline, softwareReviews, academicDatasets, evidenceScores, siteSettings, navigation, libraryItems, optOutSteps, activeSectionId, page, persistCurrentSection]);

  const selectSection = useCallback(
    (sectionId: string) => {
      persistCurrentSection(activeSectionId);
      setActiveSectionId(sectionId);
      loadSection(sectionId);
    },
    [activeSectionId, loadSection, persistCurrentSection],
  );

  const handleFieldChange = useCallback((key: string, value: unknown) => {
    markSectionDirty(activeSectionIdRef.current);
    setFormValues((current) => ({ ...current, [key]: value }));
  }, []);

  const handlePublish = useCallback(async () => {
    setPublishing(true);
    setPublishMessage(null);

    try {
      const currentDraft = buildSectionLocalDraft(
        activeSectionId,
        formValuesRef.current,
        draftExtras(),
      );
      upsertSectionInLocalDraft(activeSectionId, currentDraft);
      markSectionDirty(activeSectionId);

      const local = readLocalDraft();
      const dirtySectionIds = [
        ...new Set([...(local?.dirtySections ?? []), activeSectionId]),
      ];
      const sectionsToSave = preparePublishSections(
        {
          ...(local?.sections ?? {}),
          [activeSectionId]: currentDraft,
        },
        dirtySectionIds,
      );

      const publishResponse = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          sections: buildPublishPayloads(sectionsToSave),
        }),
      });

      if (!publishResponse.ok) {
        const body = (await publishResponse.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to publish.");
      }

      const latestState = (await publishResponse.json()) as ContentEditorState;
      clearLocalDraft();
      setState(latestState);
      loadSection(activeSectionId, latestState);
      setPublishMessage({
        type: "success",
        text: "Published successfully. Changes are live on the site.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to publish.";
      console.error(error);
      setPublishMessage({ type: "error", text: message });
    } finally {
      setPublishing(false);
    }
  }, [activeSectionId, loadSection]);

  if (!activeSection) {
    return null;
  }

  return (
    <div className="-mx-6 -my-6 flex min-h-[calc(100dvh-4rem)] flex-col">
      <ContentToolbar
        page={page}
        onPageChange={setPage}
        onPublish={() => void handlePublish()}
        publishing={publishing}
        publishMessage={publishMessage}
      />

      <div className="flex min-h-0 flex-1">
        <SectionNav
          sections={sections}
          activeId={activeSectionId}
          onSelect={selectSection}
        />

        <div className="min-w-0 flex-1 overflow-y-auto bg-paper-50">
          <div className="flex min-h-full w-full justify-center px-6 py-8 lg:px-10">
            <div className="w-full max-w-6xl rounded-[14px] border border-navy-800/8 bg-white p-6 shadow-sm sm:p-8">
              {activeSection.id === "site_settings" ? (
                <div className="space-y-6">
                  <h2 className="text-base font-semibold text-navy-800">
                    Site Settings
                  </h2>
                  <SiteSettingsEditor
                    settings={siteSettings}
                    onChange={setSiteSettings}
                  />
                </div>
              ) : null}

              {activeSection.id === "navigation" ? (
                <div className="space-y-6">
                  <h2 className="text-base font-semibold text-navy-800">
                    Navigation
                  </h2>
                  <NavigationEditor
                    header={navigation.header}
                    footer={navigation.footer}
                    onChange={setNavigation}
                  />
                </div>
              ) : null}

              {activeSection.id === "evidence_nebraska" ? (
                <EvidenceScopeEditor
                  key="evidence_nebraska"
                  scope="nebraska"
                  title="Nebraska"
                  formValues={formValues}
                  onFormChange={handleFieldChange}
                  academicDatasets={academicDatasets}
                  onAcademicDatasetsChange={setAcademicDatasets}
                  evidenceScores={evidenceScores}
                  onEvidenceScoresChange={setEvidenceScores}
                />
              ) : null}

              {activeSection.id === "evidence_district_66" ? (
                <EvidenceScopeEditor
                  key="evidence_district_66"
                  scope="district66"
                  title="District 66"
                  formValues={formValues}
                  onFormChange={handleFieldChange}
                  academicDatasets={academicDatasets}
                  onAcademicDatasetsChange={setAcademicDatasets}
                  evidenceScores={evidenceScores}
                  onEvidenceScoresChange={setEvidenceScores}
                />
              ) : null}

              {activeSection.id === "evidence_research" ? (
                <ResearchPageEditor
                  state={state}
                  formValues={formValues}
                  onFormChange={handleFieldChange}
                  academicDatasets={academicDatasets}
                  onAcademicDatasetsChange={setAcademicDatasets}
                />
              ) : null}

              {activeSection.id !== "evidence_nebraska" &&
              activeSection.id !== "evidence_district_66" &&
              activeSection.id !== "evidence_research" &&
              activeSection.id !== "site_settings" &&
              activeSection.id !== "navigation" ? (
                <>
                  <SectionForm
                    title={activeSection.label}
                    fields={activeSection.fields}
                    values={formValues}
                    onChange={handleFieldChange}
                  />

                  {activeSection.id === "academic_data" ? (
                    <AcademicDatasetsEditor
                      datasets={academicDatasets}
                      onChange={setAcademicDatasets}
                    />
                  ) : null}

                  {activeSection.id === "learning_apps" ? (
                    <SoftwareReviewsEditor
                      reviews={[softwareReviews.ixl, softwareReviews.epic]}
                      onChange={(reviews) => {
                        const next = {
                          ixl: reviews.find((review) => review.slug === "ixl")!,
                          epic: reviews.find((review) => review.slug === "epic")!,
                        };
                        setSoftwareReviews(next);
                      }}
                    />
                  ) : null}

                  {activeSection.id === "mental_health" ? (
                    <MentalHealthLegendEditor
                      value={
                        (formValues.legend as MentalHealthLegendItem[] | undefined) ??
                        []
                      }
                      onChange={(value) => handleFieldChange("legend", value)}
                    />
                  ) : null}

                  {activeSection.id === "research_library" ? (
                    <LibraryItemsEditor
                      items={libraryItems}
                      categories={
                        (formValues.categories as LibraryCategory[] | undefined) ??
                        []
                      }
                      onChange={setLibraryItems}
                    />
                  ) : null}

                  {activeSection.id === "device_opt_out" ? (
                    <OptOutStepsEditor
                      steps={optOutSteps}
                      onChange={setOptOutSteps}
                    />
                  ) : null}

                  {activeSection.id === "expert_voices" ? (
                    <ExpertQuotesEditor
                      quotes={expertQuotes}
                      onChange={setExpertQuotes}
                    />
                  ) : null}

                  {activeSection.id === "timeline" ? (
                    <TimelineEditor slides={timeline} onChange={setTimeline} />
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
