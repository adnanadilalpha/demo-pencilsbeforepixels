import "server-only";

import {
  DEFAULT_PASSWORD_POLICY,
  mergeStoredGeneral,
} from "@/lib/admin/settings/defaults";
import {
  buildMediaPathMap,
  hydrateSettingsBrand,
} from "@/lib/admin/settings/brand-media";
import type {
  SettingsBrand,
  SettingsGeneral,
  SettingsPageData,
  SettingsSecurity,
} from "@/lib/admin/settings/types";
import { createAdminClient } from "@/lib/supabase/admin";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function mergeBrandRecord(value: unknown): Partial<SettingsBrand> | undefined {
  const record = asRecord(value);
  const brand: Partial<SettingsBrand> = {};

  for (const key of [
    "logoMark",
    "logoWordmark",
    "logoMarkFooter",
    "logoWordmarkFooter",
    "divider",
  ] as const) {
    if (typeof record[key] === "string") {
      brand[key] = record[key];
    }
  }

  return Object.keys(brand).length ? brand : undefined;
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

export async function saveSettingsPageData(payload: SettingsPageData) {
  const supabase = createAdminClient();
  const general = {
    ...payload.general,
    description:
      payload.general.metaDescription.trim() || payload.general.description,
  };
  const rows = [
    { key: "general", value: general },
    { key: "security", value: payload.security },
  ];

  const { error } = await supabase.from("site_settings").upsert(rows, {
    onConflict: "key",
  });

  if (error) {
    throw new Error(error.message);
  }
}
