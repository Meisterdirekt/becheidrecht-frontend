"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Printer, ArrowLeft } from "lucide-react";

// ─── Konfiguration (hier vor Druck anpassen) ───────────────────────────────

const ANBIETER = {
  name: "BescheidRecht",
  inhaber: "Hendrik Berkensträter",
  adresse: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Antoniusstraße 47, 49377 Vechta",
  email: "kontakt@bescheidrecht.de",
  web: "bescheidrecht.de",
  steuernummer: "Kleinunternehmer gem. § 19 UStG (keine USt-IdNr.)",
};

const PAKETE = [
  {
    id: "S",
    name: "Paket S — Beratungsstelle",
    beschreibung: "Für einzelne Beratungsstellen und kleine Teams",
    preis: 1490,
    nutzer: "Bis 15 Nutzer-Zugänge",
    analysen: "1.000 Analysen / Monat",
    features: [
      "Alle 16 Rechtsgebiete & 130+ Fehlertypen",
      "Automatische Pseudonymisierung (DSGVO Art. 25)",
      "Musterschreiben-Generator (DIN A4 PDF)",
      "Fristen-Dashboard mit 30-Tage-Überwachung",
      "E-Mail-Support (Reaktionszeit: 48h)",
      "Onboarding-Schulung (60 Min. Remote)",
    ],
    onboarding: 1500,
    highlight: false,
  },
  {
    id: "M",
    name: "Paket M — Kreisverband",
    beschreibung: "Für Kreisverbände und Regionalstellen mit mehreren Teams",
    preis: 3490,
    nutzer: "Bis 50 Nutzer-Zugänge",
    analysen: "5.000 Analysen / Monat",
    features: [
      "Alle Features aus Paket S",
      "Prioritäts-Support (Reaktionszeit: 24h, Mo–Fr 9–17 Uhr)",
      "Monatliche Nutzungsstatistiken & Reporting",
      "Persönlicher Ansprechpartner",
      "SLA: 99,5 % Verfügbarkeit",
      "Onboarding für bis zu 3 Standorte",
    ],
    onboarding: 2500,
    highlight: true,
  },
  {
    id: "L",
    name: "Paket L — Landes-/Diözesanverband",
    beschreibung: "Für Landes- und Diözesanverbände mit mehreren Standorten",
    preis: 7490,
    nutzer: "Bis 200 Nutzer-Zugänge",
    analysen: "Unbegrenzte Analysen",
    features: [
      "Alle Features aus Paket M",
      "Dedizierter Kundenbetreuer (Named Contact)",
      "Compliance-Paket (DSGVO-Verarbeitungsverzeichnis, AV-Vertrag)",
      "Vierteljährliche Business-Reviews",
      "SLA: 99,9 % Verfügbarkeit mit Eskalationspfad",
      "Onboarding für alle Standorte inkl. Train-the-Trainer",
    ],
    onboarding: 4500,
    highlight: false,
  },
];

const KONDITIONEN = [
  { label: "Mindestlaufzeit", wert: "12 Monate" },
  { label: "Kündigungsfrist", wert: "3 Monate zum Vertragsende" },
  { label: "Vertragsverlängerung", wert: "Automatisch um 12 Monate" },
  { label: "Preisanpassung", wert: "Max. 5 % p. a. zum Vertragsjahresbeginn" },
  { label: "Zahlungsziel", wert: "14 Tage netto, monatliche Vorauszahlung" },
  { label: "Jahresrabatt", wert: "10 % bei jährlicher Vorauszahlung" },
  { label: "Angebotsgültigkeit", wert: "30 Tage ab Angebotsdatum" },
  { label: "Alle Preise", wert: "Netto zzgl. 19 % MwSt." },
];

// ─── Seite ─────────────────────────────────────────────────────────────────

export default function AngebotPage() {
  const [kundeOrg, setKundeOrg] = useState("Caritas Diözesanverband [Name]");
  const [kundeAnsprechpartner, setKundeAnsprechpartner] = useState("[Vor- und Nachname]");
  const [kundeEmail, setKundeEmail] = useState("[email@organisation.de]");
  const [angebotsNr, setAngebotsNr] = useState(() => {
    const now = new Date();
    return `BR-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-001`;
  });
  const [datum] = useState(() => {
    return new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
  });
  const [selectedPaket, setSelectedPaket] = useState<string | null>(null);

  const paket = selectedPaket ? PAKETE.find((p) => p.id === selectedPaket) : null;

  return (
    <div className="font-sans bg-white min-h-screen" data-theme="light">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-page { page-break-after: always; min-height: 100vh; }
          .print-page:last-child { page-break-after: avoid; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @media screen {
          .print-page { border-bottom: 2px dashed #e2e8f0; margin-bottom: 3rem; padding-bottom: 3rem; }
        }
      `}</style>

      {/* ── Browser-Nav (kein Druck) ─────────────────────────────── */}
      <nav className="no-print fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <span className="font-black text-slate-900 text-lg">
          Bescheid<span className="text-sky-500">Recht</span>
          <span className="ml-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Angebots-Generator</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/b2b" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-medium">
            <ArrowLeft className="h-3.5 w-3.5" /> B2B-Seite
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-colors"
          >
            <Printer className="h-4 w-4" /> Als PDF drucken
          </button>
        </div>
      </nav>

      {/* ── Konfigurations-Panel (kein Druck) ───────────────────── */}
      <div className="no-print bg-slate-50 border-b border-slate-200 pt-20 pb-6 px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Angebot konfigurieren — erscheint nicht im Druck
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Organisation</label>
              <input
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-sky-400"
                value={kundeOrg}
                onChange={(e) => setKundeOrg(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Ansprechpartner</label>
              <input
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-sky-400"
                value={kundeAnsprechpartner}
                onChange={(e) => setKundeAnsprechpartner(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">E-Mail Kunde</label>
              <input
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-sky-400"
                value={kundeEmail}
                onChange={(e) => setKundeEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Angebots-Nr.</label>
              <input
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-sky-400"
                value={angebotsNr}
                onChange={(e) => setAngebotsNr(e.target.value)}
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2">Paket auswählen (optional — zeigt dann nur dieses Paket)</p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPaket(null)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${!selectedPaket ? "bg-sky-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-sky-300"}`}
              >
                Alle 3 Pakete
              </button>
              {PAKETE.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPaket(p.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${selectedPaket === p.id ? "bg-sky-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-sky-300"}`}
                >
                  Nur Paket {p.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SEITE 1 — ANGEBOTSDECKBLATT
      ══════════════════════════════════════════════════ */}
      <div className="print-page px-12 py-16 max-w-5xl mx-auto pt-24 md:pt-16">

        {/* Farbstreifen oben */}
        <div className="h-1.5 bg-sky-500 rounded-full mb-12" />

        {/* Briefkopf */}
        <div className="flex justify-between items-start mb-16">
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              Bescheid<span className="text-sky-500">Recht</span>
            </p>
            <p className="text-slate-400 text-sm mt-1">{ANBIETER.adresse}</p>
            <p className="text-slate-400 text-sm">{ANBIETER.email} · {ANBIETER.web}</p>
            <p className="text-slate-400 text-sm">USt-IdNr.: {ANBIETER.steuernummer}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Angebot</p>
            <p className="text-2xl font-black text-slate-900">{angebotsNr}</p>
            <p className="text-slate-400 text-sm mt-1">{datum}</p>
          </div>
        </div>

        {/* Empfänger */}
        <div className="grid grid-cols-2 gap-12 mb-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Angebot für</p>
            <p className="font-black text-slate-900 text-lg">{kundeOrg}</p>
            <p className="text-slate-600 text-sm mt-1">z. Hd. {kundeAnsprechpartner}</p>
            <p className="text-slate-600 text-sm">{kundeEmail}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Anbieter</p>
            <p className="font-black text-slate-900 text-lg">BescheidRecht</p>
            <p className="text-slate-600 text-sm mt-1">{ANBIETER.inhaber}</p>
            <p className="text-slate-600 text-sm">{ANBIETER.adresse}</p>
            <p className="text-slate-600 text-sm">{ANBIETER.email}</p>
          </div>
        </div>

        {/* Betreff */}
        <div className="mb-12">
          <p className="text-xl font-black text-slate-900 mb-4">
            Angebot: Rahmenvertrag KI-Bescheidanalyse für soziale Einrichtungen
          </p>
          <p className="text-slate-600 leading-relaxed text-sm max-w-3xl">
            vielen Dank für Ihr Interesse an BescheidRecht. Im Folgenden unterbreiten wir Ihnen unser
            individuelles Angebot für einen Rahmenvertrag zur technischen Bescheidanalyse und automatischen
            Musterschreiben-Erstellung. Unser System wurde speziell für den Einsatz in sozialen
            Einrichtungen entwickelt und ist vollständig DSGVO-konform nach Art. 25 (Privacy by Design).
          </p>
        </div>

        {/* Was ist BescheidRecht */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { val: "130+", lbl: "Fehlertypen" },
            { val: "16", lbl: "Rechtsgebiete" },
            { val: "< 60 Sek.", lbl: "Analysezeit" },
            { val: "DSGVO", lbl: "Art. 25 konform" },
          ].map(({ val, lbl }) => (
            <div key={lbl} className="text-center p-5 rounded-2xl bg-sky-50 border border-sky-100">
              <p className="text-2xl font-black text-sky-500 leading-none mb-1">{val}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{lbl}</p>
            </div>
          ))}
        </div>

        {/* Kurzbeschreibung Leistung */}
        <div className="bg-slate-50 rounded-2xl p-8 mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Kernleistung</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "Bescheid hochladen",
                desc: "PDF oder Scan — OCR erkennt den Text automatisch. Alle personenbezogenen Daten werden sofort pseudonymisiert, bevor sie die KI verarbeitet.",
              },
              {
                title: "KI-Analyse in < 60 Sek.",
                desc: "13 spezialisierte KI-Agenten prüfen auf 130+ dokumentierte Fehlertypen in 16 Rechtsgebieten. Mit Angabe der konkreten Rechtsgrundlage.",
              },
              {
                title: "Vorlage exportieren",
                desc: "Musterschreiben-Vorlage als DIN A4 PDF. Fachkraft prüft und ergänzt — als Basis für das Gespräch mit Anwalt oder Sozialverband.",
              },
            ].map(({ title, desc }) => (
              <div key={title}>
                <p className="font-black text-slate-900 text-sm mb-2">{title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Konditionen */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Allgemeine Vertragsbedingungen</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {KONDITIONEN.map(({ label, wert }) => (
              <div key={label} className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-bold text-slate-900 text-right ml-4">{wert}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Seitennummer */}
        <div className="mt-16 flex justify-between items-end">
          <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">BescheidRecht · {angebotsNr}</p>
          <p className="text-xs text-slate-300 font-bold">1</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SEITE 2 — PAKETE & PREISE
      ══════════════════════════════════════════════════ */}
      <div className="print-page px-12 py-16 max-w-5xl mx-auto">

        <div className="h-1.5 bg-sky-500 rounded-full mb-12" />

        <p className="text-xs font-bold uppercase tracking-widest text-sky-500 mb-3">Leistungspakete & Preise</p>
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
          {paket ? paket.name : "Wählen Sie Ihr Paket"}
        </h2>
        <p className="text-slate-500 text-sm mb-10 max-w-2xl">
          {paket
            ? paket.beschreibung
            : "Alle Preise netto zzgl. 19 % MwSt. · Jahresrabatt 10 % bei jährlicher Vorauszahlung"}
        </p>

        {/* Pakete */}
        <div className={`grid gap-5 mb-12 ${paket ? "grid-cols-1 max-w-xl" : "grid-cols-1 md:grid-cols-3"}`}>
          {(paket ? [paket] : PAKETE).map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border p-7 flex flex-col ${
                p.highlight && !paket
                  ? "bg-sky-500 border-sky-500 shadow-xl shadow-sky-100"
                  : "bg-white border-slate-200"
              }`}
            >
              {p.highlight && !paket && (
                <span className="text-sky-100 text-[10px] font-bold uppercase tracking-widest mb-2">★ Empfohlen</span>
              )}
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${p.highlight && !paket ? "text-sky-100" : "text-slate-400"}`}>
                {p.id}
              </p>
              <p className={`text-xl font-black mb-1 ${p.highlight && !paket ? "text-white" : "text-slate-900"}`}>{p.name}</p>
              <p className={`text-xs mb-5 ${p.highlight && !paket ? "text-sky-100" : "text-slate-500"}`}>{p.beschreibung}</p>

              <div className="mb-2">
                <span className={`text-4xl font-black leading-none ${p.highlight && !paket ? "text-white" : "text-slate-900"}`}>
                  {p.preis.toLocaleString("de-DE")} €
                </span>
                <span className={`text-sm ml-1 ${p.highlight && !paket ? "text-sky-100" : "text-slate-400"}`}> / Monat</span>
              </div>
              <p className={`text-xs font-bold mb-1 ${p.highlight && !paket ? "text-sky-100" : "text-sky-500"}`}>{p.nutzer}</p>
              <p className={`text-xs mb-6 ${p.highlight && !paket ? "text-sky-100" : "text-slate-500"}`}>{p.analysen}</p>

              <ul className="space-y-2.5 flex-grow mb-6">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-xs leading-snug ${p.highlight && !paket ? "text-white" : "text-slate-600"}`}>
                    <Check className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${p.highlight && !paket ? "text-sky-100" : "text-sky-500"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className={`pt-4 border-t ${p.highlight && !paket ? "border-sky-400" : "border-slate-100"}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${p.highlight && !paket ? "text-sky-100" : "text-slate-400"}`}>Einmaliges Onboarding</span>
                  <span className={`text-sm font-black ${p.highlight && !paket ? "text-white" : "text-slate-900"}`}>
                    {p.onboarding.toLocaleString("de-DE")} €
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Preisübersicht Tabelle */}
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Preisübersicht auf einen Blick</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Paket</th>
                <th className="text-left py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Nutzer</th>
                <th className="text-left py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Analysen</th>
                <th className="text-right py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Monatlich</th>
                <th className="text-right py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Jährlich (−10 %)</th>
                <th className="text-right py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Onboarding</th>
              </tr>
            </thead>
            <tbody>
              {PAKETE.map((p, i) => (
                <tr key={p.id} className={`border-b border-slate-100 ${i % 2 === 0 ? "" : "bg-slate-50"} ${paket && paket.id !== p.id ? "opacity-30" : ""}`}>
                  <td className="py-3 font-bold text-slate-900">{p.name}</td>
                  <td className="py-3 text-slate-600">{p.nutzer}</td>
                  <td className="py-3 text-slate-600">{p.analysen}</td>
                  <td className="py-3 text-right font-bold text-slate-900">{p.preis.toLocaleString("de-DE")} €</td>
                  <td className="py-3 text-right font-bold text-sky-600">
                    {(p.preis * 12 * 0.9).toLocaleString("de-DE", { maximumFractionDigits: 0 })} €
                  </td>
                  <td className="py-3 text-right text-slate-600">{p.onboarding.toLocaleString("de-DE")} €</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-slate-400 mt-3">Alle Preise netto zzgl. 19 % MwSt. · Jährlicher Rabatt gilt bei Vorauszahlung des Jahresbetrags.</p>
        </div>

        {/* Beispielrechnung */}
        {paket && (
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-8 mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-500 mb-4">Investitionsübersicht — {paket.name}</p>
            <div className="space-y-2">
              {[
                { label: "Monatliche Lizenzgebühr", wert: `${paket.preis.toLocaleString("de-DE")} € netto` },
                { label: "Jahresbetrag (12 Monate)", wert: `${(paket.preis * 12).toLocaleString("de-DE")} € netto` },
                { label: "Jahresbetrag mit 10 % Rabatt (Vorauszahlung)", wert: `${(paket.preis * 12 * 0.9).toLocaleString("de-DE", { maximumFractionDigits: 0 })} € netto`, highlight: true },
                { label: "Einmaliges Onboarding (einmalig, im ersten Monat)", wert: `${paket.onboarding.toLocaleString("de-DE")} € netto` },
                { label: "Gesamtinvestition Jahr 1 (Vorauszahlung + Onboarding)", wert: `${((paket.preis * 12 * 0.9) + paket.onboarding).toLocaleString("de-DE", { maximumFractionDigits: 0 })} € netto`, highlight: true },
              ].map(({ label, wert, highlight }) => (
                <div key={label} className={`flex justify-between py-2 ${highlight ? "border-t border-sky-200 mt-2 pt-4" : ""}`}>
                  <span className={`text-sm ${highlight ? "font-black text-slate-900" : "text-slate-600"}`}>{label}</span>
                  <span className={`text-sm ${highlight ? "font-black text-sky-600" : "font-bold text-slate-900"}`}>{wert}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROI Hinweis */}
        <div className="bg-slate-50 rounded-2xl p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">ROI-Orientierung</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Eine Fachkraft benötigt durchschnittlich 20–30 Minuten für die manuelle Prüfung eines Bescheids.
            Mit BescheidRecht reduziert sich dieser Aufwand auf unter 2 Minuten. Bei 5 Bescheiden täglich
            pro Berater:in entspricht das einer Zeitersparnis von ca. <strong className="text-slate-900">2–3 Stunden pro Tag</strong> — weit mehr,
            als die Lizenzkosten ausmachen.
          </p>
        </div>

        <div className="mt-16 flex justify-between items-end">
          <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">BescheidRecht · {angebotsNr}</p>
          <p className="text-xs text-slate-300 font-bold">2</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SEITE 3 — NÄCHSTE SCHRITTE & UNTERSCHRIFT
      ══════════════════════════════════════════════════ */}
      <div className="print-page px-12 py-16 max-w-5xl mx-auto">

        <div className="h-1.5 bg-sky-500 rounded-full mb-12" />

        <p className="text-xs font-bold uppercase tracking-widest text-sky-500 mb-3">Nächste Schritte</p>
        <h2 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">
          So starten wir gemeinsam.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-14">
          {[
            {
              n: "01",
              title: "Angebot annehmen",
              desc: "Dieses Angebot unterzeichnen und zurücksenden — per E-Mail als PDF oder postalisch.",
              time: "Heute",
            },
            {
              n: "02",
              title: "Vertrag & Rechnungsstellung",
              desc: "Rahmenvertrag und AV-Vertrag (DSGVO) werden innerhalb von 3 Werktagen zugestellt.",
              time: "Innerhalb 3 Tage",
            },
            {
              n: "03",
              title: "Zugänge einrichten",
              desc: "Alle Nutzer-Zugänge werden innerhalb von 24h nach Vertragsunterzeichnung aktiviert.",
              time: "24 Stunden",
            },
            {
              n: "04",
              title: "Onboarding-Schulung",
              desc: "Terminabstimmung für die Remote-Schulung mit Ihren Berater:innen nach Ihrem Zeitplan.",
              time: "Flexibel",
            },
          ].map(({ n, title, desc, time }) => (
            <div key={n} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-sky-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                  {n}
                </span>
                <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">{time}</span>
              </div>
              <p className="font-black text-slate-900 text-sm mb-2">{title}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Rechtlicher Hinweis */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">Rechtlicher Hinweis</p>
          <p className="text-xs text-slate-600 leading-relaxed">
            BescheidRecht ist ein professionelles Analyse- und Schreibwerkzeug gemäß § 2 Abs. 1 RDG
            (Rechtsdienstleistungsgesetz) und kein Ersatz für rechtliche Beratung im Sinne von § 3 RDG.
            Das System unterstützt Ihre Fachkräfte bei der Prüfung und Dokumentation. Die fachliche
            Einschätzung und Verantwortung verbleiben bei Ihren Mitarbeitenden. Alle KI-Ausgaben enthalten
            einen entsprechenden Disclaimer.
          </p>
        </div>

        {/* Unterschriftsfeld */}
        <div className="grid grid-cols-2 gap-12 mb-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Auftraggeber</p>
            <div className="border-b-2 border-slate-300 mb-2 h-12" />
            <p className="text-xs text-slate-400">{kundeOrg}</p>
            <p className="text-xs text-slate-400 mt-1">{kundeAnsprechpartner}</p>
            <p className="text-xs text-slate-400 mt-4">Ort, Datum</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Auftragnehmer</p>
            <div className="border-b-2 border-slate-300 mb-2 h-12" />
            <p className="text-xs text-slate-400">BescheidRecht</p>
            <p className="text-xs text-slate-400 mt-1">Hendrik Berkensträter</p>
            <p className="text-xs text-slate-400 mt-4">Ort, Datum</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-8 flex justify-between items-center">
          <div>
            <p className="text-sm font-black text-slate-900">
              Bescheid<span className="text-sky-500">Recht</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{ANBIETER.email} · {ANBIETER.web}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Angebots-Nr. {angebotsNr}</p>
            <p className="text-xs text-slate-400 mt-0.5">Gültig bis: 30 Tage ab {datum}</p>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-end">
          <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">BescheidRecht · {angebotsNr}</p>
          <p className="text-xs text-slate-300 font-bold">3</p>
        </div>
      </div>
    </div>
  );
}
