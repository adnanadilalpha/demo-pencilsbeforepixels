"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { OptOutLetterPreview } from "@/components/opt-out/OptOutLetterPreview";
import {
  createOptOutSubmission,
  downloadOptOutDocx,
  trackOptOutDownload,
} from "@/lib/opt-out/api";
import {
  buildOptOutPdf,
  downloadBlob,
  pdfFilename,
} from "@/lib/opt-out/build-pdf";
import { docxFilename } from "@/lib/opt-out/build-docx";
import {
  lockBodyScroll,
  modalInputClass,
  unlockBodyScroll,
} from "@/lib/modal/body-scroll-lock";
import { createDefaultForm } from "@/lib/opt-out/types";
import type { OptOutLetterForm } from "@/lib/opt-out/types";
import { cn } from "@/lib/utils";

type OptOutLetterModalProps = {
  open: boolean;
  onClose: () => void;
};

type Phase = "form" | "generating" | "complete";

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-navy-800/80">
        {label}
        {required ? " *" : ""}
      </label>
      {children}
    </div>
  );
}

export function OptOutLetterModal({ open, onClose }: OptOutLetterModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [form, setForm] = useState<OptOutLetterForm>(createDefaultForm);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      const timer = window.setTimeout(() => {
        setPhase("form");
        setForm(createDefaultForm());
        setSubmissionId(null);
        setDownloadToken(null);
        setError("");
        setDownloading(null);
      }, 200);
      return () => window.clearTimeout(timer);
    }

    setForm(createDefaultForm());
    setPhase("form");
    setError("");
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
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setPhase("generating");

    const letter: OptOutLetterForm = {
      ...form,
      childName: form.childName.trim() || form.studentName.trim(),
    };

    try {
      const { id, downloadToken: token } = await createOptOutSubmission(letter);
      setSubmissionId(id);
      setDownloadToken(token);
      setForm(letter);
      setPhase("complete");
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
      const blob = buildOptOutPdf(form);
      downloadBlob(blob, pdfFilename(form.studentName));
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
      await downloadOptOutDocx(submissionId, docxFilename(form.studentName), downloadToken);
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
              {phase === "complete" ? "Download your letter" : "Device opt-out letter"}
            </h2>
            {phase === "complete" ? (
              <p id={descId} className="mt-1.5 text-sm text-navy-800/70">
                Print, sign, and deliver to your school.
              </p>
            ) : (
              <p id={descId} className="sr-only">
                Fill in the form to generate an opt-out letter.
              </p>
            )}
          </div>

          {phase === "complete" ? (
            <div className="flex flex-col gap-5">
              <OptOutLetterPreview form={form} />

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="flex-1"
                  onClick={handlePdfDownload}
                  disabled={downloading !== null}
                >
                  {downloading === "pdf" ? "Preparing…" : "Download PDF"}
                </Button>
                <Button
                  variant="outlineDark"
                  className="flex-1"
                  onClick={handleDocxDownload}
                  disabled={downloading !== null}
                >
                  {downloading === "docx" ? "Preparing…" : "Download DOCX"}
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
            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="opt-out-date" label="Date" required>
                  <input
                    id="opt-out-date"
                    type="text"
                    required
                    value={form.date}
                    onChange={(e) => updateField("date", e.target.value)}
                    className={cn(modalInputClass, "h-11")}
                  />
                </Field>

                <Field id="opt-out-student" label="Student name" required>
                  <input
                    id="opt-out-student"
                    type="text"
                    required
                    value={form.studentName}
                    onChange={(e) => updateField("studentName", e.target.value)}
                    className={cn(modalInputClass, "h-11")}
                  />
                </Field>
              </div>

              <Field id="opt-out-recipient" label="Recipient" required>
                <input
                  id="opt-out-recipient"
                  type="text"
                  required
                  value={form.recipientName}
                  onChange={(e) => updateField("recipientName", e.target.value)}
                  placeholder="Principal or administrator"
                  className={cn(modalInputClass, "h-11")}
                />
              </Field>

              <Field id="opt-out-child" label="Child's name in letter">
                <input
                  id="opt-out-child"
                  type="text"
                  value={form.childName}
                  onChange={(e) => updateField("childName", e.target.value)}
                  placeholder="Same as student name if blank"
                  className={cn(modalInputClass, "h-11")}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="opt-out-school" label="School">
                  <input
                    id="opt-out-school"
                    type="text"
                    value={form.school}
                    onChange={(e) => updateField("school", e.target.value)}
                    className={cn(modalInputClass, "h-11")}
                  />
                </Field>

                <Field id="opt-out-district" label="District">
                  <input
                    id="opt-out-district"
                    type="text"
                    value={form.district}
                    onChange={(e) => updateField("district", e.target.value)}
                    className={cn(modalInputClass, "h-11")}
                  />
                </Field>
              </div>

              <Field id="opt-out-test" label="State assessment" required>
                <input
                  id="opt-out-test"
                  type="text"
                  required
                  value={form.stateTestName}
                  onChange={(e) => updateField("stateTestName", e.target.value)}
                  className={cn(modalInputClass, "h-11")}
                />
              </Field>

              <Field id="opt-out-parent" label="Your name" required>
                <input
                  id="opt-out-parent"
                  type="text"
                  required
                  value={form.parentName}
                  onChange={(e) => updateField("parentName", e.target.value)}
                  className={cn(modalInputClass, "h-11")}
                />
              </Field>

              {error ? (
                <p className="text-sm text-red-700" role="alert">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={phase === "generating"}>
                {phase === "generating" ? "Generating…" : "Generate letter"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
