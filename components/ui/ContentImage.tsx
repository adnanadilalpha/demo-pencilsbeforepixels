"use client";

import Image, { type ImageProps } from "next/image";
import { isClientSiteCacheEnabled } from "@/lib/cache/client-state";
import { isValidMediaSrc } from "@/lib/media/src";

export type ContentImageProps = ImageProps;

/**
 * Site image wrapper with sensible loading defaults.
 * Use `priority` only for above-the-fold / LCP candidates (hero, first mission slide).
 * All other images lazy-load with low fetch priority so they do not compete for LCP.
 */
export function ContentImage({
  priority,
  loading,
  fetchPriority,
  unoptimized,
  src,
  ...props
}: ContentImageProps) {
  if (!isValidMediaSrc(src)) {
    return null;
  }

  const resolvedSrc = src as ImageProps["src"];
  const bypassOptimization = unoptimized ?? !isClientSiteCacheEnabled();

  if (priority) {
    return (
      <Image {...props} src={resolvedSrc} priority unoptimized={bypassOptimization} />
    );
  }

  return (
    <Image
      {...props}
      src={resolvedSrc}
      loading={loading ?? "lazy"}
      fetchPriority={fetchPriority ?? "low"}
      unoptimized={bypassOptimization}
    />
  );
}
