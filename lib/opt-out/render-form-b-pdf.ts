import "server-only";

import { PDFDocument, rgb, type PDFPage, type PDFFont } from "pdf-lib";
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
  FORM_B_FOOTER_GAP_ABOVE_PT,
  FORM_B_FOOTER_RESERVE_PT,
  FORM_B_FOOTER_SIZE_PT,
  FORM_B_LAYOUT_SCALES,
  FORM_B_MARGIN_PT,
  FORM_B_PAGE_HEIGHT_PT,
  SIGNATURE_TOP_GAP_PT,
  type FormBLayoutScale,
} from "@/lib/opt-out/form-b-layout";
import {
  FORM_B_BODY_COLOR_RGB,
} from "@/lib/opt-out/form-b-theme";
import { parseDataUrl } from "@/lib/opt-out/embed-docx-image";
import { formatPhoneNumber } from "@/lib/opt-out/format-phone";
import { embedPackageFonts, type PackageFonts } from "@/lib/opt-out/pdf-font";
import { measureWrappedTextHeight, wrapPdfText } from "@/lib/opt-out/pdf-layout";
import {
  fitSignatureDimensions,
  SIGNATURE_ROW_HEIGHT_PT,
} from "@/lib/opt-out/signature-image-size";
import type { OptOutDefaultAnswers, OptOutLetterForm } from "@/lib/opt-out/types";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = FORM_B_PAGE_HEIGHT_PT;
const MARGIN = FORM_B_MARGIN_PT;
const FOOTER_MIN_Y = FORM_B_FOOTER_RESERVE_PT;
const RULE_THICKNESS = 0.6;
const RULE_DROP = 3;
const BODY_COLOR = rgb(FORM_B_BODY_COLOR_RGB.r, FORM_B_BODY_COLOR_RGB.g, FORM_B_BODY_COLOR_RGB.b);
const LINE_COLOR = rgb(0, 0, 0);
const FOOTER_COLOR = rgb(0, 0, 0);

type Pen = {
  page: PDFPage;
  fonts: PackageFonts;
  y: number;
  scale: FormBLayoutScale;
  contentWidth: number;
};

function resolveSignatureMode(form: OptOutLetterForm) {
  if (form.signatureMode === "draw" || form.signatureMode === "name") {
    return form.signatureMode;
  }
  return form.signatureImage?.trim() ? "draw" : "name";
}

function drawRule(page: PDFPage, x1: number, x2: number, y: number) {
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness: RULE_THICKNESS,
    color: LINE_COLOR,
  });
}

function truncateToWidth(text: string, font: PDFFont, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;

  let next = text;
  while (next.length > 0 && font.widthOfTextAtSize(`${next}…`, size) > maxWidth) {
    next = next.slice(0, -1);
  }

  return next.length > 0 ? `${next}…` : text.slice(0, 1);
}

function drawCenteredText(
  pen: Pen,
  text: string,
  font: PDFFont,
  fontSize: number,
  lineHeight: number,
) {
  pen.page.drawText(text, {
    x: (PAGE_WIDTH - font.widthOfTextAtSize(text, fontSize)) / 2,
    y: pen.y,
    size: fontSize,
    font,
    color: BODY_COLOR,
  });
  pen.y -= lineHeight;
}

function drawWrappedParagraph(pen: Pen, text: string, font: PDFFont, fontSize?: number) {
  const size = fontSize ?? pen.scale.bodySize;
  const lineHeight = pen.scale.bodyLineHeight;

  for (const line of wrapPdfText(text, font, size, pen.contentWidth)) {
    pen.page.drawText(line, {
      x: MARGIN,
      y: pen.y,
      size,
      font,
      color: BODY_COLOR,
    });
    pen.y -= lineHeight;
  }
}

function drawLabeledLineField(pen: Pen, label: string, value: string, lineEnd?: number) {
  const y = pen.y;
  const labelText = label.endsWith(":") ? `${label} ` : `${label}: `;

  pen.page.drawText(labelText, {
    x: MARGIN,
    y,
    size: pen.scale.bodySize,
    font: pen.fonts.regular,
    color: BODY_COLOR,
  });

  const labelWidth = pen.fonts.regular.widthOfTextAtSize(labelText, pen.scale.bodySize);
  const lineStart = MARGIN + labelWidth + 1;
  const lineStop = lineEnd ?? PAGE_WIDTH - MARGIN;

  if (value) {
    const display = truncateToWidth(
      value,
      pen.fonts.regular,
      pen.scale.bodySize,
      lineStop - lineStart - 6,
    );
    pen.page.drawText(display, {
      x: lineStart + 3,
      y,
      size: pen.scale.bodySize,
      font: pen.fonts.regular,
      color: BODY_COLOR,
    });
  }

  drawRule(pen.page, lineStart, lineStop, y - RULE_DROP);
  pen.y -= pen.scale.fieldRowHeight;
}

function drawPhoneRow(pen: Pen, homePhone: string, workPhone: string) {
  const y = pen.y;
  const splitX = MARGIN + pen.contentWidth * 0.48;

  const leftLabel = "Home Phone: ";
  pen.page.drawText(leftLabel, {
    x: MARGIN,
    y,
    size: pen.scale.bodySize,
    font: pen.fonts.regular,
    color: BODY_COLOR,
  });
  const leftLabelWidth = pen.fonts.regular.widthOfTextAtSize(leftLabel, pen.scale.bodySize);
  const leftLineStart = MARGIN + leftLabelWidth + 1;
  const leftLineEnd = splitX - 8;

  if (homePhone) {
    pen.page.drawText(
      truncateToWidth(homePhone, pen.fonts.regular, pen.scale.bodySize, leftLineEnd - leftLineStart - 6),
      { x: leftLineStart + 3, y, size: pen.scale.bodySize, font: pen.fonts.regular, color: BODY_COLOR },
    );
  }
  drawRule(pen.page, leftLineStart, leftLineEnd, y - RULE_DROP);

  const rightLabel = "Work Phone: ";
  pen.page.drawText(rightLabel, {
    x: splitX,
    y,
    size: pen.scale.bodySize,
    font: pen.fonts.regular,
    color: BODY_COLOR,
  });
  const rightLabelWidth = pen.fonts.regular.widthOfTextAtSize(rightLabel, pen.scale.bodySize);
  const rightLineStart = splitX + rightLabelWidth + 1;
  const rightLineEnd = PAGE_WIDTH - MARGIN;

  if (workPhone) {
    pen.page.drawText(
      truncateToWidth(workPhone, pen.fonts.regular, pen.scale.bodySize, rightLineEnd - rightLineStart - 6),
      { x: rightLineStart + 3, y, size: pen.scale.bodySize, font: pen.fonts.regular, color: BODY_COLOR },
    );
  }
  drawRule(pen.page, rightLineStart, rightLineEnd, y - RULE_DROP);

  pen.y -= pen.scale.fieldRowHeight;
}

function drawQuestionSection(pen: Pen, label: string, answer: string) {
  drawWrappedParagraph(pen, label, pen.fonts.regular);
  pen.y -= pen.scale.answerPadGap;

  const lines = answer ? wrapPdfText(answer, pen.fonts.regular, pen.scale.bodySize, pen.contentWidth) : [];

  if (lines.length === 0) {
    pen.y -= Math.max(pen.scale.emptyAnswerHeight, 28);
  } else {
    for (const line of lines) {
      pen.page.drawText(line, {
        x: MARGIN,
        y: pen.y,
        size: pen.scale.bodySize,
        font: pen.fonts.regular,
        color: BODY_COLOR,
      });
      pen.y -= pen.scale.answerLineHeight;
    }
  }

  pen.y -= pen.scale.questionGap;
}

function estimateLayoutHeight(
  answers: OptOutDefaultAnswers,
  fonts: PackageFonts,
  scale: FormBLayoutScale,
): number {
  const contentWidth = PAGE_WIDTH - MARGIN * 2;
  let height = 0;

  height += scale.bodyLineHeight * 2 + 6 + scale.sectionGap + 2;
  height += measureWrappedTextHeight(INTRO, fonts.regular, scale.bodySize, contentWidth, scale.bodyLineHeight);
  height += scale.sectionGap + 2;
  height += scale.fieldRowHeight * 5;
  height += scale.sectionGap;

  const questionBlocks = [
    { label: Q1_LABEL, answer: blankIfIgnored(answers.q1) },
    { label: Q2_LABEL, answer: blankIfIgnored(answers.q2) },
    { label: Q3_LABEL, answer: blankIfIgnored(answers.q3) },
    { label: Q4_LABEL, answer: blankIfIgnored(answers.q4) },
  ];

  for (const block of questionBlocks) {
    height += measureWrappedTextHeight(
      block.label,
      fonts.regular,
      scale.bodySize,
      contentWidth,
      scale.bodyLineHeight,
    );
    height += scale.answerPadGap;
    if (block.answer) {
      height += measureWrappedTextHeight(
        block.answer,
        fonts.regular,
        scale.bodySize,
        contentWidth,
        scale.answerLineHeight,
      );
    } else {
      height += scale.emptyAnswerHeight;
    }
    height += scale.questionGap;
  }

  height += SIGNATURE_TOP_GAP_PT + SIGNATURE_ROW_HEIGHT_PT + scale.sectionGap / 2;
  height += FORM_B_FOOTER_GAP_ABOVE_PT + FORM_B_FOOTER_SIZE_PT;

  return height;
}

async function drawSignatureRow(
  pdf: PDFDocument,
  pen: Pen,
  form: OptOutLetterForm,
) {
  pen.y -= SIGNATURE_TOP_GAP_PT;
  const y = pen.y;
  const splitX = MARGIN + pen.contentWidth * 0.55;
  const signatureLabel = "Signature:   ";
  const dateLabel = "Date: ";
  const ruleY = y - RULE_DROP;

  pen.page.drawText(signatureLabel, {
    x: MARGIN,
    y,
    size: pen.scale.bodySize,
    font: pen.fonts.regular,
    color: BODY_COLOR,
  });

  const signatureLineStart =
    MARGIN + pen.fonts.regular.widthOfTextAtSize(signatureLabel, pen.scale.bodySize) + 1;
  const signatureLineEnd = splitX - 10;
  const signatureMode = resolveSignatureMode(form);

  if (signatureMode === "draw") {
    const png = form.signatureImage ? parseDataUrl(form.signatureImage) : null;
    if (png) {
      try {
        const image = await pdf.embedPng(png);
        const fitted = fitSignatureDimensions(image.width, image.height);
        pen.page.drawImage(image, {
          x: signatureLineStart + 2,
          y: ruleY,
          width: fitted.width,
          height: fitted.height,
        });
      } catch {
        const name = form.signatureName.trim() || form.parentName.trim();
        pen.page.drawText(name, {
          x: signatureLineStart + 3,
          y,
          size: pen.scale.bodySize,
          font: pen.fonts.regular,
          color: BODY_COLOR,
        });
      }
    }
  } else {
    const name = form.signatureName.trim() || form.parentName.trim();
    pen.page.drawText(
      truncateToWidth(name, pen.fonts.regular, pen.scale.bodySize, signatureLineEnd - signatureLineStart - 6),
      { x: signatureLineStart + 3, y, size: pen.scale.bodySize, font: pen.fonts.regular, color: BODY_COLOR },
    );
  }

  drawRule(pen.page, signatureLineStart, signatureLineEnd, ruleY);

  pen.page.drawText(dateLabel, {
    x: splitX,
    y,
    size: pen.scale.bodySize,
    font: pen.fonts.regular,
    color: BODY_COLOR,
  });

  const dateLineStart = splitX + pen.fonts.regular.widthOfTextAtSize(dateLabel, pen.scale.bodySize) + 1;
  const dateLineEnd = PAGE_WIDTH - MARGIN;
  const dateValue = form.date.trim();

  if (dateValue) {
    pen.page.drawText(dateValue, {
      x: dateLineStart + 3,
      y,
      size: pen.scale.bodySize,
      font: pen.fonts.regular,
      color: BODY_COLOR,
    });
  }

  drawRule(pen.page, dateLineStart, dateLineEnd, ruleY);
  pen.y -= pen.scale.fieldRowHeight + pen.scale.sectionGap / 2;
}

async function layoutFormB(
  pdf: PDFDocument,
  form: OptOutLetterForm,
  answers: OptOutDefaultAnswers,
  fonts: PackageFonts,
  scale: FormBLayoutScale,
  pageBreakBefore: boolean,
): Promise<PDFPage> {
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const contentWidth = PAGE_WIDTH - MARGIN * 2;

  const pen: Pen = {
    page,
    fonts,
    y: PAGE_HEIGHT - MARGIN,
    scale,
    contentWidth,
  };

  if (pageBreakBefore) {
    pen.y -= 6;
  }

  drawCenteredText(pen, FORM_TITLE, fonts.bold, scale.titleSize, scale.bodyLineHeight + 2);
  drawCenteredText(pen, FORM_SUBTITLE, fonts.bold, scale.titleSize, scale.bodyLineHeight + 2);
  pen.y -= scale.sectionGap + 2;

  drawWrappedParagraph(pen, INTRO, fonts.regular);
  pen.y -= scale.sectionGap + 2;

  drawLabeledLineField(pen, "Parent/Guardian Name", form.parentName.trim());
  drawLabeledLineField(pen, "Address", form.address.trim());
  drawPhoneRow(pen, formatPhoneNumber(form.homePhone), formatPhoneNumber(form.workPhone));
  drawLabeledLineField(pen, "Student's Name", form.studentName.trim());
  drawLabeledLineField(pen, "School Student Attends", form.schoolName.trim());
  pen.y -= scale.sectionGap;

  drawQuestionSection(pen, Q1_LABEL, blankIfIgnored(answers.q1));
  drawQuestionSection(pen, Q2_LABEL, blankIfIgnored(answers.q2));
  drawQuestionSection(pen, Q3_LABEL, blankIfIgnored(answers.q3));
  drawQuestionSection(pen, Q4_LABEL, blankIfIgnored(answers.q4));

  await drawSignatureRow(pdf, pen, form);

  const footerY = Math.max(FOOTER_MIN_Y, pen.y - FORM_B_FOOTER_GAP_ABOVE_PT);
  page.drawText(FOOTER, {
    x: (PAGE_WIDTH - fonts.boldItalic.widthOfTextAtSize(FOOTER, FORM_B_FOOTER_SIZE_PT)) / 2,
    y: footerY,
    size: FORM_B_FOOTER_SIZE_PT,
    font: fonts.boldItalic,
    color: FOOTER_COLOR,
  });

  return page;
}

export async function renderFormBPdf(
  form: OptOutLetterForm,
  answers: OptOutDefaultAnswers,
  pageBreakBefore: boolean,
): Promise<PDFDocument> {
  const pdf = await PDFDocument.create();
  const fonts = await embedPackageFonts(pdf);
  const availableHeight = PAGE_HEIGHT - MARGIN - FOOTER_MIN_Y;

  let scale = FORM_B_LAYOUT_SCALES[FORM_B_LAYOUT_SCALES.length - 1]!;
  for (const candidate of FORM_B_LAYOUT_SCALES) {
    scale = candidate;
    if (estimateLayoutHeight(answers, fonts, candidate) <= availableHeight) {
      break;
    }
  }

  await layoutFormB(pdf, form, answers, fonts, scale, pageBreakBefore);
  return pdf;
}
