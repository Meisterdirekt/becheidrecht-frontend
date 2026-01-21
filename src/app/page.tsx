'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, CheckCircle2, MessageSquare, Scale, FileText, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

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
          <Link href="/login" className="text-xs font-bold uppercase hover:text-blue-500">ANMELDEN</Link>
          <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">REGISTRIEREN</Link>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto pt-16 px-6 pb-24 text-center">
        <h1 className="text-3xl md:text-5xl font-black mb-6 uppercase italic tracking-tighter">Auch genug vom Behörden-Wahnsinn?</h1>
        <p className="text-gray-400 max-w-3xl mx-auto mb-12 text-md leading-relaxed italic">Laden Sie Ihr Dokument hoch und lassen Sie sich durch unsere KI-gesteuerte Analyse helfen.</p>

        {/* BUTTONS BLEIBEN FEST NEBENEINANDER */}
        <div className="max-w-4xl mx-auto bg-[#0a0c10] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl mb-24">
          <div className="flex flex-row gap-4 w-full">
            <button 
              onClick={() => setIsAnalyzed(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-8 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-3 transition-all border border-blue-400 shadow-xl"
            >
              <Upload size={24} />
              Schreiben hochladen
            </button>
            <button 
              className={`flex-1 py-8 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-3 transition-all border ${
                isAnalyzed 
                ? 'bg-white text-black border-white shadow-2xl scale-105' 
                : 'bg-white/5 border-white/10 text-gray-700 opacity-30 cursor-not-allowed'
              }`}
            >
              <Download size={24} />
              Schreiben herunterladen
            </button>
          </div>
        </div>

        {/* MASSIV VERGRÖSSERTE ABO-SÄULEN */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-24 w-full px-4">
          {[
            { name: "Basis", price: "9,90 €", features: ["5 Analysen pro Monat", "5 Rechts-Schreiben", "KI-Basischeck"], color: "bg-[#0d1117] border-white/5" },
            { name: "Plus", price: "17,90 €", features: ["15 Analysen pro Monat", "15 Rechts-Schreiben", "Vorrangige KI-Prüfung", "Premium Support"], color: "bg-blue-600 border-blue-400 scale-110 z-10 shadow-2xl", high: true },
            { name: "Sozial PRO", price: "49 €", features: ["50 Analysen pro Monat", "50 Rechts-Schreiben", "Tiefen-Analyse", "Persönlicher Chat"], color: "bg-[#001a33] border-white/10" },
            { name: "Business", price: "99 €", features: ["150 Analysen pro Monat", "150 Rechts-Schreiben", "Full-Service Paket", "API Schnittstelle"], color: "bg-[#001a33] border-white/10" }
          ].map((p, i) => (
            <div key={i} className={`p-12 rounded-[3rem] border flex flex-col justify-between transition-all min-h-[650px] shadow-2xl ${p.color}`}>
              <div>
                <h3 className="text-lg font-black opacity-90 uppercase mb-6 tracking-[0.3em] text-blue-400">{p.name}</h3>
                <div className="text-6xl font-black mb-12 italic tracking-tighter text-white">{p.price}</div>
                <ul className="space-y-8 mb-12">
                  {p.features.map((f, index) => (
                    <li key={index} className="flex items-start gap-4 text-[17px] font-bold uppercase italic leading-tight tracking-wider text-gray-200">
                      <CheckCircle2 size={24} className="shrink-0 text-blue-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button className={`w-full py-6 rounded-2xl font-black text-lg uppercase transition-all shadow-2xl ${p.high ? 'bg-white text-blue-600 hover:scale-105' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105'}`}>
                Plan wählen
              </button>
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
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed italic uppercase">Sichere Bearbeitung Ihrer Anliegen.</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
