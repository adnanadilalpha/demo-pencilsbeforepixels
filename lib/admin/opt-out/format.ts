import type { AdminOptOutSubmission } from "./types";

export function formatOptOutDate(iso: string | null | undefined): string {
  if (!iso) return "—";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDownloadRate(rate: number): string {
  return `${Math.round(rate)}% rate`;
}

export function formatWeekDelta(delta: number): string {
  const prefix = delta >= 0 ? "+" : "";
  return `${prefix}${delta} vs last`;
}

export function submissionsToCsv(submissions: AdminOptOutSubmission[]): string {
  const header = ["Parent", "Student", "School", "Date", "Status"];
  const rows = submissions.map((submission) => [
    submission.parentName,
    submission.studentName ?? "",
    submission.school ?? "",
    formatOptOutDate(submission.generatedAt),
    submission.status,
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

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfWeek(date: Date): Date {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

export function computeOptOutStats(
  submissions: AdminOptOutSubmission[],
  now = new Date(),
): {
  generatedTotal: number;
  generatedToday: number;
  downloadedTotal: number;
  downloadRate: number;
  thisWeek: number;
  weekDelta: number;
} {
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  let generatedToday = 0;
  let downloadedTotal = 0;
  let thisWeek = 0;
  let lastWeek = 0;

  for (const submission of submissions) {
    const generatedAt = new Date(submission.generatedAt);

    if (submission.status === "downloaded") {
      downloadedTotal += 1;
    }

    if (!Number.isNaN(generatedAt.getTime())) {
      if (generatedAt >= todayStart) generatedToday += 1;
      if (generatedAt >= weekStart) thisWeek += 1;
      else if (generatedAt >= lastWeekStart && generatedAt < weekStart) {
        lastWeek += 1;
      }
    }
  }

  const generatedTotal = submissions.length;
  const downloadRate =
    generatedTotal > 0 ? (downloadedTotal / generatedTotal) * 100 : 0;

  return {
    generatedTotal,
    generatedToday,
    downloadedTotal,
    downloadRate,
    thisWeek,
    weekDelta: thisWeek - lastWeek,
  };
}
