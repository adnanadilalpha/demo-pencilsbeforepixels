"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { NewsletterFooterForm } from "@/components/newsletter/NewsletterFooterForm";
import { Logo } from "@/components/layout/Logo";
import { FooterSocialLinks } from "@/components/layout/FooterSocialLinks";
import { contentMaxWidthClass, sectionPaddingX } from "@/components/ui/Container";
import { resolvePrivacyPolicyUrl, resolveTermsOfServiceUrl } from "@/lib/cms/settings-urls";
import { useSection, useSiteContent } from "@/lib/cms/hooks";
import { normalizePublicNavLinks } from "@/lib/cms/navigation";
import { handleNavLinkClick } from "@/lib/navigation";
import { ANALYTICS_EVENTS } from "@/lib/analytics/event-types";
import { trackAnalyticsEvent } from "@/lib/analytics/track-client";

type FooterProps = {
  paddingX?: string;
};

export function Footer({ paddingX = sectionPaddingX }: FooterProps) {
  const { navigation, settings } = useSiteContent();
  const footerSection = useSection("homepage.footer");
  const footerLinks = normalizePublicNavLinks(navigation.footer, "footer");
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const hasSocialLinks = settings.socialLinks.length > 0;

  const newsletterLabel =
    (footerSection.newsletterLabel as string) ?? "Newsletter";
  const socialLinksLabel =
    (footerSection.socialLinksLabel as string)?.trim() || "Follow us";

  const privacyPolicyUrl = resolvePrivacyPolicyUrl(settings.privacyPolicyUrl);
  const termsOfServiceUrl = resolveTermsOfServiceUrl(settings.termsOfServiceUrl);

  return (
    <footer className="w-full bg-paper-200 py-16 max-lg:py-12">
      <div className={paddingX}>
        <div className={contentMaxWidthClass}>
          <div className="flex w-full flex-col gap-10 max-lg:gap-8 lg:gap-12">
            <div className="grid w-full grid-cols-1 gap-10 max-lg:gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-x-16 lg:gap-y-0">
              <div className="flex min-w-0 flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <Logo variant="dark" />
                  {settings.footerTagline ? (
                    <p className="max-w-md text-base text-black/70">
                      {settings.footerTagline}
                    </p>
                  ) : null}
                </div>

                <nav
                  className="flex flex-wrap gap-x-8 gap-y-4 text-base font-semibold leading-none text-black"
                  aria-label="Footer navigation"
                >
                  {footerLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(event) => {
                        void trackAnalyticsEvent(ANALYTICS_EVENTS.NAV_CLICK, {
                          label: link.label,
                          metadata: { href: link.href, location: "footer" },
                        });
                        handleNavLinkClick(
                          event,
                          link.href,
                          pathname,
                          lenis,
                          undefined,
                          (url) => router.push(url),
                        );
                      }}
                      className="transition-opacity hover:opacity-70"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex min-w-0 flex-col gap-6 lg:gap-8">
                <div className="flex w-full flex-col gap-4">
                  <p className="text-base font-semibold leading-none text-black">
                    {newsletterLabel}
                  </p>
                  <NewsletterFooterForm />
                </div>

                {hasSocialLinks ? (
                  <div className="flex flex-col gap-3 border-t border-black/10 pt-6 max-lg:pt-5">
                    <p className="text-sm font-semibold leading-none text-black/80">
                      {socialLinksLabel}
                    </p>
                    <FooterSocialLinks links={settings.socialLinks} />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex w-full flex-col gap-6 max-lg:gap-5">
              <div className="h-px w-full bg-black" />
              <div className="flex w-full flex-col gap-4 text-base leading-relaxed text-black max-lg:gap-3 sm:flex-row sm:items-center sm:justify-between sm:leading-none">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {privacyPolicyUrl.startsWith("/") ? (
                    <Link
                      href={privacyPolicyUrl}
                      className="underline underline-offset-2"
                    >
                      Privacy Policy
                    </Link>
                  ) : (
                    <a
                      href={privacyPolicyUrl}
                      className="underline underline-offset-2"
                    >
                      Privacy Policy
                    </a>
                  )}
                  {termsOfServiceUrl.startsWith("/") ? (
                    <Link
                      href={termsOfServiceUrl}
                      className="underline underline-offset-2"
                    >
                      Terms of Service
                    </Link>
                  ) : (
                    <a
                      href={termsOfServiceUrl}
                      className="underline underline-offset-2"
                    >
                      Terms of Service
                    </a>
                  )}
                </div>
                <p className="max-w-prose sm:text-right">{settings.copyright}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
