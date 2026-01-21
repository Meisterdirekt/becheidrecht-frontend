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
      upload: "Dokument hochladen",
      download: "Schreiben herunterladen",
      login: "ANMELDEN",
      register: "REGISTRIEREN",
      plans: ["Basis", "Plus", "Sozial PRO", "Business"]
    }
  };

  const t = translations['DE']; // Wir bleiben beim DE-Text für dieses Beispiel

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
        <div className="text-xl font-bold text-blue-500 uppercase tracking-tighter">BESCHEIDRECHT</div>
        <div className="flex items-center gap-6">
          <div className="bg-white/5 p-1 rounded-lg border border-white/10 flex">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded text-[10px] font-bold ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{l}</button>
            ))}
          </div>
          <Link href="/login" className="text-xs font-bold hover:text-blue-500 uppercase">{t.login}</Link>
          <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">{t.register}</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-16 px-6 pb-24 text-center">
        <h1 className="text-3xl md:text-5xl font-black mb-6 uppercase italic tracking-tighter">{t.hero}</h1>
        <p className="text-gray-400 max-w-3xl mx-auto mb-12 text-md">{t.sub}</p>

        {/* DIE ZWEI BUTTONS NEBENEINANDER */}
        <div className="max-w-3xl mx-auto bg-[#0a0c10]/50 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl mb-20">
          <div className="flex flex-col md:flex-row gap-4">
            <button 
              onClick={() => setIsAnalyzed(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
            >
              <Upload size={24} />
              {t.upload}
            </button>
            
            <button 
              className={`flex-1 py-6 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-3 transition-all border ${
                isAnalyzed 
                ? 'bg-white text-black border-white shadow-xl scale-105' 
                : 'bg-white/5 border-white/10 text-gray-700 cursor-not-allowed'
              }`}
            >
              <Download size={24} />
              {t.download}
            </button>
          </div>
          {isAnalyzed && <p className="mt-4 text-blue-500 text-xs font-bold italic animate-pulse">ANALYSE ABGESCHLOSSEN!</p>}
        </div>

        {/* PREISE - Bleiben wie im Bild */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-16">
          {/* Basis */}
          <div className="bg-[#0d1117] p-6 rounded-2xl border border-white/5 text-left">
            <h3 className="text-[10px] font-bold opacity-50 uppercase">Basis</h3>
            <div className="text-2xl font-black mb-6 italic">9,90 €</div>
            <button className="w-full py-2 bg-blue-600 rounded-lg font-black text-[10px] uppercase">Wählen</button>
          </div>
          {/* Plus */}
          <div className="bg-blue-600 p-6 rounded-2xl border border-blue-400 scale-105 z-10 text-left shadow-2xl">
            <h3 className="text-[10px] font-bold uppercase">Plus</h3>
            <div className="text-2xl font-black mb-6 italic">17,90 €</div>
            <button className="w-full py-2 bg-white text-blue-600 rounded-lg font-black text-[10px] uppercase">Wählen</button>
          </div>
          {/* Sozial PRO */}
          <div className="bg-[#001a33] p-6 rounded-2xl border border-white/10 text-left">
            <h3 className="text-[10px] font-bold opacity-50 uppercase">Sozial PRO</h3>
            <div className="text-2xl font-black mb-6 italic">49 €</div>
            <button className="w-full py-2 bg-white text-blue-900 rounded-lg font-black text-[10px] uppercase">Wählen</button>
          </div>
          {/* Business */}
          <div className="bg-[#001a33] p-6 rounded-2xl border border-white/10 text-left">
            <h3 className="text-[10px] font-bold opacity-50 uppercase">Business</h3>
            <div className="text-2xl font-black mb-6 italic">99 €</div>
            <button className="w-full py-2 bg-white text-blue-900 rounded-lg font-black text-[10px] uppercase">Wählen</button>
          </div>
        </div>
      </main>
    </div>
  );
}
