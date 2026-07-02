import "server-only";

import type { SettingsBrand, SettingsGeneral } from "@/lib/admin/settings/types";
import { defaultGeneral } from "@/lib/admin/settings/defaults";

export const BRAND_ASSET_PATHS = {
  logoMark: "site-media/brand/logo-mark.svg",
  logoWordmark: "site-media/brand/logo-wordmark.svg",
  logoMarkFooter: "site-media/brand/logo-mark-footer.svg",
  logoWordmarkFooter: "site-media/brand/logo-wordmark-footer.svg",
  divider: "site-media/brand/divider.svg",
} as const;

const LOCAL_BRAND_FALLBACKS: Record<keyof typeof BRAND_ASSET_PATHS, string> = {
  logoMark: "/images/brand/logo-mark.svg",
  logoWordmark: "/images/brand/logo-wordmark.svg",
  logoMarkFooter: "/images/brand/logo-mark-footer.svg",
  logoWordmarkFooter: "/images/brand/logo-wordmark-footer.svg",
  divider: "/images/brand/divider.svg",
};

const FAVICON_LOCAL_FALLBACK = "/images/brand/Favicon_RichBlack.svg";

const FAVICON_PATH_CANDIDATES = [
  "site-media/brand/favicon-admin",
  "site-media/brand/Favicon_RichBlack.svg",
  "site-media/brand/Favicon_RichWhite.svg",
] as const;

export function buildMediaPathMap(
  rows: Array<{ storage_path: string; public_url: string }>,
): Map<string, string> {
  return new Map(rows.map((row) => [row.storage_path, row.public_url]));
}

export function resolveBrandAssetUrl(
  mediaByPath: Map<string, string>,
  candidates: readonly string[],
  explicit?: string,
): string {
  const trimmed = explicit?.trim();
  if (trimmed) return trimmed;

  for (const candidate of candidates) {
    const exact = mediaByPath.get(candidate);
    if (exact) return exact;

    for (const [path, url] of mediaByPath) {
      if (path.startsWith(`${candidate}.`) || path.startsWith(`${candidate}/`)) {
        return url;
      }
    }
  }

  return "";
}

function resolveBrandField(
  mediaByPath: Map<string, string>,
  field: keyof typeof BRAND_ASSET_PATHS,
  explicit?: string,
): string {
  const path = BRAND_ASSET_PATHS[field];
  return (
    resolveBrandAssetUrl(mediaByPath, [path], explicit) ||
    LOCAL_BRAND_FALLBACKS[field]
  );
}

export function hydrateSettingsBrand(
  general: Partial<SettingsGeneral>,
  mediaByPath: Map<string, string>,
): SettingsGeneral {
  const base = defaultGeneral(general);

  return {
    ...base,
    brand: {
      logoMark: resolveBrandField(
        mediaByPath,
        "logoMark",
        base.brand.logoMark,
      ),
      logoWordmark: resolveBrandField(
        mediaByPath,
        "logoWordmark",
        base.brand.logoWordmark,
      ),
      logoMarkFooter: resolveBrandField(
        mediaByPath,
        "logoMarkFooter",
        base.brand.logoMarkFooter,
      ),
      logoWordmarkFooter: resolveBrandField(
        mediaByPath,
        "logoWordmarkFooter",
        base.brand.logoWordmarkFooter,
      ),
      divider: resolveBrandField(mediaByPath, "divider", base.brand.divider),
    },
    faviconUrl:
      resolveBrandAssetUrl(
        mediaByPath,
        FAVICON_PATH_CANDIDATES,
        base.faviconUrl,
      ) || FAVICON_LOCAL_FALLBACK,
  };
}

export function resolveBrandForSiteContent(
  mediaByPath: Map<string, string>,
  brand?: Partial<SettingsBrand>,
) {
  const fallback = (path: string) =>
    mediaByPath.get(path) ?? `/images/${path.replace(/^site-media\//, "")}`;

  return {
    logoMark: brand?.logoMark?.trim() || fallback(BRAND_ASSET_PATHS.logoMark),
    logoWordmark:
      brand?.logoWordmark?.trim() || fallback(BRAND_ASSET_PATHS.logoWordmark),
    logoMarkFooter:
      brand?.logoMarkFooter?.trim() ||
      fallback(BRAND_ASSET_PATHS.logoMarkFooter),
    logoWordmarkFooter:
      brand?.logoWordmarkFooter?.trim() ||
      fallback(BRAND_ASSET_PATHS.logoWordmarkFooter),
    divider: brand?.divider?.trim() || fallback(BRAND_ASSET_PATHS.divider),
  };
}
