/** Evidence findings for the homepage “Evidence Snapshot” section. Format: `stat — body` */
export const whatToDoPoints = [
  "−1.45 pts/yr — National decline in Grade 4 NAEP math scores since classroom devices scaled up widely across U.S. schools.",
  "−1.07 pts/yr — National decline in Grade 4 NAEP reading scores over the same post-adoption period.",
  "−1.81 pts/yr — Grade 8 NAEP math scores are falling even faster than elementary grades nationally.",
  "−0.57 — OECD-adjusted association between increased classroom computer access and greater PISA math score declines (2003–2012).",
  "~41 points — TIMSS math score gap between 4th graders who rarely vs. almost daily use computers in class — a drop from the 50th to the 32nd percentile.",
  "~9% lower — Chance of meeting Grade 3 reading standards for each extra hour of daily screen time in early childhood (15-year Canadian cohort, n=5,400+).",
  "~10% lower — Chance of meeting Grade 6 math standards per additional hour of daily screen time at ages 2–5.",
  "~23% lower — Grade 3 reading proficiency among children who play any video games vs. none in the same longitudinal study.",
  "455 → 459 — PISA math scores peak around one hour of learning device use at school, then decline as daily screen time increases (OECD average).",
  "532 → 484 — PIRLS reading scores fall steadily as in-school computer use moves from almost never to almost daily across OECD countries.",
] as const;

export type EvidenceSource =
  | "NAEP"
  | "PISA"
  | "TIMSS"
  | "PIRLS"
  | "OECD"
  | "Research";

export type EvidenceChapterId = "national" | "international" | "early-years";

export type WhatToDoPoint = {
  stat: string;
  body: string;
  source: EvidenceSource;
  chapterId: EvidenceChapterId;
};

export type EvidenceStoryChapter = {
  id: EvidenceChapterId;
  number: string;
  title: string;
  lead: string;
  points: WhatToDoPoint[];
};

const CHAPTER_META: Record<
  EvidenceChapterId,
  { number: string; title: string; lead: string }
> = {
  national: {
    number: "01",
    title: "Across America's Classrooms",
    lead: "NAEP tracks the moment each state crossed into one-to-one devices — and what happened to scores after.",
  },
  international: {
    number: "02",
    title: "On the World Stage",
    lead: "PISA, TIMSS, and PIRLS tell the same story across dozens of countries and subjects.",
  },
  "early-years": {
    number: "03",
    title: "Before Grade School",
    lead: "Screen habits formed in early childhood predict reading and math outcomes years later.",
  },
};

const DEFAULT_POINT_META: Array<{
  source: EvidenceSource;
  chapterId: EvidenceChapterId;
}> = [
  { source: "NAEP", chapterId: "national" },
  { source: "NAEP", chapterId: "national" },
  { source: "NAEP", chapterId: "national" },
  { source: "OECD", chapterId: "international" },
  { source: "TIMSS", chapterId: "international" },
  { source: "Research", chapterId: "early-years" },
  { source: "Research", chapterId: "early-years" },
  { source: "Research", chapterId: "early-years" },
  { source: "PISA", chapterId: "international" },
  { source: "PIRLS", chapterId: "international" },
];

const SOURCE_ORDER: EvidenceSource[] = [
  "NAEP",
  "OECD",
  "PISA",
  "TIMSS",
  "PIRLS",
  "Research",
];

export function parseWhatToDoPoint(
  point: string,
  index = 0,
): WhatToDoPoint {
  const separator = " — ";
  const splitIndex = point.indexOf(separator);
  const stat = splitIndex === -1 ? "" : point.slice(0, splitIndex).trim();
  const body =
    splitIndex === -1 ? point.trim() : point.slice(splitIndex + separator.length).trim();
  const fallback = DEFAULT_POINT_META[index] ?? inferPointMeta(body, stat);

  return {
    stat,
    body: body || point,
    source: inferEvidenceSource(body, stat) ?? fallback.source,
    chapterId: inferChapterId(body, stat) ?? fallback.chapterId,
  };
}

export function buildEvidenceStoryChapters(points: string[]): EvidenceStoryChapter[] {
  const parsed = points.map((point, index) => parseWhatToDoPoint(point, index));
  const chapterOrder: EvidenceChapterId[] = [
    "national",
    "international",
    "early-years",
  ];

  return chapterOrder
    .map((id) => {
      const meta = CHAPTER_META[id];
      return {
        id,
        number: meta.number,
        title: meta.title,
        lead: meta.lead,
        points: parsed.filter((point) => point.chapterId === id),
      };
    })
    .filter((chapter) => chapter.points.length > 0);
}

function inferEvidenceSource(body: string, stat: string): EvidenceSource | null {
  const haystack = `${stat} ${body}`.toUpperCase();

  for (const source of SOURCE_ORDER) {
    if (source === "Research") continue;
    if (haystack.includes(source)) return source;
  }

  if (/GRADE [36]|CHILDHOOD|LONGITUDINAL|VIDEO GAMES/i.test(body)) {
    return "Research";
  }

  return null;
}

function inferChapterId(body: string, stat: string): EvidenceChapterId | null {
  const source = inferEvidenceSource(body, stat);
  if (source === "NAEP") return "national";
  if (
    source === "PISA" ||
    source === "TIMSS" ||
    source === "PIRLS" ||
    source === "OECD"
  ) {
    return "international";
  }
  if (source === "Research") return "early-years";
  return null;
}

function inferPointMeta(body: string, stat: string) {
  return {
    source: inferEvidenceSource(body, stat) ?? ("Research" as const),
    chapterId: inferChapterId(body, stat) ?? ("early-years" as const),
  };
}

export function isDeclineStat(stat: string): boolean {
  const trimmed = stat.trim();
  if (!trimmed) return false;
  if (/^[−~-]/.test(trimmed)) return true;
  if (/lower|decline|fall/i.test(trimmed)) return true;
  if (/→/.test(trimmed)) {
    const [, right] = trimmed.split("→").map((part) => part.trim());
    const rightValue = Number.parseInt(right?.replace(/[^\d-]/g, "") ?? "", 10);
    const leftValue = Number.parseInt(
      trimmed.replace(/→.*/, "").replace(/[^\d-]/g, ""),
      10,
    );
    return (
      Number.isFinite(leftValue) &&
      Number.isFinite(rightValue) &&
      rightValue < leftValue
    );
  }
  return false;
}
