"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Clock, MessageSquare, BookOpen, LogIn, UserPlus } from "lucide-react";

interface PaletteItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  keywords: string[];
}

const ITEMS: PaletteItem[] = [
  {
    id: "analyze",
    label: "Neue Analyse",
    href: "/analyze",
    icon: <FileText className="w-4 h-4" />,
    keywords: ["analyse", "bescheid", "prüfen", "upload"],
  },
  {
    id: "fristen",
    label: "Fristen-Dashboard",
    href: "/fristen",
    icon: <Clock className="w-4 h-4" />,
    keywords: ["fristen", "deadline", "termin", "frist"],
  },
  {
    id: "assistant",
    label: "Widerspruchs-Assistent",
    href: "/assistant",
    icon: <MessageSquare className="w-4 h-4" />,
    keywords: ["assistent", "widerspruch", "schreiben", "brief"],
  },
  {
    id: "blog",
    label: "Blog",
    href: "/blog",
    icon: <BookOpen className="w-4 h-4" />,
    keywords: ["blog", "artikel", "ratgeber"],
  },
  {
    id: "login",
    label: "Anmelden",
    href: "/login",
    icon: <LogIn className="w-4 h-4" />,
    keywords: ["login", "anmelden", "einloggen"],
  },
  {
    id: "register",
    label: "Registrieren",
    href: "/register",
    icon: <UserPlus className="w-4 h-4" />,
    keywords: ["registrieren", "konto", "account"],
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.keywords.some((k) => k.includes(query.toLowerCase()))
      )
    : ITEMS;

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const navigate = useCallback(
    (href: string) => {
      handleClose();
      router.push(href);
    },
    [handleClose, router]
  );

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) handleClose();
        else handleOpen();
      }
      if (e.key === "Escape" && open) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, handleOpen, handleClose]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Reset active index when filtered results change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      navigate(filtered[activeIndex].href);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm modal-backdrop"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Palette */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-md px-4">
        <div className="modal-content rounded-2xl border border-white/10 bg-[var(--bg-elevated)] shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <Search className="w-4 h-4 text-white/30 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Suchen…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
              aria-label="Suche"
            />
            <kbd className="hidden sm:flex items-center text-[10px] font-bold text-white/20 border border-white/10 rounded px-1.5 py-0.5">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[300px] overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-6">
                Keine Ergebnisse
              </p>
            ) : (
              filtered.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.href)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    i === activeIndex
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "text-white/60 hover:text-white/80"
                  }`}
                >
                  <span className="shrink-0 opacity-60">{item.icon}</span>
                  {item.label}
                </button>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center justify-center gap-4 px-4 py-2 border-t border-white/10 text-[10px] text-white/20">
            <span>↑↓ navigieren</span>
            <span>↵ öffnen</span>
            <span>esc schließen</span>
          </div>
        </div>
      </div>
    </div>
  );
}
