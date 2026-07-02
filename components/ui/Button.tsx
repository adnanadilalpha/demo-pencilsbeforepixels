"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "outlineDark" | "light" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary bg-gold-500 text-slate-100 hover:bg-gold-500/95",
  outline:
    "btn-outline border-2 border-gold-50 text-gold-50 hover:border-gold-50",
  outlineDark:
    "btn-outline-dark border-2 border-navy-800 text-navy-800 hover:border-navy-800",
  light: "btn-light bg-navy-50 text-navy-800 hover:bg-navy-50/95",
  ghost: "btn-ghost bg-transparent text-slate-50 hover:bg-white/10",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "btn-animated group relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-3 text-base font-medium leading-none",
        "transition-[transform,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-50",
        "disabled:pointer-events-none disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <span className="btn-animated-shimmer pointer-events-none" aria-hidden />
      <span className="btn-animated-label relative z-1">{children}</span>
    </button>
  );
}
