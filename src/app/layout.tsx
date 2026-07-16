import type { Metadata } from "next";
import { BrandNav } from "@/components/BrandNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Misconception Map",
  description: "Turn wrong answers into better learning paths.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <BrandNav />
        {children}
      </body>
    </html>
  );
}
