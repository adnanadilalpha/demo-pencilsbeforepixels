import type { ContentField } from "@/lib/admin/content-config";

export type ResearchEditorSection = {
  id: string;
  label: string;
  fields: ContentField[];
};

const text = (key: string, label: string): ContentField => ({
  key,
  label,
  type: "text",
});

const area = (key: string, label: string): ContentField => ({
  key,
  label,
  type: "textarea",
});

const pdf = (key: string, label: string): ContentField => ({
  key,
  label,
  type: "pdf",
  mediaFolder: "research/pdfs",
});

export const researchEditorSections: ResearchEditorSection[] = [
  {
    id: "research_national",
    label: "National Trends",
    fields: [
      text("research.nationalSlopes.0.label", "Grade 4 Math label"),
      text("research.nationalSlopes.0.slope", "Grade 4 Math slope"),
      text("research.nationalSlopes.1.label", "Grade 4 Reading label"),
      text("research.nationalSlopes.1.slope", "Grade 4 Reading slope"),
      text("research.nationalSlopes.2.label", "Grade 8 Math label"),
      text("research.nationalSlopes.2.slope", "Grade 8 Math slope"),
      text("research.nationalSlopes.3.label", "Grade 8 Reading label"),
      text("research.nationalSlopes.3.slope", "Grade 8 Reading slope"),
    ],
  },
  {
    id: "research_pisa",
    label: "PISA",
    fields: [
      text("research.pisa.title", "Title"),
      area("research.pisa.description", "Description"),
      area("research.pisa.callout", "Callout"),
      pdf("research.pisa.math.pdfUrl", "Math chart PDF"),
      pdf("research.pisa.reading.pdfUrl", "Reading chart PDF"),
    ],
  },
  {
    id: "research_oecd",
    label: "OECD",
    fields: [
      text("research.oecd.title", "Title"),
      area("research.oecd.subtitle", "Subtitle"),
      text("research.oecd.xLabel", "X-axis label"),
      text("research.oecd.yLabel", "Y-axis label"),
      pdf("research.oecd.pdfUrl", "Chart PDF"),
    ],
  },
  {
    id: "research_timss",
    label: "TIMSS",
    fields: [
      text("research.timss.title", "Title"),
      area("research.timss.description", "Description"),
      text("research.timss.grade4.title", "Grade 4 chart title"),
      pdf("research.timss.grade4.pdfUrl", "Grade 4 chart PDF"),
      text("research.timss.grade8.title", "Grade 8 chart title"),
      pdf("research.timss.grade8.pdfUrl", "Grade 8 chart PDF"),
    ],
  },
  {
    id: "research_pirls",
    label: "PIRLS",
    fields: [
      text("research.pirls.title", "Title"),
      area("research.pirls.description", "Description"),
      text("research.pirls.xLabel", "X-axis label"),
      text("research.pirls.yLabel", "Y-axis label"),
      pdf("research.pirls.pdfUrl", "Chart PDF"),
    ],
  },
  {
    id: "research_device_time",
    label: "Device Time at School",
    fields: [
      text("research.deviceTime.title", "Title"),
      area("research.deviceTime.description", "Description"),
      pdf("research.deviceTime.pdfUrl", "Chart PDF"),
    ],
  },
  {
    id: "research_parcc",
    label: "PARCC Testing Mode",
    fields: [
      text("research.parcc.title", "Title"),
      area("research.parcc.description", "Description"),
      pdf("research.parcc.pdfUrl", "Chart PDF"),
    ],
  },
  {
    id: "research_screen_time",
    label: "Early Screen Time (JAMA)",
    fields: [
      text("research.screenTime.title", "Title"),
      area("research.screenTime.description", "Description"),
      area("research.screenTime.howToRead", "How to read"),
      area("research.screenTime.statisticalNote", "Statistical note"),
      pdf("research.screenTime.pdfUrl", "Chart PDF"),
    ],
  },
  {
    id: "research_mental_health",
    label: "Mental Health Research",
    fields: [
      text("research.mentalHealth.title", "Title"),
      area("research.mentalHealth.description", "Description"),
      area("research.mentalHealth.callout", "Callout"),
      pdf("research.mentalHealth.pdfUrl", "Chart PDF"),
    ],
  },
  {
    id: "research_grade4",
    label: "Grade 4 NAEP",
    fields: [
      text("research.grade4.heading", "Section heading"),
      text("research.grade4.math.title", "Math chart title"),
      pdf("research.grade4.math.pdfUrl", "Math chart PDF"),
      text("research.grade4.math.slopes.pre.label", "Math pre-adoption label"),
      text("research.grade4.math.slopes.post.label", "Math post-adoption label"),
      text("research.grade4.reading.title", "Reading chart title"),
      pdf("research.grade4.reading.pdfUrl", "Reading chart PDF"),
      text("research.grade4.reading.slopes.pre.label", "Reading pre-adoption label"),
      text("research.grade4.reading.slopes.post.label", "Reading post-adoption label"),
    ],
  },
  {
    id: "research_grade8",
    label: "Grade 8 NAEP",
    fields: [
      text("research.grade8.heading", "Section heading"),
      text("research.grade8.math.title", "Math chart title"),
      pdf("research.grade8.math.pdfUrl", "Math chart PDF"),
      text("research.grade8.math.slopes.pre.label", "Math pre-adoption label"),
      text("research.grade8.math.slopes.post.label", "Math post-adoption label"),
      text("research.grade8.reading.title", "Reading chart title"),
      pdf("research.grade8.reading.pdfUrl", "Reading chart PDF"),
      text("research.grade8.reading.slopes.pre.label", "Reading pre-adoption label"),
      text("research.grade8.reading.slopes.post.label", "Reading post-adoption label"),
    ],
  },
];
