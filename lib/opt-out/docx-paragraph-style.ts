/** Half-points for OOXML w:sz (10pt → 20). */
export const DOCX_ARIAL_FONT = "Arial";

export function docxFontSizeHalfPoints(pointSize: number) {
  return Math.round(pointSize * 2);
}

export function arialRunPropertiesXml(sizeHalfPoints?: number) {
  const sizeXml =
    sizeHalfPoints !== undefined
      ? `<w:sz w:val="${sizeHalfPoints}"/><w:szCs w:val="${sizeHalfPoints}"/>`
      : "";
  return `<w:rFonts w:ascii="${DOCX_ARIAL_FONT}" w:hAnsi="${DOCX_ARIAL_FONT}" w:cs="${DOCX_ARIAL_FONT}" w:eastAsia="${DOCX_ARIAL_FONT}"/>${sizeXml}`;
}

export function mergeRunProperties(existing: string, fontXml: string) {
  let next = existing.replace(/<w:rFonts[^>]*\/>/g, "");
  if (fontXml.includes("<w:sz")) {
    next = next
      .replace(/<w:sz w:val="[^"]*"\/>/g, "")
      .replace(/<w:szCs w:val="[^"]*"\/>/g, "");
  }

  if (!next.trim()) {
    return fontXml;
  }

  return `${fontXml}${next}`;
}

export function ensureTextRunsArial(
  paragraphXml: string,
  sizeHalfPoints?: number,
) {
  const fontXml = arialRunPropertiesXml(sizeHalfPoints);

  return paragraphXml.replace(/<w:r[\s\S]*?<\/w:r>/g, (run) => {
    if (run.includes("<w:drawing") || !run.includes("<w:t")) {
      return run;
    }

    if (run.includes("<w:rPr>")) {
      return run.replace(
        /<w:rPr>([\s\S]*?)<\/w:rPr>/,
        (_match, inner: string) => `<w:rPr>${mergeRunProperties(inner, fontXml)}</w:rPr>`,
      );
    }

    return run.replace(/<w:r(\s[^>]*)>/, `<w:r$1><w:rPr>${fontXml}</w:rPr>`);
  });
}

type ParagraphSpacingOptions = {
  line?: number;
  lineRule?: "auto" | "exact" | "atLeast";
  before?: number;
  after?: number;
};

export function ensureParagraphSpacing(
  paragraphXml: string,
  options: ParagraphSpacingOptions,
) {
  const spacingParts: string[] = [];
  if (options.before !== undefined) {
    spacingParts.push(`w:before="${options.before}"`);
  }
  if (options.after !== undefined) {
    spacingParts.push(`w:after="${options.after}"`);
  }
  if (options.line !== undefined) {
    spacingParts.push(`w:line="${options.line}"`);
  }
  if (options.lineRule !== undefined) {
    spacingParts.push(`w:lineRule="${options.lineRule}"`);
  }

  const spacingXml = `<w:spacing ${spacingParts.join(" ")}/>`;

  if (/<w:pPr[\s\S]*?<\/w:pPr>/.test(paragraphXml)) {
    return paragraphXml.replace(/<w:pPr>([\s\S]*?)<\/w:pPr>/, (_match, inner: string) => {
      const withoutSpacing = inner.replace(/<w:spacing[^>]*\/>/g, "");
      return `<w:pPr>${spacingXml}${withoutSpacing}</w:pPr>`;
    });
  }

  return paragraphXml.replace(
    /<w:p(\s[^>]*)?>/,
    `<w:p$1><w:pPr>${spacingXml}</w:pPr>`,
  );
}

export function patchDocDefaultsArial(
  stylesXml: string,
  sizeHalfPoints: number,
) {
  const fontXml = arialRunPropertiesXml(sizeHalfPoints);

  return stylesXml.replace(
    /<w:docDefaults>[\s\S]*?<\/w:docDefaults>/,
    `<w:docDefaults><w:rPrDefault><w:rPr>${fontXml}<w:lang w:val="en"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:line="288" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>`,
  );
}
