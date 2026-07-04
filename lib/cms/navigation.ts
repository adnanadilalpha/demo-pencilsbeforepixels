import type { NavLink } from "./types";

/** Canonical header navigation — order matches public site menu. */
export const HEADER_NAV_LINKS: NavLink[] = [
  { label: "Our Mission", href: "#mission" },
  { label: "Research", href: "/research" },
  { label: "Nebraska Data", href: "/evidence" },
  { label: "Device Opt Out", href: "#opt-out" },
];

/** Canonical footer navigation — hash links use `/#` for off-homepage routes. */
export const FOOTER_NAV_LINKS: NavLink[] = [
  { label: "Our Mission", href: "/#mission" },
  { label: "Research", href: "/research" },
  { label: "Nebraska Data", href: "/evidence" },
  { label: "Device Opt Out", href: "/#opt-out" },
];

const NAV_ORDER = ["mission", "research", "nebraska", "opt-out"] as const;

type NavKey = (typeof NAV_ORDER)[number];

function hrefToNavKey(href: string): NavKey | null {
  const normalized = href.trim().toLowerCase();

  if (normalized.includes("resources")) return null;
  if (normalized.includes("mission")) return "mission";
  if (normalized.includes("research")) return "research";
  if (normalized.includes("evidence")) return "nebraska";
  if (normalized.includes("opt-out") || normalized.includes("opt_out")) {
    return "opt-out";
  }

  return null;
}

function labelToNavKey(label: string): NavKey | null {
  const normalized = label.trim().toLowerCase();

  if (normalized.includes("mission")) return "mission";
  if (normalized.includes("research")) return "research";
  if (
    normalized.includes("nebraska") ||
    normalized.includes("evidence") ||
    normalized.includes("data")
  ) {
    return "nebraska";
  }
  if (normalized.includes("opt out") || normalized.includes("opt-out")) {
    return "opt-out";
  }

  return null;
}

function linkToNavKey(link: { label: string; href: string }): NavKey | null {
  return hrefToNavKey(link.href) ?? labelToNavKey(link.label);
}

function defaultsForLocation(location: "header" | "footer"): NavLink[] {
  return location === "header" ? HEADER_NAV_LINKS : FOOTER_NAV_LINKS;
}

function defaultByKey(location: "header" | "footer") {
  return new Map(
    defaultsForLocation(location).map((link) => [hrefToNavKey(link.href)!, link]),
  );
}

export function normalizePublicNavLinks(
  links: NavLink[],
  location: "header" | "footer",
): NavLink[] {
  const defaults = defaultByKey(location);
  const matched = new Map<NavKey, NavLink>();

  for (const link of links) {
    const key = linkToNavKey(link);
    if (!key) continue;

    const canonical = defaults.get(key);
    if (!canonical) continue;

    matched.set(key, {
      label: canonical.label,
      href: canonical.href,
    });
  }

  return NAV_ORDER.map((key) => matched.get(key) ?? defaults.get(key)!);
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
  const defaults = defaultByKey(location);
  const matched = new Map<NavKey, EditableNavLinkRow>();

  for (const link of links) {
    const key = linkToNavKey(link);
    if (!key) continue;

    const canonical = defaults.get(key);
    if (!canonical) continue;

    matched.set(key, {
      id: link.id,
      label: canonical.label,
      href: canonical.href,
    });
  }

  return NAV_ORDER.map((key) => {
    const existing = matched.get(key);
    const canonical = defaults.get(key)!;

    return {
      id: existing?.id,
      label: canonical.label,
      href: canonical.href,
    };
  });
}
