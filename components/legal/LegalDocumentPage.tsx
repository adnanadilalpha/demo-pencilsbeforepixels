import { BackToTopButton } from "@/components/legal/BackToTopButton";
import { LegalTableOfContents } from "@/components/legal/LegalTableOfContents";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { LegalDocumentProps } from "@/lib/legal/constants";

export function LegalDocumentPage({
  title,
  intro,
  lastUpdated,
  effectiveDate,
  toc,
  children,
}: LegalDocumentProps) {
  return (
    <>
      <div className="border-b border-paper-300 bg-paper-50 pb-10 pt-4 sm:pb-12 lg:pb-14">
        <div className="mx-auto w-full max-w-[760px]">
          <SectionLabel className="mb-4 tracking-[0.25em]">Legal</SectionLabel>
          <DisplayHeading as="h1" size="md" className="text-navy-800">
            {title}
          </DisplayHeading>
          <p className="mt-4 max-w-[640px] text-base leading-[1.65] text-body-muted sm:text-lg">
            {intro}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center rounded-full bg-paper-200 px-3.5 py-1.5 text-sm leading-none text-navy-800">
              <span className="mr-2 text-body-muted">Last updated</span>
              {lastUpdated}
            </span>
            <span className="inline-flex items-center rounded-full bg-paper-200 px-3.5 py-1.5 text-sm leading-none text-navy-800">
              <span className="mr-2 text-body-muted">Effective</span>
              {effectiveDate}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1120px] py-10 sm:py-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,760px)] lg:gap-16 xl:grid-cols-[240px_minmax(0,760px)]">
          <aside className="lg:sticky lg:top-28 lg:self-start xl:top-32">
            <LegalTableOfContents items={toc} />
          </aside>

          <article className="min-w-0 flex flex-col gap-10 lg:gap-12">
            {children}
          </article>
        </div>
      </div>

      <BackToTopButton />
    </>
  );
}
