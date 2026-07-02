import { jsPDF } from "jspdf";
import { OPT_OUT_SUBJECT, buildLetterPlainText } from "./letter";
import type { OptOutLetterForm } from "./types";

export function buildOptOutPdf(form: OptOutLetterForm): Blob {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 72;
  const maxWidth = 612 - margin * 2;
  let y = margin;

  const addLine = (text: string, bold = false) => {
    if (!text) {
      y += 10;
      return;
    }

    doc.setFont("times", bold ? "bold" : "normal");
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(text, maxWidth) as string[];

    for (const line of lines) {
      if (y > 720) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 16;
    }
  };

  addLine(form.date.trim() || "________________");
  y += 8;
  addLine(`Student Name: ${form.studentName.trim() || "________________"}`, true);
  addLine(`Subject: ${OPT_OUT_SUBJECT}`, true);
  y += 8;

  for (const paragraph of buildLetterPlainText(form)
    .split("\n")
    .slice(4)) {
    addLine(paragraph, paragraph.startsWith("To be clear") || paragraph.startsWith("Please provide written") || paragraph === "Sincerely,");
  }

  return doc.output("blob");
}

export function pdfFilename(studentName: string) {
  const slug = studentName.trim().replace(/\s+/g, "-").toLowerCase() || "student";
  return `device-opt-out-letter-${slug}.pdf`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
