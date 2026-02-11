"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', terms: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadConfig() {
      try {
        const res = await fetch('/api/auth-config', { cache: 'no-store' });
        if (!res.ok) throw new Error('Config-API fehlgeschlagen');
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
            setConfigError(data.error || 'Supabase ist nicht konfiguriert.');
          }
        }
      } catch (e) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && key) {
          setSupabase(createBrowserClient(url, key));
          setConfigError(null);
        } else {
          if (!cancelled) setConfigError('Konfiguration konnte nicht geladen werden. Bitte /api/auth-config prüfen und neuesten Code deployen.');
        }
      }
      if (!cancelled) setConfigLoading(false);
    }
    loadConfig();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    setError(null);
    if (!supabase) {
      setError('Registrierung derzeit nicht verfügbar. Supabase-Config fehlt.');
      return;
    }
    if (!formData.terms) {
      setError('Bitte akzeptieren Sie die AGB und die Datenschutzerklärung.');
      return;
    }
    if (!formData.email?.trim() || !formData.password) {
      setError('Bitte E-Mail und Passwort ausfüllen.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen haben.');
      return;
    }
    setLoading(true);
    setError(null);
    const timeoutMs = 15000;
    try {
      const signUpPromise = supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: { full_name: formData.name.trim() || undefined },
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin + '/' : undefined,
        },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Verbindung zu Supabase dauert zu lange. Bitte Internet und Supabase-Einstellungen prüfen.')), timeoutMs)
      );
      const { data, error: err } = await Promise.race([signUpPromise, timeoutPromise]);
      if (err) {
        setError(err.message === 'User already registered' ? 'Diese E-Mail ist bereits registriert. Bitte melden Sie sich an.' : err.message);
        setLoading(false);
        return;
      }
      if (data?.user && !data.session) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });
        if (!signInErr && signInData?.session) {
          setRedirecting(true);
          setError(null);
          setTimeout(() => { window.location.href = '/'; }, 1500);
          return;
        }
        setSuccess(true);
        setLoading(false);
        return;
      }
      setRedirecting(true);
      setError(null);
      setTimeout(() => {
        window.location.href = '/';
      }, 2500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten. Bitte später erneut versuchen.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    if (!supabase || !formData.email?.trim()) return;
    setResendLoading(true);
    setError(null);
    setResendDone(false);
    try {
      const { error: err } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email.trim(),
      });
      if (err) {
        setError(err.message);
      } else {
        setResendDone(true);
      }
    } catch {
      setError('Erneut senden fehlgeschlagen.');
    }
    setResendLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans relative">
      {loading && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50" aria-live="polite">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4">
            <p className="font-black text-slate-800 uppercase tracking-wide">Registrierung wird ausgeführt …</p>
            <p className="text-slate-500 text-sm mt-2">Bitte warten Sie.</p>
          </div>
        </div>
      )}
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-xl border border-slate-200 p-10 md:p-14">
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-bold text-[#0F172A] inline-flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-blue-600 rounded-md"></div> Bescheid<span className="text-blue-600 font-black">Recht</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter text-center">Account erstellen</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium text-center">Starten Sie Ihre präzise Analyse</p>
        </div>

        {success ? (
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-6 text-center">
            <p className="text-slate-800 font-medium">Wir haben Ihnen eine E-Mail geschickt. Bitte bestätigen Sie Ihren Account über den Link in der E-Mail und melden Sie sich danach an. Falls keine E-Mail ankommt, können Sie sie unten erneut anfordern.</p>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {resendDone && <p className="mt-2 text-sm text-green-700 font-medium">E-Mail erneut gesendet. Bitte Posteingang und Spam prüfen.</p>}
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resendLoading}
              className="mt-4 text-blue-600 font-bold text-sm uppercase tracking-widest hover:underline disabled:opacity-50"
            >
              {resendLoading ? 'Wird gesendet …' : 'Bestätigungs-Mail erneut senden'}
            </button>
            <Link href="/login" className="block mt-4 text-blue-600 font-bold text-sm uppercase tracking-widest">Zum Login</Link>
          </div>
        ) : redirecting ? (
          <div className="rounded-2xl bg-green-50 border-2 border-green-300 p-6 text-center">
            <p className="text-green-800 font-bold">Registrierung erfolgreich.</p>
            <p className="text-green-700 mt-2">Sie werden in Kürze zur Startseite weitergeleitet …</p>
          </div>
        ) : configLoading ? (
          <div className="text-center py-8 text-slate-500">Lade …</div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
            {configError && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                {configError} In Vercel: Settings → Environment Variables → <strong>NEXT_PUBLIC_SUPABASE_URL</strong> und <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> eintragen (Werte aus Supabase Dashboard → Project Settings → API).
              </div>
            )}
            {error && (
              <div className="rounded-2xl bg-red-100 border-2 border-red-300 px-4 py-4 text-sm text-red-900 font-medium" role="alert">{error}</div>
            )}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Vollständiger Name</label>
              <input
                type="text"
                placeholder="Max Mustermann"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-slate-900 font-medium"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">E-Mail-Adresse</label>
              <input
                type="email"
                placeholder="name@firma.de"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-slate-900 font-medium"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Passwort</label>
              <input
                type="password"
                placeholder="••••••••"
                minLength={6}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-slate-900 font-medium"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-blue-600 cursor-pointer"
                checked={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
              />
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight cursor-pointer">
                Ich akzeptiere die <Link href="/agb" className="text-blue-600 underline">AGB</Link> und die <Link href="/datenschutz" className="text-blue-600 underline">Datenschutzerklärung</Link>.
              </label>
            </div>
            <p className="text-[11px] text-slate-500 text-center">Sie können sich nach der Registrierung direkt anmelden.</p>
            <button
              type="button"
              disabled={loading || !supabase}
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Wird erstellt …' : 'Kostenlos registrieren'}
            </button>
          </form>
        )}

        <p className="text-center mt-10 text-xs font-bold text-slate-400 uppercase tracking-widest">
          Bereits Mitglied? <Link href="/login" className="text-blue-600 ml-1">Anmelden</Link>
        </p>
        {!configLoading && (
          <p className="text-center mt-4 text-[10px] text-slate-400">
            {supabase ? 'Verbindung zu Supabase: bereit' : 'Verbindung zu Supabase: fehlt'}
          </p>
        )}
      </div>
    </main>
  );
}
