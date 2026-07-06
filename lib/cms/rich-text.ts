/** Apply to dark section wrappers so nested rich text links use gold/white styling. */
export const RICH_TEXT_LINKS_LIGHT_CLASS = "rich-text-links-light";

/** True when stored content includes HTML markup from the rich text editor. */
export function isRichTextHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value.trim());
}

/** Strip empty TipTap paragraphs so we persist plain strings when nothing is entered. */
export function normalizeRichTextOutput(html: string): string {
  const trimmed = html.trim();
  if (!trimmed || trimmed === "<p></p>" || trimmed === "<p><br></p>") {
    return "";
  }
  return html;
}

/** Unwrap a single TipTap paragraph for inline heading/quote rendering. */
export function unwrapRichTextParagraph(html: string): string {
  const trimmed = html.trim();
  const match = trimmed.match(/^<p(?:\s[^>]*)?>([\s\S]*?)<\/p>$/i);
  return match ? match[1] : trimmed;
}

/** Flatten rich text to plain strings for SEO meta and document exports. */
export function stripRichTextToPlain(value: string): string {
  if (!value.trim()) return "";
  if (!isRichTextHtml(value)) return value.trim();

  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>\s*<p[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitPlainTextParagraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
