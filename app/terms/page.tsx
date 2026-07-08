import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import {
  TermsOfServiceContent,
  termsToc,
} from "@/components/legal/TermsOfServiceContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageFrame } from "@/components/ui/Container";
import { LEGAL_DATES } from "@/lib/legal/constants";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

const TITLE = "Terms of Service";
const DESCRIPTION =
  "Terms governing your use of the Pencils Before Pixels website and educational resources.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/terms",
});

export default function TermsOfServicePage() {
  const dates = LEGAL_DATES.terms;

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-paper-50">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: "/terms",
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: TITLE, path: "/terms" },
          ]),
        ]}
      />
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
