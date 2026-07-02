import "server-only";

import { LOCAL_FAVICONS } from "@/lib/brand/favicon";
import type { AcademicDataset } from "@/lib/academic-data/types";
import { mergeResearchWithFallback } from "@/lib/admin/research-persistence";
import { hydrateSettingsBrand, resolveBrandForSiteContent } from "@/lib/admin/settings/brand-media";
import { mergeStoredGeneral } from "@/lib/admin/settings/defaults";
import type { ResearchChartsData } from "@/lib/research/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeYouTubeUrl } from "@/lib/youtube";
import {
  inferLibraryFileKind,
  fileNameFromUrl,
} from "@/lib/cms/library-file";
import { buildFallbackSiteContent } from "./fallback";
import { resolvePrivacyPolicyUrl, resolveTermsOfServiceUrl } from "./settings-urls";
import type {
  ExpertQuote,
  LibraryCategory,
  LibraryItem,
  OptOutStep,
  SectionKey,
  SiteContent,
  SoftwareReview,
  TimelineSlide,
} from "./types";

type MediaRow = {
  id: string;
  storage_path: string;
  public_url: string;
  mime_type: string | null;
  title: string | null;
};

function mediaUrl(
  map: Map<string, string>,
  id: string | null | undefined,
  fallback = "",
): string {
  if (!id) return fallback;
  return map.get(id) ?? fallback;
}

function buildMediaAssets(
  map: Map<string, string>,
  brand?: {
    logoMark?: string;
    logoWordmark?: string;
    logoMarkFooter?: string;
    logoWordmarkFooter?: string;
    divider?: string;
  },
) {
  const brandAssets = resolveBrandForSiteContent(map, brand);
  const url = (path: string) =>
    map.get(path) ?? `/images/${path.replace(/^site-media\//, "")}`;

  return {
    hero: { background: url("site-media/hero/child-writing.jpg") },
    brand: {
      ...brandAssets,
      faviconRichBlack: LOCAL_FAVICONS.richBlack,
      faviconRichWhite: LOCAL_FAVICONS.richWhite,
    },
    icons: {
      arrowRightLight: url("site-media/icons/arrow-right-light.svg"),
      arrowRightDark: url("site-media/icons/arrow-right-dark.svg"),
      play: url("site-media/icons/play.svg"),
    },
    charts: {
      mentalHealth: url("site-media/charts/mental-health.png"),
    },
    optOut: {
      letterPreview: url("site-media/opt-out/letter.png"),
    },
  };
}

async function fetchSiteContentFromDb(): Promise<SiteContent | null> {
  const supabase = createAdminClient();

  const [
    versionRes,
    sectionsRes,
    mediaRes,
    navRes,
    quotesRes,
    timelineRes,
    libraryRes,
    optOutRes,
    softwareRes,
    researchRes,
    academicRes,
    insightsRes,
    settingsRes,
  ] = await Promise.all([
    supabase
      .from("content_versions")
      .select("version, published_at")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("content_sections")
      .select("section_key, content")
      .eq("status", "published"),
    supabase.from("media_assets").select("id, storage_path, public_url, mime_type, title"),
    supabase
      .from("navigation_links")
      .select("location, label, href, sort_order")
      .eq("visible", true)
      .order("sort_order"),
    supabase
      .from("expert_quotes")
      .select("number, quote, name, title, image_media_id, sort_order")
      .eq("visible", true)
      .order("sort_order"),
    supabase
      .from("timeline_slides")
      .select(
        "era, number, title, body, image_media_id, background, text_color, era_style, indent_content, sort_order",
      )
      .eq("visible", true)
      .order("sort_order"),
    supabase
      .from("library_items")
      .select(
        "category, title, subtitle, kind, image_media_id, file_media_id, external_url, video_media_id, sort_order",
      )
      .eq("visible", true)
      .order("sort_order"),
    supabase
      .from("opt_out_steps")
      .select("number, title, description, sort_order")
      .eq("visible", true)
      .order("sort_order"),
    supabase
      .from("software_reviews")
      .select(
        "slug, title, summary, youtube_id, vendor_research, independent_research, references_note",
      )
      .eq("visible", true),
    supabase.from("research_datasets").select("key, data").eq("key", "main"),
    supabase
      .from("academic_datasets")
      .select("key, label, title, charts, description, sort_order")
      .order("sort_order"),
    supabase
      .from("academic_dataset_insights")
      .select("dataset_key, sort_order, text, emphasis")
      .order("sort_order"),
    supabase.from("site_settings").select("key, value"),
  ]);

  if (!versionRes.data || sectionsRes.error) {
    return null;
  }

  const mediaById = new Map<string, string>();
  const mediaMetaById = new Map<
    string,
    { mimeType: string | null; title: string | null }
  >();
  const mediaByPath = new Map<string, string>();
  for (const row of (mediaRes.data ?? []) as MediaRow[]) {
    mediaById.set(row.id, row.public_url);
    mediaMetaById.set(row.id, {
      mimeType: row.mime_type,
      title: row.title,
    });
    mediaByPath.set(row.storage_path, row.public_url);
  }

  const sections: Partial<Record<SectionKey, Record<string, unknown>>> = {};
  for (const row of sectionsRes.data ?? []) {
    sections[row.section_key as SectionKey] = row.content as Record<
      string,
      unknown
    >;
  }

  const mentalHealthSection = sections["homepage.mental_health"] ?? {};
  const academicDataSection = sections["homepage.academic_data"] ?? {};
  const researchLibrarySection = sections["homepage.research_library"] ?? {};

  const settingsMap = new Map<string, unknown>();
  for (const row of settingsRes.data ?? []) {
    settingsMap.set(row.key, row.value);
  }

  const headerNav =
    navRes.data
      ?.filter((l) => l.location === "header")
      .map((l) => ({ label: l.label, href: l.href })) ?? [];
  const footerNav =
    navRes.data
      ?.filter((l) => l.location === "footer")
      .map((l) => ({ label: l.label, href: l.href })) ?? [];

  const expertQuotes: ExpertQuote[] = (quotesRes.data ?? []).map((q) => ({
    number: q.number,
    quote: q.quote,
    name: q.name,
    title: q.title,
    image: mediaUrl(mediaById, q.image_media_id),
  }));

  const timeline: TimelineSlide[] = (timelineRes.data ?? []).map((s) => ({
    era: s.era,
    number: s.number,
    title: s.title,
    description: s.body,
    image: mediaUrl(mediaById, s.image_media_id),
    background: s.background,
    textColor: s.text_color as "light" | "dark",
    eraStyle: s.era_style as "large" | "compact",
    indentContent: s.indent_content,
  }));

  const libraryCategories: LibraryCategory[] =
    (researchLibrarySection.categories as LibraryCategory[] | undefined)?.length
      ? (researchLibrarySection.categories as LibraryCategory[])
      : ["Books", "Research Papers", "Videos", "Parent Resources"];
  const libraryContent: Record<LibraryCategory, LibraryItem[]> = {
    Books: [],
    "Research Papers": [],
    Videos: [],
    "Parent Resources": [],
  };
  for (const item of libraryRes.data ?? []) {
    const cat = item.category as LibraryCategory;
    if (!libraryContent[cat]) continue;

    const kind = item.kind as LibraryItem["kind"];
    const fileMediaId = item.file_media_id ?? item.image_media_id;
    const fileMeta = fileMediaId ? mediaMetaById.get(fileMediaId) : null;
    const fileUrl = fileMediaId ? mediaUrl(mediaById, fileMediaId) : undefined;
    const resolvedFileUrl = fileUrl || undefined;

    libraryContent[cat].push({
      title: item.title,
      subtitle: item.subtitle,
      kind,
      image:
        kind === "book" && item.image_media_id
          ? mediaUrl(mediaById, item.image_media_id)
          : undefined,
      youtubeUrl: item.external_url
        ? normalizeYouTubeUrl(item.external_url)
        : undefined,
      videoUrl: item.video_media_id
        ? mediaUrl(mediaById, item.video_media_id)
        : undefined,
      fileUrl: kind === "paper" || kind === "resource" ? resolvedFileUrl : undefined,
      fileName:
        kind === "paper" || kind === "resource"
          ? (fileMeta?.title ??
            fileNameFromUrl(resolvedFileUrl) ??
            undefined)
          : undefined,
      fileKind:
        kind === "paper" || kind === "resource"
          ? inferLibraryFileKind(fileMeta?.mimeType, resolvedFileUrl)
          : undefined,
      fileMimeType:
        kind === "paper" || kind === "resource"
          ? (fileMeta?.mimeType ?? undefined)
          : undefined,
    });
  }

  const optOutSteps: OptOutStep[] = (optOutRes.data ?? []).map((s) => ({
    number: s.number,
    title: s.title,
    description: s.description,
  }));

  const softwareReviews: { epic: SoftwareReview; ixl: SoftwareReview } = {
    epic: { slug: "epic", title: "Epic" },
    ixl: { slug: "ixl", title: "IXL Math" },
  };
  for (const review of softwareRes.data ?? []) {
    const mapped: SoftwareReview = {
      slug: review.slug as "epic" | "ixl",
      title: review.title,
      summary: review.summary ?? undefined,
      youtubeId: review.youtube_id
        ? normalizeYouTubeUrl(review.youtube_id)
        : undefined,
      vendorResearch: review.vendor_research as SoftwareReview["vendorResearch"],
      independentResearch:
        review.independent_research as SoftwareReview["independentResearch"],
      referencesNote: review.references_note ?? undefined,
    };
    if (review.slug === "epic") softwareReviews.epic = mapped;
    if (review.slug === "ixl") softwareReviews.ixl = mapped;
  }

  const researchRow = researchRes.data?.[0];
  const research = researchRow?.data as ResearchChartsData | undefined;

  const insightsByKey = new Map<
    string,
    { text: string; emphasis?: "white" | "gold" }[]
  >();
  for (const row of insightsRes.data ?? []) {
    const list = insightsByKey.get(row.dataset_key) ?? [];
    list.push({
      text: row.text,
      emphasis: (row.emphasis as "white" | "gold" | null) ?? undefined,
    });
    insightsByKey.set(row.dataset_key, list);
  }

  const academicStatic: AcademicDataset[] = (academicRes.data ?? []).map(
    (row) => ({
      id: row.key,
      label: row.label,
      title: row.title,
      charts: row.charts as AcademicDataset["charts"],
      description: row.description,
      insight: insightsByKey.get(row.key) ?? [],
    }),
  );

  const settingsRecord = (settingsMap.get("general") ?? {}) as Record<
    string,
    unknown
  >;
  const mergedSettings = mergeStoredGeneral(settingsRecord);
  const hydratedSettings = hydrateSettingsBrand(mergedSettings, mediaByPath);
  const media = buildMediaAssets(mediaByPath, hydratedSettings.brand);

  return {
    version: versionRes.data.version,
    publishedAt: versionRes.data.published_at,
    settings: {
      siteName: hydratedSettings.siteName ?? "Pencils Before Pixels",
      description:
        hydratedSettings.description ??
        "Evidence-based resources helping parents understand learning in today's classrooms.",
      metaTitle:
        hydratedSettings.metaTitle ??
        hydratedSettings.siteName ??
        "Pencils Before Pixels",
      metaDescription:
        hydratedSettings.metaDescription ??
        hydratedSettings.description ??
        "Evidence-based resources helping parents understand learning in today's classrooms.",
      footerTagline: hydratedSettings.footerTagline ?? "",
      faviconUrl: hydratedSettings.faviconUrl ?? "",
      privacyPolicyUrl: resolvePrivacyPolicyUrl(
        hydratedSettings.privacyPolicyUrl,
      ),
      termsOfServiceUrl: resolveTermsOfServiceUrl(
        hydratedSettings.termsOfServiceUrl,
      ),
      copyright:
        hydratedSettings.copyright ??
        "© 2026 Pencils Before Pixels. A Research-Driven Editorial for District 66 Parents.",
    },
    media,
    navigation: { header: headerNav, footer: footerNav },
    sections,
    expertQuotes,
    timeline,
    libraryCategories,
    libraryContent,
    mentalHealthPoints:
      (mentalHealthSection.points as string[]) ?? buildFallbackSiteContent().mentalHealthPoints,
    mentalHealthLegend:
      (mentalHealthSection.legend as SiteContent["mentalHealthLegend"]) ??
      buildFallbackSiteContent().mentalHealthLegend,
    academicDatasets: (academicDataSection.datasets as string[]) ?? [
        "Worldwide Data (PISA)",
        "USA Grade 4 NAEP",
        "USA Grade 8 NAEP",
        "Nebraska Mathematics",
        "Nebraska Mathematics by Gender",
        "Westside Mathematics by Gender",
        "Nebraska English",
        "State & Federal Testing",
      ],
    optOutSteps,
    softwareReviews,
    research: mergeResearchWithFallback(research),
    academicStatic:
      academicStatic.length > 0
        ? academicStatic
        : buildFallbackSiteContent().academicStatic,
  };
}

export async function getSiteContentUncached(): Promise<SiteContent> {
  try {
    const fromDb = await fetchSiteContentFromDb();
    if (fromDb) return fromDb;
  } catch (error) {
    console.error("CMS fetch failed, using fallback:", error);
  }
  return buildFallbackSiteContent();
}

export async function getContentVersionUncached(): Promise<{
  version: string;
  publishedAt: string;
}> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("content_versions")
      .select("version, published_at")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      return { version: data.version, publishedAt: data.published_at };
    }
  } catch (error) {
    console.error("CMS version fetch failed:", error);
  }

  const fallback = buildFallbackSiteContent();
  return { version: fallback.version, publishedAt: fallback.publishedAt };
}
