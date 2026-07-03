import "server-only";

import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import fontkit from "@pdf-lib/fontkit";
import type { PDFDocument, PDFFont } from "pdf-lib";

export type PackageFonts = {
  regular: PDFFont;
  bold: PDFFont;
  boldItalic: PDFFont;
  family: string;
};

const fontDir = join(process.cwd(), "lib/opt-out/fonts");

const REGULAR_CANDIDATES = [
  { file: "Calibri.ttf", family: "Calibri" },
  { file: "Calibri-Regular.ttf", family: "Calibri" },
  { file: "Aptos.ttf", family: "Aptos" },
  { file: "Aptos-Regular.ttf", family: "Aptos" },
  { file: "Arimo-Regular.ttf", family: "Arial" },
  { file: "NotoSans-Regular.ttf", family: "Noto Sans" },
] as const;

const BOLD_CANDIDATES = [
  { file: "Calibri-Bold.ttf", family: "Calibri" },
  { file: "Aptos-Bold.ttf", family: "Aptos" },
  { file: "Arimo-Bold.ttf", family: "Arial" },
  { file: "NotoSans-Bold.ttf", family: "Noto Sans" },
] as const;

const BOLD_ITALIC_CANDIDATES = [
  { file: "Calibri-BoldItalic.ttf", family: "Calibri" },
  { file: "Aptos-BoldItalic.ttf", family: "Aptos" },
  { file: "Arimo-BoldItalic.ttf", family: "Arial" },
  { file: "NotoSans-BoldItalic.ttf", family: "Noto Sans" },
] as const;

const cache = new Map<string, Buffer>();

async function loadFirstAvailable(
  candidates: ReadonlyArray<{ file: string; family: string }>,
) {
  for (const candidate of candidates) {
    const path = join(fontDir, candidate.file);
    try {
      await access(path);
      if (!cache.has(path)) {
        cache.set(path, await readFile(path));
      }
      return { bytes: cache.get(path)!, family: candidate.family, file: candidate.file };
    } catch {
      // try next candidate
    }
  }

  throw new Error("No PDF fonts found in lib/opt-out/fonts");
}

export async function embedPackageFonts(pdf: PDFDocument): Promise<PackageFonts> {
  pdf.registerFontkit(fontkit);

  const [regular, bold, boldItalic] = await Promise.all([
    loadFirstAvailable(REGULAR_CANDIDATES),
    loadFirstAvailable(BOLD_CANDIDATES),
    loadFirstAvailable(BOLD_ITALIC_CANDIDATES),
  ]);

  return {
    regular: await pdf.embedFont(regular.bytes),
    bold: await pdf.embedFont(bold.bytes),
    boldItalic: await pdf.embedFont(boldItalic.bytes),
    family: regular.family,
  };
}

/** Sans-serif PDF fallback face matched to the district Form B template (Arial / Calibri / Aptos). */
export async function embedPackageFont(pdf: PDFDocument): Promise<PDFFont> {
  return (await embedPackageFonts(pdf)).regular;
}
