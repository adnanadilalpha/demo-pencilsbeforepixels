"use client";

import { ContentImage } from "@/components/ui/ContentImage";
import Link from "next/link";
import { useSiteContent } from "@/lib/cms/hooks";
import { cn } from "@/lib/utils";

type TextLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "light" | "dark";
  className?: string;
};

export function TextLink({
  href,
  children,
  variant = "light",
  className,
}: TextLinkProps) {
  const { media } = useSiteContent();
  const icon =
    variant === "light"
      ? media.icons.arrowRightLight
      : media.icons.arrowRightDark;

  return (
    <Link
      href={href}
      className={cn(
        "text-link-animated group inline-flex items-center gap-1.5 text-base font-medium leading-none",
        variant === "light" ? "text-slate-50" : "text-navy-800",
        className,
      )}
    >
      <span className="text-link-label relative">
        {children}
        <span
          className={cn(
            "text-link-underline absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100",
            variant === "light" ? "bg-gold-accent/80" : "bg-gold-500/80",
          )}
          aria-hidden
        />
      </span>
      <span className="text-link-arrow inline-flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
        <ContentImage src={icon} alt="" width={16} height={16} aria-hidden />
      </span>
    </Link>
  );
}
