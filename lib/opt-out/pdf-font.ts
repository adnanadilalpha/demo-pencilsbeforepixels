import "server-only";

import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import fontkit from "@pdf-lib/fontkit";
import type { PDFDocument, PDFFont } from "pdf-lib";
import { FORM_B_SIGNATURE_FONT, FORM_B_SIGNATURE_FONT_DIR, FORM_B_SIGNATURE_FONT_FILE } from "@/lib/opt-out/form-b-theme";

export type PackageFonts = {
  regular: PDFFont;
  bold: PDFFont;
  boldItalic: PDFFont;
  signature: PDFFont;
  family: string;
  signatureFamily: string;
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

const SIGNATURE_CANDIDATES = [{ file: FORM_B_SIGNATURE_FONT_FILE, family: FORM_B_SIGNATURE_FONT }] as const;
const signatureFontDir = join(process.cwd(), FORM_B_SIGNATURE_FONT_DIR);

const cache = new Map<string, Buffer>();

async function loadFirstAvailable(
  candidates: ReadonlyArray<{ file: string; family: string }>,
  baseDir = fontDir,
  context = "lib/opt-out/fonts",
) {
  for (const candidate of candidates) {
    const path = join(baseDir, candidate.file);
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

  throw new Error(`No PDF fonts found in ${context}`);
}

export async function embedPackageFonts(pdf: PDFDocument): Promise<PackageFonts> {
  pdf.registerFontkit(fontkit);

  const [regular, bold, boldItalic, signature] = await Promise.all([
    loadFirstAvailable(REGULAR_CANDIDATES),
    loadFirstAvailable(BOLD_CANDIDATES),
    loadFirstAvailable(BOLD_ITALIC_CANDIDATES),
    loadFirstAvailable(SIGNATURE_CANDIDATES, signatureFontDir, FORM_B_SIGNATURE_FONT_DIR),
  ]);

  return {
    regular: await pdf.embedFont(regular.bytes),
    bold: await pdf.embedFont(bold.bytes),
    boldItalic: await pdf.embedFont(boldItalic.bytes),
    signature: await pdf.embedFont(signature.bytes),
    family: regular.family,
    signatureFamily: signature.family,
  };
}

/** Sans-serif PDF fallback face matched to the district Form B template (Arial / Calibri / Aptos). */
export async function embedPackageFont(pdf: PDFDocument): Promise<PDFFont> {
  return (await embedPackageFonts(pdf)).regular;
}
