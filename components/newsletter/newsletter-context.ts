"use client";

import { createContext, useContext } from "react";

export type NewsletterSource =
  | "hero"
  | "header"
  | "mobile-nav"
  | "footer"
  | "modal-reopen";

export type OpenOptions = {
  source?: NewsletterSource;
  email?: string;
};

export type NewsletterContextValue = {
  openNewsletter: (options?: OpenOptions) => void;
  closeNewsletter: () => void;
  isOpen: boolean;
};

export const NewsletterContext = createContext<NewsletterContextValue | null>(
  null,
);

export function useNewsletter() {
  const context = useContext(NewsletterContext);
  if (!context) {
    throw new Error("useNewsletter must be used within NewsletterProvider");
  }
  return context;
}
