"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/Button";
import { useNewsletter } from "@/components/newsletter/newsletter-context";

type NewsletterTriggerProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  source: "hero" | "header" | "mobile-nav" | "academic-data" | "footer";
  onTriggered?: () => void;
};

export function NewsletterTrigger({
  source,
  onTriggered,
  ...props
}: NewsletterTriggerProps) {
  const { openNewsletter } = useNewsletter();

  return (
    <Button
      {...props}
      onClick={() => {
        openNewsletter({ source });
        onTriggered?.();
      }}
    />
  );
}
