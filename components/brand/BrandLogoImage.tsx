"use client";

import { ContentImage } from "@/components/ui/ContentImage";
import {
  brandLogoBaseClass,
  brandLogoDimensions,
  brandLogoInlineStyle,
  isBrandLogoSvg,
  type BrandLogoSize,
} from "@/lib/brand/logo-layout";
import { cn } from "@/lib/utils";

type BrandLogoImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  /** Pixel-based preset from lib/brand/logo-layout.ts */
  size?: BrandLogoSize;
  /** Admin / one-off Tailwind override — skips pixel presets when set */
  sizeClass?: string;
};

export function BrandLogoImage({
  src,
  alt,
  className,
  priority,
  size = "default",
  sizeClass,
}: BrandLogoImageProps) {
  if (!src.trim()) return null;

  return (
    <ContentImage
      src={src}
      alt={alt}
      width={brandLogoDimensions.width}
      height={brandLogoDimensions.height}
      priority={priority}
      style={sizeClass ? undefined : brandLogoInlineStyle(size)}
      className={cn(brandLogoBaseClass, sizeClass, className)}
      unoptimized={isBrandLogoSvg(src)}
    />
  );
}
