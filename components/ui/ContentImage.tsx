"use client";

import Image, { type ImageProps } from "next/image";
import { isClientSiteCacheEnabled } from "@/lib/cache/client-state";

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
  ...props
}: ContentImageProps) {
  const bypassOptimization = unoptimized ?? !isClientSiteCacheEnabled();

  if (priority) {
    return <Image {...props} priority unoptimized={bypassOptimization} />;
  }

  return (
    <Image
      {...props}
      loading={loading ?? "lazy"}
      fetchPriority={fetchPriority ?? "low"}
      unoptimized={bypassOptimization}
    />
  );
}
