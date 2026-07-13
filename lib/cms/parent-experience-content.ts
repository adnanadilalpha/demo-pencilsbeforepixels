import { mergeSectionWithFallback } from "./section-fields";

export const DEFAULT_PARENT_EXPERIENCE_IMAGE =
  "/images/parent-experience/jpb.png";

export const PARENT_EXPERIENCE_MOMENT_COUNT = 3;

export type ParentExperienceMoment = {
  number: string;
  title: string;
  body: string;
};

export type ParentExperienceContent = {
  headline: string;
  lead: string;
  moments: ParentExperienceMoment[];
  closing: string;
  authorName: string;
  authorRole: string;
  image: string;
  imageAlt: string;
};

/** Exact letter copy from Paul's "Parent Letter about their experience" doc. */
export const DEFAULT_PARENT_EXPERIENCE: ParentExperienceContent = {
  headline: "A Parent's Experience",
  lead: "My daughter recently completed 6th grade. For a majority of the school year, she was the only student out of approximately 750 middle schoolers without a school-issued device. (Two other students opted out three quarters through the school year!) My daughter completed in-class assignments on paper and homework in workbooks while her classmates were distracted by the internet and harmed by EdTech. Some of her classmates were jealous when she used poster board and Legos for presentations while they used PowerPoint.\n\nThe opt out was not perfect. My daughter shared a device with a partner in order to take part in gamified EdTech quiz programs, such as Blooket and Kahoot, as well as in science class because the curriculum, Amplify, is 100% digital.\n\nBut based on my daughter’s reports of her classes, something interesting happened as the school year progressed. The use of technology decreased around her, not only as instructed by her teachers, but through student choice as well.",
  moments: [
    {
      number: "01",
      title: "",
      body: "First, during the last month or two of the school year, teachers communicated that students would complete presentations on poster board instead of PowerPoint. This included science, history, and math classes - reading and writing classes were already mostly analog throughout the year. In one class, students groaned when they found out they were to use poster board. But when the teacher changed his mind a week later and offered PowerPoint as an option, a majority of students still chose poster board. The teacher had to improvise and find additional supplies because he didn’t have enough poster board for all of the students!",
    },
    {
      number: "02",
      title: "",
      body: "Second, as the year went on, my daughter’s history teacher began to offer paper copies for research rather than only having students review preselected articles online through the school portal. Early in the school year, the teacher provided paper copies mainly for my daughter. When the teacher started to offer students a choice between paper or online, more and more students gravitated toward the paper copies. Sometimes the teacher did not have enough copies and students had to share!",
    },
    {
      number: "03",
      title: "",
      body: "And last but not least, near the end of the school year the school’s administration asked families how they felt about devices through an online survey. The survey was mainly geared toward receiving feedback about family engagement and communication, but a small portion included questions about screentime during class and lunch as well as student use of school-issued devices at home, indicating that school leadership might be listening.",
    },
  ],
  closing: "Things are changing!",
  authorName: "JPB",
  authorRole: "",
  image: DEFAULT_PARENT_EXPERIENCE_IMAGE,
  imageAlt: "JPB",
};

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeMoment(
  value: unknown,
  fallback: ParentExperienceMoment,
): ParentExperienceMoment {
  const record = asRecord(value);
  const hasStoredBody = typeof record.body === "string";
  const hasStoredTitle = typeof record.title === "string";

  return {
    number: readString(record.number) || fallback.number,
    // Allow intentional empty titles; only fall back when the field is missing.
    title: hasStoredTitle ? readString(record.title) : fallback.title,
    body: hasStoredBody
      ? readString(record.body) || fallback.body
      : fallback.body,
  };
}

function normalizeMoments(value: unknown): ParentExperienceMoment[] {
  const defaults = DEFAULT_PARENT_EXPERIENCE.moments;
  const source = Array.isArray(value) ? value : [];

  return Array.from({ length: PARENT_EXPERIENCE_MOMENT_COUNT }, (_, index) =>
    normalizeMoment(source[index], defaults[index]),
  );
}

export function normalizeParentExperienceContent(
  value: unknown,
): ParentExperienceContent {
  const record = asRecord(value);
  const legacyBody = readString(record.body);
  const lead =
    readString(record.lead) ||
    legacyBody ||
    DEFAULT_PARENT_EXPERIENCE.lead;

  return {
    headline: readString(record.headline) || DEFAULT_PARENT_EXPERIENCE.headline,
    lead,
    moments: normalizeMoments(record.moments),
    closing: readString(record.closing) || DEFAULT_PARENT_EXPERIENCE.closing,
    authorName:
      readString(record.authorName) || DEFAULT_PARENT_EXPERIENCE.authorName,
    authorRole:
      typeof record.authorRole === "string"
        ? record.authorRole.trim()
        : DEFAULT_PARENT_EXPERIENCE.authorRole,
    image:
      readString(record.image) ||
      DEFAULT_PARENT_EXPERIENCE.image ||
      DEFAULT_PARENT_EXPERIENCE_IMAGE,
    imageAlt:
      readString(record.imageAlt) || DEFAULT_PARENT_EXPERIENCE.imageAlt,
  };
}

export function mergeParentExperienceSectionContent(
  stored: Record<string, unknown> | null | undefined,
): ParentExperienceContent {
  const merged = mergeSectionWithFallback(
    "homepage.parent_experience",
    stored ?? undefined,
  );
  return normalizeParentExperienceContent(merged);
}

export function sanitizeParentExperienceForPublish(
  content: Record<string, unknown>,
): Record<string, unknown> {
  const normalized = normalizeParentExperienceContent(content);
  const next = { ...content };
  delete next.body;

  return {
    ...next,
    headline: normalized.headline,
    lead: normalized.lead,
    moments: normalized.moments,
    closing: normalized.closing,
    authorName: normalized.authorName,
    authorRole: normalized.authorRole,
    image: normalized.image,
    imageAlt: normalized.imageAlt,
  };
}
