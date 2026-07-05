"use client";

import Image from "next/image";
import type { SocialLink } from "@/lib/site/social-links";
import { cn } from "@/lib/utils";

type FooterSocialLinksProps = {
  links: SocialLink[];
  className?: string;
};

export function FooterSocialLinks({ links, className }: FooterSocialLinksProps) {
  if (links.length === 0) return null;

  return (
    <nav
      className={cn("-ml-1 flex flex-wrap items-center gap-2 sm:gap-2.5", className)}
      aria-label="Social media"
    >
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          title={link.label}
          className="inline-flex size-9 items-center justify-center rounded-full text-black transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 sm:size-10"
        >
          {link.iconUrl ? (
            <Image
              src={link.iconUrl}
              alt=""
              width={24}
              height={24}
              className="size-6 object-contain"
              unoptimized={/\.svg($|[?#])/i.test(link.iconUrl)}
            />
          ) : (
            <span
              aria-hidden
              className="flex size-6 items-center justify-center rounded-full bg-black/10 text-xs font-semibold uppercase"
            >
              {link.label.charAt(0)}
            </span>
          )}
        </a>
      ))}
    </nav>
  );
}
