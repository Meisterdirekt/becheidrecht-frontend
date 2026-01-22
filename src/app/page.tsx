'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, CheckCircle2, Scale, FileText, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans selection:bg-blue-600">
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
          <Link href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">REGISTRIEREN</Link>
        </div>
      </nav>

      <main className="w-full max-w-[1400px] mx-auto pt-24 px-6 pb-40 text-center">
        {/* DEINE ÜBERSCHRIFT: Bleibt unverändert */}
        <h1 className="text-4xl md:text-6xl font-black mb-8 uppercase italic tracking-tighter leading-[1.1]">Auch genug vom Behörden-Wahnsinn?</h1>
        <p className="text-gray-400 max-w-3xl mx-auto mb-20 text-xl font-medium">Laden Sie Ihr Dokument hoch und lassen Sie sich durch unsere KI-gesteuerte Analyse helfen.</p>

        {/* FUNKTIONS-BUTTONS: Bleiben fest nebeneinander */}
        <div className="max-w-4xl mx-auto bg-[#0a0c10] border border-white/10 p-12 rounded-[3.5rem] shadow-2xl mb-32">
          <div className="flex flex-row gap-6 w-full">
            <button onClick={() => setIsAnalyzed(true)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-12 rounded-3xl font-black italic uppercase tracking-[0.2em] flex items-center justify-center gap-4 border border-blue-400 shadow-2xl text-xl transition-all">
              <Upload size={32} /> SCHREIBEN HOCHLADEN
            </button>
            <button className={`flex-1 py-12 rounded-3xl font-black italic uppercase tracking-[0.2em] flex items-center justify-center gap-4 border text-xl transition-all ${isAnalyzed ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-white/5 border-white/10 text-gray-700 cursor-not-allowed opacity-30'}`}>
              <Download size={32} /> SCHREIBEN RUNTERLADEN
            </button>
          </div>
        </div>

        {/* ABO-SÄULEN: EXAKTER AUFBAU ORIGINAL-BILD */}
        {/* Wir nutzen feste Breiten und Höhen, um das Grid zu erzwingen */}
        <div className="flex flex-wrap md:flex-nowrap justify-center items-end gap-6 w-full mb-40">
          {[
            { name: "BASIS", price: "9,90 €", features: ["5 Analysen pro Monat", "5 Rechts-Schreiben", "KI-Basischeck"], color: "bg-[#0d1117] border-white/5" },
            { name: "PLUS", price: "17,90 €", features: ["15 Analysen pro Monat", "15 Rechts-Schreiben", "Anträge & Widersprüche", "Premium Support"], color: "bg-blue-600 border-blue-400 shadow-[0_0_60px_rgba(37,99,235,0.3)] z-20", high: true },
            { name: "SOZIAL PRO", price: "49 €", features: ["50 Analysen pro Monat", "50 Rechts-Schreiben", "Tiefen-Analyse KI"], color: "bg-[#0a0c12] border-white/10" },
            { name: "BUSINESS", price: "99 €", features: ["Unbegrenzte Analysen", "Alle Schreiben inkl.", "Persönlicher Berater"], color: "bg-[#0a0c12] border-white/10" }
          ].map((p, i) => (
            <div 
              key={i} 
              className={`relative flex-1 min-w-[300px] p-12 rounded-[3rem] border flex flex-col text-left transition-all ${p.color} ${p.high ? 'min-h-[850px] -translate-y-6' : 'min-h-[750px]'}`}
            >
              <div className="flex-grow">
                <h3 className="text-[14px] font-black opacity-50 uppercase mb-8 tracking-[0.4em]">{p.name}</h3>
                <div className="text-7xl font-black mb-16 italic tracking-tighter leading-none">{p.price}</div>
                <div className="w-full h-[1px] bg-white/10 mb-12"></div> {/* Trennlinie wie im Bild */}
                <ul className="space-y-8">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-[18px] font-bold uppercase italic tracking-wider leading-tight">
                      <CheckCircle2 size={24} className={p.high ? "text-white" : "text-blue-500"} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button className={`w-full py-7 rounded-2xl font-black text-lg uppercase tracking-widest transition-all mt-16 ${
                p.high ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}>
                Plan wählen
              </button>
            </div>
          ))}
        </div>

        {/* Footer-Elemente: Unverändert */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto opacity-20 border-t border-white/5 pt-12">
          {["KI-RECHTSCHECK", "FERTIGE SCHREIBEN", "DATENSCHUTZ"].map((t, i) => (
            <div key={i} className="font-black text-xs tracking-[0.4em] uppercase">{t}</div>
          ))}
        </div>
      </main>
    </div>
  );
}
