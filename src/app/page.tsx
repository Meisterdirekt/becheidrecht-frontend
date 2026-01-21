'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, CheckCircle2, MessageSquare, Scale, FileText, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const translations: any = {
    DE: {
      hero: "Auch genug vom Behörden-Wahnsinn?",
      sub: "Laden Sie Ihr Dokument hoch und lassen Sie sich durch unsere KI-gesteuerte Analyse helfen. Die KI prüft genau, ob alles korrekt ist und erstellt Ihnen ein passendes Schreiben, das Sie direkt losschicken können.",
      upload: "Schreiben hochladen",
      download: "Schreiben herunterladen",
      login: "ANMELDEN",
      register: "REGISTRIEREN",
      plans: ["Basis", "Plus", "Sozial PRO", "Business"]
    }
  };

  const t = translations['DE'];

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5 bg-[#05070a]">
        <div className="text-xl font-bold text-blue-500 uppercase tracking-tighter">BESCHEIDRECHT</div>
        <div className="flex items-center gap-6">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded text-[10px] font-bold ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{l}</button>
            ))}
          </div>
          <Link href="/login" className="text-xs font-bold uppercase hover:text-blue-500">{t.login}</Link>
          <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">{t.register}</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-16 px-6 pb-24 text-center">
        <h1 className="text-3xl md:text-5xl font-black mb-6 uppercase italic tracking-tighter">{t.hero}</h1>
        <p className="text-gray-400 max-w-3xl mx-auto mb-12 text-md leading-relaxed">{t.sub}</p>

        {/* ZWEI BUTTONS PERMANENT NEBENEINANDER */}
        <div className="max-w-3xl mx-auto bg-[#0a0c10] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl mb-20">
          <div className="flex flex-row gap-4">
            {/* BUTTON 1: HOCHLADEN */}
            <button 
              onClick={() => setIsAnalyzed(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-3 transition-all border border-blue-400 shadow-lg shadow-blue-600/20"
            >
              <Upload size={24} />
              {t.upload}
            </button>
            
            {/* BUTTON 2: RUNTERLADEN */}
            <button 
              className={`flex-1 py-6 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-3 transition-all border ${
                isAnalyzed 
                ? 'bg-white text-black border-white shadow-xl scale-105' 
                : 'bg-white/5 border-white/10 text-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              <Download size={24} />
              {t.download}
            </button>
          </div>
        </div>

        {/* RESTLICHE WEBSITE BLEIBT UNVERÄNDERT */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-16 max-w-6xl mx-auto text-left">
          {[
            { name: t.plans[0], price: "9,90 €", color: "bg-[#0d1117] border-white/5" },
            { name: t.plans[1], price: "17,90 €", color: "bg-blue-600 border-blue-400 scale-105 z-10 shadow-2xl", high: true },
            { name: t.plans[2], price: "49 €", color: "bg-[#001a33] border-white/10" },
            { name: t.plans[3], price: "99 €", color: "bg-[#001a33] border-white/10" }
          ].map((p, i) => (
            <div key={i} className={`p-6 rounded-2xl border transition-all ${p.color}`}>
              <h3 className="text-[10px] font-bold opacity-80 uppercase mb-1">{p.name}</h3>
              <div className="text-2xl font-black mb-6 italic">{p.price}</div>
              <button className={`w-full py-2.5 rounded-lg font-black text-[10px] uppercase ${p.high ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>Wählen</button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
          {["KI-Rechtscheck", "Fertige Schreiben", "Datenschutz"].map((box, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <div className="mb-3">
                {i === 0 ? <Scale size={20} className="text-blue-500" /> : i === 1 ? <FileText size={20} className="text-blue-500" /> : <ShieldCheck size={20} className="text-blue-500" />}
              </div>
              <h4 className="font-black text-xs uppercase mb-1">{box}</h4>
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed italic">Sichere Bearbeitung Ihrer Anliegen.</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
