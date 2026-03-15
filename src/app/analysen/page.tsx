"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  FileText,
  Loader2,
  Plus,
  AlertTriangle,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SkeletonCard } from "@/components/Skeleton";

interface AnalyseEintrag {
  id: string;
  created_at: string;
  behoerde: string | null;
  rechtsgebiet: string | null;
  fehler: string[];
  frist_datum: string | null;
  dringlichkeit: string | null;
  model_used: string | null;
  token_cost_eur: number | null;
  analyse_meta: {
    erfolgschance?: number | null;
    fehler_count?: number;
    agenten_aktiv?: string[];
  } | null;
}

const ROUTING_CONFIG = {
  NOTFALL: { label: "Notfall", icon: Zap, className: "bg-red-500/15 text-red-400 border-red-500/30" },
  HOCH: { label: "Dringend", icon: AlertTriangle, className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  NORMAL: { label: "Standard", icon: CheckCircle2, className: "bg-emerald-700/20 text-emerald-600 border-emerald-700/30" },
} as const;

function AnalyseCard({ eintrag }: { eintrag: AnalyseEintrag }) {
  const routing = ROUTING_CONFIG[(eintrag.dringlichkeit as keyof typeof ROUTING_CONFIG) ?? "NORMAL"] ?? ROUTING_CONFIG.NORMAL;
  const Icon = routing.icon;
  const fehlerCount = eintrag.analyse_meta?.fehler_count ?? eintrag.fehler?.length ?? 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${routing.className}`}
            >
              <Icon size={10} />
              {routing.label}
            </span>
            {eintrag.token_cost_eur != null && (
              <span className="text-[10px] text-white/30 font-mono">
                {eintrag.token_cost_eur.toFixed(3)} EUR
              </span>
            )}
          </div>

          <h3 className="font-bold text-white text-base truncate">
            {eintrag.behoerde ?? "Unbekannte Behoerde"}
          </h3>
          <p className="text-white/50 text-xs mt-0.5">
            {eintrag.rechtsgebiet ?? "Unbekanntes Rechtsgebiet"}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-xs text-white/40">
            {new Date(eintrag.created_at).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
          <p className="text-xs text-white/30 mt-0.5">
            {new Date(eintrag.created_at).toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Kompakte Zusammenfassung */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
        <span className="text-xs text-white/40">
          {fehlerCount} {fehlerCount === 1 ? "Fehler" : "Fehler"} erkannt
        </span>
        {eintrag.frist_datum && (
          <span className="text-xs text-white/40">
            Frist: {new Date(eintrag.frist_datum).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        )}
        {eintrag.analyse_meta?.erfolgschance != null && (
          <span className="text-xs text-white/40">
            Einschaetzung: {eintrag.analyse_meta.erfolgschance}%
          </span>
        )}
        {eintrag.analyse_meta?.agenten_aktiv && (
          <span className="text-xs text-white/25 ml-auto">
            {eintrag.analyse_meta.agenten_aktiv.length} Agenten
          </span>
        )}
      </div>
    </div>
  );
}

export default function AnalysenPage() {
  const router = useRouter();
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analysen, setAnalysen] = useState<AnalyseEintrag[]>([]);

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
        router.replace("/login?next=/analysen");
        return;
      }
      setToken(session.access_token);
      setAuthReady(true);
    }
    checkAuth();
  }, [supabase, router]);

  const loadAnalysen = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/analysen", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysen(data.analysen ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authReady) loadAnalysen();
  }, [authReady, loadAnalysen]);

  if (!authReady) {
    return (
      <main className="min-h-screen bg-mesh text-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-mesh text-white flex flex-col">
      <SiteNavSimple
        backHref="/"
        backLabel="Zurueck"
        right={
          <Link
            href="/analyze"
            className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1"
          >
            <Plus size={12} />
            Neue Analyse
          </Link>
        }
      />

      <div className="max-w-3xl mx-auto px-6 py-12 flex-1 w-full">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-2">
          Historie
        </p>
        <h1 className="text-3xl font-black tracking-tight mb-2">Meine Analysen</h1>
        <p className="text-white/60 text-sm mb-8">
          Alle durchgefuehrten Bescheid-Analysen im Ueberblick.
        </p>

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : analysen.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-white/20" />
            </div>
            <p className="text-white/40 text-sm mb-6">
              Noch keine Analysen durchgefuehrt. Laden Sie einen Bescheid hoch, um zu starten.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-2xl font-bold text-[11px] uppercase tracking-widest text-white transition-all"
            >
              <Plus size={14} />
              Bescheid analysieren
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[11px] text-white/30 uppercase tracking-widest font-bold">
              {analysen.length} {analysen.length === 1 ? "Analyse" : "Analysen"}
            </p>
            {analysen.map((eintrag) => (
              <AnalyseCard key={eintrag.id} eintrag={eintrag} />
            ))}
          </div>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}
