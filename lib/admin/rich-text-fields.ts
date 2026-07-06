import type { ContentField } from "@/lib/admin/content-config";

/** Keys that should stay plain single-line inputs (URLs, UI chrome, chart axes, etc.). */
const PLAIN_TEXT_KEYS = new Set([
  "backgroundAlt",
  "primaryCta",
  "newsletterLabel",
  "newsletterPlaceholder",
  "newsletterCta",
  "socialLinksLabel",
]);

function isPlainTextKey(key: string): boolean {
  if (PLAIN_TEXT_KEYS.has(key)) return true;
  if (key.endsWith("Url") || key.endsWith(".href")) return true;
  if (key.includes("xLabel") || key.includes("yLabel")) return true;
  if (key.includes(".slope")) return true;
  if (key.endsWith(".label") && key.includes("nationalSlopes")) return true;
  if (key.endsWith(".label") && key.includes("slopes.")) return true;
  return false;
}

/** Display copy shown on the public site — headlines, titles, eyebrows, etc. */
export function isRichTextDisplayField(field: ContentField): boolean {
  if (field.type === "richText" || field.type === "textarea") return true;
  if (field.type !== "text") return false;
  return !isPlainTextKey(field.key);
}

export function isCompactRichTextField(field: ContentField): boolean {
  if (field.type !== "text" && field.type !== "richText") return false;

  const key = field.key.toLowerCase();
  return (
    key.includes("headline") ||
    key.includes("eyebrow") ||
    key.includes("tagline") ||
    key.endsWith(".title") ||
    key.endsWith(".heading") ||
    key === "title" ||
    key.includes("reflectiontitle") ||
    key.includes("audiotitle")
  );
}
