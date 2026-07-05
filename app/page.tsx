import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HomeScrollExperience } from "@/components/motion/HomeScrollExperience";
import { BeforeOptOutSection } from "@/components/sections/BeforeOptOutSection";
import { DeviceOptOutSection } from "@/components/sections/DeviceOptOutSection";
import { ExpertQuotesSection } from "@/components/sections/ExpertQuotesSection";
import { GoalSection } from "@/components/sections/GoalSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { LearningAppsSection } from "@/components/sections/LearningAppsSection";
import { MentalHealthSection } from "@/components/sections/MentalHealthSection";
import { ResearchLibrarySection } from "@/components/sections/ResearchLibrarySection";
import { TimelineSection } from "@/components/sections/TimelineSection";

export default function Home() {
  return (
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
        <Footer />
      </main>
    </HomeScrollExperience>
  );
}
