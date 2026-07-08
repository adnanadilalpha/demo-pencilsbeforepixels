"use client";

import Link from "next/link";
import { NewsletterTrigger } from "@/components/newsletter/NewsletterTrigger";
import { resolveNavHref } from "@/lib/navigation";
import { useSiteContent } from "@/lib/cms/hooks";

type MobileNavProps = {
  open: boolean;
  pathname: string;
  activeHash: string;
  onClose: () => void;
  isNavLinkActive: (href: string, pathname: string, activeHash: string) => boolean;
  onNavClick?: (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    label?: string,
  ) => void;
};

export function MobileNav({
  open,
  pathname,
  activeHash,
  onClose,
  isNavLinkActive,
  onNavClick,
}: MobileNavProps) {
  const { navigation } = useSiteContent();
  const navLinks = navigation.header;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-hero-dark/40 backdrop-blur-[2px] transition-opacity duration-500 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        onClick={onClose}
      />

      <aside
        id="mobile-nav"
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(100%,420px)] flex-col border-l border-white/8 bg-hero-dark shadow-[-24px_0_80px_rgba(10,22,40,0.45)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold-500" aria-hidden />
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.24em] text-gold-500">
              Menu
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="group flex size-10 items-center justify-center rounded-full border border-white/12 text-slate-50 transition-colors hover:border-gold-500/40 hover:text-gold-500"
            aria-label="Close menu"
          >
            <span className="relative block size-4">
              <span className="absolute left-1/2 top-1/2 block h-px w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current transition-transform" />
              <span className="absolute left-1/2 top-1/2 block h-px w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current transition-transform" />
            </span>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-8" aria-label="Mobile navigation">
          {navLinks.map((link, index) => {
            const isActive = isNavLinkActive(link.href, pathname, activeHash);
            const href = resolveNavHref(link.href, pathname);

            return (
              <Link
                key={link.href}
                href={href}
                onClick={(event) => {
                  onNavClick?.(event, href, link.label);
                }}
                className={`group flex items-start gap-4 border-l-[2.5px] py-4 pl-5 pr-2 transition-colors ${
                  isActive
                    ? "border-gold-500 bg-gold-500/8"
                    : "border-transparent hover:border-gold-500/35 hover:bg-white/4"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`shrink-0 font-sans text-xs font-medium leading-none ${
                    isActive ? "text-gold-500" : "text-white/35 group-hover:text-gold-500/70"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-col gap-1">
                  <span
                    className={`font-display text-2xl leading-display ${
                      isActive ? "text-gold-500" : "text-slate-50 group-hover:text-white"
                    }`}
                  >
                    {link.label}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/8 px-6 py-8">
          <p className="mb-4 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
            Stay informed
          </p>
          <NewsletterTrigger
            source="mobile-nav"
            className="w-full"
            onTriggered={onClose}
          >
            Join Newsletter
          </NewsletterTrigger>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({
  open,
  onClick,
  variant,
}: {
  open: boolean;
  onClick: () => void;
  variant: "light" | "dark";
}) {
  const barColor = variant === "light" ? "bg-paper-300" : "bg-navy-800";

  return (
    <button
      type="button"
      className="relative flex size-8 flex-col items-center justify-center gap-[5px] lg:hidden"
      aria-expanded={open}
      aria-controls="mobile-nav"
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={onClick}
    >
      <span
        className={`block h-[3px] w-6 rounded-full transition-all duration-300 ${barColor} ${
          open ? "translate-y-[8px] rotate-45" : ""
        }`}
      />
      <span
        className={`block h-[3px] w-6 rounded-full transition-all duration-300 ${barColor} ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`block h-[3px] w-6 rounded-full transition-all duration-300 ${barColor} ${
          open ? "translate-y-[-8px] -rotate-45" : ""
        }`}
      />
    </button>
  );
}
