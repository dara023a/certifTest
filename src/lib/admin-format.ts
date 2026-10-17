import type { Certificate, Language } from "@/lib/types";

const localeMap: Record<Language, string> = {
  id: "id-ID",
  en: "en-US",
};

export function formatDate(value: string, language: Language): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(localeMap[language], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string, language: Language): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(localeMap[language], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Short weekday label for the dashboard chart. */
export function formatWeekday(value: Date, language: Language): string {
  return new Intl.DateTimeFormat(localeMap[language], { weekday: "short" }).format(value);
}

/** Human readable "title / position" for a certificate row. */
export function certificateHeadline(certificate: Certificate): string {
  return certificate.type === "webinar"
    ? certificate.eventTitle
    : certificate.position;
}

/**
 * Today's date as `YYYY-MM-DD` in the user's local timezone.
 * `new Date().toISOString().slice(0, 10)` returns UTC, which is a day behind for
 * users in UTC+7 before 07:00 local time.
 */
export function todayLocalISODate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
