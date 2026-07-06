"use client";

import type { OptOutStep } from "@/lib/cms/types";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { RichTextEditor } from "@/components/admin/content/RichTextEditor";

type OptOutStepsEditorProps = {
  steps: OptOutStep[];
  onChange: (steps: OptOutStep[]) => void;
};

export function OptOutStepsEditor({ steps, onChange }: OptOutStepsEditorProps) {
  const updateStep = (index: number, patch: Partial<OptOutStep>) => {
    onChange(
      steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, ...patch } : step,
      ),
    );
  };

  return (
    <div className="mt-6 space-y-3 border-t border-navy-800/6 pt-4">
      <p className="text-sm font-semibold text-navy-800">Opt-out steps</p>
      {steps.map((step, index) => (
        <div
          key={`${step.number}-${index}`}
          className="grid gap-3 rounded-[10px] border border-navy-800/10 bg-paper-50 p-4 sm:grid-cols-[80px_1fr]"
        >
          <Field
            label="Number"
            value={step.number}
            onChange={(value) => updateStep(index, { number: value })}
          />
          <RichTextEditor
            label="Title"
            value={step.title}
            compact
            onChange={(value) => updateStep(index, { title: value })}
          />
          <div className="sm:col-span-2">
            <RichTextEditor
              label="Description"
              value={step.description}
              onChange={(value) => updateStep(index, { description: value })}
            />
          </div>
        </div>
      ))}
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
        className={adminInputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
