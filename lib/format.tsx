import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

const numberFormatter = new Intl.NumberFormat("en-US");

export const formatNumber = (value: number) => numberFormatter.format(value);

export function formatDate(value: string | Date, pattern = "MMM d, yyyy") {
  return format(typeof value === "string" ? parseISO(value) : value, pattern);
}

export function formatRelative(value: string) {
  return `${formatDistanceToNowStrict(parseISO(value))} ago`;
}

export function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** Date-picker value ↔ the API's YYYY-MM-DD query format. */
export const toIsoDay = (date: Date) => format(date, "yyyy-MM-dd");
export const fromIsoDay = (value?: string) => (value ? parseISO(value) : undefined);
