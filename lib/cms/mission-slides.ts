import type { TimelineSlide } from "./types";

export const MISSION_SLIDE_COUNT = 2;

export const MISSION_SLIDE_LABELS = ["The Problem", "The Goal"] as const;

export function createMissionTimelineSlides(): TimelineSlide[] {
  return [
    {
      era: "The Problem",
      number: "01",
      title: "The Classroom Has Changed.",
      description:
        "Instinctively, many parents and teachers feel something has changed. Children struggle to focus, teachers are increasingly overwhelmed and academic performance continues to decline. Over the past fifteen years, classrooms have rapidly transitioned to one to one digital devices while researchers have continued studying their impact on learning.",
      image: "/images/timeline/device-1-1.jpg",
      background: "#f0eae0",
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

export function normalizeMissionTimeline(
  slides: TimelineSlide[],
): TimelineSlide[] {
  const defaults = createMissionTimelineSlides();

  if (!slides.length) {
    return defaults;
  }

  if (slides.length > MISSION_SLIDE_COUNT) {
    return slides.slice(0, MISSION_SLIDE_COUNT);
  }

  if (slides.length === MISSION_SLIDE_COUNT) {
    return slides;
  }

  return defaults.map((fallback, index) => ({
    ...fallback,
    ...(slides[index] ?? {}),
  }));
}
