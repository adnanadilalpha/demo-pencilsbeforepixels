import "server-only";

import { LOCAL_FAVICONS } from "@/lib/brand/favicon";
import { mergeResearchWithFallback } from "@/lib/research/merge";
import { hydrateSettingsBrand, resolveBrandForSiteContent } from "@/lib/admin/settings/brand-media";
import { mergeStoredGeneral } from "@/lib/admin/settings/defaults";
import type { ResearchChartsData } from "@/lib/research/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeYouTubeUrl } from "@/lib/youtube";
import { resolvePublicLibraryCategories } from "@/lib/cms/fallback-data";
import {
  inferLibraryFileKind,
  fileNameFromUrl,
} from "@/lib/cms/library-file";
import { buildFallbackSiteContent } from "./fallback";
import { normalizeGoalSectionContent } from "./goal-section-content";
import { normalizeResearchLibraryCategories } from "./research-library-content";
import { resolveResearchPageCta } from "./site-ctas";
import { navLinks as defaultNavLinks } from "./fallback-data";
import {
  normalizePublicNavLinks,
} from "./navigation";
import {
  createMissionTimelineSlides,
  normalizeMissionTimeline,
} from "./mission-slides";
import { resolvePrivacyPolicyUrl, resolveTermsOfServiceUrl } from "./settings-urls";
import type {
  ExpertQuote,
  LibraryCategory,
  LibraryItem,
  NavLink,
  OptOutStep,
  SectionKey,
  SiteContent,
  SoftwareReview,
  TimelineSlide,
} from "./types";

function resolveHeaderNav(links: NavLink[]): NavLink[] {
  const base = links.length > 0 ? links : defaultNavLinks.map((link) => ({ ...link }));
  return normalizePublicNavLinks(base, "header");
}

function resolveFooterNav(links: NavLink[]): NavLink[] {
  const fallback = buildFallbackSiteContent().navigation.footer;
  const base = links.length > 0 ? links : fallback.map((link) => ({ ...link }));
  return normalizePublicNavLinks(base, "footer");
}

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

  sections["homepage.goal"] = normalizeGoalSectionContent(
    sections["homepage.goal"],
  );

  if (sections["homepage.research_library"]) {
    sections["homepage.research_library"] = {
      ...sections["homepage.research_library"],
      categories: normalizeResearchLibraryCategories(
        sections["homepage.research_library"].categories,
      ),
    };
  }

  if (sections["homepage.mental_health"]) {
    const mentalHealth = sections["homepage.mental_health"];
    sections["homepage.mental_health"] = {
      ...mentalHealth,
      cta: resolveResearchPageCta(
        mentalHealth.cta as { label?: string; href?: string } | undefined,
      ),
    };
  }

  const mentalHealthSection = sections["homepage.mental_health"] ?? {};
  const researchLibrarySection = sections["homepage.research_library"] ?? {};

  const settingsMap = new Map<string, unknown>();
  for (const row of settingsRes.data ?? []) {
    settingsMap.set(row.key, row.value);
  }

  const headerNav = resolveHeaderNav(
    navRes.data
      ?.filter((l) => l.location === "header")
      .map((l) => ({ label: l.label, href: l.href })) ?? [],
  );
  const footerNav = resolveFooterNav(
    navRes.data
      ?.filter((l) => l.location === "footer")
      .map((l) => ({ label: l.label, href: l.href })) ?? [],
  );

  const expertQuotes: ExpertQuote[] = (quotesRes.data ?? []).map((q) => ({
    number: q.number,
    quote: q.quote,
    name: q.name,
    title: q.title,
    image: mediaUrl(mediaById, q.image_media_id),
  }));

  const rawTimeline: TimelineSlide[] = (timelineRes.data ?? []).map((s) => ({
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
  const timeline = normalizeMissionTimeline(
    rawTimeline.length > 0 ? rawTimeline : createMissionTimelineSlides(),
  );

  const libraryCategories: LibraryCategory[] = resolvePublicLibraryCategories(
    researchLibrarySection.categories as LibraryCategory[] | undefined,
  );
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
      viewUrl:
        kind === "book" && item.external_url ? item.external_url : undefined,
      youtubeUrl:
        kind === "video" && item.external_url
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

  const fallbackReviews = buildFallbackSiteContent().softwareReviews;
  softwareReviews.epic.audioSrc ??= fallbackReviews.epic.audioSrc;
  softwareReviews.epic.audioTitle ??= fallbackReviews.epic.audioTitle;
  softwareReviews.epic.audioDescription ??= fallbackReviews.epic.audioDescription;

  const learningAppsSection = sections["homepage.learning_apps"];
  if (learningAppsSection) {
    if (
      typeof learningAppsSection.audioTitle === "string" &&
      learningAppsSection.audioTitle
    ) {
      softwareReviews.epic.audioTitle = learningAppsSection.audioTitle;
    }
    if (typeof learningAppsSection.audioDescription === "string") {
      softwareReviews.epic.audioDescription = learningAppsSection.audioDescription;
    }
    if (
      typeof learningAppsSection.audioSrc === "string" &&
      learningAppsSection.audioSrc
    ) {
      softwareReviews.epic.audioSrc = learningAppsSection.audioSrc;
    }
  }

  const researchRow = researchRes.data?.[0];
  const research = researchRow?.data as ResearchChartsData | undefined;

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
    optOutSteps,
    softwareReviews,
    research: mergeResearchWithFallback(research),
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
