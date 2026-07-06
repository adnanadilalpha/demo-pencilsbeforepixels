"use client";

import type { ContentField } from "@/lib/admin/content-config";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { MediaField } from "@/components/admin/content/MediaField";
import { TagListField } from "@/components/admin/content/TagListField";
import { RichTextEditor } from "@/components/admin/content/RichTextEditor";
import { ToggleField } from "@/components/admin/content/ToggleField";
import {
  isCompactRichTextField,
  isRichTextDisplayField,
} from "@/lib/admin/rich-text-fields";
import { FileUploadField } from "@/components/admin/resources/FileUploadField";
import { cn } from "@/lib/utils";

type SectionFormProps = {
  title: string;
  fields: ContentField[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
};

function isMediaColumnField(field: ContentField, fields: ContentField[]): boolean {
  if (field.type === "image" && field.mediaFolder) return true;
  if (field.key === "backgroundAlt") {
    return fields.some((item) => item.key === "backgroundImage");
  }
  return false;
}

export function SectionForm({
  title,
  fields,
  values,
  onChange,
}: SectionFormProps) {
  const mediaFields = fields.filter((field) => isMediaColumnField(field, fields));
  const textFields = fields.filter((field) => !isMediaColumnField(field, fields));
  const hasMediaColumn = mediaFields.length > 0;

  return (
    <div className="flex w-full flex-col">
      <h2 className="text-base font-semibold text-navy-800">{title}</h2>

      <div
        className={cn(
          "mt-4",
          hasMediaColumn
            ? "flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8"
            : "flex flex-col gap-5",
        )}
      >
        <div className="flex min-w-0 flex-col gap-5">
          {textFields.map((field) => renderField(field, values, onChange))}
        </div>

        {hasMediaColumn ? (
          <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-0">
            {mediaFields.map((field) => renderField(field, values, onChange))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function renderField(
  field: ContentField,
  values: Record<string, unknown>,
  onChange: (key: string, value: unknown) => void,
) {
  if (field.key === "_note") {
    return (
      <p key={field.key} className="text-sm text-body-muted">
        {field.placeholder}
      </p>
    );
  }

  if (field.type === "toggle") {
    return (
      <ToggleField
        key={field.key}
        label={field.label}
        checked={Boolean(values[field.key] ?? true)}
        onChange={(checked) => onChange(field.key, checked)}
      />
    );
  }

  if (field.type === "cta" && field.ctaKeys) {
    const cta = (values[field.key] as { label?: string; href?: string }) ?? {};
    return (
      <div key={field.key} className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={adminLabelClass}>CTA text</label>
          <input
            className={adminInputClass}
            value={cta.label ?? ""}
            onChange={(event) =>
              onChange(field.key, {
                ...cta,
                label: event.target.value,
              })
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={adminLabelClass}>CTA link</label>
          <input
            className={adminInputClass}
            value={cta.href ?? ""}
            onChange={(event) =>
              onChange(field.key, {
                ...cta,
                href: event.target.value,
              })
            }
          />
        </div>
      </div>
    );
  }

          if (field.type === "stringList") {
            const listValue = Array.isArray(values[field.key])
              ? (values[field.key] as string[])
              : [];
            return (
              <TagListField
                key={field.key}
                label={field.label}
                value={listValue}
                onChange={(value) => onChange(field.key, value)}
              />
            );
          }

          if (field.type === "image" && field.mediaFolder) {
    const imageUrl = (values[field.key] as string) ?? "";
    const altKey = field.key === "backgroundImage" ? "backgroundAlt" : undefined;
    return (
      <MediaField
        key={field.key}
        label={field.label}
        value={imageUrl}
        folder={field.mediaFolder}
        filename={field.mediaFilename}
        altText={altKey ? ((values[altKey] as string) ?? undefined) : undefined}
        onChange={(url) => onChange(field.key, url)}
      />
    );
  }

  if (field.type === "pdf" && field.mediaFolder) {
    const pdfUrl = (values[field.key] as string) ?? "";
    return (
      <FileUploadField
        key={field.key}
        label={field.label}
        folder={field.mediaFolder}
        accept="application/pdf"
        valueUrl={pdfUrl || null}
        compact
        onUploaded={(result) => onChange(field.key, result?.publicUrl ?? "")}
      />
    );
  }

  const value = (values[field.key] as string) ?? "";

  if (isRichTextDisplayField(field)) {
    return (
      <RichTextEditor
        key={field.key}
        label={field.label}
        value={value}
        placeholder={field.placeholder}
        compact={isCompactRichTextField(field)}
        onChange={(nextValue) => onChange(field.key, nextValue)}
      />
    );
  }

  return (
    <div key={field.key} className="flex flex-col gap-1.5">
      <label className={adminLabelClass}>{field.label}</label>
      <input
        className={adminInputClass}
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => onChange(field.key, event.target.value)}
      />
    </div>
  );
}
