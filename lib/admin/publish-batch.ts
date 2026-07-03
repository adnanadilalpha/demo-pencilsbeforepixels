import "server-only";

import { mergeStoredGeneral } from "@/lib/admin/settings/defaults";
import { getEditorSection } from "@/lib/admin/content-config";
import {
  type AcademicDatasetCopy,
} from "@/lib/admin/academic-dataset-defaults";
import type { ContentSavePayload, SectionDraft } from "@/lib/admin/content-editor-types";
import { applyResearchContentDraft } from "@/lib/admin/research-persistence";
import { mergeResearchWithFallback } from "@/lib/research/merge";
import { saveEvidenceScores } from "@/lib/admin/evidence-scores";
import {
  publicUrlToStoragePath,
  stripUrlCacheBuster,
} from "@/lib/admin/media-paths";
import { normalizeYouTubeUrl } from "@/lib/youtube";
import { normalizeMissionTimeline } from "@/lib/cms/mission-slides";
import type { SectionKey } from "@/lib/cms/types";
import type {
  EditableLibraryItem,
  SiteSettingsDraft,
} from "@/lib/admin/cms-entity-types";
import type { ExpertQuote, OptOutStep, TimelineSlide } from "@/lib/cms/types";
import type { ResearchChartsData } from "@/lib/research/types";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContentEditorState } from "@/lib/admin/content-editor-types";

function assertNoError(
  error: { message: string } | null,
  context: string,
): void {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

type MergedPublishPayload = {
  sections: Array<{ sectionKey: SectionKey; content: SectionDraft; page: string }>;
  researchContent: SectionDraft | null;
  expertQuotes?: ExpertQuote[];
  timeline?: TimelineSlide[];
  softwareReviews?: ContentEditorState["softwareReviews"];
  academicDatasets?: AcademicDatasetCopy[];
  evidenceScores?: ContentSavePayload["evidenceScores"];
  siteSettings?: SiteSettingsDraft;
  navigation?: ContentEditorState["navigation"];
  libraryItems?: EditableLibraryItem[];
  optOutSteps?: OptOutStep[];
};

function mergePublishPayloads(payloads: ContentSavePayload[]): MergedPublishPayload {
  const sectionMap = new Map<
    SectionKey,
    { content: SectionDraft; page: string }
  >();
  const merged: MergedPublishPayload = {
    sections: [],
    researchContent: null,
  };

  for (const payload of payloads) {
    const editorSection = getEditorSection(payload.sectionId);
    if (!editorSection && payload.sectionId.startsWith("research_")) {
      merged.researchContent = {
        ...(merged.researchContent ?? {}),
        ...payload.content,
      };
      continue;
    }

    if (!editorSection) continue;

    if (editorSection.sectionKey) {
      const content = { ...payload.content };
      delete content.chartImage;
      delete content.letterPreviewImage;
      sectionMap.set(editorSection.sectionKey, {
        content,
        page: editorSection.page,
      });
    }

    if (payload.sectionId === "evidence_research") {
      merged.researchContent = {
        ...(merged.researchContent ?? {}),
        ...payload.content,
      };

      const introContent: SectionDraft = {};
      const headerContent: SectionDraft = {};
      for (const [key, value] of Object.entries(payload.content)) {
        if (key === "label" || key === "body") introContent[key] = value;
        if (key === "title" || key === "subtitle") headerContent[key] = value;
      }
      if (Object.keys(introContent).length > 0) {
        sectionMap.set("evidence.intro", {
          content: introContent,
          page: "research",
        });
      }
      if (Object.keys(headerContent).length > 0) {
        sectionMap.set("evidence.research_tab", {
          content: headerContent,
          page: "research",
        });
      }
    }

    if (payload.expertQuotes) merged.expertQuotes = payload.expertQuotes;
    if (payload.timeline) merged.timeline = payload.timeline;
    if (payload.softwareReviews) merged.softwareReviews = payload.softwareReviews;
    if (payload.academicDatasets) merged.academicDatasets = payload.academicDatasets;
    if (payload.evidenceScores?.length) {
      merged.evidenceScores = payload.evidenceScores;
    }
    if (payload.siteSettings) merged.siteSettings = payload.siteSettings;
    if (payload.navigation) merged.navigation = payload.navigation;
    if (payload.libraryItems) merged.libraryItems = payload.libraryItems;
    if (payload.optOutSteps) merged.optOutSteps = payload.optOutSteps;
  }

  merged.sections = [...sectionMap.entries()].map(([sectionKey, value]) => ({
    sectionKey,
    ...value,
  }));

  return merged;
}

type MediaResolver = (publicUrl: string) => string | null;

async function createMediaResolver(): Promise<MediaResolver> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, public_url, storage_path");

  assertNoError(error, "Failed to load media assets");

  const byPublicUrl = new Map<string, string>();
  const byStoragePath = new Map<string, string>();

  for (const row of data ?? []) {
    byPublicUrl.set(row.public_url, row.id);
    byStoragePath.set(row.storage_path, row.id);
    const clean = stripUrlCacheBuster(row.public_url);
    if (clean !== row.public_url) {
      byPublicUrl.set(clean, row.id);
    }
  }

  return (publicUrl: string) => {
    if (!publicUrl) return null;
    const clean = stripUrlCacheBuster(publicUrl);
    const storagePath = publicUrlToStoragePath(clean);
    if (storagePath && byStoragePath.has(storagePath)) {
      return byStoragePath.get(storagePath) ?? null;
    }
    return byPublicUrl.get(publicUrl) ?? byPublicUrl.get(clean) ?? null;
  };
}

async function batchUpsertSectionContents(
  sections: MergedPublishPayload["sections"],
): Promise<void> {
  if (!sections.length) return;

  const supabase = createAdminClient();
  const { error } = await supabase.from("content_sections").upsert(
    sections.map((section) => ({
      section_key: section.sectionKey,
      content: section.content,
      page: section.page,
      status: "published",
      section_type: "copy",
    })),
    { onConflict: "section_key" },
  );

  assertNoError(error, "Failed to batch upsert content sections");
}

async function saveResearchContent(content: SectionDraft): Promise<void> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("research_datasets")
    .select("data")
    .eq("key", "main")
    .maybeSingle();

  const research = mergeResearchWithFallback(
    applyResearchContentDraft(
      (data?.data as ResearchChartsData | undefined) ?? null,
      content,
    ),
  );

  const { error } = await supabase.from("research_datasets").upsert(
    { key: "main", label: "Research Charts", data: research },
    { onConflict: "key" },
  );

  assertNoError(error, "Failed to save research dataset");
}

async function saveSoftwareReviewsBatch(
  reviews: ContentEditorState["softwareReviews"],
): Promise<void> {
  const supabase = createAdminClient();

  await Promise.all(
    [reviews.epic, reviews.ixl].map((review) =>
      supabase
        .from("software_reviews")
        .update({
          title: review.title,
          summary: review.summary ?? null,
          youtube_id: review.youtubeId
            ? normalizeYouTubeUrl(review.youtubeId)
            : null,
          vendor_research: review.vendorResearch ?? null,
          independent_research: review.independentResearch ?? null,
          references_note: review.referencesNote ?? null,
        })
        .eq("slug", review.slug)
        .then(({ error }) => {
          assertNoError(error, `Failed to save ${review.slug} review`);
        }),
    ),
  );
}

async function saveAcademicDatasetsBatch(
  datasets: AcademicDatasetCopy[],
): Promise<void> {
  const supabase = createAdminClient();
  const { staticAcademicDatasets } = await import("@/lib/academic-data/static");
  const staticChartsByKey = new Map(
    staticAcademicDatasets.map((dataset) => [dataset.id, dataset.charts]),
  );

  await Promise.all(
    datasets.map(async (dataset, index) => {
      const { error: upsertError } = await supabase.from("academic_datasets").upsert(
        {
          key: dataset.key,
          label: dataset.label,
          title: dataset.title,
          description: dataset.description,
          charts: staticChartsByKey.get(dataset.key) ?? [],
          sort_order: index,
        },
        { onConflict: "key" },
      );

      assertNoError(upsertError, `Failed to save academic dataset ${dataset.key}`);

      const { error: deleteInsightsError } = await supabase
        .from("academic_dataset_insights")
        .delete()
        .eq("dataset_key", dataset.key);

      assertNoError(
        deleteInsightsError,
        `Failed to clear academic dataset insights ${dataset.key}`,
      );

      if (!dataset.insight.length) return;

      const { error: insertInsightsError } = await supabase
        .from("academic_dataset_insights")
        .insert(
          dataset.insight.map((segment, insightIndex) => ({
            dataset_key: dataset.key,
            sort_order: insightIndex,
            text: segment.text,
            emphasis: segment.emphasis ?? null,
          })),
        );

      assertNoError(
        insertInsightsError,
        `Failed to save academic dataset insights ${dataset.key}`,
      );
    }),
  );
}

async function saveSiteSettingsBatch(settings: SiteSettingsDraft): Promise<void> {
  const supabase = createAdminClient();
  const { data: existingRow, error: loadError } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "general")
    .maybeSingle();

  assertNoError(loadError, "Failed to load site settings");

  const existing = (existingRow?.value ?? {}) as Record<string, unknown>;
  const value = mergeStoredGeneral(existing, {
    siteName: settings.siteName,
    description: settings.description,
    privacyPolicyUrl: settings.privacyPolicyUrl,
    termsOfServiceUrl: settings.termsOfServiceUrl,
    copyright: settings.copyright,
  });

  const { error } = await supabase.from("site_settings").upsert(
    {
      key: "general",
      value,
    },
    { onConflict: "key" },
  );

  assertNoError(error, "Failed to save site settings");
}

async function saveNavigationLinksBatch(
  navigation: NonNullable<MergedPublishPayload["navigation"]>,
): Promise<void> {
  const supabase = createAdminClient();
  const links = [
    ...navigation.header.map((link, index) => ({
      ...link,
      location: "header" as const,
      sort_order: index,
    })),
    ...navigation.footer.map((link, index) => ({
      ...link,
      location: "footer" as const,
      sort_order: index,
    })),
  ].filter((link) => link.id);

  await Promise.all(
    links.map((link) =>
      supabase
        .from("navigation_links")
        .update({
          label: link.label,
          href: link.href,
          sort_order: link.sort_order,
        })
        .eq("id", link.id!)
        .then(({ error }) => {
          assertNoError(error, `Failed to update navigation link ${link.label}`);
        }),
    ),
  );
}

async function saveExpertQuotesBatch(
  quotes: ExpertQuote[],
  resolveMediaId: MediaResolver,
): Promise<void> {
  const supabase = createAdminClient();
  const { error: deleteError } = await supabase
    .from("expert_quotes")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  assertNoError(deleteError, "Failed to clear expert quotes");
  if (!quotes.length) return;

  const { error } = await supabase.from("expert_quotes").insert(
    quotes.map((quote, index) => ({
      number: quote.number,
      quote: quote.quote,
      name: quote.name,
      title: quote.title,
      image_media_id: resolveMediaId(quote.image),
      sort_order: index,
      visible: true,
    })),
  );

  assertNoError(error, "Failed to save expert quotes");
}

async function saveTimelineBatch(
  slides: TimelineSlide[],
  resolveMediaId: MediaResolver,
): Promise<void> {
  const supabase = createAdminClient();
  const { error: deleteError } = await supabase
    .from("timeline_slides")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  assertNoError(deleteError, "Failed to clear timeline slides");
  const missionSlides = normalizeMissionTimeline(slides);
  if (!missionSlides.length) return;

  const { error } = await supabase.from("timeline_slides").insert(
    missionSlides.map((slide, index) => ({
      era: slide.era,
      number: slide.number,
      title: slide.title,
      body: slide.description,
      image_media_id: resolveMediaId(slide.image),
      background: slide.background,
      text_color: slide.textColor,
      era_style: slide.eraStyle,
      indent_content: slide.indentContent,
      sort_order: index,
      visible: true,
    })),
  );

  assertNoError(error, "Failed to save timeline slides");
}

async function saveLibraryItemsBatch(
  items: EditableLibraryItem[],
  resolveMediaId: MediaResolver,
): Promise<void> {
  const supabase = createAdminClient();

  await Promise.all(
    items.map(async (item, index) => {
      const imageMediaId = resolveMediaId(item.image);
      const row = {
        category: item.category,
        title: item.title,
        subtitle: item.subtitle,
        kind: item.kind,
        image_media_id: imageMediaId,
        sort_order: index,
        ...(item.kind === "book"
          ? { external_url: item.viewUrl?.trim() || null }
          : {}),
      };

      if (item.id) {
        const { error } = await supabase
          .from("library_items")
          .update(row)
          .eq("id", item.id);

        assertNoError(error, `Failed to update library item ${item.title}`);
        return;
      }

      const { error } = await supabase.from("library_items").insert({
        ...row,
        visible: true,
      });

      assertNoError(error, `Failed to create library item ${item.title}`);
    }),
  );
}

async function saveOptOutStepsBatch(steps: OptOutStep[]): Promise<void> {
  const supabase = createAdminClient();
  const { data: existing, error: selectError } = await supabase
    .from("opt_out_steps")
    .select("id, sort_order")
    .order("sort_order");

  assertNoError(selectError, "Failed to load opt-out steps");

  await Promise.all(
    steps.map(async (step, index) => {
      const row = existing?.[index];
      if (!row?.id) return;

      const { error } = await supabase
        .from("opt_out_steps")
        .update({
          number: step.number,
          title: step.title,
          description: step.description,
          sort_order: index,
        })
        .eq("id", row.id);

      assertNoError(error, `Failed to update opt-out step ${step.number}`);
    }),
  );
}

export async function applyPublishBatch(
  payloads: ContentSavePayload[],
): Promise<void> {
  if (!payloads.length) return;

  const merged = mergePublishPayloads(payloads);
  const needsMedia =
    Boolean(merged.expertQuotes?.length) ||
    Boolean(merged.timeline?.length) ||
    Boolean(merged.libraryItems?.length);

  const resolveMediaId = needsMedia ? await createMediaResolver() : () => null;

  await Promise.all([
    batchUpsertSectionContents(merged.sections),
    merged.researchContent
      ? saveResearchContent(merged.researchContent)
      : Promise.resolve(),
    merged.expertQuotes
      ? saveExpertQuotesBatch(merged.expertQuotes, resolveMediaId)
      : Promise.resolve(),
    merged.timeline
      ? saveTimelineBatch(merged.timeline, resolveMediaId)
      : Promise.resolve(),
    merged.softwareReviews
      ? saveSoftwareReviewsBatch(merged.softwareReviews)
      : Promise.resolve(),
    merged.academicDatasets
      ? saveAcademicDatasetsBatch(merged.academicDatasets)
      : Promise.resolve(),
    merged.evidenceScores?.length
      ? saveEvidenceScores(merged.evidenceScores)
      : Promise.resolve(),
    merged.siteSettings
      ? saveSiteSettingsBatch(merged.siteSettings)
      : Promise.resolve(),
    merged.navigation
      ? saveNavigationLinksBatch(merged.navigation)
      : Promise.resolve(),
    merged.libraryItems
      ? saveLibraryItemsBatch(merged.libraryItems, resolveMediaId)
      : Promise.resolve(),
    merged.optOutSteps
      ? saveOptOutStepsBatch(merged.optOutSteps)
      : Promise.resolve(),
  ]);
}
