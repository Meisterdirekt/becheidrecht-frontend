"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Shield, Zap, FileText, Clock, Users, TrendingUp, ChevronDown, ScanEye, ShieldCheck, Route, FileSearch, PenTool, CheckCircle2, Loader2 } from "lucide-react";
import { DemoRequestButton } from "@/components/DemoRequestButton";

/* ──────────────────────────────────────────────────────────
   HOOK — Scroll-triggered reveal via IntersectionObserver
   ────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal-element ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   COUNTER — Animated number on scroll
   ────────────────────────────────────────────────────────── */
function Counter({ end, suffix = "", prefix = "", duration = 1800 }: { end: number; suffix?: string; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const start = 0;
          const startTime = performance.now();

          function animate(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);
            if (el) el.textContent = `${prefix}${current}${suffix}`;
            if (progress < 1) requestAnimationFrame(animate);
          }

          requestAnimationFrame(animate);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, suffix, prefix, duration]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

/* ──────────────────────────────────────────────────────────
   PIPELINE DEMO — Auto-animierte Pipeline für Pitch-Deck
   ────────────────────────────────────────────────────────── */

const DEMO_STEPS = [
  { phase: "upload", label: "Dokument", detail: "PII-Scan & Anonymisierung", detailDone: "2 PII-Treffer anonymisiert", icon: ScanEye },
  { phase: "security", label: "Sicherheit", detail: "Injection-Filter & Validierung", detailDone: "Dokument freigegeben", icon: ShieldCheck },
  { phase: "triage", label: "Routing", detail: "Rechtsgebiet & Dringlichkeit", detailDone: "SGB II — Jobcenter — HOCH", icon: Route },
  { phase: "analyse", label: "Analyse", detail: "Fehlerprüfung & Recherche", detailDone: "3 Fehler, 5 Urteile gefunden", icon: FileSearch },
  { phase: "brief", label: "Schreiben", detail: "Musterschreiben wird erstellt", detailDone: "DIN A4 PDF generiert", icon: PenTool },
  { phase: "done", label: "Fertig", detail: "Analyse abgeschlossen", detailDone: "Ergebnis in 12 Sekunden", icon: CheckCircle2 },
] as const;

function PipelineDemo() {
  const [activeStep, setActiveStep] = useState(-1);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Start animation when visible
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  // Step through phases
  useEffect(() => {
    if (!started) return;
    let step = 0;
    setActiveStep(0);
    const interval = setInterval(() => {
      step++;
      if (step >= DEMO_STEPS.length) {
        clearInterval(interval);
        // Restart after pause
        setTimeout(() => {
          setActiveStep(-1);
          setStarted(false);
          setTimeout(() => setStarted(true), 800);
        }, 3000);
        return;
      }
      setActiveStep(step);
    }, 1800);
    return () => clearInterval(interval);
  }, [started]);

  return (
    <div ref={ref} style={{ maxWidth: 480, margin: "0 auto" }}>
      <div className="glass-card" style={{ padding: "2rem 2rem 1.5rem", position: "relative", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.75rem" }}>
          <Shield size={14} style={{ color: "var(--pd-accent)" }} />
          <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase" as const, color: "var(--pd-accent)" }}>
            Pipeline aktiv
          </span>
          {activeStep >= 0 && activeStep < DEMO_STEPS.length && (
            <Loader2 size={12} style={{ color: "var(--pd-accent)", animation: "spin 1s linear infinite" }} />
          )}
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
          {DEMO_STEPS.map((step, i) => {
            const isCompleted = i < activeStep;
            const isCurrent = i === activeStep;
            const isFuture = i > activeStep || activeStep === -1;
            const Icon = step.icon;

            return (
              <div key={step.phase}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  transition: "opacity 0.4s ease",
                  opacity: isFuture ? 0.25 : 1,
                }}>
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.5s ease",
                    background: isCompleted ? "rgba(34,197,94,0.15)" : isCurrent ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.03)",
                    border: isCompleted ? "1px solid rgba(34,197,94,0.3)" : isCurrent ? "1px solid rgba(14,165,233,0.4)" : "1px solid rgba(255,255,255,0.08)",
                    color: isCompleted ? "#4ade80" : isCurrent ? "var(--pd-accent)" : "rgba(255,255,255,0.2)",
                  }}>
                    {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{
                        fontSize: "0.85rem", fontWeight: 700,
                        transition: "color 0.4s ease",
                        color: isCompleted ? "#4ade80" : isCurrent ? "var(--pd-text)" : "rgba(255,255,255,0.25)",
                      }}>
                        {step.label}
                      </span>
                      {isCompleted && (
                        <span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "rgba(34,197,94,0.5)" }}>
                          OK
                        </span>
                      )}
                      {isCurrent && (
                        <Loader2 size={11} style={{ color: "var(--pd-accent)", animation: "spin 1s linear infinite" }} />
                      )}
                    </div>
                    <p style={{
                      fontSize: "0.7rem", margin: 0, lineHeight: 1.4,
                      transition: "color 0.4s ease",
                      color: isFuture ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.35)",
                    }}>
                      {isCompleted ? step.detailDone : step.detail}
                    </p>
                  </div>
                </div>

                {/* Line */}
                {i < DEMO_STEPS.length - 1 && (
                  <div style={{
                    marginLeft: 18, width: 1, height: 14,
                    transition: "background 0.5s ease",
                    background: i < activeStep ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.06)",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────── */
export default function PitchDeckPage() {
  const scrollToContent = useCallback(() => {
    const el = document.getElementById("slide-problem");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="pitch-deck-root">
      {/* Google Fonts — Instrument Serif for headlines */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
        rel="stylesheet"
      />

      <style>{`
        /* ── BASE ── */
        .pitch-deck-root {
          --pd-bg: #0a0c10;
          --pd-bg-alt: #0f1117;
          --pd-surface: #161922;
          --pd-border: rgba(255,255,255,0.06);
          --pd-accent: #0ea5e9;
          --pd-accent-glow: rgba(14,165,233,0.15);
          --pd-gold: #d4a853;
          --pd-gold-soft: rgba(212,168,83,0.1);
          --pd-text: #e8eaed;
          --pd-text-muted: rgba(255,255,255,0.45);
          --pd-text-dim: rgba(255,255,255,0.25);
          --pd-serif: 'Instrument Serif', Georgia, 'Times New Roman', serif;
          --pd-sans: var(--font-outfit), system-ui, -apple-system, sans-serif;
          background: var(--pd-bg);
          color: var(--pd-text);
          font-family: var(--pd-sans);
          overflow-x: hidden;
        }

        /* ── NOISE TEXTURE ── */
        .pitch-deck-root::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px 256px;
        }

        /* ── SLIDES ── */
        .pd-slide {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 6rem 2rem;
          position: relative;
          overflow: hidden;
        }

        /* ── REVEAL ANIMATION ── */
        .reveal-element {
          opacity: 0;
          transform: translateY(32px);
          transition: none;
        }
        .reveal-element.revealed {
          animation: revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes revealUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes scroll-hint {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(6px); opacity: 1; }
        }

        /* ── GRADIENT ORB ── */
        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        /* ── GLASS CARD ── */
        .glass-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--pd-border);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card:hover {
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          transform: translateY(-2px);
        }

        /* ── SERIF HEADING ── */
        .pd-serif {
          font-family: var(--pd-serif);
          font-weight: 400;
          font-style: normal;
        }
        .pd-serif em, .pd-serif i {
          font-style: italic;
        }

        /* ── STAT CARD ── */
        .stat-ring {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .stat-ring::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid var(--pd-border);
          transition: border-color 0.3s;
        }
        .stat-ring:hover::before {
          border-color: var(--pd-accent);
        }

        /* ── PRICING CARD ── */
        .pricing-card {
          background: var(--pd-surface);
          border: 1px solid var(--pd-border);
          border-radius: 24px;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .pricing-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.1);
        }
        .pricing-card.featured {
          border-color: var(--pd-accent);
          background: linear-gradient(180deg, rgba(14,165,233,0.08) 0%, var(--pd-surface) 100%);
        }
        .pricing-card.featured::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--pd-accent), transparent);
        }

        /* ── STEP CONNECTOR ── */
        .step-line {
          position: absolute;
          top: 36px;
          left: calc(33.33% + 16px);
          width: calc(33.33% - 32px);
          height: 1px;
          background: linear-gradient(90deg, var(--pd-accent), var(--pd-border));
        }
        .step-line-2 {
          left: calc(66.66% + 16px);
        }

        /* ── QUOTE ── */
        .pd-quote {
          position: relative;
          padding-left: 2rem;
        }
        .pd-quote::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, var(--pd-accent), transparent);
          border-radius: 2px;
        }

        /* ── ORG PILL ── */
        .org-pill {
          padding: 0.5rem 1.25rem;
          border-radius: 100px;
          border: 1px solid var(--pd-border);
          background: rgba(255,255,255,0.02);
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--pd-text-muted);
          letter-spacing: 0.05em;
          transition: all 0.3s;
        }
        .org-pill:hover {
          border-color: var(--pd-accent);
          color: var(--pd-accent);
          background: var(--pd-accent-glow);
        }

        /* ── CTA BUTTON ── */
        .pd-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 2.5rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.875rem;
          letter-spacing: 0.02em;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-decoration: none;
        }
        .pd-cta-primary {
          background: var(--pd-accent);
          color: white;
          box-shadow: 0 0 40px var(--pd-accent-glow);
        }
        .pd-cta-primary:hover {
          background: #38bdf8;
          transform: translateY(-2px);
          box-shadow: 0 0 60px rgba(14,165,233,0.3);
        }
        .pd-cta-secondary {
          background: transparent;
          color: var(--pd-text);
          border: 1px solid var(--pd-border);
        }
        .pd-cta-secondary:hover {
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.03);
        }

        /* ── SLIDE NUMBER ── */
        .slide-number {
          position: absolute;
          bottom: 2rem;
          right: 2.5rem;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--pd-text-dim);
        }

        /* ── PRINT ── */
        @media print {
          .pd-slide { page-break-after: always; }
          .pd-slide:last-child { page-break-after: avoid; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .pitch-deck-root::before { display: none; }
          .reveal-element { opacity: 1 !important; transform: none !important; }
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .pd-slide { padding: 4rem 1.25rem; }
          .step-line, .step-line-2 { display: none; }
        }
      `}</style>

      {/* ═══════════ NAV ═══════════ */}
      <nav
        className="no-print fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(10,12,16,0.8)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--pd-border)",
          animation: "slideDown 0.6s ease-out both",
        }}
      >
        <span style={{ fontFamily: "var(--pd-serif)", fontSize: "1.25rem", color: "var(--pd-text)" }}>
          Bescheid<span style={{ color: "var(--pd-accent)" }}>Recht</span>
          <span style={{ marginLeft: "1rem", fontSize: "0.6rem", fontFamily: "var(--pd-sans)", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" as const, color: "var(--pd-text-dim)" }}>
            Partner-Präsentation
          </span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/" style={{ fontSize: "0.8125rem", color: "var(--pd-text-muted)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}>
            Hauptseite
          </Link>
          <DemoRequestButton
            className="pd-cta pd-cta-primary"
          >
            Demo buchen
          </DemoRequestButton>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════
          SLIDE 01 · COVER
      ═══════════════════════════════════════════════════ */}
      <section className="pd-slide" style={{ paddingTop: "8rem" }}>
        {/* Background orbs */}
        <div className="gradient-orb" style={{ width: 600, height: 600, top: "-10%", right: "-10%", background: "var(--pd-accent-glow)", opacity: 0.3 }} />
        <div className="gradient-orb" style={{ width: 400, height: 400, bottom: "10%", left: "-5%", background: "var(--pd-gold-soft)", opacity: 0.2 }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", position: "relative" }}>
          <Reveal>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" as const, color: "var(--pd-gold)", marginBottom: "2.5rem" }}>
              Vertraulich · Partner-Präsentation · 2026
            </p>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="pd-serif" style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)", lineHeight: 1, letterSpacing: "-0.02em", color: "var(--pd-text)", marginBottom: "0.5rem" }}>
              Bescheid<span style={{ color: "var(--pd-accent)" }}>Recht</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", fontWeight: 300, color: "var(--pd-text-muted)", maxWidth: 580, lineHeight: 1.5, marginBottom: "1rem" }}>
              Technische Bescheid-Analyse{" "}
              <em className="pd-serif" style={{ color: "var(--pd-text)", fontWeight: 400 }}>
                für soziale Einrichtungen.
              </em>
            </p>
          </Reveal>

          <Reveal delay={300}>
            <p style={{ fontSize: "0.95rem", color: "var(--pd-text-dim)", maxWidth: 500, lineHeight: 1.7, marginBottom: "3rem" }}>
              Wie Caritas, AWO und Diakonie täglich Stunden sparen — und mehr
              Klient:innen strukturiert unterstützen.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0.625rem", marginBottom: "4rem" }}>
              {["Caritas", "AWO", "Diakonie", "DRK", "Paritätischer"].map((o) => (
                <span key={o} className="org-pill">{o}</span>
              ))}
            </div>
          </Reveal>

          {/* KPI Row */}
          <Reveal delay={500}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", borderTop: "1px solid var(--pd-border)", paddingTop: "2.5rem" }}>
              {[
                { val: 163, suffix: "+", label: "Fehlertypen" },
                { val: 16, suffix: "", label: "Rechtsgebiete" },
                { val: 90, prefix: "< ", suffix: "s", label: "Analysezeit" },
                { val: 100, suffix: "%", label: "DSGVO" },
              ].map(({ val, suffix, prefix: p, label }) => (
                <div key={label} style={{ textAlign: "center" as const }}>
                  <p style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--pd-accent)", lineHeight: 1 }}>
                    <Counter end={val} suffix={suffix} prefix={p || ""} />
                  </p>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" as const, color: "var(--pd-text-dim)", marginTop: "0.375rem" }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Scroll hint */}
        <button
          onClick={scrollToContent}
          className="no-print"
          style={{
            position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)",
            background: "none", border: "none", cursor: "pointer", color: "var(--pd-text-dim)",
            animation: "scroll-hint 2s ease-in-out infinite",
          }}
          aria-label="Nach unten scrollen"
        >
          <ChevronDown size={24} />
        </button>

        <p style={{ position: "absolute", bottom: "2rem", left: "2.5rem", fontSize: "0.55rem", color: "var(--pd-text-dim)", maxWidth: 360 }}>
          Technisches Analyse-Werkzeug gem. § 2 Abs. 1 RDG. Kein Ersatz für Rechtsberatung.
        </p>
        <span className="slide-number">1 / 8</span>
      </section>

      {/* ═══════════════════════════════════════════════════
          SLIDE 02 · DAS PROBLEM
      ═══════════════════════════════════════════════════ */}
      <section id="slide-problem" className="pd-slide" style={{ background: "var(--pd-bg-alt)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <Reveal>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase" as const, color: "var(--pd-accent)", marginBottom: "1rem" }}>
              01 · Das Problem
            </p>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="pd-serif" style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)", lineHeight: 1.1, color: "var(--pd-text)", marginBottom: "1rem" }}>
              Jeder fehlerhafte Bescheid<br />
              kostet Ihre Klient:innen{" "}
              <em style={{ color: "#ef4444" }}>bares Geld.</em>
            </h2>
          </Reveal>

          <Reveal delay={150}>
            <p style={{ fontSize: "1.05rem", color: "var(--pd-text-muted)", maxWidth: 600, lineHeight: 1.7, marginBottom: "3.5rem" }}>
              Soziale Einrichtungen kämpfen täglich: zu viele Fälle, zu wenig Zeit, keine
              digitalen Werkzeuge für systematische Bescheid-Prüfung.
            </p>
          </Reveal>

          <Reveal delay={250}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "3rem" }}>
              {[
                {
                  stat: "40",
                  suffix: "%",
                  label: "Erfolgreiche Widersprüche*",
                  desc: "Der Widersprüche gegen Jobcenter-Bescheide sind ganz oder teilweise erfolgreich — die Fehler existieren, sie werden nur nicht systematisch gefunden.",
                  accent: "#ef4444",
                },
                {
                  stat: "1–2",
                  suffix: "h",
                  label: "Pro komplexem Fall",
                  desc: "Verbringt eine Fachkraft erfahrungsgemäß mit manueller Recherche, Paragraph-Suche und Briefentwurf — Zeit, die für weitere Klient:innen fehlt.",
                  accent: "#f59e0b",
                },
                {
                  stat: "1",
                  suffix: " Monat",
                  label: "Widerspruchsfrist (§ 84 SGG)",
                  desc: "Läuft ohne systematische Fristüberwachung ungenutzt ab. Eine verpasste Frist bedeutet: kein Widerspruch mehr möglich.",
                  accent: "#ef4444",
                },
              ].map(({ stat, suffix, label, desc, accent }) => (
                <div key={stat} className="glass-card" style={{ padding: "2.25rem" }}>
                  <p style={{ fontSize: "3.5rem", fontWeight: 900, lineHeight: 1, color: accent, marginBottom: "0.5rem" }}>
                    {stat}<span style={{ fontSize: "1.75rem" }}>{suffix}</span>
                  </p>
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "var(--pd-text)", marginBottom: "1rem" }}>
                    {label}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--pd-text-muted)", lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={350}>
            <div className="pd-quote" style={{ maxWidth: 700 }}>
              <p style={{ fontSize: "1.125rem", fontStyle: "italic", color: "var(--pd-text)", lineHeight: 1.6 }}>
                &ldquo;Unsere Berater:innen wissen oft, dass etwas nicht stimmt — aber sie
                haben nicht die Zeit, es systematisch zu prüfen.&rdquo;
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--pd-text-dim)", marginTop: "0.75rem" }}>
                Typisches Feedback aus Sozialberatungen
              </p>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <p style={{ fontSize: "0.65rem", color: "var(--pd-text-dim)", marginTop: "2rem" }}>
              * Quelle: Statistik der Bundesagentur für Arbeit, Widersprüche und Klagen SGB II (2025). Inkl. teilweise stattgegebener Widersprüche und Abhilfe.
            </p>
          </Reveal>
        </div>
        <span className="slide-number">2 / 8</span>
      </section>

      {/* ═══════════════════════════════════════════════════
          SLIDE 03 · DIE LÖSUNG
      ═══════════════════════════════════════════════════ */}
      <section className="pd-slide">
        <div className="gradient-orb" style={{ width: 500, height: 500, top: "20%", right: "-8%", background: "var(--pd-accent-glow)", opacity: 0.15 }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", position: "relative" }}>
          <Reveal>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase" as const, color: "var(--pd-accent)", marginBottom: "1rem" }}>
              02 · Die Lösung
            </p>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="pd-serif" style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)", lineHeight: 1.1, color: "var(--pd-text)", marginBottom: "1rem" }}>
              BescheidRecht: <em>Technische Analyse</em><br />
              für Ihre Fachkräfte.
            </h2>
          </Reveal>

          <Reveal delay={150}>
            <p style={{ fontSize: "1.05rem", color: "var(--pd-text-muted)", maxWidth: 600, lineHeight: 1.7, marginBottom: "3.5rem" }}>
              Bescheid hochladen — automatische Analyse auf Unstimmigkeiten —
              Musterschreiben-Vorlage als PDF. In unter 90 Sekunden.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            {[
              {
                icon: Zap,
                title: "13 KI-Agenten parallel",
                desc: "Spezialisierte Agenten prüfen gleichzeitig Fristen, Rechtsbasis, Formfehler und Begründungsmängel.",
                delay: 200,
              },
              {
                icon: FileText,
                title: "163+ geprüfte Fehlertypen",
                desc: "Technische Prüfung über 16 Rechtsgebiete: SGB II bis XII, BAMF, BAföG, Wohngeld und mehr.",
                delay: 280,
              },
              {
                icon: Shield,
                title: "DSGVO by Design",
                desc: "Vollautomatische Pseudonymisierung aller Klientendaten vor jeder Analyse. Art. 25 DSGVO.",
                delay: 360,
              },
              {
                icon: Clock,
                title: "< 90 Sekunden",
                desc: "Vom Hochladen bis zum Analyse-Ergebnis mit Musterschreiben-Vorlage als DIN A4 PDF.",
                delay: 440,
              },
            ].map(({ icon: Icon, title, desc, delay }) => (
              <Reveal key={title} delay={delay}>
                <div className="glass-card" style={{ padding: "2rem", display: "flex", gap: "1.25rem", alignItems: "flex-start", height: "100%" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "var(--pd-accent-glow)",
                    border: "1px solid rgba(14,165,233,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={18} style={{ color: "var(--pd-accent)" }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--pd-text)", marginBottom: "0.5rem" }}>{title}</h3>
                    <p style={{ fontSize: "0.8125rem", color: "var(--pd-text-muted)", lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <span className="slide-number">3 / 8</span>
      </section>

      {/* ═══════════════════════════════════════════════════
          SLIDE 04 · SO FUNKTIONIERT ES
      ═══════════════════════════════════════════════════ */}
      <section className="pd-slide" style={{ background: "var(--pd-bg-alt)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", position: "relative" }}>
          <Reveal>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase" as const, color: "var(--pd-accent)", marginBottom: "1rem" }}>
              03 · So funktioniert es
            </p>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="pd-serif" style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)", lineHeight: 1.1, color: "var(--pd-text)", marginBottom: "4rem" }}>
              In 3 Schritten<br />
              <em>zur strukturierten Analyse.</em>
            </h2>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", position: "relative" }}>
            {/* Connector lines (desktop) */}
            <div className="step-line" style={{ display: "none" }} />
            <div className="step-line step-line-2" style={{ display: "none" }} />

            {[
              {
                n: "01",
                title: "Bescheid hochladen",
                desc: "Fachkraft lädt PDF oder Scan hoch. Automatische Pseudonymisierung schützt alle Klientendaten sofort.",
                delay: 200,
              },
              {
                n: "02",
                title: "KI analysiert",
                desc: "13 spezialisierte Agenten prüfen auf 163+ Fehlertypen, berechnen Fristen und identifizieren Unstimmigkeiten.",
                delay: 350,
              },
              {
                n: "03",
                title: "Vorlage exportieren",
                desc: "Musterschreiben als DIN A4 PDF. Fachkraft prüft und ergänzt — als Basis für Anwalt oder Sozialverband.",
                delay: 500,
              },
            ].map(({ n, title, desc, delay }) => (
              <Reveal key={n} delay={delay}>
                <div style={{ textAlign: "center" as const, padding: "2rem 1.5rem" }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    border: "2px solid var(--pd-accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    background: "rgba(14,165,233,0.06)",
                  }}>
                    <span style={{ fontWeight: 900, fontSize: "1.125rem", color: "var(--pd-accent)" }}>{n}</span>
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--pd-text)", marginBottom: "0.75rem" }}>{title}</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--pd-text-muted)", lineHeight: 1.65 }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Live Pipeline Demo */}
          <Reveal delay={600}>
            <div style={{ marginTop: "3.5rem", borderTop: "1px solid var(--pd-border)", paddingTop: "2.5rem" }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase" as const, color: "var(--pd-text-dim)", marginBottom: "0.75rem", textAlign: "center" as const }}>
                Live: Was im Hintergrund passiert
              </p>
              <PipelineDemo />
            </div>
          </Reveal>

          {/* Bottom KPI bar */}
          <Reveal delay={700}>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem",
              marginTop: "2.5rem",
            }}>
              {[
                { val: "163+", lbl: "Fehlertypen" },
                { val: "16", lbl: "Rechtsgebiete" },
                { val: "< 90s", lbl: "Analysezeit" },
                { val: "100%", lbl: "DSGVO-konform" },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="glass-card" style={{ textAlign: "center" as const, padding: "1.25rem" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--pd-accent)", lineHeight: 1 }}>{val}</p>
                  <p style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--pd-text-dim)", marginTop: "0.375rem" }}>{lbl}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <span className="slide-number">4 / 8</span>
      </section>

      {/* ═══════════════════════════════════════════════════
          SLIDE 05 · ZIELGRUPPE
      ═══════════════════════════════════════════════════ */}
      <section className="pd-slide">
        <div className="gradient-orb" style={{ width: 500, height: 500, bottom: "0%", left: "-10%", background: "var(--pd-gold-soft)", opacity: 0.15 }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", position: "relative" }}>
          <Reveal>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase" as const, color: "var(--pd-accent)", marginBottom: "1rem" }}>
              04 · Zielgruppe
            </p>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="pd-serif" style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)", lineHeight: 1.1, color: "var(--pd-text)", marginBottom: "1rem" }}>
              Gebaut für <em>soziale Einrichtungen.</em>
            </h2>
          </Reveal>

          <Reveal delay={150}>
            <p style={{ fontSize: "1.05rem", color: "var(--pd-text-muted)", maxWidth: 580, lineHeight: 1.7, marginBottom: "3.5rem" }}>
              Überall dort, wo Fachkräfte täglich Bescheide prüfen —
              für Klient:innen, die strukturierte Unterstützung brauchen.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
            {[
              { org: "Caritas", role: "Sozialberatung, Schuldnerberatung, Migrationsberatung", cases: "Jobcenter · Sozialamt · BAMF", delay: 200 },
              { org: "AWO", role: "Allgemeine Sozialberatung, Jugend- und Familienhilfe", cases: "Jugendamt · Jobcenter · Rentenversicherung", delay: 280 },
              { org: "Diakonie", role: "Wohnungslosenberatung, Suchtberatung, Flüchtlingshilfe", cases: "Sozialamt · Jobcenter · Ausländerbehörde", delay: 360 },
              { org: "DRK + Paritätischer", role: "Krankenhaussozialdienst, Pflegeberatung, Seniorenhilfe", cases: "Krankenversicherung · Pflegekasse · MDK", delay: 440 },
            ].map(({ org, role, cases, delay }) => (
              <Reveal key={org} delay={delay}>
                <div className="glass-card" style={{ padding: "2rem", height: "100%" }}>
                  <h3 className="pd-serif" style={{ fontSize: "1.5rem", color: "var(--pd-text)", marginBottom: "0.375rem" }}>{org}</h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--pd-text-muted)", lineHeight: 1.6, marginBottom: "1rem" }}>{role}</p>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "var(--pd-accent)" }}>{cases}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={500}>
            <div style={{
              padding: "2rem", borderRadius: 20,
              background: "linear-gradient(135deg, rgba(14,165,233,0.06) 0%, rgba(212,168,83,0.04) 100%)",
              border: "1px solid var(--pd-border)",
              textAlign: "center" as const,
            }}>
              <p style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--pd-text)" }}>
                Über <span style={{ color: "var(--pd-accent)" }}>1.400</span> Caritas- und AWO-Kreisverbände allein.
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--pd-text-muted)", marginTop: "0.5rem" }}>
                Plus Diakonie, DRK, Paritätischer und hunderte kommunale Beratungsstellen.
              </p>
            </div>
          </Reveal>
        </div>
        <span className="slide-number">5 / 8</span>
      </section>

      {/* ═══════════════════════════════════════════════════
          SLIDE 06 · ROI
      ═══════════════════════════════════════════════════ */}
      <section className="pd-slide" style={{ background: "var(--pd-bg-alt)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <Reveal>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase" as const, color: "var(--pd-accent)", marginBottom: "1rem" }}>
              05 · Preise & Lizenzen
            </p>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="pd-serif" style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)", lineHeight: 1.1, color: "var(--pd-text)", marginBottom: "1rem" }}>
              Team-Lizenzen.<br />
              <em>Transparente Preise.</em>
            </h2>
          </Reveal>

          <Reveal delay={150}>
            <p style={{ fontSize: "1.05rem", color: "var(--pd-text-muted)", maxWidth: 560, lineHeight: 1.7, marginBottom: "3.5rem" }}>
              Monatliche Flatrate — keine versteckten Kosten, transparente Kontingente, monatlich kündbar.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {[
              {
                name: "Starter",
                price: "249",
                users: "1 Nutzer",
                features: ["100 Analysen / Monat", "Schreiben-Generator", "Pseudonymisierung"],
                featured: false,
                delay: 200,
              },
              {
                name: "Team",
                price: "499",
                users: "Bis 3 Nutzer",
                features: ["400 Analysen / Monat", "Fristen-Dashboard", "Prioritäts-Support"],
                featured: true,
                delay: 300,
              },
              {
                name: "Einrichtung",
                price: "899",
                users: "Bis 10 Nutzer",
                features: ["1.000 Analysen / Monat", "Onboarding-Paket", "Persönlicher Ansprechpartner"],
                featured: false,
                delay: 400,
              },
              {
                name: "Rahmenvertrag",
                price: "Individuell",
                users: "Mehrere Standorte",
                features: ["Ab 3.000 Analysen & SLA", "Compliance-Paket", "Dedizierter Betreuer"],
                featured: false,
                delay: 500,
              },
            ].map(({ name, price, users, features, featured, delay }) => (
              <Reveal key={name} delay={delay}>
                <div className={`pricing-card ${featured ? "featured" : ""}`}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: featured ? "var(--pd-accent)" : "var(--pd-text-dim)", marginBottom: "1rem" }}>
                    {featured && "★ "}{name}
                  </p>
                  <p style={{ fontSize: "2.75rem", fontWeight: 900, color: "var(--pd-text)", lineHeight: 1 }}>
                    {price === "Individuell" ? price : `${price} €`}
                  </p>
                  {price !== "Individuell" && (
                    <p style={{ fontSize: "0.7rem", color: "var(--pd-text-dim)", marginTop: "0.25rem" }}>/ Monat netto</p>
                  )}
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--pd-accent)", marginTop: "0.75rem", marginBottom: "1.5rem" }}>{users}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, flexGrow: 1 }}>
                    {features.map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.625rem", fontSize: "0.8rem", color: "var(--pd-text-muted)" }}>
                        <Check size={14} style={{ color: featured ? "var(--pd-accent)" : "var(--pd-text-dim)", flexShrink: 0, marginTop: 2 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <DemoRequestButton
                    className={featured ? "pd-cta pd-cta-primary" : "pd-cta pd-cta-secondary"}
                    tarif={name}
                  >
                    Demo anfragen <ArrowRight size={14} />
                  </DemoRequestButton>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={600}>
            <p style={{ textAlign: "center" as const, fontSize: "0.7rem", color: "var(--pd-text-dim)" }}>
              Alle Preise zzgl. 19% MwSt. · Jahresvertrag auf Anfrage · Pilotprojekte mit Sonderkonditionen
            </p>
          </Reveal>
        </div>
        <span className="slide-number">6 / 8</span>
      </section>

      {/* ═══════════════════════════════════════════════════
          SLIDE 07 · DATENSCHUTZ & WARUM JETZT
      ═══════════════════════════════════════════════════ */}
      <section className="pd-slide">
        <div className="gradient-orb" style={{ width: 400, height: 400, top: "10%", left: "-5%", background: "rgba(34,197,94,0.06)", opacity: 0.3 }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", position: "relative" }}>
          <Reveal>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase" as const, color: "var(--pd-accent)", marginBottom: "1rem" }}>
              06 · Warum jetzt
            </p>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="pd-serif" style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)", lineHeight: 1.1, color: "var(--pd-text)", marginBottom: "1rem" }}>
              Das Zeitfenster <em>ist jetzt.</em>
            </h2>
          </Reveal>

          <Reveal delay={150}>
            <p style={{ fontSize: "1.05rem", color: "var(--pd-text-muted)", maxWidth: 580, lineHeight: 1.7, marginBottom: "3.5rem" }}>
              Vier Entwicklungen treffen zusammen — und schaffen ein einmaliges Momentum.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
            {[
              { icon: TrendingUp, title: "SGB-Reformen 2025/2026", desc: "Neue Regelsätze und Leistungsänderungen: mehr fehlerhafte Bescheide, mehr Widerspruchsbedarf.", delay: 200 },
              { icon: Users, title: "Steigende Fallzahlen", desc: "20–40% mehr Beratungsanfragen seit 2024 — ohne proportionale Personalaufstockung.", delay: 280 },
              { icon: Zap, title: "KI ist produktionsreif", desc: "2025 ist das erste Jahr, in dem KI-Rechtsanalyse vollständig DSGVO-konform umsetzbar ist.", delay: 360 },
              { icon: Shield, title: "First-Mover-Vorteil", desc: "Erste Einrichtungen setzen den Standard — und gewinnen Kapazitäten, die andere noch nicht haben.", delay: 440 },
            ].map(({ icon: Icon, title, desc, delay }) => (
              <Reveal key={title} delay={delay}>
                <div className="glass-card" style={{ padding: "2rem", display: "flex", gap: "1.25rem", alignItems: "flex-start", height: "100%" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "var(--pd-accent-glow)",
                    border: "1px solid rgba(14,165,233,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={18} style={{ color: "var(--pd-accent)" }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--pd-text)", marginBottom: "0.5rem" }}>{title}</h3>
                    <p style={{ fontSize: "0.8125rem", color: "var(--pd-text-muted)", lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* DSGVO Trust Bar */}
          <Reveal delay={550}>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem",
              padding: "2rem", borderRadius: 20,
              background: "linear-gradient(135deg, rgba(34,197,94,0.04) 0%, rgba(14,165,233,0.04) 100%)",
              border: "1px solid var(--pd-border)",
            }}>
              {[
                { label: "DSGVO Art. 25", val: "Privacy by Design" },
                { label: "Hosting", val: "Frankfurt, EU" },
                { label: "Daten-Löschung", val: "Automatisch nach 90 Tagen" },
              ].map(({ label, val }) => (
                <div key={label} style={{ textAlign: "center" as const }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--pd-text-dim)", marginBottom: "0.375rem" }}>{label}</p>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#22c55e" }}>{val}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <span className="slide-number">7 / 8</span>
      </section>

      {/* ═══════════════════════════════════════════════════
          SLIDE 08 · CALL TO ACTION
      ═══════════════════════════════════════════════════ */}
      <section className="pd-slide" style={{ textAlign: "center" as const }}>
        {/* Central glow */}
        <div className="gradient-orb" style={{ width: 800, height: 800, top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "var(--pd-accent-glow)", opacity: 0.2 }} />

        <div style={{ maxWidth: 700, margin: "0 auto", width: "100%", position: "relative" }}>
          <Reveal>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase" as const, color: "var(--pd-accent)", marginBottom: "2rem" }}>
              07 · Nächste Schritte
            </p>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="pd-serif" style={{ fontSize: "clamp(2.75rem, 6vw, 4.5rem)", lineHeight: 1.05, color: "var(--pd-text)", marginBottom: "1.5rem" }}>
              Bereit für eine<br />
              <em style={{ color: "var(--pd-accent)" }}>Demo?</em>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p style={{ fontSize: "1.05rem", color: "var(--pd-text-muted)", maxWidth: 480, margin: "0 auto", lineHeight: 1.7, marginBottom: "3rem" }}>
              Wir zeigen Ihnen in 30 Minuten, wie BescheidRecht konkret in Ihre
              Arbeitsabläufe passt. Kostenlos und unverbindlich.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "1rem", marginBottom: "4rem" }}>
              <DemoRequestButton
                className="pd-cta pd-cta-primary"
              >
                Demo vereinbaren <ArrowRight size={16} />
              </DemoRequestButton>
              <DemoRequestButton
                className="pd-cta pd-cta-secondary"
                tarif="Pilotprojekt"
              >
                Pilotprojekt anfragen
              </DemoRequestButton>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem",
              borderTop: "1px solid var(--pd-border)", paddingTop: "2.5rem", marginBottom: "4rem",
            }}>
              {[
                { val: "< 1 Woche", lbl: "Onboarding" },
                { val: "Pilot", lbl: "Auf Anfrage" },
                { val: "Monatlich", lbl: "Kündbar" },
              ].map(({ val, lbl }) => (
                <div key={lbl}>
                  <p style={{ fontWeight: 900, fontSize: "1.375rem", color: "var(--pd-accent)", lineHeight: 1 }}>{val}</p>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--pd-text-dim)", marginTop: "0.5rem" }}>{lbl}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={500}>
            <div>
              <p className="pd-serif" style={{ fontSize: "1.75rem", color: "var(--pd-text)" }}>
                Bescheid<span style={{ color: "var(--pd-accent)" }}>Recht</span>
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--pd-text-dim)", marginTop: "0.5rem" }}>
                bescheidrecht.de · 2026
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--pd-text-dim)", marginTop: "0.25rem" }}>
                info@bescheidrecht.de
              </p>
            </div>
          </Reveal>
        </div>

        <p style={{ position: "absolute", bottom: "2rem", left: "2.5rem", fontSize: "0.55rem", color: "var(--pd-text-dim)", maxWidth: 360, textAlign: "left" as const }}>
          Technisches Analyse-Werkzeug gem. § 2 Abs. 1 RDG. Kein Ersatz für Rechtsberatung.
        </p>
        <span className="slide-number">8 / 8</span>
      </section>
    </div>
  );
}
