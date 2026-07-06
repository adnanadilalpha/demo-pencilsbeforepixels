import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { EvidenceExplorer } from "@/components/evidence/EvidenceExplorer";
import { PageFrame, sectionPaddingX } from "@/components/ui/Container";
import { getEvidenceBootstrap } from "@/lib/evidence/cached";

export const metadata: Metadata = {
  title: "Nebraska Data",
};

export default async function EvidencePage() {
  const bootstrap = await getEvidenceBootstrap();

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-paper-50">
      <Header />
      <main className="flex-1 overflow-x-clip bg-paper-50 pt-(--header-height)">
        <PageFrame paddingX={sectionPaddingX} className="py-8 sm:py-10 lg:py-12">
          <EvidenceExplorer bootstrap={bootstrap} />
        </PageFrame>
      </main>
      <Footer paddingX={sectionPaddingX} />
    </div>
  );
}
