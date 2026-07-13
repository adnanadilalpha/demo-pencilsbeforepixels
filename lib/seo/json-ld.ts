import { LEGAL_CONTACT } from "@/lib/legal/constants";
import { absoluteUrl, getSiteUrl } from "./site-url";

export function buildOrganizationJsonLd(
  siteName: string,
  sameAs: string[] = [],
) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: getSiteUrl(),
    logo: absoluteUrl("/images/brand/logo.png"),
    email: LEGAL_CONTACT.email,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function buildWebSiteJsonLd(siteName: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: getSiteUrl(),
    description,
    inLanguage: "en-US",
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: getSiteUrl(),
    },
  };
}

export function buildWebPageJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: "Pencils Before Pixels",
      url: getSiteUrl(),
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildArticleJsonLd({
  headline,
  description,
  path,
  siteName,
}: {
  headline: string;
  description: string;
  path: string;
  siteName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: absoluteUrl(path),
    inLanguage: "en-US",
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: getSiteUrl(),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/brand/logo.png"),
      },
    },
    mainEntityOfPage: absoluteUrl(path),
  };
}

export function buildDatasetJsonLd({
  name,
  description,
  path,
  siteName,
  licensePath = "/terms",
}: {
  name: string;
  description: string;
  path: string;
  siteName: string;
  /** Path or absolute URL for the dataset license document. */
  licensePath?: string;
}) {
  const licenseUrl = licensePath.startsWith("http")
    ? licensePath
    : absoluteUrl(licensePath);

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "en-US",
    license: licenseUrl,
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: siteName,
      url: getSiteUrl(),
    },
  };
}
