'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Upload, Download, CheckCircle2, Globe } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');

  const content = {
    DE: {
      hero: "Auch genug vom Behörden-Wahnsinn?",
      sub: "Laden Sie Ihr Dokument hoch und lassen Sie sich durch unsere KI-gesteuerte Analyse helfen. Die KI prüft genau, ob alles korrekt ist und erstellt Ihnen ein passendes Schreiben.",
      claim: "Verzichte nicht auf dein Recht!",
      who: "Wir sind BescheidRecht – Dein digitaler Begleiter gegen Formfehler und Fristversäumnisse.",
      upload: "Dokument jetzt hochladen",
      view: "Schreiben ansehen & herunterladen"
    },
    EN: {
      hero: "Tired of bureaucratic madness?",
      sub: "Upload your document and get help from our AI-driven analysis. The AI checks everything precisely and creates a matching letter for you.",
      claim: "Don't waive your rights!",
      who: "We are BescheidRecht – Your digital companion against formal errors.",
      upload: "Upload document now",
      view: "View & Download Letter"
    }
  };

  const t = lang === 'DE' ? content.DE : content.EN;

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans">
      {/* Navigation mit Sprach-Flags */}
      <nav className="p-6 flex justify-between items-center border-b border-white/5 sticky top-0 bg-[#05070a]/80 backdrop-blur-md z-50">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
          BescheidRecht
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            {['DE', 'EN', 'TR', 'AR'].map((l) => (
              <button 
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <Link href="/login" className="text-sm hover:text-blue-400 transition">Login</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto pt-16 px-6">
        {/* Hero & Info */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">{t.hero}</h1>
          <p className="text-xl text-gray-400 mb-4 max-w-3xl mx-auto">{t.sub}</p>
          <div className="inline-block bg-blue-600/20 border border-blue-500/30 px-4 py-2 rounded-full mb-8">
            <p className="text-blue-400 font-bold uppercase tracking-widest text-sm">{t.claim}</p>
          </div>
          <p className="text-gray-500 italic mb-10">{t.who}</p>

          {/* Upload & Download Area */}
          <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl mb-20">
            <Upload size={48} className="mx-auto text-blue-500 mb-6 animate-pulse" />
            <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl text-xl font-bold transition-all mb-4">
              {t.upload}
            </button>
            {/* Dieser Button erscheint nach dem Upload (Simuliert) */}
            <button className="w-full border border-white/20 hover:bg-white/5 py-4 rounded-2xl text-lg font-semibold flex items-center justify-center gap-3 transition-all">
              <Download size={20} /> {t.view}
            </button>
            <p className="mt-6 text-xs text-yellow-500/70 uppercase font-bold">Keine Rechtsberatung • KI-Unterstützung</p>
          </div>
        </div>

        {/* Abo-Säulen (Pricing) */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {[
            { name: "Basis Check", price: "0€", features: ["1 Analyse", "Standard KI", "PDF Download"] },
            { name: "Premium", price: "19€", features: ["Unbegrenzt", "Pro KI (GPT-4o)", "Priorisierter Support", "Archiv"], popular: true },
            { name: "Business", price: "49€", features: ["Team Zugang", "API Zugriff", "Eigene Vorlagen"] }
          ].map((plan, i) => (
            <div key={i} className={`p-8 rounded-[2rem] border transition-all ${plan.popular ? 'bg-blue-600 border-blue-400 scale-105 shadow-2xl shadow-blue-500/20' : 'bg-white/5 border-white/10'}`}>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-sm font-normal text-white/60"> / Monat</span></div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 size={18} className={plan.popular ? 'text-white' : 'text-blue-500'} /> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-xl font-bold transition ${plan.popular ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-white/10 hover:bg-white/20'}`}>
                Plan wählen
              </button>
            </div>
          ))}
        </div>
      </main>

      <footer className="p-10 text-center border-t border-white/5 text-gray-500 text-sm">
        <div className="flex justify-center gap-6 mb-4">
          <Link href="/agb">AGB</Link>
          <Link href="/datenschutz">Datenschutz</Link>
        </div>
        <p>© 2024 BescheidRecht - Wir kämpfen für Ihr Recht.</p>
      </footer>
    </div>
  );
}
