"use client";

import { Plus, Trash2 } from "lucide-react";
import { MediaField } from "@/components/admin/content/MediaField";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import type { SettingsSocialLink } from "@/lib/admin/settings/types";
import { createSocialLink } from "@/lib/site/social-links";
import { cn } from "@/lib/utils";

type SocialLinksEditorProps = {
  links: SettingsSocialLink[];
  onChange: (links: SettingsSocialLink[]) => void;
};

export function SocialLinksEditor({ links, onChange }: SocialLinksEditorProps) {
  const updateLink = (index: number, patch: Partial<SettingsSocialLink>) => {
    onChange(
      links.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...patch } : link,
      ),
    );
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, linkIndex) => linkIndex !== index));
  };

  const addLink = () => {
    onChange([...links, createSocialLink()]);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-body-muted">
        Add social profiles shown in the site footer. Upload a square SVG or PNG
        icon for each link.
      </p>

      {links.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-navy-800/15 bg-paper-50 px-4 py-6 text-sm text-body-muted">
          No social links yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {links.map((link, index) => (
            <article
              key={link.id}
              className="rounded-[12px] border border-navy-800/10 bg-paper-50 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-navy-800">
                  {link.label.trim() || `Link ${index + 1}`}
                </p>
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
                  aria-label={`Remove ${link.label || "social link"}`}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Remove
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Field
                  label="Label"
                  value={link.label}
                  onChange={(value) => updateLink(index, { label: value })}
                  placeholder="Facebook"
                />
                <Field
                  label="URL"
                  value={link.url}
                  onChange={(value) => updateLink(index, { url: value })}
                  placeholder="https://"
                />
              </div>

              <div className="mt-4">
                <MediaField
                  label="Icon"
                  value={link.iconUrl}
                  onChange={(value) => updateLink(index, { iconUrl: value })}
                  folder="icons/social"
                  filename={`${link.id}.svg`}
                  altText={`${link.label || "Social"} icon`}
                  variant="icon"
                  previewTheme="light"
                  accept="image/*,.svg"
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addLink}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-navy-800/12 bg-white px-4 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-paper-200/60"
      >
        <Plus className="size-4" aria-hidden />
        Add social link
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={adminLabelClass}>{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(adminInputClass, "h-11 rounded-[10px] px-3")}
      />
    </div>
  );
}
