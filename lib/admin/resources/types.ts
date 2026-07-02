import type { LibraryFileKind } from "@/lib/cms/library-file";

export type ResourceTab =
  | "books"
  | "research-papers"
  | "videos"
  | "parent-resources";

export type AdminLibraryItem = {
  id: string;
  title: string;
  subtitle: string;
  kind: "paper" | "book" | "video" | "resource";
  fileMediaId: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileKind: LibraryFileKind | null;
  visible: boolean;
  sortOrder: number;
};

export type AdminResearchPaper = AdminLibraryItem & {
  source: string;
  category: string;
  year: number | null;
  summary: string | null;
  externalUrl: string | null;
  fileUrl: string | null;
  fileMediaId: string | null;
  published: boolean;
};

export type AdminBook = {
  id: string;
  title: string;
  author: string;
  summary: string | null;
  coverUrl: string | null;
  coverMediaId: string | null;
  amazonUrl: string | null;
  publisherUrl: string | null;
  featured: boolean;
  visible: boolean;
  sortOrder: number;
};

export type VideoSource = "youtube" | "upload";

export type AdminVideo = {
  id: string;
  title: string;
  description: string | null;
  source: VideoSource;
  youtubeId: string | null;
  youtubeUrl: string;
  videoUrl: string | null;
  videoMediaId: string | null;
  thumbnailUrl: string | null;
  thumbnailMediaId: string | null;
  duration: string | null;
  visible: boolean;
  sortOrder: number;
};

export type ResourcesCatalog = {
  books: AdminBook[];
  researchPapers: AdminLibraryItem[];
  videos: AdminVideo[];
  parentResources: AdminLibraryItem[];
};

export type LibraryItemInput = {
  title: string;
  subtitle: string;
  fileMediaId: string | null;
  visible: boolean;
};

export type ResearchPaperInput = LibraryItemInput & {
  source: string;
  category: string;
  year: number | null;
  summary: string;
  externalUrl: string;
  fileMediaId: string | null;
  published: boolean;
};

export type BookInput = {
  title: string;
  author: string;
  summary: string;
  coverMediaId: string | null;
  amazonUrl: string;
  publisherUrl: string;
  featured: boolean;
};

export type VideoInput = {
  title: string;
  description: string;
  source: VideoSource;
  youtubeId: string | null;
  videoMediaId: string | null;
  thumbnailMediaId: string | null;
  visible: boolean;
};

export type ResourceApiType =
  | "books"
  | "research-papers"
  | "videos"
  | "parent-resources";

export function resourceTabToApiType(tab: ResourceTab): ResourceApiType {
  return tab;
}
