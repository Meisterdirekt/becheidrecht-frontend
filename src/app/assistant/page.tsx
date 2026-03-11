"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  Building2,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Copy,
  Download,
} from "lucide-react";
import { TRAEGER_OPTIONS } from "@/lib/letter-generator";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types & Steps
// ---------------------------------------------------------------------------

type Schritt = 1 | 2 | 3 | 4;

const SCHRITT_LABELS: Record<Schritt, string> = {
  1: "Behörde",
  2: "Ihr Anliegen",
  3: "Rückfragen",
  4: "Musterschreiben",
};

// ---------------------------------------------------------------------------
// Step Indicator
// ---------------------------------------------------------------------------

function StepIndicator({ current }: { current: Schritt }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {([1, 2, 3, 4] as Schritt[]).map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all ${
                step < current
                  ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                  : step === current
                  ? "bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)]"
                  : "bg-white/5 border-white/10 text-white/30"
              }`}
            >
              {step < current ? <CheckCircle2 size={14} /> : step}
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${
                step <= current ? "text-white/60" : "text-white/20"
              }`}
            >
              {SCHRITT_LABELS[step]}
            </span>
          </div>
          {i < 3 && (
            <div className="flex-1 mx-2 mb-4 h-[1px] bg-white/10 relative overflow-hidden rounded-full">
              <div
                className={`absolute inset-y-0 left-0 bg-[var(--accent)]/50 transition-all duration-500 ${
                  step < current ? "w-full" : "w-0"
                }`}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schritt 1: Behörde wählen
// ---------------------------------------------------------------------------

function Schritt1({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Welche Behörde hat Ihnen geschrieben?</h2>
      <p className="text-white/50 text-sm mb-6">
        Wählen Sie die zuständige Behörde aus.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TRAEGER_OPTIONS.map((t) => (
          <button
            key={t.value}
            onClick={() => onSelect(t.value)}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
              selected === t.value
                ? "bg-[var(--accent)]/10 border-[var(--accent)] text-white"
                : "bg-white/[0.03] border-white/10 text-white/70 hover:border-white/30 hover:text-white"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                selected === t.value
                  ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                  : "bg-white/5 text-white/30"
              }`}
            >
              <Building2 size={16} />
            </div>
            <span className="text-sm font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schritt 2: Anliegen beschreiben
// ---------------------------------------------------------------------------

function Schritt2({
  beschreibung,
  onChange,
}: {
  beschreibung: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Was ist Ihr Anliegen?</h2>
      <p className="text-white/50 text-sm mb-6">
        Beschreiben Sie kurz, wogegen Sie Widerspruch einlegen möchten und was Ihnen unklar oder
        falsch vorkommt.
      </p>

      <textarea
        value={beschreibung}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Beispiel:\n\nDas Jobcenter hat meinen Antrag auf Grundsicherungsgeld (ehem. Bürgergeld) abgelehnt. Sie schreiben, mein Einkommen übersteige die Grenze, aber ich glaube, sie haben meine Mietkosten nicht korrekt einberechnet. Der Bescheid ist vom 15.02.2026.`}
        rows={8}
        maxLength={1000}
        className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white/90 placeholder:text-white/20 resize-none focus:outline-none focus:border-white/20 leading-relaxed"
      />
      <p className="text-right text-[11px] text-white/30 mt-1">{beschreibung.length}/1000</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schritt 3: Rückfragen (KI stellt Fragen, Nutzer antwortet)
// ---------------------------------------------------------------------------

function Schritt3({
  fragen,
  antworten,
  onChange,
  loading,
}: {
  fragen: string;
  antworten: string;
  onChange: (v: string) => void;
  loading: boolean;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Rückfragen des Assistenten</h2>
      <p className="text-white/50 text-sm mb-6">
        Bitte beantworten Sie die folgenden Fragen für ein besseres Musterschreiben.
      </p>

      {loading ? (
        <div className="flex items-center gap-3 py-8 text-white/40">
          <Loader2 className="animate-spin h-5 w-5" />
          <span className="text-sm">Assistent analysiert Ihre Angaben...</span>
        </div>
      ) : (
        <>
          <div className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl mb-5 text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
            {fragen || "…"}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">
              Ihre Antworten
            </label>
            <textarea
              value={antworten}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Schreiben Sie hier Ihre Antworten auf die obigen Fragen..."
              rows={6}
              maxLength={800}
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white/90 placeholder:text-white/20 resize-none focus:outline-none focus:border-white/20"
            />
            <p className="text-right text-[11px] text-white/30 mt-1">{antworten.length}/800</p>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schritt 4: Musterschreiben
// ---------------------------------------------------------------------------

function Schritt4({
  musterschreiben,
  loading,
}: {
  musterschreiben: string;
  loading: boolean;
}) {
  function copyToClipboard() {
    navigator.clipboard.writeText(musterschreiben).then(() => {
      toast.success("Kopiert!");
    });
  }

  function downloadTxt() {
    const blob = new Blob([musterschreiben], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Widerspruch_BescheidRecht.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Datei wird heruntergeladen");
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Ihr Musterschreiben</h2>
      <p className="text-white/50 text-sm mb-6">
        Prüfen Sie den Entwurf und ersetzen Sie alle Platzhalter in [eckigen Klammern].
      </p>

      {loading && !musterschreiben && (
        <div className="flex items-center gap-3 py-8 text-white/40">
          <Loader2 className="animate-spin h-5 w-5" />
          <span className="text-sm">Schreiben wird generiert...</span>
        </div>
      )}

      {musterschreiben && (
        <>
          <div className="flex gap-2 mb-4">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              <Copy size={12} />
              Kopieren
            </button>
            <button
              onClick={downloadTxt}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              <Download size={12} />
              Herunterladen
            </button>
          </div>

          <div className="p-6 bg-white/[0.04] border border-white/10 rounded-2xl text-sm text-white/80 whitespace-pre-wrap leading-relaxed font-mono">
            {musterschreiben}
          </div>

          {/* RDG-Disclaimer — nur sichtbar, NICHT im Download */}
          <p className="text-[11px] text-amber-400/70 border border-amber-400/20 rounded-xl px-4 py-2.5 mt-4 leading-relaxed">
            ⚠ Dieser Entwurf wurde von einer KI erstellt und stellt keine Rechtsberatung im Sinne des § 2 RDG dar. Er ersetzt nicht die Beratung durch einen Rechtsanwalt oder eine Beratungsstelle (z. B. VdK, Sozialverband). Vor dem Absenden alle Platzhalter in [eckigen Klammern] ersetzen.
          </p>

          {loading && (
            <div className="flex items-center gap-2 mt-3 text-white/30 text-[11px]">
              <Loader2 className="animate-spin h-3 w-3" />
              Schreiben wird vervollständigt...
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AssistantPage() {
  const router = useRouter();
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Wizard State
  const [schritt, setSchritt] = useState<Schritt>(1);
  const [traeger, setTraeger] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [fragen, setFragen] = useState("");
  const [antworten, setAntworten] = useState("");
  const [musterschreiben, setMusterschreiben] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Auth
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/auth-config", { cache: "no-store" });
        const data = await res.json();
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
    }
    init();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    async function checkAuth() {
      const { data: { session } } = await supabase!.auth.getSession();
      if (!session) {
        router.replace("/login?next=/assistant");
        return;
      }
      setToken(session.access_token);
      setAuthReady(true);
    }
    checkAuth();
  }, [supabase, router]);

  // ---------------------------------------------------------------------------
  // SSE Stream Reader
  // ---------------------------------------------------------------------------

  async function streamRequest(
    body: object,
    onDelta: (text: string) => void,
    onDone: () => void
  ) {
    const controller = new AbortController();
    abortRef.current = controller;

    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Fehler beim Laden.");
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

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
          if (event.type === "delta") onDelta(event.text);
          if (event.type === "done") onDone();
          if (event.type === "error") throw new Error(event.message);
        } catch (e) {
          if (e instanceof Error && e.message !== "Fehler") throw e;
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  function canProceed(): boolean {
    if (schritt === 1) return !!traeger;
    if (schritt === 2) return beschreibung.trim().length > 20;
    if (schritt === 3) return antworten.trim().length > 5;
    return false;
  }

  async function handleWeiter() {
    setError(null);

    if (schritt === 2) {
      // Schritt 2 → 3: KI stellt Rückfragen
      setSchritt(3);
      setLoading(true);
      setFragen("");
      let accumulated = "";
      try {
        await streamRequest(
          { traeger, beschreibung, schritt: "analyse" },
          (text) => {
            accumulated += text;
            setFragen(accumulated);
          },
          () => setLoading(false)
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (schritt === 3) {
      // Schritt 3 → 4: Musterschreiben erstellen
      setSchritt(4);
      setLoading(true);
      setMusterschreiben("");
      let accumulated = "";
      try {
        await streamRequest(
          { traeger, beschreibung, antworten, schritt: "erstelle" },
          (text) => {
            accumulated += text;
            setMusterschreiben(accumulated);
          },
          () => setLoading(false)
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        setLoading(false);
      }
      return;
    }

    setSchritt((s) => Math.min(4, s + 1) as Schritt);
  }

  function handleZurueck() {
    abortRef.current?.abort();
    setLoading(false);
    setError(null);
    setSchritt((s) => Math.max(1, s - 1) as Schritt);
  }

  if (!authReady) {
    return (
      <main className="min-h-screen bg-mesh text-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mesh text-white flex flex-col">
      <SiteNavSimple
        backHref="/"
        backLabel="Startseite"
        right={
          <Link
            href="/analyze"
            className="text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white/70"
          >
            Direkte Analyse
          </Link>
        }
      />

      <div className="max-w-2xl mx-auto px-6 py-12 flex-1 w-full">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-2">
          Widerspruchs-Assistent
        </p>
        <h1 className="text-3xl font-black tracking-tight mb-8">
          Schritt für Schritt zum Widerspruch
        </h1>

        <StepIndicator current={schritt} />

        {/* Schritt Content */}
        <div className="min-h-[300px] animate-fadeIn" key={schritt}>
          {schritt === 1 && (
            <Schritt1 selected={traeger} onSelect={setTraeger} />
          )}
          {schritt === 2 && (
            <Schritt2 beschreibung={beschreibung} onChange={setBeschreibung} />
          )}
          {schritt === 3 && (
            <Schritt3
              fragen={fragen}
              antworten={antworten}
              onChange={setAntworten}
              loading={loading && !fragen}
            />
          )}
          {schritt === 4 && (
            <Schritt4 musterschreiben={musterschreiben} loading={loading} />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl animate-fadeIn" role="alert">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <button
            onClick={handleZurueck}
            disabled={schritt === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/50 text-[11px] font-bold uppercase tracking-widest hover:border-white/20 hover:text-white/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
            Zurück
          </button>

          {schritt < 4 ? (
            <button
              onClick={handleWeiter}
              disabled={!canProceed() || loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Bitte warten...
                </>
              ) : schritt === 3 ? (
                <>
                  Schreiben erstellen
                  <ChevronRight size={14} />
                </>
              ) : (
                <>
                  Weiter
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          ) : (
            <Link
              href="/fristen"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[11px] font-bold uppercase tracking-widest transition-all"
            >
              <FileText size={14} />
              Zu meinen Fristen
            </Link>
          )}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
