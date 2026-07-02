"use client";

import {
  formatNewsletterSource,
  formatSubscriberDate,
} from "@/lib/admin/newsletter/format";
import type { AdminNewsletterSubscriber } from "@/lib/admin/newsletter/types";
import { NewsletterStatusBadge } from "@/components/admin/newsletter/NewsletterStatusBadge";

type NewsletterSubscribersTableProps = {
  subscribers: AdminNewsletterSubscriber[];
  emptyMessage?: string;
  busyId?: string | null;
  onUnsubscribe: (subscriber: AdminNewsletterSubscriber) => void;
  onReactivate: (subscriber: AdminNewsletterSubscriber) => void;
  onDelete: (subscriber: AdminNewsletterSubscriber) => void;
};

export function NewsletterSubscribersTable({
  subscribers,
  emptyMessage = "No subscribers yet.",
  busyId = null,
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

  return (
    <div className="overflow-hidden rounded-[14px] border border-navy-800/8 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-navy-800/6">
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
              const isBusy = busyId === subscriber.id;

              return (
                <tr
                  key={subscriber.id}
                  className="border-b border-navy-800/4 last:border-b-0"
                >
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
