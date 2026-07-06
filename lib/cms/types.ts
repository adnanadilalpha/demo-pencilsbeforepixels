import type { ResearchChartsData } from "@/lib/research/types";
import type { SiteCacheSettings } from "@/lib/cache/types";
import type { LibraryFileKind } from "./library-file";
import type { SocialLink } from "@/lib/site/social-links";

export type NavLink = {
  label: string;
  href: string;
};

export type SectionKey =
  | "homepage.hero"
  | "homepage.goal"
  | "homepage.learning_apps"
  | "homepage.expert_voices"
  | "homepage.mental_health"
  | "homepage.research_library"
  | "homepage.before_opt_out"
  | "homepage.device_opt_out"
  | "homepage.footer"
  | "evidence.research_tab"
  | "evidence.nebraska"
  | "evidence.district_66";

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
  | "Walled Garden"
  | "Research Papers"
  | "Videos"
  | "Parent Resources";

export type LibraryItem = {
  title: string;
  subtitle: string;
  kind: "book" | "paper" | "video" | "resource";
  image?: string;
  viewUrl?: string;
  youtubeUrl?: string;
  videoUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileKind?: LibraryFileKind;
  fileMimeType?: string;
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
  audioSrc?: string;
  audioTitle?: string;
  audioDescription?: string;
  vendorResearch?: ResearchNote;
  independentResearch?: ResearchNote;
  referencesNote?: string;
};

export type SiteSettings = {
  siteName: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  footerTagline?: string;
  faviconUrl?: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  copyright: string;
  socialLinks: SocialLink[];
};

export type MediaAssets = {
  hero: { background: string };
  brand: {
    logoLight: string;
    logoDark: string;
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
  assetsRevision: string;
  cache: SiteCacheSettings;
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
  optOutSteps: OptOutStep[];
  softwareReviews: {
    epic: SoftwareReview;
    ixl: SoftwareReview;
  };
  research: ResearchChartsData;
};

export type ContentVersion = {
  version: string;
  publishedAt: string;
  assetsRevision: string;
};
