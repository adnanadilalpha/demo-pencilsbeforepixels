"use client";

import type { ReactNode } from "react";
import { SiteContentProvider } from "@/lib/cms/provider";
import { NewsletterProvider } from "@/components/newsletter/NewsletterProvider";
import { OptOutProvider } from "@/components/opt-out/OptOutProvider";
import type { SiteContent } from "@/lib/cms/types";

type AppProvidersProps = {
  initialContent: SiteContent;
  children: ReactNode;
};

export function AppProviders({ initialContent, children }: AppProvidersProps) {
  return (
    <SiteContentProvider initialContent={initialContent}>
      <NewsletterProvider>
        <OptOutProvider>{children}</OptOutProvider>
      </NewsletterProvider>
    </SiteContentProvider>
  );
}
