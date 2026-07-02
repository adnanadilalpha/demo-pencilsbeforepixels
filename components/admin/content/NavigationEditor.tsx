"use client";

import type { EditableNavLink } from "@/lib/admin/cms-entity-types";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";

type NavigationEditorProps = {
  header: EditableNavLink[];
  footer: EditableNavLink[];
  onChange: (next: { header: EditableNavLink[]; footer: EditableNavLink[] }) => void;
};

export function NavigationEditor({
  header,
  footer,
  onChange,
}: NavigationEditorProps) {
  const updateLink = (
    location: "header" | "footer",
    index: number,
    patch: Partial<EditableNavLink>,
  ) => {
    const list = location === "header" ? header : footer;
    const next = list.map((link, linkIndex) =>
      linkIndex === index ? { ...link, ...patch } : link,
    );
    onChange({
      header: location === "header" ? next : header,
      footer: location === "footer" ? next : footer,
    });
  };

  return (
    <div className="space-y-6">
      <NavGroup
        title="Header links"
        links={header}
        onUpdate={(index, patch) => updateLink("header", index, patch)}
      />
      <NavGroup
        title="Footer links"
        links={footer}
        onUpdate={(index, patch) => updateLink("footer", index, patch)}
      />
    </div>
  );
}

function NavGroup({
  title,
  links,
  onUpdate,
}: {
  title: string;
  links: EditableNavLink[];
  onUpdate: (index: number, patch: Partial<EditableNavLink>) => void;
}) {
  return (
    <div className="space-y-3 rounded-[12px] border border-navy-800/10 bg-paper-50 p-4">
      <p className="text-sm font-semibold text-navy-800">{title}</p>
      {links.length === 0 ? (
        <p className="text-xs text-body-muted">No links in Supabase yet.</p>
      ) : (
        links.map((link, index) => (
          <div
            key={link.id ?? `${link.label}-${index}`}
            className="grid gap-3 rounded-[10px] border border-navy-800/8 bg-white p-3 sm:grid-cols-2"
          >
            <Field
              label="Label"
              value={link.label}
              onChange={(value) => onUpdate(index, { label: value })}
            />
            <Field
              label="Link"
              value={link.href}
              onChange={(value) => onUpdate(index, { href: value })}
            />
          </div>
        ))
      )}
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
