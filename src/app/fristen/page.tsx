"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
} from "lucide-react";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SkeletonCard } from "@/components/Skeleton";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Frist {
  id: string;
  behoerde: string | null;
  rechtsgebiet: string | null;
  untergebiet: string | null;
  bescheid_datum: string | null;
  frist_datum: string | null;
  status: "offen" | "eingereicht" | "erledigt" | "abgelaufen";
  notizen: string | null;
  created_at: string;
  tage_verbleibend: number | null;
  analyse_meta?: { auffaelligkeiten?: string[] } | null;
}

// ---------------------------------------------------------------------------
// Status Config
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  offen: {
    label: "Offen",
    icon: Clock,
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  eingereicht: {
    label: "Eingereicht",
    icon: FileText,
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  erledigt: {
    label: "Erledigt",
    icon: CheckCircle2,
    className: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  abgelaufen: {
    label: "Abgelaufen",
    icon: XCircle,
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
} as const;

// ---------------------------------------------------------------------------
// Frist Card
// ---------------------------------------------------------------------------

function FristCard({
  frist,
  token,
  onUpdate,
}: {
  frist: Frist;
  token: string;
  onUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notizInput, setNotizInput] = useState(frist.notizen ?? "");
  const [updating, setUpdating] = useState(false);

  const cfg = STATUS_CONFIG[frist.status] ?? STATUS_CONFIG.offen;
  const Icon = cfg.icon;

  const tageText =
    frist.tage_verbleibend === null
      ? "Kein Datum"
      : frist.tage_verbleibend > 0
      ? `Noch ${frist.tage_verbleibend} Tag${frist.tage_verbleibend === 1 ? "" : "e"}`
      : frist.tage_verbleibend === 0
      ? "Heute!"
      : `${Math.abs(frist.tage_verbleibend)} Tag${Math.abs(frist.tage_verbleibend) === 1 ? "" : "e"} überschritten`;

  const istDringend =
    frist.status === "offen" &&
    frist.tage_verbleibend !== null &&
    frist.tage_verbleibend <= 7 &&
    frist.tage_verbleibend >= 0;

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    try {
      await fetch("/api/fristen", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: frist.id, status: newStatus }),
      });
      onUpdate();
      toast.success("Status geändert");
    } finally {
      setUpdating(false);
    }
  }

  async function saveNotiz() {
    setUpdating(true);
    try {
      await fetch("/api/fristen", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: frist.id, notizen: notizInput }),
      });
      onUpdate();
      toast.success("Notiz gespeichert");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border bg-white/[0.03] transition-all ${
        istDringend ? "border-amber-500/40" : "border-white/10"
      }`}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${cfg.className}`}
              >
                <Icon size={10} />
                {cfg.label}
              </span>
              {istDringend && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-amber-500/20 text-amber-300 border-amber-500/40">
                  <AlertTriangle size={10} />
                  Dringend
                </span>
              )}
            </div>

            <h3 className="font-bold text-white text-base truncate">
              {frist.behoerde ?? "Unbekannte Behörde"}
            </h3>
            <p className="text-white/50 text-xs mt-0.5">
              {[frist.rechtsgebiet, frist.untergebiet].filter(Boolean).join(" · ")}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            {frist.frist_datum && (
              <p className="text-xs text-white/40 mb-0.5">
                Frist:{" "}
                {new Date(frist.frist_datum).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            )}
            <p
              className={`text-sm font-bold ${
                frist.status !== "offen"
                  ? "text-white/40"
                  : frist.tage_verbleibend !== null && frist.tage_verbleibend <= 0
                  ? "text-red-400"
                  : frist.tage_verbleibend !== null && frist.tage_verbleibend <= 7
                  ? "text-amber-400"
                  : "text-green-400"
              }`}
            >
              {frist.status === "offen" ? tageText : "–"}
            </p>
          </div>
        </div>

        {/* Quick-Actions */}
        {frist.status === "offen" && (
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() => updateStatus("eingereicht")}
              disabled={updating}
              className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold uppercase tracking-widest hover:bg-blue-500/20 transition-colors disabled:opacity-50"
            >
              Als eingereicht markieren
            </button>
            <button
              onClick={() => updateStatus("erledigt")}
              disabled={updating}
              className="px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-[11px] font-bold uppercase tracking-widest hover:bg-green-500/20 transition-colors disabled:opacity-50"
            >
              Erledigt
            </button>
          </div>
        )}

        {frist.status === "eingereicht" && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => updateStatus("erledigt")}
              disabled={updating}
              className="px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-[11px] font-bold uppercase tracking-widest hover:bg-green-500/20 transition-colors disabled:opacity-50"
            >
              Erledigt
            </button>
            <button
              onClick={() => updateStatus("offen")}
              disabled={updating}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Zurück zu offen
            </button>
          </div>
        )}
      </div>

      {/* Expand Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-2 border-t border-white/5 flex items-center justify-between text-white/30 hover:text-white/60 text-[11px] uppercase tracking-widest font-bold transition-colors"
      >
        <span>Details & Notizen</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Details */}
      <div className={`expand-collapse ${expanded ? "expanded" : ""}`}>
        <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
          {frist.analyse_meta?.auffaelligkeiten &&
            frist.analyse_meta.auffaelligkeiten.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
                  Auffälligkeiten
                </p>
                <ul className="space-y-1">
                  {frist.analyse_meta.auffaelligkeiten.map((a, i) => (
                    <li key={i} className="text-sm text-white/60 flex gap-2">
                      <span className="text-[var(--accent)] mt-0.5 flex-shrink-0">·</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
              Notiz
            </p>
            <textarea
              value={notizInput}
              onChange={(e) => setNotizInput(e.target.value)}
              placeholder="Eigene Notizen zum Vorgang..."
              rows={3}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:border-white/20"
            />
            <button
              onClick={saveNotiz}
              disabled={updating}
              className="mt-2 px-4 py-1.5 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {updating && <Loader2 size={12} className="animate-spin" />}
              Notiz speichern
            </button>
          </div>

          <p className="text-[10px] text-white/20">
            Angelegt:{" "}
            {new Date(frist.created_at).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function FristenPage() {
  const router = useRouter();
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fristen, setFristen] = useState<Frist[]>([]);
  const [filter, setFilter] = useState<"alle" | "offen" | "eingereicht" | "erledigt" | "abgelaufen">("offen");

  // Auth init
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
        router.replace("/login?next=/fristen");
        return;
      }
      setToken(session.access_token);
      setAuthReady(true);
    }
    checkAuth();
  }, [supabase, router]);

  const loadFristen = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/fristen", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFristen(data.fristen ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authReady) loadFristen();
  }, [authReady, loadFristen]);

  const filteredFristen = fristen.filter((f) =>
    filter === "alle" ? true : f.status === filter
  );

  const counts = {
    alle: fristen.length,
    offen: fristen.filter((f) => f.status === "offen").length,
    eingereicht: fristen.filter((f) => f.status === "eingereicht").length,
    erledigt: fristen.filter((f) => f.status === "erledigt").length,
    abgelaufen: fristen.filter((f) => f.status === "abgelaufen").length,
  };

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
        backLabel="Zurück"
        right={
          <Link
            href="/analyze"
            className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1"
          >
            <Plus size={12} />
            Neuer Bescheid
          </Link>
        }
      />

      <div className="max-w-3xl mx-auto px-6 py-12 flex-1 w-full">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-2">
          Fristen-Tracker
        </p>
        <h1 className="text-3xl font-black tracking-tight mb-2">Meine Widerspruchsfristen</h1>
        <p className="text-white/60 text-sm mb-8">
          Hier siehst du alle erkannten Fristen aus deinen analysierten Bescheiden.
        </p>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {(["offen", "eingereicht", "alle", "erledigt", "abgelaufen"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-colors ${
                filter === f
                  ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                  : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
              }`}
            >
              {f === "alle" ? "Alle" : STATUS_CONFIG[f]?.label ?? f}
              {counts[f] > 0 && (
                <span className="ml-1.5 opacity-70">({counts[f]})</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredFristen.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock size={28} className="text-white/20" />
            </div>
            <p className="text-white/40 text-sm mb-6">
              {filter === "offen"
                ? "Keine offenen Fristen. Analysiere einen Bescheid, um Fristen automatisch zu erfassen."
                : `Keine ${STATUS_CONFIG[filter as keyof typeof STATUS_CONFIG]?.label ?? filter} Fristen.`}
            </p>
            {filter === "offen" && (
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-2xl font-bold text-[11px] uppercase tracking-widest text-white transition-all"
              >
                <Plus size={14} />
                Bescheid analysieren
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFristen.map((frist) => (
              <FristCard
                key={frist.id}
                frist={frist}
                token={token!}
                onUpdate={loadFristen}
              />
            ))}
          </div>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}
