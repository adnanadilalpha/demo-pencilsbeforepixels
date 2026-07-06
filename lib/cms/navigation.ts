import {
  coerceNavLink,
  NAV_SLOT_COUNT,
  NAV_DESTINATIONS,
} from "./nav-destinations";
import type { NavLink } from "./types";

/** @deprecated Use NAV_DESTINATIONS — kept for fallbacks. */
export const HEADER_NAV_LINKS: NavLink[] = NAV_DESTINATIONS.map((destination) => ({
  label: destination.defaultLabel,
  href: destination.headerHref,
}));

/** @deprecated Use NAV_DESTINATIONS — kept for fallbacks. */
export const FOOTER_NAV_LINKS: NavLink[] = NAV_DESTINATIONS.map((destination) => ({
  label: destination.defaultLabel,
  href: destination.footerHref,
}));

function isLegacyNavLink(link: { label: string; href: string }): boolean {
  const href = link.href.trim().toLowerCase();
  const label = link.label.trim().toLowerCase();

  return (
    href.includes("mission") ||
    href.includes("resources") ||
    label.includes("mission") ||
    label.includes("resources")
  );
}

function normalizeNavLinksBySlot<
  T extends { label: string; href: string; id?: string },
>(links: T[], location: "header" | "footer"): T[] {
  const filtered = links.filter(
    (link) =>
      link.label.trim().length > 0 &&
      link.href.trim().length > 0 &&
      !isLegacyNavLink(link),
  );

  return Array.from({ length: NAV_SLOT_COUNT }, (_, index) =>
    coerceNavLink(filtered[index], index, location),
  );
}

export function normalizePublicNavLinks(
  links: NavLink[],
  location: "header" | "footer",
): NavLink[] {
  return normalizeNavLinksBySlot(links, location).map(({ label, href }) => ({
    label,
    href,
  }));
}

export type EditableNavLinkRow = {
  id?: string;
  label: string;
  href: string;
};

export function normalizeEditorNavLinks(
  links: EditableNavLinkRow[],
  location: "header" | "footer",
): EditableNavLinkRow[] {
  return normalizeNavLinksBySlot(links, location);
}
