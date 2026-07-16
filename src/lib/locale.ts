export const LOCALE_COOKIE = "mismap_locale";
export const locales = ["en", "ko", "ja"] as const;
export type Locale = typeof locales[number];

export function parseLocale(value: unknown): Locale {
  return typeof value === "string" && locales.includes(value as Locale) ? value as Locale : "en";
}

export function languageName(locale: Locale) {
  return { en: "English", ko: "Korean", ja: "Japanese" }[locale];
}

export function languageInstruction(locale: Locale, content: string) {
  return `Write ${content} natively in ${languageName(locale)}. Keep misconception taxonomy names and slugs in English. Use plain Arabic numerals for math, including fractions such as 3/4.`;
}
