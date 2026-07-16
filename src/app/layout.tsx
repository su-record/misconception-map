import type { Metadata } from "next";
import { cookies } from "next/headers";
import { BrandNav } from "@/components/BrandNav";
import { LocaleProvider } from "@/components/LocaleProvider";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale";
import "./globals.css";

export const metadata: Metadata = {
  title: "Misconception Map",
  description: "Turn wrong answers into better learning paths.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  return (
    <html lang="en" style={{ backgroundColor: "#0B1220", colorScheme: "dark" }}>
      <head>
        <meta content="dark" name="color-scheme" />
        <meta content="#0B1220" name="theme-color" />
      </head>
      <body style={{ backgroundColor: "#0B1220" }}>
        <LocaleProvider initialLocale={locale}>
          <BrandNav />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
