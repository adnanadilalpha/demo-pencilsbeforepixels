import { mergeResearchWithFallback } from "@/lib/research/merge";
import { researchChartsData } from "@/lib/research/data";
import type { ResearchChartsData } from "@/lib/research/types";
import type { SectionDraft } from "@/lib/admin/content-editor-types";
import { researchFieldKeys } from "@/lib/admin/content-config";
import { getResearchFieldValue, setResearchFieldValue } from "@/lib/admin/content-paths";

export { mergeResearchWithFallback };

export function applyResearchContentDraft(
  current: ResearchChartsData | undefined | null,
  content: SectionDraft,
): ResearchChartsData {
  let research = mergeResearchWithFallback(current);

  for (const key of researchFieldKeys) {
    if (Object.prototype.hasOwnProperty.call(content, key)) {
      research = setResearchFieldValue(research, key, content[key]);
    }
  }

  for (const [key, value] of Object.entries(content)) {
    if (key.startsWith("research.") && !researchFieldKeys.includes(key)) {
      research = setResearchFieldValue(research, key, value);
    }
  }

  return research;
}

export function buildResearchEditorContent(
  research: ResearchChartsData,
  formValues: Record<string, unknown>,
): Record<string, unknown> {
  const content: Record<string, unknown> = { ...formValues };

  for (const key of researchFieldKeys) {
    if (
      !Object.prototype.hasOwnProperty.call(content, key) ||
      content[key] === undefined
    ) {
      const value = getResearchFieldValue(research, key);
      if (value !== undefined) {
        content[key] = value;
      }
    }
  }

  return content;
}

export function isResearchPdfField(key: string): boolean {
  return key.startsWith("research.") && key.endsWith(".pdfUrl");
}
