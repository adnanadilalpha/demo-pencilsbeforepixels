"use client";

import { useEffect, useState } from "react";
import {
  hasNewsletterSubscription,
  isValidEmail,
  newsletterCopy,
  subscribeToNewsletter,
} from "@/lib/newsletter";
import { cn } from "@/lib/utils";

type Phase = "idle" | "submitting" | "success";

export function NewsletterFooterForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (hasNewsletterSubscription()) {
      setPhase("success");
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (!isValidEmail(email)) {
      setError("Enter a valid email to continue.");
      return;
    }

    setPhase("submitting");

    try {
      const result = await subscribeToNewsletter(email, "footer");

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

  if (phase === "success") {
    return (
      <p className="text-sm leading-snug text-navy-800/80">
        {newsletterCopy.success}
      </p>
    );
  }

  return (
    <form className="flex w-full min-w-0 flex-col gap-2" onSubmit={handleSubmit}>
      <div className="flex w-full min-w-0 items-center gap-3">
        <input
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (info) setInfo("");
          }}
          placeholder="Enter your email"
          disabled={phase === "submitting"}
          className={cn(
            "newsletter-input h-11 min-h-11 min-w-0 flex-1 rounded-full border border-navy-400/80 bg-white px-4 text-base leading-normal text-navy-800 outline-none placeholder:text-navy-800/50 disabled:opacity-60",
            error && "border-red-600/70",
          )}
          aria-invalid={Boolean(error)}
        />
        <button
          type="submit"
          disabled={phase === "submitting"}
          className="btn-animated btn-light inline-flex h-11 min-h-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d8e0ee] bg-navy-50 px-4 text-sm font-medium leading-none text-hero-dark whitespace-nowrap disabled:opacity-60 sm:min-w-[148px] sm:px-5"
        >
          <span className="btn-animated-shimmer pointer-events-none" aria-hidden />
          <span className="btn-animated-label relative z-1">
            {phase === "submitting" ? "Subscribing…" : "Join Newsletter"}
          </span>
        </button>
      </div>
      {info ? (
        <p className="text-sm leading-snug text-navy-800/80" role="status">
          {info}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
