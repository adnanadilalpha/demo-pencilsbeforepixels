import type { NaepGradeSection } from "@/lib/research/types";

function naepChartFromPoints(
  title: string,
  years: number[],
  scores: number[],
  preSlope: number,
  postSlope: number,
  yTicks: number[],
  preLabel: string,
  postLabel: string,
): NaepGradeSection["math"] {
  return {
    title,
    years,
    scores,
    yearZero: 0,
    preSlope,
    postSlope,
    yTicks,
    slopes: {
      pre: {
        label: preLabel,
        value: `${preSlope >= 0 ? "+" : ""}${preSlope.toFixed(2)} pts/yr`,
      },
      post: {
        label: postLabel,
        value: `${postSlope >= 0 ? "+" : ""}${postSlope.toFixed(2)} pts/yr`,
      },
    },
  };
}

/** Reference chart images — same assets as Evidence Research tab. */
export const NAEP_GRADE_CHART_IMAGES = {
  grade4: {
    src: "/images/research/gradeFour.jpg",
    /** White margins removed; use on Academic Data with a padded white chart well. */
    academicSrc: "/images/research/gradeFour-transparent.png",
    alt: "Grade 4 Math and Reading NAEP trends relative to digital adoption",
  },
  grade8: {
    src: "/images/research/gradeEight.jpg",
    academicSrc: "/images/research/gradeEight-transparent.png",
    alt: "Grade 8 Math and Reading NAEP trends relative to digital adoption",
  },
} as const;

export type NaepGradeKey = keyof typeof NAEP_GRADE_CHART_IMAGES;

/**
 * Year-0 aligned NAEP series traced from the reference chart images
 * (gradeFour.jpg / gradeEight.jpg). Used by Research and Academic Data.
 */
export const NAEP_GRADE_4: NaepGradeSection = {
  heading: "Grade 4 — Math & Reading (2022 excluded)",
  math: naepChartFromPoints(
    "Grade 4 Math (2022 Excluded)",
    [-25, -24, -22, -20, -18, -16, -14, -12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10],
    [221.5, 217.5, 222.5, 220.5, 225, 224, 235, 235.5, 237.5, 238.5, 239.5, 240.5, 241, 240, 238.5, 239, 239, 238.5, 236],
    1.07,
    -0.38,
    [215, 225, 235, 245],
    "Math — Pre-adoption",
    "Math — Post-adoption",
  ),
  reading: naepChartFromPoints(
    "Grade 4 Reading (2022 Excluded)",
    [-25, -23, -21, -20, -18, -16, -14, -12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10],
    [218.5, 215, 211, 214, 213.5, 217, 214, 217.5, 218.5, 219.5, 220, 220, 221.5, 222, 220.5, 219.5, 218.5, 215, 214],
    0.27,
    -0.8,
    [210, 215, 220, 225],
    "Reading — Pre-adoption",
    "Reading — Post-adoption",
  ),
};

export const NAEP_GRADE_8: NaepGradeSection = {
  heading: "Grade 8 — Math & Reading (2022 excluded)",
  math: naepChartFromPoints(
    "Grade 8 Math (2022 Excluded)",
    [-25, -24, -22, -20, -18, -16, -14, -12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10],
    [270.5, 264.5, 272, 268, 272.5, 271, 277.5, 277, 279, 280, 282, 282.5, 282.5, 283, 281, 280.5, 275.5, 274, 273.5],
    0.67,
    -1.14,
    [260, 268, 276, 284],
    "Math — Pre-adoption",
    "Math — Post-adoption",
  ),
  reading: naepChartFromPoints(
    "Grade 8 Reading (2022 Excluded)",
    [-20, -18, -16, -14, -12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10],
    [262.5, 260.5, 261.5, 262.5, 261.5, 261, 262.2, 263.5, 264.8, 265, 265.1, 264.5, 262.5, 260, 257, 257.5],
    0.17,
    -0.99,
    [255, 260, 265, 270],
    "Reading — Pre-adoption",
    "Reading — Post-adoption",
  ),
};

export const NAEP_GRADE_SECTIONS: Record<NaepGradeKey, NaepGradeSection> = {
  grade4: NAEP_GRADE_4,
  grade8: NAEP_GRADE_8,
};

export const NAEP_NATIONAL_SLOPES = [
  { label: "Grade 4 Math", slope: "−1.45 pts/yr" },
  { label: "Grade 4 Reading", slope: "−1.07 pts/yr" },
  { label: "Grade 8 Math", slope: "−1.81 pts/yr" },
  { label: "Grade 8 Reading", slope: "−1.16 pts/yr" },
] as const;
