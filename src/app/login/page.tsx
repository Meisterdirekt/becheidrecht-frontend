"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const redirectTo = next && next.startsWith("/") ? next : "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Bitte alle Felder ausfüllen.");
      return;
    }
    if (!supabase) {
      setError("Anmeldung derzeit nicht verfügbar. Bitte Supabase konfigurieren.");
      return;
    }
    setIsLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) {
        setError(err.message === "Invalid login credentials" ? "E-Mail oder Passwort falsch." : err.message);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte erneut versuchen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-mesh text-white flex flex-col">
      <SiteNavSimple backHref="/" backLabel="Zurück zur Startseite" />
      <div className="flex-1 flex items-center justify-center p-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-10 shadow-xl">
          <h1 className="text-3xl font-black tracking-tight mb-8">Anmeldung</h1>
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="label-upper">E-Mail-Adresse</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="input-field"
                placeholder="name@beispiel.de"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="label-upper">Passwort</label>
                <Link href="/forgot" className="text-[11px] text-[var(--accent)] hover:text-[var(--accent-hover)] font-bold uppercase tracking-wider transition-colors">
                  Vergessen?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading || configLoading || !supabase}
              className="w-full btn-primary py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {configLoading ? "Lade …" : isLoading ? "Wird angemeldet …" : "Jetzt einloggen"}
            </button>
          </form>
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-3 items-center">
            <p className="text-[12px] text-white/50">
              Noch kein Konto?{" "}
              <Link href="/register" className="text-[var(--accent)] hover:underline font-medium">
                Registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-white/60 text-sm">Lade …</div>}>
      <LoginForm />
    </Suspense>
  );
}
