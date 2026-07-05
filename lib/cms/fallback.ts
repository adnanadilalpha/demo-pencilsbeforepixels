import { createDefaultGoalFindings } from "./goal-section-content";
import { resolvePrivacyPolicyUrl, resolveTermsOfServiceUrl } from "./settings-urls";
import { DEFAULT_SOCIAL_LINKS } from "@/lib/site/social-links";
import { researchChartsData } from "@/lib/research/data";
import {
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
} from "./fallback-data";
import { normalizeMissionTimeline } from "./mission-slides";
import { mergeSiteCacheSettings } from "@/lib/cache/settings";
import type { SiteContent } from "./types";

const FALLBACK_VERSION = "local-fallback";

export function buildFallbackSiteContent(): SiteContent {
  return {
    version: FALLBACK_VERSION,
    publishedAt: new Date().toISOString(),
    assetsRevision: "0",
    cache: mergeSiteCacheSettings(undefined),
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
      socialLinks: DEFAULT_SOCIAL_LINKS.map((link) => ({ ...link })),
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
      "homepage.goal": {
        tagline:
          "Focus over distraction and cognitive friction over swiping.",
        body:
          "Ten findings from national assessments and international studies — grouped so you can follow the story from U.S. classrooms to OECD nations and back to early childhood.",
        findings: createDefaultGoalFindings(),
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
        cta: { label: "View research page", href: "/research" },
      },
      "homepage.research_library": {
        headline: "Research Library",
        body: "Essential reading and viewing for the modern parent.",
        categories: libraryCategories,
      },
      "homepage.before_opt_out": {
        reflectionTitle: "Before You Decide, Ask Yourself:",
        reflectionQuestions: [
          "Do you believe your child will be smarter with more screen time?",
          "Do you believe your child will develop stronger social skills with more screen time?",
          "Do you believe your child will be physically and mentally healthier with more screen time?",
        ],
        reflectionConclusion:
          "If the answer to all three is no — then less screen time, not more, is the direction worth choosing.",
        reflectionCallToAction:
          "You have the right to make that choice for your child. The form below lets you do it.",
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
        socialLinksLabel: "Follow us",
      },
      "evidence.intro": {
        label: "Nebraska in a National Context",
        body: "How does Nebraska's trend compare to the broader national pattern?",
      },
      "evidence.research_tab": {
        title: "Research",
        subtitle:
          "Findings from NAEP, PISA, TIMSS, PIRLS and peer-reviewed research — documenting the relationship between digital device use and academic performance across the United States and internationally.",
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
    },
    expertQuotes: expertQuotes.map((q) => ({ ...q })),
    timeline: normalizeMissionTimeline(timelineSlides.map((s) => ({ ...s }))),
    libraryCategories: [...libraryCategories],
    libraryContent: {
      Books: libraryContent.Books.map((i) => ({ ...i })),
      "Walled Garden": libraryContent["Walled Garden"].map((i) => ({ ...i })),
      "Research Papers": libraryContent["Research Papers"].map((i) => ({ ...i })),
      Videos: libraryContent.Videos.map((i) => ({ ...i })),
      "Parent Resources": libraryContent["Parent Resources"].map((i) => ({
        ...i,
      })),
    },
    mentalHealthPoints: [...mentalHealthPoints],
    mentalHealthLegend: mentalHealthLegend.map((l) => ({ ...l })),
    optOutSteps: optOutSteps.map((s) => ({ ...s })),
    softwareReviews: {
      epic: {
        slug: "epic",
        title: epicReviewContent.title,
        summary: epicReviewContent.summary,
        youtubeId: "https://www.youtube.com/watch?v=iybQw1jlPEs",
        audioSrc: epicReviewContent.audioSrc,
        audioTitle: epicReviewContent.audioTitle,
        audioDescription: epicReviewContent.audioDescription,
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
  };
}
