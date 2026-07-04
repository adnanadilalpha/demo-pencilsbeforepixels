import {
  buildPisaResearchCharts,
  PISA_CHART_LABELS,
} from "@/lib/charts/pisa-data";
import {
  buildParccElaChart,
  buildParccMathChart,
  PARCC_STUDY_DESCRIPTION_FULL,
  PARCC_STUDY_TITLE,
} from "@/lib/charts/parcc-data";
import {
  NAEP_GRADE_4,
  NAEP_GRADE_8,
  NAEP_NATIONAL_SLOPES,
} from "@/lib/charts/naep-data";
import type {
  ResearchChartsData,
  ScreenTimeTabData,
} from "@/lib/research/types";

const { math: pisaMath, reading: pisaReading } = buildPisaResearchCharts();

const screenTimeRows = (
  rows: ScreenTimeTabData["rows"],
): ScreenTimeTabData["rows"] => rows;

export const researchChartsData: ResearchChartsData = {
  nationalSlopes: [...NAEP_NATIONAL_SLOPES],
  naepNarrative: {
    heading: "The NAEP Evidence: When Digital Adoption Aligns with Score Decline",
    body:
      "Nebraska's assessment trends don't exist in isolation. Nationally, researchers have documented a striking pattern: across all 50 states, NAEP scores in Math and Reading rose steadily for years — then plateaued and declined in alignment with each state's large-scale digital adoption, not with a single calendar year. This staggered policy adoption design provides strong evidence that the timing of digital lock-in, not external factors, drives the shift.\n\nThe charts below show national NAEP averages aligned to each state's digital inflection point (Year 0). These results cannot be attributed to COVID because Year 0 for every state occurred before the pandemic and 2022 data was excluded entirely. Unlike most \"standardized\" educational assessments that periodically reset their scoring scales, NAEP has remained anchored to its original 1992 scale, meaning these declines reflect genuine losses in student learning, not adjustments to the test.",
    footnote:
      'Note: The national charts utilize a "Year 0" alignment strategy where Year 0 represents the specific year each state reached a threshold of digital device saturation in classrooms. Data via NAEP (National Assessment of Educational Progress).',
  },
  grade4: NAEP_GRADE_4,
  grade8: NAEP_GRADE_8,
  internationalNarrative: {
    heading: "International Research: Screen Time & Academic Performance",
    body:
      "Beyond national trends, a robust body of international research has examined the relationship between digital device use and academic performance. Below are key charts summarizing findings from PISA and OECD data, revealing consistent patterns of negative associations between screen time and student achievement across multiple countries and subjects.",
  },
  pisa: {
    title: PISA_CHART_LABELS.title,
    description: PISA_CHART_LABELS.description,
    callout: PISA_CHART_LABELS.callout,
    math: pisaMath,
    reading: pisaReading,
  },
  oecd: {
    title: "OECD Countries — EdTech Access vs. Math Performance Change",
    subtitle:
      "Countries that invested more in classroom computers showed greater declines in PISA Math scores (2003 vs. 2012). Adjusted association: −0.57.",
    xLabel: "← Fewer Computers                More Computers →",
    yLabel: "Difference in Math Performance (PISA 2012 vs 2003)",
    points: [
      { country: "Turkey", x: 1.3, y: 24 },
      { country: "Mexico", x: 4.8, y: 28 },
      { country: "Greece", x: 5.3, y: 8 },
      { country: "Italy", x: 6.8, y: 19 },
      { country: "Korea", x: 6.0, y: 11 },
      { country: "Luxembourg", x: 6.3, y: -8 },
      { country: "Germany", x: 6.2, y: 10 },
      { country: "Japan", x: 6.5, y: 2 },
      { country: "Switzerland", x: 6.4, y: 4 },
      { country: "Austria", x: 7.3, y: 0 },
      { country: "Netherlands", x: 6.8, y: -15 },
      { country: "Canada", x: 7.1, y: -16 },
      { country: "Belgium", x: 6.9, y: -15 },
      { country: "Ireland", x: 7.7, y: -2 },
      { country: "Spain", x: 8.3, y: -1 },
      { country: "Norway", x: 8.5, y: -6 },
      { country: "United States", x: 7.8, y: -2 },
      { country: "Denmark", x: 7.5, y: -15 },
      { country: "France", x: 7.2, y: -16 },
      { country: "Iceland", x: 6.3, y: -22 },
      { country: "Hungary", x: 9.0, y: -12 },
      { country: "Portugal", x: 7.3, y: 21 },
      { country: "Poland", x: 7.5, y: 28 },
      { country: "Finland", x: 6.9, y: -26 },
      { country: "Sweden", x: 6.5, y: -31 },
      { country: "Slovak Republic", x: 8.8, y: -18 },
      { country: "Czech Republic", x: 8.8, y: -19 },
      { country: "Australia", x: 9.7, y: -20 },
      { country: "New Zealand", x: 9.8, y: -24 },
    ],
    trendLine: [
      { x: 0, y: 36 },
      { x: 11.5, y: -30 },
    ],
  },
  timss: {
    title: "TIMSS: All Countries — In-School Computer Use vs. Math Score",
    description:
      "Students using computers in class scored ~41 points lower in math than those who rarely used them — a drop from the 50th to the 32nd percentile.",
    grade4: {
      title: "4th Grade Math",
      xLabel: "In-School CPU Use",
      yLabel: "Total Score",
      categories: ["Almost Never", "1–2x per Month", "1–2x per Week", "Almost Daily"],
      values: [550, 535, 508, 499],
      yTicks: [480, 510, 540, 560],
      colors: ["#1a3353", "#2d5282", "#4a6fa5", "#7fa3cc"],
    },
    grade8: {
      title: "8th Grade Math",
      xLabel: "In-School CPU Use",
      yLabel: "Total Score",
      categories: ["Almost Never", "1–2x per Month", "1–2x per Week", "Almost Daily"],
      values: [528, 518, 497, 484],
      yTicks: [460, 490, 520, 545],
      colors: ["#1a3353", "#2d5282", "#4a6fa5", "#7fa3cc"],
    },
  },
  pirls: {
    title: "PIRLS: In-School Computer Use vs. Reading Score",
    description:
      "PIRLS (Progress in International Reading Literacy Study) assesses 4th grade reading across dozens of countries every 5 years. Pattern mirrors PISA and TIMSS findings.",
    subtitle: "OECD Countries Only",
    xLabel: "Total Score",
    yLabel: "In-School CPU Use",
    categories: ["Almost Never", "1–2x per Month", "1–2x per Week", "Almost Daily"],
    values: [532, 537, 520, 484],
    yTicks: [480, 510, 540, 560],
    colors: ["#1a3353", "#2d5282", "#4a6fa5", "#7fa3cc"],
  },
  deviceTime: {
    title: "Time on Digital Devices at School & Mathematics Performance",
    description:
      "Based on students' self-reports · OECD average. Learning use declines steadily; leisure use drops sharply after 3 hours.",
    chart: {
      title: "",
      yLabel: "Mean Score in Mathematics",
      xLabel: "Time Spent on Digital Devices at School",
      categories: ["None", "Up to 1 hr", "1–2 hrs", "2–3 hrs", "3–5 hrs", "5–7 hrs", ">7 hrs"],
      yTicks: [360, 410, 460, 510],
      series: [
        {
          label: "Learning",
          color: "#000000",
          values: [455, 481, 478, 479, 477, 465, 459],
          markerShape: "diamond",
        },
        {
          label: "Leisure",
          color: "#ff0404",
          values: [471, 491, 483, 469, 450, 430, 435],
          markerShape: "circle",
        },
      ],
    },
  },
  parcc: {
    title: PARCC_STUDY_TITLE,
    description: PARCC_STUDY_DESCRIPTION_FULL,
    math: buildParccMathChart(),
    ela: buildParccElaChart(),
  },
  screenTime: {
    title: "Early Screen Time & Children's Academic Achievement",
    description:
      "A 15-year prospective study of 5,400+ Canadian children linked daily screen habits in early childhood to official reading, writing, and math test results in Grades 3 and 6.",
    statPills: [
      {
        value: "~9% lower",
        label: "chance of meeting grade level per extra hour/day — Gr.3 Reading & Math",
      },
      {
        value: "~10% lower",
        label: "chance of meeting grade level per extra hour/day — Gr.6 Math",
      },
      {
        value: "~23% lower",
        label: "chance of meeting Gr.3 reading standard — children who play any video games vs. none",
      },
      {
        value: "5,400+",
        label: "children tracked from toddlerhood to elementary school, 2008–2023",
      },
    ],
    howToRead:
      "Each bar shows how much a child's chance of meeting their grade-level standard drops for each extra hour of that screen type per day. A longer bar = a bigger drop. Faded bars mean the result could be due to chance (not a confirmed finding).",
    statisticalNote:
      "Percentage estimates are derived from proportional odds ratios reported in Table 3 of Li et al. (JAMA Network Open, 2025). For interpretive clarity, each odds ratio has been converted to an approximate percentage-point change in the likelihood of meeting grade-level standards (e.g., OR = 0.91 ≈ 9% reduction). This conversion is an approximation; readers are encouraged to consult the original odds ratios, 95% confidence intervals, and p values — available on hover — for precise statistical inference.",
    tabs: {
      total: {
        unit: "per extra hour/day",
        note: "Each extra hour of daily screen time is linked to roughly a 9–10% drop in the chances of children meeting their grade level in Reading and Math (Grade 3) and Math (Grade 6). Writing showed no confirmed effect in either grade. These are confirmed findings — the study ruled out chance as the cause.",
        rows: screenTimeRows([
          { label: "Reading — Grade 3", or: 0.91, pct: 9, ci: "0.86–0.96", p: ".001", sig: true, grade: 3 },
          { label: "Writing — Grade 3", or: 0.94, pct: 6, ci: "0.88–1.01", p: ".08", sig: false, grade: 3 },
          { label: "Math — Grade 3", or: 0.91, pct: 9, ci: "0.86–0.96", p: "<.001", sig: true, grade: 3 },
          { label: "Reading — Grade 6", or: 0.97, pct: 3, ci: "0.90–1.05", p: ".45", sig: false, grade: 6 },
          { label: "Writing — Grade 6", or: 0.96, pct: 4, ci: "0.89–1.03", p: ".21", sig: false, grade: 6 },
          { label: "Math — Grade 6", or: 0.9, pct: 10, ci: "0.84–0.96", p: ".002", sig: true, grade: 6 },
        ]),
      },
      tv: {
        unit: "per extra hour/day",
        note: "TV and digital media time (TV, DVDs, computers, handheld devices — not including video games) shows a similar pattern. Each extra hour per day is linked to a ~9–11% drop in chances of meeting grade level for Grade 3 Reading & Math and Grade 6 Math. No confirmed effect on writing.",
        rows: screenTimeRows([
          { label: "Reading — Grade 3", or: 0.91, pct: 9, ci: "0.85–0.97", p: ".004", sig: true, grade: 3 },
          { label: "Writing — Grade 3", or: 0.93, pct: 7, ci: "0.87–1.01", p: ".08", sig: false, grade: 3 },
          { label: "Math — Grade 3", or: 0.9, pct: 10, ci: "0.85–0.96", p: "<.001", sig: true, grade: 3 },
          { label: "Reading — Grade 6", or: 0.93, pct: 7, ci: "0.86–1.02", p: ".11", sig: false, grade: 6 },
          { label: "Writing — Grade 6", or: 0.94, pct: 6, ci: "0.87–1.02", p: ".12", sig: false, grade: 6 },
          { label: "Math — Grade 6", or: 0.89, pct: 11, ci: "0.82–0.96", p: ".002", sig: true, grade: 6 },
        ]),
      },
      video: {
        unit: "any use vs. none",
        note: "Children who played any video games had a 23% lower chance of meeting the Grade 3 reading standard compared to non-users. This was the only confirmed finding for video games. No confirmed links were found for math or writing in Grade 3, or any subject in Grade 6.",
        rows: screenTimeRows([
          { label: "Reading — Grade 3", or: 0.77, pct: 23, ci: "0.62–0.94", p: ".01", sig: true, grade: 3 },
          { label: "Writing — Grade 3", or: 0.9, pct: 10, ci: "0.67–1.21", p: ".50", sig: false, grade: 3 },
          { label: "Math — Grade 3", or: 0.85, pct: 15, ci: "0.71–1.01", p: ".07", sig: false, grade: 3 },
          { label: "Reading — Grade 6", or: 1.09, pct: -9, ci: "0.86–1.38", p: ".47", sig: false, grade: 6 },
          { label: "Writing — Grade 6", or: 0.95, pct: 5, ci: "0.76–1.18", p: ".64", sig: false, grade: 6 },
          { label: "Math — Grade 6", or: 0.99, pct: 1, ci: "0.81–1.22", p: ".96", sig: false, grade: 6 },
        ]),
      },
    },
  },
  mentalHealth: {
    title: "Adolescent Mental Health Indicators, 2001–2018",
    description:
      "This chart tracks four independent measures of adolescent mental health, suicide, self-poisoning, major depressive episodes, and depressive symptoms, from 2001 to 2018. All four indicators held below the historical average for over a decade, then turned sharply upward around 2012, the same period smartphones became ubiquitous among teenagers and social media platforms like Facebook and Instagram moved from desktop curiosities to pocket-sized constants that followed kids everywhere, including into their bedrooms at night. The synchronized rise across four completely separate data sources is, as the chart notes, the kind of pattern rarely seen outside of major societal change, and the timing points directly at the phone-based, social media-saturated childhood that took hold in the early 2010s and has yet to reverse.",
    callout:
      "All four indicators move from below the historical average pre-2012 to well above it by 2017–2018 — a synchronized shift across independent data sources rarely seen outside of major societal change.",
    series: [
      {
        label: "Suicide",
        color: "#ef4444",
        years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
        values: [-0.72, -0.85, -1.0, -0.13, -0.75, -0.78, -1.15, -0.75, -0.2, -0.27, -0.22, -0.35, 0.97, 1.15, 1.25, 1.75, 1.65],
      },
      {
        label: "Self-poisoning",
        color: "#10b981",
        years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
        values: [-0.53, -0.5, -0.47, -0.4, -0.55, -0.78, -0.85, -0.78, -0.8, -0.88, -0.72, -0.3, 0.25, 1.05, 1.4, 1.42, 1.75, 1.7],
      },
      {
        label: "Major Depressive Episode",
        color: "#1a3353",
        years: [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
        values: [-0.5, -0.92, -0.85, -0.62, -1.02, -0.4, -1.07, -0.35, 0.72, 0.65, 1.62, 1.12, 1.62],
      },
      {
        label: "Depressive Symptoms",
        color: "#3b82f6",
        years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
        values: [-0.97, -0.82, -0.35, -0.25, -0.5, -0.65, -1.25, -0.75, -0.35, -0.53, -0.6, -0.45, 0.25, 1.25, 1.35, 0.93, 1.85, 1.95],
      },
    ],
  },
};
