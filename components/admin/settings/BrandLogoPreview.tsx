"use client";

import Image from "next/image";
import {
  brandLogoFieldPreviewClass,
  brandLogoPreviewClass,
  brandLogoStripClass,
} from "@/lib/brand/logo-layout";
import { cn } from "@/lib/utils";

type BrandLogoPreviewProps = {
  logo: string;
  label: string;
  variant?: "light" | "dark";
};

export function BrandLogoPreview({
  logo,
  label,
  variant = "dark",
}: BrandLogoPreviewProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-body-muted">{label}</span>
      <div
        className={cn(
          "rounded-[10px] border border-navy-800/8 px-4 py-4",
          variant === "light" ? "bg-navy-800" : "bg-paper-200",
        )}
      >
        {logo ? (
          <div className={cn(brandLogoStripClass, brandLogoFieldPreviewClass)}>
            <Image
              src={logo}
              alt=""
              width={1024}
              height={1024}
              className={brandLogoPreviewClass}
              unoptimized
            />
          </div>
        ) : (
          <span
            className={cn(
              "text-sm",
              variant === "light" ? "text-white/50" : "text-body-muted",
            )}
          >
            No logo uploaded yet
          </span>
        )}
      </div>
    </div>
  );
}
