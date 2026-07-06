export type NavDestinationId = "research" | "nebraska" | "opt_out";

export type NavDestination = {
  id: NavDestinationId;
  defaultLabel: string;
  headerHref: string;
  footerHref: string;
  matchHrefs: string[];
};

/** Fixed routes for the three main nav items — labels are editable in admin. */
export const NAV_DESTINATIONS: NavDestination[] = [
  {
    id: "research",
    defaultLabel: "Research",
    headerHref: "/research",
    footerHref: "/research",
    matchHrefs: ["/research"],
  },
  {
    id: "nebraska",
    defaultLabel: "Nebraska Data",
    headerHref: "/nebraska-data",
    footerHref: "/nebraska-data",
    matchHrefs: ["/nebraska-data", "/nebraska", "/evidence"],
  },
  {
    id: "opt_out",
    defaultLabel: "Device Opt Out",
    headerHref: "#opt-out",
    footerHref: "/#opt-out",
    matchHrefs: ["#opt-out", "/#opt-out", "/opt-out"],
  },
];

export const NAV_SLOT_COUNT = NAV_DESTINATIONS.length;

function normalizeHref(href: string): string {
  const trimmed = href.trim().toLowerCase();
  if (!trimmed) return "";
  if (trimmed.startsWith("#")) return trimmed;
  if (trimmed.startsWith("/#")) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function getDestinationForSlot(slotIndex: number): NavDestination {
  return NAV_DESTINATIONS[slotIndex] ?? NAV_DESTINATIONS[0];
}

export function getDestinationIdForHref(
  href: string,
  slotIndex: number,
): NavDestinationId {
  const normalized = normalizeHref(href);

  for (const destination of NAV_DESTINATIONS) {
    if (
      destination.matchHrefs.some(
        (candidate) => normalizeHref(candidate) === normalized,
      )
    ) {
      return destination.id;
    }
  }

  return getDestinationForSlot(slotIndex).id;
}

export function getHrefForDestination(
  destinationId: NavDestinationId,
  location: "header" | "footer",
): string {
  const destination =
    NAV_DESTINATIONS.find((entry) => entry.id === destinationId) ??
    NAV_DESTINATIONS[0];

  return location === "header"
    ? destination.headerHref
    : destination.footerHref;
}

export function coerceNavLink<
  T extends { label: string; href: string; id?: string },
>(link: T | undefined, slotIndex: number, location: "header" | "footer"): T {
  const destination = getDestinationForSlot(slotIndex);
  const destinationId = getDestinationIdForHref(link?.href ?? "", slotIndex);

  return {
    ...link,
    id: link?.id,
    label: link?.label.trim() || destination.defaultLabel,
    href: getHrefForDestination(destinationId, location),
  } as T;
}
