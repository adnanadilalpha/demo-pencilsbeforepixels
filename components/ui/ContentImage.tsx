"use client";

import Image, { type ImageProps } from "next/image";
import { isValidMediaSrc } from "@/lib/media/src";

export type ContentImageProps = ImageProps;

/**
 * Site image wrapper with sensible loading defaults.
 * Use `priority` only for above-the-fold / LCP candidates (hero).
 * All other images lazy-load with low fetch priority so they do not compete for LCP.
 * Always runs through next/image optimization unless explicitly opted out (e.g. SVG).
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

  if (priority) {
    return (
      <Image {...props} src={resolvedSrc} priority unoptimized={unoptimized} />
    );
  }

  return (
    <Image
      {...props}
      src={resolvedSrc}
      loading={loading ?? "lazy"}
      fetchPriority={fetchPriority ?? "low"}
      unoptimized={unoptimized}
    />
  );
}
