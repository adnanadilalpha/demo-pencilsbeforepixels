import type { Metadata } from "next";
import { DEFAULT_KEYWORDS, DEFAULT_OG_IMAGE_PATH, SITE_LOCALE } from "./constants";
import { absoluteUrl, getSiteUrl } from "./site-url";

type BuildPageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function createMetadataBase(): URL {
  return new URL(getSiteUrl());
}

export function buildPageMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE_PATH,
  keywords = [...DEFAULT_KEYWORDS],
  noIndex = false,
}: BuildPageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: SITE_LOCALE,
      url: canonical,
      title,
      description,
      siteName: "Pencils Before Pixels",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

type BuildSiteMetadataOptions = {
  siteName: string;
  title: string;
  description: string;
  favicon?: string;
};

export function buildSiteMetadata({
  siteName,
  title,
  description,
  favicon,
}: BuildSiteMetadataOptions): Metadata {
  const home = buildPageMetadata({
    title,
    description,
    path: "/",
  });

  return {
    ...home,
    metadataBase: createMetadataBase(),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    applicationName: siteName,
    creator: siteName,
    publisher: siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: favicon
      ? {
          icon: [{ url: favicon }],
          apple: [{ url: favicon }],
        }
      : undefined,
    category: "education",
  };
}
