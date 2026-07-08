import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { EvidenceExplorer } from "@/components/evidence/EvidenceExplorer";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageFrame, sectionPaddingX } from "@/components/ui/Container";
import { getSiteContent } from "@/lib/cms/cached";
import { buildFallbackSiteContent } from "@/lib/cms/fallback";
import { stripRichTextToPlain } from "@/lib/cms/rich-text";
import { getEvidenceBootstrap } from "@/lib/evidence/cached";
import {
  buildBreadcrumbJsonLd,
  buildDatasetJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

const FALLBACK = buildFallbackSiteContent().sections["evidence.nebraska"] ?? {};

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
  const section = content.sections["evidence.nebraska"] ?? {};
  const title = "Nebraska Data";
  const description = readSectionText(
    section,
    "subtitle",
    String(
      FALLBACK.subtitle ??
        "Explore Nebraska and Westside Community Schools academic performance trends by district, grade, and student group.",
    ),
  );

  return buildPageMetadata({
    title,
    description,
    path: "/nebraska-data",
  });
}

export default async function EvidencePage() {
  const bootstrap = await getEvidenceBootstrap();
  const content = await getSiteContent();
  const section = content.sections["evidence.nebraska"] ?? {};
  const siteName = content.settings.siteName?.trim() || "Pencils Before Pixels";
  const title = "Nebraska Data";
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
            path: "/nebraska-data",
          }),
          buildDatasetJsonLd({
            name: title,
            description,
            path: "/nebraska-data",
            siteName,
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: title, path: "/nebraska-data" },
          ]),
        ]}
      />
      <Header />
      <main className="flex-1 overflow-x-clip bg-paper-50 pt-(--header-height)">
        <PageFrame paddingX={sectionPaddingX} className="py-8 sm:py-10 lg:py-12">
          <EvidenceExplorer bootstrap={bootstrap} />
        </PageFrame>
      </main>
      <Footer paddingX={sectionPaddingX} />
    </div>
  );
}
