'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, CheckCircle2, MessageSquare, Zap, Star, Crown, Shield } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const t: any = {
    DE: { hero: "Auch genug vom Behörden-Wahnsinn?", claim: "VERZICHTE NICHT AUF DEIN RECHT!", upload: "Dokument jetzt hochladen" },
    EN: { hero: "Tired of bureaucratic madness?", claim: "DON'T WAIVE YOUR RIGHTS!", upload: "Upload document now" },
    TR: { hero: "Bürokrasiden bıktınız mı?", claim: "HAKLARINIZDAN VAZGEÇMEYİN!", upload: "Belgeyi şimdi yükle" },
    AR: { hero: "هل سئمت من البيروقراطية؟", claim: "لا تتنازل عن حقك!", upload: "تحميل المستند الآن" },
    RU: { hero: "Устали от бюрократии?", claim: "НЕ ОТКАЗЫВАЙТЕСЬ ОТ СВОИХ ПРАВ!", upload: "Загрузить документ сейчас" }
  }[lang];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-500">BescheidRecht</div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded text-[10px] font-bold ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{l}</button>
            ))}
          </div>
          <Link href="/login" className="text-sm font-bold">Login</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-20 px-6 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight uppercase tracking-tighter italic">
            {t.hero.split(' ').slice(0, 3).join(' ')} <br />
            <span className="text-blue-600">{t.hero.split(' ').slice(3).join(' ')}</span>
          </h1>
          <div className="inline-block bg-blue-600/10 border border-blue-500/20 px-6 py-2 rounded-full mb-12">
            <p className="text-blue-500 font-bold text-xs tracking-widest">{t.claim}</p>
          </div>

          <div className="max-w-3xl mx-auto bg-[#0a0a0a] border border-white/10 p-16 rounded-[3rem] mb-24 shadow-2xl">
            {!isAnalyzed ? (
              <button onClick={() => setIsAnalyzed(true)} className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl text-2xl font-black transition-all shadow-lg shadow-blue-600/20">
                {t.upload}
              </button>
            ) : (
              <div className="text-left space-y-6">
                <div className="bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20 flex gap-4 italic text-gray-300">
                  <MessageSquare className="text-blue-500 shrink-0" />
                  <p>Analyse abgeschlossen: Wir haben Fehler gefunden. Das Schreiben steht bereit.</p>
                </div>
                <button className="w-full bg-white text-black py-5 rounded-2xl font-black flex items-center justify-center gap-3"><Download size={24} /> Download</button>
              </div>
            )}
          </div>

          {/* DIE 4 SÄULEN - FIXIERT AUF GRID-COLS-4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { title: "Basis", price: "0€", icon: <Zap />, items: ["1 Check", "Standard KI"] },
              { title: "Premium", price: "14.99€", icon: <Star />, items: ["Unlimitierte Checks", "GPT-4o KI", "Download"], high: true },
              { title: "Pro", price: "29.99€", icon: <Shield />, items: ["Multi-Nutzer", "KI-Chat Support"] },
              { title: "Business", price: "49€", icon: <Crown />, items: ["API Zugriff", "Branding"] }
            ].map((plan, i) => (
              <div key={i} className={`p-8 rounded-[2.5rem] border ${plan.high ? 'bg-blue-600 border-blue-400 scale-105 shadow-2xl' : 'bg-[#0a0a0a] border-white/10'} flex flex-col`}>
                <div className="mb-4">{plan.icon}</div>
                <h3 className="text-xl font-bold mb-2 uppercase italic">{plan.title}</h3>
                <div className="text-3xl font-black mb-6">{plan.price}</div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.items.map((item, j) => (
                    <li key={j} className="text-[11px] flex items-center gap-2 font-bold uppercase"><CheckCircle2 size={12} /> {item}</li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-bold ${plan.high ? 'bg-white text-blue-600' : 'bg-white/5 hover:bg-white/10'}`}>Wählen</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
