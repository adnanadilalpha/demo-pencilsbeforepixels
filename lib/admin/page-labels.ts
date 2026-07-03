const PAGE_LABELS: Record<string, string> = {
  "/": "Landing Page",
  "/evidence": "Nebraska Data",
  "/research": "Research",
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Service",
};

export function getPageLabel(path: string): string {
  if (PAGE_LABELS[path]) {
    return PAGE_LABELS[path];
  }

  if (path.startsWith("/#")) {
    const hash = path.slice(2);
    return hash
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  const segment = path.replace(/^\//, "").split("/")[0];
  if (!segment) return "Landing Page";

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
