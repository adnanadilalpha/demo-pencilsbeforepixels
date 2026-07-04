import "server-only";

import { PDFDocument, rgb } from "pdf-lib";
import {
  buildOptOutPackageParts,
  type OptOutPackagePartKind,
} from "@/lib/opt-out/build-package-docx";
import {
  extractDocxRenderBlocks,
  type DocxRenderBlock,
} from "@/lib/opt-out/docx-render-blocks";
import { embedPackageFonts } from "@/lib/opt-out/pdf-font";
import { wrapPdfText } from "@/lib/opt-out/pdf-layout";
import { renderFormBPdf } from "@/lib/opt-out/render-form-b-pdf";
import type { OptOutFormConfig, OptOutLetterForm } from "@/lib/opt-out/types";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;

type RenderOptions = {
  fontSize: number;
  lineHeight: number;
  blockGap: number;
};

const DEFAULT_RENDER: RenderOptions = {
  fontSize: 11,
  lineHeight: 16,
  blockGap: 14,
};

async function embedDocxImage(pdf: PDFDocument, data: Buffer) {
  try {
    return await pdf.embedPng(data);
  } catch {
    return await pdf.embedJpg(data);
  }
}

async function renderBlocksToPdf(
  blocks: DocxRenderBlock[],
  options: RenderOptions,
  pageBreakBefore: boolean,
): Promise<PDFDocument> {
  const pdf = await PDFDocument.create();
  const fonts = await embedPackageFonts(pdf);
  const { fontSize, lineHeight, blockGap } = options;
  const maxWidth = PAGE_WIDTH - MARGIN * 2;

  let page: ReturnType<PDFDocument["addPage"]> | null = null;
  let y = PAGE_HEIGHT - MARGIN;

  const startPage = (forceNew: boolean) => {
    if (!page || forceNew) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  };

  startPage(pageBreakBefore);

  for (const block of blocks) {
    if (block.type === "spacer") {
      startPage(false);
      y -= blockGap;
      continue;
    }

    if (block.type === "image") {
      startPage(false);

      if (y < MARGIN + block.heightPt + blockGap) {
        startPage(true);
      }

      const image = await embedDocxImage(pdf, block.data);
      const scale = Math.min(1, maxWidth / block.widthPt);
      const width = block.widthPt * scale;
      const height = block.heightPt * scale;

      page!.drawImage(image, {
        x: MARGIN,
        y: y - height,
        width,
        height,
      });

      y -= height + blockGap;
      continue;
    }

    const font = block.bold ? fonts.bold : fonts.regular;

    for (const line of wrapPdfText(block.text, font, fontSize, maxWidth)) {
      startPage(false);

      if (y < MARGIN + lineHeight) {
        startPage(true);
      }

      const lineWidth = font.widthOfTextAtSize(line, fontSize);
      const x =
        block.align === "center"
          ? MARGIN + Math.max(0, (maxWidth - lineWidth) / 2)
          : MARGIN;

      page!.drawText(line, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }

    y -= blockGap;
  }

  if (!page) {
    pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  }

  return pdf;
}

async function renderPartToPdf(
  buffer: Buffer,
  kind: OptOutPackagePartKind,
  form: OptOutLetterForm,
  config: OptOutFormConfig,
  pageBreakBefore: boolean,
): Promise<PDFDocument> {
  if (kind === "formB") {
    return renderFormBPdf(form, config.defaultAnswers, pageBreakBefore);
  }

  const blocks = extractDocxRenderBlocks(buffer);
  return renderBlocksToPdf(blocks, DEFAULT_RENDER, pageBreakBefore);
}

async function buildPdfFromParts(
  parts: Awaited<ReturnType<typeof buildOptOutPackageParts>>,
  form: OptOutLetterForm,
  config: OptOutFormConfig,
): Promise<Buffer> {
  let merged = await PDFDocument.create();

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index]!;
    const partPdf = await renderPartToPdf(
      part.buffer,
      part.kind,
      form,
      config,
      index > 0,
    );
    const pages = await merged.copyPages(partPdf, partPdf.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  return Buffer.from(await merged.save());
}

export async function buildOptOutPackagePdf(
  form: OptOutLetterForm,
  config: OptOutFormConfig,
): Promise<Buffer> {
  const parts = await buildOptOutPackageParts(form, config);
  return buildPdfFromParts(parts, form, config);
}
