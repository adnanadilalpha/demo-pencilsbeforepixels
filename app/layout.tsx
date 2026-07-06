import type { Metadata, Viewport } from "next";
import { Anton, DM_Sans } from "next/font/google";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { AppProviders } from "@/components/providers/AppProviders";
import { brandLayoutCss } from "@/lib/brand/logo-layout";
import { LOCAL_FAVICONS } from "@/lib/brand/favicon";
import { getSiteContent } from "@/lib/cms/cached";
import "./globals.css";

export const dynamic = "force-dynamic";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const { settings } = content;
  const favicon = settings.faviconUrl?.trim() ?? "";

  return {
    title: settings.metaTitle?.trim() || settings.siteName,
    description: settings.metaDescription?.trim() || settings.description,
    icons: favicon
      ? {
          icon: [{ url: favicon }],
        }
      : undefined,
  };
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

  return (
    <html
      lang="en"
      className={`${anton.variable} ${dmSans.variable} h-full overflow-x-clip antialiased`}
    >
      <head>
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
        <link
          rel="preload"
          href="/fonts/Agustina-Signature.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col overflow-x-clip bg-paper-50">
        <AppProviders initialContent={siteContent}>
          <PageViewTracker />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
