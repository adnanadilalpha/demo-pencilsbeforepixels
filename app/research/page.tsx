import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { ResearchPage } from "@/components/research/ResearchPage";
import { sectionPaddingX } from "@/components/ui/Container";
import { getSiteContent } from "@/lib/cms/cached";
import { buildFallbackSiteContent } from "@/lib/cms/fallback";
import { stripRichTextToPlain } from "@/lib/cms/rich-text";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

const FALLBACK = buildFallbackSiteContent().sections["evidence.research_tab"] ?? {};

function readSectionText(
  section: Record<string, unknown> | undefined,
  key: string,
  fallback: string,
): string {
  const value = section?.[key];
  return typeof value === "string" && value.trim()
    ? stripRichTextToPlain(value)
    : fallback;
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const section = content.sections["evidence.research_tab"] ?? {};
  const title = readSectionText(section, "title", String(FALLBACK.title ?? "Research"));
  const description = readSectionText(
    section,
    "subtitle",
    String(
      FALLBACK.subtitle ??
        "Research on screen time, classroom devices, and student achievement from NAEP, PISA, TIMSS, PIRLS, and peer-reviewed studies.",
    ),
  );

  return buildPageMetadata({
    title,
    description,
    path: "/research",
  });
}

export default async function ResearchRoutePage() {
  const content = await getSiteContent();
  const section = content.sections["evidence.research_tab"] ?? {};
  const siteName = content.settings.siteName?.trim() || "Pencils Before Pixels";
  const title = readSectionText(section, "title", String(FALLBACK.title ?? "Research"));
  const description = readSectionText(
    section,
    "subtitle",
    String(FALLBACK.subtitle ?? ""),
  );

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-paper-50">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            name: title,
            description,
            path: "/research",
          }),
          buildArticleJsonLd({
            headline: title,
            description,
            path: "/research",
            siteName,
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: title, path: "/research" },
          ]),
        ]}
      />
      <Header />
      <main className="flex-1 overflow-x-clip bg-paper-50 pt-(--header-height)">
        <ResearchPage />
      </main>
      <Footer paddingX={sectionPaddingX} />
    </div>
  );
}
