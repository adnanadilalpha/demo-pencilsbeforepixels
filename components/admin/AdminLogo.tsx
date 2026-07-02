import Image from "next/image";
import { LOCAL_ASSETS } from "@/lib/cms/fallback-data";
import { cn } from "@/lib/utils";

type AdminLogoProps = {
  compact?: boolean;
};

export function AdminLogo({ compact = false }: AdminLogoProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5">
        <Image
          src={LOCAL_ASSETS.brand.logoMarkFooter}
          alt=""
          width={39}
          height={48}
          className="h-12 w-auto shrink-0"
          priority
        />
        <span className="flex h-12 items-center" aria-hidden>
          <Image
            src={LOCAL_ASSETS.brand.divider}
            alt=""
            width={1}
            height={48}
            className="h-12 w-px"
          />
        </span>
        <Image
          src={LOCAL_ASSETS.brand.logoWordmarkFooter}
          alt="Pencils Before Pixels"
          width={55}
          height={48}
          className="h-12 w-auto shrink-0"
          priority
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-[58px] items-center gap-6 max-lg:h-[clamp(2.25rem,3vw+1.5rem,3.625rem)] max-lg:gap-[clamp(0.75rem,2vw,1.5rem)]",
      )}
    >
      <Image
        src={LOCAL_ASSETS.brand.logoMarkFooter}
        alt=""
        width={47}
        height={58}
        className="h-[58px] w-auto shrink-0 max-lg:h-full"
        priority
      />
      <span className="flex h-[58px] items-center max-lg:h-full" aria-hidden>
        <Image
          src={LOCAL_ASSETS.brand.divider}
          alt=""
          width={1}
          height={58}
          className="h-[58px] w-px max-lg:h-full"
        />
      </span>
      <Image
        src={LOCAL_ASSETS.brand.logoWordmarkFooter}
        alt="Pencils Before Pixels"
        width={67}
        height={58}
        className="h-[58px] w-auto shrink-0 max-lg:h-full"
        priority
      />
    </div>
  );
}
