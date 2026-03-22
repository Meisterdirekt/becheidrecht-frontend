"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { User, Download, Trash2, Save, Loader2, LogOut, AlertTriangle } from "lucide-react";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

interface ProfileData {
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  email: string;
  consent_given?: boolean;
  consent_timestamp?: string;
}

export default function KontoPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({ first_name: "", last_name: "", street: "", city: "", email: "" });
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const res = await fetch("/api/auth-config", { cache: "no-store" });
        const cfg = await res.json();
        const url = cfg.configured ? cfg.url : process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = cfg.configured ? cfg.anonKey : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) { router.replace("/login?next=/konto"); return; }
        const supabase = createBrowserClient(url, key);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.replace("/login?next=/konto"); return; }
        if (cancelled) return;

        setToken(session.access_token);
        const meta = session.user.user_metadata ?? {};
        const p: ProfileData = {
          first_name: meta.first_name ?? "",
          last_name: meta.last_name ?? "",
          street: meta.street ?? "",
          city: meta.city ?? "",
          email: session.user.email ?? "",
          consent_given: meta.consent_given,
          consent_timestamp: meta.consent_timestamp,
        };
        setProfile(p);
        setOriginalProfile(p);
      } catch {
        router.replace("/login?next=/konto");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [router]);

  const hasChanges = originalProfile && (
    profile.first_name !== originalProfile.first_name ||
    profile.last_name !== originalProfile.last_name ||
    profile.street !== originalProfile.street ||
    profile.city !== originalProfile.city
  );

  const handleSave = useCallback(async () => {
    if (!token || !hasChanges) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          street: profile.street,
          city: profile.city,
        }),
      });
      if (res.ok) {
        setSaveMsg("Profil gespeichert.");
        setOriginalProfile({ ...profile });
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveMsg(data.error || "Fehler beim Speichern.");
      }
    } catch {
      setSaveMsg("Netzwerkfehler.");
    } finally {
      setSaving(false);
    }
  }, [token, profile, hasChanges]);

  const handleExport = useCallback(async () => {
    if (!token) return;
    setExporting(true);
    try {
      const res = await fetch("/api/account/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bescheidrecht-datenexport-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, [token]);

  const handleDelete = useCallback(async () => {
    if (!token) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      if (res.ok) {
        router.replace("/?deleted=1");
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Löschung fehlgeschlagen.");
      }
    } catch {
      setDeleteError("Netzwerkfehler.");
    } finally {
      setDeleting(false);
    }
  }, [token, router]);

  const handleLogout = useCallback(async () => {
    try {
      const res = await fetch("/api/auth-config", { cache: "no-store" });
      const cfg = await res.json();
      const url = cfg.configured ? cfg.url : process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = cfg.configured ? cfg.anonKey : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (url && key) {
        const supabase = createBrowserClient(url, key);
        await supabase.auth.signOut();
      }
    } finally {
      router.replace("/");
    }
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-mesh text-white flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-mesh text-white flex flex-col">
      <SiteNavSimple backHref="/" backLabel="Zurück zur Startseite" />
      <div className="flex-1 flex items-start justify-center p-6 py-16">
        <div className="w-full max-w-2xl space-y-6 animate-slideUp">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <User size={28} /> Mein Konto
          </h1>

          {/* Profil bearbeiten — Art. 16 DSGVO */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Profildaten</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="konto-fn" className="label-upper">Vorname</label>
                <input
                  id="konto-fn" type="text" value={profile.first_name}
                  onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
                  className="input-field" placeholder="Max"
                />
              </div>
              <div>
                <label htmlFor="konto-ln" className="label-upper">Nachname</label>
                <input
                  id="konto-ln" type="text" value={profile.last_name}
                  onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
                  className="input-field" placeholder="Mustermann"
                />
              </div>
              <div>
                <label htmlFor="konto-street" className="label-upper">Straße & Hausnummer</label>
                <input
                  id="konto-street" type="text" value={profile.street}
                  onChange={(e) => setProfile((p) => ({ ...p, street: e.target.value }))}
                  className="input-field" placeholder="Musterstraße 1"
                />
              </div>
              <div>
                <label htmlFor="konto-city" className="label-upper">PLZ & Ort</label>
                <input
                  id="konto-city" type="text" value={profile.city}
                  onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                  className="input-field" placeholder="12345 Berlin"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label-upper">E-Mail</label>
                <p className="input-field opacity-60 cursor-not-allowed">{profile.email}</p>
                <p className="text-[10px] text-white/30 mt-1">E-Mail-Änderung: datenschutz@bescheidrecht.de</p>
              </div>
            </div>
            {saveMsg && (
              <p className={`text-sm ${saveMsg.includes("gespeichert") ? "text-green-400" : "text-red-400"}`}>{saveMsg}</p>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="btn-primary py-3 px-6 rounded-2xl inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Änderungen speichern
            </button>
          </section>

          {/* Datenexport — Art. 20 DSGVO */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Meine Daten exportieren</h2>
            <p className="text-sm text-white/60">
              Laden Sie alle bei uns gespeicherten Daten als JSON-Datei herunter (Art. 20 DSGVO).
              Der Export enthält Profil, Analysen, Fristen, Abonnements und Feedback.
            </p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn-primary py-3 px-6 rounded-2xl inline-flex items-center gap-2 disabled:opacity-40"
            >
              {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {exporting ? "Wird exportiert …" : "Daten herunterladen"}
            </button>
          </section>

          {/* Abmelden */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <LogOut size={16} /> Abmelden
            </button>
          </section>

          {/* Konto löschen — Art. 17 DSGVO */}
          <section className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-6 md:p-8 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-red-400/70">Konto löschen</h2>
            <p className="text-sm text-white/60">
              Alle Ihre Daten werden unwiderruflich gelöscht: Profil, Analysen, Fristen, Abonnements.
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="py-3 px-6 rounded-2xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors inline-flex items-center gap-2 text-sm font-medium"
              >
                <Trash2 size={16} /> Konto endgültig löschen
              </button>
            ) : (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-3">
                <p className="text-sm text-red-200 flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  Sind Sie sicher? Alle Daten werden sofort und endgültig gelöscht.
                </p>
                {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="py-2 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Ja, endgültig löschen
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); }}
                    className="py-2 px-5 rounded-xl border border-white/10 text-white/60 text-sm hover:text-white transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
