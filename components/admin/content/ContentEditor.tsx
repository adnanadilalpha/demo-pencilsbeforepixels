"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getEditorSection,
  getSectionsForPage,
  normalizeContentPageId,
  researchFieldKeys,
  type ContentPageId,
} from "@/lib/admin/content-config";
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
import {
  getResearchFieldValue,
  setResearchFieldValue,
} from "@/lib/admin/content-paths";
import {
  buildResearchEditorContent,
  isResearchPdfField,
} from "@/lib/admin/research-persistence";
import { buildFallbackSiteContent } from "@/lib/cms/fallback";
import { resolveSectionTextField } from "@/lib/cms/section-fields";
import type { EditableScoreRow } from "@/lib/admin/evidence-scores";
import { EvidenceScopeEditor } from "@/components/admin/content/EvidenceScopeEditor";
import { ResearchPageEditor } from "@/components/admin/content/ResearchPageEditor";
import { ContentToolbar } from "@/components/admin/content/ContentToolbar";
import { ExpertQuotesEditor } from "@/components/admin/content/ExpertQuotesEditor";
import { SectionForm } from "@/components/admin/content/SectionForm";
import { SectionNav } from "@/components/admin/content/SectionNav";
import { SoftwareReviewsEditor } from "@/components/admin/content/SoftwareReviewsEditor";
import { TimelineEditor } from "@/components/admin/content/TimelineEditor";
import { WhatToDoFindingsEditor } from "@/components/admin/content/WhatToDoFindingsEditor";
import type { MentalHealthLegendItem } from "@/lib/admin/cms-entity-types";
import type { EditableLibraryItem } from "@/lib/admin/cms-entity-types";
import { LibraryItemsEditor } from "@/components/admin/content/LibraryItemsEditor";
import { MentalHealthLegendEditor } from "@/components/admin/content/MentalHealthLegendEditor";
import { NavigationEditor } from "@/components/admin/content/NavigationEditor";
import { BeforeOptOutEditor } from "@/components/admin/content/BeforeOptOutEditor";
import { OptOutStepsEditor } from "@/components/admin/content/OptOutStepsEditor";
import { SocialLinksEditor } from "@/components/admin/settings/SocialLinksEditor";
import { SiteSettingsEditor } from "@/components/admin/content/SiteSettingsEditor";
import type { AcademicDatasetCopy } from "@/lib/admin/academic-dataset-defaults";
import { mergeAcademicDatasetEditorState } from "@/lib/admin/academic-dataset-defaults";
import { normalizeYouTubeUrl } from "@/lib/youtube";
import { normalizeMissionTimeline } from "@/lib/cms/mission-slides";
import {
  createDefaultGoalFindings,
  normalizeGoalSectionContent,
  type GoalFinding,
} from "@/lib/cms/goal-section-content";
import {
  mergeBeforeOptOutSectionContent,
  normalizeBeforeOptOutContent,
} from "@/lib/cms/before-opt-out-content";
import type {
  ExpertQuote,
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
  routePage?: ContentPageId;
  routeSection?: string;
};

function resolveRouteSection(
  page: ContentPageId,
  sectionId?: string,
): string | undefined {
  const sections = getSectionsForPage(page);
  if (sectionId && sections.some((section) => section.id === sectionId)) {
    return sectionId;
  }
  return sections[0]?.id;
}

function buildFormValues(
  state: ContentEditorState,
  sectionId: string,
  localContent?: Record<string, unknown>,
): Record<string, unknown> {
  const editorSection = getEditorSection(sectionId);
  if (!editorSection) return localContent ?? {};

  let base: Record<string, unknown> = {};

  if (sectionId === "evidence_research") {
    const fallbackSections = buildFallbackSiteContent().sections;
    const intro = state.sections["evidence.intro"] ?? {};
    const pageHeader = state.sections["evidence.research_tab"] ?? {};
    const introFallback = fallbackSections["evidence.intro"] ?? {};
    const pageHeaderFallback = fallbackSections["evidence.research_tab"] ?? {};

    base = {
      title: resolveSectionTextField(pageHeader, pageHeaderFallback, "title"),
      subtitle: resolveSectionTextField(
        pageHeader,
        pageHeaderFallback,
        "subtitle",
      ),
      label: resolveSectionTextField(intro, introFallback, "label"),
      body: resolveSectionTextField(intro, introFallback, "body"),
    };

    for (const key of researchFieldKeys) {
      base[key] = getResearchFieldValue(state.research, key);
    }
  } else if (editorSection.sectionKey) {
    const sectionContent = state.sections[editorSection.sectionKey] ?? {};
    if (sectionId === "goal") {
      base = normalizeGoalSectionContent(sectionContent);
    } else if (sectionId === "mental_health") {
      base = {
        ...sectionContent,
        chartImage: state.mentalHealthChartImage,
      };
    } else if (sectionId === "before_opt_out") {
      const legacy = state.sections["homepage.device_opt_out"] ?? {};
      base = mergeBeforeOptOutSectionContent(
        sectionContent,
        legacy,
      );
    } else if (sectionId === "device_opt_out") {
      base = {
        ...sectionContent,
        letterPreviewImage: state.optOutLetterPreviewImage,
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

  const merged = localContent
    ? sectionId === "goal"
      ? normalizeGoalSectionContent({ ...base, ...localContent })
      : sectionId === "before_opt_out"
        ? mergeBeforeOptOutSectionContent({ ...base, ...localContent })
        : { ...base, ...localContent }
    : base;

  if (sectionId === "evidence_research") {
    const fallbackSections = buildFallbackSiteContent().sections;
    return {
      ...merged,
      title: resolveSectionTextField(
        merged,
        fallbackSections["evidence.research_tab"],
        "title",
      ),
      subtitle: resolveSectionTextField(
        merged,
        fallbackSections["evidence.research_tab"],
        "subtitle",
      ),
      label: resolveSectionTextField(
        merged,
        fallbackSections["evidence.intro"],
        "label",
      ),
      body: resolveSectionTextField(
        merged,
        fallbackSections["evidence.intro"],
        "body",
      ),
    };
  }

  return merged;
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

  if (sectionId === "footer") {
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

export function ContentEditor({
  initialState,
  routePage,
  routeSection,
}: ContentEditorProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPage = routePage ?? "homepage";
  const initialSectionId =
    resolveRouteSection(initialPage, routeSection) ??
    getSectionsForPage(initialPage)[0]?.id ??
    "hero";

  const [state, setState] = useState(initialState);
  const [page, setPage] = useState<ContentPageId>(initialPage);
  const [activeSectionId, setActiveSectionId] = useState(initialSectionId);
  const [formValues, setFormValues] = useState<Record<string, unknown>>(() =>
    buildFormValues(initialState, initialSectionId),
  );
  const [expertQuotes, setExpertQuotes] = useState<ExpertQuote[]>(
    initialState.expertQuotes,
  );
  const [timeline, setTimeline] = useState<TimelineSlide[]>(() =>
    normalizeMissionTimeline(initialState.timeline),
  );
  const [softwareReviews, setSoftwareReviews] = useState<
    ContentEditorState["softwareReviews"]
  >(() => normalizeSoftwareReviews(initialState.softwareReviews));
  const [academicDatasets, setAcademicDatasets] = useState<AcademicDatasetCopy[]>(
    () => mergeAcademicDatasetEditorState(initialState.academicDatasets),
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
  const userEditedRef = useRef(false);
  const syncedStateRef = useRef(
    `${initialState.version}:${initialState.publishedAt}`,
  );

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
      const session = getSectionFromLocalDraft(sectionId);
      setFormValues(
        buildFormValues(serverState, sectionId, session?.content),
      );

      if (sectionId === "expert_voices") {
        setExpertQuotes(
          session?.expertQuotes ?? serverState.expertQuotes,
        );
      }

      if (sectionId === "timeline") {
        setTimeline(
          normalizeMissionTimeline(session?.timeline ?? serverState.timeline),
        );
      }

      if (sectionId === "learning_apps") {
        setSoftwareReviews(
          mergeSoftwareReviews(
            serverState.softwareReviews,
            session?.softwareReviews,
          ),
        );
      }

      if (
        sectionId === "evidence_research" ||
        sectionId === "evidence_nebraska" ||
        sectionId === "evidence_district_66"
      ) {
        setAcademicDatasets(
          mergeAcademicDatasetEditorState(
            serverState.academicDatasets,
            session?.academicDatasets,
          ),
        );
      }

      if (sectionId === "evidence_nebraska" || sectionId === "evidence_district_66") {
        setEvidenceScores(session?.evidenceScores ?? []);
      }

      if (sectionId === "site_settings") {
        setSiteSettings(session?.siteSettings ?? serverState.siteSettings);
      }

      if (sectionId === "footer") {
        setSiteSettings(session?.siteSettings ?? serverState.siteSettings);
      }

      if (sectionId === "navigation") {
        setNavigation(session?.navigation ?? serverState.navigation);
      }

      if (sectionId === "research_library") {
        setLibraryItems(session?.libraryItems ?? serverState.libraryItems);
      }

      if (sectionId === "device_opt_out") {
        setOptOutSteps(session?.optOutSteps ?? serverState.optOutSteps);
      }
    },
    [state],
  );

  const applyServerState = useCallback(
    (serverState: ContentEditorState, sectionId: string) => {
      setState(serverState);
      setExpertQuotes(serverState.expertQuotes);
      setTimeline(normalizeMissionTimeline(serverState.timeline));
      setSoftwareReviews(normalizeSoftwareReviews(serverState.softwareReviews));
      setAcademicDatasets(
        mergeAcademicDatasetEditorState(serverState.academicDatasets),
      );
      setEvidenceScores([]);
      setSiteSettings(serverState.siteSettings);
      setNavigation(serverState.navigation);
      setLibraryItems(serverState.libraryItems);
      setOptOutSteps(serverState.optOutSteps);
      setFormValues(buildFormValues(serverState, sectionId));
    },
    [],
  );

  useEffect(() => {
    const fingerprint = `${initialState.version}:${initialState.publishedAt}`;
    if (syncedStateRef.current === fingerprint || userEditedRef.current) {
      return;
    }

    syncedStateRef.current = fingerprint;
    applyServerState(initialState, activeSectionIdRef.current);
  }, [initialState, applyServerState]);

  useEffect(() => {
    clearLocalDraft();
    userEditedRef.current = false;
    router.refresh();

    let cancelled = false;

    void fetch("/api/admin/content", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok || cancelled || userEditedRef.current) return;
        const fresh = (await response.json()) as ContentEditorState;
        const fingerprint = `${fresh.version}:${fresh.publishedAt}`;
        if (syncedStateRef.current === fingerprint) return;
        syncedStateRef.current = fingerprint;
        applyServerState(fresh, activeSectionIdRef.current);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [applyServerState, router]);

  useEffect(() => {
    const sectionParam = searchParams.get("section");
    const sections = getSectionsForPage(page);
    const firstSection = sections[0];
    if (!firstSection) return;

    const targetSection =
      resolveRouteSection(page, sectionParam ?? undefined) ?? firstSection.id;

    if (targetSection === activeSectionIdRef.current) {
      const draft = readLocalDraft() ?? { sections: {} };
      writeLocalDraft({ ...draft, page });
      return;
    }

    persistCurrentSection(activeSectionIdRef.current);
    setActiveSectionId(targetSection);
    loadSection(targetSection);

    const draft = readLocalDraft() ?? { sections: {} };
    writeLocalDraft({ ...draft, page });
  }, [page, searchParams, loadSection, persistCurrentSection]);

  useEffect(() => {
    const pageParam = normalizeContentPageId(searchParams.get("page") ?? undefined);
    if (!pageParam || pageParam === page) {
      return;
    }

    setPage(pageParam);
  }, [searchParams, page]);

  const selectSection = useCallback(
    (sectionId: string) => {
      persistCurrentSection(activeSectionId);
      setActiveSectionId(sectionId);
      loadSection(sectionId);
    },
    [activeSectionId, loadSection, persistCurrentSection],
  );

  useEffect(() => {
    if (hydratedSectionRef.current !== activeSectionId) {
      hydratedSectionRef.current = activeSectionId;
      return;
    }

    const timeout = window.setTimeout(() => {
      userEditedRef.current = true;
      markSectionDirty(activeSectionId);
      persistCurrentSection(activeSectionId);
      const draft = readLocalDraft() ?? { sections: {} };
      writeLocalDraft({ ...draft, page });
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [formValues, expertQuotes, timeline, softwareReviews, academicDatasets, evidenceScores, siteSettings, navigation, libraryItems, optOutSteps, activeSectionId, page, persistCurrentSection]);

  const handleFieldChange = useCallback((key: string, value: unknown) => {
    const sectionId = activeSectionIdRef.current;
    markSectionDirty(sectionId);

    setFormValues((current) => {
      const next = { ...current, [key]: value };

      if (isResearchPdfField(key)) {
        upsertSectionInLocalDraft(
          sectionId,
          buildSectionLocalDraft(sectionId, next, draftExtras()),
        );
      }

      return next;
    });

    if (key.startsWith("research.")) {
      setState((current) => {
        const research = setResearchFieldValue(current.research, key, value);

        if (
          isResearchPdfField(key) &&
          sectionId === "evidence_research" &&
          typeof value === "string" &&
          value.trim()
        ) {
          const content = buildResearchEditorContent(research, {
            ...formValuesRef.current,
            [key]: value,
          });

          void fetch("/api/admin/content", {
            method: "PUT",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sectionId: "evidence_research",
              content,
            }),
          })
            .then(async (response) => {
              if (!response.ok) return;
              const nextState = (await response.json()) as ContentEditorState;
              setState(nextState);
            })
            .catch(() => undefined);
        }

        return { ...current, research };
      });
    }
  }, []);

  const handlePublish = useCallback(async () => {
    setPublishing(true);
    setPublishMessage(null);

    try {
      const publishFormValues =
        activeSectionId === "evidence_research"
          ? buildResearchEditorContent(state.research, formValuesRef.current)
          : formValuesRef.current;

      const currentDraft = buildSectionLocalDraft(
        activeSectionId,
        publishFormValues,
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
        cache: "no-store",
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
      userEditedRef.current = false;
      syncedStateRef.current = `${latestState.version}:${latestState.publishedAt}`;
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

  const handlePageChange = useCallback(
    (nextPage: ContentPageId) => {
      persistCurrentSection(activeSectionIdRef.current);
      const nextSection = getSectionsForPage(nextPage)[0]?.id ?? "hero";
      setPage(nextPage);
      router.replace(
        `/admin/content?page=${nextPage}&section=${nextSection}`,
        { scroll: false },
      );
    },
    [persistCurrentSection, router],
  );

  if (!activeSection) {
    return null;
  }

  return (
    <div className="-mx-6 -my-6 flex min-h-[calc(100dvh-4rem)] flex-col">
      <ContentToolbar
        page={page}
        onPageChange={handlePageChange}
        onPublish={() => void handlePublish()}
        publishing={publishing}
        publishMessage={publishMessage}
      />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <SectionNav
          sections={sections}
          activeId={activeSectionId}
          onSelect={selectSection}
        />

        <div className="min-w-0 flex-1 overflow-y-auto bg-paper-50">
          <div className="flex min-h-full w-full justify-center px-4 py-4 md:px-6 md:py-8 lg:px-10">
            <div className="w-full max-w-6xl rounded-[14px] border border-navy-800/8 bg-white p-4 shadow-sm sm:p-6 md:p-8">
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

                  {activeSection.id === "goal" ? (
                    <div className="mt-8 border-t border-navy-800/8 pt-8">
                      <WhatToDoFindingsEditor
                        value={
                          Array.isArray(formValues.findings)
                            ? (formValues.findings as GoalFinding[])
                            : createDefaultGoalFindings()
                        }
                        onChange={(value) =>
                          handleFieldChange("findings", value)
                        }
                      />
                    </div>
                  ) : null}

                  {activeSection.id === "learning_apps" ? (
                    <SoftwareReviewsEditor
                      reviews={[softwareReviews.epic]}
                      onChange={(reviews) => {
                        const epic = reviews.find((review) => review.slug === "epic");
                        if (!epic) return;
                        setSoftwareReviews({
                          ...softwareReviews,
                          epic,
                        });
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
                      onChange={setLibraryItems}
                    />
                  ) : null}

                  {activeSection.id === "before_opt_out" ? (
                    <div className="mt-8 border-t border-navy-800/8 pt-8">
                      <BeforeOptOutEditor
                        value={normalizeBeforeOptOutContent(formValues)}
                        onChange={(content) => {
                          markSectionDirty("before_opt_out");
                          userEditedRef.current = true;
                          setFormValues((current) => ({
                            ...current,
                            ...content,
                          }));
                        }}
                      />
                    </div>
                  ) : null}

                  {activeSection.id === "device_opt_out" ? (
                    <div className="mt-8 border-t border-navy-800/8 pt-8">
                      <OptOutStepsEditor
                        steps={optOutSteps}
                        onChange={setOptOutSteps}
                      />
                    </div>
                  ) : null}

                  {activeSection.id === "footer" ? (
                    <div className="mt-8 border-t border-navy-800/8 pt-8">
                      <h3 className="text-sm font-semibold text-navy-800">
                        Social links
                      </h3>
                      <p className="mt-1 text-sm text-body-muted">
                        Same links as Settings → General. Publish here to update
                        the footer icons on the live site.
                      </p>
                      <div className="mt-4">
                        <SocialLinksEditor
                          links={siteSettings.socialLinks}
                          onChange={(socialLinks) => {
                            markSectionDirty("footer");
                            userEditedRef.current = true;
                            setSiteSettings((current) => ({
                              ...current,
                              socialLinks,
                            }));
                          }}
                        />
                      </div>
                    </div>
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
