import "server-only";

import {
  DEFAULT_PASSWORD_POLICY,
  mergeStoredGeneral,
} from "@/lib/admin/settings/defaults";
import {
  buildMediaPathMap,
  brandForStorage,
  BRAND_LOGO_DARK_FALLBACK,
  hydrateSettingsBrand,
} from "@/lib/admin/settings/brand-media";
import type {
  SettingsBrand,
  SettingsGeneral,
  SettingsPageData,
  SettingsSecurity,
  SettingsSocialLink,
} from "@/lib/admin/settings/types";
import { normalizeSocialLinks } from "@/lib/site/social-links";
import { mergeSiteCacheSettings } from "@/lib/cache/settings";
import { SITE_CACHE_SETTINGS_KEY } from "@/lib/cache/types";
import { revalidateSiteContent } from "@/lib/cms/revalidate-site-content";
import { createAdminClient } from "@/lib/supabase/admin";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function mergeBrandRecord(value: unknown): Partial<SettingsBrand> | undefined {
  const record = asRecord(value);
  const brand: Partial<SettingsBrand> = {};

  for (const key of ["logoLight", "logoDark", "logo"] as const) {
    const value = record[key];
    if (typeof value !== "string") continue;

    if (key === "logo") {
      brand.logoDark = value;
      if (typeof record.logoLight !== "string") {
        brand.logoLight = value;
      }
    } else {
      brand[key] = value;
    }
  }

  return Object.keys(brand).length ? brand : undefined;
}

function mergeSocialLinksRecord(
  value: unknown,
): SettingsSocialLink[] | undefined {
  if (value === undefined) return undefined;
  return normalizeSocialLinks(value);
}

function mergeGeneral(value: unknown): SettingsGeneral {
  const record = asRecord(value);
  let partial: Partial<SettingsGeneral> = {};

  for (const key of [
    "siteName",
    "description",
    "copyright",
    "privacyPolicyUrl",
    "termsOfServiceUrl",
    "metaTitle",
    "metaDescription",
    "footerTagline",
    "faviconUrl",
  ] as const) {
    const field = record[key];
    if (typeof field === "string") {
      partial[key] = field;
    }
  }

  const brand = mergeBrandRecord(record.brand);
  if (brand) {
    partial = { ...partial, brand: { ...partial.brand, ...brand } as SettingsBrand };
  }

  const socialLinks = mergeSocialLinksRecord(record.socialLinks);
  if (socialLinks !== undefined) {
    partial = { ...partial, socialLinks };
  }

  return mergeStoredGeneral(record, partial);
}

function mergeSecurity(value: unknown): SettingsSecurity {
  const record = asRecord(value);
  const policy = asRecord(record.passwordPolicy);

  return {
    passwordPolicy: {
      minLength: Boolean(policy.minLength ?? DEFAULT_PASSWORD_POLICY.minLength),
      requireUppercase: Boolean(
        policy.requireUppercase ?? DEFAULT_PASSWORD_POLICY.requireUppercase,
      ),
      requireNumber: Boolean(
        policy.requireNumber ?? DEFAULT_PASSWORD_POLICY.requireNumber,
      ),
      requireSpecial: Boolean(
        policy.requireSpecial ?? DEFAULT_PASSWORD_POLICY.requireSpecial,
      ),
    },
  };
}

export async function fetchSettingsPageData(): Promise<SettingsPageData> {
  const supabase = createAdminClient();
  const [{ data, error }, { data: mediaRows, error: mediaError }] =
    await Promise.all([
      supabase.from("site_settings").select("key, value"),
      supabase
        .from("media_assets")
        .select("storage_path, public_url")
        .like("storage_path", "site-media/brand/%"),
    ]);

  if (error) {
    throw new Error(error.message);
  }

  if (mediaError) {
    throw new Error(mediaError.message);
  }

  const map = new Map((data ?? []).map((row) => [row.key, row.value]));
  const mediaByPath = buildMediaPathMap(mediaRows ?? []);

  return {
    general: hydrateSettingsBrand(mergeGeneral(map.get("general")), mediaByPath),
    security: mergeSecurity(map.get("security")),
    cache: mergeSiteCacheSettings(map.get(SITE_CACHE_SETTINGS_KEY)),
  };
}

export async function fetchPasswordPolicySettings() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "security")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return mergeSecurity(data?.value).passwordPolicy;
}

export async function fetchAdminBrandLogoDarkUrl(): Promise<string> {
  try {
    const { general } = await fetchSettingsPageData();
    return general.brand.logoDark.trim() || BRAND_LOGO_DARK_FALLBACK;
  } catch {
    return BRAND_LOGO_DARK_FALLBACK;
  }
}

export async function saveSettingsPageData(payload: SettingsPageData) {
  const supabase = createAdminClient();
  const general = {
    ...payload.general,
    brand: brandForStorage(payload.general.brand),
    description:
      payload.general.metaDescription.trim() || payload.general.description,
  };
  const rows = [
    { key: "general", value: general },
    { key: "security", value: payload.security },
    { key: SITE_CACHE_SETTINGS_KEY, value: payload.cache },
  ];

  const { error } = await supabase.from("site_settings").upsert(rows, {
    onConflict: "key",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidateSiteContent();
}
