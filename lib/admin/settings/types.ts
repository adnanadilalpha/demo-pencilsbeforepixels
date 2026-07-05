import type { SiteCacheSettings } from "@/lib/cache/types";

export type SettingsTab = "general" | "security" | "performance";

export type SettingsSocialLink = {
  id: string;
  label: string;
  url: string;
  iconUrl: string;
};

export type SettingsBrand = {
  logoLight: string;
  logoDark: string;
};

export type SettingsGeneral = {
  siteName: string;
  metaTitle: string;
  metaDescription: string;
  footerTagline: string;
  copyright: string;
  faviconUrl: string;
  brand: SettingsBrand;
  description: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  socialLinks: SettingsSocialLink[];
};

export type PasswordPolicySettings = {
  minLength: boolean;
  requireUppercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
};

export type SettingsSecurity = {
  passwordPolicy: PasswordPolicySettings;
};

export type SettingsPageData = {
  general: SettingsGeneral;
  security: SettingsSecurity;
  cache: SiteCacheSettings;
};
