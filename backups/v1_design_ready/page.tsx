"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const translations = {
  DE: {
    headline: "EFFIZIENZ STEIGERN. ZEIT SPAREN. ENTLASTUNG SCHAFFEN.",
    text: "Die Analyse von Sozial- und Verwaltungsschreiben darf keine wertvollen Kapazitäten binden. BescheidRecht ist das digitale Präzisionswerkzeug für die automatisierte Strukturierung komplexer Dokumente. Wir liefern die technologische Lösung, um bürokratische Prozesse massiv zu beschleunigen, wertvolle Zeit zu sparen und die Fehlerquote in der Sachbearbeitung signifikant zu senken.\n\nLaden Sie Ihr Dokument hoch und erhalten Sie unmittelbar eine tiefgreifende strukturierte Analyse sowie einen professionell formulierten Antwort-Entwurf. Gewinnen Sie die Kontrolle über Ihren Terminkalender zurück, entlasten Sie Ihre Ressourcen und sichern Sie eine gleichbleibend hohe Qualität in jedem Verfahren – hochperformant, zeitsparend und absolut präzise.",
    button: "DOKUMENT JETZT HOCHLADEN",
  },
  RU: {
    headline: "ПОВЫШАЙТЕ ЭФФЕКТИВНОСТЬ. ЭКОНОМЬТЕ ВРЕМЯ.",
    text: "Анализ социальных и административных документов не должен отнимать ценные ресурсы. BescheidRecht — это цифровой инструмент для автоматизации обработки сложных документов. Загрузите ваш документ и получите мгновенный анализ.",
    button: "ЗАГРУЗИТЬ ДОКУМЕНТ",
  },
  EN: {
    headline: "BOOST EFFICIENCY. SAVE TIME. CREATE RELIEF.",
    text: "The analysis of social and administrative documents must not tie up valuable capacities. BescheidRecht is the digital precision tool for automated structuring. Upload your document and receive a professional response draft immediately.",
    button: "UPLOAD DOCUMENT NOW",
  },
  AR: {
    headline: "زيادة الكفاءة. توفير الوقت. خلق الراحة.",
    text: "لا ينبغي أن يستهلك تحليل المراسلات الاجتماعية والإدارية قدرات قيمة. BescheidRecht هي الأداة الرقمية الدقيقة للهيكلة الآلية للمستندات المعقدة. قم بتحميل مستندك واحصل على الفور على تحليل عميق.",
    button: "رفع المستند الآن",
  },
  TR: {
    headline: "VERİMLİLİĞİ ARTIRIN. ZAMAN KAZANIN.",
    text: "Sosyal ve idari yazıların analizi değerli kapasiteleri bağlamamalıdır. BescheidRecht, karmaşık belgelerin otomatik yapılandırılması için dijital hassas bir araçtır. Belgenizi yükleyin ve anında profesyonel bir analiz alın.",
    button: "DOKÜMANI ŞİMDİ YÜKLE",
  }
};

export default function Page() {
  const [lang, setLang] = useState('DE');
  const [consent, setConsent] = useState(false);
  const t = translations[lang as keyof typeof translations] || translations.DE;

  return (
    <main className="min-h-screen bg-[#05070a] text-white font-sans text-center">
      {/* NAV */}
      <nav className="flex justify-between items-center p-8 max-w-7xl mx-auto w-full">
        <div className="flex gap-4">
          {['DE', 'RU', 'EN', 'AR', 'TR'].map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`text-[12px] font-bold tracking-widest ${lang === l ? 'text-blue-500' : 'text-white/30 hover:text-white'}`}>{l}</button>
          ))}
        </div>
        <div className="flex gap-8 items-center">
          <Link href="/login" className="text-white/40 text-[12px] font-bold uppercase tracking-[0.2em] hover:text-white transition-colors">ANMELDEN</Link>
          <Link href="/register" className="bg-blue-600 text-white text-[12px] font-bold px-8 py-3 rounded-full uppercase tracking-[0.2em] hover:bg-blue-500 transition-all">REGISTRIEREN</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-5xl mx-auto pt-24 pb-24 px-6">
        <h1 className="text-5xl md:text-7xl font-black mb-14 leading-[1.05] tracking-tight">{t.headline}</h1>
        <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-16 max-w-3xl mx-auto whitespace-pre-line">{t.text}</p>

        <div className="max-w-2xl mx-auto bg-blue-600 p-12 rounded-2xl shadow-2xl shadow-blue-600/30">
          <div className="flex items-start gap-5 text-left mb-10">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-6 w-6 accent-black cursor-pointer" />
            <label className="text-[12px] leading-snug font-bold uppercase tracking-wider text-white select-none cursor-pointer">
              ICH WILLIGE EIN, DASS MEINE (GGF. SENSIBLEN) DATEN ZUR ANALYSE DURCH EINE KI VERARBEITET WERDEN. MIR IST BEKANNT, DASS DIES KEINE RECHTSBERATUNG ERSETZT.
            </label>
          </div>
          <button onClick={() => alert("Dokumenten-Upload-Fenster öffnet sich...")} disabled={!consent} className={`w-full py-5 rounded-lg font-black text-[13px] tracking-[0.2em] uppercase transition-all ${consent ? 'bg-black text-white hover:bg-gray-900 active:scale-[0.98]' : 'bg-black/20 text-white/40 cursor-not-allowed'}`}>
            {t.button}
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6 mb-40 text-left">
        <div className="bg-white/[0.02] border border-white/5 p-10 rounded-2xl">
          <h3 className="font-bold mb-5 text-base uppercase tracking-widest">Analyse</h3>
          <p className="text-gray-500 text-sm leading-relaxed">Strukturierte Prüfung Ihres Bescheids auf Auffälligkeiten, Fristen und Begründungen.</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-10 rounded-2xl">
          <h3 className="font-bold mb-5 text-base uppercase tracking-widest">Automatische Schreiben</h3>
          <p className="text-gray-500 text-sm leading-relaxed">Kontinuierliche Schreiben als Vorlage zur direkten Weiterverwendung in Ihrem Verfahren.</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-10 rounded-2xl">
          <h3 className="font-bold mb-5 text-base uppercase tracking-widest">Verständlich & sicher</h3>
          <p className="text-gray-500 text-sm leading-relaxed">Einfach erklärt, DSGVO-konform verarbeitet und jederzeit nachvollziehbar strukturiert.</p>
        </div>
      </div>

      <h2 className="text-5xl font-black mb-20 uppercase tracking-tighter">TRANSPARENTE PREISE</h2>

      {/* PRICING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto px-6 mb-40">
        {/* Basic */}
        <div className="bg-white/[0.03] border border-white/10 p-10 rounded-2xl flex flex-col text-left">
          <span className="text-[10px] font-bold text-white/40 uppercase mb-3 tracking-widest">BASIC</span>
          <p className="text-3xl font-black mb-8 italic">12,90 €</p>
          <ul className="text-[13px] text-gray-500 space-y-4 flex-grow mb-10"><li>• 5 Dokumente</li><li>• Automatisierte Analyse</li><li>• Inklusive Antwort-Entwürfe</li></ul>
          <button className="bg-blue-600 text-white py-4 rounded font-bold text-[11px] uppercase tracking-widest hover:bg-blue-500 transition-colors">BASIC WÄHLEN</button>
        </div>
        {/* Standard */}
        <div className="bg-white/[0.03] border border-white/10 p-10 rounded-2xl flex flex-col text-left">
          <span className="text-[10px] font-bold text-white/40 uppercase mb-3 tracking-widest">STANDARD</span>
          <p className="text-3xl font-black mb-8 italic">27,90 €</p>
          <ul className="text-[13px] text-gray-500 space-y-4 flex-grow mb-10"><li>• 12 Dokumente</li><li>• Widerspruchs-Analyse</li><li>• Persönlicher Support</li></ul>
          <button className="bg-blue-600 text-white py-4 rounded font-bold text-[11px] uppercase tracking-widest hover:bg-blue-500 transition-colors">STANDARD WÄHLEN</button>
        </div>
        {/* Pro */}
        <div className="bg-blue-600 border-2 border-blue-400 p-12 rounded-2xl flex flex-col text-left scale-105 z-10 shadow-3xl shadow-blue-600/40">
          <span className="text-[10px] font-bold text-white/80 uppercase mb-3 tracking-widest">PRO</span>
          <p className="text-5xl font-black mb-8 italic">75 €</p>
          <ul className="text-[14px] text-white space-y-4 flex-grow mb-10 font-medium"><li>• 35 Dokumente</li><li>• Priorisierte Bearbeitung</li><li>• Kanzlei-Anbindung</li></ul>
          <button className="bg-white text-blue-600 py-4 rounded font-black text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-colors">PRO WÄHLEN</button>
        </div>
        {/* Business */}
        <div className="bg-white/[0.03] border border-white/10 p-10 rounded-2xl flex flex-col text-left">
          <span className="text-[10px] font-bold text-white/40 uppercase mb-3 tracking-widest">BUSINESS</span>
          <p className="text-3xl font-black mb-8 italic">159 €</p>
          <ul className="text-[13px] text-gray-500 space-y-4 flex-grow mb-10"><li>• 90 Dokumente</li><li>• Full Service & Client-Manager</li><li>• Mehrbenutzer-Schnittstelle</li></ul>
          <button className="bg-white text-black py-4 rounded font-bold text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-colors">BUSINESS WÄHLEN</button>
        </div>
      </div>

      {/* SINGLE DOCUMENT */}
      <section className="mb-40">
        <h2 className="text-4xl font-black mb-4 uppercase tracking-tight">EINZELNES DOKUMENT</h2>
        <p className="text-gray-500 text-sm mb-16 uppercase tracking-[0.3em]">Für einen einmaligen Bescheid – ohne Abo</p>
        <div className="max-w-sm mx-auto bg-white/[0.03] border border-white/10 p-12 rounded-2xl">
           <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">EINZELKAUF</span>
           <p className="text-5xl font-black text-blue-500 my-6 italic">19,90 €</p>
           <ul className="text-[13px] text-left space-y-5 mb-10 font-medium">
             <li className="text-blue-500">✓ 1 Dokument</li>
             <li className="text-blue-500">✓ Automatisierte Analyse</li>
             <li className="text-blue-500">✓ 1 Schreiben</li>
             <li className="text-red-500">× Kein Abo</li>
           </ul>
           <button className="w-full bg-blue-600 py-5 rounded-lg font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all">EINZELKAUF STARTEN</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-24 text-[12px] font-bold tracking-[0.3em] text-white/20 uppercase">
        <div className="flex justify-center gap-16 mb-10">
          <Link href="/impressum" className="hover:text-white transition-colors">IMPRESSUM</Link>
          <Link href="/datenschutz" className="hover:text-white transition-colors">DATENSCHUTZ</Link>
          <Link href="/agb" className="hover:text-white transition-colors">AGB</Link>
        </div>
        <p>© 2026 BESCHEIDRECHT. ALLE RECHTE VORBEHALTEN.</p>
      </footer>
    </main>
  );
}
