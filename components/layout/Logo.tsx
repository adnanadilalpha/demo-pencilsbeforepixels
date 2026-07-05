"use client";

import Link from "next/link";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { BrandLogoImage } from "@/components/brand/BrandLogoImage";
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
      className="flex h-[clamp(3.25rem,3.5vw+2rem,4.75rem)] max-w-[min(100%,18rem)] items-center lg:max-w-[22rem]"
      aria-label="Pencils Before Pixels home"
    >
      <BrandLogoImage
        key={variant}
        src={variant === "light" ? media.brand.logoLight : media.brand.logoDark}
        alt={settings.siteName}
        priority
        className="max-h-full"
      />
    </Link>
  );
}
