import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HomeScrollExperience } from "@/components/motion/HomeScrollExperience";
import { JsonLd } from "@/components/seo/JsonLd";
import { BeforeOptOutSection } from "@/components/sections/BeforeOptOutSection";
import { DeviceOptOutSection } from "@/components/sections/DeviceOptOutSection";
import { HowCanIHelpSection } from "@/components/sections/HowCanIHelpSection";
import { ExpertQuotesSection } from "@/components/sections/ExpertQuotesSection";
import { GoalSection } from "@/components/sections/GoalSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { LearningAppsSection } from "@/components/sections/LearningAppsSection";
import { MentalHealthSection } from "@/components/sections/MentalHealthSection";
import { ResearchLibrarySection } from "@/components/sections/ResearchLibrarySection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { getSiteContent } from "@/lib/cms/cached";
import { stripRichTextToPlain } from "@/lib/cms/rich-text";
import { buildWebPageJsonLd } from "@/lib/seo/json-ld";

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
          <HowCanIHelpSection />
          <Footer />
        </main>
      </HomeScrollExperience>
    </>
  );
}
