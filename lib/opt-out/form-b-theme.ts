/** Shared Form B visual tokens (from `6320R-FORM_B2024.docx` + letter.png). */
export const FORM_B_BODY_FONT = "Arial";
export const FORM_B_SIGNATURE_FONT = "Agustina Signature";
export const FORM_B_SIGNATURE_FONT_FILE = "Agustina-Signature.otf";
/** Typed name signature in generated DOCX (embedded TTF). */
export const FORM_B_DOCX_SIGNATURE_FONT = "Momo Signature";
export const FORM_B_DOCX_SIGNATURE_FONT_FILE = "MomoSignature-Regular.ttf";
/** Served from `public/fonts` — same file used for modal, PDF, and DOCX. */
export const FORM_B_SIGNATURE_FONT_DIR = "public/fonts";
export const FORM_B_SIGNATURE_FONT_URL = `/fonts/${FORM_B_SIGNATURE_FONT_FILE}`;
export const FORM_B_FOOTER_FONT = "Times New Roman";
export const FORM_B_BODY_COLOR = "494949";
export const FORM_B_FOOTER_COLOR = "000000";
export const FORM_B_BODY_COLOR_RGB = { r: 73 / 255, g: 73 / 255, b: 73 / 255 };

/** District template body size: 12pt (w:sz=24). */
export const FORM_B_TEMPLATE_BODY_PT = 12;

/** Typed signature size — script faces read smaller at the same point size as body text. */
export function formBSignatureSizePt(bodySize: number) {
  return bodySize + 8;
}

/** CSS class for typed signature preview/input (see globals.css @font-face). */
export const FORM_B_SIGNATURE_FONT_CLASS = "font-agustina-signature";

/** Inline stack for signature fields — avoids stale next/font class caches. */
export const FORM_B_SIGNATURE_FONT_STACK = `"${FORM_B_SIGNATURE_FONT}", cursive`;
