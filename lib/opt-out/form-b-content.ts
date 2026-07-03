import type { OptOutDefaultAnswers } from "@/lib/opt-out/types";

export const FORM_TITLE = "6320R - FORM B";
export const FORM_SUBTITLE = "REQUEST TO EXCUSE STUDENT FROM PARTICIPATION";

export const INTRO =
  "Board of Education Policy requires that requests by a parent/guardian to have a child excused from educational experiences be made in writing. This form is to be used when a parent/guardian wishes to request that his/her child be excused from classroom instruction, testing, or other school experiences. This form must be completed and signed by the parent/guardian for each individual event, activity and / or experience and returned to the Principal of the building where the educational material is located.";

export const Q1_LABEL =
  "1. Please describe the classroom instruction, testing or other activity for which you are requesting an excusal.";

export const Q2_LABEL =
  "2. If your request involves a textbook or other written material, please provide the title and author.";

export const Q3_LABEL =
  "3. Specifically describe your objection (cite pages if applicable) and explain the basis for the objection. (You may use additional paper if necessary to answer in full)";

export const Q4_LABEL =
  "4. What suggestions do you have for an alternative experience or material for your child?";

export const FOOTER = "Westside Community Schools Regulation 6320R - Form B (October 2024)";

export function blankIfIgnored(value: string | null | undefined) {
  if (value == null) return "";
  const trimmed = value.trim();
  if (!trimmed || /^leave blank\.?$/i.test(trimmed)) return "";
  return trimmed;
}

export function questionBlocks(answers: OptOutDefaultAnswers) {
  return [
    { label: Q1_LABEL, answer: blankIfIgnored(answers.q1) },
    { label: Q2_LABEL, answer: blankIfIgnored(answers.q2) },
    { label: Q3_LABEL, answer: blankIfIgnored(answers.q3) },
    { label: Q4_LABEL, answer: blankIfIgnored(answers.q4) },
  ];
}
