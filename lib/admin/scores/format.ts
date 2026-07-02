import type { ScoreDataset } from "@/lib/admin/scores/types";

export function formatScoreDate(value: string | null | undefined): string {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatScoreNumber(
  value: number | null | undefined,
  digits = 2,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export function formatScorePercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${(value * 100).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function formatRowCount(value: number): string {
  return value.toLocaleString();
}

export function getDatasetLabel(dataset: ScoreDataset): string {
  switch (dataset) {
    case "math":
      return "Math";
    case "english":
      return "English";
    case "frl":
      return "FRL";
  }
}
