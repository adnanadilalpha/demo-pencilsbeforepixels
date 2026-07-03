import { allEditorSections } from "@/lib/admin/content-config";
import { adminNavItems } from "@/lib/admin/navigation";

export type AdminSearchEntry = {
  id: string;
  label: string;
  description: string;
  href: string;
  keywords: string[];
};

const SCORES_ENTRY: AdminSearchEntry = {
  id: "scores-page",
  label: "Scores",
  description: "Nebraska assessment data uploads",
  href: "/admin/scores",
  keywords: ["scores", "csv", "upload", "math", "english", "frl", "evidence", "assessment"],
};

const RESOURCE_TABS: AdminSearchEntry[] = [
  {
    id: "resources-books",
    label: "Books",
    description: "Resources",
    href: "/admin/resources?tab=books",
    keywords: ["resources", "library", "books"],
  },
  {
    id: "resources-research-papers",
    label: "Research Papers",
    description: "Resources",
    href: "/admin/resources?tab=research-papers",
    keywords: ["resources", "library", "research", "papers"],
  },
  {
    id: "resources-videos",
    label: "Videos",
    description: "Resources",
    href: "/admin/resources?tab=videos",
    keywords: ["resources", "library", "videos"],
  },
  {
    id: "resources-parent-resources",
    label: "Parent Resources",
    description: "Resources",
    href: "/admin/resources?tab=parent-resources",
    keywords: ["resources", "library", "parent", "pdfs"],
  },
];

const PAGE_LABELS: Record<string, string> = {
  homepage: "Homepage",
  nebraska: "Nebraska Data",
  research: "Research",
  site: "Site",
  evidence: "Nebraska Data",
};

export function buildAdminSearchIndex(): AdminSearchEntry[] {
  const pages = adminNavItems.map((item) => ({
    id: `page-${item.href}`,
    label: item.label,
    description: "Admin page",
    href: item.href,
    keywords: [item.label, item.href.replace("/admin/", "")],
  }));

  const contentSections = allEditorSections.map((section) => ({
    id: `content-${section.id}`,
    label: section.label,
    description: `Content · ${PAGE_LABELS[section.page] ?? section.page}`,
    href: `/admin/content?page=${section.page}&section=${section.id}`,
    keywords: [
      section.id,
      section.label,
      section.page,
      "content",
      "editor",
    ],
  }));

  return [...pages, SCORES_ENTRY, ...RESOURCE_TABS, ...contentSections];
}

export function filterAdminSearchEntries(
  entries: AdminSearchEntry[],
  query: string,
  limit = 12,
): AdminSearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries.slice(0, limit);

  const scored = entries
    .map((entry) => {
      const label = entry.label.toLowerCase();
      const description = entry.description.toLowerCase();
      const href = entry.href.toLowerCase();
      const keywords = entry.keywords.join(" ").toLowerCase();

      let score = 0;
      if (label.startsWith(q)) score += 100;
      else if (label.includes(q)) score += 60;

      if (description.includes(q)) score += 30;
      if (keywords.includes(q)) score += 20;
      if (href.includes(q)) score += 10;

      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label));

  return scored.slice(0, limit).map(({ entry }) => entry);
}
