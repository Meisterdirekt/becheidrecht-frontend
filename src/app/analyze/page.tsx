"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import DownloadButton from "@/components/DownloadButton";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

interface AnalysisResult {
  zuordnung?: { behoerde: string; rechtsgebiet: string; untergebiet: string };
  fehler: string[];
  musterschreiben: string;
}

export default function AnalyzePage() {
  const router = useRouter();
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysesRemaining, setAnalysesRemaining] = useState<number | null>(null);

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
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        router.replace("/login?next=/analyze");
        return;
      }
      setAuthReady(true);
      const token = session.access_token;
      const statusRes = await fetch("/api/subscription-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (cancelled) return;
      if (statusRes.ok) {
        const data = await statusRes.json();
        setAnalysesRemaining(data.analyses_remaining ?? 0);
      } else {
        setAnalysesRemaining(0);
      }
    }
    checkAuth();
    return () => { cancelled = true; };
  }, [configLoading, supabase, router]);

  const handleUpload = async () => {
    if (!file || !supabase || !authReady) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/login?next=/analyze");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });
      const data = await analyzeRes.json();
      if (!analyzeRes.ok) {
        if (analyzeRes.status === 401) {
          router.replace("/login?next=/analyze");
          return;
        }
        setError(data.error || "Analyse fehlgeschlagen.");
        return;
      }
      setResult({
        zuordnung: data.zuordnung,
        fehler: data.fehler ?? [],
        musterschreiben: data.musterschreiben ?? "",
      });
      const useRes = await fetch("/api/use-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (useRes.ok) {
        const useData = await useRes.json();
        setAnalysesRemaining(useData.analyses_remaining ?? 0);
      } else if (useRes.status === 403) {
        setAnalysesRemaining(0);
      }
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  };

  if (configLoading || !authReady) {
    return (
      <main className="min-h-screen bg-mesh text-white flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-white/60">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm uppercase tracking-widest">Lade …</span>
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
            <Link href="/" className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent)] hover:text-[var(--accent-hover)]">
              Startseite
            </Link>
          </>
        }
      />
      <div className="max-w-3xl mx-auto px-6 py-12 flex-1 w-full">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-2">Analyse</p>
        <h1 className="text-3xl font-black tracking-tight mb-2">Bescheid analysieren</h1>
        <p className="text-white/60 text-sm mb-10">
          PDF oder Foto des Bescheids hochladen – z. B. Schreiben abfotografieren und hier einreichen. Sie erhalten eine strukturierte Auswertung und ein Musterschreiben.
        </p>

        <div className="max-w-xl p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.03] mb-10 hover:border-white/20 transition-colors">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center text-[var(--accent)]">
              <Upload size={32} />
            </div>
            <p className="text-sm text-gray-500 text-center">PDF oder Bild (JPEG, PNG, WebP – max. 10 MB)</p>
            <p className="text-xs text-white/40 text-center">Auch Foto vom Handy: Bescheid abfotografieren und hochladen.</p>
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
                  disabled={loading || analysesRemaining === 0}
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

        {analysesRemaining === 0 && (
          <div className="mb-10 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-200 text-sm">
              Keine Analysen mehr verfügbar. Bitte erwerben Sie ein Abo oder Einzelanalyse.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-10 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-8">
            {result.zuordnung && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">Zuordnung</h2>
                <p className="text-sm text-white/80">
                  {result.zuordnung.behoerde} · {result.zuordnung.rechtsgebiet}
                  {result.zuordnung.untergebiet && ` · ${result.zuordnung.untergebiet}`}
                </p>
              </div>
            )}
            {result.fehler.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
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
            {result.musterschreiben && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">Musterschreiben</h2>
                <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed mb-6">
                  {result.musterschreiben}
                </pre>
                <DownloadButton content={result.musterschreiben} />
              </div>
            )}
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
