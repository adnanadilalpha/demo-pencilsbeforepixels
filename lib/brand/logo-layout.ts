/** Shared logo sizing — matches header inner height. */
export const BRAND_LOGO_HEIGHT_PX = 76;

export const brandLogoDimensions = { width: 1024, height: 1024 } as const;

export const brandLogoClass =
  "h-[clamp(3.25rem,3.5vw+2rem,4.75rem)] w-auto max-w-[min(100%,18rem)] shrink-0 object-contain object-left lg:max-w-[22rem]";

export const brandLogoStripClass = "flex items-center";

export const brandLogoFieldPreviewClass =
  "flex min-h-[88px] items-center justify-center px-4 py-3";

export const brandLogoPreviewClass =
  "h-[4.5rem] w-auto max-h-32 max-w-full object-contain";

export const brandLogoAdminSidebarClass =
  "h-16 w-auto max-w-[12.5rem] shrink-0 object-contain object-left";

export const brandLogoAdminLoginClass =
  "h-[4.25rem] w-auto max-w-[15rem] shrink-0 object-contain";

export function isBrandLogoSvg(src: string): boolean {
  return /\.svg($|[?#])/i.test(src.trim());
}

/** Legacy aliases — split logo layout removed; kept for stale module graphs. */
export const brandLogoMarkClass = brandLogoClass;
export const brandLogoWordmarkClass = brandLogoClass;
export const brandLogoMarkDimensions = brandLogoDimensions;
export const brandLogoWordmarkDimensions = brandLogoDimensions;
