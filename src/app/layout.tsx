import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Misconception Map",
  description: "Turn wrong answers into better learning paths.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link className="font-semibold" href="/">Misconception Map</Link>
            <div className="flex gap-6 text-sm text-slate-600">
              <Link href="/learn">Learn</Link><Link href="/map">My map</Link><Link href="/teacher">Teacher</Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
