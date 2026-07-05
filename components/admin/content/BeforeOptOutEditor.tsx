"use client";

import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import {
  BEFORE_OPT_OUT_QUESTION_COUNT,
  type BeforeOptOutContent,
} from "@/lib/cms/before-opt-out-content";
import { cn } from "@/lib/utils";

type BeforeOptOutEditorProps = {
  value: BeforeOptOutContent;
  onChange: (value: BeforeOptOutContent) => void;
};

export function BeforeOptOutEditor({
  value,
  onChange,
}: BeforeOptOutEditorProps) {
  const questions = Array.from(
    { length: BEFORE_OPT_OUT_QUESTION_COUNT },
    (_, index) => value.reflectionQuestions[index] ?? "",
  );

  const updateQuestion = (index: number, next: string) => {
    onChange({
      ...value,
      reflectionQuestions: questions.map((question, questionIndex) =>
        questionIndex === index ? next : question,
      ),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className={adminLabelClass}>Large-text questions section</label>
        <p className="mt-1 text-sm text-body-muted">
          Appears immediately above the Device Opt Out section on the homepage.
        </p>
      </div>

      <Field
        label="Heading"
        value={value.reflectionTitle}
        onChange={(next) => onChange({ ...value, reflectionTitle: next })}
      />

      <ol className="flex flex-col gap-4">
        {questions.map((question, index) => (
          <li
            key={index}
            className="rounded-[12px] border border-navy-800/10 bg-paper-50 p-4"
          >
            <label
              htmlFor={`before-opt-out-question-${index}`}
              className="mb-2 block text-sm font-semibold text-navy-800"
            >
              Question {index + 1}
            </label>
            <textarea
              id={`before-opt-out-question-${index}`}
              rows={3}
              value={question}
              onChange={(event) => updateQuestion(index, event.target.value)}
              className={cn(
                adminInputClass,
                "min-h-24 resize-y rounded-[10px] px-3 py-2.5",
              )}
            />
          </li>
        ))}
      </ol>

      <TextAreaField
        label="Conclusion"
        value={value.reflectionConclusion}
        onChange={(next) => onChange({ ...value, reflectionConclusion: next })}
      />

      <TextAreaField
        label="Call to action"
        value={value.reflectionCallToAction}
        onChange={(next) => onChange({ ...value, reflectionCallToAction: next })}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={adminLabelClass}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(adminInputClass, "h-11 rounded-[10px] px-3")}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={adminLabelClass}>{label}</label>
      <textarea
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          adminInputClass,
          "min-h-24 resize-y rounded-[10px] px-3 py-2.5",
        )}
      />
    </div>
  );
}
