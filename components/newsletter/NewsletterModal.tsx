"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/motion";
import {
  lockBodyScroll,
  modalInputClass,
  shouldAutofocusModalField,
  unlockBodyScroll,
} from "@/lib/modal/body-scroll-lock";
import {
  hasNewsletterSubscription,
  newsletterCopy,
  subscribeToNewsletter,
} from "@/lib/newsletter";

type NewsletterModalProps = {
  open: boolean;
  onClose: () => void;
  source?: string;
  prefillEmail?: string;
};

type Phase = "idle" | "submitting" | "success";

export function NewsletterModal({
  open,
  onClose,
  source,
  prefillEmail = "",
}: NewsletterModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      const timer = window.setTimeout(() => {
        setPhase(hasNewsletterSubscription() ? "success" : "idle");
        setError("");
        setInfo("");
      }, 200);
      return () => window.clearTimeout(timer);
    }

    setEmail(prefillEmail);
    setError("");
    setInfo("");
    const alreadySubscribed = hasNewsletterSubscription();
    setPhase(alreadySubscribed ? "success" : "idle");

    const reduced = prefersReducedMotion();
    const enterFrame = window.requestAnimationFrame(() => setVisible(true));

    const focusTimer = window.setTimeout(() => {
      if (!alreadySubscribed && shouldAutofocusModalField()) {
        inputRef.current?.focus();
      }
    }, reduced ? 0 : 200);

    lockBodyScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(enterFrame);
      window.clearTimeout(focusTimer);
      unlockBodyScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open, prefillEmail]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setPhase("submitting");

    try {
      const result = await subscribeToNewsletter(email, source);

      if (result.status === "already_subscribed") {
        setPhase("idle");
        setInfo(newsletterCopy.alreadySubscribed);
        return;
      }

      setPhase("success");
    } catch (submitError) {
      setPhase("idle");
      setError(
        submitError instanceof Error
          ? submitError.message
          : newsletterCopy.genericError,
      );
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "absolute inset-0 bg-navy-800/40 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={phase === "success" ? descId : undefined}
        tabIndex={-1}
        data-lenis-prevent
        className={cn(
          "relative w-full max-w-md rounded-lg border border-navy-800/15 bg-paper-50 shadow-lg outline-none transition-all duration-200",
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-navy-800/50 transition-colors hover:text-navy-800"
          aria-label="Close"
        >
          <span className="text-xl leading-none">×</span>
        </button>

        <div className="p-6 sm:p-8">
          {phase === "success" ? (
            <div className="flex flex-col gap-5 pr-6">
              <div className="flex flex-col gap-2">
                <h2 id={titleId} className="text-lg font-semibold text-navy-800">
                  {newsletterCopy.successTitle}
                </h2>
                <p id={descId} className="text-sm leading-relaxed text-navy-800/70">
                  {newsletterCopy.successBody}
                </p>
              </div>

              <Button variant="light" className="w-full" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="pr-6">
                <h2 id={titleId} className="text-lg font-semibold text-navy-800">
                  Registration
                </h2>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="newsletter-email" className="text-sm text-navy-800/80">
                  Email
                </label>
                <input
                  ref={inputRef}
                  id="newsletter-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (info) setInfo("");
                  }}
                  placeholder="you@example.com"
                  className={cn(modalInputClass, "h-11")}
                />
                {info ? (
                  <p className="text-sm leading-relaxed text-navy-800/70" role="status">
                    {info}
                  </p>
                ) : null}
                {error ? (
                  <p className="text-sm text-red-700" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>

              <Button type="submit" className="w-full" disabled={phase === "submitting"}>
                {phase === "submitting" ? "Subscribing…" : "Subscribe"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
