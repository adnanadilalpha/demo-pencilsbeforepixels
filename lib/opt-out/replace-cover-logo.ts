import "server-only";

import sharp from "sharp";
import PizZip from "pizzip";

const EMU_PER_POINT = 914400 / 72;
/** ~80% of printable width — modestly larger than the legacy cropped logo slot. */
const COVER_LOGO_MAX_WIDTH_PT = 400;
const COVER_LOGO_MAX_HEIGHT_PT = 220;
/** Tighter top margin than the 1" template default (720 twips ≈ 0.5"). */
const COVER_TOP_MARGIN_TWIPS = 720;

function paragraphHasText(paragraphXml: string) {
  return /<w:t[^>]*>[^<]+<\/w:t>/.test(paragraphXml);
}

function pointsToEmu(points: number) {
  return Math.round(points * EMU_PER_POINT);
}

function coverLogoExtent(imageWidth: number, imageHeight: number) {
  if (imageWidth <= 0 || imageHeight <= 0) {
    return {
      cx: pointsToEmu(COVER_LOGO_MAX_WIDTH_PT),
      cy: pointsToEmu(COVER_LOGO_MAX_HEIGHT_PT),
    };
  }

  const aspect = imageWidth / imageHeight;
  let widthPt = COVER_LOGO_MAX_WIDTH_PT;
  let heightPt = widthPt / aspect;

  if (heightPt > COVER_LOGO_MAX_HEIGHT_PT) {
    heightPt = COVER_LOGO_MAX_HEIGHT_PT;
    widthPt = heightPt * aspect;
  }

  return {
    cx: pointsToEmu(widthPt),
    cy: pointsToEmu(heightPt),
  };
}

function tightenLogoParagraph(paragraphXml: string) {
  if (!paragraphXml.includes("<w:drawing")) {
    return paragraphXml;
  }

  let next = paragraphXml;

  if (/<w:pPr>/.test(next)) {
    next = next.replace(/<w:pPr>([\s\S]*?)<\/w:pPr>/, (_match, inner: string) => {
      const withoutSpacing = inner.replace(/<w:spacing[\s\S]*?\/>/g, "");
      return `<w:pPr>${withoutSpacing}<w:spacing w:before="0" w:after="120" w:line="240" w:lineRule="auto"/></w:pPr>`;
    });
  } else {
    next = next.replace(
      /<w:p([^>]*)>/,
      `<w:p$1><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="120" w:line="240" w:lineRule="auto"/></w:pPr>`,
    );
  }

  return next;
}

function trimCoverTopSpacing(documentXml: string) {
  const paragraphRegex = /<w:p[\s\S]*?<\/w:p>/g;
  const paragraphs = documentXml.match(paragraphRegex) ?? [];
  const logoIndex = paragraphs.findIndex((paragraph) => paragraph.includes("<w:drawing"));

  let nextXml = documentXml;

  if (logoIndex > 0) {
    for (const paragraph of paragraphs.slice(0, logoIndex)) {
      if (!paragraphHasText(paragraph) && !paragraph.includes("<w:drawing")) {
        nextXml = nextXml.replace(paragraph, "");
      }
    }
  }

  if (logoIndex >= 0 && paragraphs[logoIndex]) {
    const tightened = tightenLogoParagraph(paragraphs[logoIndex]);
    if (tightened !== paragraphs[logoIndex]) {
      nextXml = nextXml.replace(paragraphs[logoIndex], tightened);
    }
  }

  nextXml = nextXml.replace(/<w:pgMar([^>]*)\bw:top="\d+"/, `<w:pgMar$1w:top="${COVER_TOP_MARGIN_TWIPS}"`);

  return nextXml;
}

/** Swap the cover sheet logo image for the current admin solid logo. */
export async function replaceCoverLogoDocx(
  coverBuffer: Buffer,
  logoPng: Buffer,
): Promise<Buffer> {
  const zip = new PizZip(coverBuffer);
  const documentPath = "word/document.xml";
  const documentXml = zip.file(documentPath)?.asText() ?? "";
  if (!documentXml.includes("<w:drawing")) {
    return coverBuffer;
  }

  const embedMatch = documentXml.match(/<w:drawing[\s\S]*?r:embed="(rId\d+)"/);
  if (!embedMatch) {
    return coverBuffer;
  }

  const relId = embedMatch[1];
  const relsPath = "word/_rels/document.xml.rels";
  const relsXml = zip.file(relsPath)?.asText() ?? "";
  const targetMatch = relsXml.match(
    new RegExp(`<Relationship Id="${relId}"[^>]*Target="([^"]+)"`),
  );
  const target = targetMatch?.[1];

  if (!target?.startsWith("media/")) {
    return coverBuffer;
  }

  zip.file(`word/${target}`, logoPng);

  const metadata = await sharp(logoPng).metadata();
  const { cx, cy } = coverLogoExtent(metadata.width ?? 1, metadata.height ?? 1);

  let nextXml = documentXml.replace(/<a:srcRect[^>]*\/>/g, "");

  nextXml = nextXml.replace(
    /<wp:extent cx="\d+" cy="\d+"\/>/,
    `<wp:extent cx="${cx}" cy="${cy}"/>`,
  );
  nextXml = nextXml.replace(
    /<a:ext cx="\d+" cy="\d+"\/>/,
    `<a:ext cx="${cx}" cy="${cy}"/>`,
  );

  nextXml = trimCoverTopSpacing(nextXml);

  zip.file(documentPath, nextXml);
  return Buffer.from(zip.generate({ type: "nodebuffer" }));
}
