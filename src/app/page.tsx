'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans selection:bg-blue-600 overflow-x-hidden">
      {/* HEADER: Bleibt exakt wie er ist */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5 bg-[#05070a]">
        <div className="text-xl font-bold text-blue-500 uppercase tracking-tighter">BESCHEIDRECHT</div>
        <div className="flex items-center gap-6">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 text-[10px] font-bold">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{l}</button>
            ))}
          </div>
          <Link href="/login" className="text-xs font-bold uppercase hover:text-blue-500 transition-colors">ANMELDEN</Link>
          <Link href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase shadow-lg shadow-blue-600/20">REGISTRIEREN</Link>
        </div>
      </nav>

      <main className="w-full max-w-[1600px] mx-auto pt-24 px-8 pb-40 text-center">
        {/* DEINE ÜBERSCHRIFT: Unverändert */}
        <h1 className="text-5xl md:text-7xl font-black mb-10 uppercase italic tracking-tighter leading-tight italic">Auch genug vom Behörden-Wahnsinn?</h1>
        <p className="text-gray-400 max-w-3xl mx-auto mb-20 text-xl font-medium">Laden Sie Ihr Dokument hoch und lassen Sie sich helfen.</p>

        {/* FUNKTIONS-BLOCK: Die zwei Buttons */}
        <div className="max-w-4xl mx-auto bg-[#0a0c10] border border-white/10 p-12 rounded-[3.5rem] shadow-2xl mb-32">
          <div className="flex flex-row gap-6 w-full">
            <button onClick={() => setIsAnalyzed(true)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-12 rounded-3xl font-black italic uppercase tracking-widest flex items-center justify-center gap-4 border border-blue-400 shadow-2xl text-xl">
              <Upload size={32} /> SCHREIBEN HOCHLADEN
            </button>
            <button className={`flex-1 py-12 rounded-3xl font-black italic uppercase tracking-widest flex items-center justify-center gap-4 border text-xl ${isAnalyzed ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-white/5 border-white/10 text-gray-700 opacity-30 cursor-not-allowed'}`}>
              <Download size={32} /> SCHREIBEN RUNTERLADEN
            </button>
          </div>
        </div>

        {/* ABO-SÄULEN: DER MASSIVE AUFBAU MIT ERZWUNGENER HÖHE */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-8 w-full mb-48">
          {[
            { n: "BASIS", p: "9,90 €", f: ["5 ANALYSEN PRO MONAT", "5 RECHTS-SCHREIBEN"], h: "850px", c: "bg-[#0d1117] border-white/5" },
            { n: "PLUS", p: "17,90 €", f: ["15 ANALYSEN PRO MONAT", "15 RECHTS-SCHREIBEN", "ANTRÄGE & WIDERSPRÜCHE"], h: "980px", c: "bg-blue-600 border-blue-400 shadow-[0_0_60px_rgba(37,99,235,0.4)] z-20 scale-105", high: true },
            { n: "SOZIAL PRO", p: "49 €", f: ["50 ANALYSEN PRO MONAT", "50 RECHTS-SCHREIBEN"], h: "850px", c: "bg-[#00142d] border-white/10" },
            { n: "BUSINESS", p: "99 €", f: ["UNBEGRENZTE ANALYSEN", "PROFI-MODUL"], h: "850px", c: "bg-[#00142d] border-white/10" }
          ].map((plan, i) => (
            <div 
              key={i} 
              className={`p-16 rounded-[4rem] border flex flex-col text-left transition-all w-full md:w-[350px] ${plan.c}`}
              style={{ minHeight: plan.h }}
            >
              <div className="flex-grow">
                <h3 className="text-[18px] font-black opacity-60 uppercase mb-8 tracking-[0.4em]">{plan.n}</h3>
                <div className="text-8xl font-black mb-16 italic tracking-tighter leading-none">{plan.p}</div>
                <div className="w-full h-[1px] bg-white/10 mb-14"></div>
                <ul className="space-y-10">
                  {plan.f.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-6 text-[22px] font-bold uppercase italic tracking-widest leading-tight">
                      <CheckCircle2 size={32} className={plan.high ? "text-white" : "text-blue-500"} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button className={`w-full py-8 rounded-[2rem] font-black text-2xl uppercase tracking-widest transition-all mt-16 ${
                plan.high ? 'bg-white text-blue-600 shadow-xl' : 'bg-blue-600 text-white shadow-xl'
              }`}>
                WÄHLEN
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER INFO - BLEIBT UNTER DEN SÄULEN */}
        <div className="flex justify-between items-center opacity-20 border-t border-white/10 pt-16 max-w-6xl mx-auto">
          {["KI-RECHTSCHECK", "FERTIGE SCHREIBEN", "DATENSCHUTZ"].map((t, i) => (
            <span key={i} className="font-black text-sm tracking-[0.5em] uppercase italic">{t}</span>
          ))}
        </div>
      </main>
    </div>
  );
}
