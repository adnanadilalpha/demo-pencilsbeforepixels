import type { Metadata, Viewport } from "next";
import { Anton, DM_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { LOCAL_FAVICONS } from "@/lib/brand/favicon";
import { getSiteContent } from "@/lib/cms/cached";
import "./globals.css";

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

  return {
    title: content.settings.siteName,
    description: content.settings.description,
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

  return (
    <html
      lang="en"
      className={`${anton.variable} ${dmSans.variable} h-full overflow-x-clip antialiased`}
    >
      <head>
        <link
          rel="icon"
          href={LOCAL_FAVICONS.richWhite}
          type="image/svg+xml"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body className="flex min-h-full flex-col overflow-x-clip bg-paper-50">
        <AppProviders initialContent={siteContent}>{children}</AppProviders>
      </body>
    </html>
  );
}
