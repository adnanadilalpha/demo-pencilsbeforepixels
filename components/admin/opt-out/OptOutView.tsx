"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
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

type PendingDelete =
  | { mode: "single"; submission: AdminOptOutSubmission }
  | { mode: "bulk"; count: number };

const TABS: { id: OptOutTab; label: string }[] = [
  { id: "submissions", label: "Submissions" },
  { id: "settings", label: "Schools & templates" },
];

export function OptOutView({ initialData }: OptOutViewProps) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<OptOutTab>("submissions");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
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

  const selectedSubmissions = useMemo(
    () => filteredSubmissions.filter((submission) => selectedIds.has(submission.id)),
    [filteredSubmissions, selectedIds],
  );

  const toggleRow = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (ids: string[]) => {
    setSelectedIds((current) => {
      const allSelected = ids.every((id) => current.has(id));
      if (allSelected) return new Set();
      return new Set(ids);
    });
  };

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

  const deleteSubmissions = async (submissions: AdminOptOutSubmission[]) => {
    setBusyId(submissions.length === 1 ? submissions[0].id : "bulk");
    setActionError(null);

    try {
      const response = await fetch("/api/admin/opt-out", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: submissions.map((submission) => submission.id) }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to delete submission.");
      }

      const next = (await response.json()) as OptOutPageData;
      setData(next);
      setPendingDelete(null);
      setSelectedIds(new Set());
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

  const deleteLabel =
    pendingDelete?.mode === "bulk"
      ? `${pendingDelete.count} selected submission${pendingDelete.count === 1 ? "" : "s"}`
      : pendingDelete?.mode === "single"
        ? pendingDelete.submission.parentName
        : "";

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

      {selectedIds.size > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-gold-500/20 bg-gold-500/10 px-4 py-3">
          <p className="text-sm font-medium text-navy-800">
            {selectedIds.size} submission{selectedIds.size === 1 ? "" : "s"} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="rounded-[10px] px-3 py-2 text-sm font-medium text-body-muted transition-colors hover:text-navy-800"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() =>
                setPendingDelete({ mode: "bulk", count: selectedIds.size })
              }
              className="inline-flex items-center gap-2 rounded-[10px] border border-red-600/20 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="size-4" />
              Delete selected
            </button>
          </div>
        </div>
      ) : null}

      <OptOutSubmissionsTable
        submissions={filteredSubmissions}
        query={query}
        onQueryChange={setQuery}
        busyId={busyId}
        selectedIds={selectedIds}
        onToggleRow={toggleRow}
        onToggleAll={toggleAll}
        emptyMessage={
          query.trim()
            ? "No submissions match your search."
            : "No submissions yet."
        }
        onDownload={(submission, format) =>
          void handleDownload(submission, format)
        }
        onDelete={(submission) =>
          setPendingDelete({ mode: "single", submission })
        }
      />

      <AdminConfirmDeleteModal
        open={pendingDelete !== null}
        title={
          pendingDelete?.mode === "bulk" ? "Delete submissions" : "Delete submission"
        }
        itemName={deleteLabel}
        confirming={busyId !== null}
        onClose={() => {
          if (busyId) return;
          setPendingDelete(null);
        }}
        onConfirm={() => {
          if (pendingDelete?.mode === "bulk") {
            void deleteSubmissions(selectedSubmissions);
            return;
          }
          if (pendingDelete?.mode === "single") {
            void deleteSubmissions([pendingDelete.submission]);
          }
        }}
      />
        </>
      )}
    </div>
  );
}
