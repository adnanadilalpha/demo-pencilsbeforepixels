import type { TimelineSlide } from "./types";

export const MISSION_SLIDE_MIN_COUNT = 1;
export const MISSION_SLIDE_MAX_COUNT = 12;

export type TimelineBackgroundOption = {
  id: string;
  label: string;
  value: string;
  textColor: "light" | "dark";
  swatch: string;
};

export const TIMELINE_BACKGROUND_OPTIONS: TimelineBackgroundOption[] = [
  {
    id: "paper-200",
    label: "Warm paper",
    value: "var(--color-paper-200)",
    textColor: "dark",
    swatch: "#f0eae0",
  },
  {
    id: "paper-50",
    label: "Light paper",
    value: "var(--color-paper-50)",
    textColor: "dark",
    swatch: "#faf8f4",
  },
  {
    id: "paper-300",
    label: "Sand",
    value: "var(--color-paper-300)",
    textColor: "dark",
    swatch: "#e8e0d0",
  },
  {
    id: "navy-800",
    label: "Navy",
    value: "var(--color-navy-800)",
    textColor: "light",
    swatch: "#0f1f3d",
  },
  {
    id: "navy-700",
    label: "Navy medium",
    value: "var(--color-navy-700)",
    textColor: "light",
    swatch: "#152852",
  },
  {
    id: "hero-dark",
    label: "Hero dark",
    value: "var(--color-hero-dark)",
    textColor: "light",
    swatch: "#0a1628",
  },
  {
    id: "gold-50",
    label: "Gold tint",
    value: "var(--color-gold-50)",
    textColor: "dark",
    swatch: "#fffbeb",
  },
  {
    id: "gold-accent",
    label: "Gold accent",
    value: "var(--color-gold-accent)",
    textColor: "dark",
    swatch: "#f4c542",
  },
  {
    id: "slate-50",
    label: "Slate",
    value: "var(--color-slate-50)",
    textColor: "dark",
    swatch: "#f8fafc",
  },
];

const LEGACY_BACKGROUND_MAP: Record<string, TimelineBackgroundOption> = {
  "#f0eae0": TIMELINE_BACKGROUND_OPTIONS[0]!,
};

export function resolveTimelineBackgroundOption(
  background: string,
): TimelineBackgroundOption | undefined {
  const direct = TIMELINE_BACKGROUND_OPTIONS.find(
    (option) => option.value === background,
  );
  if (direct) return direct;
  return LEGACY_BACKGROUND_MAP[background.toLowerCase()];
}

export function resolveTimelineTextColor(
  background: string,
  explicit?: "light" | "dark",
): "light" | "dark" {
  if (explicit) return explicit;
  const option = resolveTimelineBackgroundOption(background);
  if (option) return option.textColor;
  if (
    background.includes("navy") ||
    background.includes("hero-dark") ||
    background.includes("overlay")
  ) {
    return "light";
  }
  return "dark";
}

export function formatMissionSlideNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function renumberMissionSlides(slides: TimelineSlide[]): TimelineSlide[] {
  return slides.map((slide, index) => ({
    ...slide,
    number: formatMissionSlideNumber(index),
  }));
}

export function createEmptyMissionSlide(index: number): TimelineSlide {
  const backgroundOption =
    TIMELINE_BACKGROUND_OPTIONS[index % TIMELINE_BACKGROUND_OPTIONS.length]!;

  return {
    era: `Slide ${index + 1}`,
    number: formatMissionSlideNumber(index),
    title: "",
    description: "",
    image: "",
    background: backgroundOption.value,
    textColor: backgroundOption.textColor,
    eraStyle: "large",
    indentContent: false,
  };
}

export function createMissionTimelineSlides(): TimelineSlide[] {
  return [
    {
      era: "The Problem",
      number: "01",
      title: "The Classroom Has Changed.",
      description:
        "Instinctively, many parents and teachers feel something has changed. Children struggle to focus, teachers are increasingly overwhelmed and academic performance continues to decline. Over the past fifteen years, classrooms have rapidly transitioned to one to one digital devices while researchers have continued studying their impact on learning.",
      image: "/images/timeline/device-1-1.jpg",
      background: "var(--color-paper-200)",
      textColor: "dark",
      eraStyle: "large",
      indentContent: false,
    },
    {
      era: "The Goal",
      number: "02",
      title: "The Goal",
      description:
        "Give our children the best possible chance of developing the cognitive and social skills they need to thrive, by creating a classroom environment that champions focus over distraction and cognitive friction over swiping.",
      image: "/images/timeline/books-slates.jpg",
      background: "var(--color-navy-800)",
      textColor: "light",
      eraStyle: "compact",
      indentContent: true,
    },
  ];
}

function normalizeSlide(
  slide: Partial<TimelineSlide>,
  index: number,
): TimelineSlide {
  const defaults = createMissionTimelineSlides();
  const fallback = defaults[index] ?? createEmptyMissionSlide(index);
  const merged = { ...fallback, ...slide };
  const backgroundOption = resolveTimelineBackgroundOption(merged.background);
  const background = backgroundOption?.value ?? merged.background;

  return {
    era: merged.era.trim() || fallback.era,
    number: merged.number.trim() || formatMissionSlideNumber(index),
    title: merged.title ?? "",
    description: merged.description ?? "",
    image: merged.image ?? "",
    background,
    textColor: resolveTimelineTextColor(background, merged.textColor),
    eraStyle: merged.eraStyle ?? fallback.eraStyle,
    indentContent: merged.indentContent ?? fallback.indentContent,
  };
}

export function normalizeMissionTimeline(
  slides: TimelineSlide[],
): TimelineSlide[] {
  if (!slides.length) {
    return createMissionTimelineSlides();
  }

  const normalized = slides
    .slice(0, MISSION_SLIDE_MAX_COUNT)
    .map((slide, index) => normalizeSlide(slide, index));

  return normalized.length >= MISSION_SLIDE_MIN_COUNT
    ? normalized
    : createMissionTimelineSlides();
}

export function canAddMissionSlide(slides: TimelineSlide[]): boolean {
  return slides.length < MISSION_SLIDE_MAX_COUNT;
}

export function canRemoveMissionSlide(slides: TimelineSlide[]): boolean {
  return slides.length > MISSION_SLIDE_MIN_COUNT;
}
