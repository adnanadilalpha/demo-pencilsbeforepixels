import { BrandLogoImage } from "@/components/brand/BrandLogoImage";
import { LOCAL_ASSETS } from "@/lib/cms/fallback-data";
import {
  brandLogoAdminLoginClass,
  brandLogoAdminSidebarClass,
} from "@/lib/brand/logo-layout";

type AdminLogoProps = {
  compact?: boolean;
  src?: string;
};

export function AdminLogo({ compact = false, src }: AdminLogoProps) {
  const logoSrc = src?.trim() || LOCAL_ASSETS.brand.logoDark;

  return (
    <BrandLogoImage
      src={logoSrc}
      alt="Pencils Before Pixels"
      priority
      sizeClass={compact ? brandLogoAdminSidebarClass : brandLogoAdminLoginClass}
    />
  );
}
