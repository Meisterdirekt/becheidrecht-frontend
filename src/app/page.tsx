'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, CheckCircle2, Scale, FileText, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans selection:bg-blue-500/30">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5 bg-[#05070a]">
        <div className="text-xl font-bold text-blue-500 uppercase tracking-tighter">BESCHEIDRECHT</div>
        <div className="flex items-center gap-6">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 text-[10px] font-bold">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{l}</button>
            ))}
          </div>
          <Link href="/login" className="text-xs font-bold uppercase hover:text-blue-500">ANMELDEN</Link>
          <Link href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase">REGISTRIEREN</Link>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto pt-20 px-8 pb-32 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-8 uppercase italic tracking-tighter italic leading-tight">Auch genug vom Behörden-Wahnsinn?</h1>
        <p className="text-gray-400 max-w-3xl mx-auto mb-16 text-lg">Laden Sie Ihr Dokument hoch und lassen Sie sich durch unsere KI-gesteuerte Analyse helfen.</p>

        {/* ZWEI BUTTONS BLEIBEN FEST NEBENEINANDER */}
        <div className="max-w-4xl mx-auto bg-[#0a0c10] border border-white/10 p-12 rounded-[3rem] shadow-2xl mb-28">
          <div className="flex flex-row gap-6 w-full">
            <button onClick={() => setIsAnalyzed(true)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-10 rounded-2xl font-black italic uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all border border-blue-400 shadow-xl text-lg">
              <Upload size={32} /> SCHREIBEN HOCHLADEN
            </button>
            <button className={`flex-1 py-10 rounded-2xl font-black italic uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all border text-lg ${isAnalyzed ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-white/5 border-white/10 text-gray-700 cursor-not-allowed'}`}>
              <Download size={32} /> SCHREIBEN RUNTERLADEN
            </button>
          </div>
        </div>

        {/* MAXIMUM STRETCH: ABO-SÄULEN EXTREM LANG GEZOGEN */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-48 items-stretch">
          {[
            { name: "BASIS", price: "9,90 €", features: ["5 ANALYSEN PRO MONAT", "5 RECHTS-SCHREIBEN", "KI-BASISCHECK", "PDF EXPORT"], color: "bg-[#0a0c12] border-white/5" },
            { name: "PLUS", price: "17,90 €", features: ["15 ANALYSEN PRO MONAT", "15 RECHTS-SCHREIBEN", "ANTRÄGE & WIDERSPRÜCHE", "PREMIUM SUPPORT", "SCHNELLE BEARBEITUNG"], color: "bg-blue-600 border-blue-400 scale-110 z-10 shadow-[0_0_50px_rgba(37,99,235,0.3)]", high: true },
            { name: "SOZIAL PRO", price: "49 €", features: ["50 ANALYSEN PRO MONAT", "50 RECHTS-SCHREIBEN", "MULTI-USER ZUGANG", "TIEFEN-ANALYSE KI", "LIVE CHAT SUPPORT"], color: "bg-[#00142d] border-white/10" },
            { name: "BUSINESS", price: "99 €", features: ["UNBEGRENZTE ANALYSEN", "ALLE SCHREIBEN INKL.", "PROFI-RECHTSMODUL", "API-SCHNITTSTELLE", "PERSÖNLICHER BERATER"], color: "bg-[#00142d] border-white/10" }
          ].map((p, i) => (
            <div key={i} className={`p-14 rounded-[3.5rem] border flex flex-col text-left transition-all min-h-[850px] shadow-2xl ${p.color}`}>
              <div className="flex-grow">
                <h3 className="text-[16px] font-black opacity-60 uppercase mb-10 tracking-[0.4em] text-blue-400">{p.name}</h3>
                <div className="text-7xl font-black mb-20 italic tracking-tighter leading-none">{p.price}</div>
                <ul className="space-y-12">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-6 text-[18px] font-bold uppercase italic tracking-widest leading-tight">
                      <CheckCircle2 size={28} className="shrink-0 text-white" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button className={`w-full py-8 rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] transition-all mt-20 shadow-2xl ${
                p.high ? 'bg-white text-blue-600 hover:scale-105 active:scale-95' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 active:scale-95'
              }`}>
                WÄHLEN
              </button>
            </div>
          ))}
        </div>

        {/* Footer-Bereich bleibt wie er ist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left opacity-30">
          {[{t: "KI-RECHTSCHECK", i: <Scale/>}, {t: "FERTIGE SCHREIBEN", i: <FileText/>}, {t: "DATENSCHUTZ", i: <ShieldCheck/>}].map((box, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="text-blue-500">{box.i}</div>
              <h4 className="font-black text-xs uppercase tracking-widest">{box.t}</h4>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
