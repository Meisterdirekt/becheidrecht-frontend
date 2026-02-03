"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/[0.03] border border-white/10 p-10 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-black mb-8 uppercase italic tracking-tighter">Anmeldung</h1>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">E-Mail Adresse</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 p-4 rounded-lg text-sm focus:border-blue-500 outline-none transition-all placeholder:text-white/10" 
              placeholder="name@beispiel.de" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Passwort</label>
            <input 
              type="password" 
              value={pass} 
              onChange={(e) => setPass(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 p-4 rounded-lg text-sm focus:border-blue-500 outline-none transition-all placeholder:text-white/10" 
              placeholder="••••••••" 
            />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-lg font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20">
            Jetzt Einloggen
          </button>
        </form>
        <div className="mt-8 flex flex-col gap-4 items-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            Noch kein Konto? <Link href="/register" className="text-blue-500 hover:underline">Registrieren</Link>
          </p>
          <Link href="/" className="text-[10px] text-white/20 hover:text-white/50 uppercase tracking-[0.2em] transition-colors">
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
