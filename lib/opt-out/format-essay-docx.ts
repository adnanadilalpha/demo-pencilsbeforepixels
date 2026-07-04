import "server-only";

import PizZip from "pizzip";

import {
  ensureParagraphSpacing,
  ensureTextRunsArial,
} from "@/lib/opt-out/docx-paragraph-style";

const HEADER_PARAGRAPH_COUNT = 2;
const SECTION_TITLE_REGEX = /^\d+\.\s*\S/;
/** 1.2× line spacing for long-form essay body copy. */
const ESSAY_BODY_LINE_TWIPS = 288;
const ESSAY_BODY_AFTER_TWIPS = 200;

function decodeXml(value: string) {
  return value
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function extractParagraphText(paragraphXml: string) {
  const runs = paragraphXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) ?? [];
  return decodeXml(
    runs
      .map((part) => part.replace(/<[^>]+>/g, ""))
      .join(""),
  ).trim();
}

function isSectionTitleParagraph(paragraphXml: string) {
  return SECTION_TITLE_REGEX.test(extractParagraphText(paragraphXml));
}

function ensureParagraphCenter(paragraphXml: string) {
  if (/<w:pPr[\s\S]*?<\/w:pPr>/.test(paragraphXml)) {
    return paragraphXml.replace(
      /<w:pPr>([\s\S]*?)<\/w:pPr>/,
      (_match, inner: string) => {
        const withoutJustify = inner.replace(/<w:jc w:val="[^"]*"\/>/g, "");
        return `<w:pPr><w:jc w:val="center"/>${withoutJustify}</w:pPr>`;
      },
    );
  }

  return paragraphXml.replace(
    /<w:p(\s[^>]*)?>/,
    "<w:p$1><w:pPr><w:jc w:val=\"center\"/></w:pPr>",
  );
}

function ensureRunBold(paragraphXml: string) {
  const withExistingRunProps = paragraphXml.replace(
    /<w:rPr>([\s\S]*?)<\/w:rPr>/g,
    (_match, inner: string) => {
      const withoutItalic = inner
        .replace(/<w:i\/>/g, "")
        .replace(/<w:iCs\/>/g, "");
      const hasBold =
        withoutItalic.includes("<w:b") || withoutItalic.includes("<w:bCs");
      const boldTags = hasBold ? "" : "<w:b/><w:bCs/>";
      return `<w:rPr>${boldTags}${withoutItalic}</w:rPr>`;
    },
  );

  return withExistingRunProps.replace(
    /<w:r(\s[^>]*)>((?![\s\S]*?<w:rPr>)[\s\S]*?)<\/w:r>/g,
    (_match, attrs: string, inner: string) => {
      if (inner.includes("<w:drawing")) {
        return `<w:r${attrs}>${inner}</w:r>`;
      }
      return `<w:r${attrs}><w:rPr><w:b/><w:bCs/></w:rPr>${inner}</w:r>`;
    },
  );
}

function formatEssayHeaderParagraph(paragraphXml: string) {
  return ensureRunBold(ensureParagraphCenter(paragraphXml));
}

function formatEssaySectionTitleParagraph(paragraphXml: string) {
  return ensureRunBold(paragraphXml);
}

function formatEssayBodyParagraph(paragraphXml: string) {
  let formatted = ensureTextRunsArial(paragraphXml);
  formatted = ensureParagraphSpacing(formatted, {
    line: ESSAY_BODY_LINE_TWIPS,
    lineRule: "auto",
    after: ESSAY_BODY_AFTER_TWIPS,
  });
  return formatted;
}

/** Bold + center the Form B Essay title/subtitle; bold each numbered section heading. */
export function formatEssayDocx(buffer: Buffer): Buffer {
  const zip = new PizZip(buffer);
  const documentPath = "word/document.xml";
  const xml = zip.file(documentPath)?.asText() ?? "";
  if (!xml) return buffer;

  const paragraphRegex = /<w:p[\s\S]*?<\/w:p>/g;
  const paragraphs = xml.match(paragraphRegex) ?? [];
  if (paragraphs.length === 0) return buffer;

  let nextXml = xml;
  for (let index = 0; index < paragraphs.length; index += 1) {
    const original = paragraphs[index]!;
    let formatted = original;

    if (index < HEADER_PARAGRAPH_COUNT) {
      formatted = formatEssayHeaderParagraph(original);
    } else if (isSectionTitleParagraph(original)) {
      formatted = formatEssaySectionTitleParagraph(original);
    } else if (extractParagraphText(original)) {
      formatted = formatEssayBodyParagraph(original);
    }

    if (formatted !== original) {
      nextXml = nextXml.replace(original, formatted);
    }
  }

  zip.file(documentPath, nextXml);
  return Buffer.from(zip.generate({ type: "nodebuffer" }));
}
