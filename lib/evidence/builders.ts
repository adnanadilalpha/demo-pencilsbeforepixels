import type { AcademicChart, ChartSeries } from "@/lib/academic-data/types";
import type { DistrictOption, EvidenceSubject } from "./types";
import {
  buildSchoolYearMap,
  formatGradeLabel,
  formatSchoolYear,
  sortedSchoolYears,
  weightedAvg,
  type EvidenceScoreRow,
} from "./chart-utils";

const DISTRICT_COLORS = [
  "#0065F4",
  "#00BC7C",
  "#9359FF",
  "#FF9900",
  "#00B9D9",
  "#C2410C",
  "#6366F1",
];

const STATE_COLOR = "#B91C1C";

function buildTicks(values: number[]) {
  const filtered = values.filter((value) => Number.isFinite(value) && value > 0);
  if (filtered.length === 0) return [0, 25, 50, 75];

  const min = Math.min(...filtered);
  const max = Math.max(...filtered);
  const padding = Math.max(2, (max - min) * 0.08);
  const floor = Math.floor(min - padding);
  const ceil = Math.ceil(max + padding);
  const step = (ceil - floor) / 3;

  return [
    Math.round(floor),
    Math.round(floor + step),
    Math.round(floor + step * 2),
    Math.round(ceil),
  ];
}

function valuesForYears(
  yearMap: ReturnType<typeof buildSchoolYearMap>,
  years: string[],
) {
  return years.map((year) => {
    const bucket = yearMap[year];
    if (!bucket) return Number.NaN;
    return weightedAvg(bucket.scores, bucket.counts);
  });
}
export function colorForDistrictIndex(index: number) {
  return DISTRICT_COLORS[index % DISTRICT_COLORS.length];
}
export function buildPerformanceChart(
  subject: EvidenceSubject,
  grades: string[],
  studentGroupLabel: string,
  stateRows: EvidenceScoreRow[],
  districtRows: EvidenceScoreRow[],
  districts: DistrictOption[],
  includeState: boolean,
): { chart: AcademicChart; subtitle: string } {
  const years = sortedSchoolYears([...stateRows, ...districtRows]);
  const subjectLabel =
    subject === "math" ? "Mathematics" : "English Language Arts";
  const series: ChartSeries[] = [];

  districts.forEach((district) => {
    const rows = districtRows.filter(
      (row) => row.agency_name === district.name,
    );
    const yearMap = buildSchoolYearMap(rows);
    const values = valuesForYears(yearMap, years).map((value) =>
      Number.isFinite(value) ? value : 0,
    );

    series.push({
      label: district.name,
      color: district.color,
      values,
      markerShape: "circle",
    });
  });

  if (includeState && stateRows.length > 0) {
    const yearMap = buildSchoolYearMap(stateRows);
    const values = valuesForYears(yearMap, years).map((value) =>
      Number.isFinite(value) ? value : 0,
    );

    series.push({
      label: "State Average Benchmark",
      color: STATE_COLOR,
      values,
      dashArray: "6 4",
      markerShape: "diamond",
      strokeWidth: 2.5,
    });
  }

  const allValues = series.flatMap((entry) => entry.values);

  return {
    subtitle: `${studentGroupLabel} · Weighted average across selected grades`,
    chart: {
      title: `${subjectLabel} — ${formatGradeLabel(grades)}`,
      yLabel: "Average Scale Score",
      xLabel: "School Year",
      categories: years.map(formatSchoolYear),
      yTicks: buildTicks(allValues),
      series,
    },
  };
}

export function buildGenderPerformanceChart(
  subject: EvidenceSubject,
  grades: string[],
  rows: EvidenceScoreRow[],
  districts: DistrictOption[],
  includeState: boolean,
): { chart: AcademicChart; subtitle: string } {
  const years = sortedSchoolYears(rows);
  const subjectLabel =
    subject === "math" ? "Mathematics" : "English Language Arts";
  const series: ChartSeries[] = [];

  const entityKeys = [
    ...new Set(rows.map((row) => `${row.agency_name}|||${row.level}`)),
  ];

  entityKeys.forEach((key) => {
    const [name, level] = key.split("|||");
    const isState = level === "ST";

    if (isState && !includeState) return;

    const color = isState
      ? STATE_COLOR
      : districts.find((district) => district.name === name)?.color ?? "#64748B";

    const entityRows = rows.filter(
      (row) => row.agency_name === name && row.level === level,
    );
    const maleRows = entityRows.filter((row) => row.subgroup_desc === "Male");
    const femaleRows = entityRows.filter(
      (row) => row.subgroup_desc === "Female",
    );

    const maleMap = buildSchoolYearMap(maleRows);
    const femaleMap = buildSchoolYearMap(femaleRows);

    if (maleRows.length > 0) {
      series.push({
        label: isState ? "State — Male" : `${name} — Male`,
        color,
        values: valuesForYears(maleMap, years).map((value) =>
          Number.isFinite(value) ? value : 0,
        ),
        markerShape: "circle",
        strokeWidth: isState ? 2.5 : 2,
      });
    }

    if (femaleRows.length > 0) {
      series.push({
        label: isState ? "State — Female" : `${name} — Female`,
        color,
        values: valuesForYears(femaleMap, years).map((value) =>
          Number.isFinite(value) ? value : 0,
        ),
        dashArray: "2 4",
        markerShape: "diamond",
        strokeWidth: isState ? 2.5 : 2,
      });
    }

    if (maleRows.length > 0 && femaleRows.length > 0) {
      const combinedValues = years.map((year) => {
        const maleBucket = maleMap[year];
        const femaleBucket = femaleMap[year];
        if (!maleBucket || !femaleBucket) return Number.NaN;

        return weightedAvg(
          [...maleBucket.scores, ...femaleBucket.scores],
          [...maleBucket.counts, ...femaleBucket.counts],
        );
      });

      series.push({
        label: isState ? "State — M+F Combined" : `${name} — M+F Combined`,
        color,
        values: combinedValues.map((value) =>
          Number.isFinite(value) ? value : 0,
        ),
        dashArray: "8 3 2 3",
        markerShape: "square",
        opacity: 0.65,
        strokeWidth: isState ? 2.5 : 2,
      });
    }
  });

  return {
    subtitle: "By Gender · Solid = Male · Dotted = Female",
    chart: {
      title: `${subjectLabel} — ${formatGradeLabel(grades)}`,
      yLabel: "Average Scale Score",
      xLabel: "School Year",
      categories: years.map(formatSchoolYear),
      yTicks: buildTicks(series.flatMap((entry) => entry.values)),
      series,
    },
  };
}
