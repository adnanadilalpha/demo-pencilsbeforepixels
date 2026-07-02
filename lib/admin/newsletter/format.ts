const SOURCE_LABELS: Record<string, string> = {
  hero: "Landing page",
  header: "Header",
  "mobile-nav": "Mobile nav",
  footer: "Footer",
  "academic-data": "Academic data",
  website: "Website",
  "opt-out": "Opt-out flow",
  "opt-out-flow": "Opt-out flow",
  resources: "Resources page",
  "resources-page": "Resources page",
};

export function formatNewsletterSource(source: string | null | undefined): string {
  if (!source) return "Website";

  const normalized = source.trim().toLowerCase();
  if (SOURCE_LABELS[normalized]) {
    return SOURCE_LABELS[normalized];
  }

  return normalized
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatSubscriberDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatSubscriberCount(count: number): string {
  return count === 1 ? "1 subscriber" : `${count.toLocaleString("en-US")} subscribers`;
}

export function subscribersToCsv(
  subscribers: Array<{
    email: string;
    subscribedAt: string;
    source: string;
    status: string;
  }>,
): string {
  const header = ["Email", "Date", "Source", "Status"];
  const rows = subscribers.map((subscriber) => [
    subscriber.email,
    formatSubscriberDate(subscriber.subscribedAt),
    formatNewsletterSource(subscriber.source),
    subscriber.status,
  ]);

  const escape = (value: string) => {
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  return [header, ...rows]
    .map((row) => row.map((cell) => escape(cell)).join(","))
    .join("\n");
}
