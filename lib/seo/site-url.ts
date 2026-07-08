import { LEGAL_CONTACT } from "@/lib/legal/constants";

function normalizeSiteUrl(url: string): string {
  const trimmed = url.trim().replace(/\/$/, "");
  if (!trimmed) return LEGAL_CONTACT.website.replace(/\/$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Canonical production URL for metadata, sitemap, and robots. */
export function getSiteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim();

  if (fromEnv) return normalizeSiteUrl(fromEnv);

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return normalizeSiteUrl(vercel);

  return normalizeSiteUrl(LEGAL_CONTACT.website);
}

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
