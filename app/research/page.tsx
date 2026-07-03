import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ResearchPage } from "@/components/research/ResearchPage";
import { sectionPaddingX } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Research",
};

export default function ResearchRoutePage() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-paper-50">
      <Header />
      <main className="flex-1 overflow-x-clip bg-paper-50 pt-(--header-height)">
        <ResearchPage />
      </main>
      <Footer paddingX={sectionPaddingX} />
    </div>
  );
}
