"use client";

import { useMemo, useState } from "react";
import type { ContentEditorState } from "@/lib/admin/content-editor-types";
import type { AcademicDatasetCopy } from "@/lib/admin/academic-dataset-defaults";
import { researchEditorSections } from "@/lib/admin/research-field-definitions";
import { getResearchFieldValue } from "@/lib/admin/content-paths";
import { AcademicDatasetsEditor } from "@/components/admin/content/AcademicDatasetsEditor";
import { SectionForm } from "@/components/admin/content/SectionForm";
import { cn } from "@/lib/utils";

type ResearchPageEditorProps = {
  state: ContentEditorState;
  formValues: Record<string, unknown>;
  onFormChange: (key: string, value: unknown) => void;
  academicDatasets: AcademicDatasetCopy[];
  onAcademicDatasetsChange: (datasets: AcademicDatasetCopy[]) => void;
};

const RESEARCH_ACADEMIC_KEYS = ["pisa", "naep-grade-4", "naep-grade-8"];

const INTRO_FIELDS = [
  { key: "label", label: "Intro label", type: "text" as const },
  { key: "body", label: "Intro body", type: "textarea" as const },
];

const HEADER_FIELDS = [
  { key: "title", label: "Tab title", type: "text" as const },
  { key: "subtitle", label: "Tab subtitle", type: "textarea" as const },
];

type ResearchTab = {
  id: string;
  label: string;
  kind: "intro" | "header" | "research" | "academic";
  sectionId?: string;
};

const RESEARCH_TABS: ResearchTab[] = [
  { id: "intro", label: "Intro", kind: "intro" },
  { id: "header", label: "Page header", kind: "header" },
  ...researchEditorSections.map((section) => ({
    id: section.id,
    label: section.label,
    kind: "research" as const,
    sectionId: section.id,
  })),
  { id: "academic_charts", label: "Academic charts", kind: "academic" },
];

export function ResearchPageEditor({
  state,
  formValues,
  onFormChange,
  academicDatasets,
  onAcademicDatasetsChange,
}: ResearchPageEditorProps) {
  const [activeTab, setActiveTab] = useState(RESEARCH_TABS[0]?.id ?? "intro");

  const introValues = useMemo(
    () => state.sections["evidence.intro"] ?? {},
    [state.sections],
  );
  const headerValues = useMemo(
    () => state.sections["evidence.research_tab"] ?? {},
    [state.sections],
  );

  const researchValues = useMemo(() => {
    const values: Record<string, unknown> = {};
    for (const section of researchEditorSections) {
      for (const field of section.fields) {
        values[field.key] = getResearchFieldValue(state.research, field.key);
      }
    }
    return { ...values, ...formValues };
  }, [formValues, state.research]);

  const active = RESEARCH_TABS.find((tab) => tab.id === activeTab) ?? RESEARCH_TABS[0];
  const scopedAcademic = academicDatasets.filter((dataset) =>
    RESEARCH_ACADEMIC_KEYS.includes(dataset.key),
  );

  const updateScopedAcademic = (nextScoped: AcademicDatasetCopy[]) => {
    const byKey = new Map(nextScoped.map((item) => [item.key, item]));
    onAcademicDatasetsChange(
      academicDatasets.map((dataset) => byKey.get(dataset.key) ?? dataset),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-navy-800">Research</h2>
        <p className="mt-1 text-sm text-body-muted">
          Edit research page content using the sections below.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-[12px] border border-navy-800/10 bg-paper-50 p-2">
        {RESEARCH_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "bg-navy-800 text-white"
                : "text-body-muted hover:bg-white hover:text-navy-800",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-[14px] border border-navy-800/8 bg-white p-5 sm:p-6">
        {active?.kind === "intro" ? (
          <SectionForm
            title="Research intro"
            fields={INTRO_FIELDS}
            values={{ ...introValues, ...formValues }}
            onChange={onFormChange}
          />
        ) : null}

        {active?.kind === "header" ? (
          <SectionForm
            title="Research page header"
            fields={HEADER_FIELDS}
            values={{ ...headerValues, ...formValues }}
            onChange={onFormChange}
          />
        ) : null}

        {active?.kind === "research" && active.sectionId ? (
          <SectionForm
            title={
              researchEditorSections.find((section) => section.id === active.sectionId)
                ?.label ?? "Research section"
            }
            fields={
              researchEditorSections.find((section) => section.id === active.sectionId)
                ?.fields ?? []
            }
            values={researchValues}
            onChange={onFormChange}
          />
        ) : null}

        {active?.kind === "academic" ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-navy-800">Academic charts</h3>
              <p className="mt-1 text-xs text-body-muted">
                PISA and NAEP chart copy on the research tab. PARCC, screen time,
                and other research charts are edited in their sections above —
                chart data always comes from code.
              </p>
            </div>
            <AcademicDatasetsEditor
              datasets={scopedAcademic}
              onChange={updateScopedAcademic}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
