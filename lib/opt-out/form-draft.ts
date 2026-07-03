import type { OptOutLetterForm } from "@/lib/opt-out/types";
import { createDefaultForm } from "@/lib/opt-out/types";

const STORAGE_KEY = "pbp:opt-out-form-draft";

type OptOutFormDraft = Pick<
  OptOutLetterForm,
  "studentName" | "parentName" | "address" | "homePhone" | "workPhone" | "schoolId"
>;

function isDraft(value: unknown): value is OptOutFormDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.studentName === "string" &&
    typeof draft.parentName === "string" &&
    typeof draft.address === "string" &&
    typeof draft.homePhone === "string" &&
    typeof draft.workPhone === "string" &&
    typeof draft.schoolId === "string"
  );
}

export function loadOptOutFormDraft(): OptOutFormDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveOptOutFormDraft(form: OptOutLetterForm) {
  if (typeof window === "undefined") return;

  const draft: OptOutFormDraft = {
    studentName: form.studentName.trim(),
    parentName: form.parentName.trim(),
    address: form.address.trim(),
    homePhone: form.homePhone.trim(),
    workPhone: form.workPhone.trim(),
    schoolId: form.schoolId,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore quota or private-mode errors.
  }
}

export function createFormWithDraft(): OptOutLetterForm {
  const draft = loadOptOutFormDraft();
  const defaults = createDefaultForm();

  if (!draft) return defaults;

  return {
    ...defaults,
    ...draft,
    signatureName: draft.parentName || defaults.signatureName,
  };
}
