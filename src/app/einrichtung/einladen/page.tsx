"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Building2, CheckCircle2, AlertCircle, LogIn, UserPlus } from "lucide-react";

interface InviteInfo {
  valid: boolean;
  invite_id: string;
  email: string;
  role: "admin" | "berater";
  expires_at: string;
  org: {
    id: string;
    name: string;
    org_type: string;
  };
}

const ORG_TYPE_LABELS: Record<string, string> = {
  caritas: "Caritas", diakonie: "Diakonie", vdk: "VdK", sovd: "SoVD",
  awo: "AWO", drk: "DRK", schuldnerberatung: "Schuldnerberatung",
  migrationsberatung: "Migrationsberatung", jobcenter: "Jobcenter",
  sozialeinrichtung: "Sozialeinrichtung", sonstige: "Sonstige",
};

export default function EinladungPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  // Invite-Info laden
  useEffect(() => {
    if (!token) { setLoadError("Kein Einladungs-Token angegeben."); return; }
    fetch(`/api/einrichtung/invite/accept?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) { setLoadError(data.error ?? "Ungültiger Einladungslink"); return; }
        setInvite(data);
      })
      .catch(() => setLoadError("Netzwerkfehler beim Laden der Einladung."));
  }, [token]);

  // Auth-Status prüfen
  useEffect(() => {
    async function checkAuth() {
      const configRes = await fetch("/api/auth-config", { cache: "no-store" });
      const config = await configRes.json();
      if (!config.configured) { setIsLoggedIn(false); return; }
      const supabase = createBrowserClient(config.url, config.anonKey);
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setAuthToken(session?.access_token ?? null);
    }
    checkAuth();
  }, []);

  async function accept() {
    if (!authToken || !token) return;
    setAccepting(true);
    setAcceptError(null);
    const res = await fetch("/api/einrichtung/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) { setAcceptError(data.error ?? "Beitritt fehlgeschlagen"); setAccepting(false); return; }
    setAccepted(true);
    setAccepting(false);
  }

  const redirectAfterLogin = `/einrichtung/einladen?token=${token}`;

  // ── Fehler: Token ungültig ────────────────────────────────────────────────
  if (loadError) {
    return (
      <PageShell>
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-5" />
        <h1 className="text-2xl font-black text-white mb-3">Einladung ungültig</h1>
        <p className="text-white/40 text-sm mb-6">{loadError}</p>
        <Link href="/" className="text-[var(--accent)] text-sm hover:underline">Zur Startseite</Link>
      </PageShell>
    );
  }

  // ── Laden ─────────────────────────────────────────────────────────────────
  if (!invite || isLoggedIn === null) {
    return (
      <PageShell>
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
      </PageShell>
    );
  }

  // ── Erfolgreich beigetreten ───────────────────────────────────────────────
  if (accepted) {
    return (
      <PageShell>
        <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-5" />
        <h1 className="text-2xl font-black text-white mb-3">Willkommen!</h1>
        <p className="text-white/50 text-sm mb-2">
          Sie sind jetzt Mitglied von <strong className="text-white">{invite.org.name}</strong>.
        </p>
        <p className="text-white/30 text-sm mb-7">
          Rolle: {invite.role === "admin" ? "Admin" : "Berater"}
        </p>
        <Link
          href="/einrichtung"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-[var(--accent)] text-white font-bold rounded-xl text-sm hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Building2 className="h-4 w-4" />
          Zum Einrichtungs-Dashboard
        </Link>
      </PageShell>
    );
  }

  // ── Einladungs-Anzeige ────────────────────────────────────────────────────
  return (
    <PageShell>
      <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/25 flex items-center justify-center mx-auto mb-6">
        <Building2 className="h-6 w-6 text-[var(--accent)]" />
      </div>

      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3">Einladung</p>
      <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
        {invite.org.name}
      </h1>
      <p className="text-white/30 text-sm mb-7">
        {ORG_TYPE_LABELS[invite.org.org_type] ?? invite.org.org_type} · BescheidRecht B2B
      </p>

      <div className="bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 mb-7 text-left space-y-2">
        <InfoRow label="Eingeladen als" value={invite.role === "admin" ? "Admin" : "Berater"} />
        <InfoRow label="Für" value={invite.org.name} />
        <InfoRow label="Gültig bis" value={new Date(invite.expires_at).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })} />
      </div>

      {acceptError && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
          {acceptError}
        </p>
      )}

      {isLoggedIn ? (
        <button
          onClick={accept}
          disabled={accepting}
          className="w-full flex items-center justify-center gap-2.5 py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-[15px] transition-all disabled:opacity-50 shadow-lg shadow-blue-600/15"
        >
          <Building2 className="h-5 w-5" />
          {accepting ? "Wird bearbeitet..." : "Einrichtung beitreten"}
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-white/35 text-sm mb-4">Bitte einloggen oder registrieren um beizutreten.</p>
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectAfterLogin)}`}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--accent)] text-white font-bold rounded-xl text-sm hover:bg-[var(--accent-hover)] transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Einloggen und beitreten
          </Link>
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectAfterLogin)}`}
            className="w-full flex items-center justify-center gap-2 py-3.5 border border-white/10 text-white/60 font-bold rounded-xl text-sm hover:border-white/20 hover:text-white transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Registrieren und beitreten
          </Link>
        </div>
      )}

      <p className="text-white/20 text-xs mt-6">
        Mit dem Beitritt stimmen Sie der Verarbeitung Ihrer Daten gemäß{" "}
        <Link href="/datenschutz" className="underline hover:text-white/40">Datenschutzerklärung</Link> zu.
      </p>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center">
        {children}
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-[11px] uppercase tracking-widest text-white/25 font-bold">{label}</span>
      <span className="text-sm text-white/70 font-medium">{value}</span>
    </div>
  );
}
