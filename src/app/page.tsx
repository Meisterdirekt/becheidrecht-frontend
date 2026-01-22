'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans">
      {/* HEADER: Bleibt wie er ist */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
        <div className="text-xl font-bold text-blue-500 uppercase tracking-tighter">BESCHEIDRECHT</div>
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{l}</button>
            ))}
          </div>
          <Link href="/login" className="hover:text-blue-500">Anmelden</Link>
          <Link href="/register" className="bg-blue-600 px-4 py-2 rounded-lg">Registrieren</Link>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto pt-20 px-8 pb-40 text-center">
        {/* ÜBERSCHRIFT: Deine aktuelle Version */}
        <h1 className="text-5xl md:text-6xl font-black mb-10 uppercase italic tracking-tighter">Auch genug vom Behörden-Wahnsinn?</h1>
        
        {/* BUTTONS: Bleiben exakt so */}
        <div className="max-w-4xl mx-auto bg-[#0a0c10] border border-white/10 p-12 rounded-[3.5rem] shadow-2xl mb-32">
          <div className="flex flex-row gap-6">
            <button onClick={() => setIsAnalyzed(true)} className="flex-1 bg-blue-600 py-12 rounded-3xl font-black italic uppercase tracking-widest flex items-center justify-center gap-4 text-xl border border-blue-400">
              <Upload size={32} /> SCHREIBEN HOCHLADEN
            </button>
            <button className={`flex-1 py-12 rounded-3xl font-black italic uppercase tracking-widest flex items-center justify-center gap-4 text-xl border ${isAnalyzed ? 'bg-white text-black' : 'bg-white/5 text-gray-700 opacity-30 cursor-not-allowed'}`}>
              <Download size={32} /> SCHREIBEN RUNTERLADEN
            </button>
          </div>
        </div>

        {/* ABO-SÄULEN: DER MASSIVE AUFBAU (800px - 900px Höhe) */}
        <div className="flex flex-row items-end justify-center gap-8 mb-40">
          {[
            { n: "BASIS", p: "9,90 €", f: ["5 Analysen", "5 Schreiben"], h: "750px", c: "bg-[#0d1117] border-white/5" },
            { n: "PLUS", p: "17,90 €", f: ["15 Analysen", "15 Schreiben", "Anträge"], h: "900px", c: "bg-blue-600 border-blue-400 shadow-2xl", high: true },
            { n: "SOZIAL PRO", p: "49 €", f: ["50 Analysen", "50 Schreiben"], h: "750px", c: "bg-[#001428] border-white/10" },
            { n: "BUSINESS", p: "99 €", f: ["unbegrenzt", "Service"], h: "750px", c: "bg-[#001428] border-white/10" }
          ].map((plan, i) => (
            <div 
              key={i} 
              className={`flex-1 p-14 rounded-[3.5rem] border flex flex-col text-left transition-all ${plan.c}`}
              style={{ minHeight: plan.h }}
            >
              <div className="flex-grow">
                <h3 className="text-lg font-black opacity-50 uppercase mb-6 tracking-[0.4em]">{plan.n}</h3>
                <div className="text-7xl font-black mb-16 italic tracking-tighter">{plan.p}</div>
                <div className="w-full h-[1px] bg-white/10 mb-12"></div>
                <ul className="space-y-10">
                  {plan.f.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-5 text-xl font-bold uppercase italic tracking-widest">
                      <CheckCircle2 size={28} className={plan.high ? "text-white" : "text-blue-500"} /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button className={`w-full py-8 rounded-2xl font-black text-xl uppercase mt-16 ${plan.high ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                WÄHLEN
              </button>
            </div>
          ))}
        </div>

        {/* INFO-TEXTE: Bleiben wie sie sind */}
        <div className="flex justify-between max-w-5xl mx-auto opacity-20 text-[10px] font-black tracking-[0.5em]">
          <span>KI-RECHTSCHECK</span>
          <span>FERTIGE SCHREIBEN</span>
          <span>DATENSCHUTZ</span>
        </div>
      </main>
    </div>
  );
}
