import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { OPT_OUT_SUBJECT, buildLetterParagraphs } from "./letter";
import type { OptOutLetterForm } from "./types";

function paragraph(text: string, options?: { bold?: boolean; spacingAfter?: number }) {
  if (!text) {
    return new Paragraph({
      children: [new TextRun("")],
      spacing: { after: options?.spacingAfter ?? 160 },
    });
  }

  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: options?.bold,
        font: "Times New Roman",
        size: 24,
      }),
    ],
    spacing: { after: options?.spacingAfter ?? 160 },
  });
}

export async function buildOptOutDocx(form: OptOutLetterForm): Promise<Buffer> {
  const student = form.studentName.trim() || "________________";
  const bodyParagraphs = buildLetterParagraphs(form);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          paragraph(form.date.trim() || "________________", { spacingAfter: 240 }),
          paragraph(`Student Name: ${student}`, { bold: true }),
          paragraph(`Subject: ${OPT_OUT_SUBJECT}`, { bold: true, spacingAfter: 280 }),
          ...bodyParagraphs.map((line) =>
            paragraph(line, {
              bold:
                line.startsWith("To be clear") ||
                line.startsWith("Please provide written") ||
                line === "Sincerely,",
              spacingAfter: line === "" ? 120 : 160,
            }),
          ),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

export function docxFilename(studentName: string) {
  const slug = studentName.trim().replace(/\s+/g, "-").toLowerCase() || "student";
  return `device-opt-out-letter-${slug}.docx`;
}
