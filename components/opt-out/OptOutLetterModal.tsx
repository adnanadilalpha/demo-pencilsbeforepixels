"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import {
  createOptOutSubmission,
  downloadOptOutDocx,
  downloadOptOutPdf,
  trackOptOutDownload,
} from "@/lib/opt-out/api";
import { packageFilename } from "@/lib/opt-out/filenames";
import {
  lockBodyScroll,
  modalInputClass,
  unlockBodyScroll,
} from "@/lib/modal/body-scroll-lock";
import { fetchOptOutSchools } from "@/lib/opt-out/schools-client";
import {
  createFormWithDraft,
  saveOptOutFormDraft,
} from "@/lib/opt-out/form-draft";
import type { OptOutLetterForm, OptOutSchool, OptOutSignatureMode } from "@/lib/opt-out/types";
import { FORM_B_SIGNATURE_FONT_CLASS, FORM_B_SIGNATURE_FONT_STACK } from "@/lib/opt-out/form-b-theme";
import { phoneValidationMessage, sanitizePhoneInput } from "@/lib/opt-out/format-phone";
import { ANALYTICS_EVENTS } from "@/lib/analytics/event-types";
import { trackAnalyticsEvent } from "@/lib/analytics/track-client";
import { SignaturePad } from "@/components/opt-out/SignaturePad";
import { cn } from "@/lib/utils";

const signatureFontStyle = { fontFamily: FORM_B_SIGNATURE_FONT_STACK } as const;

type FormFieldKey =
  | "date"
  | "studentName"
  | "parentName"
  | "address"
  | "homePhone"
  | "workPhone"
  | "signatureName"
  | "schoolId";

type FieldErrors = Partial<Record<FormFieldKey, string>>;

function validateForm(form: OptOutLetterForm): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.date.trim()) {
    errors.date = "Date is required.";
  }

  if (!form.studentName.trim()) {
    errors.studentName = "Student name is required.";
  }

  if (!form.parentName.trim()) {
    errors.parentName = "Parent/guardian name is required.";
  }

  if (!form.address.trim()) {
    errors.address = "Address is required.";
  }

  const homePhoneError = phoneValidationMessage(form.homePhone);
  if (homePhoneError) {
    errors.homePhone = homePhoneError;
  }

  const workPhoneError = phoneValidationMessage(form.workPhone);
  if (workPhoneError) {
    errors.workPhone = workPhoneError;
  }

  if (!form.schoolId) {
    errors.schoolId = "Please select a school.";
  }

  if (form.signatureMode === "name" && !form.signatureName.trim()) {
    errors.signatureName = "Please type your signature.";
  }

  return errors;
}

function inputClassName(hasError: boolean) {
  return cn(modalInputClass, "h-11", hasError && "border-red-500 focus:border-red-500");
}

type OptOutLetterModalProps = {
  open: boolean;
  onClose: () => void;
};

type Phase = "form" | "generating" | "complete";

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-navy-800/80">
        {label}
        {required ? " *" : ""}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function OptOutLetterModal({ open, onClose }: OptOutLetterModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const signatureCustomizedRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [schools, setSchools] = useState<OptOutSchool[]>([]);
  const [form, setForm] = useState<OptOutLetterForm>(createFormWithDraft);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    fetchOptOutSchools()
      .then((loadedSchools) => {
        setSchools(loadedSchools);
        setForm((current) => {
          if (!current.schoolId) return current;
          const school = loadedSchools.find((entry) => entry.id === current.schoolId);
          if (!school) {
            return {
              ...current,
              schoolId: "",
              schoolName: "",
              principalName: "",
              principalEmail: "",
            };
          }
          return {
            ...current,
            schoolName: school.schoolName,
            principalName: school.principalName,
            principalEmail: school.email,
          };
        });
      })
      .catch(() => setError("Failed to load schools. Please try again."));
  }, [open]);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      const timer = window.setTimeout(() => {
        setPhase("form");
        setForm(createFormWithDraft());
        setSubmissionId(null);
        setDownloadToken(null);
        setError("");
        setFieldErrors({});
        setDownloading(null);
      }, 200);
      return () => window.clearTimeout(timer);
    }

    setForm(createFormWithDraft());
    signatureCustomizedRef.current = false;
    setPhase("form");
    setError("");
    setFieldErrors({});
    setSubmissionId(null);

    const enterFrame = window.requestAnimationFrame(() => setVisible(true));

    lockBodyScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(enterFrame);
      unlockBodyScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  const updateField = <K extends keyof OptOutLetterForm>(
    key: K,
    value: OptOutLetterForm[K],
  ) => {
    setFieldErrors((current) => {
      const fieldKey = key as FormFieldKey;
      if (!current[fieldKey]) return current;
      const next = { ...current };
      delete next[fieldKey];
      return next;
    });

    setForm((current) => {
      const next = { ...current, [key]: value };

      if (
        key === "parentName" &&
        next.signatureMode === "name" &&
        !signatureCustomizedRef.current
      ) {
        next.signatureName = String(value);
      }

      if (key === "signatureName") {
        signatureCustomizedRef.current = true;
      }

      saveOptOutFormDraft(next);
      return next;
    });
  };

  const handleSchoolChange = (schoolId: string) => {
    setFieldErrors((current) => {
      if (!current.schoolId) return current;
      const next = { ...current };
      delete next.schoolId;
      return next;
    });

    const school = schools.find((entry) => entry.id === schoolId);
    if (!school) {
      setForm((current) => {
        const next = {
          ...current,
          schoolId: "",
          schoolName: "",
          principalName: "",
          principalEmail: "",
        };
        saveOptOutFormDraft(next);
        return next;
      });
      return;
    }

    setForm((current) => {
      const next = {
        ...current,
        schoolId: school.id,
        schoolName: school.schoolName,
        principalName: school.principalName,
        principalEmail: school.email,
      };
      saveOptOutFormDraft(next);
      return next;
    });
  };

  const handleSignatureModeChange = (mode: OptOutSignatureMode) => {
    if (mode === "name") {
      signatureCustomizedRef.current = false;
    }

    setForm((current) => ({
      ...current,
      signatureMode: mode,
      signatureName: mode === "name" ? current.parentName : current.signatureName,
      signatureImage: mode === "draw" ? current.signatureImage : "",
    }));
  };

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const errors = validateForm(form);
    if (form.signatureMode === "draw" && !form.signatureImage) {
      setError("Please draw your signature before generating the package.");
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the highlighted fields before continuing.");
      return;
    }

    setFieldErrors({});

    setPhase("generating");

    try {
      const { id, downloadToken: token } = await createOptOutSubmission(form);
      saveOptOutFormDraft(form);
      setSubmissionId(id);
      setDownloadToken(token);
      setPhase("complete");
      void trackAnalyticsEvent(ANALYTICS_EVENTS.OPT_OUT_SUBMIT);
    } catch (generateError) {
      setPhase("form");
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  const handlePdfDownload = async () => {
    if (!submissionId || !downloadToken) return;
    setDownloading("pdf");
    try {
      await downloadOptOutPdf(
        submissionId,
        packageFilename(form.studentName, "pdf"),
        downloadToken,
      );
      await trackOptOutDownload(submissionId, "pdf", downloadToken);
    } catch {
      setError("PDF download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  const handleDocxDownload = async () => {
    if (!submissionId || !downloadToken) return;
    setDownloading("docx");
    try {
      await downloadOptOutDocx(
        submissionId,
        packageFilename(form.studentName, "docx"),
        downloadToken,
      );
      await trackOptOutDownload(submissionId, "docx", downloadToken);
    } catch {
      setError("DOCX download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "absolute inset-0 bg-navy-800/40 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        data-lenis-prevent
        className={cn(
          "relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-navy-800/15 bg-paper-50 shadow-lg outline-none transition-all duration-200",
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-navy-800/50 transition-colors hover:text-navy-800"
          aria-label="Close"
        >
          <span className="text-xl leading-none">×</span>
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8" data-lenis-prevent>
          <div className="mb-6 pr-6">
            <h2 id={titleId} className="text-lg font-semibold text-navy-800">
              {phase === "complete" ? "Download your Form B package" : "1:1 iPad opt-out form"}
            </h2>
            {phase === "complete" ? (
              <p id={descId} className="mt-1.5 text-sm text-navy-800/70">
                Your download includes a cover sheet, Form B, and the research appendix — in that order.
              </p>
            ) : (
              <p id={descId} className="mt-1.5 text-sm text-navy-800/70">
                Complete all Form B fields below. Standard answers for questions 1–4 are included automatically. Sign Form B by typing your name or drawing your signature.
              </p>
            )}
          </div>

          {phase === "complete" ? (
            <div className="flex flex-col gap-5">
              <div className="rounded-md border border-navy-800/10 bg-white p-4 text-sm text-navy-800/80">
                <p>
                  <span className="font-medium text-navy-800">Student:</span>{" "}
                  {form.studentName}
                </p>
                <p className="mt-2">
                  <span className="font-medium text-navy-800">Parent:</span>{" "}
                  {form.parentName}
                </p>
                <p className="mt-2">
                  <span className="font-medium text-navy-800">Address:</span>{" "}
                  {form.address}
                </p>
                {form.homePhone || form.workPhone ? (
                  <p className="mt-2">
                    <span className="font-medium text-navy-800">Phone:</span>{" "}
                    {[form.homePhone, form.workPhone].filter(Boolean).join(" / ")}
                  </p>
                ) : null}
                <p className="mt-2">
                  <span className="font-medium text-navy-800">Signature:</span>{" "}
                  {form.signatureMode === "draw" ? (
                    "Drawn signature"
                  ) : (
                    <span
                      className={cn(FORM_B_SIGNATURE_FONT_CLASS, "text-xl text-navy-800")}
                      style={signatureFontStyle}
                    >
                      {form.signatureName || form.parentName}
                    </span>
                  )}
                </p>
                <p className="mt-2">
                  <span className="font-medium text-navy-800">School:</span>{" "}
                  {form.schoolName}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="flex-1"
                  onClick={handlePdfDownload}
                  disabled={downloading !== null}
                >
                  {downloading === "pdf" ? "Downloading…" : "Download PDF"}
                </Button>
                <Button
                  variant="outlineDark"
                  className="flex-1"
                  onClick={handleDocxDownload}
                  disabled={downloading !== null}
                >
                  {downloading === "docx" ? "Downloading…" : "Download DOCX"}
                </Button>
              </div>

              {error ? (
                <p className="text-sm text-red-700" role="alert">
                  {error}
                </p>
              ) : null}

              <Button variant="light" className="w-full" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="flex flex-col gap-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="opt-out-date" label="Date" required error={fieldErrors.date}>
                  <input
                    id="opt-out-date"
                    type="text"
                    value={form.date}
                    onChange={(e) => updateField("date", e.target.value)}
                    aria-invalid={Boolean(fieldErrors.date)}
                    aria-describedby={fieldErrors.date ? "opt-out-date-error" : undefined}
                    className={inputClassName(Boolean(fieldErrors.date))}
                  />
                </Field>

                <Field
                  id="opt-out-student"
                  label="Student name"
                  required
                  error={fieldErrors.studentName}
                >
                  <input
                    id="opt-out-student"
                    name="studentName"
                    type="text"
                    value={form.studentName}
                    onChange={(e) => updateField("studentName", e.target.value)}
                    placeholder="e.g. Emma Johnson"
                    autoComplete="off"
                    aria-invalid={Boolean(fieldErrors.studentName)}
                    aria-describedby={
                      fieldErrors.studentName ? "opt-out-student-error" : undefined
                    }
                    className={inputClassName(Boolean(fieldErrors.studentName))}
                  />
                </Field>
              </div>

              <Field
                id="opt-out-parent"
                label="Parent/guardian name"
                required
                error={fieldErrors.parentName}
              >
                <input
                  id="opt-out-parent"
                  name="parentName"
                  type="text"
                  value={form.parentName}
                  onChange={(e) => updateField("parentName", e.target.value)}
                  placeholder="e.g. Sarah Johnson"
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.parentName)}
                  aria-describedby={fieldErrors.parentName ? "opt-out-parent-error" : undefined}
                  className={inputClassName(Boolean(fieldErrors.parentName))}
                />
              </Field>

              <Field id="opt-out-address" label="Address" required error={fieldErrors.address}>
                <input
                  id="opt-out-address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="e.g. 123 Main St, Omaha, NE 68124"
                  className={inputClassName(Boolean(fieldErrors.address))}
                  autoComplete="street-address"
                  aria-invalid={Boolean(fieldErrors.address)}
                  aria-describedby={fieldErrors.address ? "opt-out-address-error" : undefined}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="opt-out-home-phone" label="Home phone" error={fieldErrors.homePhone}>
                  <input
                    id="opt-out-home-phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="(402) 555-0100"
                    value={form.homePhone}
                    onChange={(e) =>
                      updateField("homePhone", sanitizePhoneInput(e.target.value))
                    }
                    className={inputClassName(Boolean(fieldErrors.homePhone))}
                    autoComplete="tel"
                    aria-invalid={Boolean(fieldErrors.homePhone)}
                    aria-describedby={
                      fieldErrors.homePhone ? "opt-out-home-phone-error" : undefined
                    }
                  />
                </Field>

                <Field id="opt-out-work-phone" label="Work phone" error={fieldErrors.workPhone}>
                  <input
                    id="opt-out-work-phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="(402) 555-0199"
                    value={form.workPhone}
                    onChange={(e) =>
                      updateField("workPhone", sanitizePhoneInput(e.target.value))
                    }
                    className={inputClassName(Boolean(fieldErrors.workPhone))}
                    aria-invalid={Boolean(fieldErrors.workPhone)}
                    aria-describedby={
                      fieldErrors.workPhone ? "opt-out-work-phone-error" : undefined
                    }
                  />
                </Field>
              </div>

              <Field id="opt-out-signature" label="Signature" required error={fieldErrors.signatureName}>
                <div className="flex flex-col gap-3">
                  <div className="inline-flex rounded-md border border-navy-800/15 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => handleSignatureModeChange("name")}
                      className={cn(
                        "flex-1 rounded px-3 py-2 text-sm transition-colors",
                        form.signatureMode === "name"
                          ? "bg-navy-800 text-white"
                          : "text-navy-800/70 hover:text-navy-800",
                      )}
                    >
                      Type name
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSignatureModeChange("draw")}
                      className={cn(
                        "flex-1 rounded px-3 py-2 text-sm transition-colors",
                        form.signatureMode === "draw"
                          ? "bg-navy-800 text-white"
                          : "text-navy-800/70 hover:text-navy-800",
                      )}
                    >
                      Draw signature
                    </button>
                  </div>

                  {form.signatureMode === "name" ? (
                    <input
                      id="opt-out-signature"
                      type="text"
                      value={form.signatureName}
                      onChange={(e) => updateField("signatureName", e.target.value)}
                      className={cn(
                        inputClassName(Boolean(fieldErrors.signatureName)),
                        FORM_B_SIGNATURE_FONT_CLASS,
                        "text-xl",
                      )}
                      style={signatureFontStyle}
                      placeholder="Type your full name"
                      aria-invalid={Boolean(fieldErrors.signatureName)}
                      aria-describedby={
                        fieldErrors.signatureName ? "opt-out-signature-error" : undefined
                      }
                    />
                  ) : (
                    <SignaturePad
                      id="opt-out-signature"
                      value={form.signatureImage}
                      onChange={(signatureImage) => updateField("signatureImage", signatureImage)}
                    />
                  )}
                </div>
              </Field>

              <Field id="opt-out-school" label="School" required error={fieldErrors.schoolId}>
                <select
                  id="opt-out-school"
                  value={form.schoolId}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  className={inputClassName(Boolean(fieldErrors.schoolId))}
                  aria-invalid={Boolean(fieldErrors.schoolId)}
                  aria-describedby={fieldErrors.schoolId ? "opt-out-school-error" : undefined}
                >
                  <option value="">Select a school</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.schoolName}
                    </option>
                  ))}
                </select>
              </Field>

              {error ? (
                <p className="text-sm text-red-700" role="alert">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={phase === "generating"}>
                {phase === "generating" ? "Generating…" : "Generate Form B package"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
