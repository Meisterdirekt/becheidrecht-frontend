'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, CheckCircle2, Scale, FileText, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans selection:bg-blue-500/30">
      {/* Navigation - Bleibt identisch */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5 bg-[#05070a]">
        <div className="text-xl font-bold text-blue-500 uppercase tracking-tighter">BESCHEIDRECHT</div>
        <div className="flex items-center gap-6">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 text-[10px] font-bold">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}>{l}</button>
            ))}
          </div>
          <Link href="/login" className="text-xs font-bold uppercase hover:text-blue-500 transition-colors">ANMELDEN</Link>
          <Link href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">REGISTRIEREN</Link>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto pt-20 px-8 pb-32 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-8 uppercase italic tracking-tighter leading-[1.1]">Auch genug vom Behörden-Wahnsinn?</h1>
        <p className="text-gray-400 max-w-3xl mx-auto mb-16 text-lg leading-relaxed font-medium">Laden Sie Ihr Dokument hoch und lassen Sie sich durch unsere KI-gesteuerte Analyse helfen. Die KI prüft genau, ob alles korrekt ist.</p>

        {/* ZWEI BUTTONS NEBENEINANDER - FEST FIXIERT */}
        <div className="max-w-4xl mx-auto bg-[#0a0c10] border border-white/10 p-12 rounded-[3rem] shadow-2xl mb-28">
          <div className="flex flex-row gap-6 w-full">
            <button 
              onClick={() => setIsAnalyzed(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-10 rounded-2xl font-black italic uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all border border-blue-400 shadow-xl text-lg"
            >
              <Upload size={32} /> SCHREIBEN HOCHLADEN
            </button>
            <button 
              className={`flex-1 py-10 rounded-2xl font-black italic uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all border text-lg ${
                isAnalyzed 
                ? 'bg-white text-black border-white shadow-2xl scale-105 opacity-100 cursor-pointer' 
                : 'bg-white/5 border-white/10 text-gray-700 opacity-40 cursor-not-allowed'
              }`}
            >
              <Download size={32} /> SCHREIBEN RUNTERLADEN
            </button>
          </div>
        </div>

        {/* MASSIVE ABO-SÄULEN - EXAKT WIE IN DER GRAFIK */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-32 items-stretch">
          {[
            { name: "BASIS", price: "9,90 €", features: ["5 ANALYSEN", "5 SCHREIBEN"], color: "bg-[#0a0c12] border-white/5" },
            { name: "PLUS", price: "17,90 €", features: ["15 ANALYSEN", "15 SCHREIBEN", "ANTRÄGE"], color: "bg-blue-600 border-blue-400 scale-105 z-10 shadow-2xl shadow-blue-600/30", high: true },
            { name: "SOZIAL PRO", price: "49 €", features: ["50 ANALYSEN", "50 SCHREIBEN", "MULTI"], color: "bg-[#00142d] border-white/10" },
            { name: "BUSINESS", price: "99 €", features: ["150 ANALYSEN", "150 SCHREIBEN", "PROFI"], color: "bg-[#00142d] border-white/10" }
          ].map((p, i) => (
            <div key={i} className={`p-12 rounded-[2.5rem] border flex flex-col text-left transition-all min-h-[620px] ${p.color}`}>
              <div className="flex-grow">
                <h3 className="text-[13px] font-black opacity-70 uppercase mb-5 tracking-[0.25em]">{p.name}</h3>
                <div className="text-6xl font-black mb-12 italic tracking-tighter">{p.price}</div>
                <ul className="space-y-7">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-4 text-[15px] font-bold uppercase italic tracking-widest">
                      <CheckCircle2 size={22} className="shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button className={`w-full py-6 rounded-xl font-black text-[13px] uppercase tracking-widest transition-all mt-12 shadow-xl ${
                p.high ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}>
                WÄHLEN
              </button>
            </div>
          ))}
        </div>

        {/* Info-Kacheln - Unverändert */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
          {[{t: "KI-RECHTSCHECK", i: <Scale/>, d: "Prüfung auf Formfehler und Fristen."}, {t: "FERTIGE SCHREIBEN", i: <FileText/>, d: "Direkter Download als PDF oder Word."}, {t: "DATENSCHUTZ", i: <ShieldCheck/>, d: "Ihre Dokumente werden sicher verschlüsselt."}].map((box, i) => (
            <div key={i} className="bg-[#0a0c12] border border-white/5 p-10 rounded-3xl hover:bg-white/5 transition-colors">
              <div className="text-blue-500 mb-6 scale-125">{box.i}</div>
              <h4 className="font-black text-sm uppercase mb-3 tracking-widest">{box.t}</h4>
              <p className="text-xs text-gray-500 font-bold leading-relaxed italic uppercase">{box.d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
