export const SITE_CACHE_SETTINGS_KEY = "website_cache";

export type SiteCacheSettings = {
  /** When false, all website caches are bypassed for fresh content. */
  enabled: boolean;
};

export const DEFAULT_SITE_CACHE: SiteCacheSettings = {
  enabled: true,
};
