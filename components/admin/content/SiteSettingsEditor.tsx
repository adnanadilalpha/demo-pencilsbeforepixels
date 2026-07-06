"use client";

import type { SiteSettingsDraft } from "@/lib/admin/cms-entity-types";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { RichTextEditor } from "@/components/admin/content/RichTextEditor";

type SiteSettingsEditorProps = {
  settings: SiteSettingsDraft;
  onChange: (settings: SiteSettingsDraft) => void;
};

export function SiteSettingsEditor({
  settings,
  onChange,
}: SiteSettingsEditorProps) {
  const update = (key: keyof SiteSettingsDraft, value: string) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field
        label="Site name"
        value={settings.siteName}
        onChange={(value) => update("siteName", value)}
      />
      <Field
        label="Copyright"
        value={settings.copyright}
        onChange={(value) => update("copyright", value)}
      />
      <div className="sm:col-span-2">
        <RichTextEditor
          label="Site description"
          value={settings.description}
          onChange={(value) => update("description", value)}
        />
      </div>
      <Field
        label="Privacy policy URL"
        value={settings.privacyPolicyUrl}
        onChange={(value) => update("privacyPolicyUrl", value)}
      />
      <Field
        label="Terms of service URL"
        value={settings.termsOfServiceUrl}
        onChange={(value) => update("termsOfServiceUrl", value)}
      />
    </div>
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
        className={adminInputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
