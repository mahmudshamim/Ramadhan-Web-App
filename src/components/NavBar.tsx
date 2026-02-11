"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { FiMoon, FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { useLang } from "../lib/i18n";

type NavItem = {
  key: string;
  href?: string;
  children?: NavItem[];
};

const navItems: NavItem[] = [
  { key: "home", href: "/" },
  { key: "dashboard", href: "/dashboard" },
  {
    key: "menu_ibadah",
    children: [
      { key: "calendar", href: "/calendar" },
      { key: "quran", href: "/quran" },
      { key: "duas", href: "/duas" },
      { key: "names", href: "/names" },
      { key: "tasbih", href: "/tasbih" },
      { key: "qibla", href: "/qibla" },
    ]
  },
  {
    key: "menu_lifestyle",
    children: [
      { key: "health", href: "/health" },
      { key: "zakat", href: "/zakat" },
      { key: "quiz", href: "/quiz" },
      { key: "nearby", href: "/nearby" },
    ]
  },
  { key: "settings", href: "/settings" }
];

export default function NavBar() {
  const { t, lang, setLang } = useLang();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const handleMouseEnter = (key: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

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
          {navItems.map((item) => {
            if (item.children) {
              const isDropdownActive = activeDropdown === item.key;
              const hasActiveChild = item.children.some(child => child.href === pathname);

              return (
                <div
                  key={item.key}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(item.key)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-all ${hasActiveChild || isDropdownActive
                      ? "text-brand-gold font-medium bg-brand-gold/5"
                      : "text-slate-300 hover:bg-brand-gold/10 hover:text-brand-sand"
                      }`}
                  >
                    {t(`nav.${item.key}`)}
                    <FiChevronDown className={`transition-transform duration-200 ${isDropdownActive ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute left-0 top-full mt-2 w-48 origin-top-left rounded-xl border border-brand-gold/10 bg-brand-deep/95 p-2 shadow-xl backdrop-blur-xl transition-all duration-200 ${isDropdownActive
                      ? "opacity-100 scale-100 translate-y-0 visible"
                      : "opacity-0 scale-95 -translate-y-2 invisible"
                      }`}
                  >
                    {item.children.map((child) => {
                      const isActive = pathname === child.href;
                      return (
                        <Link
                          key={child.key}
                          href={child.href!}
                          className={`block rounded-lg px-4 py-2 text-sm transition-colors ${isActive
                            ? "bg-brand-gold/20 text-brand-gold font-medium"
                            : "text-slate-300 hover:bg-brand-gold/10 hover:text-white"
                            }`}
                        >
                          {t(`nav.${child.key}`)}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isActive = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href!}
                className={`rounded-full px-4 py-2 text-sm transition-all ${isActive
                  ? "bg-brand-gold text-brand-deep shadow-md font-medium"
                  : "text-slate-300 hover:bg-brand-gold/10 hover:text-brand-sand"
                  }`}
              >
                {t(`nav.${item.key}`)}
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
        <div className="absolute left-0 right-0 top-full max-h-[calc(100vh-80px)] overflow-y-auto border-b border-brand-gold/10 bg-brand-deep/95 p-6 backdrop-blur-3xl lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <div key={item.key} className="flex flex-col gap-2 rounded-xl border border-brand-gold/5 bg-brand-gold/5 p-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-brand-gold/70 px-2">
                      {t(`nav.${item.key}`)}
                    </div>
                    <div className="grid gap-2 pl-2 border-l border-brand-gold/10 ml-1">
                      {item.children.map((child) => {
                        const isActive = pathname === child.href;
                        return (
                          <Link
                            key={child.key}
                            href={child.href!}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center justify-between rounded-lg px-4 py-2 text-sm transition-all ${isActive
                              ? "bg-brand-gold/20 text-brand-gold font-medium"
                              : "text-slate-300 active:bg-brand-gold/10"
                              }`}
                          >
                            {t(`nav.${child.key}`)}
                            {isActive && <div className="h-1.5 w-1.5 rounded-full bg-brand-gold" />}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.key}
                  href={item.href!}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all active:scale-[0.98] ${isActive
                    ? "border-brand-gold/50 bg-brand-gold/20 text-brand-gold font-medium"
                    : "border-brand-gold/5 bg-brand-gold/5 text-slate-200"
                    }`}
                >
                  {t(`nav.${item.key}`)}
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
