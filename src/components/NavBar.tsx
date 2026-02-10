"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMoon, FiMenu, FiX } from "react-icons/fi";
import { useLang } from "../lib/i18n";

const links = [
  { href: "/", key: "home" },
  { href: "/dashboard", key: "dashboard" },
  { href: "/calendar", key: "calendar" },
  { href: "/quran", key: "quran" },
  { href: "/duas", key: "duas" },
  { href: "/zakat", key: "zakat" },
  { href: "/health", key: "health" },
  { href: "/settings", key: "settings" }
];

export default function NavBar() {
  const { t, lang, setLang } = useLang();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-gold/10 bg-brand-deep/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 transition hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold shadow-inner">
            <FiMoon className="text-xl" />
          </div>
          <span className="font-display text-xl tracking-tight text-brand-sand">R-Ramadhan</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm transition-all ${isActive
                  ? "bg-brand-gold text-brand-deep shadow-md font-medium"
                  : "text-slate-300 hover:bg-brand-gold/10 hover:text-brand-sand"
                  }`}
              >
                {t(`nav.${link.key}`)}
              </Link>
            );
          })}
        </div>

        {/* Action Area */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center rounded-full border border-brand-gold/20 bg-brand-deep/40 p-1">
            <button
              onClick={() => setLang("en")}
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all ${lang === "en"
                ? "bg-brand-gold text-brand-deep"
                : "text-slate-400 hover:text-brand-sand"
                }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("bn")}
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all ${lang === "bn"
                ? "bg-brand-gold text-brand-deep"
                : "text-slate-400 hover:text-brand-sand"
                }`}
            >
              বাংলা
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-gold/20 text-brand-gold lg:hidden transition hover:bg-brand-gold/10"
          >
            {isMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-full border-b border-brand-gold/10 bg-brand-deep/95 p-6 backdrop-blur-3xl lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid gap-4 sm:grid-cols-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all active:scale-[0.98] ${isActive
                    ? "border-brand-gold/50 bg-brand-gold/20 text-brand-gold font-medium"
                    : "border-brand-gold/5 bg-brand-gold/5 text-slate-200"
                    }`}
                >
                  {t(`nav.${link.key}`)}
                  <div className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-brand-gold" : "bg-brand-gold/30"}`} />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
