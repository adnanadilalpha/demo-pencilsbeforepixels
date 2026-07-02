import type {
  SettingsBrand,
  SettingsGeneral,
  SettingsPageData,
  SettingsSecurity,
} from "@/lib/admin/settings/types";

export const DEFAULT_PASSWORD_POLICY: SettingsSecurity["passwordPolicy"] = {
  minLength: true,
  requireUppercase: true,
  requireNumber: true,
  requireSpecial: false,
};

const EMPTY_BRAND: SettingsBrand = {
  logoMark: "",
  logoWordmark: "",
  logoMarkFooter: "",
  logoWordmarkFooter: "",
  divider: "",
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

  return {
    logoMark:
      partial?.logoMark ??
      (typeof record.logoMark === "string" ? record.logoMark : ""),
    logoWordmark:
      partial?.logoWordmark ??
      (typeof record.logoWordmark === "string" ? record.logoWordmark : ""),
    logoMarkFooter:
      partial?.logoMarkFooter ??
      (typeof record.logoMarkFooter === "string" ? record.logoMarkFooter : ""),
    logoWordmarkFooter:
      partial?.logoWordmarkFooter ??
      (typeof record.logoWordmarkFooter === "string"
        ? record.logoWordmarkFooter
        : ""),
    divider:
      partial?.divider ??
      (typeof record.divider === "string" ? record.divider : ""),
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
    ...omitUndefined(partial ?? {}),
  };
}

export function defaultSettingsPageData(
  partial?: Partial<SettingsPageData>,
): SettingsPageData {
  return {
    general: defaultGeneral(partial?.general),
    security: {
      passwordPolicy: {
        ...DEFAULT_PASSWORD_POLICY,
        ...partial?.security?.passwordPolicy,
      },
    },
  };
}
