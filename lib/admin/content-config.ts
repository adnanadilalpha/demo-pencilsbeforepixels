import type { SectionKey } from "@/lib/cms/types";
import { researchEditorSections } from "@/lib/admin/research-field-definitions";

export type ContentPageId = "homepage" | "nebraska" | "research" | "site";

/** Legacy admin URLs used `?page=evidence` before the Nebraska / Research split. */
export function normalizeContentPageId(value: string | undefined): ContentPageId | undefined {
  if (value === "evidence") return "nebraska";
  if (value === "homepage" || value === "nebraska" || value === "research" || value === "site") {
    return value;
  }
  return undefined;
}

export type FieldType =
  | "text"
  | "textarea"
  | "richText"
  | "image"
  | "pdf"
  | "toggle"
  | "cta"
  | "stringList";

export type ContentField = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  ctaKeys?: { label: string; href: string };
  mediaFolder?: string;
  mediaFilename?: string;
};

export type EditorSection = {
  id: string;
  label: string;
  page: ContentPageId;
  sectionKey?: SectionKey;
  fields: ContentField[];
};

export const homepageSections: EditorSection[] = [
  {
    id: "hero",
    label: "Hero",
    page: "homepage",
    sectionKey: "homepage.hero",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "headline", label: "Headline", type: "richText" },
      { key: "body", label: "Body copy", type: "richText" },
      { key: "primaryCta", label: "CTA text", type: "text" },
      {
        key: "backgroundImage",
        label: "Background image",
        type: "image",
        mediaFolder: "hero",
        mediaFilename: "child-writing.jpg",
      },
      { key: "backgroundAlt", label: "Image alt text", type: "text" },
    ],
  },
  {
    id: "timeline",
    label: "Our Mission",
    page: "homepage",
    fields: [
      {
        key: "_note",
        label: "Mission slides",
        type: "text",
        placeholder:
          "Mission carousel slides. Add or remove slides, edit copy, images, and background colors below.",
      },
    ],
  },
  {
    id: "goal",
    label: "10 Facts",
    page: "homepage",
    sectionKey: "homepage.goal",
    fields: [
      { key: "tagline", label: "Headline", type: "richText" },
      {
        key: "body",
        label: "Intro copy",
        type: "richText",
        placeholder:
          "Short paragraph below the headline — e.g. how many findings and where they come from.",
      },
    ],
  },
  {
    id: "learning_apps",
    label: "Epic Review",
    page: "homepage",
    sectionKey: "homepage.learning_apps",
    fields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "body", label: "Body copy", type: "richText" },
    ],
  },
  {
    id: "expert_voices",
    label: "Expert Voices",
    page: "homepage",
    sectionKey: "homepage.expert_voices",
    fields: [{ key: "headline", label: "Headline", type: "text" }],
  },
  {
    id: "mental_health",
    label: "Mental Health",
    page: "homepage",
    sectionKey: "homepage.mental_health",
    fields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "body", label: "Body copy", type: "richText" },
      {
        key: "cta",
        label: "CTA",
        type: "cta",
        ctaKeys: { label: "label", href: "href" },
      },
      {
        key: "chartImage",
        label: "Chart image",
        type: "image",
        mediaFolder: "charts",
        mediaFilename: "mental-health.png",
      },
    ],
  },
  {
    id: "research_library",
    label: "Resources",
    page: "homepage",
    sectionKey: "homepage.research_library",
    fields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "body", label: "Body copy", type: "richText" },
    ],
  },
  {
    id: "before_opt_out",
    label: "Before Opt Out",
    page: "homepage",
    sectionKey: "homepage.before_opt_out",
    fields: [
      {
        key: "_note",
        label: "",
        type: "text",
        placeholder:
          "Large-text questions shown immediately above the Device Opt Out section.",
      },
    ],
  },
  {
    id: "device_opt_out",
    label: "Device Opt Out",
    page: "homepage",
    sectionKey: "homepage.device_opt_out",
    fields: [
      {
        key: "_note",
        label: "",
        type: "text",
        placeholder:
          "School list, Form B default answers, and cover/essay templates are managed under Admin → Opt Out → Settings. Publish here to update homepage copy, steps, and the letter preview image.",
      },
      { key: "headline", label: "Headline", type: "text" },
      { key: "body", label: "Body copy", type: "richText" },
      { key: "primaryCta", label: "Primary CTA", type: "text" },
      {
        key: "letterPreviewImage",
        label: "Letter preview image",
        type: "image",
        mediaFolder: "opt-out",
        mediaFilename: "letter.png",
      },
    ],
  },
  {
    id: "footer",
    label: "Footer",
    page: "homepage",
    sectionKey: "homepage.footer",
    fields: [
      { key: "newsletterLabel", label: "Newsletter label", type: "text" },
      {
        key: "newsletterPlaceholder",
        label: "Email placeholder",
        type: "text",
      },
      { key: "newsletterCta", label: "Newsletter CTA", type: "text" },
      {
        key: "socialLinksLabel",
        label: "Social links heading",
        type: "text",
        placeholder: "Follow us",
      },
    ],
  },
];

export const nebraskaDataSections: EditorSection[] = [
  {
    id: "evidence_nebraska",
    label: "Nebraska",
    page: "nebraska",
    sectionKey: "evidence.nebraska",
    fields: [
      { key: "title", label: "Tab title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "richText" },
    ],
  },
  {
    id: "evidence_district_66",
    label: "District 66",
    page: "nebraska",
    sectionKey: "evidence.district_66",
    fields: [
      { key: "title", label: "Tab title", type: "text" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "richText" },
      { key: "viewDescription", label: "View description", type: "richText" },
    ],
  },
];

export const researchPageSections: EditorSection[] = [
  {
    id: "evidence_research",
    label: "Page content",
    page: "research",
    fields: [],
  },
];

export const siteSections: EditorSection[] = [
  {
    id: "site_settings",
    label: "Site Settings",
    page: "site",
    fields: [
      {
        key: "_note",
        label: "Global settings",
        type: "text",
        placeholder: "Site name, description, copyright, and legal URLs",
      },
    ],
  },
  {
    id: "navigation",
    label: "Navigation",
    page: "site",
    fields: [],
  },
];

export const allEditorSections = [
  ...homepageSections,
  ...nebraskaDataSections,
  ...researchPageSections,
  ...siteSections,
];

export function getSectionsForPage(page: ContentPageId): EditorSection[] {
  if (page === "site") return siteSections;
  if (page === "homepage") return homepageSections;
  if (page === "research") return researchPageSections;
  return nebraskaDataSections;
}

export function previewPathForContentPage(page: ContentPageId): string {
  if (page === "homepage" || page === "site") return "/";
  if (page === "research") return "/research";
  return "/nebraska-data";
}

export function getEditorSection(id: string): EditorSection | undefined {
  return allEditorSections.find((section) => section.id === id);
}

export const researchFieldKeys = researchEditorSections.flatMap((section) =>
  section.fields.map((field) => field.key),
);
