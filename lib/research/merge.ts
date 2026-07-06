import { researchChartsData } from "@/lib/research/data";
import type { AcademicChart } from "@/lib/academic-data/types";
import {
  applyDeviceTimeChartAxis,
  DEVICE_TIME_CHART_Y_MAX,
  DEVICE_TIME_CHART_Y_MIN,
  DEVICE_TIME_CHART_Y_TICKS,
} from "@/lib/research/device-time-chart";
import type {
  BarChartData,
  NaepGradeSection,
  NaepYearZeroChart,
  ResearchChartsData,
  SlopeStat,
} from "@/lib/research/types";

function mergeChartPdf(
  base: AcademicChart,
  overlay?: Partial<AcademicChart>,
): AcademicChart {
  if (!overlay?.pdfUrl) return base;
  return { ...base, pdfUrl: overlay.pdfUrl };
}

function mergeNaepChart(
  base: NaepYearZeroChart,
  overlay?: Partial<NaepYearZeroChart>,
): NaepYearZeroChart {
  return {
    ...base,
    title: overlay?.title || base.title,
    pdfUrl: overlay?.pdfUrl ?? base.pdfUrl,
  };
}

function mergeNaepGrade(
  base: NaepGradeSection,
  overlay?: Partial<NaepGradeSection>,
): NaepGradeSection {
  return {
    heading: overlay?.heading || base.heading,
    math: mergeNaepChart(base.math, overlay?.math),
    reading: mergeNaepChart(base.reading, overlay?.reading),
  };
}

function mergeBarChart(
  base: BarChartData,
  overlay?: Partial<BarChartData>,
): BarChartData {
  return {
    ...base,
    title: overlay?.title || base.title,
    pdfUrl: overlay?.pdfUrl ?? base.pdfUrl,
  };
}

function mergeSlopes(
  base: SlopeStat[],
  overlay?: SlopeStat[],
): SlopeStat[] {
  return base.map((item, index) => ({
    label: overlay?.[index]?.label || item.label,
    slope: overlay?.[index]?.slope || item.slope,
  }));
}

/**
 * CMS stores editable copy and PDF links. Chart series, points, and layout
 * always come from code so research/academic chart refactors stay in sync.
 */
export function mergeResearchWithFallback(
  db: ResearchChartsData | undefined | null,
): ResearchChartsData {
  const base = structuredClone(researchChartsData);
  if (!db) return base;

  return {
    nationalSlopes: mergeSlopes(base.nationalSlopes, db.nationalSlopes),
    naepNarrative: {
      heading: db.naepNarrative?.heading || base.naepNarrative.heading,
      body: db.naepNarrative?.body || base.naepNarrative.body,
      footnote: db.naepNarrative?.footnote || base.naepNarrative.footnote,
    },
    grade4: mergeNaepGrade(base.grade4, db.grade4),
    grade8: mergeNaepGrade(base.grade8, db.grade8),
    internationalNarrative: {
      heading:
        db.internationalNarrative?.heading ||
        base.internationalNarrative.heading,
      body:
        db.internationalNarrative?.body || base.internationalNarrative.body,
    },
    pisa: {
      title: db.pisa?.title || base.pisa.title,
      description: db.pisa?.description || base.pisa.description,
      callout: db.pisa?.callout || base.pisa.callout,
      math: mergeChartPdf(base.pisa.math, db.pisa?.math),
      reading: mergeChartPdf(base.pisa.reading, db.pisa?.reading),
    },
    oecd: {
      ...base.oecd,
      title: db.oecd?.title || base.oecd.title,
      subtitle: db.oecd?.subtitle || base.oecd.subtitle,
      xLabel: db.oecd?.xLabel || base.oecd.xLabel,
      yLabel: db.oecd?.yLabel || base.oecd.yLabel,
      pdfUrl: db.oecd?.pdfUrl ?? base.oecd.pdfUrl,
    },
    timss: {
      title: db.timss?.title || base.timss.title,
      description: db.timss?.description || base.timss.description,
      grade4: mergeBarChart(base.timss.grade4, db.timss?.grade4),
      grade8: mergeBarChart(base.timss.grade8, db.timss?.grade8),
    },
    pirls: {
      ...base.pirls,
      title: db.pirls?.title || base.pirls.title,
      description: db.pirls?.description || base.pirls.description,
      subtitle: db.pirls?.subtitle || base.pirls.subtitle,
      xLabel: db.pirls?.xLabel || base.pirls.xLabel,
      yLabel: db.pirls?.yLabel || base.pirls.yLabel,
      pdfUrl: db.pirls?.pdfUrl ?? base.pirls.pdfUrl,
    },
    deviceTime: {
      title: db.deviceTime?.title || base.deviceTime.title,
      description: db.deviceTime?.description || base.deviceTime.description,
      pdfUrl: db.deviceTime?.pdfUrl ?? base.deviceTime.pdfUrl,
      chart: applyDeviceTimeChartAxis(
        mergeChartPdf(base.deviceTime.chart, db.deviceTime?.chart),
      ),
    },
    parcc: {
      title: db.parcc?.title || base.parcc.title,
      description: db.parcc?.description || base.parcc.description,
      pdfUrl: db.parcc?.pdfUrl ?? base.parcc.pdfUrl,
      math: base.parcc.math,
      ela: base.parcc.ela,
    },
    screenTime: {
      ...base.screenTime,
      title: db.screenTime?.title || base.screenTime.title,
      description: db.screenTime?.description || base.screenTime.description,
      howToRead: db.screenTime?.howToRead || base.screenTime.howToRead,
      statisticalNote:
        db.screenTime?.statisticalNote || base.screenTime.statisticalNote,
      pdfUrl: db.screenTime?.pdfUrl ?? base.screenTime.pdfUrl,
    },
    mentalHealth: {
      title: db.mentalHealth?.title || base.mentalHealth.title,
      description: db.mentalHealth?.description || base.mentalHealth.description,
      callout: db.mentalHealth?.callout || base.mentalHealth.callout,
      pdfUrl: db.mentalHealth?.pdfUrl ?? base.mentalHealth.pdfUrl,
      series: base.mentalHealth.series,
    },
  };
}
