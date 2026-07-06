"use client";

import {
  formatNewsletterSource,
  formatSubscriberDate,
} from "@/lib/admin/newsletter/format";
import type { AdminNewsletterSubscriber } from "@/lib/admin/newsletter/types";
import { NewsletterStatusBadge } from "@/components/admin/newsletter/NewsletterStatusBadge";
import { cn } from "@/lib/utils";

type NewsletterSubscribersTableProps = {
  subscribers: AdminNewsletterSubscriber[];
  emptyMessage?: string;
  busyId?: string | null;
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onUnsubscribe: (subscriber: AdminNewsletterSubscriber) => void;
  onReactivate: (subscriber: AdminNewsletterSubscriber) => void;
  onDelete: (subscriber: AdminNewsletterSubscriber) => void;
};

export function NewsletterSubscribersTable({
  subscribers,
  emptyMessage = "No subscribers yet.",
  busyId = null,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onUnsubscribe,
  onReactivate,
  onDelete,
}: NewsletterSubscribersTableProps) {
  if (!subscribers.length) {
    return (
      <div className="rounded-[14px] border border-navy-800/8 bg-white px-6 py-14 text-center text-sm text-body-muted">
        {emptyMessage}
      </div>
    );
  }

  const rowIds = subscribers.map((subscriber) => subscriber.id);
  const allSelected =
    rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id));
  const someSelected = rowIds.some((id) => selectedIds.has(id));

  return (
    <div className="overflow-hidden rounded-[14px] border border-navy-800/8 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-navy-800/6">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = !allSelected && someSelected;
                  }}
                  onChange={() => onToggleAll(rowIds)}
                  className="size-4 rounded border-navy-800/20"
                  aria-label="Select all subscribers"
                />
              </th>
              <th className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-body-muted">
                Email
              </th>
              <th className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-body-muted">
                Date
              </th>
              <th className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-body-muted">
                Source
              </th>
              <th className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-body-muted">
                Status
              </th>
              <th className="px-5 py-3 text-right font-mono text-[11px] font-medium uppercase tracking-wider text-body-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => {
              const isBusy = busyId === subscriber.id || busyId === "bulk";

              return (
                <tr
                  key={subscriber.id}
                  className={cn(
                    "border-b border-navy-800/4 last:border-b-0",
                    selectedIds.has(subscriber.id) && "bg-gold-500/[0.05]",
                  )}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(subscriber.id)}
                      disabled={isBusy}
                      onChange={() => onToggleRow(subscriber.id)}
                      className="size-4 rounded border-navy-800/20"
                      aria-label={`Select ${subscriber.email}`}
                    />
                  </td>
                  <td className="px-5 py-4 text-sm text-navy-800">
                    {subscriber.email}
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-body-muted">
                    {formatSubscriberDate(subscriber.subscribedAt)}
                  </td>
                  <td className="px-5 py-4 text-xs text-body-muted">
                    {formatNewsletterSource(subscriber.source)}
                  </td>
                  <td className="px-5 py-4">
                    <NewsletterStatusBadge status={subscriber.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
                      {subscriber.status === "active" ? (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => onUnsubscribe(subscriber)}
                          className="text-xs font-medium text-navy-800/70 transition-colors hover:text-navy-800 disabled:opacity-50"
                        >
                          Unsubscribe
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => onReactivate(subscriber)}
                          className="text-xs font-medium text-navy-800/70 transition-colors hover:text-navy-800 disabled:opacity-50"
                        >
                          Reactivate
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onDelete(subscriber)}
                        className="text-xs font-medium text-red-600/80 transition-colors hover:text-red-600 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
