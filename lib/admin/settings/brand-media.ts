import "server-only";

import {
  publicUrlToStoragePath,
  stripUrlCacheBuster,
} from "@/lib/admin/media-paths";
import type { SettingsBrand, SettingsGeneral } from "@/lib/admin/settings/types";
import { defaultGeneral } from "@/lib/admin/settings/defaults";

export const BRAND_LOGO_LIGHT_PATH = "site-media/brand/logo-light.svg";
export const BRAND_LOGO_DARK_PATH = "site-media/brand/logo-dark.svg";

export const BRAND_LOGO_LIGHT_PATHS = [
  "site-media/brand/logo-light.svg",
  "site-media/brand/logo-light.png",
  "site-media/brand/logo-light.webp",
] as const;

export const BRAND_LOGO_DARK_PATHS = [
  "site-media/brand/logo-dark.svg",
  "site-media/brand/logo-dark.png",
  "site-media/brand/logo-dark.webp",
] as const;

export const BRAND_LOGO_LIGHT_FALLBACK = "/images/brand/logo-light.svg";
export const BRAND_LOGO_DARK_FALLBACK = "/images/brand/logo-dark.svg";

const FAVICON_LOCAL_FALLBACK = "/images/brand/Favicon_RichBlack.svg";

const FAVICON_PATH_CANDIDATES = [
  "site-media/brand/favicon-admin",
  "site-media/brand/Favicon_RichBlack.svg",
  "site-media/brand/Favicon_RichWhite.svg",
] as const;

function isBundledBrandAssetUrl(url: string): boolean {
  return url.startsWith("/images/brand/");
}

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
  const trimmed = stripUrlCacheBuster(explicit?.trim() ?? "");

  if (trimmed && !isBundledBrandAssetUrl(trimmed)) {
    return trimmed;
  }

  for (const candidate of candidates) {
    const exact = mediaByPath.get(candidate);
    if (exact) return exact;

    const candidatePrefix = candidate.replace(/\.[^.]+$/, "");
    for (const [path, url] of mediaByPath) {
      if (
        path === candidate ||
        path.startsWith(`${candidatePrefix}.`) ||
        path.startsWith(`${candidatePrefix}/`)
      ) {
        return url;
      }
    }
  }

  return "";
}

function resolveLogoLightUrl(
  mediaByPath: Map<string, string>,
  explicit?: string,
): string {
  return (
    resolveBrandAssetUrl(mediaByPath, BRAND_LOGO_LIGHT_PATHS, explicit) ||
    BRAND_LOGO_LIGHT_FALLBACK
  );
}

function resolveLogoDarkUrl(
  mediaByPath: Map<string, string>,
  explicit?: string,
): string {
  return (
    resolveBrandAssetUrl(mediaByPath, BRAND_LOGO_DARK_PATHS, explicit) ||
    BRAND_LOGO_DARK_FALLBACK
  );
}

export function brandForStorage(brand: SettingsBrand): SettingsBrand {
  return {
    logoLight: sanitizeBrandLogoForStorage(brand.logoLight, "light"),
    logoDark: sanitizeBrandLogoForStorage(brand.logoDark, "dark"),
  };
}

function sanitizeBrandLogoForStorage(
  url: string,
  slot: "light" | "dark",
): string {
  const trimmed = stripUrlCacheBuster(url.trim());
  if (!trimmed || isBundledBrandAssetUrl(trimmed)) return "";

  const storagePath = publicUrlToStoragePath(trimmed);
  if (!storagePath) return trimmed;

  const slotPrefix =
    slot === "light" ? "site-media/brand/logo-light" : "site-media/brand/logo-dark";

  if (!storagePath.startsWith(slotPrefix)) {
    return trimmed;
  }

  return trimmed;
}

export function hydrateSettingsBrand(
  general: Partial<SettingsGeneral>,
  mediaByPath: Map<string, string>,
): SettingsGeneral {
  const base = defaultGeneral(general);
  const storedBrand = brandForStorage(base.brand);

  return {
    ...base,
    brand: {
      logoLight: resolveLogoLightUrl(mediaByPath, storedBrand.logoLight),
      logoDark: resolveLogoDarkUrl(mediaByPath, storedBrand.logoDark),
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
  const storedBrand = brandForStorage({
    logoLight: brand?.logoLight ?? "",
    logoDark: brand?.logoDark ?? "",
  });

  return {
    logoLight: resolveLogoLightUrl(mediaByPath, storedBrand.logoLight),
    logoDark: resolveLogoDarkUrl(mediaByPath, storedBrand.logoDark),
  };
}
