"use client";

import type { ExpertQuote } from "@/lib/cms/types";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { MediaField } from "@/components/admin/content/MediaField";
import { RichTextEditor } from "@/components/admin/content/RichTextEditor";

type ExpertQuotesEditorProps = {
  quotes: ExpertQuote[];
  onChange: (quotes: ExpertQuote[]) => void;
};

export function ExpertQuotesEditor({
  quotes,
  onChange,
}: ExpertQuotesEditorProps) {
  const updateQuote = (index: number, patch: Partial<ExpertQuote>) => {
    onChange(
      quotes.map((quote, quoteIndex) =>
        quoteIndex === index ? { ...quote, ...patch } : quote,
      ),
    );
  };

  return (
    <div className="mt-6 space-y-4 border-t border-navy-800/6 pt-4">
      <p className="text-sm font-semibold text-navy-800">Expert quotes</p>
      {quotes.map((quote, index) => (
        <div
          key={`${quote.number}-${index}`}
          className="rounded-[10px] border border-navy-800/10 bg-paper-50 p-4"
        >
          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
            <div className="flex min-w-0 flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Number"
                  value={quote.number}
                  onChange={(value) => updateQuote(index, { number: value })}
                />
                <Field
                  label="Name"
                  value={quote.name}
                  onChange={(value) => updateQuote(index, { name: value })}
                />
              </div>
              <RichTextEditor
                label="Title"
                value={quote.title}
                compact
                onChange={(value) => updateQuote(index, { title: value })}
              />
              <RichTextEditor
                label="Quote"
                value={quote.quote}
                onChange={(value) => updateQuote(index, { quote: value })}
              />
            </div>

            <div className="min-w-0 lg:sticky lg:top-0">
              <MediaField
                label="Photo"
                value={quote.image}
                folder="experts"
                filename={`${quote.number || `expert-${index + 1}`}.jpg`}
                altText={quote.name}
                onChange={(url) => updateQuote(index, { image: url })}
              />
            </div>
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
