"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { MobileMenuButton, MobileNav } from "@/components/layout/MobileNav";
import { NewsletterTrigger } from "@/components/newsletter/NewsletterTrigger";
import {
  contentMaxWidthClass,
  sectionPaddingX,
} from "@/components/ui/Container";
import { isFixedHeaderRoute } from "@/lib/legal/constants";
import { handleNavLinkClick, parseNavHref, resolveNavHref } from "@/lib/navigation";
import { useSiteContent } from "@/lib/cms/hooks";
import { ANALYTICS_EVENTS } from "@/lib/analytics/event-types";
import { trackAnalyticsEvent } from "@/lib/analytics/track-client";

const SCROLL_THRESHOLD = 48;
const SECTION_IDS = ["resources", "opt-out", "how-can-i-help"] as const;

function getActiveSectionHash(): string {
  const triggerY = window.innerHeight * 0.35;
  let activeHash = "";
  let closestDistance = Infinity;

  for (const id of SECTION_IDS) {
    const element = document.getElementById(id);
    if (!element) continue;

    const rect = element.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) continue;

    const sectionMid = rect.top + rect.height / 2;
    const distance = Math.abs(sectionMid - triggerY);

    if (distance < closestDistance) {
      closestDistance = distance;
      activeHash = `#${id}`;
    }
  }

  return activeHash;
}

function isNavLinkActive(
  href: string,
  pathname: string,
  activeHash: string,
): boolean {
  if (href === "/nebraska-data" || href === "/evidence") {
    return (
      pathname === "/nebraska-data" ||
      pathname.startsWith("/nebraska-data/") ||
      pathname === "/evidence" ||
      pathname.startsWith("/evidence/")
    );
  }

  if (href === "/research") {
    return pathname === "/research" || pathname.startsWith("/research/");
  }

  const { path, hash } = parseNavHref(href);
  if (hash) {
    return pathname === path && activeHash === hash;
  }

  return pathname === href;
}

export function Header() {
  const { navigation } = useSiteContent();
  const navLinks = navigation.header;
  const pathname = usePathname();
  const router = useRouter();
  const isFixedHeaderPage = isFixedHeaderRoute(pathname);
  const [isScrolled, setIsScrolled] = useState(isFixedHeaderPage);
  const [activeHash, setActiveHash] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const lenis = useLenis();

  const handleHashNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    label?: string,
  ) => {
    void trackAnalyticsEvent(ANALYTICS_EVENTS.NAV_CLICK, {
      label,
      metadata: { href },
    });
    handleNavLinkClick(
      event,
      href,
      pathname,
      lenis,
      setActiveHash,
      router,
    );
  };

  useEffect(() => {
    if (pathname !== "/") {
      setActiveHash("");
      return;
    }

    const updateActiveSection = () => {
      setActiveHash(getActiveSectionHash());
    };

    updateActiveSection();
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isFixedHeaderPage) return;
    setIsScrolled(true);
  }, [isFixedHeaderPage]);

  useEffect(() => {
    if (!menuOpen) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const previous = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
      overflow: style.overflow,
    };

    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflow = "hidden";

    return () => {
      style.position = previous.position;
      style.top = previous.top;
      style.left = previous.left;
      style.right = previous.right;
      style.width = previous.width;
      style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useLenis((lenis) => {
    if (isFixedHeaderPage) return;
    setIsScrolled(lenis.scroll > SCROLL_THRESHOLD);
    if (pathname === "/") {
      setActiveHash(getActiveSectionHash());
    }
  }, [isFixedHeaderPage, pathname]);

  useEffect(() => {
    if (lenis || isFixedHeaderPage) return;

    const onScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
      if (pathname === "/") {
        setActiveHash(getActiveSectionHash());
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lenis, isFixedHeaderPage, pathname]);

  const showScrolled = isFixedHeaderPage || isScrolled;
  const menuVariant = showScrolled || menuOpen ? "dark" : "light";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          showScrolled || menuOpen
            ? "bg-paper-200 shadow-[0_1px_0_rgba(15,31,61,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div
          className={sectionPaddingX}
        >
          <div
            className={`${contentMaxWidthClass} flex h-[var(--header-height)] items-center justify-between py-1`}
          >
            <Logo
              size="nav"
              variant={showScrolled || menuOpen ? "dark" : "light"}
            />

            <nav
              className="hidden items-center gap-7 lg:flex"
              aria-label="Primary navigation"
            >
              {navLinks.map((link) => {
                const isActive = isNavLinkActive(link.href, pathname, activeHash);
                const href = resolveNavHref(link.href, pathname);

                return (
                  <Link
                    key={link.href}
                    href={href}
                    onClick={(event) => handleHashNavClick(event, href, link.label)}
                    className={`text-base font-medium leading-none transition-colors ${
                      isActive
                        ? "text-gold-500"
                        : showScrolled
                          ? "text-navy-800 hover:text-gold-500"
                          : "text-slate-50 hover:text-gold-500"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-8">
              <NewsletterTrigger
                source="header"
                variant={showScrolled || menuOpen ? "outlineDark" : "outline"}
                className="hidden px-[26px] py-[14px] text-base leading-[18px] lg:inline-flex"
              >
                Join Newsletter
              </NewsletterTrigger>

              <MobileMenuButton
                open={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
                variant={menuVariant}
              />
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        open={menuOpen}
        pathname={pathname}
        activeHash={activeHash}
        onClose={() => setMenuOpen(false)}
        isNavLinkActive={isNavLinkActive}
        onHashNavClick={handleHashNavClick}
      />
    </>
  );
}
