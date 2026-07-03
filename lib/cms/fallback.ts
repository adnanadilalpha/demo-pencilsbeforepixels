import { resolvePrivacyPolicyUrl, resolveTermsOfServiceUrl } from "./settings-urls";
import { staticAcademicDatasets } from "@/lib/academic-data/static";
import { researchChartsData } from "@/lib/research/data";
import {
  academicDatasets,
  epicReviewContent,
  expertQuotes,
  footerLinks,
  ixlReviewContent,
  libraryCategories,
  libraryContent,
  LOCAL_ASSETS,
  mentalHealthLegend,
  mentalHealthPoints,
  navLinks,
  optOutSteps,
  timelineSlides,
  whatToDoPoints,
} from "./fallback-data";
import { normalizeMissionTimeline } from "./mission-slides";
import type { SiteContent } from "./types";

const FALLBACK_VERSION = "local-fallback";

export function buildFallbackSiteContent(): SiteContent {
  return {
    version: FALLBACK_VERSION,
    publishedAt: new Date().toISOString(),
    settings: {
      siteName: "Pencils Before Pixels",
      description:
        "Evidence-based resources helping parents understand learning in today's classrooms.",
      metaTitle: "Pencils Before Pixels",
      metaDescription:
        "Evidence-based resources helping parents understand learning in today's classrooms.",
      footerTagline: "",
      faviconUrl: "",
      privacyPolicyUrl: resolvePrivacyPolicyUrl("/privacy"),
      termsOfServiceUrl: resolveTermsOfServiceUrl("/terms"),
      copyright:
        "© 2026 Pencils Before Pixels. A Research-Driven Editorial for District 66 Parents.",
    },
    media: {
      hero: { background: LOCAL_ASSETS.hero.background },
      brand: { ...LOCAL_ASSETS.brand },
      icons: { ...LOCAL_ASSETS.icons },
      charts: { ...LOCAL_ASSETS.charts },
      optOut: { ...LOCAL_ASSETS.optOut },
    },
    navigation: {
      header: navLinks.map((link) => ({ ...link })),
      footer: footerLinks.map((link) => ({ ...link })),
    },
    sections: {
      "homepage.hero": {
        eyebrow: "Evidence Based Resources",
        headline: "Every Child Deserves More Than a Screen.",
        body: "Learning is built through reading, writing, conversation, curiosity and hands on experiences. Explore research, local education data and practical resources that help parents better understand learning in today's classrooms.",
        primaryCta: "Join Newsletter",
        secondaryCta: { label: "Explore Nebraska Data", href: "/evidence" },
        backgroundImage: LOCAL_ASSETS.hero.background,
        backgroundAlt: "Children writing in a classroom",
      },
      "homepage.problem": {
        label: "The Problem",
        headline: "The Classroom Has Changed.",
        body: "Instinctively, many parents and teachers feel something has changed. Children struggle to focus, teachers are increasingly overwhelmed and academic performance continues to decline. Over the past fifteen years, classrooms have rapidly transitioned to one to one digital devices while researchers have continued studying their impact on learning.",
      },
      "homepage.goal": {
        label: "The Evidence",
        tagline:
          "From NAEP to PISA, the pattern is consistent — more classroom screen time, weaker outcomes.",
        points: [...whatToDoPoints],
      },
      "homepage.academic_data": {
        label: "Academic Data",
        headline: "Academic Data",
        body: "Explore international, national, state and district data through interactive charts and supporting research.",
        datasets: academicDatasets,
      },
      "homepage.learning_apps": {
        headline: "Epic Reading Platform",
        body: "A closer look at how Epic works, what behaviours it encourages, and how it compares with current research on reading comprehension and screen-based learning.",
      },
      "homepage.expert_voices": {
        headline: "What the Expert says",
      },
      "homepage.mental_health": {
        label: "Behaviour & Mental Health",
        headline: "Behaviour & Mental Health",
        body: "Researchers continue to study how increased screen exposure may influence attention, behaviour and emotional wellbeing.",
        points: mentalHealthPoints,
        legend: mentalHealthLegend,
        cta: { label: "Explore Nebraska Data", href: "/evidence" },
      },
      "homepage.research_library": {
        headline: "Research Library",
        body: "Essential reading and viewing for the modern parent.",
        categories: libraryCategories,
      },
      "homepage.device_opt_out": {
        headline: "1 to 1 Device Opt Out",
        body: "Parents should have access to clear information and the ability to make informed decisions regarding classroom technology.",
        primaryCta: "Sign Opt Out Letter",
        secondaryCta: { label: "Explore Nebraska Data", href: "/evidence" },
      },
      "homepage.footer": {
        newsletterLabel: "Newsletter",
        newsletterPlaceholder: "Enter your email",
        newsletterCta: "Join Newsletter",
      },
      "evidence.intro": {
        label: "Nebraska in a National Context",
        body: "How does Nebraska's trend compare to the broader national pattern?",
      },
      "evidence.nebraska": {
        title: "Nebraska",
        subtitle:
          "Average scale score trends by district, grade, and student group",
      },
      "evidence.district_66": {
        title: "District 66",
        tagline: "WESTSIDE COMMUNITY SCHOOLS",
        subtitle:
          "Westside Community Schools performance trends by grade and student group",
        viewDescription:
          "Compare individual school trends against district and state averages over time.",
      },
      "evidence.research_tab": {
        title: "Research Charts",
        subtitle:
          "Findings from NAEP, PISA, TIMSS, PIRLS and peer-reviewed research — documenting the relationship between digital device use and academic performance across the United States and internationally.",
      },
    },
    expertQuotes: expertQuotes.map((q) => ({ ...q })),
    timeline: normalizeMissionTimeline(timelineSlides.map((s) => ({ ...s }))),
    libraryCategories: [...libraryCategories],
    libraryContent: {
      Books: libraryContent.Books.map((i) => ({ ...i })),
      "Research Papers": libraryContent["Research Papers"].map((i) => ({ ...i })),
      Videos: libraryContent.Videos.map((i) => ({ ...i })),
      "Parent Resources": libraryContent["Parent Resources"].map((i) => ({
        ...i,
      })),
    },
    mentalHealthPoints: [...mentalHealthPoints],
    mentalHealthLegend: mentalHealthLegend.map((l) => ({ ...l })),
    academicDatasets: [...academicDatasets],
    optOutSteps: optOutSteps.map((s) => ({ ...s })),
    softwareReviews: {
      epic: {
        slug: "epic",
        title: epicReviewContent.title,
        summary: epicReviewContent.summary,
        youtubeId: "https://www.youtube.com/watch?v=iybQw1jlPEs",
        audioSrc: epicReviewContent.audioSrc,
      },
      ixl: {
        slug: "ixl",
        title: ixlReviewContent.title,
        vendorResearch: ixlReviewContent.vendorResearch,
        independentResearch: ixlReviewContent.independentResearch,
        referencesNote: ixlReviewContent.referencesNote,
      },
    },
    research: researchChartsData,
    academicStatic: staticAcademicDatasets.map((d) => ({ ...d })),
  };
}
