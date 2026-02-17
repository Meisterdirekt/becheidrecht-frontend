"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, FileText, Shield, Copy, Download, Loader2, Printer } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { SiteNavFull } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import DemoAnimation from "@/components/DemoAnimation";
import ScrollReveal from "@/components/ScrollReveal";
import { pdf } from "@react-pdf/renderer";
import LetterPDF, { type LetterPDFData } from "@/components/LetterPDF";
import {
  TRAEGER_OPTIONS,
  SCHREIBENTYP_OPTIONS,
  getTraegerLabel,
  getSchreibentypLabel,
} from "@/lib/letter-generator";

type Lang = "DE" | "RU" | "EN" | "AR" | "TR";

const translations: Record<
  Lang,
  { headline: string; headlineSub?: string; text: string; button: string; consent: string; dir: "ltr" | "rtl" }
> = {
  DE: {
    headline: "BescheidRecht",
    headlineSub: "Brief hochladen. Fehler finden.",
    text: "Behördenbriefe sind kompliziert, BescheidRecht ist einfach. Wir analysieren Ihre Dokumente auf typische Fehlerquellen und liefern Ihnen sofort die passenden Fakten für Ihre Rückmeldung. Keine Rechtsberatung, sondern ehrliche Technik, die Licht ins Dunkel der Paragraphen bringt. Zeit sparen, Fehler aufdecken und sicher sein, dass die Form stimmt – hochperformant und für jeden verständlich.",
    button: "Dokument jetzt hochladen",
    consent: "Ich willige ein, dass meine (ggf. sensiblen) Daten zur Analyse durch eine KI verarbeitet werden. Mir ist bekannt, dass dies keine Rechtsberatung ersetzt.",
    dir: "ltr",
  },
  RU: {
    headline: "ПОВЫШАЙТЕ ЭФФЕКТИВНОСТЬ. ЭКОНОМЬТЕ ВРЕМЯ.",
    text: "Анализ социальных и административных документов не должен отнимать ценные ресурсы. BescheidRecht – это цифровой инструмент для автоматизации обработки сложных документов. Загрузите ваш документ и получите мгновенный анализ.",
    button: "ЗАГРУЗИТЬ ДОКУМЕНТ",
    consent: "Я ДАЮ СОГЛАСИЕ НА ОБРАБОТКУ МОИХ (ВОЗМОЖНО ЧУВСТВИТЕЛЬНЫХ) ДАННЫХ С ПОМОЩЬЮ ИИ. МНЕ ИЗВЕСТНО, ЧТО ЭТО НЕ ЗАМЕНЯЕТ ЮРИДИЧЕСКУЮ КОНСУЛЬТАЦИЮ.",
    dir: "ltr",
  },
  EN: {
    headline: "BOOST EFFICIENCY. SAVE TIME. CREATE RELIEF.",
    text: "The analysis of social and administrative documents must not tie up valuable capacities. BescheidRecht is the digital precision tool for automated structuring. Upload your document and receive a professional response draft immediately.",
    button: "UPLOAD DOCUMENT NOW",
    consent: "I CONSENT TO MY (POSSIBLY SENSITIVE) DATA BEING PROCESSED BY AN AI FOR ANALYSIS. I AM AWARE THAT THIS DOES NOT REPLACE LEGAL ADVICE.",
    dir: "ltr",
  },
  AR: {
    headline: "زيادة الكفاءة. توفير الوقت. خلق الراحة.",
    text: "لا ينبغي أن يستهلك تحليل المراسلات الاجتماعية والإدارية قدرات قيمة. BescheidRecht هي الأداة الرقمية الدقيقة للهيكلة الآلية للمستندات المعقدة. قم بتحميل مستندك واحصل على الفور على تحليل عميق.",
    button: "رفع المستند الآن",
    consent: "أوافق على معالجة بياناتي (المحتملة الحساسية) بواسطة الذكاء الاصطناعي للتحليل. أعلم أن هذا لا يحل محل الاستشارة القانونية.",
    dir: "rtl",
  },
  TR: {
    headline: "VERİMLİLİĞİ ARTIRIN. ZAMAN KAZANIN.",
    text: "Sosyal ve idari yazıların analizi değerli kapasiteleri bağlamamalıdır. BescheidRecht, karmaşık belgelerin otomatik yapılandırılması için dijital hassas bir araçtır. Belgenizi yükleyin ve anında profesyonel bir analiz alın.",
    button: "DOKÜMANΙ ŞİMDİ YÜKLE",
    consent: "VERİLERİMİN (MUHTEMELEN HASSASİYET) BİR YAPAY ZEKA TARAFINDAN ANALİZ İÇİN İŞLENMESİNE RAZI OLUYORUM. BUNUN HUKUKİ DANIŞMANLIĞIN YERİNİ TUTMADIĞINI BİLİYORUM.",
    dir: "ltr",
  },
};

const CONSENT_LETTER =
  "Ich willige ein, dass meine Daten zur KI-Analyse verarbeitet werden. Dies ersetzt keine Rechtsberatung.";

export default function Page() {
  const [lang, setLang] = useState<Lang>("DE");
  const [consent, setConsent] = useState(false);
  const [activeTab, setActiveTab] = useState<1 | 2>(1);
  const [behoerde, setBehoerde] = useState("");
  const [schreibentyp, setSchreibentyp] = useState("");
  const [stichpunkte, setStichpunkte] = useState("");
  const [aktenzeichen, setAktenzeichen] = useState("");
  const [bescheiddatum, setBescheiddatum] = useState("");
  const [strasse, setStrasse] = useState("");
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState("");
  const [consentLetter, setConsentLetter] = useState(false);
  const [letterLoading, setLetterLoading] = useState(false);
  const [letterError, setLetterError] = useState<string | null>(null);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [letterUser, setLetterUser] = useState<{ name: string; email: string } | null>(null);
  const [supabaseClient, setSupabaseClient] = useState<ReturnType<typeof createBrowserClient> | null>(null);
  const heroTabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth-config", { cache: "no-store" });
        if (cancelled) return;
        const data = await res.json();
        if (data?.configured && data?.url && data?.anonKey) {
          setSupabaseClient(createBrowserClient(data.url, data.anonKey));
        } else {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          if (url && key) setSupabaseClient(createBrowserClient(url, key));
        }
      } catch {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && key) setSupabaseClient(createBrowserClient(url, key));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const scrollToHeroTab = (tab: 1 | 2) => {
    setActiveTab(tab);
    heroTabRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const validateLetterForm = (): string | null => {
    if (!aktenzeichen.trim()) return "Bitte Aktenzeichen eingeben – steht oben auf Ihrem Bescheid";
    if (aktenzeichen.trim().length < 4) return "Bitte Aktenzeichen eingeben – steht oben auf Ihrem Bescheid";
    if (!bescheiddatum.trim()) return "Bitte Datum des Bescheids eingeben";
    const d = new Date(bescheiddatum.trim());
    if (Number.isNaN(d.getTime())) return "Bitte Datum des Bescheids eingeben";
    if (plz.trim() && !ort.trim()) return "Bitte Ort angeben, wenn PLZ ausgefüllt ist.";
    return null;
  };

  const handleGenerateLetter = async () => {
    if (!behoerde || !schreibentyp || stichpunkte.trim().length < 20 || !consentLetter) {
      setLetterError("Bitte alle Felder ausfüllen und mindestens 20 Zeichen eingeben.");
      return;
    }
    const formErr = validateLetterForm();
    if (formErr) {
      setLetterError(formErr);
      return;
    }
    if (stichpunkte.length > 500) {
      setLetterError("Maximal 500 Zeichen erlaubt.");
      return;
    }
    const session = supabaseClient ? (await supabaseClient.auth.getSession()).data?.session : null;
    if (!session) {
      setLetterError("Bitte melden Sie sich an, um ein Schreiben zu erstellen.");
      return;
    }
    setLetterError(null);
    setLetterLoading(true);
    setGeneratedLetter(null);
    setLetterUser(null);
    try {
      const res = await fetch("/api/generate-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          behoerde: behoerde.trim(),
          schreibentyp: schreibentyp.trim(),
          stichpunkte: stichpunkte.trim(),
          aktenzeichen: aktenzeichen.trim(),
          bescheiddatum: bescheiddatum.trim(),
          strasse: strasse.trim() || undefined,
          plz: plz.trim() || undefined,
          ort: ort.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLetterError(data?.error || "Schreiben konnte nicht erstellt werden.");
        return;
      }
      const useRes = await fetch("/api/use-analysis", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (useRes.ok) {
        setGeneratedLetter(data.letter);
      } else {
        setGeneratedLetter(data.letter);
      }
      const { data: { user } } = await supabaseClient!.auth.getUser();
      if (user) {
        const firstName = (user.user_metadata?.first_name as string) ?? "";
        const lastName = (user.user_metadata?.last_name as string) ?? "";
        const name = ([firstName, lastName].filter(Boolean).join(" ")) || (user.email ?? "");
        setLetterUser({ name: name || "Nutzer", email: user.email ?? "" });
      }
    } catch {
      setLetterError("Ein Fehler ist aufgetreten. Bitte erneut versuchen.");
    } finally {
      setLetterLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter);
    }
  };

  const getLetterData = (): LetterPDFData | null => {
    if (!generatedLetter) return null;
    const heute = new Date().toLocaleDateString("de-DE");
    const name = letterUser?.name ?? "Nutzer";
    const email = letterUser?.email ?? "";
    const absenderStrasse = strasse.trim() || "[Ihre Straße und Hausnummer]";
    const absenderPlzOrt = [plz.trim(), ort.trim()].filter(Boolean).join(" ") || "[PLZ Ort]";
    return {
      absenderName: name,
      absenderStrasse,
      absenderPlzOrt,
      absenderEmail: email,
      empfaengerName: getTraegerLabel(behoerde),
      empfaengerAdresse: "[Adresse der Behörde eintragen]",
      datum: heute,
      aktenzeichen: aktenzeichen.trim(),
      bescheiddatum: bescheiddatum.trim(),
      schreibentypLabel: getSchreibentypLabel(schreibentyp),
      letter: generatedLetter,
    };
  };

  const handleDownloadPDF = async () => {
    const data = getLetterData();
    if (!data) return;
    try {
      const blob = await pdf(<LetterPDF data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      const dateStr = dd + mm + yyyy;
      const safeAktenzeichen = aktenzeichen.trim().replace(/[^a-zA-Z0-9-]/g, "_");
      a.download = `BescheidRecht_${safeAktenzeichen}_${dateStr}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setLetterError("PDF konnte nicht erstellt werden. Bitte erneut versuchen.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const t = translations[lang];

  return (
    <main className="min-h-screen bg-mesh text-white" dir={t.dir}>
      <SiteNavFull lang={lang} onLangChange={setLang} dir={t.dir} />

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto pt-20 pb-28 px-6 text-center overflow-hidden">
        {/* Pulsierende blaue Lichtkreise (radial gradient, opacity 0.15) */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="hero-glow-orb absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full blur-[100px]"
            style={{
              background: "radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 70%)",
            }}
          />
          <div
            className="hero-glow-orb absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[80px]"
            style={{
              background: "radial-gradient(circle, rgba(14, 165, 233, 0.35) 0%, transparent 65%)",
              animationDelay: "1s",
            }}
          />
        </div>
        <h1 className="relative text-5xl md:text-7xl font-black leading-[1.05] tracking-tight bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">
          {t.headlineSub != null ? (
            <>
              <span className="block">{t.headline}</span>
              <span className="block mt-4 text-2xl md:text-3xl font-bold tracking-wide opacity-90">
                {t.headlineSub}
              </span>
            </>
          ) : (
            t.headline
          )}
        </h1>
        <p className="relative mt-10 mb-14 text-gray-400 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
          {t.text}
        </p>

        <div ref={heroTabRef} id="hero-tab" className="relative max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-10 shadow-[0_0_60px_-15px_var(--accent-glow)] transition-all duration-300">
          {/* Tabs */}
          <div className="flex border-b border-white/10 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab(1)}
              className={`flex-1 py-3 text-[13px] font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 1 ? "text-[var(--accent)] border-b-2 border-[var(--accent)]" : "text-white/40 hover:text-white/70"
              }`}
            >
              📄 Bescheid analysieren
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(2)}
              className={`flex-1 py-3 text-[13px] font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 2 ? "text-[var(--accent)] border-b-2 border-[var(--accent)]" : "text-white/40 hover:text-white/70"
              }`}
            >
              ✍️ Schreiben erstellen
            </button>
          </div>

          {/* Tab 1: Bescheid analysieren */}
          {activeTab === 1 && (
            <>
              <div className="flex items-start gap-4 text-left mb-8">
                <input
                  type="checkbox"
                  id="consent-checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1.5 h-5 w-5 rounded border-white/20 bg-white/5 text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer flex-shrink-0"
                />
                <label htmlFor="consent-checkbox" className="text-[13px] leading-snug font-medium text-white/90 select-none cursor-pointer">
                  {t.consent}
                </label>
              </div>
              <Link
                href={consent ? "/analyze" : "#"}
                className={`block w-full py-4 rounded-2xl font-bold text-sm tracking-wide text-center transition-all duration-300 ${
                  consent ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:shadow-[0_0_30px_var(--accent-glow)] active:scale-[0.99]" : "bg-white/10 text-white/40 cursor-not-allowed pointer-events-none"
                }`}
              >
                {t.button}
              </Link>
            </>
          )}

          {/* Tab 2: Schreiben erstellen */}
          {activeTab === 2 && !generatedLetter && (
            <div className="text-left space-y-6">
              {/* Schritt A – Träger */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                  Für welche Behörde soll das Schreiben sein?
                </label>
                <select
                  value={behoerde}
                  onChange={(e) => { setBehoerde(e.target.value); setSchreibentyp(""); }}
                  className="w-full bg-black/40 border border-white/20 rounded-lg text-white text-sm py-3 px-4 outline-none focus:border-[var(--accent)] transition-all duration-300"
                >
                  <option value="">🏢 Bitte Behörde auswählen...</option>
                  {TRAEGER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              {/* Schritt B – Schreibentyp (nach Träger) */}
              {behoerde && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                    Was möchten Sie schreiben?
                  </label>
                  <select
                    value={schreibentyp}
                    onChange={(e) => setSchreibentyp(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg text-white text-sm py-3 px-4 outline-none focus:border-[var(--accent)] transition-all duration-300"
                  >
                    <option value="">📝 Bitte Typ auswählen...</option>
                    {SCHREIBENTYP_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Schritt C – Stichpunkte */}
              {schreibentyp && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                      Beschreiben Sie kurz Ihre Situation
                    </label>
                    <textarea
                      value={stichpunkte}
                      onChange={(e) => setStichpunkte(e.target.value)}
                      placeholder='z.B. "Bescheid vom 01.02.2026 erhalten, ALG wurde um 30% gekürzt, keine Begründung angegeben..."'
                      rows={4}
                      maxLength={500}
                      className="w-full bg-black/40 border border-white/20 rounded-lg text-white text-sm py-3 px-4 outline-none focus:border-[var(--accent)] transition-all duration-300 placeholder:text-white/30 resize-y min-h-[100px]"
                    />
                    <p className="text-[11px] text-white/40 mt-1">
                      Mindestens 20 Zeichen. Max 500 Zeichen. {stichpunkte.length}/500
                    </p>
                  </div>
                  {/* Aktenzeichen / Bescheiddatum / Adresse */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                      Aktenzeichen / Bescheid-Nummer: *
                    </label>
                    <input
                      type="text"
                      value={aktenzeichen}
                      onChange={(e) => setAktenzeichen(e.target.value)}
                      placeholder="z.B. BG-123456-2026"
                      className="w-full bg-black/40 border border-white/20 rounded-lg text-white text-sm py-3 px-4 outline-none focus:border-[var(--accent)] transition-all duration-300 placeholder:text-white/30"
                    />
                    <p className="text-[11px] text-white/40 mt-1">Steht oben rechts auf Ihrem Bescheid. (Pflichtfeld)</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                      Datum des Bescheids: *
                    </label>
                    <input
                      type="text"
                      value={bescheiddatum}
                      onChange={(e) => setBescheiddatum(e.target.value)}
                      placeholder="TT.MM.JJJJ"
                      className="w-full bg-black/40 border border-white/20 rounded-lg text-white text-sm py-3 px-4 outline-none focus:border-[var(--accent)] transition-all duration-300 placeholder:text-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                      Ihre Adresse: <span className="font-normal text-white/40">(optional – für das Schreiben)</span>
                    </label>
                    <input
                      type="text"
                      value={strasse}
                      onChange={(e) => setStrasse(e.target.value)}
                      placeholder="Straße & Hausnummer"
                      className="w-full bg-black/40 border border-white/20 rounded-lg text-white text-sm py-3 px-4 outline-none focus:border-[var(--accent)] transition-all duration-300 placeholder:text-white/30 mb-2"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={plz}
                        onChange={(e) => setPlz(e.target.value)}
                        placeholder="PLZ"
                        className="w-24 flex-shrink-0 bg-black/40 border border-white/20 rounded-lg text-white text-sm py-3 px-4 outline-none focus:border-[var(--accent)] transition-all duration-300 placeholder:text-white/30"
                      />
                      <input
                        type="text"
                        value={ort}
                        onChange={(e) => setOrt(e.target.value)}
                        placeholder="Ort"
                        className="flex-1 min-w-0 bg-black/40 border border-white/20 rounded-lg text-white text-sm py-3 px-4 outline-none focus:border-[var(--accent)] transition-all duration-300 placeholder:text-white/30"
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      id="consent-letter"
                      checked={consentLetter}
                      onChange={(e) => setConsentLetter(e.target.checked)}
                      className="mt-1.5 h-5 w-5 rounded border-white/20 bg-white/5 text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer flex-shrink-0"
                    />
                    <label htmlFor="consent-letter" className="text-[12px] leading-snug text-white/80 select-none cursor-pointer">
                      {CONSENT_LETTER}
                    </label>
                  </div>
                  {letterError && (
                    <p className="text-red-400 text-sm">{letterError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleGenerateLetter}
                    disabled={letterLoading || stichpunkte.trim().length < 20 || !consentLetter || aktenzeichen.trim().length < 4 || !bescheiddatum.trim() || (!!plz.trim() && !ort.trim())}
                    className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {letterLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Schreiben wird erstellt...
                      </>
                    ) : (
                      "Schreiben als Vorlage generieren"
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Tab 2 – Ergebnis (fertiges Schreiben) */}
          {activeTab === 2 && generatedLetter && (() => {
            const heute = new Date().toLocaleDateString("de-DE");
            const absenderStrasse = strasse.trim() || "[Ihre Straße und Hausnummer]";
            const absenderPlzOrt = [plz.trim(), ort.trim()].filter(Boolean).join(" ") || "[PLZ Ort]";
            const empfaengerAdresse = "[Adresse der Behörde eintragen]";
            const displayName = letterUser?.name ?? "Nutzer";
            return (
              <div className="text-left space-y-6">
                <div className="no-print rounded-xl border border-white/10 bg-white/5 p-4 text-white">
                  <h3 className="font-bold text-base mb-1">📄 Ihr Schreiben-Entwurf</h3>
                  <p className="text-sm text-white/80">Aktenzeichen: {aktenzeichen.trim()}</p>
                  <p className="text-sm text-white/80">Behörde: {getTraegerLabel(behoerde)}</p>
                </div>
                <div className="letter-content bg-white text-black p-8 rounded-xl font-sans text-[11pt] leading-[1.5]">
                  <div className="text-[10pt] mb-5 leading-snug">
                    <div>{displayName}</div>
                    <div>{absenderStrasse}</div>
                    <div>{absenderPlzOrt}</div>
                    {letterUser?.email && <div>{letterUser.email}</div>}
                  </div>
                  <div className="mb-6 leading-snug">
                    <div>{getTraegerLabel(behoerde)}</div>
                    <div>{empfaengerAdresse}</div>
                  </div>
                  <div className="flex justify-between text-[10pt] mb-6">
                    <span>Datum: {heute}</span>
                    <span>Unser Zeichen: {aktenzeichen.trim()}</span>
                  </div>
                  <div className="mb-5">
                    <p className="font-bold text-[13pt] underline">
                      {getSchreibentypLabel(schreibentyp)}: Aktenzeichen {aktenzeichen.trim()}
                    </p>
                    <p className="font-bold text-[13pt] underline">Bescheid vom {bescheiddatum.trim()}</p>
                  </div>
                  <p className="mb-4">Sehr geehrte Damen und Herren,</p>
                  <div className="text-justify whitespace-pre-wrap mb-6">{generatedLetter}</div>
                  <p className="mb-4">Mit freundlichen Grüßen</p>
                  <div className="mt-12 pt-2 border-t border-black w-48 text-[10pt]">{displayName}</div>
                  <p className="mt-6 text-[10pt]">Anlage: Kopie des Bescheids vom {bescheiddatum.trim()}</p>
                </div>
                <div className="no-print rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-left">
                  <p className="text-[12px] text-yellow-300 leading-relaxed">
                    ⚠️ Entwurf prüfen vor dem Absenden. Kein Ersatz für Rechtsberatung (§ 2 RDG).
                  </p>
                </div>
                <div className="no-print flex flex-col sm:flex-row flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-[12px] uppercase tracking-wider bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    <Copy className="h-4 w-4" />
                    Text kopieren
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-[12px] uppercase tracking-wider bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    <Download className="h-4 w-4" />
                    Als PDF herunterladen
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-[12px] uppercase tracking-wider bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    <Printer className="h-4 w-4" />
                    Drucken
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => { setGeneratedLetter(null); setLetterError(null); setLetterUser(null); }}
                  className="no-print text-[var(--accent)] text-[12px] font-bold uppercase tracking-wider hover:underline"
                >
                  Neues Schreiben erstellen
                </button>
              </div>
            );
          })()}
        </div>

        {/* Zweiter CTA: direkt zum Schreiben-Generator */}
        <div className="relative flex justify-center mt-8">
          <button
            type="button"
            onClick={() => scrollToHeroTab(2)}
            className="w-full sm:w-auto min-w-[220px] py-4 rounded-2xl font-bold text-sm tracking-wide text-center border-2 border-white/40 text-white hover:bg-white/10 transition-all duration-300"
          >
            ✍️ Schreiben erstellen
          </button>
        </div>

        {/* Trust-Badges */}
        <div className="relative flex flex-wrap justify-center gap-6 md:gap-10 mt-8 text-white/60 text-[13px] font-medium">
          <span className="flex items-center gap-2">🔒 DSGVO-konform</span>
          <span className="flex items-center gap-2">⚡ Sofortanalyse</span>
          <span className="flex items-center gap-2">📋 Einmalig 19,90 € ohne Abo</span>
        </div>
      </section>

      <ScrollReveal>
        <DemoAnimation />
      </ScrollReveal>

      {/* Features - Bento (Glassmorphism, Icons, Hover) */}
      <ScrollReveal>
        <section className="max-w-6xl mx-auto px-6 mb-32">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
            Was wir bieten
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-16">
            Analyse, Schreiben, Sicherheit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Analyse",
                desc: "Strukturierte Prüfung Ihres Bescheids auf Auffälligkeiten, Fristen und Begründungen.",
                icon: Search,
              },
              {
                title: "Automatische Schreiben",
                desc: "Professionelle Schreiben als Vorlage zur direkten Weiterverwendung in Ihrem Verfahren.",
                icon: FileText,
              },
              {
                title: "Verständlich & sicher",
                desc: "Einfach erklärt, DSGVO-konform verarbeitet und jederzeit nachvollziehbar strukturiert.",
                icon: Shield,
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-8 rounded-2xl border border-white/10 backdrop-blur-sm bg-white/[0.03] text-left transition-transform duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                <f.icon className="h-6 w-6 text-[var(--accent)] mb-4" aria-hidden />
                <h3 className="font-bold text-base uppercase tracking-wider text-white/90 mb-4">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Pricing (PRO mit Glow + EMPFOHLEN Badge) */}
      <ScrollReveal>
        <section id="pricing" className="max-w-7xl mx-auto px-6 mb-32">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
            Preise
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-16">
            Transparente Preise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {[
              { name: "Basic", price: "12,90 €", features: ["5 Dokumente", "Automatisierte Analyse", "Inkl. Antwort-Entwürfe"], cta: "Basic wählen", highlight: false },
              { name: "Standard", price: "27,90 €", features: ["12 Dokumente", "Widerspruchs-Analyse", "Persönlicher Support"], cta: "Standard wählen", highlight: false },
              { name: "Pro", price: "75 €", features: ["35 Dokumente", "Priorisierte Bearbeitung", "Kanzlei-Anbindung"], cta: "Pro wählen", highlight: true },
              { name: "Business", price: "159 €", features: ["90 Dokumente", "Full Service & Client-Manager", "Mehrbenutzer-Schnittstelle"], cta: "Business wählen", highlight: false },
            ].map((p) => (
              <div key={p.name} className="relative pt-8">
                {p.highlight && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                    EMPFOHLEN
                  </div>
                )}
                <div
                  className={`rounded-2xl border p-8 flex flex-col text-left transition-all duration-300 ${
                    p.highlight
                      ? "pro-card-glow border-[var(--accent)] bg-[var(--accent)]/10 scale-[1.02]"
                      : "card card-hover border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{p.name}</span>
                  <p className={`mt-2 mb-6 font-black ${p.highlight ? "text-4xl" : "text-3xl"} text-white`}>{p.price}</p>
                  <ul className="text-[13px] text-gray-500 space-y-3 flex-grow mb-8">
                    {p.features.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className={`w-full py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 ${
                      p.highlight
                        ? "bg-white text-[var(--accent)] hover:bg-white/90"
                        : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                    }`}
                  >
                    {p.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Single document */}
      <ScrollReveal>
        <section className="max-w-2xl mx-auto px-6 mb-32 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3">
            Einmalig
          </p>
          <h2 className="text-3xl font-black tracking-tight mb-2">Einzelnes Dokument</h2>
          <p className="text-gray-500 text-sm mb-10 uppercase tracking-wider">
            Für einen einmaligen Bescheid – ohne Abo
          </p>
          <div className="card card-hover p-10 rounded-2xl border-white/10 bg-white/[0.03] transition-transform duration-300 hover:-translate-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Einzelkauf</span>
            <p className="text-4xl font-black text-[var(--accent)] my-6">19,90 €</p>
            <ul className="text-[13px] text-left space-y-3 mb-8 font-medium text-white/80">
              <li className="text-[var(--accent)]">✓ 1 Dokument</li>
              <li className="text-[var(--accent)]">✓ Automatisierte Analyse</li>
              <li className="text-[var(--accent)]">✓ 1 Schreiben</li>
              <li className="text-red-400/80">× Kein Abo</li>
            </ul>
            <button
              type="button"
              className="w-full py-4 rounded-2xl bg-[var(--accent)] font-bold text-[11px] uppercase tracking-widest text-white hover:bg-[var(--accent-hover)] transition-all duration-300"
            >
              Einzelkauf starten
            </button>
          </div>
        </section>
      </ScrollReveal>

      {/* Vertrauens-Sektion über Footer */}
      <ScrollReveal>
        <div className="border-t border-white/5 py-6">
          <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-12 text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
            <span>Basiert auf SGB I–XII</span>
            <span>Weisungen Stand 2026</span>
            <span>Geprüfte Rechtsgrundlagen</span>
          </div>
        </div>
      </ScrollReveal>

      <SiteFooter />
    </main>
  );
}
