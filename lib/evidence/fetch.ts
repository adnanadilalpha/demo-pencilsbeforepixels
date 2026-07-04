import "server-only";

import { researchChartsData } from "@/lib/research/data";
import { mergeResearchWithFallback } from "@/lib/research/merge";
import { getSiteContent } from "@/lib/cms/cached";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/fetch-all";
import { getEquityScatterPanelData } from "./equity-scatter";
import {
  buildGenderPerformanceChart,
  buildPerformanceChart,
  colorForDistrictIndex,
} from "./builders";
import type {
  DistrictOption,
  EvidencePanelResponse,
  EvidenceSubject,
  EvidenceTab,
  EvidenceView,
  PerformancePanelData,
  ResearchPanelData,
  StudentGroup,
} from "./types";
import type { EvidenceScoreRow } from "./chart-utils";

const WESTSIDE_AGENCY_NAME = "WESTSIDE COMMUNITY SCHOOLS";
const DEFAULT_GRADES = ["03", "04", "05", "06", "07", "08"];

function subjectTable(subject: EvidenceSubject) {
  return subject === "math" ? "math_scores" : "english_scores";
}

function normalizeGrades(grades: string[]) {
  const normalized = grades
    .map((grade) => grade.padStart(2, "0"))
    .filter(Boolean);

  return normalized.length > 0 ? normalized : ["03"];
}

function mapSelectedDistricts(ids: string[]): DistrictOption[] {
  return ids.map((name, index) => ({
    id: name,
    name,
    color: colorForDistrictIndex(index),
  }));
}

async function fetchScoreRows(options: {
  subject: EvidenceSubject;
  grades: string[];
  subgroupType: "ALL" | "GENDER";
  levels: string[];
  agencyNames?: string[];
}) {
  const supabase = createAdminClient();
  const table = subjectTable(options.subject);
  const grades = normalizeGrades(options.grades);

  const rows = await fetchAllRows<EvidenceScoreRow>((from, to) => {
    let query = supabase
      .from(table)
      .select(
        "school_year, district_id, agency_name, avg_scale_score, count_tested, subgroup_desc, grade, level",
      )
      .in("level", options.levels)
      .eq("subgroup_type", options.subgroupType)
      .in("grade", grades)
      .order("school_year")
      .range(from, to);

    if (options.agencyNames && options.agencyNames.length > 0) {
      query = query.in("agency_name", options.agencyNames);
    }

    return query;
  });

  return rows;
}

export async function getSchoolYears(
  subject: EvidenceSubject,
): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from(subjectTable(subject))
    .select("school_year")
    .eq("level", "ST")
    .eq("subgroup_type", "ALL")
    .eq("grade", "03")
    .order("school_year");

  return [
    ...new Set(
      ((data as { school_year: string }[]) ?? []).map((row) => row.school_year),
    ),
  ];
}

export async function getAllDistrictOptions(
  subject: EvidenceSubject,
  subgroupType: "ALL" | "GENDER" = "ALL",
): Promise<DistrictOption[]> {
  const supabase = createAdminClient();
  const rows = await fetchAllRows<{ agency_name: string }>((from, to) =>
    supabase
      .from(subjectTable(subject))
      .select("agency_name")
      .eq("level", "DI")
      .eq("subgroup_type", subgroupType)
      .eq("grade", "03")
      .not("agency_name", "is", null)
      .order("agency_name")
      .range(from, to),
  );

  const uniqueNames = [...new Set(rows.map((row) => row.agency_name))];

  return uniqueNames.map((name, index) => ({
    id: name,
    name,
    color: colorForDistrictIndex(index),
  }));
}

async function getPerformancePanelData(options: {
  tab: EvidenceTab;
  subject: EvidenceSubject;
  grades: string[];
  districtIds: string[];
  includeState: boolean;
  studentGroupLabel?: string;
}): Promise<PerformancePanelData> {
  const isDistrict66 = options.tab === "district-66";
  const districtIds = isDistrict66
    ? [WESTSIDE_AGENCY_NAME]
    : options.districtIds;

  const [stateRows, districtRows] = await Promise.all([
    options.includeState
      ? fetchScoreRows({
          subject: options.subject,
          grades: options.grades,
          subgroupType: "ALL",
          levels: ["ST"],
        })
      : Promise.resolve([]),
    districtIds.length > 0
      ? fetchScoreRows({
          subject: options.subject,
          grades: options.grades,
          subgroupType: "ALL",
          levels: ["DI"],
          agencyNames: districtIds,
        })
      : Promise.resolve([]),
  ]);

  const districts = mapSelectedDistricts(districtIds);

  const { chart, subtitle } = buildPerformanceChart(
    options.subject,
    normalizeGrades(options.grades),
    options.studentGroupLabel ?? "All Students",
    stateRows,
    districtRows,
    districts,
    options.includeState,
  );

  return {
    panelType: "line",
    title: isDistrict66 ? "District 66" : "Nebraska",
    subtitle,
    chart,
    selectedDistricts: districts,
  };
}

async function getGenderLinePanelData(options: {
  tab: EvidenceTab;
  subject: EvidenceSubject;
  grades: string[];
  districtIds: string[];
  includeState: boolean;
}): Promise<PerformancePanelData> {
  const isDistrict66 = options.tab === "district-66";
  const districtIds = isDistrict66
    ? [WESTSIDE_AGENCY_NAME]
    : options.districtIds;

  const [stateRows, districtRows] = await Promise.all([
    options.includeState
      ? fetchScoreRows({
          subject: options.subject,
          grades: options.grades,
          subgroupType: "GENDER",
          levels: ["ST"],
        })
      : Promise.resolve([]),
    districtIds.length > 0
      ? fetchScoreRows({
          subject: options.subject,
          grades: options.grades,
          subgroupType: "GENDER",
          levels: ["DI"],
          agencyNames: districtIds,
        })
      : Promise.resolve([]),
  ]);

  const rows = [...stateRows, ...districtRows];
  const districts = mapSelectedDistricts(districtIds);
  const { chart, subtitle } = buildGenderPerformanceChart(
    options.subject,
    normalizeGrades(options.grades),
    rows,
    districts,
    options.includeState,
  );

  return {
    panelType: "line",
    title: isDistrict66 ? "District 66" : "Nebraska",
    subtitle,
    chart,
    selectedDistricts: districts,
  };
}

export async function getEvidenceBootstrapUncached() {
  const [allDistricts, schoolYears] = await Promise.all([
    getAllDistrictOptions("math"),
    getSchoolYears("math"),
  ]);

  const defaultSchoolYear =
    schoolYears[schoolYears.length - 1] ?? "2023-2024";

  const performance = await getPerformancePanelData({
    tab: "nebraska",
    subject: "math",
    grades: ["03"],
    districtIds: [],
    includeState: true,
  });

  return {
    allDistricts,
    grades: DEFAULT_GRADES,
    schoolYears,
    defaultSchoolYear,
    performance,
  };
}

async function getResearchPanelData(): Promise<ResearchPanelData> {
  try {
    const content = await getSiteContent();
    return mergeResearchWithFallback(content.research);
  } catch {
    return researchChartsData;
  }
}

export async function getEvidencePanelForView(
  tab: EvidenceTab,
  view: EvidenceView,
  filters: {
    subject: EvidenceSubject;
    grades: string[];
    districtIds: string[];
    schoolIds: string[];
    includeState: boolean;
    includeDistrictAvg: boolean;
    studentGroup: StudentGroup;
    schoolYear: string;
  },
): Promise<EvidencePanelResponse> {
  if (tab === "district-66") {
    if (view === "equity") {
      const { getDistrict66EquityPanelData } = await import("./district66");
      return getDistrict66EquityPanelData({
        subject: filters.subject,
        grades: filters.grades,
        schoolYear: filters.schoolYear,
      });
    }

    if (filters.studentGroup === "gender") {
      const { getDistrict66GenderPanelData } = await import("./district66");
      return getDistrict66GenderPanelData({
        subject: filters.subject,
        grades: filters.grades,
        schoolIds: filters.schoolIds,
        includeState: filters.includeState,
        includeDistrictAvg: filters.includeDistrictAvg,
      });
    }

    const { getDistrict66PerformancePanelData } = await import("./district66");
    return getDistrict66PerformancePanelData({
      subject: filters.subject,
      grades: filters.grades,
      schoolIds: filters.schoolIds,
      includeState: filters.includeState,
      includeDistrictAvg: filters.includeDistrictAvg,
    });
  }

  if (view === "equity") {
    return getEquityScatterPanelData({
      tab,
      subject: filters.subject,
      grades: filters.grades,
      schoolYear: filters.schoolYear,
      highlightIds: filters.districtIds,
    });
  }

  if (filters.studentGroup === "gender") {
    return getGenderLinePanelData({
      tab,
      subject: filters.subject,
      grades: filters.grades,
      districtIds: filters.districtIds,
      includeState: filters.includeState,
    });
  }

  return getPerformancePanelData({
    tab,
    subject: filters.subject,
    grades: filters.grades,
    districtIds: filters.districtIds,
    includeState: filters.includeState,
  });
}

export function parseGradesParam(
  gradesParam: string | null,
  legacyGradeParam: string | null,
): string[] {
  const source = gradesParam ?? legacyGradeParam ?? "03";
  return source
    .split(",")
    .map((grade) => grade.trim())
    .filter(Boolean);
}
