"use client";

import { DEFAULT_SITE_CACHE } from "@/lib/cache/types";

let siteCacheEnabled = DEFAULT_SITE_CACHE.enabled;

export function setClientSiteCacheEnabled(enabled: boolean) {
  siteCacheEnabled = enabled;
}

export function isClientSiteCacheEnabled() {
  return siteCacheEnabled;
}
