import "server-only";

import {
  AlignmentType,
  convertInchesToTwip,
  Document,
  ImageRun,
  LeaderType,
  LineRuleType,
  Packer,
  Paragraph,
  Tab,
  TabStopType,
  TextRun,
} from "docx";
import {
  blankIfIgnored,
  FOOTER,
  FORM_SUBTITLE,
  FORM_TITLE,
  INTRO,
  Q1_LABEL,
  Q2_LABEL,
  Q3_LABEL,
  Q4_LABEL,
} from "@/lib/opt-out/form-b-content";
import {
  FORM_B_MARGIN_PT,
  FORM_B_FOOTER_GAP_ABOVE_PT,
  FORM_B_FOOTER_SIZE_PT,
  pickFormBLayoutScale,
  pointsToHalfPoints,
  pointsToTwips,
  SIGNATURE_TOP_GAP_PT,
  type FormBLayoutScale,
} from "@/lib/opt-out/form-b-layout";
import {
  FORM_B_BODY_COLOR,
  FORM_B_BODY_FONT,
  FORM_B_FOOTER_COLOR,
  FORM_B_FOOTER_FONT,
} from "@/lib/opt-out/form-b-theme";
import { parseDataUrl } from "@/lib/opt-out/embed-docx-image";
import { formatPhoneNumber } from "@/lib/opt-out/format-phone";
import {
  signatureImagePixels,
} from "@/lib/opt-out/signature-image-size";
import type { OptOutDefaultAnswers, OptOutLetterForm } from "@/lib/opt-out/types";

const MARGIN_TWIPS = pointsToTwips(FORM_B_MARGIN_PT);
const CONTENT_WIDTH_TWIPS = convertInchesToTwip(8.5) - MARGIN_TWIPS * 2;
const LINE_END_TWIPS = MARGIN_TWIPS + CONTENT_WIDTH_TWIPS;
const PHONE_SPLIT_TWIPS = MARGIN_TWIPS + Math.round(CONTENT_WIDTH_TWIPS * 0.48);
const SIGNATURE_SPLIT_TWIPS = MARGIN_TWIPS + Math.round(CONTENT_WIDTH_TWIPS * 0.55);

function resolveSignatureMode(form: OptOutLetterForm) {
  if (form.signatureMode === "draw" || form.signatureMode === "name") {
    return form.signatureMode;
  }
  return form.signatureImage?.trim() ? "draw" : "name";
}

function bodyRun(text: string, scale: FormBLayoutScale, options?: { bold?: boolean; italics?: boolean }) {
  return new TextRun({
    text,
    font: FORM_B_BODY_FONT,
    size: pointsToHalfPoints(scale.bodySize),
    color: FORM_B_BODY_COLOR,
    bold: options?.bold,
    italics: options?.italics,
  });
}

function titleRun(text: string, scale: FormBLayoutScale) {
  return new TextRun({
    text,
    font: FORM_B_BODY_FONT,
    size: pointsToHalfPoints(scale.titleSize),
    color: FORM_B_BODY_COLOR,
    bold: true,
  });
}

function tabRun() {
  return new TextRun({ children: [new Tab()] });
}

function fieldRowAfterTwips(scale: FormBLayoutScale) {
  return pointsToTwips(scale.fieldRowHeight - scale.bodyLineHeight);
}

function underlineTabStop(position: number) {
  return { type: TabStopType.RIGHT, position, leader: LeaderType.UNDERSCORE };
}

/** Partial underline field — label, value, then underscore leader to line end (matches letter.png). */
function labeledFieldParagraph(label: string, value: string, scale: FormBLayoutScale, extraAfterPt = 0) {
  const labelText = label.endsWith(":") ? `${label} ` : `${label}: `;
  const children: (TextRun | ImageRun)[] = [bodyRun(labelText, scale)];
  if (value) children.push(bodyRun(value, scale));
  children.push(tabRun());

  return new Paragraph({
    tabStops: [underlineTabStop(LINE_END_TWIPS)],
    spacing: {
      after: fieldRowAfterTwips(scale) + pointsToTwips(extraAfterPt),
      line: pointsToTwips(scale.fieldRowHeight),
      lineRule: LineRuleType.EXACT,
    },
    children,
  });
}

/** Home / work phone on one row with separate underline regions. */
function phoneRowParagraph(homePhone: string, workPhone: string, scale: FormBLayoutScale) {
  const children: TextRun[] = [
    bodyRun("Home Phone: ", scale),
    ...(homePhone ? [bodyRun(homePhone, scale)] : []),
    tabRun(),
    bodyRun(" Work Phone: ", scale),
    ...(workPhone ? [bodyRun(workPhone, scale)] : []),
    tabRun(),
  ];

  return new Paragraph({
    tabStops: [underlineTabStop(PHONE_SPLIT_TWIPS), underlineTabStop(LINE_END_TWIPS)],
    spacing: {
      after: fieldRowAfterTwips(scale),
      line: pointsToTwips(scale.fieldRowHeight),
      lineRule: LineRuleType.EXACT,
    },
    children,
  });
}

function questionSection(label: string, answer: string, scale: FormBLayoutScale) {
  const bodyLine = { line: pointsToTwips(scale.bodyLineHeight), lineRule: LineRuleType.EXACT };
  const answerLine = { line: pointsToTwips(scale.answerLineHeight), lineRule: LineRuleType.EXACT };

  const blocks: Paragraph[] = [
    new Paragraph({
      spacing: { after: pointsToTwips(scale.answerPadGap), ...bodyLine },
      children: [bodyRun(label, scale)],
    }),
  ];

  if (answer) {
    blocks.push(
      new Paragraph({
        spacing: { after: pointsToTwips(scale.questionGap), ...answerLine },
        children: [bodyRun(answer, scale)],
      }),
    );
  } else {
    blocks.push(
      new Paragraph({
        spacing: {
          after: pointsToTwips(scale.questionGap),
          line: pointsToTwips(Math.max(scale.emptyAnswerHeight, 28)),
          lineRule: LineRuleType.EXACT,
        },
        children: [],
      }),
    );
  }

  return blocks;
}

async function signatureParagraph(form: OptOutLetterForm, scale: FormBLayoutScale) {
  const signatureMode = resolveSignatureMode(form);
  const children: (TextRun | ImageRun)[] = [bodyRun("Signature: ", scale)];

  if (signatureMode === "draw") {
    const png = form.signatureImage ? parseDataUrl(form.signatureImage) : null;
    if (png) {
      const { width, height } = signatureImagePixels(png);
      children.push(
        new ImageRun({
          type: "png",
          data: png,
          transformation: { width, height },
        }),
      );
    } else {
      children.push(bodyRun(form.signatureName.trim() || form.parentName.trim(), scale));
    }
  } else {
    const name = form.signatureName.trim() || form.parentName.trim();
    if (!name) {
      throw new Error("A typed signature is required to generate Form B.");
    }
    children.push(bodyRun(name, scale));
  }

  children.push(tabRun());
  children.push(bodyRun(" Date: ", scale));
  children.push(bodyRun(form.date.trim(), scale));
  children.push(tabRun());

  return new Paragraph({
    tabStops: [underlineTabStop(SIGNATURE_SPLIT_TWIPS), underlineTabStop(LINE_END_TWIPS)],
    spacing: {
      before: pointsToTwips(scale.sectionGap + SIGNATURE_TOP_GAP_PT),
      after: fieldRowAfterTwips(scale),
      line: pointsToTwips(scale.fieldRowHeight),
      lineRule: LineRuleType.EXACT,
    },
    children,
  });
}

export async function renderFormBDocx(
  form: OptOutLetterForm,
  answers: OptOutDefaultAnswers,
): Promise<Buffer> {
  const scale = pickFormBLayoutScale(answers, { heightPaddingPt: 36, minScaleIndex: 2 });

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: {
        after: pointsToTwips(4),
        line: pointsToTwips(scale.bodyLineHeight + 2),
        lineRule: LineRuleType.EXACT,
      },
      children: [titleRun(FORM_TITLE, scale)],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: {
        after: pointsToTwips(scale.sectionGap + 4),
        line: pointsToTwips(scale.bodyLineHeight + 2),
        lineRule: LineRuleType.EXACT,
      },
      children: [titleRun(FORM_SUBTITLE, scale)],
    }),
    new Paragraph({
      alignment: AlignmentType.BOTH,
      spacing: {
        after: pointsToTwips(scale.sectionGap + 4),
        line: pointsToTwips(scale.bodyLineHeight),
        lineRule: LineRuleType.EXACT,
      },
      children: [bodyRun(INTRO, scale)],
    }),
    labeledFieldParagraph("Parent/Guardian Name", form.parentName.trim(), scale),
    labeledFieldParagraph("Address", form.address.trim(), scale),
    phoneRowParagraph(formatPhoneNumber(form.homePhone), formatPhoneNumber(form.workPhone), scale),
    labeledFieldParagraph("Student's Name", form.studentName.trim(), scale),
    labeledFieldParagraph("School Student Attends", form.schoolName.trim(), scale, scale.sectionGap),
  ];

  for (const block of [
    { label: Q1_LABEL, answer: blankIfIgnored(answers.q1) },
    { label: Q2_LABEL, answer: blankIfIgnored(answers.q2) },
    { label: Q3_LABEL, answer: blankIfIgnored(answers.q3) },
    { label: Q4_LABEL, answer: blankIfIgnored(answers.q4) },
  ]) {
    children.push(...questionSection(block.label, block.answer, scale));
  }

  children.push(await signatureParagraph(form, scale));

  children.push(
    new Paragraph({
      spacing: {
        line: pointsToTwips(FORM_B_FOOTER_GAP_ABOVE_PT),
        lineRule: LineRuleType.EXACT,
      },
      children: [],
    }),
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: {
        line: pointsToTwips(FORM_B_FOOTER_SIZE_PT + 2),
        lineRule: LineRuleType.EXACT,
      },
      children: [
        new TextRun({
          text: FOOTER,
          font: FORM_B_FOOTER_FONT,
          size: pointsToHalfPoints(FORM_B_FOOTER_SIZE_PT),
          color: FORM_B_FOOTER_COLOR,
          bold: true,
          italics: true,
        }),
      ],
    }),
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: MARGIN_TWIPS,
              bottom: MARGIN_TWIPS,
              left: MARGIN_TWIPS,
              right: MARGIN_TWIPS,
            },
            size: {
              width: convertInchesToTwip(8.5),
              height: convertInchesToTwip(11),
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
