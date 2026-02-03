"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';

const translations = {
  DE: {
    headline: "EFFIZIENZ STEIGERN. ZEIT SPAREN. ENTLASTUNG SCHAFFEN.",
    text: "Die Analyse von Sozial- und Verwaltungsschreiben darf keine wertvollen Kapazitäten binden. BescheidRecht ist das digitale Präzisionswerkzeug für die automatisierte Strukturierung komplexer Dokumente. Wir liefern die technologische Lösung, um bürokratische Prozesse massiv zu beschleunigen, wertvolle Zeit zu sparen und die Fehlerquote in der Sachbearbeitung signifikant zu senken.\n\nLaden Sie Ihr Dokument hoch und erhalten Sie unmittelbar eine tiefgreifende strukturierte Analyse sowie einen professionell formulierten Antwort-Entwurf.",
    dropzone: "Datei hierher ziehen oder klicken",
    singlePurchase: "EINZELKAUF",
    pricingTitle: "TRANSPARENTE PREISE",
    consentText: "ICH WILLIGE EIN, DASS MEINE (GGF. SENSIBLEN) DATEN ZUR ANALYSE DURCH EINE KI VERARBEITET WERDEN. MIR IST BEKANNT, DASS DIES KEINE RECHTSBERATUNG ERSETZT.",
    footer: "© 2026 BESCHEIDRECHT. ALLE RECHTE VORBEHALTEN.",
    features: { analysis: "Analyse", draft: "Entwurf" },
    login: "ANMELDEN",
    register: "REGISTRIEREN"
  },
  EN: {
    headline: "INCREASE EFFICIENCY. SAVE TIME. CREATE RELIEF.",
    text: "The analysis of social and administrative documents must not tie up valuable capacities...",
    dropzone: "Drag file here or click",
    singlePurchase: "SINGLE PURCHASE",
    pricingTitle: "TRANSPARENT PRICING",
    consentText: "I CONSENT TO THE PROCESSING OF MY DATA BY AI. I AM AWARE THIS DOES NOT REPLACE LEGAL ADVICE.",
    footer: "© 2026 BESCHEIDRECHT. ALL RIGHTS RESERVED.",
    features: { analysis: "Analysis", draft: "Draft" },
    login: "LOGIN",
    register: "REGISTER"
  },
  TR: {
    headline: "VERİMLİLİĞİ ARTIRIN. ZAMAN KAZANIN. RAHATLIK YARATIN.",
    text: "Sosyal ve idari belgelerin analizi değerli kapasiteleri meşgul etmemelidir...",
    dropzone: "Dosyayı buraya sürükleyin veya tıklayın",
    singlePurchase: "TEK SEFERLİK SATIN ALMA",
    pricingTitle: "ŞEFFAF FİYATLANDIRMA",
    consentText: "VERİLERİMİN YAPAY ZEKA TARAFINDAN ANALİZ EDİLMESİNE İZİN VERİYORUM...",
    footer: "© 2026 BESCHEIDRECHT. TÜM HAKLARI SAKLIDIR.",
    features: { analysis: "Analiz", draft: "Taslak" },
    login: "GİRİŞ",
    register: "KAYIT OL"
  },
  AR: {
    headline: "زيادة الكفاءة. توفير الوقت. خلق الراحة.",
    text: "يجب ألا يستهلك تحليل المراسلات الاجتماعية والإدارية قدرات قيمة...",
    dropzone: "اسحب الملف إلى هنا أو انقر",
    singlePurchase: "شراء مستند واحد",
    pricingTitle: "أسعار شفافة",
    consentText: "أوافق على معالجة بياناتي بواسطة الذكاء الاصطناعي...",
    footer: "© 2026 BESCHEIDRECHT. جميع الحقوق محفوظة.",
    features: { analysis: "تحليل", draft: "مسودة" },
    login: "تسجيل الدخول",
    register: "تسجيل"
  },
  RU: {
    headline: "ПОВЫШАЙТЕ ЭФФЕКТИВНОСТЬ. ЭКОНОМЬТЕ ВРЕМЯ. СОЗДАВАЙТЕ ОБЛЕГЧЕНИЕ.",
    text: "Анализ социальных и административных писем не должен отнимать ценные ресурсы...",
    dropzone: "Перетащите файл сюда или нажмите",
    singlePurchase: "РАЗОВАЯ ПОКУПКА",
    pricingTitle: "ПРОЗРАЧНЫЕ ЦЕНЫ",
    consentText: "Я ДАЮ СОГЛАСИЕ НА ОБРАБОТКУ МОИХ ДАННЫХ ИИ...",
    footer: "© 2026 BESCHEIDRECHT. ВСЕ ПРАВА ЗАЩИЩЕНЫ.",
    features: { analysis: "Анализ", draft: "Черновик" },
    login: "ВХОД",
    register: "РЕГИСТРАЦИЯ"
  }
};

export default function Page() {
  const [lang, setLang] = useState<keyof typeof translations>('DE');
  const [consent, setConsent] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];
  const isRTL = lang === 'AR';

  return (
    <main className={`min-h-screen bg-[#020408] text-white font-sans ${isRTL ? 'text-right' : 'text-center'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/5 bg-[#020408]/80">
        <div className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
          <div className="flex-1 flex justify-start items-center gap-6">
            <button onClick={() => setIsMenuOpen(true)} className="group space-y-1.5 p-2">
              <div className="w-6 h-0.5 bg-white"></div>
              <div className="w-4 h-0.5 bg-white transition-all group-hover:w-6"></div>
              <div className="w-6 h-0.5 bg-white"></div>
            </button>
            <div className="hidden md:flex gap-4">
              {(['DE', 'EN', 'TR', 'AR', 'RU'] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`text-[11px] font-bold tracking-[0.1em] ${lang === l ? 'text-blue-500' : 'text-white/30 hover:text-white'}`}>{l}</button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <Link href="/" className="text-xl font-black italic tracking-tighter uppercase">Bescheid<span className="text-blue-500">Recht</span></Link>
          </div>

          <div className="flex-1 flex justify-end gap-6 items-center">
            <Link href="/login" className="hidden md:block text-white/40 text-[11px] font-bold uppercase tracking-[0.2em]">{t.login}</Link>
            <Link href="/register" className="bg-blue-600 px-6 py-2.5 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase">{t.register}</Link>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-[100] w-80 bg-[#0a0c10] border-r border-white/10 transform transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 h-full flex flex-col text-left">
          <button onClick={() => setIsMenuOpen(false)} className="self-end text-white/40 font-bold mb-12 uppercase text-xs">Schließen ×</button>
          <nav className="flex flex-col gap-8 text-xl font-black italic uppercase tracking-tighter">
            <Link href="/wer-wir-sind" onClick={() => setIsMenuOpen(false)}>Wer sind wir?</Link>
            <Link href="/funktionsweise" onClick={() => setIsMenuOpen(false)}>Wie es funktioniert</Link>
            <div className="h-px w-12 bg-white/10 my-4"></div>
            <Link href="/impressum" onClick={() => setIsMenuOpen(false)} className="text-white/40 text-lg">Impressum</Link>
          </nav>
        </div>
      </div>
      {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"></div>}

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto pt-24 pb-24 px-6">
        <h1 className="text-3xl md:text-5xl font-black mb-12 leading-tight tracking-tighter italic uppercase text-white">{t.headline}</h1>
        <p className="text-white/60 text-lg md:text-xl mb-16 max-w-3xl mx-auto whitespace-pre-line leading-relaxed">{t.text}</p>

        <div onClick={() => consent && fileInputRef.current?.click()} className={`relative p-16 rounded-3xl border-2 border-dashed transition-all ${consent ? 'border-blue-500/30 bg-blue-500/5 cursor-pointer hover:bg-blue-500/10' : 'border-white/10 bg-white/[0.02] opacity-40 cursor-not-allowed'} max-w-2xl mx-auto`}>
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if(f){setFileName(f.name);} }} />
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-blue-600 text-white text-2xl">{fileName ? '✓' : '↑'}</div>
          <p className="font-bold tracking-[0.1em] uppercase text-sm text-white">{fileName ? fileName : t.dropzone}</p>
        </div>

        <div className="flex items-start gap-4 text-left mt-10 p-7 bg-white/[0.03] rounded-2xl border border-white/10 max-w-2xl mx-auto">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 accent-blue-500 cursor-pointer" />
          <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 cursor-pointer leading-relaxed">{t.consentText}</label>
        </div>
      </section>

      {/* Pricing Section */}
      <h2 className="text-4xl font-black mb-20 text-center italic tracking-tighter uppercase text-white">{t.pricingTitle}</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto px-6 mb-24">
        <PricingCard name="BASIC" price="12,90 €" docs="5" t={t} lang={lang} />
        <PricingCard name="STANDARD" price="27,90 €" docs="12" t={t} lang={lang} />
        
        {/* PRO CARD */}
        <div className="relative group scale-105 z-10">
          <div className="absolute -inset-1 bg-blue-600 rounded-3xl blur opacity-30"></div>
          <div className="relative bg-blue-600 p-12 rounded-3xl h-full border border-blue-400 flex flex-col text-left">
            <span className="text-[11px] font-bold text-white uppercase mb-4 tracking-widest italic">PRO</span>
            <p className="text-6xl font-black mb-10 italic text-white tracking-tighter">75 €</p>
            <ul className="text-[14px] text-white space-y-5 flex-grow mb-12 font-medium">
              <li>• 35 {lang === 'DE' ? 'Dokumente' : 'Documents'}</li>
              <li>• {t.features.analysis}</li>
              <li>• {t.features.draft}</li>
            </ul>
            <button className="w-full bg-white text-blue-600 py-5 rounded-xl font-black text-[12px] uppercase tracking-widest">Wählen</button>
          </div>
        </div>

        <PricingCard name="BUSINESS" price="159 €" docs="90" t={t} lang={lang} />
      </div>

      {/* Einzelkauf */}
      <section className="pb-40 text-center px-6">
        <h2 className="text-2xl font-black mb-10 opacity-50 italic uppercase tracking-widest text-white">{t.singlePurchase}</h2>
        <div className="max-w-sm mx-auto">
          <div className="bg-[#0a0c10] border border-white/15 p-12 rounded-3xl">
            <p className="text-5xl font-black text-white mb-8 italic tracking-tighter uppercase">19,90 €</p>
            <ul className="text-[14px] text-white space-y-4 mb-10 text-center list-none font-medium">
              <li>1 {lang === 'DE' ? 'Dokument' : 'Document'}</li>
              <li>{t.features.analysis}</li>
              <li>{t.features.draft}</li>
            </ul>
            <button className="w-full bg-white text-black py-5 rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Jetzt Starten</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-24 text-[11px] font-bold tracking-[0.2em] text-white/20 uppercase text-center">
        <div className="flex justify-center gap-12 mb-10">
          <Link href="/impressum" className="hover:text-white transition-colors">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
          <Link href="/agb" className="hover:text-white transition-colors">AGB</Link>
        </div>
        <p dir="ltr" className="italic">{t.footer}</p>
      </footer>
    </main>
  );
}

function PricingCard({ name, price, docs, t, lang }: any) {
  return (
    <div className="bg-white/[0.03] border border-white/10 p-12 rounded-3xl flex flex-col hover:bg-white/[0.07] transition-all text-left">
      <span className="text-[11px] font-bold text-white uppercase mb-4 tracking-widest italic">{name}</span>
      <p className="text-4xl font-black mb-10 italic text-white tracking-tighter">{price}</p>
      <ul className="text-[14px] text-white space-y-5 flex-grow mb-12 font-medium">
        <li>• {docs} {lang === 'DE' ? 'Dokumente' : 'Documents'}</li>
        <li>• {t.features.analysis}</li>
        <li>• {t.features.draft}</li>
      </ul>
      <button className="w-full bg-blue-600/10 text-white border border-blue-500/20 py-5 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all">Wählen</button>
    </div>
  );
}
