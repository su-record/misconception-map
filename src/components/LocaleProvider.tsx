"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/locale";

type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void };
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children, initialLocale }: { children: ReactNode; initialLocale: Locale }) {
  const [locale, setLocaleState] = useState(initialLocale);
  function setLocale(locale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setLocaleState(locale);
  }
  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider.");
  return context;
}
