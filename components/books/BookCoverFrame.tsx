import { ContentImage } from "@/components/ui/ContentImage";
import { cn } from "@/lib/utils";

export const bookCoverFrameClassName =
  "relative aspect-square w-full overflow-hidden rounded-xl border border-[rgba(220,218,212,0.3)] bg-overlay p-[15%] shadow-[0_10px_15px_-3px_rgba(24,38,58,0.05),0_4px_6px_-4px_rgba(24,38,58,0.05)]";

export const bookCoverImageClassName = "object-cover object-center";

type BookCoverFrameProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  variant?: "site" | "admin";
};

export function BookCoverFrame({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  variant = "site",
}: BookCoverFrameProps) {
  if (!src.trim()) {
    return (
      <div
        className={cn(
          bookCoverFrameClassName,
          "flex items-center justify-center text-xs text-white/50",
          className,
        )}
      >
        No cover
      </div>
    );
  }

  return (
    <div className={cn(bookCoverFrameClassName, className)}>
      <div className="relative h-full w-full overflow-hidden rounded-sm">
        {variant === "admin" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          <ContentImage
            key={src}
            src={src}
            alt={alt}
            fill
            className={bookCoverImageClassName}
            sizes={sizes}
          />
        )}
      </div>
    </div>
  );
}
