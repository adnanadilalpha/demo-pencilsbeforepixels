"use client";

import {
  SettingsCard,
  SettingsCardStack,
} from "@/components/admin/settings/SettingsPanel";
import { SettingsToggleRow } from "@/components/admin/settings/SettingsToggleRow";
import type { SettingsSecurity } from "@/lib/admin/settings/types";

type SecuritySettingsTabProps = {
  security: SettingsSecurity;
  onChange: (security: SettingsSecurity) => void;
};

export function SecuritySettingsTab({
  security,
  onChange,
}: SecuritySettingsTabProps) {
  const updatePolicy = (
    key: keyof SettingsSecurity["passwordPolicy"],
    value: boolean,
  ) => {
    onChange({
      ...security,
      passwordPolicy: { ...security.passwordPolicy, [key]: value },
    });
  };

  return (
    <SettingsCardStack>
      <SettingsCard
        title="Password policy"
        description="Rules enforced when creating new admin accounts."
      >
        <div className="overflow-hidden rounded-[10px] border border-navy-800/8 bg-white">
          <SettingsToggleRow
            label="Minimum 8 characters"
            checked={security.passwordPolicy.minLength}
            onChange={(checked) => updatePolicy("minLength", checked)}
            className="px-5"
          />
          <SettingsToggleRow
            label="Require uppercase letter"
            checked={security.passwordPolicy.requireUppercase}
            onChange={(checked) => updatePolicy("requireUppercase", checked)}
            className="border-t border-navy-800/6 px-5"
          />
          <SettingsToggleRow
            label="Require number"
            checked={security.passwordPolicy.requireNumber}
            onChange={(checked) => updatePolicy("requireNumber", checked)}
            className="border-t border-navy-800/6 px-5"
          />
          <SettingsToggleRow
            label="Require special character"
            checked={security.passwordPolicy.requireSpecial}
            onChange={(checked) => updatePolicy("requireSpecial", checked)}
            className="border-t border-navy-800/6 px-5"
          />
        </div>
      </SettingsCard>
    </SettingsCardStack>
  );
}
