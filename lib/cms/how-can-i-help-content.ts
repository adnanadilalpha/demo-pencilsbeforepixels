import { mergeSectionWithFallback } from "./section-fields";

export const HOW_CAN_I_HELP_ITEM_COUNT = 4;

/** Each card has a fixed personality that drives its icon, accent, and actions. */
export type HowCanIHelpKind = "share" | "speak" | "attend" | "opt_out";

export const HOW_CAN_I_HELP_KINDS: HowCanIHelpKind[] = [
  "share",
  "speak",
  "attend",
  "opt_out",
];

export const DEFAULT_SHARE_CARD_IMAGE =
  "/images/how-can-i-help/share-yard-sign.png";

export type HowCanIHelpItem = {
  kind: HowCanIHelpKind;
  eyebrow: string;
  body: string;
  highlights: string[];
  image?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type HowCanIHelpContent = {
  headline: string;
  intro: string;
  items: HowCanIHelpItem[];
};

export const DEFAULT_HOW_CAN_I_HELP: HowCanIHelpContent = {
  headline: "How Can I Help",
  intro:
    "Change in the classroom starts with parents who show up. Here are four ways to lend your voice — pick one and take the first step today.",
  items: [
    {
      kind: "share",
      eyebrow: "Spread the word",
      body: "The movement grows one conversation at a time. Share Pencils Before Pixels with a friend, a neighbor, or another parent who feels the same pull to protect focus over screens.",
      highlights: [],
      image: DEFAULT_SHARE_CARD_IMAGE,
      imageAlt: "Pencils Before Pixels yard sign",
      ctaHref: "https://pencilsbeforepixels.org",
    },
    {
      kind: "speak",
      eyebrow: "Use your 2.5 minutes",
      body: "Pencils Before Pixels has spoken at Westside School Board meetings since early 2026. Join us and share your \u201cscreens in school\u201d perspective. You get 2.5 minutes at the podium — we write our speeches, then read them aloud. There is power in numbers, and board members need to hear you.",
      highlights: [],
      ctaLabel: "View meeting dates",
      ctaHref:
        "https://www.westside66.org/our-district/board-of-education/board-of-education-meeting-dates",
    },
    {
      kind: "attend",
      eyebrow: "Save the date",
      body: "Come to a Pencils Before Pixels public presentation. Hear the research, meet other parents, and leave with practical next steps for your family.",
      highlights: ["September 10", "October 4"],
    },
    {
      kind: "opt_out",
      eyebrow: "Make it official",
      body: "Complete the \u201c1 to 1 Device Opt Out\u201d form and submit it to your school principal. It is the clearest way to put your decision on the record.",
      highlights: [],
      ctaLabel: "Open Opt Out Form",
      ctaHref: "#opt-out",
    },
  ],
};

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeHighlights(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];
  const cleaned = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 3);
  return cleaned;
}

function normalizeItem(
  value: unknown,
  fallback: HowCanIHelpItem,
): HowCanIHelpItem {
  const record = asRecord(value);

  const base: HowCanIHelpItem = {
    kind: fallback.kind,
    eyebrow: readString(record.eyebrow) || fallback.eyebrow,
    body: readString(record.body) || fallback.body,
    highlights: normalizeHighlights(record.highlights, fallback.highlights),
    ctaLabel: readString(record.ctaLabel) || fallback.ctaLabel || undefined,
    ctaHref: readString(record.ctaHref) || fallback.ctaHref || undefined,
  };

  if (fallback.kind === "share") {
    return {
      ...base,
      image:
        readString(record.image) ||
        fallback.image ||
        DEFAULT_SHARE_CARD_IMAGE,
      imageAlt:
        readString(record.imageAlt) ||
        fallback.imageAlt ||
        "Pencils Before Pixels yard sign",
    };
  }

  return base;
}

function normalizeItems(value: unknown): HowCanIHelpItem[] {
  const defaults = DEFAULT_HOW_CAN_I_HELP.items;
  const source = Array.isArray(value) ? value : [];

  return Array.from({ length: HOW_CAN_I_HELP_ITEM_COUNT }, (_, index) =>
    normalizeItem(source[index], defaults[index]),
  );
}

export function mergeHowCanIHelpSectionContent(
  stored: Record<string, unknown> | null | undefined,
): HowCanIHelpContent {
  const merged = mergeSectionWithFallback(
    "homepage.how_can_i_help",
    stored ?? undefined,
  );
  return normalizeHowCanIHelpContent(merged);
}

export function normalizeHowCanIHelpContent(value: unknown): HowCanIHelpContent {
  const record = asRecord(value);
  const headline = readString(record.headline);
  const intro = readString(record.intro);

  return {
    headline: headline || DEFAULT_HOW_CAN_I_HELP.headline,
    intro: intro || DEFAULT_HOW_CAN_I_HELP.intro,
    items: normalizeItems(record.items),
  };
}

export function sanitizeHowCanIHelpForPublish(
  content: Record<string, unknown>,
): Record<string, unknown> {
  const normalized = normalizeHowCanIHelpContent(content);

  return {
    ...content,
    headline: normalized.headline,
    intro: normalized.intro,
    items: normalized.items.map((item) => {
      const payload: Record<string, unknown> = {
        kind: item.kind,
        eyebrow: item.eyebrow,
        body: item.body,
        highlights: item.highlights,
      };

      if (item.kind === "share") {
        payload.image = item.image || DEFAULT_SHARE_CARD_IMAGE;
        payload.imageAlt = item.imageAlt || "Pencils Before Pixels yard sign";
        if (item.ctaHref) payload.ctaHref = item.ctaHref;
        return payload;
      }

      if (item.ctaLabel) payload.ctaLabel = item.ctaLabel;
      if (item.ctaHref) payload.ctaHref = item.ctaHref;
      return payload;
    }),
  };
}
