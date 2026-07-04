import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Home sections: 16px mobile, 32px tablet, then desktop scale */
export const sectionPaddingX = "px-4 sm:px-8 lg:px-16 xl:px-24";

export const contentMaxWidthClass = "mx-auto w-full max-w-[1440px]";

/** Standard intro / body copy width (~768px) for section subtext. */
export const sectionSubtextClass =
  "w-full max-w-3xl text-base leading-[1.55] sm:text-lg sm:leading-[1.6]";

type PageFrameProps = {
  children: ReactNode;
  className?: string;
  paddingX?: string;
};

/** Viewport-edge padding outside a single max-width content column. */
export function PageFrame({
  children,
  className,
  paddingX = sectionPaddingX,
}: PageFrameProps) {
  return (
    <div className={paddingX}>
      <div className={cn(contentMaxWidthClass, className)}>{children}</div>
    </div>
  );
}

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
  id?: string;
  paddingX?: string;
};

export function Container({
  children,
  className = "",
  as: Tag = "div",
  id,
  paddingX = sectionPaddingX,
}: ContainerProps) {
  return (
    <Tag id={id} className={paddingX}>
      <div className={cn(contentMaxWidthClass, className)}>{children}</div>
    </Tag>
  );
}
