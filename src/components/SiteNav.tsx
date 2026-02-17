"use client";

import React from "react";
import Link from "next/link";

type Lang = "DE" | "EN" | "RU" | "AR" | "TR";

interface SiteNavFullProps {
  lang: Lang;
  onLangChange: (l: Lang) => void;
  dir: "ltr" | "rtl";
}

export function SiteNavFull({ lang, onLangChange, dir }: SiteNavFullProps) {
  const langs: Lang[] = ["DE", "EN", "RU", "AR", "TR"];
  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center px-6 py-5 max-w-7xl mx-auto w-full bg-[var(--bg)]/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-white font-black text-xl tracking-tight hover:opacity-90 transition-opacity">
          BESCHEID<span className="text-[var(--accent)]">RECHT</span>
        </Link>
        <div className="flex gap-3" dir="ltr">
          {langs.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onLangChange(l)}
              className={`text-[11px] font-bold tracking-widest transition-colors rounded-lg px-2 py-1 ${
                lang === l ? "text-[var(--accent)] bg-[var(--accent)]/10" : "text-white/40 hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-6 items-center">
        <Link href="/blog" className="btn-ghost">
          Blog
        </Link>
        <Link href="/login" className="btn-ghost">
          Anmelden
        </Link>
        <Link href="/register" className="btn-primary">
          Registrieren
        </Link>
      </div>
    </nav>
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
        className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
      >
        ← {backLabel}
      </Link>
      <div className="absolute left-1/2 -translate-x-1/2">
        <Link href="/" className="text-white font-black text-lg tracking-tight hover:opacity-90 transition-opacity">
          BESCHEID<span className="text-[var(--accent)]">RECHT</span>
        </Link>
      </div>
      <div className="flex items-center gap-4 min-w-[120px] justify-end">
        {right ?? <span />}
      </div>
    </nav>
  );
}
