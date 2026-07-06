import type { CSSProperties } from "react";

/** Intrinsic size passed to Next/Image (aspect ratio only). */
export const brandLogoDimensions = { width: 1024, height: 1024 } as const;

/** Footer / default site logo (px) */
export const BRAND_LOGO_DEFAULT_HEIGHT_PX = 164;
export const BRAND_LOGO_DEFAULT_MAX_WIDTH_PX = 288;

/** Navbar logo (px) — edit these to resize the header logo */
export const BRAND_LOGO_NAV_HEIGHT_PX = 76;
export const BRAND_LOGO_NAV_MAX_WIDTH_PX = 480;
export const BRAND_LOGO_NAV_MAX_WIDTH_LG_PX = 704;

/** Navbar bar height (px) — usually logo height + 12–16px padding */
export const HEADER_HEIGHT_MOBILE_PX = BRAND_LOGO_NAV_HEIGHT_PX + 16;
export const HEADER_HEIGHT_DESKTOP_PX = BRAND_LOGO_NAV_HEIGHT_PX + 24;

/** @deprecated Use BRAND_LOGO_DEFAULT_HEIGHT_PX */
export const BRAND_LOGO_HEIGHT_PX = BRAND_LOGO_DEFAULT_HEIGHT_PX;

export type BrandLogoSize = "default" | "nav";

export function brandLogoPixelSize(size: BrandLogoSize = "default") {
  if (size === "nav") {
    return {
      heightPx: BRAND_LOGO_NAV_HEIGHT_PX,
      maxWidthPx: BRAND_LOGO_NAV_MAX_WIDTH_PX,
      maxWidthLgPx: BRAND_LOGO_NAV_MAX_WIDTH_LG_PX,
    };
  }

  return {
    heightPx: BRAND_LOGO_DEFAULT_HEIGHT_PX,
    maxWidthPx: BRAND_LOGO_DEFAULT_MAX_WIDTH_PX,
    maxWidthLgPx: BRAND_LOGO_DEFAULT_MAX_WIDTH_PX,
  };
}

export function brandLogoInlineStyle(size: BrandLogoSize = "default"): CSSProperties {
  const { heightPx, maxWidthPx } = brandLogoPixelSize(size);

  if (size === "nav") {
    return {
      height: `${heightPx}px`,
      width: "auto",
      maxWidth: "min(100%, var(--brand-logo-nav-max-width))",
    };
  }

  return {
    height: `${heightPx}px`,
    width: "auto",
    maxWidth: `min(100%, ${maxWidthPx}px)`,
  };
}

/** Injected in root layout — keeps header height in sync with logo px constants. */
export function brandLayoutCss() {
  return `:root{--header-height:${HEADER_HEIGHT_MOBILE_PX}px;--brand-logo-nav-max-width:${BRAND_LOGO_NAV_MAX_WIDTH_PX}px;}@media (min-width:1024px){:root{--header-height:${HEADER_HEIGHT_DESKTOP_PX}px;--brand-logo-nav-max-width:${BRAND_LOGO_NAV_MAX_WIDTH_LG_PX}px;}}`;
}

export const brandLogoBaseClass =
  "w-auto shrink-0 object-contain object-left";

export const brandLogoStripClass = "flex items-center";

export const brandLogoFieldPreviewClass =
  "flex min-h-[88px] items-center justify-center px-4 py-3";

export const brandLogoPreviewClass =
  "h-[72px] w-auto max-h-32 max-w-full object-contain";

export const brandLogoAdminSidebarClass =
  "h-[64px] w-auto max-w-[600px] shrink-0 object-fit object-left";

export const brandLogoAdminLoginClass =
  "h-[68px] w-auto max-w-[240px] shrink-0 object-fit";

export function isBrandLogoSvg(src: string): boolean {
  return /\.svg($|[?#])/i.test(src.trim());
}

/** Legacy aliases — split logo layout removed; kept for stale module graphs. */
export const brandLogoClass = brandLogoBaseClass;
export const brandLogoNavClass = brandLogoBaseClass;
export const brandLogoMarkClass = brandLogoBaseClass;
export const brandLogoWordmarkClass = brandLogoBaseClass;
export const brandLogoMarkDimensions = brandLogoDimensions;
export const brandLogoWordmarkDimensions = brandLogoDimensions;
