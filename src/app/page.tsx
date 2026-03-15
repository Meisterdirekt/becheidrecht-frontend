"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, FileText, Shield, Copy, Download, Loader2, Printer, Lock, Zap, ClipboardList, PenLine, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";
import { SiteNavFull } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import DemoAnimation from "@/components/DemoAnimation";
import ScrollReveal from "@/components/ScrollReveal";
import dynamic from "next/dynamic";

const TestimonialsBlock = dynamic(() => import("@/components/TestimonialsBlock"), { ssr: false });
const RoiCalculator = dynamic(() => import("@/components/RoiCalculator").then((m) => ({ default: m.RoiCalculator })), { ssr: false });
import { pdf } from "@react-pdf/renderer";
import LetterPDF, { type LetterPDFData } from "@/components/LetterPDF";
import {
  TRAEGER_OPTIONS,
  SCHREIBENTYP_OPTIONS,
  getTraegerLabel,
  getSchreibentypLabel,
} from "@/lib/letter-generator";
import {
  getAntraegeByTraeger,
} from "@/lib/antraege-katalog";
import { getPageT, type Lang } from "@/lib/page-translations";
import { PrivacyModal } from "@/components/PrivacyModal";
import { PseudonymizationPreviewModal } from "@/components/PseudonymizationPreviewModal";

/* ── Animated stat counter (counts up on scroll) ── */
function parseStatValue(v: string) {
  const match = v.match(/^([^\d]*?)(\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) return null;
  return { prefix: match[1], numStr: match[2], suffix: match[3] };
}

function AnimatedStat({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const parsed = parseStatValue(value);
  const [display, setDisplay] = useState(() =>
    parsed ? parsed.prefix + "0" + parsed.suffix : value
  );
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !parsed) return;
    const { prefix, numStr, suffix } = parsed;
    const target = parseFloat(numStr.replace(",", "."));
    const hasDecimal = numStr.includes(".") || numStr.includes(",");
    const usesComma = numStr.includes(",");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * target;
            let formatted: string;
            if (hasDecimal) {
              formatted = current.toFixed(1);
              if (usesComma) formatted = formatted.replace(".", ",");
            } else {
              formatted = Math.round(current).toString();
            }
            setDisplay(prefix + formatted + suffix);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

const supportedAuthorities = [
  "Jobcenter (Bürgergeld/SGB II)",
  "Agentur für Arbeit (Arbeitslosengeld)",
  "Krankenkassen (GKV)",
  "Pflegekassen (Pflegeversicherung)",
  "Deutsche Rentenversicherung",
  "Sozialamt (Grundsicherung/Sozialhilfe)",
  "Versorgungsamt (Schwerbehinderung)",
  "Berufsgenossenschaft (Unfallversicherung)",
  "Wohngeldstelle",
  "Familienkasse (Kindergeld)",
  "BAföG-Amt",
  "Elterngeldstelle",
];

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
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showPseudonymPreview, setShowPseudonymPreview] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [tabTransition, setTabTransition] = useState(false);
  const heroTabRef = useRef<HTMLDivElement>(null);

  // Orchestrated page-load entrance
  useEffect(() => {
    requestAnimationFrame(() => setLoaded(true));
  }, []);

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

  const switchTab = (tab: 1 | 2) => {
    if (tab === activeTab) return;
    setTabTransition(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTabTransition(false);
    }, 150);
  };

  const scrollToHeroTab = (tab: 1 | 2) => {
    switchTab(tab);
    heroTabRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const validateLetterForm = (): string | null => {
    if (bescheiddatum.trim()) {
      const d = new Date(bescheiddatum.trim());
      if (Number.isNaN(d.getTime())) return "Bitte ein gültiges Datum eingeben.";
    }
    if (plz.trim() && !ort.trim()) return "Bitte Ort angeben, wenn PLZ ausgefüllt ist.";
    return null;
  };

  const handleGenerateLetter = async () => {
    if (!behoerde || !schreibentyp || stichpunkte.trim().length < 10 || !consentLetter) {
      setLetterError("Bitte Behörde, Schreibentyp und mindestens 10 Zeichen Stichpunkte ausfüllen sowie den Hinweis bestätigen.");
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
      toast.success("Kopiert!");
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
      aktenzeichen: aktenzeichen.trim() || "[bitte ergänzen]",
      bescheiddatum: bescheiddatum.trim() || "[bitte ergänzen]",
      schreibentypLabel: getSchreibentypLabel(schreibentyp),
      letter: generatedLetter,
    };
  };

  const handleDownloadPDF = async () => {
    const data = getLetterData();
    if (!data) return;
    setLetterError(null);
    try {
      const blob = await pdf(<LetterPDF data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.rel = "noopener";
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      const dateStr = dd + mm + yyyy;
      const safeAktenzeichen = (aktenzeichen.trim() || "Schreiben").replace(/[^a-zA-Z0-9-]/g, "_");
      a.download = `BescheidRecht_${safeAktenzeichen}_${dateStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("PDF wird heruntergeladen");
    } catch {
      setLetterError("PDF konnte nicht erstellt werden. Bitte erneut versuchen.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const t = getPageT(lang);

  return (
    <main className="min-h-screen bg-mesh text-[var(--text)]" dir={t.dir}>
      <SiteNavFull lang={lang} onLangChange={setLang} dir={t.dir} navLogin={t.navLogin} navRegister={t.navRegister} />

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 md:pb-28 px-4 sm:px-6 text-center overflow-hidden" aria-label="Hero">
        {/* Scanning grid pattern */}
        <div className="hero-grid absolute inset-0 pointer-events-none" />

        {/* Pulsierende blaue Lichtkreise */}
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

        {/* Floating § symbols */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { left: "8%", top: "18%", delay: "0s", duration: "20s", size: 16, opacity: 0.06 },
            { left: "88%", top: "12%", delay: "4s", duration: "24s", size: 20, opacity: 0.05 },
            { left: "22%", top: "72%", delay: "8s", duration: "18s", size: 14, opacity: 0.07 },
            { left: "72%", top: "65%", delay: "2s", duration: "22s", size: 18, opacity: 0.04 },
            { left: "48%", top: "8%", delay: "6s", duration: "26s", size: 22, opacity: 0.05 },
            { left: "4%", top: "50%", delay: "11s", duration: "19s", size: 15, opacity: 0.06 },
            { left: "92%", top: "45%", delay: "14s", duration: "21s", size: 13, opacity: 0.04 },
          ].map((s, i) => (
            <span
              key={i}
              className="floating-symbol"
              style={{
                left: s.left,
                top: s.top,
                fontSize: s.size,
                opacity: s.opacity,
                "--fs-delay": s.delay,
                "--fs-duration": s.duration,
              } as React.CSSProperties}
            >
              §
            </span>
          ))}
        </div>
        <h1 className={`hero-headline relative text-5xl md:text-7xl font-black leading-[1.05] tracking-tight bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {t.headlineSub != null ? (
            <>
              <span className="block">{t.headline}</span>
              <span className="hero-headline-sub block mt-4 text-2xl md:text-3xl font-bold tracking-wide opacity-90">
                {t.headlineSub}
              </span>
            </>
          ) : (
            t.headline
          )}
        </h1>
        <p className={`relative mt-10 mb-10 text-gray-400 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto transition-all duration-700 delay-150 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {t.text}
        </p>

        {/* Unterstützte Behörden — kompakt */}
        <div className={`relative max-w-3xl mx-auto mb-10 text-center transition-all duration-700 delay-250 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-4">
            16 Rechtsgebiete — u.a. Bescheide von:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Jobcenter", "Rentenversicherung", "Krankenkassen", "Pflegekassen", "Sozialamt", "BAMF"].map((authority) => (
              <span
                key={authority}
                className="inline-block px-3 py-1.5 bg-white/[0.04] text-white/50 rounded-full text-xs font-medium border border-white/[0.08]"
              >
                {authority}
              </span>
            ))}
            <span className="inline-block px-3 py-1.5 text-white/30 text-xs font-medium">
              + 10 weitere
            </span>
          </div>
        </div>

        <div className={`relative w-full max-w-2xl mx-auto hero-card-glow-wrapper transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-[0.98]"}`}>
        <div ref={heroTabRef} id="hero-tab" className="hero-card-glow-inner p-4 sm:p-6 md:p-10">
          {/* Tabs */}
          <div className="flex border-b border-white/10 mb-6 sm:mb-8">
            <button
              type="button"
              onClick={() => switchTab(1)}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 min-w-0 flex items-center justify-center gap-1.5 ${
                activeTab === 1 ? "text-[var(--accent)] border-b-2 border-[var(--accent)]" : "text-white/40 hover:text-white/70"
              }`}
            >
              <FileText className="h-3.5 w-3.5 flex-shrink-0" /> {t.tabAnalyze}
            </button>
            <button
              type="button"
              onClick={() => switchTab(2)}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 min-w-0 flex items-center justify-center gap-1.5 ${
                activeTab === 2 ? "text-[var(--accent)] border-b-2 border-[var(--accent)]" : "text-white/40 hover:text-white/70"
              }`}
            >
              <PenLine className="h-3.5 w-3.5 flex-shrink-0" /> {t.tabLetter}
            </button>
          </div>

          {/* Tab content with fade transition */}
          <div className={`transition-opacity duration-150 ${tabTransition ? "opacity-0" : "opacity-100"}`}>
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
                <label htmlFor="consent-checkbox" className="text-sm leading-snug font-medium text-white/90 select-none cursor-pointer">
                  {t.consent.split(t.consentPrivacyLink)[0]}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }}
                    className="text-[var(--accent)] hover:underline mx-0.5 inline"
                  >
                    {t.consentPrivacyLink}
                  </button>
                  {t.consent.split(t.consentPrivacyLink)[1] ?? ""}
                </label>
              </div>
              <PrivacyModal
                isOpen={showPrivacyModal}
                onClose={() => setShowPrivacyModal(false)}
                title={t.privacyModalTitle}
                bullet1={t.privacyModalBullet1}
                bullet2={t.privacyModalBullet2}
                bullet3={t.privacyModalBullet3}
                bullet4={t.privacyModalBullet4}
                rights={t.privacyModalRights}
                btnLabel={t.privacyModalBtn}
              />
              <Link
                href={consent ? "/analyze" : "#"}
                className={`block w-full py-4 rounded-2xl font-bold text-sm tracking-wide text-center transition-all duration-300 ${
                  consent ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:shadow-[0_0_30px_var(--accent-glow)] active:scale-[0.99]" : "bg-white/10 text-white/40 cursor-not-allowed pointer-events-none"
                }`}
              >
                {t.button}
              </Link>
              <p className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowPseudonymPreview(true)}
                  className="text-sm text-[var(--accent)] hover:underline"
                >
                  {t.pseudonymPreviewLink}
                </button>
              </p>
              <PseudonymizationPreviewModal
                isOpen={showPseudonymPreview}
                onClose={() => setShowPseudonymPreview(false)}
                title={t.pseudonymPreviewTitle}
                labelBefore={t.pseudonymPreviewBefore}
                labelAfter={t.pseudonymPreviewAfter}
                note={t.pseudonymPreviewNote}
                btnLabel={t.pseudonymPreviewBtn}
              />
            </>
          )}

          {/* Tab 2: Schreiben erstellen */}
          {activeTab === 2 && !generatedLetter && (
            <div className="text-left space-y-6">
              {/* Schritt A – Träger */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                  {t.formBehoerdeLabel}
                </label>
                <select
                  value={behoerde}
                  onChange={(e) => { setBehoerde(e.target.value); setSchreibentyp(""); }}
                  className="w-full bg-black/40 border border-white/20 rounded-lg text-white text-sm py-3 px-4 outline-none focus:border-[var(--accent)] transition-all duration-300"
                >
                  <option value="">🏢 {t.formBehoerdePlaceholder}</option>
                  {TRAEGER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              {/* Antrags-Katalog (nach Träger) */}
              {behoerde && (() => {
                const katalog = getAntraegeByTraeger(behoerde);
                return (
                  <>
                    {/* Formfreie Anträge aus dem Katalog */}
                    {katalog && katalog.formfreieAntraege.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <PenLine className="h-3.5 w-3.5 text-green-400" />
                          <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                            Formfreie Anträge — KI erstellt Ihr Schreiben
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1">
                          {katalog.formfreieAntraege.map((antrag) => (
                            <Link
                              key={antrag.id}
                              href={`/assistant?traeger=${katalog.traeger}&antrag=${encodeURIComponent(antrag.assistantPrompt)}`}
                              className="group flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03] transition-all hover:border-green-400/30 hover:bg-green-400/5"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{antrag.titel}</p>
                                <p className="text-xs text-white/40 truncate">{antrag.rechtsgrundlage}</p>
                              </div>
                              <ArrowRight size={14} className="text-white/20 group-hover:text-green-400 transition-colors flex-shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pflichtformulare */}
                    {katalog && katalog.pflichtformulare.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-3.5 w-3.5 text-amber-400" />
                          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                            Offizielle Vordrucke
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {katalog.pflichtformulare.map((form, i) => (
                            <a
                              key={i}
                              href={form.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03] transition-all hover:border-amber-400/30 hover:bg-amber-400/5"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{form.titel}</p>
                                <p className="text-xs text-white/30 truncate">{form.quelle}</p>
                              </div>
                              <ArrowRight size={14} className="text-white/20 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trennlinie + manuelles Schreiben */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-xs font-bold uppercase tracking-widest text-white/30">oder eigenes Schreiben</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Schritt B – Schreibentyp */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                        {t.formSchreibentypLabel}
                      </label>
                      <select
                        value={schreibentyp}
                        onChange={(e) => setSchreibentyp(e.target.value)}
                        className="w-full bg-black/40 border border-white/20 rounded-lg text-white text-sm py-3 px-4 outline-none focus:border-[var(--accent)] transition-all duration-300"
                      >
                        <option value="">&#x1f4dd; {t.formSchreibentypPlaceholder}</option>
                        {SCHREIBENTYP_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </>
                );
              })()}
              {/* Schritt C – Stichpunkte */}
              {schreibentyp && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                      {t.formStichpunkteLabel}
                    </label>
                    <textarea
                      value={stichpunkte}
                      onChange={(e) => setStichpunkte(e.target.value)}
                      placeholder={t.formStichpunktePlaceholder}
                      rows={4}
                      maxLength={500}
                      className="w-full bg-black/40 border border-white/20 rounded-lg text-white text-sm py-3 px-4 outline-none focus:border-[var(--accent)] transition-all duration-300 placeholder:text-white/30 resize-y min-h-[100px]"
                    />
                    <p className="text-xs text-white/40 mt-1">
                      {t.formStichpunkteHint} {stichpunkte.length}/500
                    </p>
                  </div>
                  {/* Aktenzeichen / Bescheiddatum / Adresse */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                      {t.formAktenzeichenLabel} <span className="font-normal text-white/40">{t.formAktenzeichenOptional}</span>
                    </label>
                    <input
                      type="text"
                      value={aktenzeichen}
                      onChange={(e) => setAktenzeichen(e.target.value)}
                      placeholder="z.B. BG-123456-2026"
                      className="w-full bg-black/40 border border-white/20 rounded-lg text-white text-sm py-3 px-4 outline-none focus:border-[var(--accent)] transition-all duration-300 placeholder:text-white/30"
                    />
                    <p className="text-xs text-white/40 mt-1">{t.formAktenzeichenHint}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                      {t.formBescheiddatumLabel} <span className="font-normal text-white/40">{t.formBescheiddatumOptional}</span>
                    </label>
                    <input
                      type="text"
                      value={bescheiddatum}
                      onChange={(e) => setBescheiddatum(e.target.value)}
                      placeholder={t.formBescheiddatumPlaceholder}
                      className="w-full bg-black/40 border border-white/20 rounded-lg text-white text-sm py-3 px-4 outline-none focus:border-[var(--accent)] transition-all duration-300 placeholder:text-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                      {t.formAdresseLabel} <span className="font-normal text-white/40">{t.formAdresseOptional}</span>
                    </label>
                    <input
                      type="text"
                      value={strasse}
                      onChange={(e) => setStrasse(e.target.value)}
                      placeholder={t.formStrassePlaceholder}
                      className="w-full bg-black/40 border border-white/20 rounded-lg text-white text-sm py-3 px-4 outline-none focus:border-[var(--accent)] transition-all duration-300 placeholder:text-white/30 mb-2"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={plz}
                        onChange={(e) => setPlz(e.target.value)}
                        placeholder={t.formPlzPlaceholder}
                        className="w-24 flex-shrink-0 bg-black/40 border border-white/20 rounded-lg text-white text-sm py-3 px-4 outline-none focus:border-[var(--accent)] transition-all duration-300 placeholder:text-white/30"
                      />
                      <input
                        type="text"
                        value={ort}
                        onChange={(e) => setOrt(e.target.value)}
                        placeholder={t.formOrtPlaceholder}
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
                    <label htmlFor="consent-letter" className="text-sm leading-snug text-white/80 select-none cursor-pointer">
                      {t.consentLetter}
                    </label>
                  </div>
                  {letterError && (
                    <p className="text-red-400 text-sm">{letterError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleGenerateLetter}
                    disabled={letterLoading || stichpunkte.trim().length < 10 || !consentLetter || (!!plz.trim() && !ort.trim())}
                    className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {letterLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t.btnGenerating}
                      </>
                    ) : (
                      t.btnGenerateLetter
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
              <div className="text-left space-y-4 sm:space-y-6 w-full min-w-0">
                <div className="no-print rounded-xl border border-red-500/30 bg-red-500/10 p-3 sm:p-4 text-left mb-2">
                  <p className="text-sm text-red-300 font-bold leading-relaxed">
                    ⚠️ VORLAGE – KEINE RECHTSSCHRIFT! Lassen Sie dieses Musterschreiben vor Verwendung von einem Anwalt oder Sozialverband prüfen!
                  </p>
                </div>
                <div className="no-print rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 text-white">
                  <h3 className="font-bold text-sm sm:text-base mb-1">📄 {t.resultTitle}</h3>
                  <p className="text-sm text-white/80 break-words">{t.resultAktenzeichen} {aktenzeichen.trim() || "[bitte ergänzen]"}</p>
                  <p className="text-sm text-white/80 break-words">{t.resultBehoerde} {getTraegerLabel(behoerde)}</p>
                </div>
                <div className="letter-content bg-white text-black p-4 sm:p-6 md:p-8 rounded-xl font-sans text-[10pt] sm:text-[11pt] leading-[1.5] w-full min-w-0 overflow-x-auto break-words">
                  <div className="text-[9pt] sm:text-[10pt] mb-5 leading-snug">
                    <div>{displayName}</div>
                    <div>{absenderStrasse}</div>
                    <div>{absenderPlzOrt}</div>
                    {letterUser?.email && <div>{letterUser.email}</div>}
                  </div>
                  <div className="mb-6 leading-snug">
                    <div>{getTraegerLabel(behoerde)}</div>
                    <div>{empfaengerAdresse}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-[9pt] sm:text-[10pt] mb-6">
                    <span>{t.resultDatum} {heute}</span>
                    <span className="break-all">{t.resultUnserZeichen} {aktenzeichen.trim() || "[bitte ergänzen]"}</span>
                  </div>
                  <div className="mb-5">
                    <p className="font-bold text-[11pt] sm:text-[13pt] underline break-words">
                      {getSchreibentypLabel(schreibentyp)}: Aktenzeichen {aktenzeichen.trim() || "[bitte ergänzen]"}
                    </p>
                    <p className="font-bold text-[11pt] sm:text-[13pt] underline break-words">Bescheid vom {bescheiddatum.trim() || "[bitte ergänzen]"}</p>
                  </div>
                  <p className="mb-4">{t.letterGreeting}</p>
                  <div className="text-justify whitespace-pre-wrap mb-6 break-words">{generatedLetter}</div>
                  <p className="mb-4">{t.letterClosing}</p>
                  <div className="mt-8 sm:mt-12 pt-2 border-t border-black w-40 sm:w-48 text-[9pt] sm:text-[10pt]">{displayName}</div>
                  <p className="mt-4 sm:mt-6 text-[9pt] sm:text-[10pt] break-words">{t.resultAnlage} {bescheiddatum.trim() || "[bitte ergänzen]"}</p>
                </div>
                <div className="no-print rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 sm:p-4 text-left">
                  <p className="text-xs sm:text-sm text-yellow-300 leading-relaxed">
                    ⚠️ {t.resultWarning}
                  </p>
                </div>
                <div className="no-print flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 rounded-xl font-bold text-sm uppercase tracking-wider bg-white/10 text-white border border-white/20 hover:bg-white/20 active:bg-white/25 transition-all duration-300 min-h-[44px]"
                  >
                    <Copy className="h-4 w-4 flex-shrink-0" />
                    {t.btnCopy}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 rounded-xl font-bold text-sm uppercase tracking-wider bg-white/10 text-white border border-white/20 hover:bg-white/20 active:bg-white/25 transition-all duration-300 min-h-[44px]"
                  >
                    <Download className="h-4 w-4 flex-shrink-0" />
                    {t.btnDownloadPdf}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 rounded-xl font-bold text-sm uppercase tracking-wider bg-white/10 text-white border border-white/20 hover:bg-white/20 active:bg-white/25 transition-all duration-300 min-h-[44px]"
                  >
                    <Printer className="h-4 w-4 flex-shrink-0" />
                    {t.btnPrint}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => { setGeneratedLetter(null); setLetterError(null); setLetterUser(null); }}
                  className="no-print text-[var(--accent)] text-sm font-bold uppercase tracking-wider hover:underline"
                >
                  {t.btnNewLetter}
                </button>
              </div>
            );
          })()}
          </div>{/* end tab-transition wrapper */}
        </div>
        </div>{/* end hero-card-glow-wrapper */}

        {/* Zweiter CTA: direkt zum Schreiben-Generator */}
        <div className="relative flex justify-center mt-8">
          <button
            type="button"
            onClick={() => scrollToHeroTab(2)}
            className="w-full sm:w-auto min-w-[220px] py-4 rounded-2xl font-bold text-sm tracking-wide text-center border-2 border-white/40 text-white hover:bg-white/10 transition-all duration-300"
          >
            ✍️ {t.ctaLetter}
          </button>
        </div>

        {/* Trust-Badges */}
        <div className={`relative flex flex-wrap justify-center gap-6 md:gap-10 mt-8 text-white/60 text-sm font-medium transition-all duration-700 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> {t.trustDsgvo}</span>
          <span className="flex items-center gap-2"><Zap className="h-3.5 w-3.5" /> {t.trustSofort}</span>
          <span className="flex items-center gap-2"><ClipboardList className="h-3.5 w-3.5" /> {t.trustPrice}</span>
        </div>
      </section>

      {/* Partner Logos */}
      <ScrollReveal>
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/50 mb-6 text-center">
            Gebaut für Einrichtungen wie
          </p>
          <div className="flex flex-wrap justify-center items-center gap-3">
            {["Schuldnerberatungen", "Wohlfahrtsverbände", "Sozialberatungsstellen", "Migrationsdienste", "Pflegeberatung"].map((org) => (
              <span
                key={org}
                className="px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-full text-sm text-white/38 select-none"
              >
                {org}
              </span>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <DemoAnimation />
      </ScrollReveal>

      {/* Stats */}
      <ScrollReveal>
        <section className="max-w-5xl mx-auto px-6 mb-28">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-group">
            {[
              { val: t.stat1Val, lbl: t.stat1Lbl },
              { val: t.stat2Val, lbl: t.stat2Lbl },
              { val: t.stat3Val, lbl: t.stat3Lbl },
              { val: t.stat4Val, lbl: t.stat4Lbl },
            ].map(({ val, lbl }) => (
              <div
                key={lbl}
                className="text-center p-6 md:p-8 rounded-2xl border border-white/10 bg-white/[0.03] animate-slideUp opacity-0 hover:-translate-y-1 transition-transform duration-300"
              >
                <p className="text-3xl md:text-4xl font-black text-white mb-2"><AnimatedStat value={val} /></p>
                <p className="text-xs text-white/65 font-bold uppercase tracking-wider leading-snug">{lbl}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Features - Bento (Glassmorphism, Icons, Hover) */}
      <ScrollReveal>
        <section className="max-w-6xl mx-auto px-6 mb-32">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
            {t.sectionWhatWeOffer}
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-16">
            {t.sectionAnalyseWriteSecure}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-group">
            {[
              { title: t.feature1Title, desc: t.feature1Desc, icon: Search },
              { title: t.feature2Title, desc: t.feature2Desc, icon: FileText },
              { title: t.feature3Title, desc: t.feature3Desc, icon: Shield },
            ].map((f) => (
              <div
                key={f.title}
                className="p-8 rounded-2xl border border-white/10 backdrop-blur-sm bg-white/[0.03] text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_8px_30px_-8px_var(--accent-glow)] animate-slideUp opacity-0"
              >
                <f.icon className="h-6 w-6 text-[var(--accent)] mb-4" aria-hidden />
                <h3 className="font-bold text-base uppercase tracking-wider text-white/90 mb-4">{f.title}</h3>
                <p className="text-white/60 text-[15px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>


      {/* Workflow */}
      <ScrollReveal>
        <section className="max-w-5xl mx-auto px-6 mb-32">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
            {t.workflowSectionLabel}
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-16">
            {t.workflowSectionTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-group">
            {[
              { n: "01", title: t.workflow1Title, desc: t.workflow1Desc },
              { n: "02", title: t.workflow2Title, desc: t.workflow2Desc },
              { n: "03", title: t.workflow3Title, desc: t.workflow3Desc },
            ].map(({ n, title, desc }) => (
              <div
                key={n}
                className="flex flex-col items-center text-center p-8 rounded-2xl border border-white/10 bg-white/[0.03] animate-slideUp opacity-0 hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 flex items-center justify-center mb-6">
                  <span className="text-[var(--accent)] font-black text-sm tracking-wider">{n}</span>
                </div>
                <h3 className="font-bold text-sm text-white/90 mb-3 uppercase tracking-wider">{title}</h3>
                <p className="text-white/60 text-[15px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ROI-Rechner */}
      <ScrollReveal>
        <section className="max-w-5xl mx-auto px-6 mb-32">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
            {t.roiSectionLabel}
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-4">
            {t.roiSectionTitle}
          </h2>
          <p className="text-white/60 text-sm text-center mb-12 max-w-xl mx-auto">
            {t.roiSectionDesc}
          </p>
          <RoiCalculator />
        </section>
      </ScrollReveal>

      {/* B2B Bridge */}
      <ScrollReveal>
        <section className="max-w-3xl mx-auto px-6 mb-20">
          <Link
            href="/b2b"
            className="block rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/[0.05] p-6 sm:p-8 text-center hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/[0.08] transition-all duration-300 group"
          >
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-2">
              Für Einrichtungen
            </p>
            <p className="text-white/70 text-sm leading-relaxed">
              Sie vertreten eine Beratungsstelle, einen Sozialverband oder eine Einrichtung?
              Entdecken Sie unsere B2B-Tarife mit Mengenrabatten und zentralem Fristen-Dashboard.
            </p>
            <span className="inline-flex items-center gap-1 mt-4 text-[var(--accent)] text-sm font-bold uppercase tracking-wider group-hover:gap-2 transition-all">
              Mehr erfahren <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </section>
      </ScrollReveal>

      {/* Integration — So nutzen Einrichtungen BescheidRecht */}
      <ScrollReveal>
        <section className="max-w-5xl mx-auto px-6 mb-32">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
            {t.integrationSectionLabel}
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-16">
            {t.integrationSectionTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-group">
            {[
              { n: "01", title: t.integration1Title, desc: t.integration1Desc },
              { n: "02", title: t.integration2Title, desc: t.integration2Desc },
              { n: "03", title: t.integration3Title, desc: t.integration3Desc },
            ].map(({ n, title, desc }) => (
              <div
                key={n}
                className="flex flex-col items-center text-center p-8 rounded-2xl border border-white/10 bg-white/[0.03] animate-slideUp opacity-0 hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 flex items-center justify-center mb-6">
                  <span className="text-[var(--accent)] font-black text-sm tracking-wider">{n}</span>
                </div>
                <h3 className="font-bold text-sm text-white/90 mb-3 uppercase tracking-wider">{title}</h3>
                <p className="text-white/60 text-[15px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Testimonials */}
      <ScrollReveal>
        <TestimonialsBlock />
      </ScrollReveal>

      {/* Pricing (PRO mit Glow + EMPFOHLEN Badge) */}
      <ScrollReveal>
        <section id="pricing" className="max-w-7xl mx-auto px-6 mb-32">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
            {t.sectionPrices}
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-16">
            {t.sectionTransparentPrices}
          </h2>
          <p className="text-center text-white/30 mb-12 text-sm">Alle Preise netto zzgl. 19 % MwSt. · Monatlich kündbar.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start stagger-group">
            {[
              { name: t.pricingBasicName, price: t.pricingBasicPrice, features: [t.pricingBasicF1, t.pricingBasicF2, t.pricingBasicF3], cta: t.pricingBasicCta, highlight: false, href: "mailto:info@bescheidrecht.de?subject=Anfrage%20Starter-Tarif" },
              { name: t.pricingStandardName, price: t.pricingStandardPrice, features: [t.pricingStandardF1, t.pricingStandardF2, t.pricingStandardF3], cta: t.pricingStandardCta, highlight: false, href: "mailto:info@bescheidrecht.de?subject=Anfrage%20Team-Tarif" },
              { name: t.pricingProName, price: t.pricingProPrice, features: [t.pricingProF1, t.pricingProF2, t.pricingProF3], cta: t.pricingProCta, highlight: true, href: "mailto:info@bescheidrecht.de?subject=Anfrage%20Einrichtung-Tarif" },
              { name: t.pricingBusinessName, price: t.pricingBusinessPrice, features: [t.pricingBusinessF1, t.pricingBusinessF2, t.pricingBusinessF3], cta: t.pricingBusinessCta, highlight: false, href: "mailto:info@bescheidrecht.de?subject=Anfrage%20Rahmenvertrag" },
            ].map((p) => (
              <div key={p.name} className="relative pt-8 animate-slideUp opacity-0">
                {p.highlight && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                    {t.recommended}
                  </div>
                )}
                <div
                  className={`rounded-2xl border p-8 flex flex-col text-left transition-all duration-300 ${
                    p.highlight
                      ? "pro-card-glow border-[var(--accent)] bg-[var(--accent)]/10 scale-[1.02]"
                      : "card card-hover border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-white/70">{p.name}</span>
                  <div className="mt-2 mb-6">
                    <p className={`font-black ${p.highlight ? "text-4xl" : "text-3xl"} text-white`}>{p.price}</p>
                    {p.price.includes("€") && (
                      <p className="text-sm text-white/55 font-medium mt-1">{t.pricingPerMonth}</p>
                    )}
                  </div>
                  <ul className="text-sm text-white/65 space-y-3 flex-grow mb-8">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={p.href}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                      p.highlight
                        ? "bg-white text-[var(--accent)] hover:bg-white/90"
                        : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                    }`}
                  >
                    {p.cta}
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Demo CTA */}
      <ScrollReveal>
        <section className="max-w-4xl mx-auto px-6 mb-32">
          <div className="relative rounded-3xl border border-[var(--accent)]/40 bg-[var(--accent)]/[0.08] p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[80px]"
                style={{ background: "radial-gradient(ellipse, rgba(14,165,233,0.22) 0%, transparent 70%)" }}
              />
            </div>
            <p className="relative text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-4">
              {t.demoCTALabel}
            </p>
            <h2 className="relative text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-6 text-white">
              {t.demoCTATitle}
            </h2>
            <p className="relative text-white text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed opacity-90">
              {t.demoCTAText}
            </p>
            <div className="relative flex justify-center">
              <Link
                href="/analyze"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-[var(--accent)] text-white font-bold text-sm tracking-wide hover:bg-[var(--accent-hover)] hover:shadow-[0_0_30px_var(--accent-glow)] transition-all duration-300"
              >
                {t.demoCTAPrimary}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Vertrauens-Sektion über Footer */}
      <ScrollReveal>
        <div className="border-t border-white/5 py-6">
          <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-12 text-xs font-bold uppercase tracking-[0.2em] text-white/55">
            <span>{t.trustSgb}</span>
            <span>{t.trustWeisungen}</span>
            <span>{t.trustRechtsgrundlagen}</span>
          </div>
        </div>
      </ScrollReveal>

      <SiteFooter
        feedback={t.footerFeedback}
        impressum={t.footerImpressum}
        datenschutz={t.footerDatenschutz}
        agb={t.footerAgb}
        disclaimer={t.footerDisclaimer}
        copyright={t.footerCopyright}
      />
    </main>
  );
}
