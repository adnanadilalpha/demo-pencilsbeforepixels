import type { OptOutLetterForm } from "./types";

export const OPT_OUT_SUBJECT =
  "Withdrawal of Consent for My Child's Participation in EdTech Programs";

export function buildLetterParagraphs(form: OptOutLetterForm): string[] {
  const child = form.childName.trim() || form.studentName.trim() || "________________";
  const recipient = form.recipientName.trim() || "________________";
  const stateTest = form.stateTestName.trim() || "Nebraska NSCAS";

  return [
    `Dear ${recipient},`,
    "",
    `I am writing to formally withdraw consent for my child, ${child}, to participate in the use of school-issued digital devices and non-essential electronic programs, whether currently provided or adopted in the future.`,
    "",
    "This decision is based on extensive research and evidence regarding the impact of screen-based learning on academic outcomes, cognitive development, and student wellbeing. Specifically:",
    "",
    "1. Academic Impact — Large-scale assessments (PISA, TIMSS, NAEP) show declines in learning outcomes associated with increased screen use.",
    "",
    "2. Cognitive Development — Analog practices such as reading, notetaking, and studying on paper produce stronger comprehension and memory than screen-based alternatives.",
    "",
    "3. Mental and Physical Health — Excessive device use is linked to distraction, anxiety, depression, and sleep disruption among school-age children.",
    "",
    "To be clear:",
    "",
    "• My child should not be required to use school-issued devices for classwork or homework.",
    "• All assignments must be provided in printable or offline formats upon request.",
    "• My child should not be penalized for working in analog formats.",
    `• The ${stateTest} tests should be conducted on paper.`,
    "",
    "I acknowledge that certain subjects such as coding, robotics, or design may require computer use, provided it is on a school-mediated computer with a teacher present.",
    "",
    "Please provide written confirmation that this opt-out request will be honored and that my child will be offered appropriate offline alternatives.",
    "",
    "Thank you for your understanding and cooperation in supporting my child's learning, health and wellbeing.",
    "",
    "Sincerely,",
    form.parentName.trim() || "________________",
  ];
}

export function buildLetterPlainText(form: OptOutLetterForm): string {
  const student = form.studentName.trim() || "________________";
  const lines = [
    form.date.trim() || "________________",
    "",
    `Student Name: ${student}`,
    "",
    `Subject: ${OPT_OUT_SUBJECT}`,
    "",
    ...buildLetterParagraphs(form),
  ];

  return lines.join("\n");
}
