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
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
        <div className="text-xl font-bold text-blue-500 uppercase tracking-tighter">BescheidRecht</div>
        <div className="flex items-center space-x-6">
          <div className="flex bg-[#111] p-1 rounded-lg border border-white/10">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded text-[10px] font-bold ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{l}</button>
            ))}
          </div>
          <Link href="/login" className="text-xs font-bold uppercase hover:text-blue-500 transition">Login</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-16 px-6 pb-24">
        <div className="text-center mb-12">
          {/* ÜBERSCHRIFT VERKLEINERT */}
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
            Auch genug vom <br />
            <span className="text-blue-600 italic">Behörden-Wahnsinn?</span>
          </h1>
          
          <div className="inline-block bg-blue-600/10 border border-blue-500/20 px-6 py-2 rounded-full mb-10">
            <p className="text-blue-500 font-bold text-[10px] tracking-[0.3em]">{t.claim}</p>
          </div>

          <div className="max-w-2xl mx-auto bg-[#050505] border border-white/5 p-12 rounded-[2.5rem] shadow-2xl mb-24">
            {!isAnalyzed ? (
              <button onClick={() => setIsAnalyzed(true)} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-xl text-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                {t.upload}
              </button>
            ) : (
              <div className="text-left space-y-6">
                <div className="bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20 flex gap-4 text-gray-300">
                  <MessageSquare className="text-blue-500 shrink-0" />
                  <p className="text-sm">Analyse abgeschlossen: Fehler gefunden. Schreiben bereit.</p>
                </div>
                <button className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2"><Download size={20} /> Download</button>
              </div>
            )}
          </div>

          {/* 4 SÄULEN MIT NEUEM BASIS PREIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Basis", price: "9.99€", icon: <Zap size={24}/>, items: ["1 Check / Monat", "KI-Analyse"] },
              { title: "Premium", price: "14.99€", icon: <Star size={24}/>, items: ["Unlimitierte Checks", "GPT-4o KI", "Full Support"], high: true },
              { title: "Pro", price: "29.99€", icon: <Shield size={24}/>, items: ["Multi-Nutzer", "KI-Erklärung"] },
              { title: "Business", price: "49€", icon: <Crown size={24}/>, items: ["API Zugriff", "Team Branding"] }
            ].map((plan, i) => (
              <div key={i} className={`p-8 rounded-[2rem] border ${plan.high ? 'bg-blue-600 border-blue-400 scale-105 z-10' : 'bg-[#0a0a0a] border-white/10'} flex flex-col text-left`}>
                <div className="text-blue-400 mb-4">{plan.icon}</div>
                <h3 className={`text-lg font-black mb-1 uppercase ${plan.high ? 'text-white' : ''}`}>{plan.title}</h3>
                <div className="text-3xl font-black mb-6 italic">{plan.price}</div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.items.map((item, j) => (
                    <li key={j} className="text-[10px] flex items-center gap-2 font-bold uppercase opacity-80"><CheckCircle2 size={12} /> {item}</li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-bold transition ${plan.high ? 'bg-white text-blue-600' : 'bg-white/5 hover:bg-white/10'}`}>Wählen</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
