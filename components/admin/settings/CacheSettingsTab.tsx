"use client";

import { adminLabelClass } from "@/components/admin/admin-styles";
import {
  SettingsCard,
  SettingsCardStack,
} from "@/components/admin/settings/SettingsPanel";
import type { SiteCacheSettings } from "@/lib/cache/types";

type CacheSettingsTabProps = {
  cache: SiteCacheSettings;
  onChange: (cache: SiteCacheSettings) => void;
};

export function CacheSettingsTab({ cache, onChange }: CacheSettingsTabProps) {
  return (
    <SettingsCardStack>
      <SettingsCard
        title="Website cache"
        description="Controls server, browser, and CDN caching for public site content and evidence data."
      >
        <label className="flex items-start gap-3 text-sm text-navy-800">
          <input
            type="checkbox"
            checked={cache.enabled}
            onChange={(event) =>
              onChange({ ...cache, enabled: event.target.checked })
            }
            className="mt-0.5"
          />
          <span>
            <span className={adminLabelClass}>Enable website cache</span>
            <span className="mt-1 block text-xs leading-relaxed text-body-muted">
              When enabled, pages load faster by reusing cached CMS content,
              evidence data, and uploaded media. Turn off while editing content
              to see changes immediately without a hard refresh.
            </span>
          </span>
        </label>
      </SettingsCard>
    </SettingsCardStack>
  );
}
