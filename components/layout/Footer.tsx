"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { NewsletterFooterForm } from "@/components/newsletter/NewsletterFooterForm";
import { Logo } from "@/components/layout/Logo";
import { contentMaxWidthClass, sectionPaddingX } from "@/components/ui/Container";
import { resolvePrivacyPolicyUrl, resolveTermsOfServiceUrl } from "@/lib/cms/settings-urls";
import { useSection, useSiteContent } from "@/lib/cms/hooks";
import { normalizePublicNavLinks } from "@/lib/cms/navigation";
import { handleNavLinkClick } from "@/lib/navigation";

type FooterProps = {
  paddingX?: string;
};

export function Footer({ paddingX = sectionPaddingX }: FooterProps) {
  const { navigation, settings } = useSiteContent();
  const footerSection = useSection("homepage.footer");
  const footerLinks = normalizePublicNavLinks(navigation.footer, "footer");
  const pathname = usePathname();
  const lenis = useLenis();

  const newsletterLabel =
    (footerSection.newsletterLabel as string) ?? "Newsletter";

  const privacyPolicyUrl = resolvePrivacyPolicyUrl(settings.privacyPolicyUrl);
  const termsOfServiceUrl = resolveTermsOfServiceUrl(settings.termsOfServiceUrl);

  return (
    <footer className="w-full bg-paper-300 py-16 max-lg:py-16">
      <div className={paddingX}>
        <div className={contentMaxWidthClass}>
          <div className="flex w-full flex-col gap-12 max-lg:gap-8">
            <div className="flex w-full flex-col gap-10 max-lg:gap-12 lg:flex-row lg:items-start lg:justify-between">
              <div className="order-2 flex flex-col gap-8 max-lg:gap-8 lg:order-1">
                <div className="flex flex-col gap-3">
                  <Logo variant="dark" />
                  {settings.footerTagline ? (
                    <p className="max-w-sm text-base text-black/70">
                      {settings.footerTagline}
                    </p>
                  ) : null}
                </div>
                <nav
                  className="flex flex-wrap gap-8 text-base font-semibold leading-none text-black max-lg:gap-8"
                  aria-label="Footer navigation"
                >
                  {footerLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(event) =>
                        handleNavLinkClick(event, link.href, pathname, lenis)
                      }
                      className="transition-opacity hover:opacity-70"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="order-1 flex w-full min-w-0 flex-col gap-4 lg:order-2 lg:w-[400px] lg:shrink-0">
                <p className="text-base font-semibold leading-none text-black">
                  {newsletterLabel}
                </p>
                <NewsletterFooterForm />
              </div>
            </div>

            <div className="flex w-full flex-col gap-8 max-lg:gap-6">
              <div className="h-px w-full bg-black" />
              <div className="flex w-full flex-col gap-4 text-base leading-relaxed text-black max-lg:gap-3 lg:flex-row lg:items-center lg:justify-between lg:leading-none">
                <div className="flex flex-wrap gap-6">
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
                <p>{settings.copyright}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
