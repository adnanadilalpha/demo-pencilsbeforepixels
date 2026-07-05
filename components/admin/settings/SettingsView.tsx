"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CacheSettingsTab } from "@/components/admin/settings/CacheSettingsTab";
import { GeneralSettingsTab } from "@/components/admin/settings/GeneralSettingsTab";
import { SecuritySettingsTab } from "@/components/admin/settings/SecuritySettingsTab";
import { SettingsTabs } from "@/components/admin/settings/SettingsTabs";
import type { SettingsPageData, SettingsTab } from "@/lib/admin/settings/types";

type SettingsViewProps = {
  initialData: SettingsPageData;
};

export function SettingsView({ initialData }: SettingsViewProps) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setActionError(null);
    setSavedMessage(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to save settings.");
      }

      const next = (await response.json()) as SettingsPageData;
      setData(next);
      setSavedMessage("Settings saved.");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to save settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          title="Settings"
          description="Site identity, SEO, footer content, performance, and admin security."
        />

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full border border-gold-500 bg-gold-500 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="size-3.5" aria-hidden />
          {saving ? "Saving…" : "Save all"}
        </button>
      </div>

      <SettingsTabs active={activeTab} onChange={setActiveTab} />

      {actionError ? (
        <p className="text-sm text-red-600">{actionError}</p>
      ) : null}

      {savedMessage ? (
        <p className="text-sm text-emerald-600">{savedMessage}</p>
      ) : null}

      {activeTab === "general" ? (
        <GeneralSettingsTab
          general={data.general}
          onChange={(general) => setData((current) => ({ ...current, general }))}
        />
      ) : null}

      {activeTab === "security" ? (
        <SecuritySettingsTab
          security={data.security}
          onChange={(security) =>
            setData((current) => ({ ...current, security }))
          }
        />
      ) : null}

      {activeTab === "performance" ? (
        <CacheSettingsTab
          cache={data.cache}
          onChange={(cache) => setData((current) => ({ ...current, cache }))}
        />
      ) : null}
    </div>
  );
}
