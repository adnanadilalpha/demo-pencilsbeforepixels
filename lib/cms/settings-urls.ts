const PLACEHOLDER_URLS = new Set(["", "#"]);

function isPlaceholderUrl(url: string | undefined): boolean {
  if (!url) return true;
  return PLACEHOLDER_URLS.has(url.trim());
}

export function resolvePrivacyPolicyUrl(url?: string): string {
  if (isPlaceholderUrl(url)) return "/privacy";
  return url!.trim();
}

export function resolveTermsOfServiceUrl(url?: string): string {
  if (isPlaceholderUrl(url)) return "/terms";
  return url!.trim();
}
