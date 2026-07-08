"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  FileSignature,
  Mail,
  Megaphone,
  Share2,
  type LucideIcon,
} from "lucide-react";
import { RichTextContent } from "@/components/cms/RichTextContent";
import { useOptOut } from "@/components/opt-out/OptOutProvider";
import { Button } from "@/components/ui/Button";
import { ContentImage } from "@/components/ui/ContentImage";
import { Container, sectionSubtextClass } from "@/components/ui/Container";
import { DisplayHeading } from "@/components/ui/DisplayHeading";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ANALYTICS_EVENTS } from "@/lib/analytics/event-types";
import { trackAnalyticsEvent } from "@/lib/analytics/track-client";
import {
  DEFAULT_SHARE_CARD_IMAGE,
  normalizeHowCanIHelpContent,
  type HowCanIHelpItem,
  type HowCanIHelpKind,
} from "@/lib/cms/how-can-i-help-content";
import { useSection } from "@/lib/cms/hooks";
import { parseNavHref } from "@/lib/navigation";

const FALLBACK_SHARE_URL = "https://pencilsbeforepixels.org";
const SHARE_MESSAGE =
  "Every child deserves more than a screen. Explore the research and resources at Pencils Before Pixels.";

const KIND_META: Record<
  HowCanIHelpKind,
  { icon: LucideIcon; eyebrowFallback: string }
> = {
  share: { icon: Share2, eyebrowFallback: "Spread the word" },
  speak: { icon: Megaphone, eyebrowFallback: "Use your voice" },
  attend: { icon: CalendarDays, eyebrowFallback: "Save the date" },
  opt_out: { icon: FileSignature, eyebrowFallback: "Make it official" },
};

function normalizeShareUrl(raw?: string) {
  const value = raw?.trim();
  if (!value) return FALLBACK_SHARE_URL;
  if (/^https?:\/\//.test(value)) return value;
  return `https://${value.replace(/^\/+/, "")}`;
}

function trackShare(channel: string) {
  void trackAnalyticsEvent(ANALYTICS_EVENTS.CTA_CLICK, {
    label: `share:${channel}`,
    metadata: { section: "how-can-i-help" },
  });
}

function HighlightChips({
  highlights,
  tone,
}: {
  highlights: string[];
  tone: "light" | "dark";
}) {
  if (highlights.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {highlights.map((highlight) => (
        <li
          key={highlight}
          className={
            tone === "dark"
              ? "rounded-full bg-white/10 px-3 py-1 font-sans text-xs font-medium tracking-wide text-slate-100"
              : "rounded-full bg-gold-500/12 px-3 py-1 font-sans text-xs font-medium tracking-wide text-gold-600"
          }
        >
          {highlight}
        </li>
      ))}
    </ul>
  );
}

function ShareButtons({ shareUrl }: { shareUrl: string }) {
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  const nativeShare = async () => {
    try {
      await navigator.share({
        title: "Pencils Before Pixels",
        text: SHARE_MESSAGE,
        url: shareUrl,
      });
      trackShare("native");
    } catch {
      // user dismissed — ignore
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedMessage = encodeURIComponent(SHARE_MESSAGE);
  const socialLinks = [
    {
      key: "x",
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
      node: <span className="text-sm font-semibold leading-none">X</span>,
    },
    {
      key: "facebook",
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      node: <span className="text-sm font-semibold leading-none">f</span>,
    },
    {
      key: "email",
      label: "Share by email",
      href: `mailto:?subject=${encodeURIComponent(
        "Pencils Before Pixels",
      )}&body=${encodedMessage}%0A%0A${encodedUrl}`,
      node: <Mail className="size-4" aria-hidden />,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {canNativeShare ? (
        <button
          type="button"
          onClick={nativeShare}
          aria-label="Share"
          className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-slate-100 ring-1 ring-white/15 transition-colors hover:bg-white/20"
        >
          <Share2 className="size-4" aria-hidden />
        </button>
      ) : null}

      {socialLinks.map((link) => (
        <a
          key={link.key}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          onClick={() => trackShare(link.key)}
          className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-slate-100 ring-1 ring-white/15 transition-colors hover:bg-white/20"
        >
          {link.node}
        </a>
      ))}
    </div>
  );
}

function CardAction({
  item,
  onOptOutClick,
}: {
  item: HowCanIHelpItem;
  onOptOutClick: () => void;
}) {
  const ctaLabel = item.ctaLabel?.trim() ?? "";
  const ctaHref = item.ctaHref?.trim() ?? "";
  const { hash } = parseNavHref(ctaHref);
  const opensOptOut = item.kind === "opt_out" || hash === "#opt-out";

  if (opensOptOut) {
    return (
      <Button
        variant="outlineDark"
        className="px-5 py-2.5 text-sm"
        onClick={onOptOutClick}
      >
        {ctaLabel || "Open Opt Out Form"}
      </Button>
    );
  }

  if (!ctaLabel || !ctaHref) return null;

  const isExternal = /^https?:\/\//.test(ctaHref);

  return (
    <a
      href={ctaHref}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-gold-600 transition-colors hover:text-gold-500"
    >
      {ctaLabel}
      <ArrowUpRight
        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden
      />
    </a>
  );
}

const MONTH_ABBR: Record<string, string> = {
  january: "JAN",
  jan: "JAN",
  february: "FEB",
  feb: "FEB",
  march: "MAR",
  mar: "MAR",
  april: "APR",
  apr: "APR",
  may: "MAY",
  june: "JUN",
  jun: "JUN",
  july: "JUL",
  jul: "JUL",
  august: "AUG",
  aug: "AUG",
  september: "SEP",
  sept: "SEP",
  sep: "SEP",
  october: "OCT",
  oct: "OCT",
  november: "NOV",
  nov: "NOV",
  december: "DEC",
  dec: "DEC",
};

type ParsedDate = { month: string; day: string; label: string };

function parseDate(text: string): ParsedDate | null {
  const monthFirst = text.match(/([A-Za-z]+)\.?\s+(\d{1,2})/);
  if (monthFirst) {
    const month = MONTH_ABBR[monthFirst[1].toLowerCase()];
    if (month) return { month, day: monthFirst[2], label: text };
  }
  const dayFirst = text.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)/);
  if (dayFirst) {
    const month = MONTH_ABBR[dayFirst[2].toLowerCase()];
    if (month) return { month, day: dayFirst[1], label: text };
  }
  return null;
}

function DateTiles({ dates }: { dates: ParsedDate[] }) {
  return (
    <ul className="flex flex-wrap gap-3">
      {dates.map((date) => (
        <li key={date.label} className="list-none">
          <div className="flex w-[4.75rem] flex-col overflow-hidden rounded-xl border border-navy-800/12 bg-white shadow-[0_6px_20px_rgba(15,31,61,0.08)]">
            <span className="bg-navy-700 py-1 text-center font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-gold-accent">
              {date.month}
            </span>
            <span className="py-1.5 text-center font-display text-[1.75rem] leading-none text-navy-800">
              {date.day}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SupportCard({
  item,
  index,
  onOptOutClick,
}: {
  item: HowCanIHelpItem;
  index: number;
  onOptOutClick: () => void;
}) {
  const meta = KIND_META[item.kind];
  const Icon = meta.icon;
  const isOptOut = item.kind === "opt_out";

  const dateTiles =
    item.kind === "attend"
      ? (item.highlights
          .map((highlight) => parseDate(highlight))
          .filter(Boolean) as ParsedDate[])
      : [];
  const showDateTiles = dateTiles.length > 0;
  const showChips = !showDateTiles && item.highlights.length > 0;
  const showAction = hasCardAction(item);
  const hasFooter = showDateTiles || showAction;

  return (
    <ScrollReveal
      as="article"
      delay={0.08 + index * 0.08}
      offset={26}
      className={`group flex h-full flex-col gap-4 rounded-2xl border p-6 shadow-[0_8px_32px_rgba(15,31,61,0.06)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(15,31,61,0.12)] ${
        isOptOut
          ? "border-gold-500/30 bg-gold-500/[0.06] hover:border-gold-500/50"
          : "border-navy-800/12 bg-white hover:border-navy-800/25"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full ${
            isOptOut
              ? "bg-gold-500/15 text-gold-600"
              : "bg-navy-800/[0.06] text-navy-800"
          }`}
          aria-hidden
        >
          <Icon className="size-5" />
        </span>
        <h3 className="text-pretty font-sans text-lg font-semibold leading-snug text-navy-800">
          {item.eyebrow || meta.eyebrowFallback}
        </h3>
      </div>

      <RichTextContent
        content={item.body}
        className="text-pretty font-sans text-[0.9375rem] leading-[1.6] text-navy-800/75"
      />

      {showChips ? (
        <HighlightChips highlights={item.highlights} tone="light" />
      ) : null}

      {hasFooter ? (
        <div className="mt-auto flex flex-col gap-4 pt-2">
          {showDateTiles ? <DateTiles dates={dateTiles} /> : null}
          {showAction ? (
            <CardAction item={item} onOptOutClick={onOptOutClick} />
          ) : null}
        </div>
      ) : null}
    </ScrollReveal>
  );
}

function hasCardAction(item: HowCanIHelpItem) {
  if (item.kind === "opt_out") return true;
  return Boolean(item.ctaLabel?.trim() && item.ctaHref?.trim());
}

function ShareHero({
  item,
  shareUrl,
}: {
  item: HowCanIHelpItem;
  shareUrl: string;
}) {
  const meta = KIND_META.share;
  const Icon = meta.icon;

  return (
    <ScrollReveal
      as="article"
      offset={30}
      className="relative overflow-hidden rounded-3xl bg-navy-700 p-8 text-slate-50 shadow-[0_28px_90px_rgba(10,22,40,0.22)] sm:p-10"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gold-500/15 blur-2xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="flex max-w-xl flex-col gap-4">
          <span
            className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/10 text-gold-accent ring-1 ring-white/15"
            aria-hidden
          >
            <Icon className="size-6" />
          </span>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-gold-accent">
            {item.eyebrow || meta.eyebrowFallback}
          </p>
          <RichTextContent
            content={item.body}
            linkTone="light"
            className="text-pretty font-sans text-lg leading-[1.55] text-slate-100 sm:text-xl"
          />
          <ShareButtons shareUrl={shareUrl} />
        </div>

        <div className="w-full overflow-hidden rounded-2xl bg-white shadow-[0_16px_48px_rgba(10,22,40,0.2)] ring-1 ring-white/25 lg:w-[min(100%,22rem)] lg:shrink-0">
          <ContentImage
            src={item.image?.trim() || DEFAULT_SHARE_CARD_IMAGE}
            alt={item.imageAlt?.trim() || "Pencils Before Pixels yard sign"}
            width={880}
            height={660}
            sizes="(max-width: 1024px) 100vw, 22rem"
            className="h-auto w-full object-cover"
          />
        </div>
      </div>
    </ScrollReveal>
  );
}

export function HowCanIHelpSection() {
  const section = useSection("homepage.how_can_i_help");
  const { headline, intro, items } = normalizeHowCanIHelpContent(section);
  const { openOptOut } = useOptOut();

  const shareItem = items.find(
    (item) => item.kind === "share" && item.body.trim().length > 0,
  );
  const shareUrl = normalizeShareUrl(shareItem?.ctaHref);
  const supportItems = items.filter(
    (item) => item.kind !== "share" && item.body.trim().length > 0,
  );

  if (!shareItem && supportItems.length === 0) {
    return null;
  }

  return (
    <section
      id="how-can-i-help"
      className="relative w-full bg-[#faf8f2] py-16 max-lg:py-16 lg:py-24"
    >
      <Container>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:gap-12">
          <ScrollReveal className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
            <DisplayHeading as="h2" className="text-navy-800">
              <RichTextContent content={headline} inline />
            </DisplayHeading>
            {intro ? (
              <RichTextContent
                content={intro}
                className={`${sectionSubtextClass} text-navy-800/75`}
              />
            ) : null}
          </ScrollReveal>

          <div className="flex flex-col gap-4 lg:gap-5">
            {shareItem ? (
              <ShareHero item={shareItem} shareUrl={shareUrl} />
            ) : null}

            {supportItems.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {supportItems.map((item, index) => (
                  <SupportCard
                    key={item.kind}
                    item={item}
                    index={index}
                    onOptOutClick={() => openOptOut("how-can-i-help-section")}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
