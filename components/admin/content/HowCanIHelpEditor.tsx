"use client";

import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { MediaField } from "@/components/admin/content/MediaField";
import { RichTextEditor } from "@/components/admin/content/RichTextEditor";
import {
  DEFAULT_SHARE_CARD_IMAGE,
  HOW_CAN_I_HELP_KINDS,
  mergeHowCanIHelpSectionContent,
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
    showShareImage?: boolean;
    highlightsLabel?: string;
    highlightsPlaceholder?: string;
  }
> = {
  share: {
    title: "Share card (featured)",
    hint: "On the site: story text and share buttons sit on the left; the yard-sign image appears on the right. Share buttons use the URL below — it is not shown as a link box on the page.",
    showHighlights: false,
    showCta: false,
    showShareUrl: true,
    showShareImage: true,
  },
  speak: {
    title: "Speak at board meetings",
    hint: "Add the meeting-dates link as the CTA button. It opens in a new tab on the live site.",
    showHighlights: false,
    showCta: true,
  },
  attend: {
    title: "Attend a presentation",
    hint: "Event dates appear as calendar tiles at the bottom of this card (e.g. September 10, October 4).",
    showHighlights: true,
    showCta: false,
    highlightsLabel: "Event dates (comma separated, up to 3)",
    highlightsPlaceholder: "September 10, October 4",
  },
  opt_out: {
    title: "Opt Out form",
    hint: "Use #opt-out as the CTA link to open the opt-out form modal.",
    showHighlights: false,
    showCta: true,
  },
};

function Subheading({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-800/55">
      {children}
    </p>
  );
}

export function HowCanIHelpEditor({ value, onChange }: HowCanIHelpEditorProps) {
  const normalized = mergeHowCanIHelpSectionContent(
    value as unknown as Record<string, unknown>,
  );
  const items = normalized.items;

  const updateItem = (index: number, patch: Partial<HowCanIHelpItem>) => {
    onChange(
      mergeHowCanIHelpSectionContent({
        ...normalized,
        items: items.map((item, itemIndex) =>
          itemIndex === index ? { ...item, ...patch } : item,
        ),
      } as unknown as Record<string, unknown>),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={adminLabelClass}>Cards</label>
        <p className="mt-1 text-sm text-body-muted">
          Four fixed cards with their own layout on the homepage. Edit the story
          text, share image, event dates, and button links below.
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

                {meta.showShareImage ? (
                  <div className="flex flex-col gap-4 rounded-[10px] border border-navy-800/8 bg-white/70 p-4">
                    <Subheading>Share image (right side)</Subheading>
                    <MediaField
                      label="Yard sign / share image"
                      value={item.image ?? DEFAULT_SHARE_CARD_IMAGE}
                      folder="how-can-i-help"
                      filename="share-yard-sign.png"
                      altText={item.imageAlt ?? "Pencils Before Pixels yard sign"}
                      onChange={(image) => updateItem(index, { image })}
                    />
                    <Field
                      label="Image alt text"
                      value={item.imageAlt ?? ""}
                      placeholder="Pencils Before Pixels yard sign"
                      onChange={(imageAlt) => updateItem(index, { imageAlt })}
                    />
                  </div>
                ) : null}

                {meta.showShareUrl ? (
                  <div className="flex flex-col gap-4 rounded-[10px] border border-navy-800/8 bg-white/70 p-4">
                    <Subheading>Share actions (left side, below text)</Subheading>
                    <Field
                      label="Website URL used by share buttons"
                      value={item.ctaHref ?? ""}
                      placeholder="https://pencilsbeforepixels.org"
                      onChange={(ctaHref) => updateItem(index, { ctaHref })}
                    />
                    <p className="text-xs text-body-muted">
                      Powers native share, X, Facebook, and email. Visitors do
                      not see this URL on the page.
                    </p>
                  </div>
                ) : null}

                {meta.showHighlights ? (
                  <Field
                    label={
                      meta.highlightsLabel ??
                      "Highlight chips (comma separated, up to 3)"
                    }
                    value={item.highlights.join(", ")}
                    placeholder={meta.highlightsPlaceholder ?? "September 10, October 4"}
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
