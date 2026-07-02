import type { ScoreDataset } from "@/lib/admin/scores/types";

const ACADEMIC_HEADERS = [
  "level",
  "school_year",
  "county_id",
  "district_id",
  "school_id",
  "agency_name",
  "subject",
  "grade",
  "subgroup_type",
  "subgroup_desc",
  "avg_scale_score",
  "count_developing",
  "pct_developing",
  "count_ontrack",
  "pct_ontrack",
  "count_advanced",
  "pct_advanced",
  "count_tested",
  "count_not_tested",
  "pct_not_tested",
  "data_as_of",
  "pct_basic",
  "pct_proficient",
] as const;

const FRL_HEADERS = [
  "level",
  "school_year",
  "county_id",
  "district_id",
  "school_id",
  "agency_name",
  "data_as_of",
  "pct_frl",
  "count_frl",
] as const;

export type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

function normalizeHeader(header: string): string {
  return header.trim().replace(/^\uFEFF/, "").toLowerCase();
}

export function parseCsv(text: string): ParsedCsv {
  const rows: Record<string, string>[] = [];
  const headers: string[] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let headerParsed = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };

  const pushRow = () => {
    if (!headerParsed) {
      headers.push(...row.map(normalizeHeader));
      headerParsed = true;
    } else if (row.some((cell) => cell.trim().length > 0)) {
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = row[index]?.trim() ?? "";
      });
      rows.push(record);
    }

    row = [];
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      pushField();
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      pushField();
      pushRow();
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    pushField();
    pushRow();
  }

  return { headers, rows };
}

function assertHeaders(dataset: ScoreDataset, headers: string[]): void {
  const expected =
    dataset === "frl" ? [...FRL_HEADERS] : [...ACADEMIC_HEADERS];
  const missing = expected.filter((header) => !headers.includes(header));

  if (missing.length > 0) {
    throw new Error(
      `CSV is missing required columns: ${missing.join(", ")}`,
    );
  }
}

function optionalText(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function optionalNumber(value: string | undefined): number | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalBigInt(value: string | undefined): number | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseScoreCsv(
  dataset: ScoreDataset,
  text: string,
): {
  rows: Record<string, unknown>[];
  schoolYears: string[];
} {
  const parsed = parseCsv(text);
  assertHeaders(dataset, parsed.headers);

  const schoolYearSet = new Set<string>();
  const rows = parsed.rows.map((row) => {
    if (row.school_year) schoolYearSet.add(row.school_year);

    if (dataset === "frl") {
      return {
        level: optionalText(row.level),
        school_year: optionalText(row.school_year),
        county_id: optionalBigInt(row.county_id),
        district_id: optionalBigInt(row.district_id),
        school_id: optionalBigInt(row.school_id),
        agency_name: optionalText(row.agency_name),
        data_as_of: optionalText(row.data_as_of),
        pct_frl: optionalNumber(row.pct_frl),
        count_frl: optionalText(row.count_frl),
      };
    }

    return {
      level: optionalText(row.level),
      school_year: optionalText(row.school_year),
      county_id: optionalBigInt(row.county_id),
      district_id: optionalText(row.district_id),
      school_id: optionalBigInt(row.school_id),
      agency_name: optionalText(row.agency_name),
      subject: optionalText(row.subject),
      grade: optionalText(row.grade),
      subgroup_type: optionalText(row.subgroup_type),
      subgroup_desc: optionalText(row.subgroup_desc),
      avg_scale_score: optionalNumber(row.avg_scale_score),
      count_developing: optionalText(row.count_developing),
      pct_developing: optionalText(row.pct_developing),
      count_ontrack: optionalText(row.count_ontrack),
      pct_ontrack: optionalText(row.pct_ontrack),
      count_advanced: optionalText(row.count_advanced),
      pct_advanced: optionalText(row.pct_advanced),
      count_tested: optionalNumber(row.count_tested),
      count_not_tested: optionalText(row.count_not_tested),
      pct_not_tested: optionalText(row.pct_not_tested),
      data_as_of: optionalText(row.data_as_of),
      pct_basic: optionalText(row.pct_basic),
      pct_proficient: optionalText(row.pct_proficient),
    };
  });

  return {
    rows,
    schoolYears: [...schoolYearSet].sort(),
  };
}

export function getExpectedCsvHeaders(dataset: ScoreDataset): string[] {
  return dataset === "frl" ? [...FRL_HEADERS] : [...ACADEMIC_HEADERS];
}
