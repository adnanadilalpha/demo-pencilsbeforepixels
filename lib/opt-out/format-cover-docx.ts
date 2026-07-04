import "server-only";

import PizZip from "pizzip";
import {
  docxFontSizeHalfPoints,
  ensureParagraphSpacing,
  ensureTextRunsArial,
  patchDocDefaultsArial,
} from "@/lib/opt-out/docx-paragraph-style";

const COVER_BODY_FONT_PT = 10;
const COVER_BODY_SIZE_HALF_POINTS = docxFontSizeHalfPoints(COVER_BODY_FONT_PT);
/** 1.2× line spacing (288 / 240). */
const COVER_BODY_LINE_TWIPS = 288;

function paragraphHasText(paragraphXml: string) {
  return /<w:t[^>]*>[^<]+<\/w:t>/.test(paragraphXml);
}

/** Arial 10pt body copy with comfortable line spacing on the cover sheet. */
export function formatCoverDocx(buffer: Buffer): Buffer {
  const zip = new PizZip(buffer);
  const documentPath = "word/document.xml";
  const xml = zip.file(documentPath)?.asText() ?? "";
  if (!xml) return buffer;

  const paragraphRegex = /<w:p[\s\S]*?<\/w:p>/g;
  const paragraphs = xml.match(paragraphRegex) ?? [];
  if (paragraphs.length === 0) return buffer;

  let nextXml = xml;
  for (const original of paragraphs) {
    if (!paragraphHasText(original) || original.includes("<w:drawing")) {
      continue;
    }

    let formatted = ensureTextRunsArial(original, COVER_BODY_SIZE_HALF_POINTS);
    formatted = ensureParagraphSpacing(formatted, {
      line: COVER_BODY_LINE_TWIPS,
      lineRule: "auto",
      after: 160,
    });

    if (formatted !== original) {
      nextXml = nextXml.replace(original, formatted);
    }
  }

  zip.file(documentPath, nextXml);

  const stylesPath = "word/styles.xml";
  const stylesXml = zip.file(stylesPath)?.asText();
  if (stylesXml) {
    zip.file(stylesPath, patchDocDefaultsArial(stylesXml, COVER_BODY_SIZE_HALF_POINTS));
  }

  return Buffer.from(zip.generate({ type: "nodebuffer" }));
}
