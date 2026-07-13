"use client";

import { RichTextContent } from "@/components/cms/RichTextContent";
import { RICH_TEXT_LINKS_LIGHT_CLASS } from "@/lib/cms/rich-text";
import { ContentImage } from "@/components/ui/ContentImage";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { useOptOut } from "@/components/opt-out/OptOutProvider";
import { NewsletterTrigger } from "@/components/newsletter/NewsletterTrigger";
import { Button } from "@/components/ui/Button";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";
import { sectionPaddingX } from "@/components/ui/Container";
import { useSection, useSiteContent } from "@/lib/cms/hooks";
import { prefersReducedMotion } from "@/lib/motion";

function isOptOutCta(label: string): boolean {
  return /opt[-\s]?out/i.test(label);
}

export function HeroSection() {
  const { media } = useSiteContent();
  const section = useSection("homepage.hero");
  const { openOptOut } = useOptOut();
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  const eyebrow = (section.eyebrow as string) ?? "Evidence Based Resources";
  const headline =
    (section.headline as string) ?? "Every Child Deserves More Than a Screen.";
  const body =
    (section.body as string) ??
    "Learning is built through reading, writing, conversation, curiosity and hands on experiences.";
  const primaryCta = (section.primaryCta as string) ?? "Join Newsletter";
  const heroOpensOptOut = isOptOutCta(primaryCta);
  const backgroundImage =
    (section.backgroundImage as string) ?? media.hero.background;
  const backgroundAlt =
    (section.backgroundAlt as string) ?? "Children writing in a classroom";

  useEffect(() => {
    if (prefersReducedMotion()) {
      setEntered(true);
      return;
    }

    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useLenis(({ scroll }) => {
    const image = imageRef.current;
    const content = contentRef.current;
    if (!image && !content) return;

    const heroHeight = sectionRef.current?.offsetHeight ?? window.innerHeight;
    const progress = Math.min(1, scroll / heroHeight);

    if (image) {
      image.style.transform = `scale(${1.1 + progress * 0.04}) translateY(${scroll * 0.22}px)`;
    }

    if (content) {
      content.style.opacity = `${1 - progress * 0.55}`;
      content.style.transform = `translateY(${scroll * 0.12}px)`;
    }
  });

  return (
    <section
      ref={sectionRef}
      className={`relative w-full overflow-x-clip ${RICH_TEXT_LINKS_LIGHT_CLASS}`}
    >
      <div className="relative flex h-dvh min-h-dvh w-full max-w-full flex-col overflow-hidden">
        <div ref={imageRef} className="absolute inset-0 overflow-hidden will-change-transform">
          <ContentImage
            src={backgroundImage}
            alt={backgroundAlt}
            fill
            priority
            quality={75}
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_100%_120%_at_50%_0%,rgba(0,0,0,0)_40%,rgba(10,22,40,0.6)_100%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-hero-dark from-0% via-hero-dark/55 via-35% to-transparent to-60%"
          aria-hidden
        />

        <div
          ref={contentRef}
          className={`relative z-10 mt-auto flex w-full flex-col gap-6 pb-[max(3rem,env(safe-area-inset-bottom))] will-change-[opacity,transform] max-lg:gap-5 lg:gap-8 lg:pb-16 ${sectionPaddingX}`}
        >
          <div
            className={`flex items-center gap-3 ${entered ? "hero-enter" : "opacity-0"}`}
            style={{ animationDelay: "0.05s" }}
          >
            <span className="h-0.5 w-8 shrink-0 bg-gold-500" aria-hidden />
            <p className="text-base font-semibold uppercase tracking-[0.18em] text-gold-500 max-lg:tracking-[0.14em] lg:text-base">
              <RichTextContent content={eyebrow} inline linkTone="light" />
            </p>
          </div>

          <div className="flex w-full flex-col gap-4 lg:w-[67%]">
            <h1
              className={`text-fluid-display-xl font-display leading-display text-white lg:text-[64px] ${
                entered ? "hero-enter" : "opacity-0"
              }`}
              style={{ animationDelay: "0.15s" }}
            >
              <RichTextContent content={headline} inline linkTone="light" />
            </h1>
            <div
              className={entered ? "hero-enter" : "opacity-0"}
              style={{ animationDelay: "0.28s" }}
            >
              <RichTextContent
                content={body}
                linkTone="light"
                className="text-base leading-[1.4] text-slate-50/80 sm:text-lg lg:w-[90%]"
              />
            </div>
          </div>

          <div
            className={entered ? "hero-enter" : "opacity-0"}
            style={{ animationDelay: "0.4s" }}
          >
            {heroOpensOptOut ? (
              <Button onClick={() => openOptOut("hero")}>{primaryCta}</Button>
            ) : (
              <NewsletterTrigger source="hero">{primaryCta}</NewsletterTrigger>
            )}
          </div>
        </div>

        <ScrollIndicator />
      </div>
    </section>
  );
}
