"use client";

import type { OptOutLetterForm } from "@/lib/opt-out/types";
import { OPT_OUT_SUBJECT, buildLetterParagraphs } from "@/lib/opt-out/letter";
import { cn } from "@/lib/utils";

type OptOutLetterPreviewProps = {
  form: OptOutLetterForm;
  className?: string;
  compact?: boolean;
};

export function OptOutLetterPreview({
  form,
  className,
  compact = false,
}: OptOutLetterPreviewProps) {
  const student = form.studentName.trim() || "________________";
  const paragraphs = buildLetterParagraphs(form);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-navy-800/15 bg-white",
        className,
      )}
    >
      <div
        className={cn(
          "font-serif text-[13px] leading-[1.65] text-navy-800/90",
          compact ? "max-h-[280px] overflow-y-auto p-4" : "p-5 sm:p-6",
        )}
        data-lenis-prevent
      >
        <p className="mb-4">{form.date.trim() || "________________"}</p>
        <p className="mb-1 font-semibold">Student Name: {student}</p>
        <p className="mb-6 font-semibold">Subject: {OPT_OUT_SUBJECT}</p>

        <div className="flex flex-col gap-3">
          {paragraphs.map((line, index) =>
            line === "" ? (
              <span key={index} className="block h-2" aria-hidden />
            ) : (
              <p
                key={index}
                className={cn(
                  line.startsWith("To be clear") ||
                    line.startsWith("Please provide written") ||
                    line === "Sincerely,"
                    ? "font-semibold"
                    : "",
                )}
              >
                {line}
              </p>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
