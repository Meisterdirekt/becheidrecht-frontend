"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', terms: false });

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-xl border border-slate-200 p-10 md:p-14">
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-bold text-[#0F172A] inline-flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-blue-600 rounded-md"></div> Bescheid<span className="text-blue-600 font-black">Recht</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter text-center">Account erstellen</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium text-center">Starten Sie Ihre präzise Analyse</p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Vollständiger Name</label>
            <input 
              type="text" 
              placeholder="Max Mustermann"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-slate-900 font-medium"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">E-Mail Adresse</label>
            <input 
              type="email" 
              placeholder="name@firma.de"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-slate-900 font-medium"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Passwort</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-slate-900 font-medium"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="flex items-start gap-3 py-2">
            <input 
              type="checkbox" 
              className="mt-1 h-4 w-4 accent-blue-600 cursor-pointer" 
              onChange={(e) => setFormData({...formData, terms: e.target.checked})}
            />
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight cursor-pointer">
              Ich akzeptiere die <Link href="/agb" className="text-blue-600 underline">AGB</Link> und die <Link href="/datenschutz" className="text-blue-600 underline text-center">Datenschutzerklärung</Link>.
            </label>
          </div>

          <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all mt-4">
            Kostenlos Registrieren
          </button>
        </form>

        <p className="text-center mt-10 text-xs font-bold text-slate-400 uppercase tracking-widest">
          Bereits Mitglied? <Link href="/login" className="text-blue-600 ml-1">Anmelden</Link>
        </p>
      </div>
    </main>
  );
}
