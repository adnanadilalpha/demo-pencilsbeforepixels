import type { ReactNode } from "react";

type DisplayHeadingProps = {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
  size?: "xl" | "lg" | "md" | "sm";
};

const sizeClasses = {
  /** Section titles — always one step below hero (fluid-display-xl) */
  xl: "text-fluid-display-lg lg:text-[56px]",
  lg: "text-fluid-display-lg lg:text-[56px]",
  md: "text-fluid-display-md lg:text-[40px]",
  sm: "text-fluid-display-sm",
};

export function DisplayHeading({
  children,
  as: Tag = "h2",
  className = "",
  size = "lg",
}: DisplayHeadingProps) {
  return (
    <Tag
      className={`font-display leading-display ${sizeClasses[size]} ${className}`}
    >
      {children}
    </Tag>
  );
}
