"use client";

import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-xl border border-slate-200 p-10 md:p-14">
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-bold text-[#0F172A] inline-flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-blue-600 rounded-md"></div> Bescheid<span className="text-blue-600 font-black">Recht</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter text-center">Willkommen zurück</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium text-center">Loggen Sie sich in Ihr Dashboard ein</p>
        </div>

        <form className="space-y-6 text-left">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">E-Mail Adresse</label>
            <input 
              type="email" 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-slate-900 font-medium"
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
            />
          </div>

          <button className="w-full bg-[#0F172A] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-blue-600 transition-all mt-4">
            Anmelden
          </button>
        </form>

        <p className="text-center mt-10 text-xs font-bold text-slate-400 uppercase tracking-widest">
          Neu hier? <Link href="/register" className="text-blue-600 ml-1">Account erstellen</Link>
        </p>
      </div>
    </main>
  );
}
