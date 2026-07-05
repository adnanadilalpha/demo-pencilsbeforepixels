"use client";

import { ContentImage } from "@/components/ui/ContentImage";
import {
  brandLogoClass,
  brandLogoDimensions,
  isBrandLogoSvg,
} from "@/lib/brand/logo-layout";
import { cn } from "@/lib/utils";

type BrandLogoImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizeClass?: string;
};

export function BrandLogoImage({
  src,
  alt,
  className,
  priority,
  sizeClass,
}: BrandLogoImageProps) {
  if (!src.trim()) return null;

  const logoClass = sizeClass ?? brandLogoClass;

  return (
    <ContentImage
      src={src}
      alt={alt}
      width={brandLogoDimensions.width}
      height={brandLogoDimensions.height}
      priority={priority}
      className={cn(logoClass, className)}
      unoptimized={isBrandLogoSvg(src)}
    />
  );
}
