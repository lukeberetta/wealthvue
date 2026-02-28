import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (e) {
    // Fallback if currency code is invalid
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + " " + (currency || "USD");
  }
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatCurrencyCompact(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  } catch (e) {
    return formatCompactNumber(value) + " " + (currency || "USD");
  }
}

export function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/);
  if (!parts.length || !parts[0]) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_PALETTES = [
  "bg-[#8B6B52] text-[#F0EBE3]",
  "bg-[#5D6B52] text-[#F0EBE3]",
  "bg-[#526B6B] text-[#F0EBE3]",
  "bg-[#6B525D] text-[#F0EBE3]",
  "bg-[#6B6B52] text-[#F0EBE3]",
];

export function avatarPalette(name: string) {
  let hash = 0;
  for (const c of name) hash = ((hash << 5) - hash) + c.charCodeAt(0);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}
