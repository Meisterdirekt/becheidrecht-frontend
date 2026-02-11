"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

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
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (configLoading || typeof window === "undefined") return;
    const hash = window.location.hash || "";
    const recovery = hash.includes("type=recovery");
    setIsRecovery(recovery);
    // Session aus Hash herstellen, damit updateUser() später funktioniert
    if (recovery && supabase) supabase.auth.getSession();
  }, [configLoading, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!supabase) {
      setError("Zurücksetzen derzeit nicht verfügbar.");
      return;
    }
    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen haben.");
      return;
    }
    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
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
            Neues Passwort
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium text-center">
            Setzen Sie hier Ihr neues Passwort
          </p>
        </div>

        {configLoading ? (
          <div className="text-center py-8 text-slate-500">Lade …</div>
        ) : !isRecovery ? (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center space-y-3">
            <p className="text-slate-800 font-medium">
              Dieser Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen Link an.
            </p>
            <Link
              href="/forgot"
              className="inline-block text-blue-600 font-bold text-sm uppercase tracking-widest hover:underline"
            >
              Neuen Link anfordern
            </Link>
            <br />
            <Link href="/login" className="text-slate-500 text-sm hover:underline">
              Zum Login
            </Link>
          </div>
        ) : success ? (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
            <p className="text-green-800 font-bold">Passwort wurde geändert.</p>
            <p className="text-green-700 mt-2 text-sm">Sie werden zur Startseite weitergeleitet …</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
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
                Neues Passwort
              </label>
              <input
                type="password"
                minLength={6}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-slate-900 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                Passwort bestätigen
              </label>
              <input
                type="password"
                minLength={6}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-slate-900 font-medium"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !supabase}
              className="w-full bg-[#0F172A] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-blue-600 transition-all mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Wird gespeichert …" : "Passwort speichern"}
            </button>
          </form>
        )}

        <p className="text-center mt-10 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Link href="/login" className="text-blue-600">
            Zum Login
          </Link>
        </p>
      </div>
    </main>
  );
}
