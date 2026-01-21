'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, CheckCircle2, MessageSquare, Zap, Star, Crown, Shield } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const translations: any = {
    DE: { hero: "Auch genug vom Behörden-Wahnsinn?", claim: "VERZICHTE NICHT AUF DEIN RECHT!", upload: "Dokument jetzt hochladen" },
    EN: { hero: "Tired of bureaucratic madness?", claim: "DON'T WAIVE YOUR RIGHTS!", upload: "Upload document now" },
    TR: { hero: "Bürokrasiden bıktınız mı?", claim: "HAKLARINIZDAN VAZGEÇMEYİN!", upload: "Belgeyi şimdi yükle" },
    AR: { hero: "هل سئمت من البيروقراطية؟", claim: "لا تتنازل عن حقك!", upload: "تحميل المستند الآن" },
    RU: { hero: "Устали от бюрократии?", claim: "НЕ ОТКАЗЫВАЙТЕСЬ ОТ СВОИХ ПРАВ!", upload: "Загрузить документ сейчас" }
  };

  const t = translations[lang] || translations.DE;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* HEADER: BescheidRecht links, Sprachen & Login rechts */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
        <div className="text-2xl font-bold text-blue-500 uppercase tracking-tighter">BescheidRecht</div>
        <div className="flex items-center space-x-6">
          <div className="flex bg-[#111] p-1 rounded-lg border border-white/10">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded text-[10px] font-bold ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{l}</button>
            ))}
          </div>
          <Link href="/login" className="text-sm font-bold hover:text-blue-500 transition">Login</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-24 px-6 pb-32">
        {/* HERO: GROSS & ZENTRIERT */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tighter">
            Auch genug vom <br />
            <span className="text-blue-600 italic">Behörden-Wahnsinn?</span>
          </h1>
          
          <div className="inline-block bg-blue-600/10 border border-blue-500/20 px-8 py-2 rounded-full mb-12">
            <p className="text-blue-500 font-black text-sm tracking-[0.3em]">{t.claim}</p>
          </div>

          {/* UPLOAD BEREICH */}
          <div className="max-w-3xl mx-auto bg-[#050505] border border-white/5 p-16 rounded-[3rem] shadow-2xl mb-32">
            {!isAnalyzed ? (
              <div className="space-y-10">
                <Upload size={64} className="mx-auto text-blue-600 opacity-50" />
                <button onClick={() => setIsAnalyzed(true)} className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl text-2xl font-black transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                  {t.upload}
                </button>
              </div>
            ) : (
              <div className="text-left space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="text-blue-500" />
                    <span className="font-black text-sm uppercase tracking-widest text-blue-500">KI-Analyse</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed font-medium">
                    Wir haben das Dokument geprüft. Es liegt ein Formfehler vor. Ihr Anspruch ist gültig. Wir haben das Widerspruchsschreiben für Sie erstellt.
                  </p>
                </div>
                <button className="w-full bg-white text-black py-6 rounded-2xl text-xl font-black flex items-center justify-center gap-4">
                  <Download size={24} /> {lang === 'DE' ? 'Schreiben herunterladen' : 'Download Letter'}
                </button>
              </div>
            )}
          </div>

          {/* 4 ABO MODELLE - EXAKT 4 SÄULEN */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
            {/* 1. BASIS */}
            <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[2.5rem] text-center flex flex-col">
              <Zap className="text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2 text-gray-400">Basis</h3>
              <div className="text-3xl font-black mb-6 italic">0€</div>
              <ul className="text-[11px] text-gray-500 space-y-3 mb-8 flex-grow text-left">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500" /> 1 Check pro Monat</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500" /> Standard KI</li>
              </ul>
              <button className="w-full py-3 bg-white/5 rounded-xl font-bold hover:bg-white/10 transition">Wählen</button>
            </div>

            {/* 2. PREMIUM (HIGHLIGHT) */}
            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-center flex flex-col scale-105 shadow-[0_0_40px_rgba(37,99,235,0.3)] relative z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Beliebtest</div>
              <Star className="text-white mx-auto mb-4" />
              <h3 className="text-xl font-black mb-2">Premium</h3>
              <div className="text-4xl font-black mb-6 italic">14.99€</div>
              <ul className="text-[11px] text-white space-y-3 mb-8 flex-grow text-left">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Unlimitierte Checks</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} /> GPT-4o High-End KI</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Brief-Download inkl.</li>
              </ul>
              <button className="w-full py-4 bg-white text-blue-600 rounded-xl font-black hover:bg-gray-100 transition shadow-xl">Starten</button>
            </div>

            {/* 3. PROFESSIONAL */}
            <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[2.5rem] text-center flex flex-col">
              <Shield className="text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Pro</h3>
              <div className="text-3xl font-black mb-6 italic">29.99€</div>
              <ul className="text-[11px] text-gray-500 space-y-3 mb-8 flex-grow text-left">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500" /> Mehrere Nutzer</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500" /> Experten-Support</li>
              </ul>
              <button className="w-full py-3 bg-white/5 rounded-xl font-bold hover:bg-white/10 transition">Wählen</button>
            </div>

            {/* 4. BUSINESS */}
            <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[2.5rem] text-center flex flex-col">
              <Crown className="text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2 text-gray-400">Business</h3>
              <div className="text-3xl font-black mb-6 italic">49€</div>
              <ul className="text-[11px] text-gray-500 space-y-3 mb-8 flex-grow text-left">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500" /> API Zugriff</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500" /> Firmen-Branding</li>
              </ul>
              <button className="w-full py-3 bg-white/5 rounded-xl font-bold hover:bg-white/10 transition">Kontakt</button>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-12 text-center border-t border-white/5 text-[10px] text-gray-700 font-black uppercase tracking-[0.5em]">
        <div className="flex justify-center gap-10 mb-6">
          <Link href="/agb">AGB</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <Link href="/impressum">Impressum</Link>
        </div>
        <p>© 2024 BescheidRecht • Alle Rechte vorbehalten</p>
      </footer>
    </div>
  );
}
