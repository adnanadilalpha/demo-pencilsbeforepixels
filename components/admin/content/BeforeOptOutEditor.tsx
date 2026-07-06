"use client";

import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { RichTextEditor } from "@/components/admin/content/RichTextEditor";
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

      <RichTextEditor
        label="Heading"
        value={value.reflectionTitle}
        compact
        onChange={(next) => onChange({ ...value, reflectionTitle: next })}
      />

      <ol className="flex flex-col gap-4">
        {questions.map((question, index) => (
          <li
            key={index}
            className="rounded-[12px] border border-navy-800/10 bg-paper-50 p-4"
          >
            <RichTextEditor
              label={`Question ${index + 1}`}
              value={question}
              onChange={(value) => updateQuestion(index, value)}
            />
          </li>
        ))}
      </ol>

      <RichTextEditor
        label="Conclusion"
        value={value.reflectionConclusion}
        onChange={(next) => onChange({ ...value, reflectionConclusion: next })}
      />

      <RichTextEditor
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
