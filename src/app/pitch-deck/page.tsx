"use client";

import React from "react";
import Link from "next/link";
import { Check, ArrowRight, Shield, Zap, FileText, Clock, Users, TrendingUp } from "lucide-react";

// Pitch Deck — alle Slides auf hellem Hintergrund (print- & präsentationssicher)
export default function PitchDeckPage() {
  return (
    <div className="font-sans bg-white" data-theme="light">
      <style>{`
        @media print {
          .slide { page-break-after: always; min-height: 100vh; }
          .slide:last-child { page-break-after: avoid; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
        }
        .slide {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 5rem 2rem;
        }
      `}</style>

      {/* NAV — nur im Browser */}
      <nav className="no-print fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <span className="font-black text-slate-900 text-lg">
          Bescheid<span className="text-sky-500">Recht</span>
          <span className="ml-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Pitch Deck</span>
        </span>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">
            Zur Hauptseite
          </Link>
          <Link
            href="/register"
            className="text-sm font-bold px-4 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-colors"
          >
            Demo buchen
          </Link>
        </div>
      </nav>

      {/* ─────────────────────────────────────────
          SLIDE 01 · COVER
      ───────────────────────────────────────── */}
      <section className="slide pt-24 relative overflow-hidden bg-white">
        {/* Dezenter Sky-Gradient oben */}
        <div
          className="absolute top-0 left-0 right-0 h-2 bg-sky-500"
          style={{ background: "linear-gradient(90deg, #0ea5e9 0%, #38bdf8 50%, #0ea5e9 100%)" }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(14,165,233,0.06) 0%, transparent 100%)" }}
        />
        <div className="max-w-5xl mx-auto w-full relative">
          <p className="text-sky-500 text-xs font-bold uppercase tracking-[0.4em] mb-8">
            Partner-Präsentation · Vertraulich · 2026
          </p>
          <h1 className="text-7xl md:text-8xl font-black text-slate-900 tracking-tight leading-none mb-4">
            Bescheid<span className="text-sky-500">Recht</span>
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-slate-700 mb-6 leading-snug max-w-2xl">
            KI-gestützte Bescheid-Analyse<br />
            für soziale Einrichtungen.
          </p>
          <p className="text-slate-500 text-lg max-w-xl leading-relaxed mb-14">
            Wie Caritas, AWO und Diakonie täglich Stunden sparen —
            und mehr Klientinnen und Klienten zu ihrem Recht verhelfen.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-14">
            {["Caritas", "AWO", "Diakonie", "DRK", "Paritätischer"].map((o) => (
              <span
                key={o}
                className="px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-sm font-bold"
              >
                {o}
              </span>
            ))}
          </div>
          {/* Kennzahlen-Leiste */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 pt-10">
            {[
              { val: "130+", lbl: "Fehlertypen" },
              { val: "16", lbl: "Rechtsgebiete" },
              { val: "< 60s", lbl: "Analysezeit" },
              { val: "DSGVO", lbl: "Art. 25" },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="text-center">
                <p className="text-4xl font-black text-sky-500 leading-none mb-1">{val}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="absolute bottom-6 right-8 text-slate-300 text-xs font-bold uppercase tracking-widest">
          1 / 8
        </p>
      </section>

      {/* ─────────────────────────────────────────
          SLIDE 02 · DAS PROBLEM
      ───────────────────────────────────────── */}
      <section className="slide bg-slate-50">
        <div className="max-w-5xl mx-auto w-full">
          <p className="text-sky-500 text-xs font-bold uppercase tracking-[0.35em] mb-3">01 · Das Problem</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
            Jeder fehlerhafte Bescheid<br />kostet Ihre Klienten bares Geld.
          </h2>
          <p className="text-slate-500 text-lg mb-12 max-w-2xl leading-relaxed">
            Soziale Einrichtungen kämpfen täglich mit demselben Problem: zu viele Fälle,
            zu wenig Zeit, keine KI-Werkzeuge.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                stat: "42%",
                label: "Erfolgreiche Widersprüche",
                desc: "Der Widersprüche gegen Jobcenter-Bescheide sind erfolgreich — die Fehler sind vorhanden, sie werden nur nicht systematisch gefunden.",
                color: "red",
              },
              {
                stat: "3–8h",
                label: "Pro komplexem Fall",
                desc: "Verbringt eine Fachkraft im Durchschnitt mit manueller Recherche, Paragraph-Suche und Briefentwurf — Zeit, die für mehr Klienten fehlt.",
                color: "amber",
              },
              {
                stat: "30 Tage",
                label: "Widerspruchsfrist",
                desc: "Laufen ohne KI-Fristüberwachung ungenutzt ab. Eine verpasste Frist bedeutet: kein Widerspruch mehr möglich.",
                color: "red",
              },
            ].map(({ stat, label, desc, color }) => (
              <div
                key={stat}
                className={`p-8 rounded-2xl border ${
                  color === "red"
                    ? "bg-red-50 border-red-100"
                    : "bg-amber-50 border-amber-100"
                }`}
              >
                <p
                  className={`text-5xl font-black leading-none mb-2 ${
                    color === "red" ? "text-red-500" : "text-amber-500"
                  }`}
                >
                  {stat}
                </p>
                <p className="font-black text-slate-900 text-sm uppercase tracking-wider mb-3">{label}</p>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <p className="text-slate-800 text-lg font-bold leading-snug">
              &ldquo;Unsere Berater:innen wissen oft, dass etwas nicht stimmt —
              aber sie haben nicht die Zeit, es systematisch zu prüfen.&rdquo;
            </p>
            <p className="text-slate-400 text-sm mt-2 font-medium">Typisches Feedback aus Sozialberatungen</p>
          </div>
        </div>
        <p className="absolute bottom-6 right-8 text-slate-300 text-xs font-bold uppercase tracking-widest">2 / 8</p>
      </section>

      {/* ─────────────────────────────────────────
          SLIDE 03 · DIE LÖSUNG
      ───────────────────────────────────────── */}
      <section className="slide bg-white relative">
        <div className="max-w-5xl mx-auto w-full">
          <p className="text-sky-500 text-xs font-bold uppercase tracking-[0.35em] mb-3">02 · Die Lösung</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
            BescheidRecht: Ihr KI-Assistent<br />für die Bescheid-Analyse.
          </h2>
          <p className="text-slate-500 text-lg mb-12 max-w-2xl leading-relaxed">
            Fachkraft lädt den Bescheid hoch — BescheidRecht übernimmt die Analyse,
            findet die Fehler und generiert den Widerspruch. In unter 60 Sekunden.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: Zap,
                title: "13 KI-Agenten in Parallel",
                desc: "Spezialisierte Agenten prüfen gleichzeitig auf Fristen, Rechtsbasis, Formfehler und Begründungsmängel.",
              },
              {
                icon: FileText,
                title: "130+ geprüfte Fehlertypen",
                desc: "Abdeckung über 16 Rechtsgebiete: SGB II bis XII, BAMF, BAföG, Wohngeld und mehr.",
              },
              {
                icon: Shield,
                title: "DSGVO by Design",
                desc: "Vollautomatische Pseudonymisierung aller Klientendaten vor jeder KI-Analyse. Art. 25 DSGVO erfüllt.",
              },
              {
                icon: Clock,
                title: "< 60 Sekunden",
                desc: "Von Hochladen bis Analyse-Ergebnis mit fertigem Widerspruchs-Entwurf als DIN A4 PDF.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-7 rounded-2xl bg-slate-50 border border-slate-200 flex gap-5 items-start">
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="absolute bottom-6 right-8 text-slate-300 text-xs font-bold uppercase tracking-widest">3 / 8</p>
      </section>

      {/* ─────────────────────────────────────────
          SLIDE 04 · SO FUNKTIONIERT ES
      ───────────────────────────────────────── */}
      <section className="slide bg-sky-500 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(255,255,255,0.07) 0%, transparent 70%)" }}
        />
        <div className="max-w-5xl mx-auto w-full relative">
          <p className="text-sky-100 text-xs font-bold uppercase tracking-[0.35em] mb-3">03 · So funktioniert es</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-14 leading-tight">
            In 3 Schritten<br />zum Widerspruch.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                n: "01",
                title: "Bescheid hochladen",
                desc: "Fachkraft lädt PDF oder Scan hoch. Automatische Pseudonymisierung schützt alle Klientendaten sofort — kein manueller Aufwand.",
              },
              {
                n: "02",
                title: "KI analysiert",
                desc: "13 spezialisierte KI-Agenten prüfen auf 130+ Fehlertypen, berechnen Fristen und identifizieren Rechtsbasis — in unter 60 Sekunden.",
              },
              {
                n: "03",
                title: "Schreiben exportieren",
                desc: "Direkt verwendbarer Widerspruch als DIN A4 PDF. Fachkraft prüft, unterschreibt — und der Klient bekommt sein Recht.",
              },
            ].map(({ n, title, desc }) => (
              <div key={n} className="p-8 rounded-2xl bg-white/15 border border-white/20">
                <div className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center mb-6">
                  <span className="text-white font-black text-sm">{n}</span>
                </div>
                <h3 className="font-black text-white text-lg mb-3">{title}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { val: "130+", lbl: "Fehlertypen" },
              { val: "16", lbl: "Rechtsgebiete" },
              { val: "< 60s", lbl: "Analysezeit" },
              { val: "100%", lbl: "DSGVO-konform" },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="text-center p-5 rounded-2xl bg-white/10 border border-white/20">
                <p className="text-3xl font-black text-white mb-1 leading-none">{val}</p>
                <p className="text-[11px] text-white/70 font-bold uppercase tracking-wider">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="absolute bottom-6 right-8 text-white/30 text-xs font-bold uppercase tracking-widest">4 / 8</p>
      </section>

      {/* ─────────────────────────────────────────
          SLIDE 05 · ZIELGRUPPE
      ───────────────────────────────────────── */}
      <section className="slide bg-white relative">
        <div className="max-w-5xl mx-auto w-full">
          <p className="text-sky-500 text-xs font-bold uppercase tracking-[0.35em] mb-3">04 · Zielgruppe</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
            Gebaut für soziale Einrichtungen.
          </h2>
          <p className="text-slate-500 text-lg mb-12 max-w-2xl leading-relaxed">
            Überall dort, wo Fachkräfte täglich Bescheide prüfen —
            für Klienten, die sich nicht selbst wehren können.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {[
              {
                org: "Caritas",
                role: "Sozialberatung, Schuldnerberatung, Migrationsberatung",
                cases: "Jobcenter · Sozialamt · BAMF",
              },
              {
                org: "AWO",
                role: "Allgemeine Sozialberatung, Jugend- und Familienhilfe",
                cases: "Jugendamt · Jobcenter · Rentenversicherung",
              },
              {
                org: "Diakonie",
                role: "Wohnungslosenberatung, Suchtberatung, Flüchtlingshilfe",
                cases: "Sozialamt · Jobcenter · Ausländerbehörde",
              },
              {
                org: "DRK + Paritätischer",
                role: "Krankenhaussozialdienst, Pflegeberatung, Seniorenhilfe",
                cases: "Krankenversicherung · Pflegekasse · MDK",
              },
            ].map(({ org, role, cases }) => (
              <div key={org} className="p-7 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-black text-slate-900 text-xl mb-1">{org}</h3>
                <p className="text-slate-600 text-sm mb-3 leading-relaxed">{role}</p>
                <p className="text-xs font-bold text-sky-500 uppercase tracking-wider">{cases}</p>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-2xl bg-sky-50 border border-sky-100 text-center">
            <p className="font-black text-slate-900 text-xl">
              In Deutschland gibt es über{" "}
              <span className="text-sky-500">1.400 Caritas- und AWO-Kreisverbände</span> allein.
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Dazu kommen Diakonie, DRK, Paritätischer und hunderte kommunale Beratungsstellen.
            </p>
          </div>
        </div>
        <p className="absolute bottom-6 right-8 text-slate-300 text-xs font-bold uppercase tracking-widest">5 / 8</p>
      </section>

      {/* ─────────────────────────────────────────
          SLIDE 06 · PREISE
      ───────────────────────────────────────── */}
      <section className="slide bg-slate-50 relative">
        <div className="max-w-5xl mx-auto w-full">
          <p className="text-sky-500 text-xs font-bold uppercase tracking-[0.35em] mb-3">05 · Preise & Lizenzen</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
            Team-Lizenzen.<br />Transparente Preise.
          </h2>
          <p className="text-slate-500 text-lg mb-12 max-w-2xl leading-relaxed">
            Monatliche Flatrate — keine versteckten Kosten, unbegrenzte Analysen,
            monatlich kündbar.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                name: "Starter",
                price: "199 €",
                users: "1 Nutzer-Zugang",
                features: ["50 Analysen / Monat", "Schreiben-Generator", "Automatische Pseudonymisierung"],
                highlight: false,
              },
              {
                name: "Team",
                price: "399 €",
                users: "Bis 3 Nutzer-Zugänge",
                features: ["Alles aus Starter", "Fristen-Dashboard", "Prioritäts-Support & Onboarding"],
                highlight: true,
              },
              {
                name: "Einrichtung",
                price: "699 €",
                users: "Bis 10 Nutzer-Zugänge",
                features: ["Unbegrenzte Analysen", "Prioritäts-Support & Onboarding", "Persönlicher Ansprechpartner"],
                highlight: false,
              },
              {
                name: "Rahmen­vertrag",
                price: "Anfrage",
                users: "Mehrere Standorte",
                features: ["Mehrere Verbände & SLA", "Compliance-Paket", "Dedizierter Betreuer"],
                highlight: false,
              },
            ].map(({ name, price, users, features, highlight }) => (
              <div
                key={name}
                className={`p-6 rounded-2xl border flex flex-col ${
                  highlight
                    ? "bg-sky-500 border-sky-500 shadow-xl shadow-sky-200"
                    : "bg-white border-slate-200"
                }`}
              >
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${highlight ? "text-sky-100" : "text-slate-400"}`}>
                  {highlight && <span className="mr-1">★</span>}{name}
                </p>
                <p className={`text-4xl font-black mb-1 leading-none ${highlight ? "text-white" : "text-slate-900"}`}>
                  {price}
                </p>
                {price !== "Anfrage" && (
                  <p className={`text-xs mb-1 ${highlight ? "text-sky-100" : "text-slate-400"}`}>/ Monat</p>
                )}
                <p className={`text-xs font-bold mb-5 mt-1 ${highlight ? "text-sky-100" : "text-sky-500"}`}>{users}</p>
                <ul className="space-y-2 flex-grow mb-6">
                  {features.map((f) => (
                    <li key={f} className={`text-xs flex items-start gap-2 leading-snug ${highlight ? "text-white" : "text-slate-600"}`}>
                      <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`text-xs font-bold py-2.5 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
                    highlight
                      ? "bg-white text-sky-500 hover:bg-sky-50"
                      : "bg-sky-500 text-white hover:bg-sky-400"
                  }`}
                >
                  Demo starten <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-400 text-xs font-medium">
            Alle Preise zzgl. MwSt. · Jahresvertrag auf Anfrage · Monatlich kündbar · Pilotprojekte mit Sonderkonditionen möglich
          </p>
        </div>
        <p className="absolute bottom-6 right-8 text-slate-300 text-xs font-bold uppercase tracking-widest">6 / 8</p>
      </section>

      {/* ─────────────────────────────────────────
          SLIDE 07 · WARUM JETZT
      ───────────────────────────────────────── */}
      <section className="slide bg-white relative">
        <div className="max-w-5xl mx-auto w-full">
          <p className="text-sky-500 text-xs font-bold uppercase tracking-[0.35em] mb-3">06 · Warum jetzt</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
            Das Zeitfenster ist jetzt.
          </h2>
          <p className="text-slate-500 text-lg mb-12 max-w-2xl leading-relaxed">
            Vier Entwicklungen treffen gerade zusammen — und schaffen ein einmaliges Momentum.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
            {[
              {
                icon: TrendingUp,
                title: "SGB-Reformen 2025/2026",
                desc: "Neue Regelsätze und Leistungsänderungen bedeuten: mehr fehlerhafte Bescheide, mehr Widerspruchsbedarf — mehr Arbeit für Ihre Fachkräfte.",
              },
              {
                icon: Users,
                title: "Steigende Fallzahlen",
                desc: "Einrichtungen berichten von 20–40 % mehr Beratungsanfragen seit 2024 — ohne proportionale Personalaufstockung.",
              },
              {
                icon: Zap,
                title: "KI ist produktionsreif",
                desc: "2025 ist das erste Jahr, in dem KI-gestützte Rechtsanalyse vollständig DSGVO-konform und praxistauglich umsetzbar ist.",
              },
              {
                icon: Shield,
                title: "First Mover Vorteil",
                desc: "Erste Einrichtungen, die einführen, setzen den Standard — und gewinnen Kapazitäten zurück, die Mitbewerber noch nicht haben.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-7 rounded-2xl bg-slate-50 border border-slate-200 flex gap-5 items-start">
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 rounded-2xl bg-sky-500 text-center">
            <p className="font-black text-white text-2xl leading-snug">
              Einrichtungen, die jetzt starten, sparen ab Tag 1 Fachkraft-Kapazitäten.
            </p>
            <p className="text-sky-100 text-sm mt-2">
              Pilotprojekte mit bevorzugten Konditionen für frühe Partner
            </p>
          </div>
        </div>
        <p className="absolute bottom-6 right-8 text-slate-300 text-xs font-bold uppercase tracking-widest">7 / 8</p>
      </section>

      {/* ─────────────────────────────────────────
          SLIDE 08 · CALL TO ACTION
      ───────────────────────────────────────── */}
      <section className="slide bg-slate-50 items-center text-center relative">
        <div
          className="absolute top-0 left-0 right-0 h-1 bg-sky-500"
        />
        <div className="max-w-3xl mx-auto w-full relative">
          <p className="text-sky-500 text-xs font-bold uppercase tracking-[0.35em] mb-6">07 · Nächste Schritte</p>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
            Bereit für eine<br />
            <span className="text-sky-500">Demo?</span>
          </h2>
          <p className="text-slate-600 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
            Wir zeigen Ihnen in 30 Minuten, wie BescheidRecht konkret in Ihre
            Arbeitsabläufe passt. Kostenlos, unverbindlich, auf Ihre Einrichtung zugeschnitten.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-sky-500 text-white font-bold text-sm tracking-wide hover:bg-sky-400 shadow-lg shadow-sky-200 transition-all"
            >
              Demo vereinbaren <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/feedback"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm tracking-wide hover:border-sky-300 hover:text-sky-500 transition-all"
            >
              Pilotprojekt anfragen
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-6 border-t border-slate-200 pt-10 mb-16">
            {[
              { val: "< 1 Woche", lbl: "Onboarding" },
              { val: "Pilot", lbl: "Auf Anfrage" },
              { val: "Monatlich", lbl: "Kündbar" },
            ].map(({ val, lbl }) => (
              <div key={lbl}>
                <p className="font-black text-sky-500 text-2xl leading-none mb-1">{val}</p>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">{lbl}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              Bescheid<span className="text-sky-500">Recht</span>
            </p>
            <p className="text-slate-400 text-sm mt-1">bescheidrecht.de · 2026</p>
          </div>
        </div>
        <p className="absolute bottom-6 right-8 text-slate-300 text-xs font-bold uppercase tracking-widest">8 / 8</p>
      </section>
    </div>
  );
}
