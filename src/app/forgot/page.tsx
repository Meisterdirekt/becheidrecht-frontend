"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadConfig() {
      try {
        const res = await fetch("/api/auth-config", { cache: "no-store" });
        if (!res.ok) throw new Error("Config-API fehlgeschlagen");
        const data = await res.json();
        if (cancelled) return;
        if (data.configured && data.url && data.anonKey) {
          setSupabase(createBrowserClient(data.url, data.anonKey));
          setConfigError(null);
        } else {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          if (url && key) {
            setSupabase(createBrowserClient(url, key));
            setConfigError(null);
          } else {
            setConfigError(data.error || "Supabase ist nicht konfiguriert.");
          }
        }
      } catch {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && key) {
          setSupabase(createBrowserClient(url, key));
          setConfigError(null);
        } else {
          if (!cancelled)
            setConfigError("Konfiguration konnte nicht geladen werden. Bitte /api/auth-config prüfen.");
        }
      }
      if (!cancelled) setConfigLoading(false);
    }
    loadConfig();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!supabase) {
      setError("Passwort zurücksetzen derzeit nicht verfügbar.");
      return;
    }
    if (!email?.trim()) {
      setError("Bitte E-Mail-Adresse eingeben.");
      return;
    }
    setLoading(true);
    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : "";
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ein Fehler ist aufgetreten.");
    }
    setLoading(false);
  }

  return (
    <main id="main-content" className="min-h-screen bg-mesh text-white flex flex-col">
      <SiteNavSimple backHref="/login" backLabel="Zurück zum Login" />
      <div className="flex-1 flex items-center justify-center p-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-10 shadow-xl">
          <h1 className="text-3xl font-black tracking-tight mb-2">Passwort vergessen</h1>
          <p className="text-white/60 text-sm mb-8">E-Mail eingeben – wir schicken Ihnen einen Link zum Zurücksetzen.</p>

          {configLoading ? (
            <p className="text-white/50 text-sm">Lade …</p>
          ) : success ? (
            <div className="rounded-2xl bg-green-500/10 border border-green-500/30 p-6 space-y-3">
              <p className="text-green-200 text-sm">
                Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet. Bitte Posteingang und Spam prüfen.
              </p>
              <Link href="/login" className="inline-block text-[var(--accent)] font-bold text-sm uppercase tracking-wider hover:underline">
                Zurück zum Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {configError && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-amber-200 text-sm">
                  {configError}
                </div>
              )}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="forgot-email" className="label-upper">E-Mail-Adresse</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !supabase}
                className="w-full btn-primary py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Wird gesendet …" : "Link senden"}
              </button>
            </form>
          )}
          <p className="text-center mt-8 text-sm text-white/50">
            <Link href="/login" className="text-[var(--accent)] hover:underline">
              Zurück zum Login
            </Link>
          </p>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
