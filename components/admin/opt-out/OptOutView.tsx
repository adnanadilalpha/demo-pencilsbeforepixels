"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { AdminConfirmDeleteModal } from "@/components/admin/AdminConfirmDeleteModal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { OptOutSettingsEditor } from "@/components/admin/opt-out/OptOutSettingsEditor";
import { OptOutSubmissionsTable } from "@/components/admin/opt-out/OptOutSubmissionsTable";
import {
  formatDownloadRate,
  formatWeekDelta,
  submissionsToCsv,
} from "@/lib/admin/opt-out/format";
import type {
  AdminOptOutSubmission,
  OptOutPageData,
} from "@/lib/admin/opt-out/types";
import { formatCount } from "@/lib/admin/format";
import { packageFilename } from "@/lib/opt-out/filenames";
import type { OptOutFormConfig, OptOutSchool } from "@/lib/opt-out/types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type OptOutViewProps = {
  initialData: OptOutPageData;
};

type OptOutTab = "submissions" | "settings";

const TABS: { id: OptOutTab; label: string }[] = [
  { id: "submissions", label: "Submissions" },
  { id: "settings", label: "Schools & templates" },
];

export function OptOutView({ initialData }: OptOutViewProps) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<OptOutTab>("submissions");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<AdminOptOutSubmission | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [schools, setSchools] = useState<OptOutSchool[]>([]);
  const [config, setConfig] = useState<OptOutFormConfig | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/opt-out", { cache: "no-store" });
    if (!response.ok) return;
    const next = (await response.json()) as OptOutPageData;
    setData(next);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-opt-out-submissions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "opt_out_submissions" },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  useEffect(() => {
    if (activeTab !== "settings" || settingsLoaded) return;

    void (async () => {
      const response = await fetch("/api/admin/opt-out/settings", {
        cache: "no-store",
      });
      if (!response.ok) {
        setSettingsError("Failed to load settings.");
        return;
      }

      const body = (await response.json()) as {
        schools: OptOutSchool[];
        config: OptOutFormConfig;
      };
      setSchools(body.schools);
      setConfig(body.config);
      setSettingsLoaded(true);
    })();
  }, [activeTab, settingsLoaded]);

  const filteredSubmissions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.submissions;

    return data.submissions.filter((submission) => {
      const haystack = [
        submission.parentName,
        submission.studentName,
        submission.school,
        submission.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [data.submissions, query]);

  const handleExport = () => {
    const csv = submissionsToCsv(filteredSubmissions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `opt-out-submissions-${dateStamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (
    submission: AdminOptOutSubmission,
    format: "pdf" | "docx",
  ) => {
    setBusyId(submission.id);
    setActionError(null);

    try {
      const response = await fetch("/api/admin/opt-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submission.id, format }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to download letter.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = packageFilename(
        submission.studentName ?? submission.parentName,
        format,
      );

      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to download letter.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setBusyId(pendingDelete.id);
    setActionError(null);

    try {
      const response = await fetch(
        `/api/admin/opt-out?id=${encodeURIComponent(pendingDelete.id)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to delete submission.");
      }

      const next = (await response.json()) as OptOutPageData;
      setData(next);
      setPendingDelete(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to delete submission.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveSettings = async () => {
    if (!config) return;

    setSettingsSaving(true);
    setSettingsSaved(false);
    setSettingsError(null);

    try {
      const response = await fetch("/api/admin/opt-out/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schools, config }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to save settings.");
      }

      const body = (await response.json()) as {
        schools: OptOutSchool[];
        config: OptOutFormConfig;
      };
      setSchools(body.schools);
      setConfig(body.config);
      setSettingsSaved(true);
    } catch (error) {
      setSettingsError(
        error instanceof Error ? error.message : "Failed to save settings.",
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  const { stats } = data;

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          title="Opt Out Forms"
          description="Track generated Form B packages and manage schools and default answers."
        />

        {activeTab === "submissions" ? (
          <button
            type="button"
            onClick={handleExport}
            disabled={!filteredSubmissions.length}
            className="inline-flex items-center gap-2 rounded-full border border-navy-800/12 bg-navy-800 px-4 py-2.5 text-sm font-medium text-paper-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-3.5" aria-hidden />
            Export CSV
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-navy-800/8 pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-navy-800 text-paper-50"
                : "text-navy-800/70 hover:bg-navy-800/5",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "settings" ? (
        config ? (
          <OptOutSettingsEditor
            schools={schools}
            config={config}
            onChange={({ schools: nextSchools, config: nextConfig }) => {
              setSchools(nextSchools);
              setConfig(nextConfig);
              setSettingsSaved(false);
            }}
            onSave={() => void handleSaveSettings()}
            saving={settingsSaving}
            saved={settingsSaved}
            error={settingsError}
          />
        ) : (
          <p className="text-sm text-body-muted">
            {settingsError ?? "Loading settings…"}
          </p>
        )
      ) : (
        <>
      <section className="grid gap-4 lg:grid-cols-3">
        <AdminStatCard
          label="Generated"
          value={formatCount(stats.generatedTotal)}
          trend={`+${formatCount(stats.generatedToday)} today`}
          trendPositive={stats.generatedToday > 0}
        />
        <AdminStatCard
          label="Downloaded"
          value={formatCount(stats.downloadedTotal)}
          trend={formatDownloadRate(stats.downloadRate)}
          trendPositive={stats.downloadRate >= 50}
        />
        <AdminStatCard
          label="This Week"
          value={formatCount(stats.thisWeek)}
          trend={formatWeekDelta(stats.weekDelta)}
          trendPositive={stats.weekDelta >= 0}
        />
      </section>

      {actionError ? (
        <p className="text-sm text-red-600">{actionError}</p>
      ) : null}

      <OptOutSubmissionsTable
        submissions={filteredSubmissions}
        query={query}
        onQueryChange={setQuery}
        busyId={busyId}
        emptyMessage={
          query.trim()
            ? "No submissions match your search."
            : "No submissions yet."
        }
        onDownload={(submission, format) =>
          void handleDownload(submission, format)
        }
        onDelete={setPendingDelete}
      />

      <AdminConfirmDeleteModal
        open={pendingDelete !== null}
        title="Delete submission"
        itemName={pendingDelete?.parentName ?? "this submission"}
        confirming={busyId !== null && pendingDelete?.id === busyId}
        onClose={() => {
          if (busyId) return;
          setPendingDelete(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
        </>
      )}
    </div>
  );
}
