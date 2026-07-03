import PizZip from "pizzip";

const EMU_PER_POINT = 914400 / 72;
const RELATIONSHIP_REGEX =
  /<Relationship Id="([^"]+)" Type="[^"]+" Target="([^"]+)"\/>/g;

export type DocxRenderBlock =
  | { type: "text"; text: string }
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

function extractParagraphBlocks(
  paragraph: string,
  zip: PizZip,
  rels: Map<string, string>,
) {
  const blocks: DocxRenderBlock[] = [];
  const runs = paragraph.match(/<w:r[\s\S]*?<\/w:r>/g) ?? [];
  let textBuffer = "";

  const flushText = () => {
    const text = textBuffer.trim();
    if (text) {
      blocks.push({ type: "text", text });
    }
    textBuffer = "";
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

    textBuffer += extractRunText(run);
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
  return xml.includes("Thank you for filling out the 1:1 iPad opt out form");
}
