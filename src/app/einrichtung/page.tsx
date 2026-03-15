"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import {
  Building2, Users, BarChart3, Mail, Shield, Trash2,
  Copy, Check, Plus, ChevronDown, LogOut, AlertCircle, Zap,
} from "lucide-react";

// ── Typen ────────────────────────────────────────────────────────────────────

interface OrgMember {
  id: string;
  user_id: string;
  user_email: string;
  role: "admin" | "berater";
  analyses_used: number;
  joined_at: string;
}

interface OrgInvite {
  id: string;
  email: string;
  role: "admin" | "berater";
  token: string;
  expires_at: string;
  created_at: string;
}

interface OrgData {
  id: string;
  name: string;
  org_type: string;
  subscription_type: string;
  analyses_total: number;
  analyses_used: number;
  expires_at: string | null;
}

interface StatusResponse {
  org: OrgData;
  my_role: "admin" | "berater";
  members: OrgMember[];
  invites: OrgInvite[];
  analyses_remaining: number;
}

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, string> = {
  b2b_starter: "Starter (300 Analysen/Jahr)",
  b2b_professional: "Professional (1.000 Analysen/Jahr)",
  b2b_enterprise: "Enterprise (2.500 Analysen/Jahr)",
  b2b_corporate: "Corporate (6.000 Analysen/Jahr)",
};

const ORG_TYPE_LABELS: Record<string, string> = {
  caritas: "Caritas", diakonie: "Diakonie", vdk: "VdK", sovd: "SoVD",
  awo: "AWO", drk: "DRK", schuldnerberatung: "Schuldnerberatung",
  migrationsberatung: "Migrationsberatung", jobcenter: "Jobcenter",
  sozialeinrichtung: "Sozialeinrichtung", sonstige: "Sonstige",
};

function dateStr(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function poolPercent(used: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

// ── Haupt-Komponente ─────────────────────────────────────────────────────────

export default function EinrichtungDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"uebersicht" | "mitglieder" | "einladen" | "einladungen">("uebersicht");

  // ── Auth-Token laden ──────────────────────────────────────────────────────
  useEffect(() => {
    async function loadToken() {
      const configRes = await fetch("/api/auth-config", { cache: "no-store" });
      const config = await configRes.json();
      if (!config.configured) { setError("Supabase nicht konfiguriert"); setLoading(false); return; }
      const supabase = createBrowserClient(config.url, config.anonKey);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError("login"); setLoading(false); return; }
      setToken(session.access_token);
    }
    loadToken();
  }, []);

  // ── Daten laden ───────────────────────────────────────────────────────────
  const loadStatus = useCallback(async (t: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/einrichtung/status", {
        headers: { Authorization: `Bearer ${t}` },
        cache: "no-store",
      });
      if (res.status === 404) { setError("kein_mitglied"); setLoading(false); return; }
      if (!res.ok) { setError("Fehler beim Laden der Einrichtungsdaten."); setLoading(false); return; }
      setStatus(await res.json());
    } catch {
      setError("Netzwerkfehler beim Laden.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) loadStatus(token);
  }, [token, loadStatus]);

  // ── Loading-State ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // ── Nicht eingeloggt ──────────────────────────────────────────────────────
  if (error === "login") {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Building2 className="h-12 w-12 text-[var(--accent)] mx-auto mb-5 opacity-60" />
          <h1 className="text-2xl font-black text-white mb-3">Einrichtungs-Dashboard</h1>
          <p className="text-white/40 mb-7 text-sm">Bitte einloggen um das Dashboard zu öffnen.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-bold rounded-xl text-sm hover:bg-[var(--accent-hover)] transition-colors">
            Einloggen
          </Link>
        </div>
      </main>
    );
  }

  // ── Kein Mitglied ─────────────────────────────────────────────────────────
  if (error === "kein_mitglied") {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-5 opacity-70" />
          <h1 className="text-2xl font-black text-white mb-3">Keine Einrichtung</h1>
          <p className="text-white/40 text-sm mb-7">
            Sie sind noch keiner Einrichtung zugeordnet. Falls Sie eine Einladung erhalten haben, bitte den Link aus der E-Mail öffnen.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/b2b" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-bold rounded-xl text-sm hover:bg-[var(--accent-hover)] transition-colors">
              B2B-Angebot ansehen
            </Link>
            <Link href="/" className="text-white/35 text-sm hover:text-white/60 transition-colors">
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Sonstiger Fehler ──────────────────────────────────────────────────────
  if (error) {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/" className="text-[var(--accent)] text-sm hover:underline">Zur Startseite</Link>
        </div>
      </main>
    );
  }

  if (!status) return null;

  const { org, my_role, members, invites, analyses_remaining } = status;
  const isAdmin = my_role === "admin";
  const pct = poolPercent(org.analyses_used, org.analyses_total);

  const TABS = [
    { id: "uebersicht", label: "Übersicht" },
    { id: "mitglieder", label: `Mitglieder (${members.length})` },
    ...(isAdmin ? [
      { id: "einladen", label: "Einladen" },
      { id: "einladungen", label: `Einladungen (${invites.length})` },
    ] : []),
  ] as { id: typeof activeTab; label: string }[];

  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-20">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/25 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-white text-sm sm:text-base truncate">{org.name}</p>
              <p className="text-xs text-white/30 uppercase tracking-widest">{ORG_TYPE_LABELS[org.org_type] ?? org.org_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${isAdmin ? "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]" : "border-white/10 bg-white/5 text-white/40"}`}>
              {isAdmin ? "Admin" : "Berater"}
            </span>
            <Link href="/" className="p-2 text-white/25 hover:text-white/60 transition-colors">
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto pb-px">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === t.id ? "border-[var(--accent)] text-white" : "border-transparent text-white/35 hover:text-white/60"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">

        {/* ── TAB: Übersicht ──────────────────────────────────────────────── */}
        {activeTab === "uebersicht" && (
          <OverviewTab org={org} members={members} analysesRemaining={analyses_remaining} pct={pct} planLabel={PLAN_LABELS[org.subscription_type] ?? org.subscription_type} />
        )}

        {/* ── TAB: Mitglieder ─────────────────────────────────────────────── */}
        {activeTab === "mitglieder" && (
          <MembersTab members={members} isAdmin={isAdmin} token={token!} onRefresh={() => loadStatus(token!)} />
        )}

        {/* ── TAB: Einladen ───────────────────────────────────────────────── */}
        {activeTab === "einladen" && isAdmin && (
          <InviteTab token={token!} />
        )}

        {/* ── TAB: Einladungen ────────────────────────────────────────────── */}
        {activeTab === "einladungen" && isAdmin && (
          <InvitesTab invites={invites} token={token!} onRefresh={() => loadStatus(token!)} />
        )}
      </div>
    </main>
  );
}

// ── Tab: Übersicht ────────────────────────────────────────────────────────────

function OverviewTab({ org, members, analysesRemaining, pct, planLabel }: {
  org: OrgData; members: OrgMember[]; analysesRemaining: number; pct: number; planLabel: string;
}) {
  return (
    <div className="space-y-6">
      {/* Pool-Status */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-5">Analyse-Pool</p>
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-6">
          <div>
            <span className="text-4xl sm:text-5xl font-black text-white">{analysesRemaining.toLocaleString("de-DE")}</span>
            <span className="text-white/30 ml-2 text-lg">/ {org.analyses_total.toLocaleString("de-DE")}</span>
            <p className="text-white/30 text-sm mt-1">Analysen verbleibend</p>
          </div>
          <div className="flex-grow w-full sm:w-auto">
            <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pct > 85 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-[var(--accent)]"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-white/25 mt-1.5">{pct}% verbraucht</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Plan", value: planLabel },
            { label: "Mitglieder", value: members.length },
            { label: "Verbraucht", value: org.analyses_used.toLocaleString("de-DE") },
            { label: "Gültig bis", value: org.expires_at ? dateStr(org.expires_at) : "unbegrenzt" },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-white/25 mb-1">{s.label}</p>
              <p className="text-sm font-bold text-white truncate">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top-Nutzer */}
      {members.length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-5">Nutzung nach Mitglied</p>
          <div className="space-y-3">
            {[...members].sort((a, b) => b.analyses_used - a.analyses_used).map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-xs font-black text-[var(--accent)] flex-shrink-0">
                  {m.user_email[0].toUpperCase()}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm text-white/70 truncate">{m.user_email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-white/30">{m.analyses_used} Analysen</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${m.role === "admin" ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "bg-white/5 text-white/30"}`}>
                    {m.role === "admin" ? "Admin" : "Berater"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick-Actions */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { href: "/analyze", icon: Zap, label: "Neue Analyse starten" },
          { href: "/fristen", icon: BarChart3, label: "Fristen-Dashboard" },
          { href: "/b2b", icon: Building2, label: "Plan-Übersicht" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.08] rounded-xl px-5 py-4 hover:border-[var(--accent)]/25 hover:bg-white/[0.04] transition-all"
          >
            <a.icon className="h-4 w-4 text-[var(--accent)]/60" />
            <span className="text-sm text-white/60 font-medium">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Mitglieder ───────────────────────────────────────────────────────────

function MembersTab({ members, isAdmin, token, onRefresh }: {
  members: OrgMember[]; isAdmin: boolean; token: string; onRefresh: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function changeRole(userId: string, role: "admin" | "berater") {
    setLoading(userId);
    setErr(null);
    const res = await fetch("/api/einrichtung/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ user_id: userId, role }),
    });
    const data = await res.json();
    if (!res.ok) { setErr(data.error ?? "Fehler beim Ändern"); }
    else { onRefresh(); }
    setLoading(null);
  }

  async function removeMember(userId: string) {
    setLoading(userId);
    setErr(null);
    const res = await fetch("/api/einrichtung/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ user_id: userId }),
    });
    const data = await res.json();
    if (!res.ok) { setErr(data.error ?? "Fehler beim Entfernen"); }
    else { onRefresh(); }
    setLoading(null);
    setConfirm(null);
  }

  return (
    <div className="space-y-4">
      {err && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{err}</p>}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <Users className="h-4 w-4 text-[var(--accent)]/60" />
          <p className="font-bold text-sm text-white">{members.length} {members.length === 1 ? "Mitglied" : "Mitglieder"}</p>
        </div>
        <div className="divide-y divide-white/5">
          {members.map((m) => (
            <div key={m.id} className="px-5 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
              <div className="w-9 h-9 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/15 flex items-center justify-center text-xs font-black text-[var(--accent)] flex-shrink-0">
                {m.user_email[0].toUpperCase()}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm text-white/80 truncate font-medium">{m.user_email}</p>
                <p className="text-xs text-white/25">Dabei seit {dateStr(m.joined_at)} · {m.analyses_used} Analysen</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isAdmin ? (
                  <>
                    <RoleToggle
                      role={m.role}
                      disabled={loading === m.user_id}
                      onChange={(r) => changeRole(m.user_id, r)}
                    />
                    {confirm === m.user_id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => removeMember(m.user_id)}
                          disabled={loading === m.user_id}
                          className="px-3 py-1.5 bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/25 transition-colors"
                        >
                          Bestätigen
                        </button>
                        <button onClick={() => setConfirm(null)} className="px-3 py-1.5 text-white/30 text-xs hover:text-white/60 transition-colors">
                          Abbrechen
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirm(m.user_id)}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors"
                        title="Mitglied entfernen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </>
                ) : (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${m.role === "admin" ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "bg-white/5 text-white/30"}`}>
                    {m.role === "admin" ? "Admin" : "Berater"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoleToggle({ role, disabled, onChange }: {
  role: "admin" | "berater"; disabled: boolean; onChange: (r: "admin" | "berater") => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-bold transition-colors ${role === "admin" ? "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]" : "border-white/10 bg-white/5 text-white/40 hover:border-white/20"}`}
      >
        {role === "admin" ? "Admin" : "Berater"}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden shadow-xl">
          {(["admin", "berater"] as const).map((r) => (
            <button
              key={r}
              onClick={() => { onChange(r); setOpen(false); }}
              className={`block w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors ${r === role ? "text-[var(--accent)]" : "text-white/60"}`}
            >
              {r === "admin" ? "Admin" : "Berater"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Einladen ─────────────────────────────────────────────────────────────

function InviteTab({ token }: { token: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"berater" | "admin">("berater");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function createInvite() {
    setLoading(true);
    setErr(null);
    setInviteLink(null);
    const res = await fetch("/api/einrichtung/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    if (!res.ok) { setErr(data.error ?? "Fehler"); setLoading(false); return; }
    const link = `${window.location.origin}/einrichtung/einladen?token=${data.token}`;
    setInviteLink(link);
    setEmail("");
    setLoading(false);
  }

  function copyLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="max-w-lg space-y-5">
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="h-4 w-4 text-[var(--accent)]/60" />
          <p className="font-bold text-white">Neue Einladung erstellen</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">E-Mail-Adresse</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="berater@einrichtung.de"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--accent)]/40"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Rolle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "berater" | "admin")}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white/70 text-sm focus:outline-none focus:border-[var(--accent)]/40"
            >
              <option value="berater">Berater — kann analysieren, eigene Fälle verwalten</option>
              <option value="admin">Admin — zusätzlich: Mitglieder einladen und verwalten</option>
            </select>
          </div>

          {err && <p className="text-red-400 text-sm">{err}</p>}

          <button
            onClick={createInvite}
            disabled={loading || !email.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-sm transition-all disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            {loading ? "Wird erstellt..." : "Einladungslink erstellen"}
          </button>
        </div>
      </div>

      {inviteLink && (
        <div className="bg-green-500/[0.06] border border-green-500/20 rounded-2xl p-6">
          <p className="text-green-400 font-bold text-sm mb-3">Einladungslink erstellt</p>
          <p className="text-white/40 text-sm mb-4">Senden Sie diesen Link per E-Mail oder Messenger. Gültig 14 Tage.</p>
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3">
            <code className="flex-grow text-xs text-white/60 break-all">{inviteLink}</code>
            <button onClick={copyLink} className="flex-shrink-0 p-1.5 text-white/30 hover:text-[var(--accent)] transition-colors">
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          {copied && <p className="text-green-400 text-sm mt-2">Link kopiert!</p>}
        </div>
      )}
    </div>
  );
}

// ── Tab: Einladungen ──────────────────────────────────────────────────────────

function InvitesTab({ invites, token, onRefresh }: {
  invites: OrgInvite[]; token: string; onRefresh: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function revoke(inviteId: string) {
    setLoading(inviteId);
    await fetch("/api/einrichtung/invite", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ invite_id: inviteId }),
    });
    onRefresh();
    setLoading(null);
  }

  function copyLink(t: string) {
    const link = `${window.location.origin}/einrichtung/einladen?token=${t}`;
    navigator.clipboard.writeText(link);
    setCopied(t);
    setTimeout(() => setCopied(null), 2000);
  }

  if (invites.length === 0) {
    return (
      <div className="text-center py-20 text-white/20">
        <Mail className="h-10 w-10 mx-auto mb-4 opacity-30" />
        <p className="text-sm">Keine offenen Einladungen</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <p className="font-bold text-sm text-white">Offene Einladungen</p>
        <p className="text-xs text-white/25 mt-0.5">Einladungen die noch nicht angenommen wurden</p>
      </div>
      <div className="divide-y divide-white/5">
        {invites.map((inv) => (
          <div key={inv.id} className="px-5 sm:px-6 py-4 flex items-center gap-3">
            <Shield className="h-4 w-4 text-white/15 flex-shrink-0" />
            <div className="flex-grow min-w-0">
              <p className="text-sm text-white/70 font-medium truncate">{inv.email}</p>
              <p className="text-xs text-white/25">
                {inv.role === "admin" ? "Admin" : "Berater"} · Läuft ab {dateStr(inv.expires_at)}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => copyLink(inv.token)}
                className="p-2 text-white/25 hover:text-[var(--accent)] transition-colors"
                title="Link kopieren"
              >
                {copied === inv.token ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => revoke(inv.id)}
                disabled={loading === inv.id}
                className="p-2 text-white/20 hover:text-red-400 transition-colors"
                title="Widerrufen"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
