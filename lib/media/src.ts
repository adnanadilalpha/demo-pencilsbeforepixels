import type { StaticImageData } from "next/image";

export function isValidMediaSrc(src: unknown): src is string | StaticImageData {
  if (!src) return false;
  if (typeof src === "string") return src.trim().length > 0;
  if (typeof src === "object" && src !== null && "src" in src) {
    const value = (src as { src?: unknown }).src;
    return typeof value === "string" && value.trim().length > 0;
  }
  return false;
}
