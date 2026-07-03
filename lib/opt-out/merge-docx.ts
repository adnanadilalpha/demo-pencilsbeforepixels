import "server-only";

import PizZip from "pizzip";
import { copyPartPackageAssets } from "@/lib/opt-out/docx-assets";

const PAGE_BREAK = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
const RELATIONSHIP_REGEX =
  /<Relationship Id="(rId\d+)" Type="([^"]+)" Target="([^"]+)"\/>/g;
const STYLE_BLOCK_REGEX = /<w:style[\s\S]*?<\/w:style>/g;

function extractBody(xml: string) {
  const match = xml.match(/<w:body[^>]*>([\s\S]*)<\/w:body>/);
  if (!match) return { content: "", sectPr: "" };

  const bodyInner = match[1];
  const sectPrMatch = bodyInner.match(/<w:sectPr[\s\S]*<\/w:sectPr>/);
  const sectPr = sectPrMatch?.[0] ?? "";
  const content = bodyInner.replace(/<w:sectPr[\s\S]*<\/w:sectPr>/, "");

  return { content, sectPr };
}

function buildSectionBreak(partSectPr: string) {
  if (partSectPr) {
    const withNextPage = partSectPr.includes('w:type w:val="nextPage"')
      ? partSectPr
      : partSectPr.replace(
          /<w:sectPr([^>]*)>/,
          '<w:sectPr$1><w:type w:val="nextPage"/>',
        );

    return `<w:p><w:pPr>${withNextPage}</w:pPr></w:p>`;
  }

  return PAGE_BREAK;
}

function nextRelId(relsXml: string) {
  const ids = [...relsXml.matchAll(/Id="rId(\d+)"/g)].map((match) => Number(match[1]));
  return Math.max(0, ...ids) + 1;
}

function remapRelationshipIds(content: string, idMap: Map<string, string>) {
  let next = content;

  for (const [oldId, newId] of idMap) {
    next = next.replaceAll(`"${oldId}"`, `"${newId}"`);
  }

  return next;
}

function mergePartStyles(
  baseStylesXml: string,
  partStylesXml: string | undefined,
  prefix: string,
) {
  if (!partStylesXml) {
    return { stylesXml: baseStylesXml, styleMap: new Map<string, string>() };
  }

  const styleMap = new Map<string, string>();
  const existingIds = new Set(
    [...baseStylesXml.matchAll(/w:styleId="([^"]+)"/g)].map((match) => match[1]),
  );
  const styleBlocks = partStylesXml.match(STYLE_BLOCK_REGEX) ?? [];

  for (const styleBlock of styleBlocks) {
    const idMatch = styleBlock.match(/w:styleId="([^"]+)"/);
    if (!idMatch) continue;

    const oldId = idMatch[1];
    let newId = oldId;

    if (existingIds.has(oldId)) {
      newId = `${prefix}${oldId}`;
    }

    styleMap.set(oldId, newId);
    existingIds.add(newId);
  }

  let stylesXml = baseStylesXml;

  for (const styleBlock of styleBlocks) {
    const idMatch = styleBlock.match(/w:styleId="([^"]+)"/);
    if (!idMatch) continue;

    let nextBlock = styleBlock;

    for (const [oldId, newId] of styleMap) {
      nextBlock = nextBlock.replaceAll(`w:styleId="${oldId}"`, `w:styleId="${newId}"`);
      nextBlock = nextBlock.replaceAll(`w:val="${oldId}"`, `w:val="${newId}"`);
    }

    stylesXml = stylesXml.replace("</w:styles>", `${nextBlock}</w:styles>`);
  }

  return { stylesXml, styleMap };
}

function remapDocumentStyles(content: string, styleMap: Map<string, string>) {
  if (styleMap.size === 0) return content;

  let next = content;

  for (const [oldId, newId] of styleMap) {
    next = next.replaceAll(`<w:pStyle w:val="${oldId}"`, `<w:pStyle w:val="${newId}"`);
    next = next.replaceAll(`<w:rStyle w:val="${oldId}"`, `<w:rStyle w:val="${newId}"`);
    next = next.replaceAll(`<w:tblStyle w:val="${oldId}"`, `<w:tblStyle w:val="${newId}"`);
  }

  return next;
}

function appendMediaRelationships(
  baseZip: PizZip,
  partZip: PizZip,
  relsXml: string,
  content: string,
) {
  const partRels = partZip.file("word/_rels/document.xml.rels")?.asText() ?? "";
  const idMap = new Map<string, string>();
  let nextRels = relsXml;
  let mediaIndex = Object.keys(baseZip.files).filter((name) =>
    name.startsWith("word/media/"),
  ).length;

  for (const match of partRels.matchAll(RELATIONSHIP_REGEX)) {
    const oldId = match[1];
    const type = match[2];
    const target = match[3];

    if (!target.startsWith("media/")) continue;

    const sourcePath = `word/${target}`;
    const mediaFile = partZip.file(sourcePath);
    if (!mediaFile) continue;

    mediaIndex += 1;
    const extension = target.split(".").pop() ?? "bin";
    const mergedTarget = `media/merged-${mediaIndex}.${extension}`;
    baseZip.file(`word/${mergedTarget}`, mediaFile.asNodeBuffer());

    const newId = `rId${nextRelId(nextRels)}`;
    nextRels = nextRels.replace(
      "</Relationships>",
      `<Relationship Id="${newId}" Type="${type}" Target="${mergedTarget}"/></Relationships>`,
    );
    idMap.set(oldId, newId);
  }

  return {
    relsXml: nextRels,
    content: remapRelationshipIds(content, idMap),
  };
}

/** Merge DOCX templates in order, each part starting on its own page(s). */
export function mergeDocxBuffers(buffers: Buffer[]): Buffer {
  if (buffers.length === 0) {
    throw new Error("No DOCX buffers to merge");
  }

  if (buffers.length === 1) {
    return buffers[0]!;
  }

  const baseZip = new PizZip(buffers[0]);
  const baseXml = baseZip.file("word/document.xml")?.asText();
  if (!baseXml) {
    throw new Error("Invalid DOCX: missing word/document.xml");
  }

  let relsXml =
    baseZip.file("word/_rels/document.xml.rels")?.asText() ??
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';

  let stylesXml =
    baseZip.file("word/styles.xml")?.asText() ??
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"></w:styles>';

  const { content: firstContent, sectPr } = extractBody(baseXml);
  let mergedContent = firstContent;

  for (let index = 1; index < buffers.length; index += 1) {
    const partZip = new PizZip(buffers[index]!);
    const partXml = partZip.file("word/document.xml")?.asText();
    if (!partXml) continue;

    const partStyles = partZip.file("word/styles.xml")?.asText();
    const styleMerge = mergePartStyles(stylesXml, partStyles, `p${index}_`);
    stylesXml = styleMerge.stylesXml;

    let { content, sectPr: partSectPr } = extractBody(partXml);
    content = remapDocumentStyles(content, styleMerge.styleMap);

    const mediaMerge = appendMediaRelationships(baseZip, partZip, relsXml, content);
    relsXml = mediaMerge.relsXml;
    content = mediaMerge.content;

    copyPartPackageAssets(baseZip, partZip);

    mergedContent += buildSectionBreak(partSectPr) + content;
  }

  const mergedXml = baseXml.replace(
    /<w:body[^>]*>[\s\S]*<\/w:body>/,
    `<w:body>${mergedContent}${sectPr}</w:body>`,
  );

  baseZip.file("word/document.xml", mergedXml);
  baseZip.file("word/_rels/document.xml.rels", relsXml);
  baseZip.file("word/styles.xml", stylesXml);

  return Buffer.from(baseZip.generate({ type: "nodebuffer" }));
}
