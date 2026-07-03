import { LOCAL_FAVICONS } from "@/lib/brand/favicon";
import { createMissionTimelineSlides } from "./mission-slides";
import { whatToDoPoints } from "./what-to-do-points";
import type {
  ExpertQuote,
  LibraryCategory,
  LibraryItem,
  NavLink,
  OptOutStep,
} from "./types";

export const LOCAL_ASSETS = {
  hero: { background: "/images/hero/child-writing.jpg" },
  brand: {
    logoMark: "/images/brand/logo-mark.svg",
    logoWordmark: "/images/brand/logo-wordmark.svg",
    logoMarkFooter: "/images/brand/logo-mark-footer.svg",
    logoWordmarkFooter: "/images/brand/logo-wordmark-footer.svg",
    divider: "/images/brand/divider.svg",
    faviconRichBlack: LOCAL_FAVICONS.richBlack,
    faviconRichWhite: LOCAL_FAVICONS.richWhite,
  },
  icons: {
    arrowRightLight: "/images/icons/arrow-right-light.svg",
    arrowRightDark: "/images/icons/arrow-right-dark.svg",
    play: "/images/icons/play.svg",
  },
  charts: {
    mentalHealth: "/images/charts/mental-health.png",
  },
  books: {
    anxiousGeneration: "/images/books/anxious-generation.png",
    stolenFocus: "/images/books/stolen-focus.png",
    pencilVsStylus: "/images/books/pencil-vs-stylus.png",
  },
  optOut: {
    letterPreview: "/images/opt-out/letter.png",
  },
} as const;

export const navLinks: NavLink[] = [
  { label: "Nebraska Data", href: "/evidence" },
  { label: "Research", href: "/research" },
  { label: "Our Mission", href: "#mission" },
  { label: "Resources", href: "#resources" },
  { label: "Device Opt Out", href: "#opt-out" },
];

export const footerLinks: NavLink[] = [
  { label: "Nebraska Data", href: "/evidence" },
  { label: "Research", href: "/research" },
  { label: "Our Mission", href: "/#mission" },
  { label: "Resources", href: "/#resources" },
];

export const expertQuotes: ExpertQuote[] = [
  {
    number: "01",
    quote:
      "There are no genes or areas in the brain devoted uniquely to reading. Rather, our ability to read represents our brain's protean capacity to learn something outside our repertoire by creating new circuits that connect existing circuits in a different way.",
    name: "Dr. Maryanne Wolf",
    title: "Cognitive Neuroscientist, UCLA",
    image: "/images/experts/maryanne.jpg",
  },
  {
    number: "02",
    quote:
      "Statistically most studies on the relationship between handwriting and memory show that people are better at remembering things that they have written down, manually than on a computer.",
    name: "Naomi Baron",
    title: "Professor Emerita of Linguistics, American University",
    image: "/images/experts/naomi.jpg",
  },
  {
    number: "03",
    quote:
      "The trap that many parents fall into is in believing that when their kids are hypnotically looking at a screen, they are demonstrating a profound ability to stay focused.",
    name: "Dr. Nicholas Kardaras",
    title: "Author, Glow Kids",
    image: "/images/experts/nicholas.jpg",
  },
];

export const mentalHealthPoints = [
  "Weaker impulse control",
  "Increased reward seeking behaviour",
  "Attention difficulties",
  "Emotional dysregulation",
  "Altered brain connectivity related to inhibitory control",
] as const;

export const mentalHealthLegend = [
  { label: "Suicide", color: "#f59e0b" },
  { label: "Self-poisoning", color: "#6ee7b7" },
  { label: "Major depressive episode", color: "#f87171" },
  { label: "Depressive symptoms", color: "#67e8f9" },
] as const;

export const academicDatasets = [
  "Worldwide Data (PISA)",
  "USA Grade 4 NAEP",
  "USA Grade 8 NAEP",
  "Nebraska Mathematics",
  "Nebraska Mathematics by Gender",
  "Westside Mathematics by Gender",
  "Nebraska English",
  "State & Federal Testing",
] as const;

export const libraryCategories: LibraryCategory[] = [
  "Books",
  "Research Papers",
  "Videos",
  "Parent Resources",
];

export const libraryContent: Record<LibraryCategory, LibraryItem[]> = {
  Books: [
    {
      title: "The Anxious Generation",
      subtitle: "NICHOLAS CARR",
      kind: "book",
      image: LOCAL_ASSETS.books.anxiousGeneration,
    },
    {
      title: "Stolen Focus",
      subtitle: "JOHANN HARI",
      kind: "book",
      image: LOCAL_ASSETS.books.stolenFocus,
    },
    {
      title: "Pencil vs. Stylus",
      subtitle: "NORWEGIAN STUDY 2023",
      kind: "book",
      image: LOCAL_ASSETS.books.pencilVsStylus,
    },
  ],
  "Research Papers": [
    {
      title: "Screen Time and Academic Outcomes",
      subtitle: "PISA RESEARCH TEAM 2023",
      kind: "paper",
    },
    {
      title: "Handwriting vs. Typing in Early Literacy",
      subtitle: "COGNITIVE SCIENCE JOURNAL",
      kind: "paper",
    },
    {
      title: "Digital Devices in Primary Classrooms",
      subtitle: "NEUROSCIENCE REVIEW 2024",
      kind: "paper",
    },
  ],
  Videos: [
    {
      title: "Why Reading on Paper Matters",
      subtitle: "DR. MARYANNE WOLF",
      kind: "video",
    },
    {
      title: "The Attention Economy in Schools",
      subtitle: "JOHANN HARI",
      kind: "video",
    },
    {
      title: "Building Focus in a Distracted World",
      subtitle: "CAL NEWPORT",
      kind: "video",
    },
  ],
  "Parent Resources": [
    {
      title: "Device Opt-Out Letter Template",
      subtitle: "PARENT TOOLKIT",
      kind: "resource",
    },
    {
      title: "Questions to Ask Your School",
      subtitle: "CONVERSATION GUIDE",
      kind: "resource",
    },
    {
      title: "Screen-Free Learning at Home",
      subtitle: "RESOURCE GUIDE",
      kind: "resource",
    },
  ],
};

export const optOutSteps: OptOutStep[] = [
  {
    number: "01",
    title: "Read the evidence",
    description: "Explore the research and local data.",
  },
  {
    number: "02",
    title: "Generate your editable letter",
    description: "Produce a personalised opt out letter.",
  },
  {
    number: "03",
    title: "Discuss with your school",
    description: "Start an informed conversation.",
  },
];

export const timelineSlides = createMissionTimelineSlides();

export { whatToDoPoints };

export const epicReviewContent = {
  title: "Epic",
  summary:
    "This review examines how Epic works, what behaviours it encourages, and how it compares with current research on reading comprehension and screen-based learning.",
  audioSrc: "/audio/Media1.mp3",
};

export const ixlReviewContent = {
  title: "IXL Math",
  vendorResearch: {
    label: "What IXL's research claims",
    summary:
      "IXL's Nebraska efficacy report (Hargis-Becker, 2024) states that cohorts using IXL Math scored 1–6 percentage points higher on NSCAS math than comparison groups. The report links higher weekly usage to higher proficiency — from 48% with little or no IXL use to 54% at 30+ minutes per week.",
    note: "This study was authored by IXL Learning's senior research scientist using Nebraska Department of Education data.",
  },
  independentResearch: {
    label: "What independent research found",
    summary:
      "A separate middle-school study comparing IXL and non-IXL 7th-grade cohorts found no statistically significant difference in mean scale scores (597.57 vs 587.71). Researchers concluded the results do not support the claim that IXL Math is more effective than traditional assignments for that sample.",
    note: "Subgroup analysis also found no significant gender gap in IXL outcomes, though ethnicity differences in math achievement were observed.",
  },
  referencesNote:
    "IXL cites multiple state-level efficacy reports (Nebraska, Michigan, Kansas, Minnesota, Illinois). Parents may wish to weigh vendor-funded studies alongside independent evaluations.",
};
