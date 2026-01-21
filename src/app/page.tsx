'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, CheckCircle2, Scale, FileText, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5 bg-[#05070a]">
        <div className="text-xl font-bold text-blue-500 uppercase tracking-tighter">BESCHEIDRECHT</div>
        <div className="flex items-center gap-6 text-[11px] font-bold">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{l}</button>
            ))}
          </div>
          <Link href="/login" className="uppercase hover:text-blue-500 transition">Anmelden</Link>
          <Link href="/register" className="bg-blue-600 px-4 py-2 rounded-lg uppercase shadow-lg shadow-blue-600/20">Registrieren</Link>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto pt-16 px-6 pb-24 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase italic tracking-tighter italic">Auch genug vom Behörden-Wahnsinn?</h1>
        <p className="text-gray-400 max-w-3xl mx-auto mb-16 text-lg leading-relaxed">Laden Sie Ihr Dokument hoch und lassen Sie sich durch unsere KI-gesteuerte Analyse helfen.</p>

        {/* ZWEI BUTTONS NEBENEINANDER */}
        <div className="max-w-4xl mx-auto bg-[#0a0c10] border border-white/10 p-12 rounded-[3rem] shadow-2xl mb-24">
          <div className="flex flex-row gap-6 w-full">
            <button onClick={() => setIsAnalyzed(true)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-10 rounded-2xl font-black italic uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all border border-blue-400 shadow-xl text-lg">
              <Upload size={30} /> Schreiben hochladen
            </button>
            <button className={`flex-1 py-10 rounded-2xl font-black italic uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all border text-lg ${isAnalyzed ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-white/5 border-white/10 text-gray-700 cursor-not-allowed'}`}>
              <Download size={30} /> Schreiben herunterladen
            </button>
          </div>
        </div>

        {/* ABO-SÄULEN: GRÖSSE UND SCHRIFT EXAKT WIE AUF DEM BILD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch mb-24 w-full">
          {[
            { name: "Basis", price: "9,90 €", features: ["5 Analysen", "5 Schreiben"], color: "bg-[#0d1117] border-white/5" },
            { name: "Plus", price: "17,90 €", features: ["15 Analysen", "15 Schreiben", "Anträge"], color: "bg-blue-600 border-blue-400 scale-105 z-10 shadow-2xl shadow-blue-600/20", high: true },
            { name: "Sozial PRO", price: "49 €", features: ["50 Analysen", "50 Schreiben", "Multi"], color: "bg-[#001428] border-white/10" },
            { name: "Business", price: "99 €", features: ["150 Analysen", "150 Schreiben", "Profi"], color: "bg-[#001428] border-white/10" }
          ].map((p, i) => (
            <div key={i} className={`p-10 rounded-[2rem] border flex flex-col transition-all min-h-[580px] text-left ${p.color}`}>
              <div className="flex-grow">
                <h3 className="text-[12px] font-black opacity-80 uppercase mb-4 tracking-[0.2em]">{p.name}</h3>
                <div className="text-5xl font-black mb-10 italic tracking-tighter">{p.price}</div>
                <ul className="space-y-6">
                  {p.features.map((f, index) => (
                    <li key={index} className="flex items-center gap-4 text-[14px] font-bold uppercase italic tracking-widest opacity-90">
                      <CheckCircle2 size={20} className="shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button className={`w-full py-5 rounded-xl font-black text-sm uppercase transition-all mt-10 ${p.high ? 'bg-white text-blue-600 shadow-lg shadow-white/10' : 'bg-blue-600 text-white'}`}>
                Wählen
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
          {[{t: "KI-Rechtscheck", i: <Scale/>}, {t: "Fertige Schreiben", i: <FileText/>}, {t: "Datenschutz", i: <ShieldCheck/>}].map((box, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-3xl">
              <div className="text-blue-500 mb-6 scale-125">{box.i}</div>
              <h4 className="font-black text-sm uppercase mb-3 tracking-widest">{box.t}</h4>
              <p className="text-xs text-gray-500 font-bold leading-relaxed italic uppercase">Sichere Bearbeitung Ihrer Anliegen.</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
