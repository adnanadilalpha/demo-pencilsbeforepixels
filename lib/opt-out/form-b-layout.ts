import {
  blankIfIgnored,
  INTRO,
  Q1_LABEL,
  Q2_LABEL,
  Q3_LABEL,
  Q4_LABEL,
} from "@/lib/opt-out/form-b-content";
import type { OptOutDefaultAnswers } from "@/lib/opt-out/types";
import { SIGNATURE_ROW_HEIGHT_PT } from "@/lib/opt-out/signature-image-size";

export type FormBLayoutScale = {
  bodySize: number;
  titleSize: number;
  bodyLineHeight: number;
  answerLineHeight: number;
  fieldRowHeight: number;
  sectionGap: number;
  questionGap: number;
  answerPadGap: number;
  emptyAnswerHeight: number;
};

export const FORM_B_MARGIN_PT = 54;
export const FORM_B_PAGE_HEIGHT_PT = 792;
export const FORM_B_FOOTER_RESERVE_PT = 52;
/** Clear space between signature/date row and footer line. */
export const FORM_B_FOOTER_GAP_ABOVE_PT = 32;
export const FORM_B_FOOTER_SIZE_PT = 12;

export const FORM_B_LAYOUT_SCALES: FormBLayoutScale[] = [
  {
    bodySize: 11,
    titleSize: 11.5,
    bodyLineHeight: 15,
    answerLineHeight: 14,
    fieldRowHeight: 24,
    sectionGap: 20,
    questionGap: 18,
    answerPadGap: 8,
    emptyAnswerHeight: 16,
  },
  {
    bodySize: 10.5,
    titleSize: 11,
    bodyLineHeight: 14,
    answerLineHeight: 13,
    fieldRowHeight: 22,
    sectionGap: 17,
    questionGap: 15,
    answerPadGap: 7,
    emptyAnswerHeight: 14,
  },
  {
    bodySize: 10,
    titleSize: 10.5,
    bodyLineHeight: 13,
    answerLineHeight: 12,
    fieldRowHeight: 20,
    sectionGap: 14,
    questionGap: 12,
    answerPadGap: 6,
    emptyAnswerHeight: 12,
  },
  {
    bodySize: 9.5,
    titleSize: 10,
    bodyLineHeight: 12,
    answerLineHeight: 11,
    fieldRowHeight: 18,
    sectionGap: 12,
    questionGap: 10,
    answerPadGap: 5,
    emptyAnswerHeight: 10,
  },
];

export function pointsToTwips(points: number) {
  return Math.round(points * 20);
}

export function pointsToHalfPoints(points: number) {
  return Math.round(points * 2);
}

function estimateLineCount(text: string, charsPerLine: number) {
  if (!text) return 0;
  return text
    .split(/\n/)
    .reduce((sum, paragraph) => sum + Math.max(1, Math.ceil(paragraph.length / charsPerLine)), 0);
}

function charsPerLineForScale(scale: FormBLayoutScale) {
  return Math.round(90 + (11 - scale.bodySize) * 4);
}

/** Approximate vertical layout height in points (matches PDF scale selection). */
export function estimateFormBLayoutHeightPt(
  answers: OptOutDefaultAnswers,
  scale: FormBLayoutScale,
): number {
  const contentWidthChars = charsPerLineForScale(scale);
  let height = 0;

  height += scale.bodyLineHeight * 2 + 6 + scale.sectionGap + 2;
  height += estimateLineCount(INTRO, contentWidthChars) * scale.bodyLineHeight;
  height += scale.sectionGap + 2;
  height += scale.fieldRowHeight * 5;
  height += scale.sectionGap;

  const blocks = [
    { label: Q1_LABEL, answer: blankIfIgnored(answers.q1) },
    { label: Q2_LABEL, answer: blankIfIgnored(answers.q2) },
    { label: Q3_LABEL, answer: blankIfIgnored(answers.q3) },
    { label: Q4_LABEL, answer: blankIfIgnored(answers.q4) },
  ];

  for (const block of blocks) {
    height += estimateLineCount(block.label, contentWidthChars) * scale.bodyLineHeight;
    height += scale.answerPadGap;
    if (block.answer) {
      height += estimateLineCount(block.answer, contentWidthChars) * scale.answerLineHeight;
    } else {
      height += scale.emptyAnswerHeight;
    }
    height += scale.questionGap;
  }

  height += SIGNATURE_ROW_HEIGHT_PT + scale.sectionGap / 2;
  height += FORM_B_FOOTER_GAP_ABOVE_PT + FORM_B_FOOTER_SIZE_PT;

  return height;
}

type PickScaleOptions = {
  /** Extra vertical budget consumed by the renderer (e.g. DOCX line box padding). */
  heightPaddingPt?: number;
  /** Never pick a scale smaller than this index (keeps type readable). */
  minScaleIndex?: number;
};

export function pickFormBLayoutScale(
  answers: OptOutDefaultAnswers,
  options: PickScaleOptions = {},
): FormBLayoutScale {
  const padding = options.heightPaddingPt ?? 0;
  const minIndex = options.minScaleIndex ?? 0;
  const availableHeight = FORM_B_PAGE_HEIGHT_PT - FORM_B_MARGIN_PT - FORM_B_FOOTER_RESERVE_PT - padding;

  for (let index = minIndex; index < FORM_B_LAYOUT_SCALES.length; index++) {
    const scale = FORM_B_LAYOUT_SCALES[index]!;
    if (estimateFormBLayoutHeightPt(answers, scale) <= availableHeight) {
      return scale;
    }
  }

  return FORM_B_LAYOUT_SCALES[FORM_B_LAYOUT_SCALES.length - 1]!;
}
