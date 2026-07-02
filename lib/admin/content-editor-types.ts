import type { AcademicDatasetCopy } from "@/lib/admin/academic-dataset-defaults";
import type {
  EditableLibraryItem,
  EditableNavLink,
  MentalHealthLegendItem,
  SiteSettingsDraft,
} from "@/lib/admin/cms-entity-types";
import type { EditableScoreRow } from "@/lib/admin/evidence-scores";
import type { SectionKey } from "@/lib/cms/types";
import type { ExpertQuote, OptOutStep, TimelineSlide, SoftwareReview } from "@/lib/cms/types";
import type { ResearchChartsData } from "@/lib/research/types";

export type SectionDraft = Record<string, unknown> & { visible?: boolean };

export type ContentEditorState = {
  version: string;
  publishedAt: string;
  hasDrafts: boolean;
  sections: Partial<Record<SectionKey, SectionDraft>>;
  research: ResearchChartsData;
  expertQuotes: ExpertQuote[];
  timeline: TimelineSlide[];
  mentalHealthChartImage: string;
  softwareReviews: {
    epic: SoftwareReview;
    ixl: SoftwareReview;
  };
  academicDatasets: AcademicDatasetCopy[];
  siteSettings: SiteSettingsDraft;
  navigation: {
    header: EditableNavLink[];
    footer: EditableNavLink[];
  };
  libraryItems: EditableLibraryItem[];
  optOutSteps: OptOutStep[];
};

export type ContentSavePayload = {
  sectionKey?: SectionKey;
  sectionId: string;
  content: SectionDraft;
  research?: ResearchChartsData;
  expertQuotes?: ExpertQuote[];
  timeline?: TimelineSlide[];
  mentalHealthChartImage?: string;
  softwareReviews?: ContentEditorState["softwareReviews"];
  academicDatasets?: AcademicDatasetCopy[];
  evidenceScores?: EditableScoreRow[];
  siteSettings?: SiteSettingsDraft;
  navigation?: ContentEditorState["navigation"];
  libraryItems?: EditableLibraryItem[];
  optOutSteps?: OptOutStep[];
  mentalHealthLegend?: MentalHealthLegendItem[];
};
