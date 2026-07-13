import type { Metadata, Viewport } from "next";
import { Anton, DM_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { JsonLd } from "@/components/seo/JsonLd";
import { brandLayoutCss } from "@/lib/brand/logo-layout";
import { LOCAL_FAVICONS } from "@/lib/brand/favicon";
import { getSiteContent } from "@/lib/cms/cached";
import { stripRichTextToPlain } from "@/lib/cms/rich-text";
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/json-ld";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import "./globals.css";

/** ISR: public pages revalidate hourly; admin saves call revalidatePath/Tag. */
export const revalidate = 3600;

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const { settings } = content;
  const favicon = settings.faviconUrl?.trim() ?? "";
  const siteName = settings.siteName?.trim() || "Pencils Before Pixels";
  const title = settings.metaTitle?.trim() || siteName;
  const description =
    stripRichTextToPlain(
      settings.metaDescription?.trim() || settings.description || "",
    ) ||
    "Evidence-based resources helping parents understand learning in today's classrooms.";

  return buildSiteMetadata({
    siteName,
    title,
    description,
    favicon: favicon || undefined,
  });
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteContent = await getSiteContent();
  const favicon = siteContent.settings.faviconUrl?.trim() ?? "";
  const siteName = siteContent.settings.siteName?.trim() || "Pencils Before Pixels";
  const description =
    stripRichTextToPlain(
      siteContent.settings.metaDescription?.trim() ||
        siteContent.settings.description ||
        "",
    ) ||
    "Evidence-based resources helping parents understand learning in today's classrooms.";
  const sameAs = siteContent.settings.socialLinks
    .map((link) => link.url.trim())
    .filter(Boolean);

  return (
    <html
      lang="en"
      className={`${anton.variable} ${dmSans.variable} h-full overflow-x-clip antialiased`}
    >
      <head>
        <JsonLd
          data={[
            buildOrganizationJsonLd(siteName, sameAs),
            buildWebSiteJsonLd(siteName, description),
          ]}
        />
        <link
          rel="alternate"
          type="text/plain"
          href="/llms.txt"
          title="LLM site guide"
        />
        <style dangerouslySetInnerHTML={{ __html: brandLayoutCss() }} />
        {favicon ? (
          <link rel="icon" href={favicon} />
        ) : (
          <link
            rel="icon"
            href={LOCAL_FAVICONS.richWhite}
            type="image/svg+xml"
            media="(prefers-color-scheme: dark)"
          />
        )}
      </head>
      <body className="flex min-h-full flex-col overflow-x-clip bg-paper-50">
        <AppProviders initialContent={siteContent}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
