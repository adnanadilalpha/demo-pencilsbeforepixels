import type { LibraryCategory, NavLink, OptOutStep, SiteSettings } from "@/lib/cms/types";

export type EditableNavLink = NavLink & {
  id?: string;
  location: "header" | "footer";
};

export type EditableLibraryItem = {
  id?: string;
  category: LibraryCategory;
  title: string;
  subtitle: string;
  kind: "book" | "paper" | "video" | "resource";
  image: string;
};

export type MentalHealthLegendItem = {
  label: string;
  color: string;
};

export type SiteSettingsDraft = SiteSettings;

export type OptOutStepsDraft = OptOutStep[];
