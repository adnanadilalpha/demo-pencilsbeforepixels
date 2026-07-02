import "server-only";

import { mergeStoredGeneral } from "@/lib/admin/settings/defaults";
import { getEditorSection } from "@/lib/admin/content-config";
import {
  mergeAcademicDatasetCopies,
  type AcademicDatasetCopy,
} from "@/lib/admin/academic-dataset-defaults";
import type {
  ContentEditorState,
  ContentSavePayload,
  SectionDraft,
} from "@/lib/admin/content-editor-types";
import {
  applyResearchContentDraft,
  mergeResearchWithFallback,
} from "@/lib/admin/research-persistence";
import { saveEvidenceScores } from "@/lib/admin/evidence-scores";
import { resolveMediaIdByUrl } from "@/lib/admin/media-storage";
import { normalizeYouTubeUrl } from "@/lib/youtube";
import type { SectionKey, SoftwareReview } from "@/lib/cms/types";
import type {
  EditableLibraryItem,
  EditableNavLink,
  SiteSettingsDraft,
} from "@/lib/admin/cms-entity-types";
import type { ExpertQuote, OptOutStep, TimelineSlide } from "@/lib/cms/types";
import type { LibraryCategory } from "@/lib/cms/types";
import type { ResearchChartsData } from "@/lib/research/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyPublishBatch } from "@/lib/admin/publish-batch";

function assertNoError(
  error: { message: string } | null,
  context: string,
): void {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

function mergeEditorSections(
  published: Partial<Record<SectionKey, SectionDraft>>,
  drafts: Partial<Record<SectionKey, SectionDraft>>,
): Partial<Record<SectionKey, SectionDraft>> {
  const merged: Partial<Record<SectionKey, SectionDraft>> = { ...published };

  for (const [key, content] of Object.entries(drafts)) {
    merged[key as SectionKey] = {
      ...(merged[key as SectionKey] ?? {}),
      ...content,
    };
  }

  return merged;
}

async function loadSoftwareReviews(): Promise<ContentEditorState["softwareReviews"]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("software_reviews")
    .select(
      "slug, title, summary, youtube_id, vendor_research, independent_research, references_note",
    )
    .in("slug", ["epic", "ixl"]);

  assertNoError(error, "Failed to load software reviews");

  const reviews: ContentEditorState["softwareReviews"] = {
    epic: { slug: "epic", title: "Epic" },
    ixl: { slug: "ixl", title: "IXL Math" },
  };

  for (const row of data ?? []) {
    const mapped: SoftwareReview = {
      slug: row.slug as "epic" | "ixl",
      title: row.title,
      summary: row.summary ?? undefined,
      youtubeId: row.youtube_id
        ? normalizeYouTubeUrl(row.youtube_id)
        : undefined,
      vendorResearch: row.vendor_research as SoftwareReview["vendorResearch"],
      independentResearch:
        row.independent_research as SoftwareReview["independentResearch"],
      referencesNote: row.references_note ?? undefined,
    };

    if (row.slug === "epic") reviews.epic = mapped;
    if (row.slug === "ixl") reviews.ixl = mapped;
  }

  return reviews;
}

async function loadAcademicDatasetsForEditor(): Promise<AcademicDatasetCopy[]> {
  const supabase = createAdminClient();
  const [datasetsRes, insightsRes] = await Promise.all([
    supabase
      .from("academic_datasets")
      .select("key, label, title, description")
      .order("sort_order"),
    supabase
      .from("academic_dataset_insights")
      .select("dataset_key, sort_order, text, emphasis")
      .order("sort_order"),
  ]);

  const insightsByKey = new Map<string, AcademicDatasetCopy["insight"]>();
  for (const row of insightsRes.data ?? []) {
    const list = insightsByKey.get(row.dataset_key) ?? [];
    list.push({
      text: row.text,
      emphasis: (row.emphasis as "white" | "gold" | null) ?? undefined,
    });
    insightsByKey.set(row.dataset_key, list);
  }

  return mergeAcademicDatasetCopies(
    (datasetsRes.data ?? []).map((row) => ({
      key: row.key,
      label: row.label,
      title: row.title,
      description: row.description,
      insight: insightsByKey.get(row.key) ?? [],
    })),
  );
}

async function saveSoftwareReviews(
  reviews: ContentEditorState["softwareReviews"],
) {
  const supabase = createAdminClient();

  for (const review of [reviews.epic, reviews.ixl]) {
    const { error } = await supabase
      .from("software_reviews")
      .update({
        title: review.title,
        summary: review.summary ?? null,
        youtube_id: review.youtubeId ? normalizeYouTubeUrl(review.youtubeId) : null,
        vendor_research: review.vendorResearch ?? null,
        independent_research: review.independentResearch ?? null,
        references_note: review.referencesNote ?? null,
      })
      .eq("slug", review.slug);

    assertNoError(error, `Failed to save ${review.slug} review`);
  }
}

async function saveResearchSectionContent(content: SectionDraft) {
  const current = await loadResearch();
  const research = applyResearchContentDraft(current, content);
  await saveResearchDraft(research);
}

async function saveEvidenceResearchBundle(content: SectionDraft) {
  const introKeys = ["label", "body"];
  const headerKeys = ["title", "subtitle"];

  const introContent: SectionDraft = {};
  const headerContent: SectionDraft = {};

  for (const [key, value] of Object.entries(content)) {
    if (introKeys.includes(key)) introContent[key] = value;
    if (headerKeys.includes(key)) headerContent[key] = value;
  }

  if (Object.keys(introContent).length > 0) {
    await upsertSectionContent("evidence.intro", introContent, "evidence");
  }

  if (Object.keys(headerContent).length > 0) {
    await upsertSectionContent("evidence.research_tab", headerContent, "evidence");
  }

  await saveResearchSectionContent(content);
}

async function saveAcademicDatasets(datasets: AcademicDatasetCopy[]) {
  const supabase = createAdminClient();
  const { staticAcademicDatasets } = await import("@/lib/academic-data/static");
  const staticChartsByKey = new Map(
    staticAcademicDatasets.map((dataset) => [dataset.id, dataset.charts]),
  );

  for (const [index, dataset] of datasets.entries()) {
    const { data: existing, error: selectError } = await supabase
      .from("academic_datasets")
      .select("id")
      .eq("key", dataset.key)
      .maybeSingle();

    assertNoError(selectError, `Failed to load academic dataset ${dataset.key}`);

    if (existing?.id) {
      const { error } = await supabase
        .from("academic_datasets")
        .update({
          label: dataset.label,
          title: dataset.title,
          description: dataset.description,
          sort_order: index,
        })
        .eq("id", existing.id);

      assertNoError(error, `Failed to update academic dataset ${dataset.key}`);
    } else {
      const { error } = await supabase.from("academic_datasets").insert({
        key: dataset.key,
        label: dataset.label,
        title: dataset.title,
        description: dataset.description,
        charts: staticChartsByKey.get(dataset.key) ?? [],
        sort_order: index,
      });

      assertNoError(error, `Failed to create academic dataset ${dataset.key}`);
    }

    const { error: deleteInsightsError } = await supabase
      .from("academic_dataset_insights")
      .delete()
      .eq("dataset_key", dataset.key);

    assertNoError(
      deleteInsightsError,
      `Failed to clear academic dataset insights ${dataset.key}`,
    );

    if (dataset.insight.length) {
      const { error } = await supabase.from("academic_dataset_insights").insert(
        dataset.insight.map((segment, insightIndex) => ({
          dataset_key: dataset.key,
          sort_order: insightIndex,
          text: segment.text,
          emphasis: segment.emphasis ?? null,
        })),
      );

      assertNoError(
        error,
        `Failed to save academic dataset insights ${dataset.key}`,
      );
    }
  }
}

async function loadDraftSections(): Promise<{
  published: Partial<Record<SectionKey, SectionDraft>>;
  drafts: Partial<Record<SectionKey, SectionDraft>>;
  hasDrafts: boolean;
}> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("content_sections")
    .select("section_key, content, status");

  const published: Partial<Record<SectionKey, SectionDraft>> = {};
  const drafts: Partial<Record<SectionKey, SectionDraft>> = {};
  let hasDrafts = false;

  for (const row of data ?? []) {
    const key = row.section_key as SectionKey;
    const content = row.content as SectionDraft;
    if (row.status === "draft") {
      drafts[key] = content;
      hasDrafts = true;
    } else {
      published[key] = content;
    }
  }

  return { published, drafts, hasDrafts };
}

async function loadResearch(): Promise<ResearchChartsData | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("research_datasets")
    .select("data")
    .eq("key", "main")
    .maybeSingle();

  return (data?.data as ResearchChartsData | undefined) ?? null;
}

async function loadExpertQuotes(): Promise<ExpertQuote[] | null> {
  const supabase = createAdminClient();
  const [quotesRes, mediaRes] = await Promise.all([
    supabase
      .from("expert_quotes")
      .select("number, quote, name, title, image_media_id, sort_order")
      .order("sort_order"),
    supabase.from("media_assets").select("id, public_url"),
  ]);

  if (!quotesRes.data?.length) return null;

  const mediaById = new Map(
    (mediaRes.data ?? []).map((row) => [row.id, row.public_url]),
  );

  return quotesRes.data.map((quote) => ({
    number: quote.number,
    quote: quote.quote,
    name: quote.name,
    title: quote.title,
    image: quote.image_media_id
      ? (mediaById.get(quote.image_media_id) ?? "")
      : "",
  }));
}

async function loadTimeline(): Promise<TimelineSlide[] | null> {
  const supabase = createAdminClient();
  const [timelineRes, mediaRes] = await Promise.all([
    supabase
      .from("timeline_slides")
      .select(
        "era, number, title, body, image_media_id, background, text_color, era_style, indent_content, sort_order",
      )
      .order("sort_order"),
    supabase.from("media_assets").select("id, public_url"),
  ]);

  if (!timelineRes.data?.length) return null;

  const mediaById = new Map(
    (mediaRes.data ?? []).map((row) => [row.id, row.public_url]),
  );

  return timelineRes.data.map((slide) => ({
    era: slide.era,
    number: slide.number,
    title: slide.title,
    description: slide.body,
    image: slide.image_media_id
      ? (mediaById.get(slide.image_media_id) ?? "")
      : "",
    background: slide.background,
    textColor: slide.text_color as "light" | "dark",
    eraStyle: slide.era_style as "large" | "compact",
    indentContent: slide.indent_content,
  }));
}

async function loadSiteSettings(): Promise<SiteSettingsDraft> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "general")
    .maybeSingle();

  assertNoError(error, "Failed to load site settings");

  const value = (data?.value ?? {}) as Record<string, string>;
  return {
    siteName: value.siteName ?? "",
    description: value.description ?? "",
    privacyPolicyUrl: value.privacyPolicyUrl ?? "/privacy",
    termsOfServiceUrl: value.termsOfServiceUrl ?? "/terms",
    copyright: value.copyright ?? "",
  };
}

async function loadNavigationLinks(): Promise<ContentEditorState["navigation"]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("navigation_links")
    .select("id, location, label, href, sort_order")
    .order("sort_order");

  assertNoError(error, "Failed to load navigation links");

  const header: EditableNavLink[] = [];
  const footer: EditableNavLink[] = [];

  for (const row of data ?? []) {
    const link: EditableNavLink = {
      id: row.id,
      location: row.location as "header" | "footer",
      label: row.label,
      href: row.href,
    };
    if (row.location === "header") header.push(link);
    if (row.location === "footer") footer.push(link);
  }

  return { header, footer };
}

async function loadLibraryItems(): Promise<EditableLibraryItem[]> {
  const supabase = createAdminClient();
  const [itemsRes, mediaRes] = await Promise.all([
    supabase
      .from("library_items")
      .select("id, category, title, subtitle, kind, image_media_id, sort_order")
      .order("sort_order"),
    supabase.from("media_assets").select("id, public_url"),
  ]);

  assertNoError(itemsRes.error, "Failed to load library items");

  const mediaById = new Map(
    (mediaRes.data ?? []).map((row) => [row.id, row.public_url]),
  );

  return (itemsRes.data ?? []).map((row) => ({
    id: row.id,
    category: row.category as LibraryCategory,
    title: row.title,
    subtitle: row.subtitle,
    kind: row.kind as EditableLibraryItem["kind"],
    image: row.image_media_id ? (mediaById.get(row.image_media_id) ?? "") : "",
  }));
}

async function loadOptOutSteps(): Promise<OptOutStep[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("opt_out_steps")
    .select("number, title, description, sort_order")
    .order("sort_order");

  assertNoError(error, "Failed to load opt-out steps");

  return (data ?? []).map((row) => ({
    number: row.number,
    title: row.title,
    description: row.description,
  }));
}

async function saveSiteSettings(settings: SiteSettingsDraft): Promise<void> {
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

async function saveNavigationLinks(
  navigation: ContentEditorState["navigation"],
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
  ];

  for (const link of links) {
    if (!link.id) continue;

    const { error } = await supabase
      .from("navigation_links")
      .update({ label: link.label, href: link.href, sort_order: link.sort_order })
      .eq("id", link.id);

    assertNoError(error, `Failed to update navigation link ${link.label}`);
  }
}

async function saveLibraryItems(items: EditableLibraryItem[]): Promise<void> {
  const supabase = createAdminClient();

  for (const [index, item] of items.entries()) {
    const imageMediaId = item.image
      ? await resolveMediaIdByUrl(item.image)
      : null;

    if (item.id) {
      const { error } = await supabase
        .from("library_items")
        .update({
          category: item.category,
          title: item.title,
          subtitle: item.subtitle,
          kind: item.kind,
          image_media_id: imageMediaId,
          sort_order: index,
        })
        .eq("id", item.id);

      assertNoError(error, `Failed to update library item ${item.title}`);
      continue;
    }

    const { error } = await supabase.from("library_items").insert({
      category: item.category,
      title: item.title,
      subtitle: item.subtitle,
      kind: item.kind,
      image_media_id: imageMediaId,
      sort_order: index,
      visible: true,
    });

    assertNoError(error, `Failed to create library item ${item.title}`);
  }
}

async function saveOptOutSteps(steps: OptOutStep[]): Promise<void> {
  const supabase = createAdminClient();
  const { data: existing, error: selectError } = await supabase
    .from("opt_out_steps")
    .select("id, sort_order")
    .order("sort_order");

  assertNoError(selectError, "Failed to load opt-out steps");

  for (const [index, step] of steps.entries()) {
    const row = existing?.[index];
    if (row?.id) {
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
    }
  }
}

export async function fetchContentEditorState(): Promise<ContentEditorState> {
  const supabase = createAdminClient();

  const [
    { published, drafts, hasDrafts },
    research,
    expertQuotes,
    timeline,
    softwareReviews,
    academicDatasets,
    siteSettings,
    navigation,
    libraryItems,
    optOutSteps,
    versionRes,
    chartMediaRes,
  ] = await Promise.all([
    loadDraftSections(),
    loadResearch(),
    loadExpertQuotes(),
    loadTimeline(),
    loadSoftwareReviews(),
    loadAcademicDatasetsForEditor(),
    loadSiteSettings(),
    loadNavigationLinks(),
    loadLibraryItems(),
    loadOptOutSteps(),
    supabase
      .from("content_versions")
      .select("version, published_at")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("media_assets")
      .select("public_url")
      .eq("storage_path", "site-media/charts/mental-health.png")
      .maybeSingle(),
  ]);

  const sections = mergeEditorSections(published, drafts);

  return {
    version: versionRes.data?.version ?? "0.0.0",
    publishedAt: versionRes.data?.published_at ?? new Date(0).toISOString(),
    hasDrafts,
    sections,
    research: mergeResearchWithFallback(research),
    expertQuotes: expertQuotes ?? [],
    timeline: timeline ?? [],
    mentalHealthChartImage: chartMediaRes.data?.public_url ?? "",
    softwareReviews,
    academicDatasets,
    siteSettings,
    navigation,
    libraryItems,
    optOutSteps,
  };
}

async function upsertSectionContent(
  sectionKey: SectionKey,
  content: SectionDraft,
  page: string,
) {
  const supabase = createAdminClient();
  const { data: existing, error: selectError } = await supabase
    .from("content_sections")
    .select("id")
    .eq("section_key", sectionKey)
    .maybeSingle();

  assertNoError(selectError, `Failed to load section ${sectionKey}`);

  if (existing?.id) {
    const { error } = await supabase
      .from("content_sections")
      .update({ content, page, status: "published" })
      .eq("id", existing.id);

    assertNoError(error, `Failed to update section ${sectionKey}`);
    return;
  }

  const { error } = await supabase.from("content_sections").insert({
    section_key: sectionKey,
    content,
    status: "published",
    page,
    section_type: "copy",
  });

  assertNoError(error, `Failed to create section ${sectionKey}`);
}

async function saveResearchDraft(research: ResearchChartsData) {
  const supabase = createAdminClient();
  const { data: existing, error: selectError } = await supabase
    .from("research_datasets")
    .select("id")
    .eq("key", "main")
    .maybeSingle();

  assertNoError(selectError, "Failed to load research dataset");

  if (existing?.id) {
    const { error } = await supabase
      .from("research_datasets")
      .update({ data: research })
      .eq("id", existing.id);

    assertNoError(error, "Failed to update research dataset");
    return;
  }

  const { error } = await supabase.from("research_datasets").insert({
    key: "main",
    data: research,
  });

  assertNoError(error, "Failed to create research dataset");
}

export async function applyContentDraft(
  payload: ContentSavePayload,
): Promise<void> {
  const editorSection = getEditorSection(payload.sectionId);
  if (!editorSection) {
    if (payload.sectionId.startsWith("research_")) {
      await saveResearchSectionContent(payload.content);
      return;
    }
    throw new Error(`Unknown section "${payload.sectionId}".`);
  }

  if (editorSection.sectionKey) {
    const content = { ...payload.content };
    delete content.chartImage;

    await upsertSectionContent(
      editorSection.sectionKey,
      content,
      editorSection.page,
    );
  }

  if (payload.expertQuotes) {
    await saveExpertQuotes(payload.expertQuotes);
  }

  if (payload.timeline) {
    await saveTimeline(payload.timeline);
  }

  if (payload.sectionId === "evidence_research") {
    await saveEvidenceResearchBundle(payload.content);
  } else if (
    !editorSection.sectionKey &&
    editorSection.fields.some((field) => field.key.startsWith("research."))
  ) {
    await saveResearchSectionContent(payload.content);
  }

  if (payload.softwareReviews) {
    await saveSoftwareReviews(payload.softwareReviews);
  }

  if (payload.academicDatasets) {
    await saveAcademicDatasets(payload.academicDatasets);
  }

  if (payload.evidenceScores?.length) {
    await saveEvidenceScores(payload.evidenceScores);
  }

  if (payload.siteSettings) {
    await saveSiteSettings(payload.siteSettings);
  }

  if (payload.navigation) {
    await saveNavigationLinks(payload.navigation);
  }

  if (payload.libraryItems) {
    await saveLibraryItems(payload.libraryItems);
  }

  if (payload.optOutSteps) {
    await saveOptOutSteps(payload.optOutSteps);
  }
}

export async function saveAllContentDrafts(
  payloads: ContentSavePayload[],
): Promise<void> {
  await applyPublishBatch(payloads);
}

export async function saveContentDraft(
  payload: ContentSavePayload,
): Promise<ContentEditorState> {
  await applyContentDraft(payload);
  return fetchContentEditorState();
}

export async function publishAllContent(
  userId: string,
  payloads: ContentSavePayload[],
): Promise<ContentEditorState> {
  await saveAllContentDrafts(payloads);
  return publishContent(userId);
}

async function saveExpertQuotes(quotes: ExpertQuote[]) {
  const supabase = createAdminClient();
  const { error: deleteError } = await supabase
    .from("expert_quotes")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  assertNoError(deleteError, "Failed to clear expert quotes");

  if (!quotes.length) return;

  const rows = await Promise.all(
    quotes.map(async (quote, index) => ({
      number: quote.number,
      quote: quote.quote,
      name: quote.name,
      title: quote.title,
      image_media_id: quote.image
        ? await resolveMediaIdByUrl(quote.image)
        : null,
      sort_order: index,
      visible: true,
    })),
  );

  const { error } = await supabase.from("expert_quotes").insert(rows);
  assertNoError(error, "Failed to save expert quotes");
}

async function saveTimeline(slides: TimelineSlide[]) {
  const supabase = createAdminClient();
  const { error: deleteError } = await supabase
    .from("timeline_slides")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  assertNoError(deleteError, "Failed to clear timeline slides");

  if (!slides.length) return;

  const rows = await Promise.all(
    slides.map(async (slide, index) => ({
      era: slide.era,
      number: slide.number,
      title: slide.title,
      body: slide.description,
      image_media_id: slide.image
        ? await resolveMediaIdByUrl(slide.image)
        : null,
      background: slide.background,
      text_color: slide.textColor,
      era_style: slide.eraStyle,
      indent_content: slide.indentContent,
      sort_order: index,
      visible: true,
    })),
  );

  const { error } = await supabase.from("timeline_slides").insert(rows);
  assertNoError(error, "Failed to save timeline slides");
}

export async function publishContent(userId: string): Promise<ContentEditorState> {
  const supabase = createAdminClient();

  const { data: versionRow, error: versionError } = await supabase
    .from("content_versions")
    .select("version")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  assertNoError(versionError, "Failed to load content version");

  const currentVersion = versionRow?.version ?? "1.0.0";
  const nextVersion = bumpVersion(currentVersion);

  const { error: insertError } = await supabase.from("content_versions").insert({
    version: nextVersion,
    published_at: new Date().toISOString(),
    created_by: userId,
  });

  assertNoError(insertError, "Failed to publish content version");

  return fetchContentEditorState();
}

function bumpVersion(version: string): string {
  const cleaned = version.replace(/(-published)+$/g, "");
  const dated = /^(\d{4}-\d{2}-\d{2})-(\d+)$/.exec(cleaned);
  if (dated) {
    return `${dated[1]}-${Number.parseInt(dated[2], 10) + 1}`;
  }

  const parts = cleaned.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length === 3 && parts.every((part) => !Number.isNaN(part))) {
    parts[2] += 1;
    return parts.join(".");
  }

  return `${cleaned}-1`;
}
