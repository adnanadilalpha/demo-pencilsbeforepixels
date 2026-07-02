import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AdminNewsletterSubscriber,
  NewsletterPageData,
  NewsletterSubscriberStatus,
} from "./types";

type SubscriberRow = {
  id: string;
  email: string;
  source: string | null;
  status: string | null;
  subscribed_at: string | null;
};

function normalizeStatus(status: string | null): NewsletterSubscriberStatus {
  return status === "unsubscribed" ? "unsubscribed" : "active";
}

function mapSubscriber(row: SubscriberRow): AdminNewsletterSubscriber {
  return {
    id: row.id,
    email: row.email,
    source: row.source ?? "website",
    status: normalizeStatus(row.status),
    subscribedAt: row.subscribed_at ?? new Date(0).toISOString(),
  };
}

export async function fetchNewsletterPageData(): Promise<NewsletterPageData> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, source, status, subscribed_at")
    .order("subscribed_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const subscribers = ((data ?? []) as SubscriberRow[]).map(mapSubscriber);

  return {
    subscribers,
    totalCount: subscribers.length,
  };
}
