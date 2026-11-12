import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a money-ish value (string or number) into a finite number.
 * Returns null when the value is missing or not parseable, so callers can
 * decide how to render it instead of leaking "NaN" into the UI.
 */
export function parseAmount(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value !== "string" || value.trim() === "") return null
  // Strip thousands separators before parsing ("1,00,000" -> "100000")
  const n = parseFloat(value.replace(/,/g, ""))
  return Number.isFinite(n) ? n : null
}

/**
 * Format a rupee amount consistently across the app.
 * Returns a fallback string for missing/invalid values instead of "NaN".
 */
export function formatINR(value: unknown, fallback = "-"): string {
  const n = parseAmount(value)
  if (n === null) return fallback
  return "\u20B9" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 })
}

/**
 * Format a date-ish value (Firestore Timestamp, Date, ISO string, or legacy
 * "DD/MM/YYYY" locale string) for display, without ever throwing.
 */
export function formatDisplayDate(value: unknown, fallback = "-"): string {
  try {
    if (!value) return fallback
    if (typeof value === "object" && "toDate" in (value as object)) {
      return (value as { toDate(): Date }).toDate().toLocaleDateString("en-IN")
    }
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? fallback : value.toLocaleDateString("en-IN")
    }
    if (typeof value === "string") {
      const parsed = new Date(value)
      // Legacy locale strings ("12/11/2026") that Date can't parse are shown as-is
      return isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-IN")
    }
    return fallback
  } catch {
    return fallback
  }
}
