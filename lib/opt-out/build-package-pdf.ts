import "server-only";

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import {
  buildOptOutPackageParts,
  type OptOutPackagePart,
} from "@/lib/opt-out/build-package-docx";
import {
  extractDocxRenderBlocks,
  type DocxRenderBlock,
} from "@/lib/opt-out/docx-render-blocks";
import { embedPackageFonts, type PackageFonts } from "@/lib/opt-out/pdf-font";
import { wrapPdfText } from "@/lib/opt-out/pdf-layout";
import { appendFormBToPdf } from "@/lib/opt-out/render-form-b-pdf";
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

const COVER_TOP_MARGIN_PT = 36;

async function embedDocxImage(pdf: PDFDocument, data: Buffer) {
  try {
    return await pdf.embedPng(data);
  } catch {
    return await pdf.embedJpg(data);
  }
}

async function appendBlocksToPdf(
  pdf: PDFDocument,
  fonts: PackageFonts,
  blocks: DocxRenderBlock[],
  options: RenderOptions,
  pageBreakBefore: boolean,
  topMarginPt = MARGIN,
) {
  const { fontSize, lineHeight, blockGap } = options;
  const maxWidth = PAGE_WIDTH - MARGIN * 2;

  let page: PDFPage | null = null;
  let y = PAGE_HEIGHT - topMarginPt;

  const startPage = (forceNew: boolean) => {
    if (!page || forceNew) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - topMarginPt;
    }
  };

  startPage(pageBreakBefore);

  let atPageTop = true;
  for (const block of blocks) {
    if (block.type === "spacer") {
      if (atPageTop) {
        continue;
      }
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
      const x =
        block.align === "center"
          ? MARGIN + Math.max(0, (maxWidth - width) / 2)
          : MARGIN;

      page!.drawImage(image, {
        x,
        y: y - height,
        width,
        height,
      });

      y -= height + blockGap;
      atPageTop = false;
      continue;
    }

    const font: PDFFont = block.bold ? fonts.bold : fonts.regular;

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
    atPageTop = false;
  }

  if (!page) {
    pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  }
}

export async function buildOptOutPackagePdfFromParts(
  parts: OptOutPackagePart[],
  form: OptOutLetterForm,
  config: OptOutFormConfig,
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const fonts = await embedPackageFonts(pdf);

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index]!;
    const pageBreakBefore = index > 0;

    if (part.kind === "formB") {
      await appendFormBToPdf(
        pdf,
        fonts,
        form,
        config.defaultAnswers,
        pageBreakBefore,
      );
      continue;
    }

    const blocks = extractDocxRenderBlocks(part.buffer);
    const topMarginPt = part.kind === "cover" ? COVER_TOP_MARGIN_PT : MARGIN;
    await appendBlocksToPdf(
      pdf,
      fonts,
      blocks,
      DEFAULT_RENDER,
      pageBreakBefore,
      topMarginPt,
    );
  }

  return Buffer.from(await pdf.save());
}

export async function buildOptOutPackagePdf(
  form: OptOutLetterForm,
  config: OptOutFormConfig,
): Promise<Buffer> {
  const parts = await buildOptOutPackageParts(form, config);
  return buildOptOutPackagePdfFromParts(parts, form, config);
}
