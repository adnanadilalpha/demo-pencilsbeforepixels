import "server-only";

import PizZip from "pizzip";

const RELATIONSHIP_REGEX =
  /<Relationship Id="(rId\d+)" Type="([^"]+)" Target="([^"]+)"\/>/g;

function nextRelId(relsXml: string) {
  const ids = [...relsXml.matchAll(/Id="rId(\d+)"/g)].map((match) => Number(match[1]));
  return Math.max(0, ...ids) + 1;
}

function ensurePngContentType(contentTypesXml: string) {
  if (contentTypesXml.includes('Extension="png"')) return contentTypesXml;

  return contentTypesXml.replace(
    "</Types>",
    '<Default Extension="png" ContentType="image/png"/></Types>',
  );
}

type EmbedImageOptions = {
  widthEmu?: number;
  heightEmu?: number;
  mediaName?: string;
};

/** Add a PNG to the DOCX package and return an inline drawing run referencing it. */
export function embedDocxPng(
  zip: PizZip,
  pngBuffer: Buffer,
  options: EmbedImageOptions = {},
): string {
  const widthEmu = options.widthEmu ?? 1_371_600;
  const heightEmu = options.heightEmu ?? 457_200;
  const mediaName = options.mediaName ?? `signature-${Date.now()}.png`;
  const mediaPath = `word/media/${mediaName}`;

  zip.file(mediaPath, pngBuffer);

  const contentTypes =
    zip.file("[Content_Types].xml")?.asText() ??
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>';
  zip.file("[Content_Types].xml", ensurePngContentType(contentTypes));

  let relsXml =
    zip.file("word/_rels/document.xml.rels")?.asText() ??
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';

  const relId = `rId${nextRelId(relsXml)}`;
  relsXml = relsXml.replace(
    "</Relationships>",
    `<Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${mediaName}"/></Relationships>`,
  );
  zip.file("word/_rels/document.xml.rels", relsXml);

  const docPrId = Math.floor(Math.random() * 1_000_000_000);

  return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${widthEmu}" cy="${heightEmu}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${docPrId}" name="Signature"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${docPrId}" name="Signature"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${widthEmu}" cy="${heightEmu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
}

export function parseDataUrl(dataUrl: string): Buffer | null {
  const match = dataUrl.match(/^data:image\/(?:png|jpeg|jpg);base64,(.+)$/);
  if (!match) return null;

  return Buffer.from(match[1], "base64");
}
