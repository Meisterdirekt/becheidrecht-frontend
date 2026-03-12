"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";

const ANBIETER = {
  name: "BescheidRecht",
  inhaber: "Hendrik Berkensträter",
  adresse: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Antoniusstraße 47, 49377 Vechta",
  email: "kontakt@bescheidrecht.de",
  web: "bescheidrecht.de",
};

const PAKETE: Record<string, { nutzer: string; analysen: string; sla: string; support: string; onboarding: string }> = {
  S: { nutzer: "15", analysen: "1.000 / Monat", sla: "99,5 %", support: "E-Mail (48h)", onboarding: "1 Standort (60 Min. Remote)" },
  M: { nutzer: "50", analysen: "5.000 / Monat", sla: "99,5 %", support: "Priorität (24h, Mo–Fr 9–17)", onboarding: "Bis 3 Standorte" },
  L: { nutzer: "200", analysen: "10.000 / Monat", sla: "99,9 %", support: "Dedizierter Ansprechpartner", onboarding: "Alle Standorte + Train-the-Trainer" },
};

export default function Anlage1Page() {
  const [paket, setPaket] = useState<"S" | "M" | "L">("M");
  const [vertragNr, setVertragNr] = useState(() => {
    const now = new Date();
    return `BR-RV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-001`;
  });
  const [datum] = useState(() =>
    new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })
  );

  const p = PAKETE[paket];

  return (
    <div className="font-sans bg-white min-h-screen text-slate-900" data-theme="light">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .pagebreak { page-break-before: always; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-size: 11pt; }
          .anlage { max-width: 100%; padding: 2.5cm 2.5cm; }
        }
        @media screen {
          .pagebreak { border-top: 2px dashed #e2e8f0; margin-top: 3rem; padding-top: 3rem; }
        }
        .anlage p, .anlage li { line-height: 1.7; }
        .paragraf { margin-bottom: 2rem; }
        .paragraf h3 { font-size: 0.95rem; font-weight: 800; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.4rem; }
      `}</style>

      {/* Nav */}
      <nav className="no-print fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <span className="font-black text-slate-900 text-lg">
          Bescheid<span className="text-sky-500">Recht</span>
          <span className="ml-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Anlage 1</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/rahmenvertrag" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-medium">
            <ArrowLeft className="h-3.5 w-3.5" /> Rahmenvertrag
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-colors"
          >
            <Printer className="h-4 w-4" /> Als PDF drucken
          </button>
        </div>
      </nav>

      {/* Konfig */}
      <div className="no-print bg-slate-50 border-b border-slate-200 pt-20 pb-6 px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Anlage konfigurieren — erscheint nicht im Druck
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Vertrags-Nr. (aus Rahmenvertrag)</label>
              <input className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-sky-400" value={vertragNr} onChange={(e) => setVertragNr(e.target.value)} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2">Paket</p>
              <div className="flex gap-2">
                {(["S", "M", "L"] as const).map((id) => (
                  <button key={id} onClick={() => setPaket(id)}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${paket === id ? "bg-sky-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-sky-300"}`}>
                    Paket {id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dokument */}
      <div className="anlage max-w-4xl mx-auto px-12 py-16 pt-10">

        {/* Kopfzeile */}
        <div className="flex justify-between items-start mb-12 pt-8">
          <div>
            <p className="text-2xl font-black tracking-tight">
              Bescheid<span className="text-sky-500">Recht</span>
            </p>
            <p className="text-slate-500 text-sm mt-0.5">{ANBIETER.inhaber}</p>
            <p className="text-slate-500 text-sm">{ANBIETER.adresse}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Anlage 1</p>
            <p className="text-lg font-black">Leistungsbeschreibung &amp; SLA</p>
            <p className="text-slate-400 text-sm mt-1">zum Rahmenvertrag {vertragNr}</p>
          </div>
        </div>

        {/* Titel */}
        <div className="text-center mb-14">
          <div className="h-0.5 bg-slate-200 mb-8" />
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-3">Anlage 1 zum Rahmenvertrag {vertragNr}</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Leistungsbeschreibung und Service Level Agreement (SLA)
          </h1>
          <p className="text-slate-500 text-sm mt-3">Stand: {datum} · Paket {paket}</p>
          <div className="h-0.5 bg-slate-200 mt-8" />
        </div>

        {/* § 1 Plattformbeschreibung */}
        <div className="paragraf">
          <h3>1. Plattformbeschreibung</h3>
          <p className="text-sm text-slate-600 mb-4">
            BescheidRecht ist eine webbasierte Software-as-a-Service-Plattform (SaaS) zur technischen
            Analyse von Behördenbescheiden. Die Plattform ist über die URL
            <strong> https://www.bescheidrecht.de</strong> erreichbar und wird als gehosteter
            Dienst bereitgestellt. Eine lokale Installation ist nicht erforderlich.
          </p>
          <p className="text-sm text-slate-600">
            <strong>Hinweis:</strong> BescheidRecht ist ein technisches Analyse-Werkzeug gemäß § 2 Abs. 1
            RDG (Rechtsdienstleistungsgesetz). Die Plattform bietet keine Rechtsberatung und ersetzt keine
            anwaltliche oder fachliche Prüfung. Die inhaltliche Verantwortung für auf Basis der Analyse
            erstellte Schreiben verbleibt bei der Einrichtung.
          </p>
        </div>

        {/* § 2 Funktionsumfang */}
        <div className="paragraf">
          <h3>2. Funktionsumfang</h3>
          <p className="text-sm text-slate-600 mb-4">Die Plattform umfasst folgende Kernfunktionen:</p>
          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-2 pr-4 text-xs font-bold uppercase tracking-wider text-slate-400">Funktion</th>
                <th className="text-left py-2 text-xs font-bold uppercase tracking-wider text-slate-400">Beschreibung</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-bold text-slate-900 align-top whitespace-nowrap">Bescheid-Upload</td>
                <td className="py-3">Upload von Bescheiden als PDF, JPG oder PNG. Automatische Texterkennung (OCR) bei Bilddateien.</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-bold text-slate-900 align-top whitespace-nowrap">Pseudonymisierung</td>
                <td className="py-3">Automatische Erkennung und Ersetzung personenbezogener Daten (Name, IBAN, Geburtsdatum, Adresse, Steuer-ID, Sozialversicherungsnummer) durch Platzhalter vor der KI-Verarbeitung. DSGVO Art. 25 (Privacy by Design).</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-bold text-slate-900 align-top whitespace-nowrap">Technische Analyse</td>
                <td className="py-3">Automatisierte Prüfung auf 130+ dokumentierte Fehlertypen in 16 Rechtsgebieten (SGB II–XII, BAMF, BAföG, Wohngeld u. a.). Erkennung von formellen Unstimmigkeiten, fehlenden Pflichtangaben und Rechenfehlern. Ausgabe mit Angabe der konkreten Rechtsgrundlage.</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-bold text-slate-900 align-top whitespace-nowrap">Musterschreiben-Generator</td>
                <td className="py-3">Erstellung einer Musterschreiben-Vorlage auf Basis der Analyseergebnisse. Export als DIN A4 PDF. Die Vorlage ist keine fertige Rechtsschrift und muss vor Verwendung durch eine Fachkraft geprüft werden.</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-bold text-slate-900 align-top whitespace-nowrap">Fristen-Dashboard</td>
                <td className="py-3">Verwaltung und Überwachung von Widerspruchsfristen. Status-Tracking (offen, eingereicht, erledigt, abgelaufen). Automatische Berechnung verbleibender Tage.</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 font-bold text-slate-900 align-top whitespace-nowrap">Einrichtungs-Verwaltung</td>
                <td className="py-3">Zentrale Verwaltung von Nutzer-Zugängen für die Einrichtung. Einladung und Entfernung von Mitarbeitenden. Organisationsübergreifende Sichtbarkeit für Administratoren.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-slate-900 align-top whitespace-nowrap">Nutzungsstatistiken</td>
                <td className="py-3">Übersicht über durchgeführte Analysen, genutzte Kontingente und Nutzeraktivität (nur Paket M und L).</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* § 3 Rechtsgebiete */}
        <div className="paragraf">
          <h3>3. Abgedeckte Rechtsgebiete</h3>
          <p className="text-sm text-slate-600 mb-4">
            Die technische Analyse umfasst Bescheide folgender Behörden und Rechtsgebiete:
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-slate-600">
            {[
              ["Jobcenter", "Grundsicherungsgeld / SGB II"],
              ["Agentur für Arbeit", "Arbeitslosengeld / SGB III"],
              ["Deutsche Rentenversicherung", "SGB VI"],
              ["Krankenkassen (GKV)", "SGB V"],
              ["Pflegekassen", "SGB XI"],
              ["Unfallversicherung / BG", "SGB VII"],
              ["Versorgungsamt", "SGB IX / Schwerbehinderung"],
              ["Sozialamt", "SGB XII / Sozialhilfe"],
              ["Jugendamt", "SGB VIII / Eingliederungshilfe"],
              ["BAMF", "Asylbewerberleistungsgesetz"],
              ["BAföG-Amt", "BAföG"],
              ["Familienkasse", "Kindergeld / BKGG"],
              ["Wohngeldstelle", "WoGG"],
              ["Elterngeldstelle", "BEEG"],
              ["Unfallversicherung (Selbst.)", "SGB VII"],
              ["Versorgungsverwaltung", "BVG / OEG"],
            ].map(([behoerde, rechtsgebiet]) => (
              <div key={behoerde} className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-900">{behoerde}</span>
                <span className="text-slate-400 text-xs ml-2">{rechtsgebiet}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pagebreak" />

        {/* § 4 Kontingente */}
        <div className="paragraf pt-8">
          <h3>4. Kontingente und Zugänge (Paket {paket})</h3>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {[
                ["Nutzer-Zugänge", `Bis ${p.nutzer} gleichzeitig aktive Accounts`],
                ["Analysen", p.analysen],
                ["Musterschreiben", "Inklusive (je Analyse ein Schreiben möglich)"],
                ["Fristen-Dashboard", "Inklusive"],
                ["Einrichtungs-Verwaltung", "Inklusive"],
                ["Support-Level", p.support],
                ["Onboarding", p.onboarding],
              ].map(([label, wert]) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-bold text-slate-900 w-48">{label}</td>
                  <td className="py-2.5 text-slate-600">{wert}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-slate-400 mt-3">
            Kontingente beziehen sich auf Kalendermonat. Nicht verbrauchte Kontingente verfallen
            am Monatsende und werden nicht übertragen.
          </p>
        </div>

        {/* § 5 SLA */}
        <div className="paragraf">
          <h3>5. Service Level Agreement (SLA)</h3>

          <p className="text-sm text-slate-600 font-bold mb-3">5.1 Verfügbarkeit</p>
          <table className="w-full text-sm border-collapse mb-4">
            <tbody>
              {[
                ["Verfügbarkeitsziel", `${p.sla} pro Kalendermonat`],
                ["Messverfahren", "Automatisiertes Monitoring (Health-Check alle 5 Minuten)"],
                ["Ausnahmen", "Angekündigte Wartungsfenster (min. 48h Vorlauf), höhere Gewalt, Ausfälle beim Endnutzer"],
                ["Berechnung", "(Gesamtminuten − Ausfallminuten) / Gesamtminuten × 100"],
              ].map(([label, wert]) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-bold text-slate-900 w-48 align-top">{label}</td>
                  <td className="py-2.5 text-slate-600">{wert}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-sm text-slate-600 font-bold mb-3">5.2 Reaktionszeiten Support</p>
          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-2 pr-4 text-xs font-bold uppercase tracking-wider text-slate-400">Priorität</th>
                <th className="text-left py-2 pr-4 text-xs font-bold uppercase tracking-wider text-slate-400">Definition</th>
                <th className="text-left py-2 text-xs font-bold uppercase tracking-wider text-slate-400">Reaktionszeit</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-2.5 pr-4 font-bold text-red-600">Kritisch</td>
                <td className="py-2.5 pr-4">Plattform vollständig nicht erreichbar</td>
                <td className="py-2.5 font-bold">{paket === "L" ? "2 Stunden" : "4 Stunden"}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 pr-4 font-bold text-amber-600">Hoch</td>
                <td className="py-2.5 pr-4">Kernfunktion eingeschränkt (Analyse, Upload)</td>
                <td className="py-2.5 font-bold">{paket === "L" ? "4 Stunden" : "8 Stunden"}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 pr-4 font-bold text-sky-600">Normal</td>
                <td className="py-2.5 pr-4">Nebenfunktion betroffen, Workaround möglich</td>
                <td className="py-2.5 font-bold">{paket === "S" ? "48 Stunden" : "24 Stunden"}</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-bold text-slate-400">Niedrig</td>
                <td className="py-2.5 pr-4">Feature-Wunsch, kosmetischer Fehler</td>
                <td className="py-2.5 font-bold">5 Werktage</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-slate-400">
            Reaktionszeiten beziehen sich auf Geschäftszeiten (Mo–Fr, 9:00–17:00 Uhr MEZ),
            außer bei Priorität „Kritisch" (24/7 für Paket L).
          </p>

          <p className="text-sm text-slate-600 font-bold mb-3 mt-6">5.3 Wartungsfenster</p>
          <p className="text-sm text-slate-600">
            Geplante Wartungsarbeiten finden bevorzugt außerhalb der Geschäftszeiten statt
            (Samstag 02:00–06:00 Uhr MEZ). Der Auftraggeber wird mindestens 48 Stunden im Voraus
            per E-Mail informiert. Notfall-Wartungen (Sicherheitsupdates) können ohne Vorlaufzeit
            erfolgen, wobei der AG unverzüglich informiert wird.
          </p>

          <p className="text-sm text-slate-600 font-bold mb-3 mt-6">5.4 SLA-Unterschreitung</p>
          <p className="text-sm text-slate-600">
            Bei Unterschreitung des vereinbarten Verfügbarkeitsziels in einem Kalendermonat
            erhält der AG auf Anfrage eine Gutschrift in folgender Höhe:
          </p>
          <table className="w-full text-sm border-collapse mt-2 mb-2">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 text-slate-600">Verfügbarkeit {"<"} {p.sla} und {">="} 99,0 %</td>
                <td className="py-2 font-bold text-slate-900">5 % der Monatslizenz</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 text-slate-600">Verfügbarkeit {"<"} 99,0 % und {">="} 95,0 %</td>
                <td className="py-2 font-bold text-slate-900">15 % der Monatslizenz</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-slate-600">Verfügbarkeit {"<"} 95,0 %</td>
                <td className="py-2 font-bold text-slate-900">30 % der Monatslizenz</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-slate-400">
            Die Gutschrift wird mit der nächsten Monatsrechnung verrechnet. Die Geltendmachung
            muss innerhalb von 30 Tagen nach Ende des betroffenen Monats schriftlich erfolgen.
            Die Gutschrift stellt die ausschließliche und abschließende Kompensation für
            SLA-Unterschreitungen dar.
          </p>
        </div>

        {/* § 6 Systemanforderungen */}
        <div className="paragraf">
          <h3>6. Systemanforderungen (Auftraggeber)</h3>
          <p className="text-sm text-slate-600 mb-3">
            Für die Nutzung der Plattform sind auf Seiten des AG folgende Voraussetzungen erforderlich:
          </p>
          <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-5">
            <li>Aktueller Webbrowser (Chrome, Firefox, Safari oder Edge, jeweils aktuelle Version)</li>
            <li>Stabile Internetverbindung (min. 2 Mbit/s)</li>
            <li>JavaScript aktiviert</li>
            <li>Gültige E-Mail-Adressen für alle Nutzer-Zugänge</li>
          </ul>
        </div>

        {/* § 7 Datensicherheit */}
        <div className="paragraf">
          <h3>7. Datensicherheit und Infrastruktur</h3>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {[
                ["Hosting", "Vercel Inc. (Edge Network, Serverless Functions)"],
                ["Datenbank", "Supabase Inc. (PostgreSQL, EU-Region)"],
                ["KI-Verarbeitung", "Anthropic, PBC (Claude API, Zero-Data-Retention)"],
                ["Verschlüsselung", "TLS 1.2/1.3 (Transport), AES-256 (Datenbank at rest)"],
                ["Authentifizierung", "Supabase Auth (bcrypt, JWT, RLS)"],
                ["Pseudonymisierung", "Automatisch vor jeder KI-Verarbeitung (Art. 25 DSGVO)"],
                ["Backups", "Automatische tägliche Backups, 30 Tage Aufbewahrung"],
                ["Monitoring", "Automatisierte Health-Checks alle 5 Minuten, Sentry Error-Tracking"],
              ].map(([label, wert]) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-bold text-slate-900 w-48 align-top">{label}</td>
                  <td className="py-2.5 text-slate-600">{wert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* § 8 Änderungen */}
        <div className="paragraf">
          <h3>8. Änderungen am Leistungsumfang</h3>
          <p className="text-sm text-slate-600">
            Der Auftragnehmer ist berechtigt, die Plattform weiterzuentwickeln und Funktionen
            hinzuzufügen. Der vereinbarte Leistungsumfang darf nicht wesentlich verschlechtert
            werden. Wesentliche Änderungen werden dem AG mit einer Vorlaufzeit von mindestens
            4 Wochen schriftlich mitgeteilt. Bei wesentlicher Verschlechterung hat der AG ein
            Sonderkündigungsrecht gemäß § 5 des Rahmenvertrags.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-14 border-t border-slate-100 pt-6 flex justify-between items-center">
          <p className="text-xs text-slate-300 font-bold">Anlage 1 · {vertragNr} · Stand {datum}</p>
          <p className="text-xs text-slate-300 font-bold">{ANBIETER.web}</p>
        </div>

        {/* Hinweis */}
        <div className="no-print mt-10 flex gap-3">
          <Link href="/rahmenvertrag" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            Zum Rahmenvertrag
          </Link>
          <Link href="/rahmenvertrag/anlage-2" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-sky-500 text-white hover:bg-sky-400 transition-colors">
            Anlage 2: AV-Vertrag
          </Link>
        </div>
      </div>
    </div>
  );
}
