"use client";

import React, { useEffect, useCallback } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { X } from "lucide-react";

type Lang = "DE" | "EN" | "RU" | "AR" | "TR";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  navBlog: string;
  navLogin: string;
  navRegister: string;
}

export function MobileNav({
  open,
  onClose,
  lang,
  onLangChange,
  navBlog,
  navLogin,
  navRegister,
}: MobileNavProps) {
  const langs: Lang[] = ["DE", "EN", "RU", "AR", "TR"];

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — slide in from right */}
      <nav
        className="absolute top-0 right-0 h-full w-[280px] max-w-[85vw] bg-[var(--bg)] border-l border-white/10 p-6 flex flex-col gap-8 animate-slideDown"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="self-end p-2 text-white/40 hover:text-white transition-colors"
          aria-label="Menü schließen"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Links */}
        <div className="flex flex-col gap-5">
          <Link
            href="/blog"
            onClick={onClose}
            className="text-[13px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
          >
            {navBlog}
          </Link>
          <Link
            href="/login"
            onClick={onClose}
            className="text-[13px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
          >
            {navLogin}
          </Link>
          <Link
            href="/register"
            onClick={onClose}
            className="btn-primary text-center mt-2"
          >
            {navRegister}
          </Link>
        </div>

        {/* Language selector */}
        <div className="flex gap-2 flex-wrap" dir="ltr">
          {langs.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                onLangChange(l);
                onClose();
              }}
              className={`text-[11px] font-bold tracking-widest rounded-lg px-3 py-1.5 transition-colors ${
                lang === l
                  ? "text-[var(--accent)] bg-[var(--accent)]/10"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <div className="mt-auto">
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
