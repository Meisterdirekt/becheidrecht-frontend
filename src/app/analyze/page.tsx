"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Scale,
  Search,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import DownloadButton from "@/components/DownloadButton";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SkeletonCard } from "@/components/Skeleton";

interface UrteilItem {
  gericht: string;
  aktenzeichen: string;
  datum: string;
  leitsatz: string;
  relevanz: string;
  url?: string;
}

interface AnalysisResult {
  zuordnung?: { behoerde: string; rechtsgebiet: string; untergebiet: string };
  fehler: string[];
  musterschreiben: string;
  frist_datum?: string;
  frist_tage?: number;
  routing_stufe?: "NORMAL" | "HOCH" | "NOTFALL";
  agenten_aktiv?: string[];
  token_kosten_eur?: number;
  erklaerung?: string;
  kritik?: {
    gegenargumente: string[];
    erfolgschance_prozent: number;
    schwachstellen: string[];
  };
  recherche?: {
    urteile: UrteilItem[];
    quellen: string[];
  };
  agenten_details?: Record<string, { success: boolean; durationMs: number; error?: string }>;
}

// ---------------------------------------------------------------------------
// Frist-Banner — erscheint wenn Agent eine Frist erkannt hat
// ---------------------------------------------------------------------------
function FristBanner({ frist_datum, frist_tage }: { frist_datum: string; frist_tage?: number }) {
  const date = new Date(frist_datum);
  const formatted = date.toLocaleDateString("de-DE", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const dringend = frist_tage !== undefined && frist_tage <= 14 && frist_tage >= 0;
  const abgelaufen = frist_tage !== undefined && frist_tage < 0;

  const countdown = abgelaufen
    ? "Frist abgelaufen"
    : frist_tage === 0
    ? "Frist endet heute"
    : frist_tage !== undefined
    ? `noch ${frist_tage} Tag${frist_tage === 1 ? "" : "e"}`
    : null;

  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl border mb-8 animate-slideDown ${
        abgelaufen
          ? "bg-red-500/10 border-red-500/20"
          : dringend
          ? "bg-amber-500/10 border-amber-500/20"
          : "bg-green-500/10 border-green-500/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <Clock
          size={15}
          className={abgelaufen ? "text-red-400" : dringend ? "text-amber-400" : "text-green-400"}
        />
        <span className="text-sm font-medium text-white/80">
          Widerspruchsfrist{" "}
          <span className="font-bold text-white">{formatted}</span>
          {countdown && (
            <span
              className={`ml-2 text-[11px] font-bold uppercase tracking-widest ${
                abgelaufen ? "text-red-400" : dringend ? "text-amber-400" : "text-green-400"
              }`}
            >
              · {countdown}
            </span>
          )}
        </span>
      </div>
      <Link
        href="/fristen"
        className="text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white/70 whitespace-nowrap transition-colors"
      >
        Alle Fristen →
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schreiben-Verfeinern — inline, kein Seitenwechsel
// ---------------------------------------------------------------------------
function RefineSection({
  token,
  zuordnung,
  musterschreiben,
  onRefined,
}: {
  token: string;
  zuordnung?: { behoerde: string };
  musterschreiben: string;
  onRefined: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [kontext, setKontext] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function handleRefine() {
    if (!kontext.trim()) return;
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          traeger: zuordnung?.behoerde ?? "unbekannt",
          beschreibung: musterschreiben,
          antworten: kontext,
          schritt: "erstelle",
        }),
        signal: controller.signal,
      });

      if (!res.ok) return;

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "delta") {
              accumulated += event.text;
              onRefined(accumulated);
            }
          } catch { /* skip */ }
        }
      }
      setOpen(false);
      setKontext("");
    } catch {
      // ignore abort
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 border-t border-white/5 pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-[var(--accent)] transition-colors"
      >
        <Sparkles size={12} />
        Schreiben verfeinern
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      <div className={`expand-collapse ${open ? "expanded" : ""}`}>
        <div>
          <div className="mt-4 space-y-3">
            <textarea
              value={kontext}
              onChange={(e) => setKontext(e.target.value)}
              placeholder="Was soll noch beruecksichtigt werden? z. B. die Miete oder ein vorheriger Widerspruch."
              rows={3}
              maxLength={500}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/25 resize-none focus:outline-none focus:border-white/20 leading-relaxed"
            />
            <button
              onClick={handleRefine}
              disabled={loading || !kontext.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Wird verbessert …
                </>
              ) : (
                <>
                  <Sparkles size={12} />
                  Jetzt verbessern
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Save-Prompt — erscheint nach anonymer Analyse
// ---------------------------------------------------------------------------
function SavePromptBanner() {
  return (
    <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-6 animate-slideUp opacity-0">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-[var(--accent)]/15 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-[var(--accent)]" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm mb-1">
            Ergebnis speichern & Frist verfolgen
          </h3>
          <p className="text-white/60 text-sm mb-4">
            Kostenlos registrieren — Widerspruchsfrist automatisch speichern, Musterschreiben jederzeit abrufen, weitere Analysen durchführen.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/register?next=/analyze"
              className="px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-xl text-[11px] font-bold uppercase tracking-widest text-white transition-all"
            >
              Kostenlos registrieren
            </Link>
            <Link
              href="/login?next=/analyze"
              className="text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
            >
              Bereits registriert? Anmelden →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function AnalyzePage() {
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysesRemaining, setAnalysesRemaining] = useState<number | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadConfig() {
      try {
        const res = await fetch("/api/auth-config", { cache: "no-store" });
        if (!res.ok) throw new Error("Config fehlgeschlagen");
        const data = await res.json();
        if (cancelled) return;
        if (data.configured && data.url && data.anonKey) {
          setSupabase(createBrowserClient(data.url, data.anonKey));
        } else {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          if (url && key) setSupabase(createBrowserClient(url, key));
        }
      } catch {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && key) setSupabase(createBrowserClient(url, key));
      }
      if (!cancelled) setConfigLoading(false);
    }
    loadConfig();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (configLoading || !supabase) return;
    let cancelled = false;
    async function checkAuth() {
      const { data: { session } } = await supabase!.auth.getSession();
      if (cancelled) return;
      if (session) {
        setToken(session.access_token);
        const statusRes = await fetch("/api/subscription-status", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!cancelled && statusRes.ok) {
          const data = await statusRes.json();
          setAnalysesRemaining(data.analyses_remaining ?? 0);
        }
      }
      // Kein Redirect — anonyme Nutzung erlaubt
    }
    checkAuth();
    return () => { cancelled = true; };
  }, [configLoading, supabase]);

  const handleUpload = async () => {
    if (!file) return;
    setError(null);
    setResult(null);
    setShowSavePrompt(false);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: formData,
      });
      const data = await analyzeRes.json();
      if (!analyzeRes.ok) {
        if (analyzeRes.status === 429 && !token) {
          // Anonym + Limit erreicht → Registrierung anbieten
          setShowSavePrompt(true);
        }
        setError(data.error || "Analyse fehlgeschlagen.");
        return;
      }
      const musterschreiben = data.musterschreiben ?? "";
      const isEngineError =
        typeof musterschreiben === "string" &&
        (musterschreiben.startsWith("OpenAI-Key fehlt") ||
          musterschreiben.startsWith("Engine-Fehler:") ||
          musterschreiben.includes("KI-Antwort konnte nicht als JSON"));
      if (isEngineError) {
        setError(musterschreiben);
        return;
      }
      setResult({
        zuordnung: data.zuordnung,
        fehler: data.fehler ?? [],
        musterschreiben,
        frist_datum: data.frist_datum,
        frist_tage: data.frist_tage,
        routing_stufe: data.routing_stufe,
        agenten_aktiv: data.agenten_aktiv,
        token_kosten_eur: data.token_kosten_eur,
        erklaerung: data.erklaerung,
        kritik: data.kritik,
        recherche: data.recherche,
        agenten_details: data.agenten_details,
      });
      if (token) {
        // Eingeloggt: Credit verbrauchen
        const useRes = await fetch("/api/use-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (useRes.ok) {
          const useData = await useRes.json();
          setAnalysesRemaining(useData.analyses_remaining ?? 0);
        } else if (useRes.status === 403) {
          setAnalysesRemaining(0);
        }
      } else {
        // Anonym: Save-Prompt anzeigen
        setShowSavePrompt(true);
      }
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return (
      <main className="min-h-screen bg-mesh text-white flex flex-col">
        <SiteNavSimple backHref="/" backLabel="Zurück zur Startseite" />
        <div className="max-w-3xl mx-auto px-6 py-12 flex-1 w-full space-y-6">
          <div className="skeleton-shimmer rounded-lg h-6 w-48" />
          <div className="skeleton-shimmer rounded-lg h-10 w-72" />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mesh text-white flex flex-col">
      <SiteNavSimple
        backHref="/"
        backLabel="Zurück zur Startseite"
        right={
          <>
            {analysesRemaining !== null && (
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                {analysesRemaining} Analysen
              </span>
            )}
            <Link
              href="/"
              className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              Startseite
            </Link>
          </>
        }
      />

      <div className="max-w-3xl mx-auto px-6 py-12 flex-1 w-full">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-2">Analyse</p>
        <h1 className="text-3xl font-black tracking-tight mb-2">Bescheid analysieren</h1>
        <p className="text-white/60 text-sm mb-10">
          PDF oder Foto des Bescheids hochladen – z. B. Schreiben abfotografieren und hier einreichen. Sie erhalten eine strukturierte Auswertung und ein Musterschreiben.
        </p>

        {/* Upload Box */}
        <div className="max-w-xl p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.03] mb-10 hover:border-white/20 transition-colors">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center text-[var(--accent)]">
              <Upload size={32} />
            </div>
            <p className="text-sm text-gray-500 text-center">PDF oder Bild (JPEG, PNG, WebP – max. 10 MB)</p>
            <p className="text-xs text-white/40 text-center">Auch Foto vom Handy: Bescheid abfotografieren und hochladen.</p>
            {process.env.NODE_ENV === "development" && (
              <p className="text-xs text-amber-400/90 text-center">
                [Nur Entwicklung] Zum Testen:{" "}
                <a href="/test-bescheid.pdf" download className="text-[var(--accent)] hover:underline">
                  Test-Bescheid herunterladen
                </a>
                , dann hier hochladen.
              </p>
            )}
            <input
              type="file"
              accept=".pdf,application/pdf,image/jpeg,image/png,image/webp,image/*"
              className="hidden"
              id="file-upload"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size > 10 * 1024 * 1024) {
                  setError("Datei zu groß. Maximal 10 MB.");
                  setFile(null);
                  e.target.value = "";
                  return;
                }
                setFile(f || null);
                setResult(null);
                setError(null);
              }}
            />
            <label
              htmlFor="file-upload"
              className="px-8 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-2xl font-bold text-[11px] uppercase tracking-widest cursor-pointer transition-all text-white"
            >
              Datei auswählen
            </label>
            {file && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-white/5 rounded-xl border border-white/10 w-full max-w-md">
                <FileText size={20} className="text-[var(--accent)] flex-shrink-0" />
                <span className="text-sm truncate flex-1">{file.name}</span>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={loading || (token !== null && analysesRemaining === 0)}
                  className="text-[var(--accent)] font-bold text-[11px] uppercase tracking-widest hover:text-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analysiere …
                    </>
                  ) : (
                    "Analyse starten"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Keine Analysen mehr */}
        {analysesRemaining === 0 && (
          <div className="mb-10 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-200 text-sm">
              Keine Analysen mehr verfügbar. Bitte erwerben Sie ein Abo oder Einzelanalyse.
            </p>
          </div>
        )}

        {/* Fehler */}
        {error && (
          <div className="mb-10 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl animate-fadeIn" role="alert">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Save-Prompt (anonym, kein Ergebnis) */}
        {showSavePrompt && !result && <SavePromptBanner />}

        {/* Ergebnis */}
        {result && (
          <div className="space-y-6 stagger-group">

            {/* Save-Prompt (nach anonymer Analyse, direkt oben) */}
            {showSavePrompt && <SavePromptBanner />}

            {/* Frist-Banner */}
            {result.frist_datum && (
              <FristBanner
                frist_datum={result.frist_datum}
                frist_tage={result.frist_tage}
              />
            )}

            {/* Zuordnung + Routing-Badge */}
            {result.zuordnung && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 animate-slideUp opacity-0">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/50">Zuordnung</h2>
                  {result.routing_stufe && (
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      result.routing_stufe === "NOTFALL"
                        ? "bg-red-500/20 text-red-400"
                        : result.routing_stufe === "HOCH"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {result.routing_stufe === "NOTFALL" ? "⚡ Notfall" : result.routing_stufe === "HOCH" ? "⚠ Dringend" : "✓ Standard"}
                      {result.token_kosten_eur !== undefined && ` · €${result.token_kosten_eur.toFixed(3)}`}
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/80">
                  {result.zuordnung.behoerde} · {result.zuordnung.rechtsgebiet}
                  {result.zuordnung.untergebiet && ` · ${result.zuordnung.untergebiet}`}
                </p>
              </div>
            )}

            {/* Auffälligkeiten */}
            {result.fehler.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 animate-slideUp opacity-0">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">
                  Mögliche Auffälligkeiten (Hinweise)
                </h2>
                <ul className="list-disc list-inside text-sm text-white/80 space-y-2">
                  {result.fehler.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Klartext-Erklaerung (AG13) */}
            {result.erklaerung && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">
                  Kurz erklaert
                </h2>
                <p className="text-sm text-white/80 leading-relaxed">{result.erklaerung}</p>
              </div>
            )}

            {/* Recherche-Ergebnisse (AG04) */}
            {result.recherche && result.recherche.urteile.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Search size={12} className="text-white/50" />
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                    Relevante Urteile ({result.recherche.urteile.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {result.recherche.urteile.map((u, i) => (
                    <div key={i} className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-white/70">
                            {u.gericht} · {u.aktenzeichen}
                            {u.datum && <span className="font-normal text-white/40 ml-2">{u.datum}</span>}
                          </p>
                          <p className="text-sm text-white/60 mt-1">{u.leitsatz}</p>
                        </div>
                        {u.relevanz && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] whitespace-nowrap">
                            {u.relevanz}
                          </span>
                        )}
                      </div>
                      {u.url && (
                        <a
                          href={u.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[var(--accent)] hover:text-[var(--accent-hover)] mt-1 inline-block"
                        >
                          Volltext →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Kritik / Erfolgschance (AG03) */}
            {result.kritik && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Scale size={12} className="text-white/50" />
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                      Einschaetzung
                    </h2>
                  </div>
                  <span className={`text-sm font-bold ${
                    result.kritik.erfolgschance_prozent >= 70
                      ? "text-green-400"
                      : result.kritik.erfolgschance_prozent >= 40
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}>
                    {result.kritik.erfolgschance_prozent}% Erfolgschance
                  </span>
                </div>

                {result.kritik.schwachstellen.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
                      Schwachstellen im Bescheid
                    </p>
                    <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
                      {result.kritik.schwachstellen.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.kritik.gegenargumente.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
                      Moegliche Gegenargumente der Behoerde
                    </p>
                    <ul className="list-disc list-inside text-sm text-white/50 space-y-1">
                      {result.kritik.gegenargumente.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Musterschreiben + inline Verfeinern */}
            {result.musterschreiben && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">Musterschreiben</h2>
                <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed mb-4">
                  {result.musterschreiben}
                </pre>
                {/* RDG-Disclaimer — nur sichtbar, NICHT im PDF */}
                <p className="text-[11px] text-amber-400/70 border border-amber-400/20 rounded-xl px-4 py-2.5 mb-5 leading-relaxed">
                  ⚠ Dieser Entwurf wurde von einer KI erstellt und stellt keine Rechtsberatung im Sinne des § 2 RDG dar. Er ersetzt nicht die Beratung durch einen Rechtsanwalt oder eine Beratungsstelle (z. B. VdK, Sozialverband). Vor dem Absenden alle Platzhalter in [eckigen Klammern] ersetzen.
                </p>
                <DownloadButton content={result.musterschreiben} />

                {/* Inline Verfeinern */}
                {token && (
                  <RefineSection
                    token={token}
                    zuordnung={result.zuordnung}
                    musterschreiben={result.musterschreiben}
                    onRefined={(text) =>
                      setResult((prev) => prev ? { ...prev, musterschreiben: text } : prev)
                    }
                  />
                )}
              </div>
            )}

            {/* Agenten-Status (kollapsibel) */}
            {result.agenten_aktiv && result.agenten_aktiv.length > 0 && (
              <details className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <summary className="flex items-center gap-2 cursor-pointer text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/50 transition-colors">
                  <Shield size={12} />
                  {result.agenten_aktiv.length} Agenten aktiv
                  {result.token_kosten_eur !== undefined && (
                    <span className="ml-auto font-normal">{result.token_kosten_eur.toFixed(3)} EUR</span>
                  )}
                </summary>
                <div className="mt-3 space-y-1.5">
                  {result.agenten_aktiv.map((agentId) => {
                    const detail = result.agenten_details?.[agentId];
                    return (
                      <div key={agentId} className="flex items-center justify-between text-xs text-white/40">
                        <div className="flex items-center gap-1.5">
                          {detail?.success ? (
                            <CheckCircle size={10} className="text-green-500" />
                          ) : (
                            <XCircle size={10} className="text-red-400" />
                          )}
                          <span className="font-mono">{agentId}</span>
                        </div>
                        {detail && (
                          <span className="font-mono">
                            {detail.durationMs > 0 ? `${(detail.durationMs / 1000).toFixed(1)}s` : "—"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
