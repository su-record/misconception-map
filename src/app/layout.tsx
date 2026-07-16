import type { Metadata } from "next";
import { BrandNav } from "@/components/BrandNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Misconception Map",
  description: "Turn wrong answers into better learning paths.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ backgroundColor: "#0B1220", colorScheme: "dark" }}>
      <head>
        <meta content="dark" name="color-scheme" />
        <meta content="#0B1220" name="theme-color" />
      </head>
      <body style={{ backgroundColor: "#0B1220" }}>
        <BrandNav />
        {children}
      </body>
    </html>
  );
}
