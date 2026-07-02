import "server-only";

import { LOCAL_FAVICONS } from "@/lib/brand/favicon";
import type { AcademicDataset } from "@/lib/academic-data/types";
import type { ResearchChartsData } from "@/lib/research/types";
import { createAdminClient } from "@/lib/supabase/admin";
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
};

function mediaUrl(
  map: Map<string, string>,
  id: string | null | undefined,
  fallback = "",
): string {
  if (!id) return fallback;
  return map.get(id) ?? fallback;
}

function buildMediaAssets(map: Map<string, string>) {
  const url = (path: string) => map.get(path) ?? `/images/${path.replace(/^site-media\//, "")}`;

  return {
    hero: { background: url("site-media/hero/child-writing.jpg") },
    brand: {
      logoMark: url("site-media/brand/logo-mark.svg"),
      logoWordmark: url("site-media/brand/logo-wordmark.svg"),
      logoMarkFooter: url("site-media/brand/logo-mark-footer.svg"),
      logoWordmarkFooter: url("site-media/brand/logo-wordmark-footer.svg"),
      divider: url("site-media/brand/divider.svg"),
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
    supabase.from("media_assets").select("id, storage_path, public_url"),
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
      .select("category, title, subtitle, kind, image_media_id, sort_order")
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
  const mediaByPath = new Map<string, string>();
  for (const row of (mediaRes.data ?? []) as MediaRow[]) {
    mediaById.set(row.id, row.public_url);
    mediaByPath.set(row.storage_path, row.public_url);
  }

  const sections: Partial<Record<SectionKey, Record<string, unknown>>> = {};
  for (const row of sectionsRes.data ?? []) {
    sections[row.section_key as SectionKey] = row.content as Record<
      string,
      unknown
    >;
  }

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

  const libraryCategories: LibraryCategory[] = [
    "Books",
    "Research Papers",
    "Videos",
    "Parent Resources",
  ];
  const libraryContent: Record<LibraryCategory, LibraryItem[]> = {
    Books: [],
    "Research Papers": [],
    Videos: [],
    "Parent Resources": [],
  };
  for (const item of libraryRes.data ?? []) {
    const cat = item.category as LibraryCategory;
    if (!libraryContent[cat]) continue;
    libraryContent[cat].push({
      title: item.title,
      subtitle: item.subtitle,
      kind: item.kind as LibraryItem["kind"],
      image: item.image_media_id
        ? mediaUrl(mediaById, item.image_media_id)
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
      youtubeId: review.youtube_id ?? undefined,
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

  const settingsValue = (settingsMap.get("general") ?? {}) as Record<
    string,
    string
  >;
  const media = buildMediaAssets(mediaByPath);

  const mentalHealthSection = sections["homepage.mental_health"] ?? {};
  const academicDataSection = sections["homepage.academic_data"] ?? {};

  return {
    version: versionRes.data.version,
    publishedAt: versionRes.data.published_at,
    settings: {
      siteName: settingsValue.siteName ?? "Pencils Before Pixels",
      description:
        settingsValue.description ??
        "Evidence-based resources helping parents understand learning in today's classrooms.",
      privacyPolicyUrl: resolvePrivacyPolicyUrl(settingsValue.privacyPolicyUrl),
      termsOfServiceUrl: resolveTermsOfServiceUrl(settingsValue.termsOfServiceUrl),
      copyright:
        settingsValue.copyright ??
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
    research: research ?? buildFallbackSiteContent().research,
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
