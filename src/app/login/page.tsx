"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Anmeldung läuft...');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Fehler: ${error.message}`);
    } else {
      setMessage('Erfolgreich angemeldet! Leite weiter...');
      setTimeout(() => {
        router.push('/'); // Leitet zurück zur Startseite (oder später zum Dashboard)
      }, 1500);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070a] text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white/[0.03] border border-white/10 p-10 rounded-2xl shadow-2xl text-center">
        <h1 className="text-3xl font-black mb-8 italic uppercase tracking-tighter">Anmelden</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
          <input 
            type="email" 
            placeholder="E-MAIL" 
            className="bg-black/50 border border-white/10 p-4 rounded-lg focus:border-blue-500 outline-none text-[12px] font-bold tracking-widest text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="PASSWORT" 
            className="bg-black/50 border border-white/10 p-4 rounded-lg focus:border-blue-500 outline-none text-[12px] font-bold tracking-widest text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-600 py-4 rounded-lg font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all text-white">
            EINLOGGEN
          </button>
        </form>
        {message && (
          <div className="mt-6 p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              {message}
            </p>
          </div>
        )}
        <div className="mt-8 flex flex-col gap-4">
          <Link href="/register" className="text-[10px] text-white/30 hover:text-white transition-colors uppercase font-bold tracking-[0.2em]">
            Noch kein Konto? Registrieren
          </Link>
          <Link href="/" className="text-[10px] text-white/30 hover:text-white transition-colors uppercase font-bold tracking-[0.2em]">
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </main>
  );
}
