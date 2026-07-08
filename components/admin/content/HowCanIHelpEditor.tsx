"use client";

import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { RichTextEditor } from "@/components/admin/content/RichTextEditor";
import {
  HOW_CAN_I_HELP_KINDS,
  normalizeHowCanIHelpContent,
  type HowCanIHelpContent,
  type HowCanIHelpItem,
  type HowCanIHelpKind,
} from "@/lib/cms/how-can-i-help-content";

const CARD_ACCENT: Record<HowCanIHelpKind, string> = {
  share: "bg-gold-500/15 text-gold-600",
  speak: "bg-navy-800/[0.06] text-navy-800",
  attend: "bg-navy-800/[0.06] text-navy-800",
  opt_out: "bg-gold-500/15 text-gold-600",
};

type HowCanIHelpEditorProps = {
  value: HowCanIHelpContent;
  onChange: (value: HowCanIHelpContent) => void;
};

const CARD_META: Record<
  HowCanIHelpKind,
  {
    title: string;
    hint: string;
    showHighlights: boolean;
    showCta: boolean;
    showShareUrl?: boolean;
  }
> = {
  share: {
    title: "Share card (featured)",
    hint: "Built-in share buttons (copy link, native share, X, Facebook, email) are added automatically. Set the website URL that gets shared below.",
    showHighlights: false,
    showCta: false,
    showShareUrl: true,
  },
  speak: {
    title: "Speak at board meetings",
    hint: "Add the meeting-dates link as the CTA. Highlight chips are optional \u2014 leave empty to hide them.",
    showHighlights: true,
    showCta: true,
  },
  attend: {
    title: "Attend a presentation",
    hint: "Use highlights for the event dates (e.g. \u201cSeptember 10\u201d, \u201cOctober 4\u201d).",
    showHighlights: true,
    showCta: true,
  },
  opt_out: {
    title: "Opt Out form",
    hint: "Use #opt-out as the CTA link to open the opt-out form modal.",
    showHighlights: false,
    showCta: true,
  },
};

export function HowCanIHelpEditor({ value, onChange }: HowCanIHelpEditorProps) {
  const normalized = normalizeHowCanIHelpContent(value);
  const items = normalized.items;

  const updateItem = (index: number, patch: Partial<HowCanIHelpItem>) => {
    onChange({
      ...normalized,
      items: items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={adminLabelClass}>Cards</label>
        <p className="mt-1 text-sm text-body-muted">
          Four fixed cards, each with its own layout and actions. Edit the story
          text, the small chip highlights, and the button/link where available.
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        {HOW_CAN_I_HELP_KINDS.map((kind, index) => {
          const item = items[index];
          const meta = CARD_META[kind];

          return (
            <li
              key={kind}
              className="rounded-[12px] border border-navy-800/10 bg-paper-50 p-4"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex size-7 items-center justify-center rounded-full font-sans text-xs font-semibold ${CARD_ACCENT[kind]}`}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <p className="text-sm font-semibold text-navy-800">
                  {meta.title}
                </p>
              </div>
              <p className="mb-3 mt-1.5 text-xs text-body-muted">{meta.hint}</p>

              <div className="flex flex-col gap-4">
                <Field
                  label="Eyebrow"
                  value={item.eyebrow}
                  placeholder="Spread the word"
                  onChange={(eyebrow) => updateItem(index, { eyebrow })}
                />

                <RichTextEditor
                  label="Body"
                  value={item.body}
                  onChange={(body) => updateItem(index, { body })}
                />

                {meta.showShareUrl ? (
                  <Field
                    label="Website URL to share"
                    value={item.ctaHref ?? ""}
                    placeholder="https://pencilsbeforepixels.org"
                    onChange={(ctaHref) => updateItem(index, { ctaHref })}
                  />
                ) : null}

                {meta.showHighlights ? (
                  <Field
                    label="Highlight chips (comma separated, up to 3)"
                    value={item.highlights.join(", ")}
                    placeholder="September 10, October 4"
                    onChange={(raw) =>
                      updateItem(index, {
                        highlights: raw
                          .split(",")
                          .map((chip) => chip.trim())
                          .filter(Boolean)
                          .slice(0, 3),
                      })
                    }
                  />
                ) : null}

                {meta.showCta ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Button / link label"
                      value={item.ctaLabel ?? ""}
                      placeholder="View meeting dates"
                      onChange={(ctaLabel) => updateItem(index, { ctaLabel })}
                    />
                    <Field
                      label="Button / link URL"
                      value={item.ctaHref ?? ""}
                      placeholder="#opt-out"
                      onChange={(ctaHref) => updateItem(index, { ctaHref })}
                    />
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={adminLabelClass}>{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={adminInputClass}
      />
    </label>
  );
}
