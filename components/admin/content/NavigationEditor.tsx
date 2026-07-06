"use client";

import type { EditableNavLink } from "@/lib/admin/cms-entity-types";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import {
  getDestinationIdForHref,
  getHrefForDestination,
  NAV_DESTINATIONS,
  type NavDestinationId,
} from "@/lib/cms/nav-destinations";

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

  const updateDestination = (
    location: "header" | "footer",
    index: number,
    destinationId: NavDestinationId,
  ) => {
    updateLink(location, index, {
      href: getHrefForDestination(destinationId, location),
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-body-muted">
        Customize the menu labels shown in the header and footer. Each item maps
        to a fixed page on the site. Publish this section to update the live menu.
      </p>
      <NavGroup
        title="Header links"
        location="header"
        links={header}
        onUpdateLabel={(index, label) => updateLink("header", index, { label })}
        onUpdateDestination={(index, destinationId) =>
          updateDestination("header", index, destinationId)
        }
      />
      <NavGroup
        title="Footer links"
        location="footer"
        links={footer}
        onUpdateLabel={(index, label) => updateLink("footer", index, { label })}
        onUpdateDestination={(index, destinationId) =>
          updateDestination("footer", index, destinationId)
        }
      />
    </div>
  );
}

function NavGroup({
  title,
  location,
  links,
  onUpdateLabel,
  onUpdateDestination,
}: {
  title: string;
  location: "header" | "footer";
  links: EditableNavLink[];
  onUpdateLabel: (index: number, label: string) => void;
  onUpdateDestination: (index: number, destinationId: NavDestinationId) => void;
}) {
  return (
    <div className="space-y-3 rounded-[12px] border border-navy-800/10 bg-paper-50 p-4">
      <p className="text-sm font-semibold text-navy-800">{title}</p>
      {links.length === 0 ? (
        <p className="text-xs text-body-muted">No links in Supabase yet.</p>
      ) : (
        links.map((link, index) => {
          const destinationId = getDestinationIdForHref(link.href, index);
          const resolvedHref = getHrefForDestination(destinationId, location);

          return (
            <div
              key={link.id ?? `${link.label}-${index}`}
              className="grid gap-3 rounded-[10px] border border-navy-800/8 bg-white p-3 sm:grid-cols-2"
            >
              <Field
                label="Label"
                value={link.label}
                onChange={(value) => onUpdateLabel(index, value)}
              />
              <div className="flex flex-col gap-1.5">
                <label className={adminLabelClass}>Destination</label>
                <select
                  className={adminInputClass}
                  value={destinationId}
                  onChange={(event) =>
                    onUpdateDestination(
                      index,
                      event.target.value as NavDestinationId,
                    )
                  }
                >
                  {NAV_DESTINATIONS.map((destination) => (
                    <option key={destination.id} value={destination.id}>
                      {destination.defaultLabel}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-body-muted">
                  Goes to <code className="text-navy-800">{resolvedHref}</code>
                </p>
              </div>
            </div>
          );
        })
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
