import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistrictLabel(name: string, maxLength = 20) {
  const upper = name.toUpperCase();
  if (upper.length <= maxLength) return upper;
  return `${upper.slice(0, maxLength - 2)}..`;
}
