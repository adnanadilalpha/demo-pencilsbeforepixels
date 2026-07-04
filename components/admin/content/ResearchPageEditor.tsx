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

const PAGE_HEADER_FIELDS = [
  { key: "title", label: "Page title", type: "text" as const },
  { key: "subtitle", label: "Page subtitle", type: "textarea" as const },
];

const INTRO_FIELDS = [
  { key: "label", label: "Intro label", type: "text" as const },
  { key: "body", label: "Intro body", type: "textarea" as const },
];

type ResearchTab = {
  id: string;
  label: string;
  kind: "page_header" | "intro" | "research" | "academic";
  sectionId?: string;
};

const RESEARCH_TABS: ResearchTab[] = [
  { id: "page_header", label: "Page header", kind: "page_header" },
  { id: "intro", label: "Chart intro", kind: "intro" },
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
  const [activeTab, setActiveTab] = useState(RESEARCH_TABS[0]?.id ?? "page_header");

  const pageHeaderFormValues = useMemo(
    () => ({
      title: formValues.title,
      subtitle: formValues.subtitle,
    }),
    [formValues.title, formValues.subtitle],
  );

  const introFormValues = useMemo(
    () => ({
      label: formValues.label,
      body: formValues.body,
    }),
    [formValues.label, formValues.body],
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
        {active?.kind === "page_header" ? (
          <div className="space-y-4">
            <p className="text-xs text-body-muted">
              Main heading and subtitle at the top of{" "}
              <span className="font-medium text-navy-800">/research</span>, above
              the chart content.
            </p>
            <SectionForm
              title="Page header"
              fields={PAGE_HEADER_FIELDS}
              values={pageHeaderFormValues}
              onChange={onFormChange}
            />
          </div>
        ) : null}

        {active?.kind === "intro" ? (
          <div className="space-y-4">
            <p className="text-xs text-body-muted">
              Label and paragraph above the charts inside the research content
              area on <span className="font-medium text-navy-800">/research</span>.
            </p>
            <SectionForm
              title="Chart intro"
              fields={INTRO_FIELDS}
              values={introFormValues}
              onChange={onFormChange}
            />
          </div>
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
                PISA and NAEP chart copy on the research tab. Section intros,
                chart titles, descriptions, and PDFs are edited in the tabs
                above — chart data always comes from code.
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
