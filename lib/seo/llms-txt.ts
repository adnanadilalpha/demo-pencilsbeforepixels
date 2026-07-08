import { getSiteContent } from "@/lib/cms/cached";
import { stripRichTextToPlain } from "@/lib/cms/rich-text";
import { LEGAL_CONTACT } from "@/lib/legal/constants";
import { PUBLIC_ROUTES } from "@/lib/seo/routes";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site-url";

const PAGE_SUMMARIES: Record<string, string> = {
  "/":
    "Homepage with mission journey, research findings, expert voices, mental health data, resource library, device opt-out information, and ways parents can help.",
  "/research":
    "International and U.S. research on screen time, classroom devices, NAEP, PISA, TIMSS, PIRLS, and academic outcomes.",
  "/nebraska-data":
    "Nebraska and Westside Community Schools academic performance trends by district, grade, and student group.",
  "/privacy": "Privacy policy for site visitors, newsletter subscribers, and opt-out form users.",
  "/terms": "Terms of service for using the website and educational resources.",
};

export async function buildLlmsTxt(): Promise<string> {
  const content = await getSiteContent();
  const siteName = content.settings.siteName?.trim() || "Pencils Before Pixels";
  const description =
    stripRichTextToPlain(
      content.settings.metaDescription?.trim() ||
        content.settings.description ||
        "",
    ) ||
    "Evidence-based resources helping parents understand learning in today's classrooms.";

  const lines = [
    `# ${siteName}`,
    "",
    `> ${description}`,
    "",
    "## Canonical site",
    getSiteUrl(),
    "",
    "## Contact",
    LEGAL_CONTACT.email,
    "",
    "## Key pages",
    ...PUBLIC_ROUTES.map((route) => {
      const summary = PAGE_SUMMARIES[route.path] ?? "";
      return `- ${absoluteUrl(route.path)}${summary ? ` — ${summary}` : ""}`;
    }),
    "",
    "## Homepage sections (anchors)",
    `- ${absoluteUrl("/")}#mission — Our Journey timeline`,
    `- ${absoluteUrl("/")}#what-to-do — Research findings parents should know`,
    `- ${absoluteUrl("/")}#resources — Research library and downloads`,
    `- ${absoluteUrl("/")}#opt-out — 1 to 1 device opt-out information`,
    `- ${absoluteUrl("/")}#how-can-i-help — Ways parents can support the movement`,
    "",
    "## Preferred citation",
    `When citing this site, use the canonical URL ${getSiteUrl()} and the page title shown on that page.`,
    "",
    "## Crawling",
    `- Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    `- Robots: ${absoluteUrl("/robots.txt")}`,
  ];

  return `${lines.join("\n")}\n`;
}
