"use client";

import {
  adminInputClass,
  adminLabelClass,
} from "@/components/admin/admin-styles";
import type { OptOutFormConfig, OptOutSchool } from "@/lib/opt-out/types";

type OptOutSettingsEditorProps = {
  schools: OptOutSchool[];
  config: OptOutFormConfig;
  onChange: (next: { schools: OptOutSchool[]; config: OptOutFormConfig }) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  error: string | null;
};

export function OptOutSettingsEditor({
  schools,
  config,
  onChange,
  onSave,
  saving,
  saved,
  error,
}: OptOutSettingsEditorProps) {
  const updateSchool = (index: number, patch: Partial<OptOutSchool>) => {
    onChange({
      schools: schools.map((school, schoolIndex) =>
        schoolIndex === index ? { ...school, ...patch } : school,
      ),
      config,
    });
  };

  const updateAnswer = (key: keyof OptOutFormConfig["defaultAnswers"], value: string) => {
    onChange({
      schools,
      config: {
        ...config,
        defaultAnswers: {
          ...config.defaultAnswers,
          [key]: value,
        },
      },
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-xl border border-navy-800/10 bg-white p-5">
        <h2 className="text-base font-semibold text-navy-800">Schools</h2>
        <p className="mt-1 text-sm text-body-muted">
          School selection populates the principal name and email on the cover page.
        </p>

        <div className="mt-4 flex flex-col gap-4">
          {schools.map((school, index) => (
            <div
              key={school.id}
              className="grid gap-3 rounded-lg border border-navy-800/8 bg-paper-50 p-4 md:grid-cols-3"
            >
              <Field
                label="School"
                value={school.schoolName}
                onChange={(value) => updateSchool(index, { schoolName: value })}
              />
              <Field
                label="Principal"
                value={school.principalName}
                onChange={(value) => updateSchool(index, { principalName: value })}
              />
              <Field
                label="Email"
                value={school.email}
                onChange={(value) => updateSchool(index, { email: value })}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-navy-800/10 bg-white p-5">
        <h2 className="text-base font-semibold text-navy-800">Form B default answers</h2>
        <p className="mt-1 text-sm text-body-muted">
          Default answers for questions 1–4 on the generated Form B page. Changes apply to new
          submissions immediately. Source: Form B Answers.docx.
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <AnswerField
            label="Question 1"
            value={config.defaultAnswers.q1}
            onChange={(value) => updateAnswer("q1", value)}
          />
          <AnswerField
            label="Question 2"
            value={config.defaultAnswers.q2}
            onChange={(value) => updateAnswer("q2", value)}
          />
          <AnswerField
            label="Question 3"
            value={config.defaultAnswers.q3}
            onChange={(value) => updateAnswer("q3", value)}
          />
          <AnswerField
            label="Question 4"
            value={config.defaultAnswers.q4}
            onChange={(value) => updateAnswer("q4", value)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-navy-800/10 bg-white p-5">
        <h2 className="text-base font-semibold text-navy-800">Package templates</h2>
        <p className="mt-1 text-sm text-body-muted">
          Form B is generated automatically to match the district layout. Only the cover page and
          essay use Word templates. Defaults live in{" "}
          <code className="text-xs">public/forms/</code> — change paths only if files are hosted
          elsewhere.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field
            label="Cover Page DOCX path"
            value={config.coverTemplatePath}
            onChange={(value) =>
              onChange({ schools, config: { ...config, coverTemplatePath: value } })
            }
          />
          <Field
            label="Form B Essay DOCX path"
            value={config.essayTemplatePath}
            onChange={(value) =>
              onChange({ schools, config: { ...config, essayTemplatePath: value } })
            }
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-full bg-navy-800 px-5 py-2.5 text-sm font-medium text-paper-50 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
        {saved ? <span className="text-sm text-green-700">Saved.</span> : null}
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
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

function AnswerField({
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
        className={`${adminInputClass} min-h-24 rounded-[10px] py-3`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
