import type { SectionKey } from "@/lib/cms/types";
import { researchEditorSections } from "@/lib/admin/research-field-definitions";

export type ContentPageId = "homepage" | "evidence" | "site";

export type FieldType =
  | "text"
  | "textarea"
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
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "body", label: "Body copy", type: "textarea" },
      { key: "primaryCta", label: "CTA text", type: "text" },
      {
        key: "secondaryCta",
        label: "Secondary CTA",
        type: "cta",
        ctaKeys: { label: "label", href: "href" },
      },
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
    id: "problem",
    label: "Problem",
    page: "homepage",
    sectionKey: "homepage.problem",
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "body", label: "Body copy", type: "textarea" },
    ],
  },
  {
    id: "timeline",
    label: "Timeline",
    page: "homepage",
    fields: [
      {
        key: "_note",
        label: "Timeline slides",
        type: "text",
        placeholder: "Edit individual slides in the list below",
      },
    ],
  },
  {
    id: "goal",
    label: "Goal & Solution",
    page: "homepage",
    sectionKey: "homepage.goal",
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "tagline", label: "Tagline", type: "textarea" },
      { key: "goalTitle", label: "Goal title", type: "text" },
      { key: "goalBody", label: "Goal body", type: "textarea" },
      { key: "solutionTitle", label: "Solution title", type: "text" },
      { key: "solutionBody", label: "Solution body", type: "textarea" },
    ],
  },
  {
    id: "academic_data",
    label: "Academic Data",
    page: "homepage",
    sectionKey: "homepage.academic_data",
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "headline", label: "Headline", type: "text" },
      { key: "body", label: "Body copy", type: "textarea" },
      {
        key: "_note",
        label: "Dataset tabs",
        type: "text",
        placeholder: "Each tab below matches a chart on the homepage Academic Data section",
      },
    ],
  },
  {
    id: "learning_apps",
    label: "IXL & Epic",
    page: "homepage",
    sectionKey: "homepage.learning_apps",
    fields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "body", label: "Body copy", type: "textarea" },
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
      { key: "label", label: "Label", type: "text" },
      { key: "headline", label: "Headline", type: "text" },
      { key: "body", label: "Body copy", type: "textarea" },
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
      {
        key: "points",
        label: "Bullet points",
        type: "stringList",
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
      { key: "body", label: "Body copy", type: "textarea" },
      {
        key: "categories",
        label: "Resource categories",
        type: "stringList",
        placeholder: "Category label",
      },
    ],
  },
  {
    id: "device_opt_out",
    label: "Device Opt Out",
    page: "homepage",
    sectionKey: "homepage.device_opt_out",
    fields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "body", label: "Body copy", type: "textarea" },
      { key: "primaryCta", label: "Primary CTA", type: "text" },
      {
        key: "secondaryCta",
        label: "Secondary CTA",
        type: "cta",
        ctaKeys: { label: "label", href: "href" },
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
    ],
  },
];

export const evidenceSections: EditorSection[] = [
  {
    id: "evidence_nebraska",
    label: "Nebraska",
    page: "evidence",
    sectionKey: "evidence.nebraska",
    fields: [
      { key: "title", label: "Tab title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
    ],
  },
  {
    id: "evidence_district_66",
    label: "District 66",
    page: "evidence",
    sectionKey: "evidence.district_66",
    fields: [
      { key: "title", label: "Tab title", type: "text" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "viewDescription", label: "View description", type: "textarea" },
    ],
  },
  {
    id: "evidence_research",
    label: "Research",
    page: "evidence",
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
    fields: [
      {
        key: "_note",
        label: "Navigation links",
        type: "text",
        placeholder: "Header and footer links loaded from Supabase",
      },
    ],
  },
];

export const allEditorSections = [
  ...homepageSections,
  ...evidenceSections,
  ...siteSections,
];

export function getSectionsForPage(page: ContentPageId): EditorSection[] {
  if (page === "site") return siteSections;
  return page === "homepage" ? homepageSections : evidenceSections;
}

export function getEditorSection(id: string): EditorSection | undefined {
  return allEditorSections.find((section) => section.id === id);
}

export const researchFieldKeys = researchEditorSections.flatMap((section) =>
  section.fields.map((field) => field.key),
);
