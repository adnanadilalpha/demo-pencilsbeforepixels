import type { ReactNode } from "react";

export type LegalTocItem = {
  id: string;
  label: string;
};

export type LegalDocumentProps = {
  title: string;
  intro: string;
  lastUpdated: string;
  effectiveDate: string;
  toc: LegalTocItem[];
  children: ReactNode;
};

export const LEGAL_DATES = {
  privacy: {
    lastUpdated: "July 2, 2026",
    effectiveDate: "July 2, 2026",
  },
  terms: {
    lastUpdated: "July 2, 2026",
    effectiveDate: "July 2, 2026",
  },
} as const;

export const LEGAL_CONTACT = {
  email: "hello@pencilsbeforepixels.org",
  website: "https://pencilsbeforepixels.org",
} as const;

export function isFixedHeaderRoute(pathname: string) {
  return (
    pathname.startsWith("/evidence") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms")
  );
}
