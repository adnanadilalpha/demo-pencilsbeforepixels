import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import {
  TermsOfServiceContent,
  termsToc,
} from "@/components/legal/TermsOfServiceContent";
import { PageFrame } from "@/components/ui/Container";
import { LEGAL_DATES } from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Terms of Service | Pencils Before Pixels",
  description:
    "Terms governing your use of the Pencils Before Pixels website and educational resources.",
};

export default function TermsOfServicePage() {
  const dates = LEGAL_DATES.terms;

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-paper-50">
      <Header />
      <main className="flex-1 overflow-x-clip bg-paper-50 pt-(--header-height)">
        <PageFrame className="pb-16 sm:pb-20 lg:pb-24">
          <LegalDocumentPage
            title="Terms of Service"
            intro="These terms govern your use of the Pencils Before Pixels website and resources."
            lastUpdated={dates.lastUpdated}
            effectiveDate={dates.effectiveDate}
            toc={termsToc}
          >
            <TermsOfServiceContent />
          </LegalDocumentPage>
        </PageFrame>
      </main>
      <Footer />
    </div>
  );
}
