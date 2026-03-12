"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

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
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (configLoading || typeof window === "undefined") return;
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const recovery = hash.includes("type=recovery") || search.includes("type=recovery");
    setIsRecovery(recovery);
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
    <main className="min-h-screen bg-mesh text-white flex flex-col">
      <SiteNavSimple backHref="/login" backLabel="Zurück zum Login" />
      <div className="flex-1 flex items-center justify-center p-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-10 shadow-xl">
          <h1 className="text-3xl font-black tracking-tight mb-2">Neues Passwort</h1>
          <p className="text-white/60 text-sm mb-8">Setzen Sie hier Ihr neues Passwort.</p>

          {configLoading ? (
            <p className="text-white/50 text-sm">Lade …</p>
          ) : !isRecovery ? (
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-6 text-center space-y-3">
              <p className="text-amber-200 text-sm">
                Dieser Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen Link an.
              </p>
              <Link href="/forgot" className="inline-block text-[var(--accent)] font-bold text-sm uppercase tracking-wider hover:underline">
                Neuen Link anfordern
              </Link>
              <br />
              <Link href="/login" className="text-white/60 text-sm hover:underline">
                Zum Login
              </Link>
            </div>
          ) : success ? (
            <div className="rounded-2xl bg-green-500/10 border border-green-500/30 p-6 text-center">
              <p className="text-green-200 font-bold">Passwort wurde geändert.</p>
              <p className="text-green-200/80 mt-2 text-sm">Sie werden zur Startseite weitergeleitet …</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm" role="alert">
                  {error}
                </div>
              )}
              <div>
                <label className="label-upper">Neues Passwort</label>
                <input
                  type="password"
                  minLength={8}
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label-upper">Passwort bestätigen</label>
                <input
                  type="password"
                  minLength={8}
                  className="input-field"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !supabase}
                className="w-full btn-primary py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Wird gespeichert …" : "Passwort speichern"}
              </button>
            </form>
          )}

          <p className="text-center mt-8 text-sm text-white/50">
            <Link href="/login" className="text-[var(--accent)] hover:underline">
              Zum Login
            </Link>
          </p>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
