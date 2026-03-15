"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileText, Loader2 } from "lucide-react";

const STEPS = {
  UPLOAD: 1,
  ANALYSE: 2,
  ERGEBNIS: 3,
  MUSTERSCHREIBEN: 4,
} as const;

const ANALYSIS_TEXTS = [
  "Behörde wird erkannt...",
  "Fristen werden geprüft...",
  "Fehler werden identifiziert...",
] as const;

const ERROR_CARDS = [
  {
    level: "KRITISCH" as const,
    color: "red",
    text: "Widerspruchsfrist nicht korrekt belehrt – § 25 SGB X",
  },
  {
    level: "WICHTIG" as const,
    color: "yellow",
    text: "Beratungspflicht § 14 SGB I nicht erfüllt",
  },
  {
    level: "HINWEIS" as const,
    color: "blue",
    text: "Antragstellung § 16 SGB I – Weiterleitung verzögert",
  },
] as const;

const MUSTERSCHREIBEN_PREFIX =
  "Widerspruch\n\nSehr geehrte Damen und Herren,\n\nhiermit lege ich Widerspruch ein gegen den Bescheid vom ";

export default function DemoAnimation() {
  const [step, setStep] = useState<number>(STEPS.UPLOAD);
  const [fileLanded, setFileLanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisTextIndex, setAnalysisTextIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const timelineRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const typewriterIndexRef = useRef(0);

  const clearTimers = () => {
    timelineRef.current.forEach((t) => clearTimeout(t));
    timelineRef.current = [];
  };

  useEffect(() => {
    clearTimers();

    if (step === STEPS.UPLOAD) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFileLanded(false);
      setProgress(0);
      setAnalysisTextIndex(0);
      setVisibleCards(0);
      setTypewriterText("");

      const t1 = setTimeout(() => setFileLanded(true), 400);
      const t2 = setTimeout(() => setStep(STEPS.ANALYSE), 2000);
      timelineRef.current = [t1, t2];
    }

    if (step === STEPS.ANALYSE) {
      setFileLanded(true);
      const start = Date.now();
      const duration = 3000;
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - start;
        const p = Math.min(100, (elapsed / duration) * 100);
        setProgress(p);
        if (p >= 100) clearInterval(progressInterval);
      }, 50);
      const textInterval = setInterval(() => {
        setAnalysisTextIndex((i) => (i + 1) % ANALYSIS_TEXTS.length);
      }, 1000);
      const t = setTimeout(() => {
        clearInterval(progressInterval);
        clearInterval(textInterval);
        setStep(STEPS.ERGEBNIS);
      }, duration);
      timelineRef.current = [t];
      return () => {
        clearInterval(progressInterval);
        clearInterval(textInterval);
      };
    }

    if (step === STEPS.ERGEBNIS) {
      setProgress(100);
      const t1 = setTimeout(() => setVisibleCards(1), 200);
      const t2 = setTimeout(() => setVisibleCards(2), 500);
      const t3 = setTimeout(() => setVisibleCards(3), 800);
      const t4 = setTimeout(() => setStep(STEPS.MUSTERSCHREIBEN), 3000);
      timelineRef.current = [t1, t2, t3, t4];
    }

    if (step === STEPS.MUSTERSCHREIBEN) {
      setVisibleCards(3);
      const fullText = MUSTERSCHREIBEN_PREFIX + "12.01.2026 (Aktenzeichen: JC-2026/…).\n\n";
      typewriterIndexRef.current = 0;
      setTypewriterText("");
      const charInterval = setInterval(() => {
        typewriterIndexRef.current += 1;
        setTypewriterText(fullText.slice(0, typewriterIndexRef.current));
        if (typewriterIndexRef.current >= fullText.length) clearInterval(charInterval);
      }, 35);
      const t = setTimeout(() => {
        clearInterval(charInterval);
        setStep(STEPS.UPLOAD);
      }, 2000);
      timelineRef.current = [t];
      return () => clearInterval(charInterval);
    }
  }, [step]);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <section className="max-w-2xl mx-auto px-6 py-16" aria-label="Demo-Animation: BescheidRecht in 4 Schritten">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-2 text-center">
        So funktioniert es
      </p>
      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center mb-10">
        Demo: BescheidRecht in 4 Schritten
      </h2>

      <div role="img" aria-label="Animierte Demo: Upload, Analyse, Fehlererkennung und Musterschreiben" className="rounded-2xl border border-white/10 bg-[#05070a] p-6 md:p-8 min-h-[320px] flex flex-col justify-center">
        {/* Step 1 – Upload */}
        {step === STEPS.UPLOAD && (
          <div className="relative flex flex-col items-center justify-center min-h-[260px]">
            <div
              className="relative w-full max-w-sm rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.03] p-10 flex flex-col items-center justify-center transition-all duration-500"
              style={{ minHeight: 200 }}
            >
              <div
                className={`flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all duration-700 ease-out ${
                  fileLanded ? "opacity-100 scale-100 translate-y-0" : "opacity-90 scale-90 -translate-y-16"
                }`}
              >
                <FileText className="h-8 w-8 text-[var(--accent)] flex-shrink-0" />
                <span className="text-sm font-medium text-white truncate max-w-[200px]">
                  Jobcenter_Bescheid.pdf
                </span>
              </div>
              {!fileLanded && (
                <p className="text-white/40 text-sm mt-4 animate-pulse">Drag & Drop – Datei hier ablegen...</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2 – Analyse */}
        {step === STEPS.ANALYSE && (
          <div className="space-y-6 relative overflow-hidden">
            {/* Scanning line */}
            <div
              className="absolute left-0 right-0 h-px pointer-events-none"
              style={{
                top: `${progress}%`,
                background: "linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--accent) 70%, transparent 100%)",
                opacity: progress < 98 ? 0.6 : 0,
                boxShadow: "0 0 8px 2px var(--accent-glow)",
                transition: "opacity 0.3s",
              }}
            />
            <div className="flex items-center justify-center gap-3 text-white/80">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
              <span className="text-sm font-medium">{ANALYSIS_TEXTS[analysisTextIndex]}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 3 – Ergebnis */}
        {step === STEPS.ERGEBNIS && (
          <div className="space-y-3">
            {ERROR_CARDS.map((card, i) => (
              <div
                key={card.level}
                className={`rounded-2xl border p-4 transition-all duration-300 ${
                  i < visibleCards
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2 pointer-events-none"
                } ${
                  card.color === "red"
                    ? "border-red-500/30 bg-red-500/10"
                    : card.color === "yellow"
                      ? "border-amber-500/30 bg-amber-500/10"
                      : "border-blue-500/30 bg-blue-500/10"
                }`}
              >
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${
                    card.color === "red"
                      ? "text-red-400"
                      : card.color === "yellow"
                        ? "text-amber-400"
                        : "text-blue-400"
                  }`}
                >
                  {card.color === "red" && "🔴 "}
                  {card.color === "yellow" && "🟡 "}
                  {card.color === "blue" && "🔵 "}
                  {card.level}:
                </span>
                <p className="text-white/90 text-sm mt-1">{card.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Step 4 – Musterschreiben */}
        {step === STEPS.MUSTERSCHREIBEN && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
              Musterschreiben (Auszug)
            </p>
            <pre className="text-sm text-white/90 whitespace-pre-wrap font-sans leading-relaxed">
              {typewriterText}
              <span className="animate-pulse">|</span>
            </pre>
          </div>
        )}

        {/* Step-Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s ? "w-6 bg-[var(--accent)]" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
