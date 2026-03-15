"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Search,
  PenLine,
  FileDown,
} from "lucide-react";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import {
  ANTRAEGE_KATALOG,
  getFormfreiCount,
  type BehoerdeAntraege,
} from "@/lib/antraege-katalog";

// ---------------------------------------------------------------------------
// Behörden-Übersicht (Kacheln)
// ---------------------------------------------------------------------------

function BehoerdenGrid({
  items,
  onSelect,
}: {
  items: BehoerdeAntraege[];
  onSelect: (b: BehoerdeAntraege) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((b) => {
        const formfreiCount = b.formfreieAntraege.length;
        const pflichtCount = b.pflichtformulare.length;
        const total = formfreiCount + pflichtCount;

        return (
          <button
            key={b.traeger}
            onClick={() => onSelect(b)}
            className="group flex flex-col gap-3 p-5 rounded-2xl border border-white/10 bg-white/[0.03] text-left transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--accent)]/20 transition-colors">
                <Building2 size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {b.label}
                </p>
                <p className="text-xs text-white/40">{b.sgb}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/50">
              {formfreiCount > 0 && (
                <span className="flex items-center gap-1">
                  <PenLine size={10} />
                  {formfreiCount} formfrei
                </span>
              )}
              {pflichtCount > 0 && (
                <span className="flex items-center gap-1">
                  <FileDown size={10} />
                  {pflichtCount} Vordruck
                </span>
              )}
              {total === 0 && <span>Keine Anträge</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail-Ansicht einer Behörde
// ---------------------------------------------------------------------------

function BehoerdeDetail({
  behoerde,
  onBack,
}: {
  behoerde: BehoerdeAntraege;
  onBack: () => void;
}) {
  return (
    <div className="animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors mb-6"
      >
        <ChevronLeft size={14} />
        Alle Behörden
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center flex-shrink-0">
          <Building2 size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">
            {behoerde.label}
          </h2>
          <p className="text-sm text-white/40">{behoerde.sgb}</p>
        </div>
      </div>

      {/* Formfreie Anträge */}
      {behoerde.formfreieAntraege.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <PenLine size={14} className="text-green-400" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">
              Formfreie Anträge — KI erstellt Ihr Schreiben
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {behoerde.formfreieAntraege.map((antrag) => (
              <Link
                key={antrag.id}
                href={`/assistant?traeger=${behoerde.traeger}&antrag=${encodeURIComponent(antrag.assistantPrompt)}`}
                className="group flex items-start gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:border-green-400/30 hover:bg-green-400/5"
              >
                <div className="w-8 h-8 rounded-xl bg-green-400/10 text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white mb-1">
                    {antrag.titel}
                  </p>
                  <p className="text-sm text-white/50 leading-relaxed mb-2">
                    {antrag.beschreibung}
                  </p>
                  <p className="text-xs text-[var(--accent)] font-mono">
                    {antrag.rechtsgrundlage}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-white/20 group-hover:text-green-400 transition-colors flex-shrink-0 mt-1"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Pflichtformulare */}
      {behoerde.pflichtformulare.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <FileDown size={14} className="text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              Offizielle Vordrucke — Pflichtformulare
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {behoerde.pflichtformulare.map((form, i) => (
              <a
                key={i}
                href={form.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:border-amber-400/30 hover:bg-amber-400/5"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileDown size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white mb-1">
                    {form.titel}
                  </p>
                  <p className="text-sm text-white/50 leading-relaxed mb-2">
                    {form.beschreibung}
                  </p>
                  <p className="text-xs text-white/30">
                    Quelle: {form.quelle}
                  </p>
                </div>
                <ExternalLink
                  size={14}
                  className="text-white/20 group-hover:text-amber-400 transition-colors flex-shrink-0 mt-1"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* RDG Disclaimer */}
      <p className="text-xs text-[var(--text)] border border-amber-400/30 bg-amber-100 dark:bg-amber-500/10 rounded-xl px-4 py-2.5 leading-relaxed">
        Formfreie Anträge werden von einer KI als Entwurf erstellt und stellen
        keine Rechtsberatung im Sinne des § 2 RDG dar. Vor dem Absenden alle
        Platzhalter ersetzen und ggf. eine Beratungsstelle (z. B. VdK,
        Sozialverband) hinzuziehen.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AntraegePage() {
  const [selected, setSelected] = useState<BehoerdeAntraege | null>(null);
  const [search, setSearch] = useState("");

  const formfreiTotal = getFormfreiCount();

  // Filter Behörden by search
  const filtered = search.trim()
    ? ANTRAEGE_KATALOG.filter((b) => {
        const q = search.toLowerCase();
        return (
          b.label.toLowerCase().includes(q) ||
          b.sgb.toLowerCase().includes(q) ||
          b.formfreieAntraege.some(
            (a) =>
              a.titel.toLowerCase().includes(q) ||
              a.beschreibung.toLowerCase().includes(q)
          ) ||
          b.pflichtformulare.some(
            (f) =>
              f.titel.toLowerCase().includes(q) ||
              f.beschreibung.toLowerCase().includes(q)
          )
        );
      })
    : null;

  return (
    <main id="main-content" className="min-h-screen bg-mesh text-white flex flex-col">
      <SiteNavSimple
        backHref="/"
        backLabel="Startseite"
        right={
          <Link
            href="/assistant"
            className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white/70"
          >
            Assistent
          </Link>
        }
      />

      <div className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full">
        {!selected ? (
          <>
            {/* Header */}
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-2">
              Antrags-Katalog
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-3">
              Anträge im Sozialrecht
            </h1>
            <p className="text-white/50 text-sm mb-8 max-w-xl leading-relaxed">
              {formfreiTotal} formfreie Anträge, die unsere KI für Sie
              erstellt — plus Direktlinks zu allen offiziellen
              Pflichtformularen. Wählen Sie Ihre Behörde.
            </p>

            {/* Search */}
            <div className="relative mb-8">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Behörde oder Antrag suchen..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-white/20"
              />
            </div>

            {/* Grid */}
            {filtered !== null && filtered.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-12">
                Keine Ergebnisse für &quot;{search}&quot;
              </p>
            ) : (
              <BehoerdenGrid
                items={filtered ?? ANTRAEGE_KATALOG}
                onSelect={setSelected}
              />
            )}

            {/* Info Box */}
            <div className="mt-12 p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
              <h3 className="text-sm font-bold mb-3">
                Formfrei vs. Pflichtformular — was ist der Unterschied?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white/60 leading-relaxed">
                <div className="flex gap-3">
                  <PenLine
                    size={16}
                    className="text-green-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-white/80 mb-1">
                      Formfreie Anträge
                    </p>
                    <p>
                      Können als einfaches Schreiben eingereicht werden — kein
                      offizielles Formular nötig. Unsere KI erstellt Ihnen einen
                      professionellen Entwurf mit allen nötigen Angaben.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <FileDown
                    size={16}
                    className="text-amber-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-white/80 mb-1">
                      Pflichtformulare
                    </p>
                    <p>
                      Müssen auf dem offiziellen Vordruck der Behörde
                      eingereicht werden. Wir verlinken direkt auf die aktuelle
                      Version der zuständigen Behörde.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <BehoerdeDetail behoerde={selected} onBack={() => setSelected(null)} />
        )}
      </div>

      <SiteFooter />
    </main>
  );
}
