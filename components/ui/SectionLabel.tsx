import type { ReactNode } from "react";

type SectionLabelProps = {
  children: ReactNode;
  className?: string;
  variant?: "gold" | "gold-on-dark" | "navy";
};

const variantClasses = {
  gold: "text-gold-500",
  "gold-on-dark": "text-gold-accent",
  navy: "text-navy-800",
};

export function SectionLabel({
  children,
  className = "",
  variant = "gold",
}: SectionLabelProps) {
  return (
    <p
      className={`font-sans text-xs font-medium uppercase tracking-[0.2em] ${variantClasses[variant]} ${className}`}
    >
      {children}
    </p>
  );
}
