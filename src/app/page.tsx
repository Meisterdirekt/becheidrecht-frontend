'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, CheckCircle2, MessageSquare, Scale, FileText, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const plans = [
    { name: "Basis", price: "9,90 €", features: ["5 Analysen", "5 Schreiben", "max. 10 Seiten"], btn: "Basis wählen", high: false, dark: false },
    { name: "Plus", price: "17,90 €", features: ["15 Analysen", "15 Schreiben", "max. 20 Seiten", "Anträge & Widersprüche"], btn: "Plus wählen", high: true, dark: false },
    { name: "Sozial PRO", price: "49 €", features: ["50 Analysen", "50 Schreiben", "max. 30 Seiten", "Mehrplatzfähig"], btn: "PRO wählen", high: false, dark: true },
    { name: "Business", price: "99 €", features: ["150 Analysen", "150 Schreiben", "max. 50 Seiten", "Berufliche Nutzung"], btn: "Business wählen", high: false, dark: true }
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans selection:bg-blue-500/30">
      {/* HEADER */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-500 tracking-tighter uppercase">BescheidRecht</div>
        <div className="flex items-center space-x-6 text-xs font-bold uppercase tracking-widest">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{l}</button>
            ))}
          </div>
          <Link href="/login" className="hover:text-blue-500 transition">Login</Link>
          <Link href="/start" className="bg-blue-600 px-4 py-2 rounded-lg text-white">Jetzt starten</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-20 px-6 pb-32">
        {/* DEINE ÜBERSCHRIFT & TEXT */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight max-w-4xl mx-auto">
            Auch genug vom <span className="text-blue-600">Behörden Wahnsinn?</span>
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto mb-12 text-lg leading-relaxed">
            Laden Sie ihr Dokument hoch und lassen sich sich durch unsere KI gesteuerte Analyse helfen 
            Die KI Prüft genauob alles korrekt ist und erstellt ihnen ein passendes schreiben was sie direkt los schicken können.
          </p>

          {/* UPLOAD & DOWNLOAD BOX */}
          <div className="max-w-3xl mx-auto bg-[#0a0c10] border border-white/10 p-16 rounded-[3rem] shadow-2xl mb-24 relative">
            {!isAnalyzed ? (
              <div className="text-center">
                <Upload size={54} className="mx-auto text-blue-600 mb-8 opacity-50" />
                <button onClick={() => setIsAnalyzed(true)} className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl text-2xl font-black transition-all shadow-xl shadow-blue-600/30 uppercase tracking-tighter">
                  Dokument jetzt hochladen
                </button>
              </div>
            ) : (
              <div className="text-left space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="bg-blue-600/10 p-8 rounded-3xl border border-blue-500/20 flex gap-5">
                  <MessageSquare className="text-blue-500 shrink-0" size={28} />
                  <p className="text-gray-300 leading-relaxed italic text-sm">
                    KI-Analyse abgeschlossen: Ihr Bescheid wurde geprüft. Ein passendes Widerspruchsschreiben steht für Sie bereit.
                  </p>
                </div>
                <button className="w-full bg-white text-black py-6 rounded-2xl text-xl font-black flex items-center justify-center gap-4 hover:bg-gray-200 transition">
                  <Download size={24} /> Schreiben herunterladen
                </button>
              </div>
            )}
          </div>

          {/* 4 ABO SÄULEN NACH REFERENZBILD */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-24 text-left">
            {plans.map((p, i) => (
              <div key={i} className={`p-8 rounded-2xl border flex flex-col transition-all ${
                p.high ? 'bg-blue-600 border-blue-400 scale-105 shadow-2xl z-10' : 
                p.dark ? 'bg-[#002147] border-white/10' : 'bg-[#0d1117] border-white/5'
              }`}>
                {p.high && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3da9fc] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase">Beliebt</div>}
                <h3 className="text-sm font-bold opacity-80 uppercase mb-1">{p.name}</h3>
                <div className="text-3xl font-black mb-8 italic">{p.price}</div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight opacity-90">
                      <CheckCircle2 size={14} className={p.high || p.dark ? "text-white" : "text-blue-600"} /> {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-black text-xs uppercase transition ${
                  p.high || p.dark ? 'bg-white text-blue-900' : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}>
                  {p.btn}
                </button>
              </div>
            ))}
          </div>

          {/* ERKLÄR-KÄSTCHEN (UNTER DEN ABOS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Scale className="text-blue-500" />, title: "KI-Rechtscheck", text: "Prüfung auf Formfehler und Fristen." },
              { icon: <FileText className="text-blue-500" />, title: "Fertige Schreiben", text: "Direkter Download als PDF oder Word." },
              { icon: <ShieldCheck className="text-blue-500" />, title: "Datenschutz", text: "Ihre Dokumente werden sicher verschlüsselt." }
            ].map((box, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl text-left hover:bg-white/10 transition">
                <div className="mb-4">{box.icon}</div>
                <h4 className="font-black text-sm uppercase mb-2 tracking-widest">{box.title}</h4>
                <p className="text-xs text-gray-500 font-bold leading-relaxed">{box.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="p-12 text-center border-t border-white/5 text-[10px] text-gray-800 font-black uppercase tracking-[0.5em]">
        <p>© 2024 BescheidRecht • Alle Rechte vorbehalten</p>
      </footer>
    </div>
  );
}
