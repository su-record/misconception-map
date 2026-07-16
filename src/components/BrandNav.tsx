"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [{ href: "/learn", label: "Learn" }, { href: "/map", label: "My map" }, { href: "/teacher", label: "Teacher" }];

export function BrandNav() {
  const pathname = usePathname();
  return <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#0B1220]/90 backdrop-blur-xl"><nav className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-5"><Link className="group flex items-center gap-3" href="/"><GraphGlyph /><span className="text-[15px] font-extrabold tracking-tight text-slate-50">Misconception Map</span></Link><div className="flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.035] p-1">{links.map((link) => <Link className={`rounded-full px-4 py-2 text-sm font-semibold ${pathname === link.href ? "bg-teal-300 text-[#08131d] shadow-[0_0_24px_rgba(45,212,191,0.18)]" : "text-slate-400 hover:text-white"}`} href={link.href} key={link.href}>{link.label}</Link>)}</div></nav></header>;
}

function GraphGlyph() {
  return <svg aria-hidden="true" className="h-8 w-8" viewBox="0 0 32 32"><path d="M9 10.5 22.5 8M10.5 12l7 10M22 10l-3 11" fill="none" stroke="#5eead4" strokeWidth="1.5" /><circle cx="8" cy="11" fill="#2dd4bf" r="4" /><circle cx="24" cy="8" fill="#fb7185" r="3.5" /><circle cx="18" cy="24" fill="#a7f3d0" r="4.5" /></svg>;
}
