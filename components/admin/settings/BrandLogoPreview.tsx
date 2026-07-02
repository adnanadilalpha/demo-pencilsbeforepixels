"use client";

import Image from "next/image";
import {
  brandLogoDividerClass,
  brandLogoDividerDimensions,
  brandLogoDividerWrapClass,
  brandLogoMarkClass,
  brandLogoMarkDimensions,
  brandLogoStripClass,
  brandLogoWordmarkClass,
  brandLogoWordmarkDimensions,
} from "@/lib/brand/logo-layout";
import { cn } from "@/lib/utils";

type BrandLogoPreviewProps = {
  variant: "light" | "dark";
  mark: string;
  wordmark: string;
  divider: string;
  label: string;
};

export function BrandLogoPreview({
  variant,
  mark,
  wordmark,
  divider,
  label,
}: BrandLogoPreviewProps) {
  const hasAssets = Boolean(mark || wordmark || divider);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-body-muted">{label}</span>
      <div
        className={cn(
          "rounded-[10px] border border-navy-800/8 px-4 py-4",
          variant === "light" ? "bg-navy-800" : "bg-paper-300",
        )}
      >
        {hasAssets ? (
          <div className={brandLogoStripClass}>
            {mark ? (
              <Image
                src={mark}
                alt=""
                width={brandLogoMarkDimensions.width}
                height={brandLogoMarkDimensions.height}
                className={brandLogoMarkClass}
                unoptimized
              />
            ) : (
              <span className="text-xs text-white/40">Mark</span>
            )}
            {divider ? (
              <span className={brandLogoDividerWrapClass} aria-hidden>
                <Image
                  src={divider}
                  alt=""
                  width={brandLogoDividerDimensions.width}
                  height={brandLogoDividerDimensions.height}
                  className={brandLogoDividerClass}
                  unoptimized
                />
              </span>
            ) : null}
            {wordmark ? (
              <Image
                src={wordmark}
                alt=""
                width={brandLogoWordmarkDimensions.width}
                height={brandLogoWordmarkDimensions.height}
                className={brandLogoWordmarkClass}
                unoptimized
              />
            ) : (
              <span
                className={cn(
                  "text-xs",
                  variant === "light" ? "text-white/40" : "text-navy-800/40",
                )}
              >
                Wordmark
              </span>
            )}
          </div>
        ) : (
          <span
            className={cn(
              "text-sm",
              variant === "light" ? "text-white/50" : "text-body-muted",
            )}
          >
            No logo assets uploaded yet
          </span>
        )}
      </div>
    </div>
  );
}
