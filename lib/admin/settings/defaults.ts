import type {
  SettingsBrand,
  SettingsGeneral,
  SettingsSecurity,
} from "@/lib/admin/settings/types";
import {
  mergeSocialLinks,
  normalizeSocialLinks,
} from "@/lib/site/social-links";

export const DEFAULT_PASSWORD_POLICY: SettingsSecurity["passwordPolicy"] = {
  minLength: true,
  requireUppercase: true,
  requireNumber: true,
  requireSpecial: false,
};

const EMPTY_BRAND: SettingsBrand = {
  logoLight: "",
  logoDark: "",
};

function omitUndefined<T extends Record<string, unknown>>(
  partial: Partial<T>,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(partial).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

function mergeBrand(value: unknown, partial?: Partial<SettingsBrand>): SettingsBrand {
  const record = asRecord(value);
  const legacyLogo = typeof record.logo === "string" ? record.logo : "";

  return {
    logoLight:
      partial?.logoLight ??
      (typeof record.logoLight === "string" ? record.logoLight : legacyLogo),
    logoDark:
      partial?.logoDark ??
      (typeof record.logoDark === "string" ? record.logoDark : legacyLogo),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function mergeStoredGeneral(
  existing: Record<string, unknown>,
  partial?: Partial<SettingsGeneral>,
): SettingsGeneral {
  const strings = Object.fromEntries(
    Object.entries(existing).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  ) as Partial<SettingsGeneral>;

  const merged = defaultGeneral({
    ...strings,
    ...omitUndefined(partial ?? {}),
    brand: mergeBrand(existing.brand, partial?.brand),
    socialLinks: mergeSocialLinks(existing.socialLinks, partial?.socialLinks),
  });

  if (!merged.metaTitle?.trim()) {
    merged.metaTitle = merged.siteName;
  }

  if (!merged.metaDescription?.trim() && merged.description) {
    merged.metaDescription = merged.description;
  }

  return merged;
}

export function defaultGeneral(partial?: Partial<SettingsGeneral>): SettingsGeneral {
  return {
    siteName: "Pencils Before Pixels",
    metaTitle:
      "Pencils Before Pixels — Evidence-based resources for parents",
    metaDescription:
      "Evidence-based resources helping parents understand learning in today's classrooms.",
    footerTagline: "Independent research for informed parents.",
    copyright: "© 2026 Pencils Before Pixels. All rights reserved.",
    faviconUrl: "",
    brand: { ...EMPTY_BRAND, ...partial?.brand },
    description:
      "Evidence-based resources helping parents understand learning in today's classrooms.",
    privacyPolicyUrl: "/privacy",
    termsOfServiceUrl: "/terms",
    socialLinks: normalizeSocialLinks(partial?.socialLinks, {
      useDefaultsWhenMissing: partial?.socialLinks === undefined,
    }),
    ...omitUndefined(partial ?? {}),
  };
}
