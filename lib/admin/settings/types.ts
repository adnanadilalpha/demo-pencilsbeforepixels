export type SettingsTab = "general" | "security";

export type SettingsBrand = {
  logoMark: string;
  logoWordmark: string;
  logoMarkFooter: string;
  logoWordmarkFooter: string;
  divider: string;
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
};
