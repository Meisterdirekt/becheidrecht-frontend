"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/MobileNav";
import { Menu } from "lucide-react";

type Lang = "DE" | "EN" | "RU" | "AR" | "TR";

interface SiteNavFullProps {
  lang: Lang;
  onLangChange: (l: Lang) => void;
  dir: "ltr" | "rtl";
  navLogin: string;
  navRegister: string;
}

export function SiteNavFull({ lang, onLangChange, dir: _dir, navLogin, navRegister }: SiteNavFullProps) {
  const langs: Lang[] = ["DE", "EN", "RU", "AR", "TR"];
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 flex justify-between items-center px-6 py-5 max-w-7xl mx-auto w-full bg-[var(--bg)]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-white font-black text-xl tracking-tight hover:opacity-90 transition-opacity">
            BESCHEID<span className="text-[var(--accent)]">RECHT</span>
          </Link>
          {/* Desktop: lang selector + theme toggle */}
          <div className="hidden md:flex gap-3 items-center" dir="ltr">
            {langs.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onLangChange(l)}
                aria-current={lang === l ? "true" : undefined}
                aria-label={`Sprache: ${l}`}
                className={`text-xs font-bold tracking-widest transition-colors rounded-lg px-2 py-1 ${
                  lang === l ? "text-[var(--accent)] bg-[var(--accent)]/10" : "text-white/40 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
            <ThemeToggle />
          </div>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/b2b" className="btn-ghost">
            Für Einrichtungen
          </Link>
          <Link href="/login" className="btn-ghost">
            {navLogin}
          </Link>
          <Link href="/register" className="btn-primary">
            {navRegister}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 text-white/50 hover:text-white transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Menü öffnen"
          aria-expanded={mobileOpen}
        >
          <Menu className="w-5 h-5" />
        </button>
      </nav>

      {/* Mobile overlay */}
      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        lang={lang}
        onLangChange={onLangChange}
        navLogin={navLogin}
        navRegister={navRegister}
      />
    </>
  );
}

interface SiteNavSimpleProps {
  backHref: string;
  backLabel: string;
  right?: React.ReactNode;
}

export function SiteNavSimple({ backHref, backLabel, right }: SiteNavSimpleProps) {
  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center px-6 py-5 max-w-7xl mx-auto w-full bg-[var(--bg)]/80 backdrop-blur-xl border-b border-white/5">
      <Link
        href={backHref}
        className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
      >
        ← {backLabel}
      </Link>
      <div className="absolute left-1/2 -translate-x-1/2">
        <Link href="/" className="text-white font-black text-lg tracking-tight hover:opacity-90 transition-opacity">
          BESCHEID<span className="text-[var(--accent)]">RECHT</span>
        </Link>
      </div>
      <div className="flex items-center gap-4 min-w-[120px] justify-end">
        <ThemeToggle />
        {right ?? <span />}
      </div>
    </nav>
  );
}
