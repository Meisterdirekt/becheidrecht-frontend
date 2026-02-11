"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';

const translations = {
  DE: {
    headline: "Bescheide präzise analysieren",
    subheadline: "Ihr digitales Präzisionswerkzeug für strukturierte Dokumenten-Analyse",
    dropzone: "Bescheid hochladen",
    dropzoneSub: "Sicher & schnell",
    pricingTitle: "TRANSPARENTE PREISE",
    aboutTitle: "WER WIR SIND",
    aboutText: "BescheidRecht wurde entwickelt, um die Lücke zwischen komplexer Bürokratie und moderner Technologie zu schließen. Wir sind ein Team aus IT-Experten und Prozess-Optimierern, die daran glauben, dass KI-gestützte Analyse die Sachbearbeitung revolutionieren kann. Unsere Mission ist es, Präzision und Geschwindigkeit in Einklang zu bringen.",
    step1: "Präzise Strukturierung",
    step1Text: "KI-gestützte Erfassung aller relevanten Datenpunkte für eine lückenlose Übersicht.",
    step2: "Fehler-Erkennung",
    step2Text: "Automatisierte Prüfung auf formelle Unstimmigkeiten und fehlende Angaben im Dokument.",
    step3: "Zeit-Ersparnis",
    step3Text: "Vorbereitung strukturierter Daten zur direkten Weitergabe an Fachabteilungen oder Berater.",
    singlePurchase: "EINZELKAUF",
    consentText: "ICH WILLIGE EIN, DASS MEINE (GGF. SENSIBLEN) DATEN ZUR ANALYSE DURCH EINE KI VERARBEITET WERDEN. MIR IST BEKANNT, DASS DIES KEINE RECHTSBERATUNG ERSETZT.",
    footer: "© 2026 BESCHEIDRECHT. ALLE RECHTE VORBEHALTEN.",
    features: { analysis: "Analyse", draft: "Musterentwurf", doc: "Dokumente" },
    login: "ANMELDEN",
    register: "JETZT STARTEN"
  },
  // ... (andere Sprachen bleiben gleich)
  EN: { headline: "Analyze notices precisely", subheadline: "Your digital precision tool", dropzone: "Upload notice", dropzoneSub: "Safe & fast", pricingTitle: "PRICING", aboutTitle: "WHO WE ARE", aboutText: "Bridging the gap between bureaucracy and tech.", step1: "Structuring", step1Text: "AI-based data capture.", step2: "Detection", step2Text: "Automated checks.", step3: "Savings", step3Text: "Ready-to-use data.", singlePurchase: "SINGLE PURCHASE", consentText: "I CONSENT...", footer: "© 2026", features: { analysis: "Analysis", draft: "Draft", doc: "Docs" }, login: "LOGIN", register: "START" },
  TR: { headline: "Belgeleri analiz edin", subheadline: "Dijital aracınız", dropzone: "Yükle", dropzoneSub: "Güvenli", pricingTitle: "FİYATLAR", aboutTitle: "BİZ KİMİZ", aboutText: "Teknoloji ve bürokrasi.", step1: "Yapılandırma", step1Text: "Veri yakalama.", step2: "Hata Tespiti", step2Text: "Kontrol.", step3: "Tasarruf", step3Text: "Hazır veri.", singlePurchase: "TEK SATIN ALMA", consentText: "Onaylıyorum...", footer: "© 2026", features: { analysis: "Analiz", draft: "Taslak", doc: "Belge" }, login: "GİRİŞ", register: "BAŞLA" },
  AR: { headline: "تحليل المستندات", subheadline: "أداتك الرقمية", dropzone: "تحميل", dropzoneSub: "آمن", pricingTitle: "الأسعار", aboutTitle: "من نحن", aboutText: "البيروقراطية والتكنولوجيا.", step1: "هيكلة", step1Text: "التقاط البيانات.", step2: "كشف الأخطاء", step2Text: "فحص.", step3: "توفير", step3Text: "بيانات جاهزة.", singlePurchase: "شراء واحد", consentText: "أوافق...", footer: "© 2026", features: { analysis: "تحليل", draft: "مسودة", doc: "مستندات" }, login: "تسجيل", register: "ابدأ" },
  RU: { headline: "Анализ документов", subheadline: "Ваш инструмент", dropzone: "Загрузить", dropzoneSub: "Безопасно", pricingTitle: "ЦЕНЫ", aboutTitle: "КТО МЫ", aboutText: "Бюрократия и технологии.", step1: "Структура", step1Text: "Сбор данных.", step2: "Ошибки", step2Text: "Проверка.", step3: "Экономия", step3Text: "Готовые данные.", singlePurchase: "ПОКУПКА", consentText: "Согласен...", footer: "© 2026", features: { analysis: "Анализ", draft: "Черновик", doc: "Документы" }, login: "ВХОД", register: "START" }
};

export default function Page() {
  const [lang, setLang] = useState<keyof typeof translations>('DE');
  const [consent, setConsent] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const t = translations[lang];
  const isRTL = lang === 'AR';
const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!consent) {
    setAnalysisResult(
      "Bitte bestätigen Sie die Einwilligung, bevor Sie einen Bescheid hochladen."
    );
    return;
  }

  setFileName(file.name);
  setAnalysisResult("Omega-Logik entschlüsselt Daten... Bitte warten...");
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("file", file);

    // Falls deine Route anders heißt, hier anpassen:
    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Fehler bei der Analyse.");
    }

    const data = await response.json();

    setAnalysisData(data);

    let content: any = data.musterschreiben ?? "";

    // Falls musterschreiben direkt ein Objekt ist
    if (content && typeof content === "object") {
      const rubrum = content.rubrum ?? "";
      const chronologie = content.chronologie ?? "";
      const schluss = content.schluss ?? "";
      content = [rubrum, chronologie, schluss].filter(Boolean).join("\n\n");
    }
    // Falls musterschreiben ein JSON-String ist
    else if (typeof content === "string" && content.trim().startsWith("{")) {
      try {
        const nested = JSON.parse(content);
        if (nested.musterschreiben) {
          const ms = nested.musterschreiben;
          const rubrum = ms.rubrum ?? "";
          const chronologie = ms.chronologie ?? "";
          const schluss = ms.schluss ?? "";
          content = [rubrum, chronologie, schluss].filter(Boolean).join("\n\n");
        }
      } catch {
        // Wenn Parse fehlschlägt, benutzen wir den Originalstring
      }
    }

    setAnalysisResult(
      content || "Kein Musterschreiben konnte generiert werden."
    );
  } catch (err: any) {
    console.error(err);
    const msg =
      (err && typeof err === "object" && "message" in err && err.message) ||
      "Kritischer Fehler bei der Datenverarbeitung.";
    setAnalysisResult(`Fehler bei der Analyse: ${msg}`);
  } finally {
    setLoading(false);
  }
};

  function buildMusterschreibenPdf() {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    let y = margin;
    const lineHeight = 6;
    const lines = analysisResult.split('\n');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    for (const line of lines) {
      const wrapped = doc.splitTextToSize(line || ' ', maxWidth);
      for (const part of wrapped) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(part, margin, y);
        y += lineHeight;
      }
    }
    return doc;
  }

  function handleDownloadPdf() {
    if (!analysisResult?.trim()) return;
    buildMusterschreibenPdf().save('musterschreiben.pdf');
  }

  function handlePrintPdf() {
    if (!analysisResult?.trim()) return;
    const doc = buildMusterschreibenPdf();
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (w) w.onload = () => URL.revokeObjectURL(url);
    else URL.revokeObjectURL(url);
  }
       
            

  
return (
    <main className={`min-h-screen text-[#1E293B] font-sans ${isRTL ? 'text-right' : 'text-center'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dunkle Navigation */}
      <nav className="bg-slate-900 sticky top-0 z-50 shadow-lg">
        <div className="flex justify-between items-center p-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-500 rounded-xl"></div>
              <span>Bescheid<span className="text-blue-400 font-black">Recht</span></span>
            </Link>
            <div className="hidden md:flex gap-4">
              {(['DE', 'EN', 'TR', 'AR', 'RU'] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`text-xs font-bold tracking-widest ${lang === l ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-300 font-bold text-xs px-4 uppercase tracking-widest hover:text-white">{t.login}</Link>
            <Link href="/register" className="bg-blue-500 text-white px-6 py-2.5 rounded-full font-bold text-xs hover:bg-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-all uppercase tracking-widest">{t.register}</Link>
          </div>
        </div>
      </nav>

      {/* Hero mit farbigem Band */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-16 md:pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight uppercase text-center">{t.headline}</h1>
            <p className="text-lg md:text-xl text-slate-600 font-medium text-center max-w-2xl mx-auto">{t.subheadline}</p>
          </div>
        
        <div onClick={() => consent && !loading && fileInputRef.current?.click()} className={`relative p-16 rounded-3xl border-2 transition-all duration-300 max-w-2xl mx-auto mb-10 ${consent && !loading ? 'border-blue-400 bg-blue-100 cursor-pointer hover:bg-blue-200 hover:shadow-lg hover:scale-[1.01]' : consent && loading ? 'border-blue-400 bg-blue-100 cursor-wait' : 'border-slate-300 bg-slate-100 opacity-60 cursor-not-allowed'} shadow-md`}>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="application/pdf,image/*"
            onChange={handleUpload}
          />
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl shadow-lg ${consent && !loading ? 'bg-blue-600 text-white ring-4 ring-blue-300' : consent && loading ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-500'}`}>
            {loading ? (
              <span className="inline-block w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : fileName ? (
              '✓'
            ) : (
              '↑'
            )}
          </div>
          <h3 className="font-bold text-slate-900 mb-1 uppercase tracking-widest text-center">{loading ? 'Analysiere…' : fileName ? fileName : t.dropzone}</h3>
          <p className="text-xs text-slate-400 uppercase tracking-widest text-center">{t.dropzoneSub}</p>
        </div>

        <div className="flex items-start gap-4 text-left max-w-lg mx-auto bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-md mb-6">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 accent-blue-600 cursor-pointer rounded" />
          <label className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed cursor-pointer">
            {t.consentText}
          </label>
        </div>

        <p className="max-w-2xl mx-auto mb-10 text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] leading-relaxed text-center">
          Hinweis: Automatisierte, rechtlich unverbindliche Analyse – ersetzt keine Rechtsberatung.
        </p>

        {/* Analyse-Ergebnisse – Zuordnung + zweispaltiges Layout */}
        {(analysisResult || (analysisData?.fehler && Array.isArray(analysisData.fehler) && analysisData.fehler.length > 0)) && (
          <>
            {analysisData?.zuordnung && (
              <div className="mt-6 max-w-5xl mx-auto px-2 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {analysisData.zuordnung.behoerde}
                </span>
                {analysisData.zuordnung.rechtsgebiet && analysisData.zuordnung.rechtsgebiet !== "–" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {analysisData.zuordnung.rechtsgebiet}
                  </span>
                )}
                {analysisData.zuordnung.untergebiet && analysisData.zuordnung.untergebiet !== "–" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {analysisData.zuordnung.untergebiet}
                  </span>
                )}
              </div>
            )}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto items-start">
            {/* Linke Spalte: Hinweise / Fehler */}
            <div className="p-6 md:p-8 bg-white text-left border border-amber-200 rounded-2xl shadow-lg shadow-amber-500/5 min-h-[260px]">
              <h3 className="text-amber-800 font-black text-[11px] uppercase tracking-widest mb-4">
                Technische Hinweise auf mögliche Auffälligkeiten (keine Rechtsberatung)
              </h3>
              {analysisData?.fehler && Array.isArray(analysisData.fehler) && analysisData.fehler.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-slate-800 space-y-1">
                  {analysisData.fehler.map((f: string, idx: number) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">
                  Noch keine Hinweise vorhanden. Bitte einen Bescheid hochladen.
                </p>
              )}
            </div>

            {/* Rechte Spalte: Musterschreiben */}
            <div className="p-6 md:p-8 bg-slate-900 text-white rounded-2xl text-left border border-blue-400/30 shadow-xl shadow-slate-900/20 min-h-[260px] flex flex-col">
              <h3 className="text-blue-300 font-black text-[10px] uppercase tracking-widest mb-4">
                KI-Generiertes Musterschreiben
              </h3>
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed opacity-90 flex-1">
                {analysisResult || 'Noch kein Musterschreiben vorhanden. Bitte einen Bescheid hochladen.'}
              </pre>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleDownloadPdf}
                  disabled={!analysisResult}
                  className="text-[10px] font-bold bg-emerald-600 text-white px-4 py-2 rounded-full uppercase tracking-tighter hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ring-offset-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Als PDF herunterladen
                </button>
                <button
                  onClick={handlePrintPdf}
                  disabled={!analysisResult}
                  className="text-[10px] font-bold bg-white text-black px-4 py-2 rounded-full uppercase tracking-tighter hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 ring-offset-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Zum Drucken öffnen
                </button>
              </div>
            </div>
          </div>
          </>
        )}

        {/* Infocards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-24 md:mb-32">
          <InfoCard title={t.step1} text={t.step1Text} icon="🔍" />
          <InfoCard title={t.step2} text={t.step2Text} icon="🛡️" />
          <InfoCard title={t.step3} text={t.step3Text} icon="⚡" />
        </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 md:py-28 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 uppercase tracking-tighter">{t.aboutTitle}</h2>
          <p className="text-slate-600 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">{t.aboutText}</p>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 italic uppercase tracking-tighter text-center">{t.pricingTitle}</h2>
          <p className="text-slate-500 text-center mb-16 max-w-xl mx-auto">Wählen Sie das passende Paket für Ihren Bedarf.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 items-stretch">
            <PricingCard name="BASIC" price="12,90 €" docs="5" t={t} />
            <PricingCard name="STANDARD" price="27,90 €" docs="12" t={t} />
            <div className="relative md:-my-2 z-10">
              <div className="absolute -inset-px bg-gradient-to-b from-blue-500 to-blue-700 rounded-3xl blur-sm opacity-40"></div>
              <div className="relative h-full bg-gradient-to-b from-blue-600 to-blue-700 p-8 md:p-10 rounded-3xl flex flex-col text-left shadow-xl shadow-blue-900/20 text-white border-0">
                <span className="inline-block self-start px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-widest mb-4">Empfohlen</span>
                <span className="text-[11px] font-bold uppercase mb-1 tracking-widest opacity-90">PRO</span>
                <p className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">75 €</p>
                <ul className="text-[13px] space-y-3 flex-grow mb-8 font-medium opacity-95">
                  <li>• 35 {t.features.doc}</li>
                  <li>• {t.features.analysis}</li>
                  <li>• {t.features.draft}</li>
                </ul>
                <button className="w-full bg-white text-blue-600 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-all">Wählen</button>
              </div>
            </div>
            <PricingCard name="BUSINESS" price="159 €" docs="90" t={t} />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-slate-900 text-center">
        <h2 className="text-xl md:text-2xl font-black text-slate-300 uppercase tracking-[0.2em] mb-8">{t.singlePurchase}</h2>
        <div className="max-w-sm mx-auto bg-slate-800/80 border-2 border-blue-500/40 p-10 md:p-12 rounded-3xl shadow-2xl">
          <p className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">19,90 €</p>
          <p className="text-slate-400 text-sm mb-8">Einmalige Analyse inkl. Musterschreiben</p>
          <ul className="text-sm text-slate-300 space-y-3 mb-10 font-medium text-center list-none">
            <li>✓ 1 {t.features.doc}</li>
            <li>✓ {t.features.analysis}</li>
            <li>✓ {t.features.draft}</li>
          </ul>
          <Link href="/register" className="block w-full bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-all">Jetzt starten</Link>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-400 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
            <Link href="/impressum" className="text-[11px] font-bold tracking-widest uppercase hover:text-blue-400 transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="text-[11px] font-bold tracking-widest uppercase hover:text-blue-400 transition-colors">Datenschutz</Link>
            <Link href="/agb" className="text-[11px] font-bold tracking-widest uppercase hover:text-blue-400 transition-colors">AGB</Link>
          </div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">{t.footer}</p>
        </div>
      </footer>
    </main>
  );
}

function InfoCard({ title, text, icon }: any) {
  return (
    <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/50 text-left hover:shadow-lg hover:border-blue-200/80 hover:-translate-y-0.5 transition-all duration-200 group flex flex-col items-start min-h-[280px]">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">{icon}</div>
      <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-slate-900 mb-3">{title}</h3>
      <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">{text}</p>
    </div>
  );
}

function PricingCard({ name, price, docs, t }: any) {
  return (
    <div className="bg-white border border-slate-200/80 p-8 md:p-10 rounded-3xl shadow-md shadow-slate-200/30 text-left hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col group h-full">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{name}</span>
      <p className="text-3xl md:text-4xl font-black text-slate-900 mt-6 mb-8 tracking-tighter">{price}</p>
      <ul className="text-[13px] text-slate-600 space-y-3 flex-grow mb-8 font-medium">
        <li className="flex items-center gap-2"><span className="text-blue-500">•</span> {docs} {t.features.doc}</li>
        <li className="flex items-center gap-2"><span className="text-blue-500">•</span> {t.features.analysis}</li>
        <li className="flex items-center gap-2"><span className="text-blue-500">•</span> {t.features.draft}</li>
      </ul>
      <button className="w-full border-2 border-slate-200 text-slate-800 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 transition-all">Wählen</button>
    </div>
  );
}
