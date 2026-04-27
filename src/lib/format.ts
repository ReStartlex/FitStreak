import type { Locale } from "./i18n/dictionaries";

export function formatNumber(value: number, locale: Locale = "ru") {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US").format(value);
}

export function formatCompact(value: number, locale: Locale = "ru") {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
