import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import {
  PrivacyPolicyContent,
  privacyToc,
} from "@/components/legal/PrivacyPolicyContent";
import { PageFrame } from "@/components/ui/Container";
import { LEGAL_DATES } from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Privacy Policy | Pencils Before Pixels",
  description:
    "Learn what information Pencils Before Pixels collects, why we collect it, and how we use it.",
};

export default function PrivacyPolicyPage() {
  const dates = LEGAL_DATES.privacy;

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-paper-50">
      <Header />
      <main className="flex-1 overflow-x-clip bg-paper-50 pt-(--header-height)">
        <PageFrame className="pb-16 sm:pb-20 lg:pb-24">
          <LegalDocumentPage
            title="Privacy Policy"
            intro="Your privacy matters. This page explains what information we collect, why we collect it, and how we use it."
            lastUpdated={dates.lastUpdated}
            effectiveDate={dates.effectiveDate}
            toc={privacyToc}
          >
            <PrivacyPolicyContent />
          </LegalDocumentPage>
        </PageFrame>
      </main>
      <Footer />
    </div>
  );
}
