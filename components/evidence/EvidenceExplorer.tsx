"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  BarChart3,
  BookOpen,
  Download,
  LineChart,
  Map,
  Minus,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { EvidenceLineChart } from "@/components/charts/EvidenceLineChart";
import { EvidenceScatterChart } from "@/components/charts/EvidenceScatterChart";
import {
  EvidenceDistrictList,
  EvidenceDistrictSelect,
} from "@/components/evidence/EvidenceDistrictSelect";
import { EvidenceGradeSelect } from "@/components/evidence/EvidenceGradeSelect";
import { EvidenceShowLinesSelect } from "@/components/evidence/EvidenceShowLinesSelect";
import { EvidenceEquityRankings } from "@/components/evidence/EvidenceEquityRankings";
import { EvidenceResearchTab } from "@/components/evidence/research/EvidenceResearchTab";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type {
  DistrictOption,
  EvidenceBootstrap,
  EvidencePanelResponse,
  EvidenceSubject,
  EvidenceTab,
  EvidenceView,
  PerformancePanelData,
  StudentGroup,
} from "@/lib/evidence/types";
import { colorForDistrictIndex } from "@/lib/evidence/builders";
import { formatSchoolYear } from "@/lib/evidence/chart-utils";
import { DISTRICT_66_AVG_LABEL } from "@/lib/evidence/district66-constants";
import {
  fetchCachedDistricts,
  fetchCachedEvidencePanel,
  fetchCachedSchoolYears,
  fetchCachedSchools,
  getClientEvidenceBootstrap,
} from "@/lib/evidence/fetch-client";
import { cn } from "@/lib/utils";

const TABS: {
  id: EvidenceTab;
  label: string;
  icon: typeof Map;
}[] = [
  { id: "nebraska", label: "Nebraska", icon: Map },
  { id: "district-66", label: "District 66", icon: BarChart3 },
  { id: "research", label: "Research", icon: BookOpen },
];

const SUBJECTS: { id: EvidenceSubject; label: string }[] = [
  { id: "math", label: "Mathematics" },
  { id: "english", label: "English Language Arts" },
];

const TAB_COPY: Record<
  EvidenceTab,
  {
    title: string;
    subtitle: string;
    tagline?: string;
    viewDescription?: string;
  }
> = {
  nebraska: {
    title: "Nebraska",
    subtitle:
      "Average scale score trends by district, grade, and student group",
  },
  "district-66": {
    title: "District 66",
    tagline: "WESTSIDE COMMUNITY SCHOOLS",
    subtitle:
      "Westside Community Schools performance trends by grade and student group",
    viewDescription:
      "Compare individual school trends against district and state averages over time.",
  },
  research: {
    title: "Research Charts",
    subtitle:
      "Findings from NAEP, PISA, TIMSS, PIRLS and peer-reviewed research — documenting the relationship between digital device use and academic performance across the United States and internationally.",
  },
};


function isLinePanel(
  panel: EvidencePanelResponse,
): panel is PerformancePanelData {
  return panel.panelType === "line";
}

export function EvidenceExplorer({ bootstrap }: { bootstrap: EvidenceBootstrap }) {
  const defaults = useMemo(
    () => ({
      tab: "nebraska" as EvidenceTab,
      view: "performance" as EvidenceView,
      subject: "math" as EvidenceSubject,
      grade: "03",
      grades: ["03"] as string[],
      studentGroup: "all" as StudentGroup,
      includeState: true,
      includeDistrictAvg: true,
      selectedDistrictIds: [] as string[],
      selectedSchoolIds: [] as string[],
      schoolYear: bootstrap.defaultSchoolYear,
    }),
    [bootstrap.defaultSchoolYear],
  );

  const [tab, setTab] = useState<EvidenceTab>(defaults.tab);
  const [view, setView] = useState<EvidenceView>(defaults.view);
  const [subject, setSubject] = useState<EvidenceSubject>(defaults.subject);
  const [selectedGrades, setSelectedGrades] = useState<string[]>(
    defaults.grades,
  );
  const [studentGroup, setStudentGroup] = useState<StudentGroup>(
    defaults.studentGroup,
  );
  const [includeState, setIncludeState] = useState(defaults.includeState);
  const [includeDistrictAvg, setIncludeDistrictAvg] = useState(
    defaults.includeDistrictAvg,
  );
  const [selectedDistrictIds, setSelectedDistrictIds] = useState<string[]>(
    defaults.selectedDistrictIds,
  );
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>(
    defaults.selectedSchoolIds,
  );
  const [schoolOptions, setSchoolOptions] = useState<DistrictOption[]>([]);
  const [equityHighlightIds, setEquityHighlightIds] = useState<string[]>([]);
  const [equityDistricts, setEquityDistricts] = useState<DistrictOption[]>([]);
  const [schoolYear, setSchoolYear] = useState(defaults.schoolYear);
  const [schoolYears, setSchoolYears] = useState(bootstrap.schoolYears);
  const [allDistricts, setAllDistricts] = useState(bootstrap.allDistricts);
  const [panel, setPanel] = useState<EvidencePanelResponse>(bootstrap.performance);
  const [evidenceVersion, setEvidenceVersion] = useState(bootstrap.version);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    getClientEvidenceBootstrap(bootstrap)
      .then((next) => {
        if (cancelled) return;
        setEvidenceVersion(next.version);
        setAllDistricts(next.allDistricts);
        setSchoolYears(next.schoolYears);
        setPanel(next.performance);
        setSchoolYear((current) =>
          !next.schoolYears.includes(current) ? next.defaultSchoolYear : current,
        );
      })
      .catch(() => {
        // Keep server-rendered bootstrap on cache errors.
      });

    return () => {
      cancelled = true;
    };
  }, [bootstrap]);

  useEffect(() => {
    if (!evidenceVersion) return;

    if (tab === "district-66") {
      void Promise.all([
        fetchCachedSchools(evidenceVersion, subject),
        fetchCachedSchoolYears(evidenceVersion, subject, "district-66"),
      ]).then(([schools, years]) => {
        setSchoolOptions(schools);
        if (years.length > 0) {
          setSchoolYears(years);
          setSchoolYear((current) =>
            years.includes(current) ? current : (years[years.length - 1] as string),
          );
        }
      });
      return;
    }

    void Promise.all([
      fetchCachedDistricts(evidenceVersion, subject),
      fetchCachedSchoolYears(evidenceVersion, subject, "nebraska"),
    ]).then(([districts, years]) => {
      setAllDistricts(districts);
      if (years.length > 0) {
        setSchoolYears(years);
        setSchoolYear((current) =>
          years.includes(current) ? current : (years[years.length - 1] as string),
        );
      }
    });
  }, [evidenceVersion, subject, tab]);

  const fetchPanel = useCallback(
    async (
      nextTab: EvidenceTab,
      nextView: EvidenceView,
      nextSubject: EvidenceSubject,
      nextGrades: string[],
      nextDistrictIds: string[],
      nextEquityHighlightIds: string[],
      nextSchoolIds: string[],
      nextIncludeState: boolean,
      nextIncludeDistrictAvg: boolean,
      nextStudentGroup: StudentGroup,
      nextSchoolYear: string,
    ) => {
      if (nextTab === "research") return;

      const params = new URLSearchParams({
        tab: nextTab,
        view: nextView,
        subject: nextSubject,
        grade: nextGrades[0] ?? "03",
        grades: nextGrades.join(","),
        includeState: String(nextIncludeState),
        includeDistrictAvg: String(nextIncludeDistrictAvg),
        studentGroup: nextStudentGroup,
        schoolYear: nextSchoolYear,
        schoolIds: nextTab === "district-66" ? nextSchoolIds.join(",") : "",
        districtIds:
          nextTab === "district-66"
            ? ""
            : nextView === "equity"
              ? nextEquityHighlightIds.join(",")
              : nextDistrictIds.join(","),
      });

      const response = await fetchCachedEvidencePanel(evidenceVersion, params);
      if (!response) return;
      const data = response;
      setPanel(data);
      if (data.panelType === "equity" && nextTab === "nebraska") {
        setEquityDistricts(data.availableDistricts);
      }
    },
    [evidenceVersion],
  );

  useEffect(() => {
    if (tab === "research" || !evidenceVersion) return;

    startTransition(() => {
      void fetchPanel(
        tab,
        view,
        subject,
        selectedGrades,
        selectedDistrictIds,
        equityHighlightIds,
        selectedSchoolIds,
        includeState,
        includeDistrictAvg,
        studentGroup,
        schoolYear,
      );
    });
  }, [
    tab,
    view,
    subject,
    selectedGrades,
    selectedDistrictIds,
    equityHighlightIds,
    selectedSchoolIds,
    includeState,
    includeDistrictAvg,
    studentGroup,
    schoolYear,
    fetchPanel,
    evidenceVersion,
  ]);

  const handleTabChange = (nextTab: EvidenceTab) => {
    setTab(nextTab);
    if (nextTab === "district-66") {
      setSelectedGrades(["03"]);
      setSelectedSchoolIds([]);
      setIncludeDistrictAvg(true);
      setIncludeState(true);
    }
  };

  const handleClearFilters = () => {
    setSubject(defaults.subject);
    setSelectedGrades(defaults.grades);
    setStudentGroup(defaults.studentGroup);
    setIncludeState(defaults.includeState);
    setIncludeDistrictAvg(defaults.includeDistrictAvg);
    setSelectedDistrictIds([]);
    setSelectedSchoolIds([]);
    setEquityHighlightIds([]);
    setSchoolYear(bootstrap.defaultSchoolYear);
  };

  const selectedDistricts = useMemo(
    () =>
      selectedDistrictIds.map((id, index) => ({
        id,
        name: id,
        color: colorForDistrictIndex(index),
      })),
    [selectedDistrictIds],
  );

  const copy = TAB_COPY[tab];
  const linePanel = isLinePanel(panel) ? panel : null;
  const selectedSchools = useMemo(
    () =>
      linePanel?.selectedDistricts ??
      selectedSchoolIds.map((id, index) => ({
        id,
        name: id,
        color: colorForDistrictIndex(index),
      })),
    [linePanel?.selectedDistricts, selectedSchoolIds],
  );
  const isDistrict66 = tab === "district-66";
  const showStateReference =
    !isDistrict66 &&
    includeState &&
    (studentGroup === "gender" ||
      Boolean(
        linePanel?.chart.series.some(
          (series) => series.label === "State Average Benchmark",
        ),
      ));
  const showDistrict66Reference =
    isDistrict66 && view === "performance";

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 lg:gap-12">
      <div className="flex items-center gap-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium leading-[18px] text-navy-800 transition-opacity hover:opacity-70"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.5} />
          Back
        </Link>
        <div className="h-[18px] w-px bg-[#e9e6df]" aria-hidden />
      </div>

      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-6 border-b border-[#e9e6df] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-8">
          <div className="flex min-w-0 flex-col gap-4">
            <h1 className="font-display text-[32px] leading-display text-[#18263a] sm:text-[40px] lg:text-[48px]">
              {copy.title}
            </h1>
            {copy.tagline ? (
              <p className="text-base leading-ui-label text-[#6b7280] sm:leading-single">
                {copy.tagline}
              </p>
            ) : (
              <p className="max-w-3xl text-base leading-snug text-[#6b7280] lg:text-lg">
                {copy.subtitle}
              </p>
            )}
          </div>

          <div className="-mx-4 flex h-14 w-[calc(100%+2rem)] shrink-0 items-start overflow-x-auto px-4 sm:mx-0 sm:w-auto sm:justify-self-end sm:overflow-visible sm:px-0">
            {TABS.map((entry) => {
              const Icon = entry.icon;
              const isActive = tab === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleTabChange(entry.id)}
                  className={cn(
                    "flex h-full min-w-[104px] flex-1 items-center justify-center gap-1.5 border-b-[1.5px] px-3 pb-1.5 text-xs leading-[18px] text-navy-800 transition-colors sm:min-w-0 sm:flex-none sm:px-5",
                    isActive
                      ? "border-gold-accent font-semibold"
                      : "border-transparent font-normal opacity-80 hover:opacity-100",
                  )}
                >
                  <Icon className="size-3 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                  {entry.label}
                </button>
              );
            })}
          </div>
        </div>

        {tab !== "research" && (
          <>
            <div className="flex w-full min-w-0 max-w-full flex-col gap-4 sm:w-fit">
              <div className="flex w-full rounded-full border border-gold-500 p-1 sm:w-fit">
                <button
                  type="button"
                  onClick={() => setView("performance")}
                  className={cn(
                    "flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-center text-xs leading-control transition-colors sm:h-10 sm:w-[220px] sm:flex-none sm:px-6 sm:py-0 sm:text-[13px] sm:leading-single sm:whitespace-nowrap xl:w-[240px]",
                    view === "performance"
                      ? "bg-gold-500 font-semibold text-slate-50"
                      : "font-normal text-[#6b7280] hover:text-navy-800",
                  )}
                >
                  <LineChart className="size-3" strokeWidth={2} />
                  Performance Over Time
                </button>
                <button
                  type="button"
                  onClick={() => setView("equity")}
                  className={cn(
                    "flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-center text-xs leading-control transition-colors sm:h-10 sm:w-[220px] sm:flex-none sm:px-6 sm:py-0 sm:text-[13px] sm:leading-single sm:whitespace-nowrap xl:w-[240px]",
                    view === "equity"
                      ? "bg-gold-500 font-semibold text-slate-50"
                      : "font-normal text-[#6b7280] hover:text-navy-800",
                  )}
                >
                  <TrendingUp className="size-3" strokeWidth={1.5} />
                  Equity Analysis
                </button>
              </div>
              {copy.viewDescription && view === "performance" ? (
                <p className="max-w-3xl text-base leading-snug text-[#6b7280] lg:text-lg">
                  {copy.viewDescription}
                </p>
              ) : null}
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-4 sm:gap-6 md:flex md:flex-wrap md:items-end md:gap-x-5 md:gap-y-4 lg:gap-x-6 lg:gap-y-5">
              <FilterField label="Subject">
                <Select
                  value={subject}
                  onValueChange={(value) => setSubject(value as EvidenceSubject)}
                >
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((entry) => (
                      <SelectItem key={entry.id} value={entry.id}>
                        {entry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label="Grade">
                <EvidenceGradeSelect
                  grades={bootstrap.grades}
                  selectedGrades={selectedGrades}
                  onChange={setSelectedGrades}
                />
              </FilterField>

              {view === "performance" ? (
                <>
                  <FilterField label="Student Group">
                    <ToggleGroup
                      type="single"
                      value={studentGroup}
                      onValueChange={(value) => {
                        if (!value) return;
                        setStudentGroup(value as StudentGroup);
                      }}
                      className="flex h-10 w-full rounded-full border border-navy-500 p-1"
                    >
                      <ToggleGroupItem
                        value="all"
                        className="flex-1 whitespace-nowrap text-xs leading-single sm:text-[13px]"
                      >
                        <span className="sm:hidden">All</span>
                        <span className="hidden sm:inline">All Students</span>
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="gender"
                        className="flex-1 whitespace-nowrap text-xs leading-single sm:text-[13px]"
                      >
                        <span className="sm:hidden">Gender</span>
                        <span className="hidden sm:inline">By Gender</span>
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FilterField>

                  {tab === "nebraska" && (
                    <FilterField label="District">
                      <EvidenceDistrictSelect
                        districts={allDistricts}
                        selectedIds={selectedDistrictIds}
                        onChange={setSelectedDistrictIds}
                        placeholder="Select Districts..."
                      />
                    </FilterField>
                  )}

                  {tab === "district-66" && (
                    <FilterField label="School">
                      <EvidenceDistrictSelect
                        districts={schoolOptions}
                        selectedIds={selectedSchoolIds}
                        onChange={setSelectedSchoolIds}
                        placeholder="Select Schools..."
                        compactLabels
                      />
                    </FilterField>
                  )}

                  {tab === "nebraska" && (
                    <FilterCompactGroup>
                      <FilterField label="State" compact>
                        <ToggleGroup
                          type="single"
                          value={includeState ? "on" : "off"}
                          onValueChange={(value) => {
                            if (!value) return;
                            setIncludeState(value === "on");
                          }}
                          className="flex h-10 w-full rounded-full border border-navy-800 p-1 sm:w-auto"
                        >
                          <ToggleGroupItem
                            value="on"
                            className="flex-1 whitespace-nowrap text-xs leading-single sm:w-16 sm:flex-none sm:text-[13px] data-[state=on]:bg-[#16a34a] data-[state=on]:text-slate-50"
                          >
                            ON
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="off"
                            className="flex-1 whitespace-nowrap text-xs leading-single sm:w-16 sm:flex-none sm:text-[13px]"
                          >
                            OFF
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </FilterField>
                      <ClearFilterButton onClick={handleClearFilters} />
                    </FilterCompactGroup>
                  )}

                  {tab === "district-66" && (
                    <FilterCompactGroup growOnDesktop>
                      <FilterField label="Show Lines" compact growOnDesktop>
                        <EvidenceShowLinesSelect
                          showState={includeState}
                          showDistrictAvg={includeDistrictAvg}
                          onToggleState={() => setIncludeState((current) => !current)}
                          onToggleDistrictAvg={() =>
                            setIncludeDistrictAvg((current) => !current)
                          }
                        />
                      </FilterField>
                      <ClearFilterButton onClick={handleClearFilters} />
                    </FilterCompactGroup>
                  )}
                </>
              ) : tab === "nebraska" ? (
                <FilterField label="District">
                  <EvidenceDistrictSelect
                    districts={equityDistricts}
                    selectedIds={equityHighlightIds}
                    onChange={setEquityHighlightIds}
                    placeholder="Highlight Districts..."
                    compactLabels
                  />
                </FilterField>
              ) : null}

              {view === "equity" && (
                <FilterField label="School Year">
                  <Select value={schoolYear} onValueChange={setSchoolYear}>
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolYears.map((entry) => (
                        <SelectItem key={entry} value={entry}>
                          {formatSchoolYear(entry)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterField>
              )}

              {view === "equity" && (
                <div className="col-span-2 md:col-span-1 md:w-auto md:flex-none">
                  <ClearFilterButton onClick={handleClearFilters} />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {tab === "research" ? (
        <EvidenceResearchTab />
      ) : panel.panelType === "equity" ? (
        <div className={cn("flex flex-col gap-6 lg:gap-8", isPending && "opacity-70")}>
          <p className="max-w-4xl text-sm leading-relaxed text-[#6b7280] sm:text-base">
            {isDistrict66
              ? "Each school is plotted by its poverty rate vs. average score. Schools "
              : "Each point represents a district, showing its FRL% and average scale score. Districts "}
            <span className="font-medium text-[#16a34a]">above the line</span>{" "}
            are performing better than expected, while those{" "}
            <span className="font-medium text-[#dc2626]">below the line</span>{" "}
            are underperforming.
          </p>

          <div className="flex min-h-0 flex-col rounded-lg bg-slate-50 p-4 shadow-[0_1px_3px_rgba(10,22,40,0.10),0_1px_2px_rgba(10,22,40,0.06)] sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-col gap-3 sm:gap-4">
                <h2 className="text-lg leading-display text-[#18263a] lg:text-2xl">
                  {panel.title}
                </h2>
                <p className="text-sm leading-snug text-navy-800 lg:text-base lg:leading-4">
                  {panel.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#16a34a]/10 px-3 py-1.5 text-xs text-[#16a34a] sm:text-sm">
                  <ArrowUp className="size-3.5" />
                  Above line — Outperforming
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#dc2626]/10 px-3 py-1.5 text-xs text-[#dc2626] sm:text-sm">
                  <ArrowDown className="size-3.5" />
                  Below line — Underperforming
                </span>
                <span className="inline-flex items-center gap-2 text-xs text-[#6b7280] sm:text-sm">
                  <Minus className="size-4 rotate-90 text-slate-400" />
                  Expected trend
                </span>
              </div>
            </div>

            <EvidenceScatterChart panel={panel} />
          </div>

          <EvidenceEquityRankings
            overperformers={panel.overperformers}
            underperformers={panel.underperformers}
          />
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-8",
            isPending && "opacity-70",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col rounded-lg bg-slate-50 p-4 shadow-[0_1px_3px_rgba(10,22,40,0.10),0_1px_2px_rgba(10,22,40,0.06)] sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
                <h2 className="text-lg leading-display text-[#18263a] lg:text-2xl">
                  {linePanel?.chart.title}
                </h2>
                <p className="text-sm leading-snug text-navy-800 lg:text-base lg:leading-4">
                  {linePanel?.subtitle}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1.5 self-start whitespace-nowrap text-sm font-medium leading-single text-navy-800 transition-opacity hover:opacity-70 sm:self-auto lg:text-lg"
              >
                <Download className="size-4" strokeWidth={1} />
                Download PDF
              </button>
            </div>
            {linePanel && <EvidenceLineChart chart={linePanel.chart} />}
          </div>

          <aside className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:flex xl:w-[320px] xl:shrink-0 xl:flex-col xl:gap-8">
            <div className="rounded-lg bg-slate-50 p-4 shadow-[0_1px_3px_rgba(10,22,40,0.10),0_1px_2px_rgba(10,22,40,0.06)] sm:p-6">
              <div className="flex flex-col gap-6 sm:gap-8">
                <div className="flex flex-col gap-4">
                  <h3 className="text-base leading-display text-[#18263a] lg:text-lg">
                    Line Style
                  </h3>
                  <ul className="flex flex-col gap-6">
                    {studentGroup === "gender" ? (
                      <>
                        <LineStyleLegendItem
                          dashArray={undefined}
                          marker="circle"
                          title="Male"
                          subtitle="Solid line"
                        />
                        <LineStyleLegendItem
                          dashArray="2 4"
                          marker="diamond"
                          title="Female"
                          subtitle="Dotted line"
                        />
                        <LineStyleLegendItem
                          dashArray="8 3 2 3"
                          marker="square"
                          title="M+F Combined"
                          subtitle="Weighted average"
                        />
                      </>
                    ) : (
                      <li className="flex items-center gap-6">
                        <span
                          className="size-2.5 shrink-0 rounded-full bg-slate-400"
                          aria-hidden
                        />
                        <span className="text-base leading-4 text-[#18263a]/70">
                          All Students
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                {showStateReference && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-base leading-display text-[#18263a] lg:text-lg">
                      Reference
                    </h3>
                    <div className="flex items-start gap-6">
                      <span
                        className="mt-1 size-2.5 shrink-0 rotate-45 rounded-sm bg-[#b91c1c]"
                        aria-hidden
                      />
                      <div className="flex flex-col gap-2">
                        <span className="text-base leading-4 text-[#18263a]/70">
                          State Average
                        </span>
                        <span className="text-sm leading-[14px] text-[#18263a]/60">
                          Benchmark
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {showDistrict66Reference && (
                  <div className="flex min-h-0 flex-col gap-4 sm:min-h-[132px]">
                    <h3 className="text-base leading-display text-[#18263a] lg:text-lg">
                      Reference
                    </h3>
                    <div className="flex flex-col gap-4">
                      <ReferenceLegendRow
                        active={includeState}
                        markerClassName="rotate-45 rounded-sm bg-[#b91c1c]"
                        title="State Average"
                        subtitle="Benchmark"
                      />
                      <ReferenceLegendRow
                        active={includeDistrictAvg}
                        markerClassName="rounded-full bg-[#1e40af]"
                        title={DISTRICT_66_AVG_LABEL}
                        subtitle="District benchmark"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {tab === "nebraska" && view === "performance" && (
              <div className="flex shrink-0 flex-col rounded-lg bg-slate-50 p-4 shadow-[0_1px_3px_rgba(10,22,40,0.10),0_1px_2px_rgba(10,22,40,0.06)] sm:p-6">
                <div className="mb-4 flex shrink-0 items-center justify-between">
                  <h3 className="text-base font-semibold leading-display text-[#18263a] lg:text-lg">
                    Selected Districts
                  </h3>
                  <span className="flex size-[22px] items-center justify-center rounded-full bg-navy-500 text-sm leading-[14px] text-slate-50">
                    {selectedDistricts.length}
                  </span>
                </div>
                {selectedDistricts.length > 0 ? (
                  <div className="max-h-[200px] overflow-y-auto overscroll-contain pr-1">
                    <EvidenceDistrictList
                      districts={selectedDistricts}
                      onRemove={(id) =>
                        setSelectedDistrictIds((current) =>
                          current.filter((entry) => entry !== id),
                        )
                      }
                    />
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-[#6b7280]">
                    No districts selected. Use the District filter to add
                    districts to the chart.
                  </p>
                )}
              </div>
            )}

            {tab === "district-66" && view === "performance" && (
              <div className="flex shrink-0 flex-col rounded-lg bg-slate-50 p-4 shadow-[0_1px_3px_rgba(10,22,40,0.10),0_1px_2px_rgba(10,22,40,0.06)] sm:p-6">
                <div className="mb-4 flex shrink-0 items-center justify-between">
                  <h3 className="text-base font-semibold leading-display text-[#18263a] lg:text-lg">
                    Selected Schools
                  </h3>
                  <span className="flex size-[22px] items-center justify-center rounded-full bg-navy-500 text-sm leading-[14px] text-slate-50">
                    {selectedSchools.length}
                  </span>
                </div>
                {selectedSchools.length > 0 ? (
                  <div className="max-h-[200px] overflow-y-auto overscroll-contain pr-1">
                    <EvidenceDistrictList
                      districts={selectedSchools}
                      onRemove={(id) =>
                        setSelectedSchoolIds((current) =>
                          current.filter((entry) => entry !== id),
                        )
                      }
                      compactLabels
                    />
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-[#6b7280]">
                    No schools selected. Use the School filter to add schools to
                    the chart.
                  </p>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function ReferenceLegendRow({
  active,
  markerClassName,
  title,
  subtitle,
}: {
  active: boolean;
  markerClassName: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-6 transition-opacity",
        !active && "opacity-35",
      )}
    >
      <span
        className={cn("mt-1 size-2.5 shrink-0", markerClassName)}
        aria-hidden
      />
      <div className="flex flex-col gap-2">
        <span className="text-base leading-4 text-[#18263a]/70">{title}</span>
        <span className="text-sm leading-[14px] text-[#18263a]/60">
          {subtitle}
        </span>
      </div>
    </div>
  );
}

function LineStyleLegendItem({
  dashArray,
  marker,
  title,
  subtitle,
}: {
  dashArray?: string;
  marker: "circle" | "diamond" | "square";
  title: string;
  subtitle: string;
}) {
  return (
    <li className="flex items-center gap-6">
      <svg width="36" height="12" aria-hidden>
        <line
          x1="0"
          y1="6"
          x2="36"
          y2="6"
          stroke="#94A3B8"
          strokeWidth="2.5"
          strokeDasharray={dashArray}
        />
        {marker === "circle" && (
          <circle cx="18" cy="6" r="3.5" fill="#94A3B8" />
        )}
        {marker === "diamond" && (
          <rect
            x="15"
            y="3"
            width="6"
            height="6"
            fill="#94A3B8"
            transform="rotate(45 18 6)"
          />
        )}
        {marker === "square" && (
          <rect x="14.5" y="2.5" width="7" height="7" fill="#94A3B8" />
        )}
      </svg>
      <div className="flex flex-col gap-1">
        <span className="text-base leading-4 text-[#18263a]/70">{title}</span>
        <span className="text-sm leading-[14px] text-[#18263a]/60">
          {subtitle}
        </span>
      </div>
    </li>
  );
}

function FilterCompactGroup({
  children,
  growOnDesktop = false,
}: {
  children: React.ReactNode;
  growOnDesktop?: boolean;
}) {
  return (
    <div
      className={cn(
        "col-span-2 flex min-w-0 flex-wrap items-end gap-3 sm:flex-nowrap md:w-auto md:flex-none",
        growOnDesktop && "xl:min-w-0 xl:flex-[1_1_18rem] xl:max-w-88",
      )}
    >
      {children}
    </div>
  );
}

function ClearFilterButton({ onClick }: { onClick: () => void }) {
  return (
    <FilterField
      label="Actions"
      compact
      className="md:w-auto md:flex-none [&_label]:invisible [&_label]:pointer-events-none [&_label]:select-none xl:w-auto xl:flex-none"
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Clear filters"
        className="h-10 w-full whitespace-nowrap rounded-full border border-navy-800 px-6 text-xs font-semibold leading-single text-navy-800 transition-colors hover:bg-paper-200 sm:w-auto sm:text-[13px]"
      >
        Clear
      </button>
    </FilterField>
  );
}

function FilterField({
  label,
  children,
  className,
  compact = false,
  growOnDesktop = false,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  growOnDesktop?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        compact
          ? cn(
              "w-auto min-w-0 flex-none justify-self-start",
              growOnDesktop && "xl:min-w-0 xl:flex-1",
            )
          : "w-full min-w-0 md:flex-[1_1_10.5rem] md:max-w-[calc(50%-0.625rem)] lg:flex-[1_1_11rem] lg:max-w-[calc(33.333%-1rem)] xl:max-w-[16rem]",
        className,
      )}
    >
      <Label className="text-sm leading-ui-label text-black sm:leading-single">{label}</Label>
      {children}
    </div>
  );
}
