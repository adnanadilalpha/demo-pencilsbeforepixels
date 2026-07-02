"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { AdminConfirmDeleteModal } from "@/components/admin/AdminConfirmDeleteModal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NewsletterSubscribersTable } from "@/components/admin/newsletter/NewsletterSubscribersTable";
import {
  formatSubscriberCount,
  subscribersToCsv,
} from "@/lib/admin/newsletter/format";
import type {
  AdminNewsletterSubscriber,
  NewsletterPageData,
} from "@/lib/admin/newsletter/types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type NewsletterViewProps = {
  initialData: NewsletterPageData;
};

export function NewsletterView({ initialData }: NewsletterViewProps) {
  const [data, setData] = useState(initialData);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<AdminNewsletterSubscriber | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/newsletter", { cache: "no-store" });
    if (!response.ok) return;
    const next = (await response.json()) as NewsletterPageData;
    setData(next);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-newsletter-subscribers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "newsletter_subscribers" },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const filteredSubscribers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.subscribers;

    return data.subscribers.filter((subscriber) => {
      const haystack = [
        subscriber.email,
        subscriber.source,
        subscriber.status,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [data.subscribers, query]);

  const updateStatus = async (
    subscriber: AdminNewsletterSubscriber,
    status: "active" | "unsubscribed",
  ) => {
    setBusyId(subscriber.id);
    setActionError(null);

    try {
      const response = await fetch("/api/admin/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: subscriber.id, status }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to update subscriber.");
      }

      const next = (await response.json()) as NewsletterPageData;
      setData(next);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to update subscriber.",
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
        `/api/admin/newsletter?id=${encodeURIComponent(pendingDelete.id)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to delete subscriber.");
      }

      const next = (await response.json()) as NewsletterPageData;
      setData(next);
      setPendingDelete(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to delete subscriber.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleExport = () => {
    const csv = subscribersToCsv(filteredSubscribers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `newsletter-subscribers-${dateStamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          title="Newsletter"
          description={formatSubscriberCount(data.totalCount)}
        />

        <button
          type="button"
          onClick={handleExport}
          disabled={!filteredSubscribers.length}
          className="inline-flex items-center gap-2 rounded-full border border-navy-800/12 bg-navy-800 px-4 py-2.5 text-sm font-medium text-paper-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="size-3.5" aria-hidden />
          Export CSV
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-body-muted"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search subscribers…"
          className={cn(
            "h-10 w-full rounded-[10px] border border-navy-800/10 bg-white py-2.5 pl-9 pr-4 text-sm text-navy-800 outline-none placeholder:text-navy-800/45 focus:border-navy-800/25",
          )}
        />
      </div>

      {actionError ? (
        <p className="text-sm text-red-600">{actionError}</p>
      ) : null}

      <NewsletterSubscribersTable
        subscribers={filteredSubscribers}
        busyId={busyId}
        emptyMessage={
          query.trim()
            ? "No subscribers match your search."
            : "No subscribers yet."
        }
        onUnsubscribe={(subscriber) =>
          void updateStatus(subscriber, "unsubscribed")
        }
        onReactivate={(subscriber) => void updateStatus(subscriber, "active")}
        onDelete={setPendingDelete}
      />

      <AdminConfirmDeleteModal
        open={pendingDelete !== null}
        title="Delete subscriber"
        itemName={pendingDelete?.email ?? "this subscriber"}
        confirming={busyId !== null && pendingDelete?.id === busyId}
        onClose={() => {
          if (busyId) return;
          setPendingDelete(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
