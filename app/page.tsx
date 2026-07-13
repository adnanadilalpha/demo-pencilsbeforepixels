import dynamic from "next/dynamic";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HomeScrollExperience } from "@/components/motion/HomeScrollExperience";
import { JsonLd } from "@/components/seo/JsonLd";
import { HeroSection } from "@/components/sections/HeroSection";
import { getSiteContent } from "@/lib/cms/cached";
import { stripRichTextToPlain } from "@/lib/cms/rich-text";
import { buildWebPageJsonLd } from "@/lib/seo/json-ld";

const TimelineSection = dynamic(
  () =>
    import("@/components/sections/TimelineSection").then((m) => m.TimelineSection),
);
const GoalSection = dynamic(() =>
  import("@/components/sections/GoalSection").then((m) => m.GoalSection),
);
const LearningAppsSection = dynamic(() =>
  import("@/components/sections/LearningAppsSection").then(
    (m) => m.LearningAppsSection,
  ),
);
const ExpertQuotesSection = dynamic(() =>
  import("@/components/sections/ExpertQuotesSection").then(
    (m) => m.ExpertQuotesSection,
  ),
);
const MentalHealthSection = dynamic(() =>
  import("@/components/sections/MentalHealthSection").then(
    (m) => m.MentalHealthSection,
  ),
);
const ResearchLibrarySection = dynamic(() =>
  import("@/components/sections/ResearchLibrarySection").then(
    (m) => m.ResearchLibrarySection,
  ),
);
const BeforeOptOutSection = dynamic(() =>
  import("@/components/sections/BeforeOptOutSection").then(
    (m) => m.BeforeOptOutSection,
  ),
);
const DeviceOptOutSection = dynamic(() =>
  import("@/components/sections/DeviceOptOutSection").then(
    (m) => m.DeviceOptOutSection,
  ),
);
const ParentExperienceSection = dynamic(() =>
  import("@/components/sections/ParentExperienceSection").then(
    (m) => m.ParentExperienceSection,
  ),
);
const HowCanIHelpSection = dynamic(() =>
  import("@/components/sections/HowCanIHelpSection").then(
    (m) => m.HowCanIHelpSection,
  ),
);

export default async function Home() {
  const content = await getSiteContent();
  const siteName = content.settings.siteName?.trim() || "Pencils Before Pixels";
  const title = content.settings.metaTitle?.trim() || siteName;
  const description =
    stripRichTextToPlain(
      content.settings.metaDescription?.trim() ||
        content.settings.description ||
        "",
    ) ||
    "Evidence-based resources helping parents understand learning in today's classrooms.";

  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd({
          name: title,
          description,
          path: "/",
        })}
      />
      <HomeScrollExperience>
        <Header />
        <main className="flex w-full max-w-full flex-col overflow-x-clip bg-paper-50">
          <HeroSection />
          <TimelineSection />
          <GoalSection />
          <LearningAppsSection />
          <ExpertQuotesSection />
          <MentalHealthSection />
          <ResearchLibrarySection />
          <BeforeOptOutSection />
          <DeviceOptOutSection />
          <ParentExperienceSection />
          <HowCanIHelpSection />
          <Footer />
        </main>
      </HomeScrollExperience>
    </>
  );
}
