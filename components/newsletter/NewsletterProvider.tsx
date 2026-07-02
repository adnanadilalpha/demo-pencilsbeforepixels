"use client";

import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NewsletterModal } from "@/components/newsletter/NewsletterModal";
import {
  NewsletterContext,
  type NewsletterSource,
  type OpenOptions,
} from "@/components/newsletter/newsletter-context";

export function NewsletterProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<NewsletterSource | undefined>();
  const [prefillEmail, setPrefillEmail] = useState("");

  const openNewsletter = useCallback((options?: OpenOptions) => {
    setSource(options?.source);
    setPrefillEmail(options?.email ?? "");
    setIsOpen(true);
  }, []);

  const closeNewsletter = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      openNewsletter,
      closeNewsletter,
      isOpen,
    }),
    [closeNewsletter, isOpen, openNewsletter],
  );

  return (
    <NewsletterContext.Provider value={value}>
      {children}
      <NewsletterModal
        open={isOpen}
        source={source}
        prefillEmail={prefillEmail}
        onClose={closeNewsletter}
      />
    </NewsletterContext.Provider>
  );
}
