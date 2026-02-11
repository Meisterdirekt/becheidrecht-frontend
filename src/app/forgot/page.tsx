"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

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
            setConfigError(
              "Konfiguration konnte nicht geladen werden. Bitte /api/auth-config prüfen und neuesten Code deployen."
            );
        }
      }
      if (!cancelled) setConfigLoading(false);
    }
    loadConfig();
    return () => {
      cancelled = true;
    };
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
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/reset-password` : "";
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });
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
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-xl border border-slate-200 p-10 md:p-14">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="text-2xl font-bold text-[#0F172A] inline-flex items-center gap-2 mb-6"
          >
            <div className="w-6 h-6 bg-blue-600 rounded-md"></div> Bescheid
            <span className="text-blue-600 font-black">Recht</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter text-center">
            Passwort vergessen
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium text-center">
            E-Mail eingeben – wir schicken Ihnen einen Link zum Zurücksetzen
          </p>
        </div>

        {configLoading ? (
          <div className="text-center py-8 text-slate-500">Lade …</div>
        ) : success ? (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center space-y-3">
            <p className="text-slate-800 font-medium">
              Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen des Passworts
              gesendet. Bitte Posteingang und Spam prüfen.
            </p>
            <Link
              href="/login"
              className="inline-block text-blue-600 font-bold text-sm uppercase tracking-widest hover:underline"
            >
              Zurück zum Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {configError && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                {configError}
              </div>
            )}
            {error && (
              <div
                className="rounded-2xl bg-red-100 border-2 border-red-300 px-4 py-4 text-sm text-red-900 font-medium"
                role="alert"
              >
                {error}
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-slate-900 font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !supabase}
              className="w-full bg-[#0F172A] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-blue-600 transition-all mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Wird gesendet …" : "Link senden"}
            </button>
          </form>
        )}

        <p className="text-center mt-10 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Link href="/login" className="text-blue-600">
            Zurück zum Login
          </Link>
        </p>
      </div>
    </main>
  );
}
