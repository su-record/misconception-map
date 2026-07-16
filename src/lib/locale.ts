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
  return `Reason internally in English, but write ${content} and every other user-facing string natively in ${languageName(locale)}. Keep misconception taxonomy names and slugs in English. Machine identifier fields such as misconception_slug and labels must never contain reasoning or commentary. Use plain Arabic numerals for math, including fractions such as 3/4.`;
}
