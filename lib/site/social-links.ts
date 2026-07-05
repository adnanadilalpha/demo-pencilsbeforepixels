export type SocialLink = {
  id: string;
  label: string;
  url: string;
  iconUrl: string;
};

export const DEFAULT_FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61591530905136";

export const DEFAULT_FACEBOOK_ICON = "/images/icons/social/facebook.svg";

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    id: "facebook",
    label: "Facebook",
    url: DEFAULT_FACEBOOK_URL,
    iconUrl: DEFAULT_FACEBOOK_ICON,
  },
];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function normalizeSocialLink(
  value: unknown,
  index: number,
): SocialLink | null {
  const record = asRecord(value);
  const url = typeof record.url === "string" ? record.url.trim() : "";
  if (!url) return null;

  const id =
    typeof record.id === "string" && record.id.trim()
      ? record.id.trim()
      : `social-${index}`;

  return {
    id,
    label:
      typeof record.label === "string" && record.label.trim()
        ? record.label.trim()
        : "Social link",
    url,
    iconUrl:
      typeof record.iconUrl === "string" ? record.iconUrl.trim() : "",
  };
}

export function normalizeSocialLinks(
  value: unknown,
  options?: { useDefaultsWhenMissing?: boolean },
): SocialLink[] {
  if (!Array.isArray(value)) {
    return options?.useDefaultsWhenMissing ? DEFAULT_SOCIAL_LINKS : [];
  }

  const links = value
    .map((item, index) => normalizeSocialLink(item, index))
    .filter((link): link is SocialLink => link !== null);

  if (links.length === 0 && options?.useDefaultsWhenMissing) {
    return DEFAULT_SOCIAL_LINKS;
  }

  return links;
}

export function mergeSocialLinks(
  stored: unknown,
  partial?: SocialLink[],
): SocialLink[] {
  if (partial !== undefined) {
    return normalizeSocialLinks(partial);
  }

  if (stored !== undefined) {
    return normalizeSocialLinks(stored);
  }

  return DEFAULT_SOCIAL_LINKS;
}

export function createSocialLink(partial?: Partial<SocialLink>): SocialLink {
  const id =
    partial?.id?.trim() ||
    `social-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    label: partial?.label?.trim() || "New link",
    url: partial?.url?.trim() || "",
    iconUrl: partial?.iconUrl?.trim() || "",
  };
}

export function publicSocialLinks(links: SocialLink[]): SocialLink[] {
  return links.filter((link) => link.url.trim());
}
