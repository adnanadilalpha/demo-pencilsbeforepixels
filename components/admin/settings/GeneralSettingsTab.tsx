"use client";

import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { MediaField } from "@/components/admin/content/MediaField";
import { BrandLogoPreview } from "@/components/admin/settings/BrandLogoPreview";
import { SocialLinksEditor } from "@/components/admin/settings/SocialLinksEditor";
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
        description="Site name and the logo used across the public website and admin."
      >
        <div className="flex flex-col gap-8">
          <Field
            label="Site name"
            value={general.siteName}
            onChange={(value) => update("siteName", value)}
          />

          <section className="flex flex-col gap-5">
            <div>
              <h4 className="text-sm font-semibold text-navy-800">Logos</h4>
              <p className="mt-1 text-sm text-body-muted">
                Upload separate logo files for the transparent header and for
                the solid header and footer.
              </p>
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-5">
                <div>
                  <h5 className="text-sm font-semibold text-navy-800">
                    Transparent header
                  </h5>
                  <p className="mt-1 text-sm text-body-muted">
                    Shown over the homepage hero before the header background
                    appears.
                  </p>
                </div>

                <BrandLogoPreview
                  variant="light"
                  label="Preview"
                  logo={general.brand.logoLight}
                />

                <MediaField
                  label="Logo"
                  value={general.brand.logoLight}
                  onChange={(value) => updateBrand("logoLight", value)}
                  folder="brand"
                  filename="logo-light.svg"
                  altText="Logo for transparent header"
                  variant="logo"
                  previewTheme="dark"
                />
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <h5 className="text-sm font-semibold text-navy-800">
                    Solid header & footer
                  </h5>
                  <p className="mt-1 text-sm text-body-muted">
                    Shown when the header has a background, in the footer, and
                    in the admin panel.
                  </p>
                </div>

                <BrandLogoPreview
                  variant="dark"
                  label="Preview"
                  logo={general.brand.logoDark}
                />

                <MediaField
                  label="Logo"
                  value={general.brand.logoDark}
                  onChange={(value) => updateBrand("logoDark", value)}
                  folder="brand"
                  filename="logo-dark.svg"
                  altText="Logo for solid header and footer"
                  variant="logo"
                  previewTheme="light"
                />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <div>
              <h4 className="text-sm font-semibold text-navy-800">Favicon</h4>
              <p className="mt-1 text-sm text-body-muted">
                Browser tab icon. Uploading a new favicon does not change the
                built-in app icons.
              </p>
            </div>

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
        description="Text and social links shown in the site footer."
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

        <div className="mt-8 border-t border-navy-800/8 pt-8">
          <h4 className="text-sm font-semibold text-navy-800">Social links</h4>
          <p className="mt-1 text-sm text-body-muted">
            Also editable under Content → Footer. Changes here apply after you
            save settings.
          </p>
          <div className="mt-4">
            <SocialLinksEditor
              links={general.socialLinks}
              onChange={(socialLinks) => update("socialLinks", socialLinks)}
            />
          </div>
        </div>
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
