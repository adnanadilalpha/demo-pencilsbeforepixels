import type { AcademicDataset } from "@/lib/academic-data/types";
import type { ResearchChartsData } from "@/lib/research/types";

export type NavLink = {
  label: string;
  href: string;
};

export type SectionKey =
  | "homepage.hero"
  | "homepage.problem"
  | "homepage.statement"
  | "homepage.goal"
  | "homepage.academic_data"
  | "homepage.learning_apps"
  | "homepage.expert_voices"
  | "homepage.mental_health"
  | "homepage.research_library"
  | "homepage.device_opt_out"
  | "homepage.footer"
  | "evidence.intro";

export type SectionContent = Record<string, unknown>;

export type ExpertQuote = {
  number: string;
  quote: string;
  name: string;
  title: string;
  image: string;
};

export type TimelineSlide = {
  era: string;
  number: string;
  title: string;
  description: string;
  image: string;
  background: string;
  textColor: "light" | "dark";
  eraStyle: "large" | "compact";
  indentContent: boolean;
};

export type LibraryCategory =
  | "Books"
  | "Research Papers"
  | "Videos"
  | "Parent Resources";

export type LibraryItem = {
  title: string;
  subtitle: string;
  kind: "book" | "paper" | "video" | "resource";
  image?: string;
};

export type OptOutStep = {
  number: string;
  title: string;
  description: string;
};

export type ResearchNote = {
  label: string;
  summary: string;
  note: string;
};

export type SoftwareReview = {
  slug: "epic" | "ixl";
  title: string;
  summary?: string;
  youtubeId?: string;
  vendorResearch?: ResearchNote;
  independentResearch?: ResearchNote;
  referencesNote?: string;
};

export type SiteSettings = {
  siteName: string;
  description: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  copyright: string;
};

export type MediaAssets = {
  hero: { background: string };
  brand: {
    logoMark: string;
    logoWordmark: string;
    logoMarkFooter: string;
    logoWordmarkFooter: string;
    divider: string;
    faviconRichBlack: string;
    faviconRichWhite: string;
  };
  icons: {
    arrowRightLight: string;
    arrowRightDark: string;
    play: string;
  };
  charts: {
    mentalHealth: string;
  };
  optOut: {
    letterPreview: string;
  };
};

export type SiteContent = {
  version: string;
  publishedAt: string;
  settings: SiteSettings;
  media: MediaAssets;
  navigation: {
    header: NavLink[];
    footer: NavLink[];
  };
  sections: Partial<Record<SectionKey, SectionContent>>;
  expertQuotes: ExpertQuote[];
  timeline: TimelineSlide[];
  libraryCategories: LibraryCategory[];
  libraryContent: Record<LibraryCategory, LibraryItem[]>;
  mentalHealthPoints: string[];
  mentalHealthLegend: { label: string; color: string }[];
  academicDatasets: string[];
  optOutSteps: OptOutStep[];
  softwareReviews: {
    epic: SoftwareReview;
    ixl: SoftwareReview;
  };
  research: ResearchChartsData;
  academicStatic: AcademicDataset[];
};

export type ContentVersion = {
  version: string;
  publishedAt: string;
};
