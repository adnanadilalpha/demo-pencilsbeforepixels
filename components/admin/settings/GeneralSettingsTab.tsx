"use client";

import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { MediaField } from "@/components/admin/content/MediaField";
import { BrandLogoPreview } from "@/components/admin/settings/BrandLogoPreview";
import {
  SettingsCard,
  SettingsCardStack,
  SettingsFieldGrid,
} from "@/components/admin/settings/SettingsPanel";
import type { SettingsBrand, SettingsGeneral } from "@/lib/admin/settings/types";
import { cn } from "@/lib/utils";

type GeneralSettingsTabProps = {
  general: SettingsGeneral;
  onChange: (general: SettingsGeneral) => void;
};

export function GeneralSettingsTab({
  general,
  onChange,
}: GeneralSettingsTabProps) {
  const update = <K extends keyof SettingsGeneral>(
    key: K,
    value: SettingsGeneral[K],
  ) => {
    onChange({ ...general, [key]: value });
  };

  const updateBrand = <K extends keyof SettingsBrand>(
    key: K,
    value: SettingsBrand[K],
  ) => {
    onChange({
      ...general,
      brand: { ...general.brand, [key]: value },
    });
  };

  return (
    <SettingsCardStack>
      <SettingsCard
        title="Site identity"
        description="Site name and the logo assets used on the public website."
      >
        <div className="flex flex-col gap-8">
          <Field
            label="Site name"
            value={general.siteName}
            onChange={(value) => update("siteName", value)}
          />

          <section className="flex flex-col gap-5">
            <div>
              <h4 className="text-sm font-semibold text-navy-800">
                Transparent header
              </h4>
              <p className="mt-1 text-sm text-body-muted">
                Light logo shown over the hero before the header background
                appears.
              </p>
            </div>

            <BrandLogoPreview
              variant="light"
              label="Preview"
              mark={general.brand.logoMark}
              wordmark={general.brand.logoWordmark}
              divider={general.brand.divider}
            />

            <SettingsFieldGrid columns={2}>
              <MediaField
                label="Logo mark"
                value={general.brand.logoMark}
                onChange={(value) => updateBrand("logoMark", value)}
                folder="brand"
                filename="logo-mark.svg"
                altText="Logo mark for transparent header"
                variant="mark"
                previewTheme="dark"
              />
              <MediaField
                label="Wordmark"
                value={general.brand.logoWordmark}
                onChange={(value) => updateBrand("logoWordmark", value)}
                folder="brand"
                filename="logo-wordmark.svg"
                altText="Logo wordmark for transparent header"
                variant="logo"
                previewTheme="dark"
              />
            </SettingsFieldGrid>
          </section>

          <section className="flex flex-col gap-5">
            <div>
              <h4 className="text-sm font-semibold text-navy-800">
                Solid header & footer
              </h4>
              <p className="mt-1 text-sm text-body-muted">
                Dark logo used when the header has a background and in the
                footer.
              </p>
            </div>

            <BrandLogoPreview
              variant="dark"
              label="Preview"
              mark={general.brand.logoMarkFooter}
              wordmark={general.brand.logoWordmarkFooter}
              divider={general.brand.divider}
            />

            <SettingsFieldGrid columns={2}>
              <MediaField
                label="Logo mark"
                value={general.brand.logoMarkFooter}
                onChange={(value) => updateBrand("logoMarkFooter", value)}
                folder="brand"
                filename="logo-mark-footer.svg"
                altText="Logo mark for solid header and footer"
                variant="mark"
                previewTheme="light"
              />
              <MediaField
                label="Wordmark"
                value={general.brand.logoWordmarkFooter}
                onChange={(value) => updateBrand("logoWordmarkFooter", value)}
                folder="brand"
                filename="logo-wordmark-footer.svg"
                altText="Logo wordmark for solid header and footer"
                variant="logo"
                previewTheme="light"
              />
            </SettingsFieldGrid>
          </section>

          <section className="flex flex-col gap-5">
            <div>
              <h4 className="text-sm font-semibold text-navy-800">Shared & favicon</h4>
              <p className="mt-1 text-sm text-body-muted">
                Divider line between mark and wordmark, plus the browser tab
                icon.
              </p>
            </div>

            <SettingsFieldGrid columns={2}>
              <MediaField
                label="Divider"
                value={general.brand.divider}
                onChange={(value) => updateBrand("divider", value)}
                folder="brand"
                filename="divider.svg"
                altText="Logo divider"
                variant="mark"
                previewTheme="dark"
              />
              <MediaField
                label="Favicon"
                value={general.faviconUrl}
                onChange={(value) => update("faviconUrl", value)}
                folder="brand"
                filename="Favicon_RichBlack.svg"
                altText="Site favicon"
                variant="icon"
                previewTheme="dark"
              />
            </SettingsFieldGrid>
          </section>
        </div>
      </SettingsCard>

      <SettingsCard
        title="SEO & meta"
        description="Browser tab title and search engine description."
      >
        <div className="flex flex-col gap-5">
          <Field
            label="Meta title"
            value={general.metaTitle}
            onChange={(value) => update("metaTitle", value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className={adminLabelClass}>Meta description</label>
            <textarea
              value={general.metaDescription}
              onChange={(event) =>
                update("metaDescription", event.target.value)
              }
              rows={4}
              className={cn(
                adminInputClass,
                "min-h-28 resize-y rounded-[10px] px-3 py-2.5",
              )}
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Footer"
        description="Text shown in the site footer."
      >
        <SettingsFieldGrid>
          <Field
            label="Footer tagline"
            value={general.footerTagline}
            onChange={(value) => update("footerTagline", value)}
          />

          <Field
            label="Copyright"
            value={general.copyright}
            onChange={(value) => update("copyright", value)}
          />
        </SettingsFieldGrid>
      </SettingsCard>

      <SettingsCard
        title="Legal"
        description="Links used in the footer and legal pages."
      >
        <SettingsFieldGrid>
          <Field
            label="Privacy policy URL"
            value={general.privacyPolicyUrl}
            onChange={(value) => update("privacyPolicyUrl", value)}
          />

          <Field
            label="Terms of service URL"
            value={general.termsOfServiceUrl}
            onChange={(value) => update("termsOfServiceUrl", value)}
          />
        </SettingsFieldGrid>
      </SettingsCard>
    </SettingsCardStack>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={adminLabelClass}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(adminInputClass, "h-11 rounded-[10px] px-3")}
      />
    </div>
  );
}
