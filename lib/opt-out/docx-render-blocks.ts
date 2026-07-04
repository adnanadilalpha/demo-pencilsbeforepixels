import PizZip from "pizzip";

const EMU_PER_POINT = 914400 / 72;
const RELATIONSHIP_REGEX =
  /<Relationship Id="([^"]+)" Type="[^"]+" Target="([^"]+)"\/>/g;

export type DocxTextAlign = "left" | "center" | "right" | "both";

export type DocxRenderBlock =
  | { type: "text"; text: string; bold?: boolean; align?: DocxTextAlign }
  | { type: "spacer" }
  | { type: "image"; data: Buffer; widthPt: number; heightPt: number };

function decodeXml(value: string) {
  return value
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function buildRelationshipMap(relsXml: string) {
  const map = new Map<string, string>();

  for (const match of relsXml.matchAll(RELATIONSHIP_REGEX)) {
    map.set(match[1], match[2]);
  }

  return map;
}

function emuToPoints(emu: number) {
  return emu / EMU_PER_POINT;
}

function extractRunText(run: string) {
  const runs = run.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) ?? [];
  return decodeXml(
    runs
      .map((part) => part.replace(/<[^>]+>/g, ""))
      .join(""),
  );
}

function extractDrawingBlock(
  drawing: string,
  zip: PizZip,
  rels: Map<string, string>,
): DocxRenderBlock | null {
  const embedMatch = drawing.match(/r:embed="([^"]+)"/);
  if (!embedMatch) return null;

  const target = rels.get(embedMatch[1]);
  if (!target?.startsWith("media/")) return null;

  const mediaPath = `word/${target}`;
  const file = zip.file(mediaPath);
  if (!file) return null;

  const extentMatch = drawing.match(/<wp:extent cx="(\d+)" cy="(\d+)"/);
  const widthPt = extentMatch ? emuToPoints(Number(extentMatch[1])) : 180;
  const heightPt = extentMatch ? emuToPoints(Number(extentMatch[2])) : 55;

  return {
    type: "image",
    data: file.asNodeBuffer(),
    widthPt,
    heightPt,
  };
}

function extractParagraphAlign(paragraph: string): DocxTextAlign | undefined {
  const match = paragraph.match(/<w:jc w:val="([^"]+)"/);
  const value = match?.[1];
  if (value === "center" || value === "right" || value === "both" || value === "left") {
    return value;
  }
  return undefined;
}

function isBoldRun(run: string) {
  return /<w:b(?:\/>| )/.test(run) || /<w:bCs(?:\/>| )/.test(run);
}

function extractParagraphDefaultBold(paragraph: string) {
  const paragraphProps = paragraph.match(/<w:pPr>[\s\S]*?<\/w:pPr>/)?.[0] ?? "";
  const runProps = paragraphProps.match(/<w:rPr>[\s\S]*?<\/w:rPr>/)?.[0] ?? "";
  return runProps ? isBoldRun(runProps) : false;
}

function isBoldRunInParagraph(run: string, paragraph: string) {
  if (/<w:rPr[\s\S]*?<\/w:rPr>/.test(run)) {
    return isBoldRun(run);
  }
  return extractParagraphDefaultBold(paragraph);
}

function extractParagraphBlocks(
  paragraph: string,
  zip: PizZip,
  rels: Map<string, string>,
) {
  const blocks: DocxRenderBlock[] = [];
  const runs = paragraph.match(/<w:r[\s\S]*?<\/w:r>/g) ?? [];
  const align = extractParagraphAlign(paragraph);
  let textBuffer = "";
  let boldBuffer = false;
  let hasTextRuns = false;

  const flushText = () => {
    const text = textBuffer.trim();
    if (text) {
      blocks.push({
        type: "text",
        text,
        ...(boldBuffer ? { bold: true } : {}),
        ...(align ? { align } : {}),
      });
    }
    textBuffer = "";
    boldBuffer = false;
    hasTextRuns = false;
  };

  for (const run of runs) {
    const drawingMatch = run.match(/<w:drawing[\s\S]*?<\/w:drawing>/);
    if (drawingMatch) {
      flushText();
      const image = extractDrawingBlock(drawingMatch[0], zip, rels);
      if (image) {
        blocks.push(image);
      }
      continue;
    }

    const runText = extractRunText(run);
    if (!runText) continue;

    const runBold = isBoldRunInParagraph(run, paragraph);
    if (hasTextRuns && runBold !== boldBuffer) {
      flushText();
    }

    textBuffer += runText;
    boldBuffer = runBold;
    hasTextRuns = true;
  }

  flushText();
  if (blocks.length === 0) {
    blocks.push({ type: "spacer" });
  }
  return blocks;
}

export function extractDocxRenderBlocks(buffer: Buffer): DocxRenderBlock[] {
  const zip = new PizZip(buffer);
  const xml = zip.files["word/document.xml"]?.asText() ?? "";
  const relsXml = zip.files["word/_rels/document.xml.rels"]?.asText() ?? "";
  const rels = buildRelationshipMap(relsXml);
  const paragraphs = xml.match(/<w:p[\s\S]*?<\/w:p>/g) ?? [];

  return paragraphs.flatMap((paragraph) => extractParagraphBlocks(paragraph, zip, rels));
}

export function isCoverDocx(buffer: Buffer) {
  const zip = new PizZip(buffer);
  const xml = zip.files["word/document.xml"]?.asText() ?? "";
  return xml.includes("Thank you for completing the 1:1 digital device opt-out form");
}
