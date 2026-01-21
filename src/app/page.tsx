'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, CheckCircle2, MessageSquare, Zap, Star, Crown, Shield } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // Abo-Daten nach deinem Referenzbild
  const plans = [
    { name: "Basis", price: "9,90 €", features: ["5 Analysen", "5 Schreiben", "max. 10 Seiten"], btn: "Basis wählen", high: false },
    { name: "Plus", price: "17,90 €", features: ["15 Analysen", "15 Schreiben", "max. 20 Seiten", "Widersprüche"], btn: "Plus wählen", high: true },
    { name: "Sozial PRO", price: "49 €", features: ["50 Analysen", "50 Schreiben", "max. 30 Seiten", "Mehrplatz"], btn: "PRO wählen", high: false },
    { name: "Business", price: "99 €", features: ["150 Analysen", "150 Schreiben", "max. 50 Seiten", "Profi-Nutzung"], btn: "Business wählen", high: false }
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans selection:bg-blue-500/30">
      {/* HEADER */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5 bg-[#05070a]">
        <div className="text-2xl font-bold text-blue-500 tracking-tighter uppercase">BescheidRecht</div>
        <div className="flex items-center space-x-6">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded text-[10px] font-bold ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{l}</button>
            ))}
          </div>
          <Link href="/login" className="text-sm font-bold hover:text-blue-500 transition">Login</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-16 px-6 pb-32">
        {/* DEINE ÜBERSCHRIFT & TEXT */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
            Auch genug vom <span className="text-blue-600">Behörden Wahnsinn?</span>
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto mb-12 text-lg leading-relaxed">
            Laden Sie ihr Dokument hoch und lassen sich sich durch unsere KI gesteuerte Analyse helfen 
            Die KI Prüft genauob alles korrekt ist und erstellt ihnen ein passendes schreiben was sie direkt los schicken können.
          </p>

          {/* UPLOAD & DOWNLOAD BEREICH (DUNKEL) */}
          <div className="max-w-3xl mx-auto bg-[#0a0c10] border border-white/10 p-16 rounded-[3rem] shadow-2xl mb-32 relative group">
            <div className="absolute -inset-1 bg-blue-600/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            {!isAnalyzed ? (
              <div className="relative">
                <Upload size={54} className="mx-auto text-blue-600 mb-8 opacity-50" />
                <button 
                  onClick={() => setIsAnalyzed(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl text-2xl font-black transition-all shadow-xl shadow-blue-600/30 active:scale-[0.98]"
                >
                  Dokument jetzt hochladen
                </button>
              </div>
            ) : (
              <div className="relative text-left space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="bg-blue-600/10 p-8 rounded-3xl border border-blue-500/20 flex gap-5">
                  <MessageSquare className="text-blue-500 shrink-0" size={28} />
                  <div>
                    <h4 className="font-bold text-blue-400 mb-2 uppercase text-xs tracking-widest">KI-Analyse Ergebnis</h4>
                    <p className="text-gray-300 leading-relaxed italic text-sm">
                      Wir haben Ihren Bescheid geprüft. Es liegt ein Formfehler in der Fristberechnung vor. 
                      Ihr Anspruch ist berechtigt. Das Widerspruchsschreiben wurde fertiggestellt.
                    </p>
                  </div>
                </div>
                <button className="w-full bg-white text-black py-6 rounded-2xl text-xl font-black flex items-center justify-center gap-4 hover:bg-gray-200 transition shadow-2xl">
                  <Download size={24} /> Schreiben herunterladen
                </button>
                <button onClick={() => setIsAnalyzed(false)} className="w-full text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition">Anderes Dokument prüfen</button>
              </div>
            )}
          </div>

          {/* 4 ABO SÄULEN (DUNKEL/BLAU NACH DEINER VORLAGE) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
            {plans.map((plan, i) => (
              <div key={i} className={`p-8 rounded-[2.5rem] border flex flex-col transition-all duration-500 ${
                plan.high ? 'bg-blue-600 border-blue-400 scale-105 shadow-2xl z-10' : 'bg-[#0a0a0a] border-white/10 hover:border-white/20'
              }`}>
                {plan.high && <div className="text-[10px] font-black uppercase bg-white text-blue-600 px-3 py-1 rounded-full self-center mb-4 tracking-tighter">Beliebt</div>}
                <h3 className="text-xl font-black mb-1 uppercase italic tracking-tighter">{plan.name}</h3>
                <div className="text-3xl font-black mb-8">{plan.price}</div>
                <ul className="space-y-4 mb-10 flex-grow text-left">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-[11px] font-bold uppercase opacity-80 tracking-tight">
                      <CheckCircle2 size={14} className={plan.high ? "text-white" : "text-blue-600"} /> {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-4 rounded-xl font-black transition ${
                  plan.high ? 'bg-white text-blue-600 shadow-xl hover:bg-gray-100' : 'bg-white/5 hover:bg-white/10 text-white'
                }`}>
                  {plan.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="p-12 text-center border-t border-white/5 text-[10px] text-gray-700 font-black uppercase tracking-[0.5em]">
        <p>© 2024 BescheidRecht • Wir kämpfen für Ihr Recht.</p>
      </footer>
    </div>
  );
}
