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
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ScanEye,
  Route,
  FileSearch,
  PenTool,
} from "lucide-react";
import dynamic from "next/dynamic";
const DownloadButton = dynamic(() => import("@/components/DownloadButton"), { ssr: false });
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
// Pipeline Phase Tracking
// ---------------------------------------------------------------------------

type PipelinePhase = "upload" | "security" | "triage" | "analyse" | "brief" | "done";

const PIPELINE_STEPS: { phase: PipelinePhase; label: string; detail: string; icon: React.ReactNode }[] = [
  { phase: "upload", label: "Dokument", detail: "PII-Scan & Anonymisierung", icon: <ScanEye size={16} /> },
  { phase: "security", label: "Sicherheit", detail: "Injection-Filter & Validierung", icon: <ShieldCheck size={16} /> },
  { phase: "triage", label: "Routing", detail: "Rechtsgebiet & Dringlichkeit", icon: <Route size={16} /> },
  { phase: "analyse", label: "Analyse", detail: "Fehlerprüfung & Recherche", icon: <FileSearch size={16} /> },
  { phase: "brief", label: "Schreiben", detail: "Musterschreiben wird erstellt", icon: <PenTool size={16} /> },
  { phase: "done", label: "Fertig", detail: "Analyse abgeschlossen", icon: <CheckCircle2 size={16} /> },
];

function AnalysisPipeline({ currentPhase, completedPhases }: { currentPhase: PipelinePhase; completedPhases: Set<PipelinePhase> }) {
  const currentIdx = PIPELINE_STEPS.findIndex((s) => s.phase === currentPhase);

  return (
    <div className="max-w-xl mx-auto my-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 animate-fadeIn" role="status" aria-label="Analyse-Fortschritt">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {PIPELINE_STEPS[currentIdx] ? `Schritt ${currentIdx + 1} von ${PIPELINE_STEPS.length}: ${PIPELINE_STEPS[currentIdx].label} — ${PIPELINE_STEPS[currentIdx].detail}` : ""}
      </div>
      <div className="flex items-center gap-2 mb-6">
        <Shield size={14} className="text-[var(--accent)]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]">
          Pipeline aktiv
        </span>
      </div>

      <div className="space-y-0">
        {PIPELINE_STEPS.map((step, i) => {
          const isCompleted = completedPhases.has(step.phase);
          const isCurrent = step.phase === currentPhase;
          const isFuture = !isCompleted && !isCurrent;

          return (
            <div key={step.phase}>
              <div className="flex items-center gap-4">
                {/* Icon circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-500 ${
                    isCompleted
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : isCurrent
                      ? "bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)] animate-pulse"
                      : "bg-white/5 border-white/10 text-white/20"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : step.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold transition-colors duration-300 ${
                        isCompleted
                          ? "text-emerald-400"
                          : isCurrent
                          ? "text-white"
                          : "text-white/25"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCompleted && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/60">
                        OK
                      </span>
                    )}
                    {isCurrent && (
                      <Loader2 size={12} className="animate-spin text-[var(--accent)]" />
                    )}
                  </div>
                  <p
                    className={`text-xs transition-colors duration-300 ${
                      isFuture ? "text-white/15" : "text-white/40"
                    }`}
                  >
                    {step.detail}
                  </p>
                </div>
              </div>

              {/* Connecting line */}
              {i < PIPELINE_STEPS.length - 1 && (
                <div className="ml-[18px] w-[1px] h-4 relative overflow-hidden">
                  <div
                    className={`absolute inset-0 transition-colors duration-500 ${
                      i < currentIdx ? "bg-emerald-500/30" : "bg-white/10"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
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
              placeholder="Was soll noch berücksichtigt werden? z. B. die Miete oder ein vorheriger Widerspruch."
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
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressPhase, setProgressPhase] = useState<string | null>(null);
  const [currentPipelinePhase, setCurrentPipelinePhase] = useState<PipelinePhase>("upload");
  const [completedPipelinePhases, setCompletedPipelinePhases] = useState<Set<PipelinePhase>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysesRemaining, setAnalysesRemaining] = useState<number | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [userContext, setUserContext] = useState("");

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

  const MAX_FILES = 10;

  const handleUpload = async () => {
    if (files.length === 0) return;
    setError(null);
    setResult(null);
    setShowSavePrompt(false);
    setLoading(true);
    setProgressPhase(null);
    setCurrentPipelinePhase("upload");
    setCompletedPipelinePhases(new Set());
    try {
      const formData = new FormData();
      for (const f of files) {
        formData.append("file", f);
      }
      if (userContext.trim()) formData.append("userContext", userContext.trim());
      const headers: Record<string, string> = { Accept: "text/event-stream" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!analyzeRes.ok) {
        const data = await analyzeRes.json().catch(() => ({}));
        if (analyzeRes.status === 429 && !token) setShowSavePrompt(true);
        setError(data.error || "Analyse fehlgeschlagen.");
        return;
      }

      const handleResult = (data: Record<string, unknown>) => {
        const musterschreiben = (data.musterschreiben as string) ?? "";
        const allAgentsFailed = data.agenten_details
          ? Object.values(data.agenten_details as Record<string, { success: boolean }>).every((d) => !d.success)
          : false;
        const isEngineError =
          allAgentsFailed ||
          (typeof musterschreiben === "string" &&
          (musterschreiben.startsWith("OpenAI-Key fehlt") ||
            musterschreiben.startsWith("Engine-Fehler:") ||
            musterschreiben.includes("KI-Antwort konnte nicht als JSON")));
        if (isEngineError) {
          const fehler = Array.isArray(data.fehler) && data.fehler.length > 0
            ? (data.fehler as string[])[0]
            : musterschreiben;
          setError(fehler || "Die Analyse ist vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut.");
          return;
        }
        setResult({
          zuordnung: data.zuordnung as AnalysisResult["zuordnung"],
          fehler: (data.fehler as string[]) ?? [],
          musterschreiben,
          frist_datum: data.frist_datum as string | undefined,
          frist_tage: data.frist_tage as number | undefined,
          routing_stufe: data.routing_stufe as AnalysisResult["routing_stufe"],
          agenten_aktiv: data.agenten_aktiv as string[] | undefined,
          token_kosten_eur: data.token_kosten_eur as number | undefined,
          erklaerung: data.erklaerung as string | undefined,
          kritik: data.kritik as AnalysisResult["kritik"],
          recherche: data.recherche as AnalysisResult["recherche"],
          agenten_details: data.agenten_details as AnalysisResult["agenten_details"],
        });
      };

      const contentType = analyzeRes.headers.get("content-type") ?? "";

      if (contentType.includes("text/event-stream") && analyzeRes.body) {
        // SSE-Streaming — upload phase done, stream connected
        setCompletedPipelinePhases(new Set(["upload"]));
        setCurrentPipelinePhase("security");
        const reader = analyzeRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const PHASE_LABELS: Record<string, string> = {
          init: "Routing wird bestimmt…",
          security: "Sicherheitsprüfung…",
          triage: "Rechtsgebiet erkannt",
          analyse: "Fehler werden analysiert…",
          brief: "Musterschreiben wird erstellt…",
          done: "Analyse abgeschlossen",
        };

        // Map SSE phases to pipeline phases
        const SSE_TO_PIPELINE: Record<string, PipelinePhase> = {
          init: "security",
          security: "security",
          triage: "triage",
          analyse: "analyse",
          brief: "brief",
          done: "done",
        };

        let eventType = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (line.startsWith("event: ")) { eventType = line.slice(7).trim(); continue; }
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6);
              try {
                const parsed = JSON.parse(jsonStr);
                if (eventType === "progress") {
                  const label = PHASE_LABELS[parsed.phase] ?? parsed.phase;
                  setProgressPhase(parsed.detail ? `${label} — ${parsed.detail}` : label);

                  // Advance pipeline stepper
                  const pipelinePhase = SSE_TO_PIPELINE[parsed.phase];
                  if (pipelinePhase) {
                    const phaseOrder: PipelinePhase[] = ["upload", "security", "triage", "analyse", "brief", "done"];
                    const targetIdx = phaseOrder.indexOf(pipelinePhase);
                    setCompletedPipelinePhases((prev) => {
                      const next = new Set(prev);
                      for (let j = 0; j < targetIdx; j++) next.add(phaseOrder[j]);
                      return next;
                    });
                    setCurrentPipelinePhase(pipelinePhase);
                  }
                } else if (eventType === "result") {
                  handleResult(parsed);
                } else if (eventType === "error") {
                  setError(parsed.error ?? "Analyse fehlgeschlagen.");
                }
              } catch { /* ignore malformed — JSON evtl. noch nicht komplett */ }
              eventType = "";
            }
          }
        }
      } else {
        // Fallback: JSON-Response
        const data = await analyzeRes.json();
        handleResult(data);
      }

      if (token) {
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
        setShowSavePrompt(true);
      }
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
      setProgressPhase(null);
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
    <main id="main-content" className="min-h-screen bg-mesh text-white flex flex-col">
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
              href="/analysen"
              className="text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white/70"
            >
              Meine Analysen
            </Link>
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
        <h1 className="text-2xl font-black tracking-tight mb-2">Bescheid analysieren</h1>
        <p className="text-white/60 text-base mb-10">
          PDF oder Foto des Bescheids hochladen – z. B. Schreiben abfotografieren und hier einreichen. Sie erhalten eine strukturierte Auswertung und ein Musterschreiben.
        </p>

        {/* Upload Box */}
        <div className="max-w-xl p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.03] mb-6 hover:border-white/20 transition-colors">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center text-[var(--accent)]">
              <Upload size={32} />
            </div>
            <p className="text-base text-gray-500 text-center">PDF oder Bild (JPEG, PNG, WebP – max. 10 MB pro Datei)</p>
            <p className="text-sm text-white/40 text-center">Bis zu 10 Schreiben gleichzeitig hochladen – auch Fotos vom Handy. Alle Dokumente werden zusammen analysiert.</p>
            {process.env.NODE_ENV === "development" && (
              <p className="text-sm text-violet-500 text-center">
                [Nur Entwicklung] Zum Testen:{" "}
                <a href="/test-bescheid.pdf" download className="text-[var(--accent)] hover:underline">
                  Test-Bescheid herunterladen
                </a>
                , dann hier hochladen.
              </p>
            )}
            <input
              type="file"
              multiple
              accept=".pdf,application/pdf,image/jpeg,image/png,image/webp,image/*"
              className="hidden"
              id="file-upload"
              onChange={(e) => {
                const selected = e.target.files;
                if (!selected || selected.length === 0) return;
                const incoming = Array.from(selected);
                const total = files.length + incoming.length;
                if (total > MAX_FILES) {
                  setError(`Maximal ${MAX_FILES} Dateien gleichzeitig.`);
                  e.target.value = "";
                  return;
                }
                for (const f of incoming) {
                  if (f.size > 10 * 1024 * 1024) {
                    setError(`„${f.name}" ist zu groß. Maximal 10 MB pro Datei.`);
                    e.target.value = "";
                    return;
                  }
                }
                setFiles((prev) => [...prev, ...incoming]);
                setResult(null);
                setError(null);
                e.target.value = "";
              }}
            />
            <label
              htmlFor="file-upload"
              className="px-8 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-2xl font-bold text-[11px] uppercase tracking-widest cursor-pointer transition-all text-white"
            >
              {files.length === 0 ? "Dateien auswählen" : "Weitere hinzufügen"}
            </label>
            {files.length > 0 && (
              <div className="w-full max-w-md mt-4 space-y-2">
                {files.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                    <FileText size={16} className="text-[var(--accent)] flex-shrink-0" />
                    <span className="text-sm truncate flex-1">{f.name}</span>
                    <span className="text-[10px] text-white/30 flex-shrink-0">
                      {(f.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    {!loading && (
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                        className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
                        aria-label={`${f.name} entfernen`}
                      >
                        <XCircle size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <p className="text-[11px] text-white/25">{files.length}/{MAX_FILES} Dateien</p>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={loading || (token !== null && analysesRemaining === 0)}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-2xl font-bold text-[11px] uppercase tracking-widest text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2" aria-live="polite">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      {progressPhase ?? "Analysiere …"}
                    </span>
                  ) : (
                    <>Analyse starten ({files.length} {files.length === 1 ? "Datei" : "Dateien"})</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hintergrund-Kontext (optional) */}
        <div className="max-w-xl mb-10">
          <label htmlFor="user-context" className="block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">
            Hintergrund (optional)
          </label>
          <textarea
            id="user-context"
            value={userContext}
            onChange={(e) => setUserContext(e.target.value)}
            placeholder={'z. B. "Habe B\u00fcrgergeld korrekt beantragt, alles rechtzeitig abgegeben, trotzdem abgelehnt." \u2014 Hilft der KI, Ihren Fall besser zu verstehen.'}
            rows={3}
            maxLength={1000}
            disabled={loading}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/25 resize-none focus:outline-none focus:border-white/20 leading-relaxed disabled:opacity-50"
          />
          <p className="text-[11px] text-white/25 mt-1">
            {userContext.length}/1000 Zeichen
          </p>
        </div>

        {/* Pipeline-Stepper während Analyse */}
        {loading && (
          <AnalysisPipeline
            currentPhase={currentPipelinePhase}
            completedPhases={completedPipelinePhases}
          />
        )}

        {/* Keine Analysen mehr */}
        {analysesRemaining === 0 && (
          <div className="mb-10 p-4 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-500 text-sm font-bold mb-2">
                Keine Analysen mehr verfügbar.
              </p>
              <p className="text-white/60 text-sm mb-3">
                Kontaktieren Sie uns für ein Einrichtungs-Abo — passend für Ihre Organisation.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/b2b"
                  className="px-3 py-2 text-xs font-medium rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Einrichtungs-Abos ansehen
                </a>
                <a
                  href="mailto:info@bescheidrecht.de"
                  className="px-3 py-2 text-xs font-medium rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
                >
                  info@bescheidrecht.de
                </a>
              </div>
            </div>
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
          <div className="space-y-6 stagger-group" aria-live="polite">

            {/* KI-Transparenz-Hinweis */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-sky-500/20 bg-sky-500/5 text-sm" role="status">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-[var(--accent)] text-[11px] font-bold uppercase tracking-widest">KI-generiert</span>
              <span className="text-[var(--text-muted)]">Dieses Ergebnis wurde automatisiert durch KI erstellt und stellt keine Rechtsberatung dar (§ 2 RDG).</span>
            </div>

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
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-white/60">Zuordnung</h2>
                  {result.routing_stufe && (
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      result.routing_stufe === "NOTFALL"
                        ? "bg-red-500/20 text-red-400"
                        : result.routing_stufe === "HOCH"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-emerald-700/30 text-emerald-700"
                    }`}>
                      {result.routing_stufe === "NOTFALL" ? "⚡ Notfall" : result.routing_stufe === "HOCH" ? "⚠ Dringend" : "✓ Standard"}
                      {result.token_kosten_eur !== undefined && ` · €${result.token_kosten_eur.toFixed(3)}`}
                    </span>
                  )}
                </div>
                <p className="text-base text-white/85">
                  {result.zuordnung.behoerde} · {result.zuordnung.rechtsgebiet}
                  {result.zuordnung.untergebiet && ` · ${result.zuordnung.untergebiet}`}
                </p>
              </div>
            )}

            {/* Auffälligkeiten */}
            {result.fehler.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 animate-slideUp opacity-0">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-white/60 mb-3">
                  Mögliche Auffälligkeiten (Hinweise)
                </h2>
                <ul className="list-disc list-inside text-base text-white/85 space-y-2">
                  {result.fehler.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Klartext-Erklaerung (AG13) */}
            {result.erklaerung && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-white/60 mb-3">
                  Kurz erklaert
                </h2>
                <p className="text-base text-white/85 leading-relaxed">{result.erklaerung}</p>
              </div>
            )}

            {/* Recherche-Ergebnisse (AG04) */}
            {result.recherche && result.recherche.urteile.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Search size={12} className="text-white/50" />
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-white/60">
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
                          <p className="text-[13px] text-white/60 mt-1">{u.leitsatz}</p>
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
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-white/60">
                      Einschaetzung
                    </h2>
                  </div>
                  {/* Erfolgschance wird intern genutzt (AG07), aber nicht angezeigt — § 2 RDG */}
                </div>

                {result.kritik.schwachstellen.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-white/40 mb-1.5">
                      Schwachstellen im Bescheid
                    </p>
                    <ul className="list-disc list-inside text-base text-white/75 space-y-1">
                      {result.kritik.schwachstellen.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.kritik.gegenargumente.length > 0 && (
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-white/40 mb-1.5">
                      Moegliche Gegenargumente der Behoerde
                    </p>
                    <ul className="list-disc list-inside text-base text-white/55 space-y-1">
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
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-white/60 mb-3">Musterschreiben</h2>
                <pre className="text-base text-white/85 whitespace-pre-wrap font-sans leading-relaxed mb-4">
                  {result.musterschreiben}
                </pre>
                {/* RDG-Disclaimer — nur sichtbar, NICHT im PDF */}
                <p className="text-[11px] text-[var(--text)] border border-amber-400/30 bg-amber-100 dark:bg-amber-500/10 rounded-xl px-4 py-2.5 mb-5 leading-relaxed">
                  ⚠ Dieser Entwurf wurde von einer KI erstellt und stellt keine Rechtsberatung im Sinne des § 2 RDG dar. Er ersetzt nicht die Beratung durch einen Rechtsanwalt oder eine Beratungsstelle (z. B. VdK, Sozialverband). Vor dem Absenden alle Platzhalter in [eckigen Klammern] ersetzen.
                </p>
                <DownloadButton content={result.musterschreiben} findings={result.fehler} />

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
