'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Upload, Download, CheckCircle2, MessageSquare, Scale, Zap, Star, Crown } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // Texte für alle Sprachen inklusive Russisch
  const translations: any = {
    DE: { hero: "Behörden-Wahnsinn?", claim: "Verzichte nicht auf dein Recht!", upload: "Dokument hochladen", download: "Schreiben herunterladen", who: "Wir sind BescheidRecht.", desc: "KI-Analyse für Ihren Erfolg." },
    EN: { hero: "Bureaucratic Madness?", claim: "Don't waive your rights!", upload: "Upload Document", download: "Download Letter", who: "We are BescheidRecht.", desc: "AI analysis for your success." },
    TR: { hero: "Bürokrasiden bıktınız mı?", claim: "Haklarınızdan vazgeçmeyin!", upload: "Belge Yükle", download: "Dosyayı İndir", who: "Biz BescheidRecht'iz.", desc: "Başarınız için yapay zeka analizi." },
    AR: { hero: "هل سئمت من البيروقراطية؟", claim: "لا تتنازل عن حقك!", upload: "تحميل المستند", download: "تحميل الرسالة", who: "نحن BescheidRecht.", desc: "تحليل الذكاء الاصطناعي لنجاحك." },
    RU: { hero: "Устали от бюрократии?", claim: "Не отказывайтесь от своих прав!", upload: "Загрузить документ", download: "Скачать письмо", who: "Мы — BescheidRecht.", desc: "ИИ-анализ для вашего успеха." }
  };

  const t = translations[lang] || translations.DE;

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans selection:bg-blue-500/30">
      {/* HEADER MIT SPRACH-KÜRZELN */}
      <nav className="p-6 flex justify-between items-center border-b border-white/5 sticky top-0 bg-[#05070a]/90 backdrop-blur-xl z-50">
        <div className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
          BESCHEIDRECHT
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button 
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === l ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <Link href="/login" className="text-xs font-bold uppercase tracking-widest hover:text-blue-400 transition">Login</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto pt-16 px-6">
        {/* HERO SECTION */}
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">{t.hero}</h1>
          <div className="inline-block bg-blue-600/10 border border-blue-500/20 px-6 py-2 rounded-full mb-8">
            <p className="text-blue-400 font-bold uppercase tracking-[0.2em] text-xs">{t.claim}</p>
          </div>
          <p className="text-gray-500 max-w-xl mx-auto font-medium">{t.who} {t.desc}</p>
        </div>

        {/* ANALYSE-BEREICH (KI CHAT & UPLOAD) */}
        <div className="max-w-3xl mx-auto mb-32">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-[#0a0c10] border border-white/10 p-12 rounded-[3rem] backdrop-blur-3xl shadow-2xl">
              {!isAnalyzed ? (
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20 shadow-inner">
                    <Upload size={40} className="text-blue-500" />
                  </div>
                  <button 
                    onClick={() => setIsAnalyzed(true)}
                    className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl text-2xl font-black transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                  >
                    {t.upload}
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/40">
                      <MessageSquare size={20} />
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <h4 className="font-bold text-blue-400 mb-2">KI-Zusammenfassung:</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Wir haben Ihren Bescheid analysiert. Es wurden zwei Formfehler in der Begründung gefunden. 
                        Ihr Anspruch auf Erstattung ist rechtmäßig. Wir haben das Schreiben für den Widerspruch fertiggestellt.
                      </p>
                    </div>
                  </div>
                  <button className="w-full bg-white text-black py-6 rounded-2xl text-xl font-black flex items-center justify-center gap-4 hover:bg-gray-200 transition">
                    <Download size={24} /> {t.download}
                  </button>
                  <button onClick={() => setIsAnalyzed(false)} className="w-full text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition">Zurück</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ABO MODELLE (EXAKT NACH DEINER VORLAGE) */}
        <div className="grid md:grid-cols-3 gap-8 mb-32 items-end">
          {/* FREE PLAN */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/[0.07] transition-all">
            <Zap className="text-blue-500 mb-6" size={32} />
            <h3 className="text-2xl font-black mb-2">Free</h3>
            <div className="text-4xl font-black mb-6">0€</div>
            <ul className="space-y-4 mb-8 text-sm text-gray-400 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> 1 Analyse / Monat</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> Standard KI</li>
            </ul>
            <button className="w-full py-4 rounded-xl bg-white/10 font-bold hover:bg-white/20 transition">Start</button>
          </div>

          {/* PREMIUM (DIE MITTLERE SÄULE) */}
          <div className="relative group scale-110 z-10">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition"></div>
            <div className="relative bg-blue-600 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-600/20">
              <Star className="text-white mb-6" size={32} fill="white" />
              <div className="absolute top-6 right-8 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Beliebtest</div>
              <h3 className="text-2xl font-black mb-2">Premium</h3>
              <div className="text-5xl font-black mb-8">14.99€</div>
              <ul className="space-y-4 mb-10 text-sm font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} /> Unlimitierte Analysen</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} /> Pro KI (GPT-4o)</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} /> KI-Chat Support</li>
              </ul>
              <button className="w-full py-4 rounded-xl bg-white text-blue-600 font-black hover:bg-gray-100 transition shadow-lg">Auswählen</button>
            </div>
          </div>

          {/* BUSINESS PLAN */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/[0.07] transition-all">
            <Crown className="text-blue-500 mb-6" size={32} />
            <h3 className="text-2xl font-black mb-2">Business</h3>
            <div className="text-4xl font-black mb-6">49€</div>
            <ul className="space-y-4 mb-8 text-sm text-gray-400 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> Team-Account</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> API Zugriff</li>
            </ul>
            <button className="w-full py-4 rounded-xl bg-white/10 font-bold hover:bg-white/20 transition">Kontakt</button>
          </div>
        </div>
      </main>

      <footer className="p-12 text-center border-t border-white/5 text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
        <div className="flex justify-center gap-12 mb-8">
          <Link href="/agb" className="hover:text-white transition">AGB</Link>
          <Link href="/datenschutz" className="hover:text-white transition">Datenschutz</Link>
          <Link href="/impressum" className="hover:text-white transition">Impressum</Link>
        </div>
        <p>© 2024 BescheidRecht • Wir kämpfen für Ihr Recht.</p>
      </footer>
    </div>
  );
}
