export const BEFORE_OPT_OUT_QUESTION_COUNT = 3;

export type BeforeOptOutContent = {
  reflectionTitle: string;
  reflectionQuestions: string[];
  reflectionConclusion: string;
  reflectionCallToAction: string;
};

export const DEFAULT_BEFORE_OPT_OUT: BeforeOptOutContent = {
  reflectionTitle: "Before You Decide, Ask Yourself:",
  reflectionQuestions: [
    "Do you believe your child will be smarter with more screen time?",
    "Do you believe your child will develop stronger social skills with more screen time?",
    "Do you believe your child will be physically and mentally healthier with more screen time?",
  ],
  reflectionConclusion:
    "If the answer to all three is no — then less screen time, not more, is the direction worth choosing.",
  reflectionCallToAction:
    "You have the right to make that choice for your child. The form below lets you do it.",
};

/** @deprecated Use BeforeOptOutContent */
export type OptOutReflectionContent = BeforeOptOutContent;

/** @deprecated Use DEFAULT_BEFORE_OPT_OUT */
export const DEFAULT_OPT_OUT_REFLECTION = DEFAULT_BEFORE_OPT_OUT;

/** @deprecated Use BEFORE_OPT_OUT_QUESTION_COUNT */
export const OPT_OUT_REFLECTION_QUESTION_COUNT = BEFORE_OPT_OUT_QUESTION_COUNT;

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function hasReflectionFields(record: Record<string, unknown>): boolean {
  return (
    readString(record.reflectionTitle).length > 0 ||
    (Array.isArray(record.reflectionQuestions) &&
      record.reflectionQuestions.some(
        (item) => typeof item === "string" && item.trim().length > 0,
      )) ||
    readString(record.reflectionConclusion).length > 0 ||
    readString(record.reflectionCallToAction).length > 0
  );
}

function normalizeQuestions(value: unknown): string[] {
  const defaults = DEFAULT_BEFORE_OPT_OUT.reflectionQuestions;
  const source = Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : [];

  if (source.length === 0) {
    return [...defaults];
  }

  const padded = source.slice(0, BEFORE_OPT_OUT_QUESTION_COUNT);
  while (padded.length < BEFORE_OPT_OUT_QUESTION_COUNT) {
    padded.push(defaults[padded.length] ?? "");
  }

  return padded;
}

export function normalizeBeforeOptOutContent(
  value: unknown,
  legacy?: unknown,
): BeforeOptOutContent {
  const record = asRecord(value);
  const legacyRecord = asRecord(legacy);
  const source = hasReflectionFields(record) ? record : legacyRecord;

  const title = readString(source.reflectionTitle);
  const conclusion = readString(source.reflectionConclusion);
  const callToAction = readString(source.reflectionCallToAction);

  return {
    reflectionTitle: title || DEFAULT_BEFORE_OPT_OUT.reflectionTitle,
    reflectionQuestions: normalizeQuestions(source.reflectionQuestions),
    reflectionConclusion:
      conclusion || DEFAULT_BEFORE_OPT_OUT.reflectionConclusion,
    reflectionCallToAction:
      callToAction || DEFAULT_BEFORE_OPT_OUT.reflectionCallToAction,
  };
}

/** @deprecated Use normalizeBeforeOptOutContent */
export const normalizeOptOutReflectionContent = normalizeBeforeOptOutContent;

export function sanitizeBeforeOptOutForPublish(
  content: Record<string, unknown>,
): Record<string, unknown> {
  const reflection = normalizeBeforeOptOutContent(content);

  return {
    ...content,
    reflectionTitle: reflection.reflectionTitle,
    reflectionQuestions: reflection.reflectionQuestions.filter(Boolean),
    reflectionConclusion: reflection.reflectionConclusion,
    reflectionCallToAction: reflection.reflectionCallToAction,
  };
}

/** @deprecated Use sanitizeBeforeOptOutForPublish */
export const sanitizeOptOutReflectionForPublish = sanitizeBeforeOptOutForPublish;

export function mergeBeforeOptOutSectionContent(
  value: unknown,
  legacy?: unknown,
): Record<string, unknown> {
  const record = asRecord(value);
  const reflection = normalizeBeforeOptOutContent(record, legacy);

  return {
    ...record,
    ...reflection,
  };
}

/** @deprecated Use mergeBeforeOptOutSectionContent */
export const mergeOptOutSectionContent = mergeBeforeOptOutSectionContent;

export function stripBeforeOptOutFieldsFromRecord(
  content: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...content };
  delete next.reflectionTitle;
  delete next.reflectionQuestions;
  delete next.reflectionConclusion;
  delete next.reflectionCallToAction;
  return next;
}
