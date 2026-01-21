'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Upload, Download, CheckCircle2, MessageSquare, Scale, FileText } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false); // Simuliert den Zustand nach der Analyse

  const content: any = {
    DE: {
      hero: "Auch genug vom Behörden-Wahnsinn?",
      sub: "Laden Sie Ihr Dokument hoch und lassen Sie sich durch unsere KI-gesteuerte Analyse helfen.",
      claim: "Verzichte nicht auf dein Recht!",
      who: "Wir sind BescheidRecht – Ihr Partner für Gerechtigkeit.",
      upload: "Dokument jetzt hochladen",
      analysisTitle: "KI-Analyse Ergebnis",
      analysisDesc: "Die KI hat Ihren Bescheid geprüft. Hier ist die Zusammenfassung Ihres Anspruchs und unser vorgeschlagenes Handeln:",
      aiAction: "Wir haben ein Widerspruchsschreiben erstellt, das die Formfehler direkt angreift.",
      download: "Schreiben jetzt herunterladen"
    },
    // Weitere Sprachen (TR, AR, RU, EN) werden hier nach dem gleichen Muster ergänzt...
  };

  const t = content[lang] || content.DE;

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans">
      {/* Navigation mit Sprach-Abkürzungen */}
      <nav className="p-6 flex justify-between items-center border-b border-white/5 sticky top-0 bg-[#05070a]/80 backdrop-blur-md z-50">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
          BescheidRecht
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 space-x-1">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button 
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === l ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <Link href="/login" className="text-sm font-medium hover:text-blue-400 transition">Login</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto pt-16 px-6">
        {/* Hero Sektion */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight">{t.hero}</h1>
          <p className="text-xl text-gray-400 mb-4 max-w-3xl mx-auto leading-relaxed">{t.sub}</p>
          <div className="inline-block bg-blue-600/10 border border-blue-500/20 px-6 py-2 rounded-full mb-8">
            <p className="text-blue-400 font-bold uppercase tracking-widest text-sm">{t.claim}</p>
          </div>
          <p className="text-gray-500 italic mb-12">{t.who}</p>

          {/* Analyse & Upload Bereich */}
          <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-2xl shadow-2xl">
            {!isAnalyzed ? (
              <>
                <div className="bg-blue-600/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/30">
                  <Upload size={36} className="text-blue-400" />
                </div>
                <button 
                  onClick={() => setIsAnalyzed(true)} // Simulation des Uploads
                  className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl text-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-600/20"
                >
                  {t.upload}
                </button>
              </>
            ) : (
              /* KI-CHAT / ANALYSE BEREICH */
              <div className="text-left space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-start gap-4 bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20">
                  <MessageSquare className="text-blue-500 shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-lg mb-2">{t.analysisTitle}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{t.analysisDesc}</p>
                    <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5 text-sm italic text-blue-300">
                      "{t.aiAction}"
                    </div>
                  </div>
                </div>
                
                <button className="w-full bg-white text-black hover:bg-gray-200 py-5 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition-all">
                  <Download size={24} /> {t.download}
                </button>
                
                <button onClick={() => setIsAnalyzed(false)} className="w-full text-gray-500 text-sm hover:text-white transition">
                  Neues Dokument hochladen
                </button>
              </div>
            )}
            <p className="mt-8 text-[10px] text-gray-600 uppercase tracking-widest font-bold">Keine Rechtsberatung • KI-gestützte Dokumentenprüfung</p>
          </div>
        </div>

        {/* Abo-Modelle */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {[
            { name: "Basis Check", price: "0€", features: ["1 Analyse", "KI-Zusammenfassung", "Standard Download"] },
            { name: "Premium Plus", price: "14,99€", features: ["Unbegrenzt Analysen", "KI-Chat Support", "Direkter Widerspruch-Versand"], popular: true },
            { name: "Business", price: "49€", features: ["Team Zugang", "Anwaltlicher Erst-Check", "Priorisierte Verarbeitung"] }
          ].map((plan, i) => (
            <div key={i} className={`p-10 rounded-[2.5rem] border transition-all duration-500 ${plan.popular ? 'bg-blue-600 border-blue-400 scale-105 shadow-[0_20px_50px_rgba(37,99,235,0.3)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-5xl font-black mb-8">{plan.price}<span className="text-sm font-normal text-white/40"> / Monat</span></div>
              <ul className="space-y-5 mb-10">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={18} className={plan.popular ? 'text-white' : 'text-blue-500'} /> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-4 rounded-xl font-bold transition-all ${plan.popular ? 'bg-white text-blue-600 hover:shadow-inner' : 'bg-white/10 hover:bg-white/20'}`}>
                Plan wählen
              </button>
            </div>
          ))}
        </div>
      </main>

      <footer className="p-12 text-center border-t border-white/5 text-gray-600 text-sm">
        <div className="flex justify-center gap-8 mb-6 font-medium">
          <Link href="/agb" className="hover:text-white transition">AGB</Link>
          <Link href="/datenschutz" className="hover:text-white transition">Datenschutz</Link>
          <Link href="/impressum" className="hover:text-white transition">Impressum</Link>
        </div>
        <p>© 2024 BescheidRecht - Wir kämpfen für Ihr Recht.</p>
      </footer>
    </div>
  );
}
