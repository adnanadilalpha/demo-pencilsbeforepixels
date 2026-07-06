"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { OptOutLetterModal } from "@/components/opt-out/OptOutLetterModal";
import { ANALYTICS_EVENTS } from "@/lib/analytics/event-types";
import { trackAnalyticsEvent } from "@/lib/analytics/track-client";

type OptOutContextValue = {
  openOptOut: (source?: string) => void;
  closeOptOut: () => void;
  isOpen: boolean;
};

const OptOutContext = createContext<OptOutContextValue | null>(null);

export function OptOutProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openOptOut = useCallback((source?: string) => {
    void trackAnalyticsEvent(ANALYTICS_EVENTS.OPT_OUT_OPEN, {
      label: source,
      metadata: source ? { source } : undefined,
    });
    setIsOpen(true);
  }, []);

  const closeOptOut = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      openOptOut,
      closeOptOut,
      isOpen,
    }),
    [closeOptOut, isOpen, openOptOut],
  );

  return (
    <OptOutContext.Provider value={value}>
      {children}
      <OptOutLetterModal open={isOpen} onClose={closeOptOut} />
    </OptOutContext.Provider>
  );
}

export function useOptOut() {
  const context = useContext(OptOutContext);
  if (!context) {
    throw new Error("useOptOut must be used within OptOutProvider");
  }
  return context;
}
