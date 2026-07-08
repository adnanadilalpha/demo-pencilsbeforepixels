import { LOCAL_ASSETS } from "@/lib/cms/fallback-data";

/** Default social preview image when no page-specific asset is set. */
export const DEFAULT_OG_IMAGE_PATH = LOCAL_ASSETS.hero.background;

export const SITE_LOCALE = "en_US";

export const DEFAULT_KEYWORDS = [
  "screen time in schools",
  "1 to 1 devices",
  "device opt out",
  "Nebraska education data",
  "NAEP scores",
  "reading and writing",
  "Pencils Before Pixels",
  "Westside Community Schools",
  "parent advocacy",
] as const;
