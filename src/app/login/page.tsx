"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

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
          setConfigError(data.error || 'Supabase ist nicht konfiguriert.');
        }
      } catch {
        if (!cancelled) setConfigError('Konfiguration konnte nicht geladen werden. Bitte /api/auth-config prüfen und neuesten Code deployen.');
      }
      if (!cancelled) setConfigLoading(false);
    }
    loadConfig();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEmailNotConfirmed(false);
    setResendDone(false);
    if (!supabase) {
      setError('Anmeldung derzeit nicht verfügbar.');
      return;
    }
    if (!email?.trim() || !password) {
      setError('Bitte E-Mail und Passwort eingeben.');
      return;
    }
    setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) {
        const isUnconfirmed = err.message?.toLowerCase().includes('email not confirmed') || err.message?.toLowerCase().includes('not confirmed');
        setEmailNotConfirmed(!!isUnconfirmed);
        setError(
          err.message.includes('Invalid login')
            ? 'E-Mail oder Passwort falsch. Bitte prüfen Sie Ihre Eingabe.'
            : isUnconfirmed
              ? 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse über den Link in der Bestätigungs-Mail.'
              : err.message
        );
        setLoading(false);
        return;
      }
      if (data?.session) {
        router.push('/');
        router.refresh();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten. Bitte später erneut versuchen.';
      setError(msg);
    }
    setLoading(false);
  }

  async function handleResendConfirmation() {
    if (!supabase || !email?.trim()) return;
    setResendLoading(true);
    setError(null);
    setResendDone(false);
    try {
      const { error: err } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (err) setError(err.message);
      else setResendDone(true);
    } catch {
      setError('Erneut senden fehlgeschlagen.');
    }
    setResendLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-xl border border-slate-200 p-10 md:p-14">
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-bold text-[#0F172A] inline-flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-blue-600 rounded-md"></div> Bescheid<span className="text-blue-600 font-black">Recht</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter text-center">Willkommen zurück</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium text-center">Melden Sie sich in Ihrem Konto an</p>
        </div>

        {configLoading ? (
          <div className="text-center py-8 text-slate-500">Lade …</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {configError && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                {configError} In Vercel: Settings → Environment Variables → <strong>NEXT_PUBLIC_SUPABASE_URL</strong> und <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> eintragen (Werte aus Supabase Dashboard → Project Settings → API).
              </div>
            )}
            {error && (
              <div className="rounded-2xl bg-red-100 border-2 border-red-300 px-4 py-4 text-sm text-red-900 font-medium" role="alert">
                {error}
                {emailNotConfirmed && (
                  <>
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resendLoading}
                      className="mt-3 block w-full text-center text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline disabled:opacity-50"
                    >
                      {resendLoading ? 'Wird gesendet …' : 'Bestätigungs-Mail erneut senden'}
                    </button>
                    {resendDone && <p className="mt-2 text-green-700 text-xs font-medium">E-Mail erneut gesendet. Bitte Posteingang und Spam prüfen.</p>}
                  </>
                )}
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">E-Mail-Adresse</label>
              <input
                type="email"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-slate-900 font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex justify-between mb-2 ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Passwort</label>
                <Link href="/forgot" className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Vergessen?</Link>
              </div>
              <input
                type="password"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-slate-900 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !supabase}
              className="w-full bg-[#0F172A] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-blue-600 transition-all mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Wird angemeldet …' : 'Anmelden'}
            </button>
          </form>
        )}

        <p className="text-center mt-10 text-xs font-bold text-slate-400 uppercase tracking-widest">
          Neu hier? <Link href="/register" className="text-blue-600 ml-1">Account erstellen</Link>
        </p>
      </div>
    </main>
  );
}
