"use client";

import Image from "next/image";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useSiteContent } from "@/lib/cms/hooks";
import {
  getAnchorScrollDuration,
  prefersReducedMotion,
  smoothScrollEasing,
} from "@/lib/motion";

type LogoProps = {
  variant?: "light" | "dark";
};

export function Logo({ variant = "light" }: LogoProps) {
  const pathname = usePathname();
  const lenis = useLenis();
  const { settings, media } = useSiteContent();
  const mark =
    variant === "light" ? media.brand.logoMark : media.brand.logoMarkFooter;
  const wordmark =
    variant === "light"
      ? media.brand.logoWordmark
      : media.brand.logoWordmarkFooter;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;

    event.preventDefault();

    const distance = lenis?.scroll ?? window.scrollY;

    if (lenis) {
      lenis.scrollTo(0, {
        duration: prefersReducedMotion() ? 0 : getAnchorScrollDuration(distance),
        easing: smoothScrollEasing,
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }

    window.history.pushState(null, "", "/");
  };

  return (
    <Link
      href="/"
      onClick={handleClick}
      className="flex h-[58px] items-center gap-6 max-lg:h-[clamp(2.25rem,3vw+1.5rem,3.625rem)] max-lg:gap-[clamp(0.75rem,2vw,1.5rem)]"
      aria-label="Pencils Before Pixels home"
    >
      <Image
        src={mark}
        alt=""
        width={47}
        height={58}
        className="h-[58px] w-auto shrink-0 max-lg:h-full"
        priority
      />
      <span className="flex h-[58px] items-center max-lg:h-full" aria-hidden>
        <Image
          src={media.brand.divider}
          alt=""
          width={1}
          height={58}
          className="h-[58px] w-px max-lg:h-full"
        />
      </span>
      <Image
        src={wordmark}
        alt={settings.siteName}
        width={67}
        height={58}
        className="h-[58px] w-auto shrink-0 max-lg:h-full"
        priority
      />
    </Link>
  );
}
