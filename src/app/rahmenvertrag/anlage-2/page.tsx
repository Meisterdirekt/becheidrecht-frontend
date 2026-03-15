"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";

const ANBIETER = {
  name: "BescheidRecht",
  inhaber: "Hendrik Berkensträter",
  adresse: "Antoniusstraße 47, 49377 Vechta",
  email: "kontakt@bescheidrecht.de",
  web: "bescheidrecht.de",
};

export default function Anlage2Page() {
  const [kundeOrg, setKundeOrg] = useState("Caritas Diözesanverband [Name] e. V.");
  const [kundeAdresse, setKundeAdresse] = useState("[Straße], [PLZ Stadt]");
  const [kundeVertreter, setKundeVertreter] = useState("[Vorstand / Geschäftsführer:in]");
  const [kundeDsb, setKundeDsb] = useState("[Name des/der Datenschutzbeauftragten]");
  const [vertragNr, setVertragNr] = useState(() => {
    const now = new Date();
    return `BR-RV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-001`;
  });
  const [datum] = useState(() =>
    new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })
  );

  return (
    <div className="font-sans bg-white min-h-screen text-slate-900" data-theme="light">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .pagebreak { page-break-before: always; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-size: 11pt; }
          .avv { max-width: 100%; padding: 2.5cm 2.5cm; }
        }
        @media screen {
          .pagebreak { border-top: 2px dashed #e2e8f0; margin-top: 3rem; padding-top: 3rem; }
        }
        .avv p, .avv li { line-height: 1.7; }
        .paragraf { margin-bottom: 2rem; }
        .paragraf h3 { font-size: 0.95rem; font-weight: 800; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.4rem; }
        ol.avvlist { list-style: none; counter-reset: item; padding-left: 0; }
        ol.avvlist > li { counter-increment: item; display: flex; gap: 0.75rem; margin-bottom: 0.75rem; font-size: 0.875rem; color: #374151; }
        ol.avvlist > li::before { content: "(" counter(item) ")"; font-weight: 700; flex-shrink: 0; color: #6b7280; }
      `}</style>

      {/* Nav */}
      <nav className="no-print fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <span className="font-black text-slate-900 text-lg">
          Bescheid<span className="text-sky-500">Recht</span>
          <span className="ml-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Anlage 2 · AV-Vertrag</span>
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
            AV-Vertrag konfigurieren — erscheint nicht im Druck
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Organisation (Verantwortlicher)</label>
              <input className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-sky-400" value={kundeOrg} onChange={(e) => setKundeOrg(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Adresse</label>
              <input className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-sky-400" value={kundeAdresse} onChange={(e) => setKundeAdresse(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Vertreten durch</label>
              <input className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-sky-400" value={kundeVertreter} onChange={(e) => setKundeVertreter(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Datenschutzbeauftragte:r</label>
              <input className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-sky-400" value={kundeDsb} onChange={(e) => setKundeDsb(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Vertrags-Nr.</label>
              <input className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-sky-400" value={vertragNr} onChange={(e) => setVertragNr(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Dokument */}
      <div className="avv max-w-4xl mx-auto px-12 py-16 pt-10">

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
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Anlage 2</p>
            <p className="text-lg font-black">Auftragsverarbeitungsvertrag</p>
            <p className="text-slate-400 text-sm mt-1">zum Rahmenvertrag {vertragNr}</p>
          </div>
        </div>

        {/* Titel */}
        <div className="text-center mb-14">
          <div className="h-0.5 bg-slate-200 mb-8" />
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-3">Anlage 2 zum Rahmenvertrag {vertragNr}</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Vertrag zur Auftragsverarbeitung<br />gemäß Art. 28 DSGVO
          </h1>
          <p className="text-slate-500 text-sm mt-3">Stand: {datum}</p>
          <div className="h-0.5 bg-slate-200 mt-8" />
        </div>

        {/* Vertragsparteien */}
        <div className="grid grid-cols-2 gap-10 mb-14 text-sm">
          <div className="bg-slate-50 rounded-xl p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Verantwortlicher (Auftraggeber)</p>
            <p className="font-black text-slate-900">{kundeOrg}</p>
            <p className="text-slate-600 mt-1">{kundeAdresse}</p>
            <p className="text-slate-600">vertreten durch: {kundeVertreter}</p>
            <p className="text-slate-600">DSB: {kundeDsb}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Auftragsverarbeiter</p>
            <p className="font-black text-slate-900">{ANBIETER.name}</p>
            <p className="text-slate-600 mt-1">{ANBIETER.inhaber}</p>
            <p className="text-slate-600">{ANBIETER.adresse}</p>
            <p className="text-slate-600">{ANBIETER.email}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-12 leading-relaxed">
          Der Verantwortliche beauftragt den Auftragsverarbeiter im Rahmen des Rahmenvertrags
          {` ${vertragNr}`} mit der Verarbeitung personenbezogener Daten. Die Einzelheiten der
          Auftragsverarbeitung ergeben sich aus diesem Vertrag, der Bestandteil des Rahmenvertrags ist.
        </p>

        {/* § 1 */}
        <div className="paragraf">
          <h3>§ 1 Gegenstand und Laufzeit</h3>
          <ol className="avvlist">
            <li>Der Auftragsverarbeiter verarbeitet personenbezogene Daten im Auftrag des
              Verantwortlichen im Rahmen der Bereitstellung der SaaS-Plattform „BescheidRecht"
              zur technischen Analyse von Behördenbescheiden.</li>
            <li>Die Laufzeit dieses AV-Vertrags entspricht der Laufzeit des zugrunde liegenden
              Rahmenvertrags. Pflichten, die über das Vertragsende hinausgehen (insbesondere
              Löschung und Rückgabe), bestehen bis zu ihrer vollständigen Erfüllung fort.</li>
          </ol>
        </div>

        {/* § 2 */}
        <div className="paragraf">
          <h3>§ 2 Art, Zweck und Umfang der Verarbeitung</h3>
          <ol className="avvlist">
            <li><strong>Art der Verarbeitung:</strong> Erheben, Speichern, Strukturieren, Auslesen,
              Abfragen, Pseudonymisieren, Analysieren, Löschen.</li>
            <li><strong>Zweck:</strong> Technische Prüfung von Behördenbescheiden auf formale und
              inhaltliche Unstimmigkeiten; Erstellung von Musterschreiben-Vorlagen;
              Fristenverwaltung; Einrichtungs-Übersicht über Analysevorgänge.</li>
            <li><strong>Kategorien personenbezogener Daten:</strong>
              <ul className="mt-2 ml-4 space-y-1 text-slate-600 list-disc">
                <li>Klientendaten: Name, Anschrift, Geburtsdatum, Aktenzeichen, Bescheiddaten,
                  IBAN, Steuer-ID, Sozialversicherungsnummer sowie sonstige im Bescheid
                  enthaltene personenbezogene Angaben</li>
                <li>Mitarbeiterdaten: E-Mail-Adresse, Name, Nutzungsstatistiken</li>
              </ul>
            </li>
            <li><strong>Kategorien betroffener Personen:</strong>
              <ul className="mt-2 ml-4 space-y-1 text-slate-600 list-disc">
                <li>Klienten der Einrichtung (Bescheidinhaber)</li>
                <li>Mitarbeitende der Einrichtung (Berater:innen, Administrator:innen)</li>
              </ul>
            </li>
          </ol>
        </div>

        {/* § 3 */}
        <div className="paragraf">
          <h3>§ 3 Weisungsgebundenheit</h3>
          <ol className="avvlist">
            <li>Der Auftragsverarbeiter verarbeitet personenbezogene Daten ausschließlich auf
              dokumentierte Weisung des Verantwortlichen (Art. 28 Abs. 3 lit. a DSGVO), es
              sei denn, er ist durch Unionsrecht oder nationales Recht zur Verarbeitung
              verpflichtet.</li>
            <li>Die Nutzung der Plattform gemäß Rahmenvertrag und Leistungsbeschreibung
              (Anlage 1) gilt als dokumentierte Weisung.</li>
            <li>Weisungen, die über die im Rahmenvertrag vereinbarte Leistung hinausgehen,
              bedürfen einer gesonderten schriftlichen Vereinbarung.</li>
            <li>Der Auftragsverarbeiter informiert den Verantwortlichen unverzüglich, wenn
              eine Weisung nach seiner Auffassung gegen datenschutzrechtliche Vorschriften
              verstößt.</li>
          </ol>
        </div>

        <div className="pagebreak" />

        {/* § 4 */}
        <div className="paragraf pt-8">
          <h3>§ 4 Pflichten des Auftragsverarbeiters</h3>
          <p className="text-sm text-slate-600 mb-3">Der Auftragsverarbeiter gewährleistet:</p>
          <ol className="avvlist">
            <li>Verarbeitung personenbezogener Daten ausschließlich zum vereinbarten Zweck.</li>
            <li>Geeignete technische und organisatorische Maßnahmen (TOMs) gemäß Art. 32 DSGVO
              (siehe § 7 dieses Vertrags).</li>
            <li>Sicherstellung, dass alle Personen mit Zugang zu den Daten zur Vertraulichkeit
              verpflichtet sind (Art. 28 Abs. 3 lit. b DSGVO).</li>
            <li>Unverzügliche Information des Verantwortlichen über Datenpannen (spätestens
              innerhalb von 72 Stunden nach Bekanntwerden, Art. 33 DSGVO).</li>
            <li>Unterstützung bei Betroffenenrechten (Art. 15–22 DSGVO), Datenschutz-Folgenabschätzungen
              (Art. 35 DSGVO) und Konsultationen mit der Aufsichtsbehörde (Art. 36 DSGVO).</li>
            <li>Bereitstellung aller erforderlichen Informationen zum Nachweis der Einhaltung
              der in Art. 28 DSGVO niedergelegten Pflichten und Ermöglichung von Überprüfungen.</li>
            <li>Löschung oder Rückgabe sämtlicher personenbezogener Daten nach Beendigung der
              Auftragsverarbeitung (Art. 28 Abs. 3 lit. g DSGVO), siehe § 9.</li>
          </ol>
        </div>

        {/* § 5 */}
        <div className="paragraf">
          <h3>§ 5 Pflichten des Verantwortlichen</h3>
          <ol className="avvlist">
            <li>Information der betroffenen Personen (Klienten) über die Datenverarbeitung
              durch BescheidRecht gemäß Art. 13/14 DSGVO.</li>
            <li>Sicherstellung einer gültigen Rechtsgrundlage für die Datenverarbeitung
              (z. B. Einwilligung oder berechtigtes Interesse).</li>
            <li>Sichere Verwahrung der Zugangsdaten und unverzügliche Meldung von
              Sicherheitsvorfällen im Verantwortungsbereich des Verantwortlichen.</li>
            <li>Sicherstellung, dass Musterschreiben-Vorlagen vor Verwendung durch eine
              Fachkraft inhaltlich geprüft werden.</li>
          </ol>
        </div>

        {/* § 6 */}
        <div className="paragraf">
          <h3>§ 6 Unterauftragnehmer (Sub-Processoren)</h3>
          <ol className="avvlist">
            <li>Der Verantwortliche erteilt hiermit die allgemeine Genehmigung zur Beauftragung
              der nachfolgend genannten Unterauftragnehmer (Art. 28 Abs. 2 DSGVO).</li>
            <li>Der Auftragsverarbeiter informiert den Verantwortlichen über jede beabsichtigte
              Änderung in Bezug auf Hinzuziehung oder Ersetzung von Unterauftragnehmern.
              Der Verantwortliche kann der Änderung innerhalb von 14 Tagen schriftlich
              widersprechen.</li>
            <li>Der Auftragsverarbeiter stellt sicher, dass Unterauftragnehmern dieselben
              Datenschutzpflichten auferlegt werden wie dem Auftragsverarbeiter selbst
              (Art. 28 Abs. 4 DSGVO).</li>
          </ol>

          <p className="text-sm text-slate-600 font-bold mt-4 mb-3">Aktuelle Unterauftragnehmer:</p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-2 pr-3 text-xs font-bold uppercase tracking-wider text-slate-400">Anbieter</th>
                <th className="text-left py-2 pr-3 text-xs font-bold uppercase tracking-wider text-slate-400">Zweck</th>
                <th className="text-left py-2 pr-3 text-xs font-bold uppercase tracking-wider text-slate-400">Sitz</th>
                <th className="text-left py-2 text-xs font-bold uppercase tracking-wider text-slate-400">Rechtsgrundlage Drittland</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-2.5 pr-3 font-bold text-slate-900">Vercel Inc.</td>
                <td className="py-2.5 pr-3">Hosting, CDN, Serverless Functions</td>
                <td className="py-2.5 pr-3">San Francisco, USA</td>
                <td className="py-2.5">EU-US Data Privacy Framework + DPA + SCCs</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 pr-3 font-bold text-slate-900">Supabase Inc.</td>
                <td className="py-2.5 pr-3">Datenbank (PostgreSQL), Authentifizierung</td>
                <td className="py-2.5 pr-3">San Francisco, USA<br /><span className="text-xs text-slate-400">(DB-Region: EU/Frankfurt)</span></td>
                <td className="py-2.5">DPA + SCCs, DB in EU gehostet</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 pr-3 font-bold text-slate-900">Anthropic, PBC</td>
                <td className="py-2.5 pr-3">KI-Analyse (nur pseudonymisierte Daten)</td>
                <td className="py-2.5 pr-3">San Francisco, USA</td>
                <td className="py-2.5">DPA + SCCs, Zero-Data-Retention (API-Daten werden nicht gespeichert oder trainiert)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 pr-3 font-bold text-slate-900">OpenAI LLC</td>
                <td className="py-2.5 pr-3">Technischer Fallback (OCR/Analyse, nur bei Nichtverfügbarkeit von Anthropic)</td>
                <td className="py-2.5 pr-3">San Francisco, USA</td>
                <td className="py-2.5">DPA + SCCs, Zero-Retention (API)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 pr-3 font-bold text-slate-900">Mollie B.V.</td>
                <td className="py-2.5 pr-3">Zahlungsabwicklung</td>
                <td className="py-2.5 pr-3">Amsterdam, Niederlande (EU)</td>
                <td className="py-2.5">EU — DSGVO, PCI-DSS</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 pr-3 font-bold text-slate-900">Functional Software Inc. (Sentry)</td>
                <td className="py-2.5 pr-3">Fehlerüberwachung, Stabilitätsmonitoring</td>
                <td className="py-2.5 pr-3">San Francisco, USA</td>
                <td className="py-2.5">DPA + SCCs, keine gezielte PII-Erfassung</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-3 font-bold text-slate-900">Upstash Inc.</td>
                <td className="py-2.5 pr-3">Rate-Limiting (Redis)</td>
                <td className="py-2.5 pr-3">San Francisco, USA<br /><span className="text-xs text-slate-400">(Daten-Region: EU/Frankfurt)</span></td>
                <td className="py-2.5">DPA + SCCs, Daten in EU gehostet</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-slate-400 mt-3">
            <strong>Hinweis zu US-Anbietern:</strong> Alle genannten US-Unterauftragnehmer sind unter dem
            EU-US Data Privacy Framework zertifiziert und/oder haben Standardvertragsklauseln (SCCs)
            nach Art. 46 Abs. 2 lit. c DSGVO abgeschlossen. Anthropic erhält ausschließlich
            pseudonymisierte Daten — kein Klardaten-Transfer.
          </p>
        </div>

        {/* § 7 TOMs */}
        <div className="paragraf">
          <h3>§ 7 Technische und organisatorische Maßnahmen (Art. 32 DSGVO)</h3>
          <p className="text-sm text-slate-600 mb-4">
            Der Auftragsverarbeiter trifft folgende Maßnahmen zum Schutz personenbezogener Daten:
          </p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-2 pr-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-56">Maßnahme</th>
                <th className="text-left py-2 text-xs font-bold uppercase tracking-wider text-slate-400">Umsetzung</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {[
                ["Pseudonymisierung (Art. 32 Abs. 1 lit. a)", "Automatische Erkennung und Ersetzung aller PII (Name, IBAN, Geburtsdatum, Adresse, Steuer-ID, SV-Nr.) durch Platzhalter vor KI-Verarbeitung. Re-Identifizierung nur durch die Plattform selbst nach der Analyse."],
                ["Verschlüsselung (Art. 32 Abs. 1 lit. a)", "TLS 1.2/1.3 für alle Datenübertragungen. AES-256 Verschlüsselung der Datenbank (at rest). bcrypt-Hashing für Passwörter."],
                ["Vertraulichkeit (Art. 32 Abs. 1 lit. b)", "Row Level Security (RLS) auf Datenbankebene — Nutzer sehen ausschließlich eigene Daten. B2B-Organisationen sehen nur ihre eigenen Analysen. Zugriff nur über authentifizierte API-Endpunkte."],
                ["Integrität (Art. 32 Abs. 1 lit. b)", "Alle API-Endpunkte mit Authentifizierungsprüfung vor Logikausführung. Rate-Limiting gegen Missbrauch. Input-Validierung und Sanitisierung."],
                ["Verfügbarkeit (Art. 32 Abs. 1 lit. b)", "Hosting auf Vercel mit automatischer Skalierung und Redundanz. Automatisierte Health-Checks alle 5 Minuten. Automatische tägliche Backups (30 Tage Aufbewahrung)."],
                ["Belastbarkeit (Art. 32 Abs. 1 lit. b)", "Serverless-Architektur mit automatischer horizontaler Skalierung. Kein Single Point of Failure durch Edge-Deployment."],
                ["Wiederherstellbarkeit (Art. 32 Abs. 1 lit. c)", "Automatisierte Backup-Wiederherstellung innerhalb von 4 Stunden. Point-in-Time-Recovery über Supabase."],
                ["Regelmäßige Überprüfung (Art. 32 Abs. 1 lit. d)", "Automatisierte Sicherheitsscans bei jedem Deployment (npm audit, Secrets-Scan). Wöchentliches Agent-Audit zur Anomalie-Erkennung. Monatliches Content-Audit."],
                ["Datensparsamkeit", "Bescheid-Dokumente werden nach der Analyse nicht dauerhaft gespeichert. Anthropic Zero-Data-Retention — API-Daten werden weder gespeichert noch für Training verwendet."],
                ["Zutrittskontrolle", "Cloud-only-Infrastruktur, kein physisches Rechenzentrum beim Auftragsverarbeiter. Zugriff über SSH-Keys und 2FA."],
              ].map(([massnahme, umsetzung]) => (
                <tr key={massnahme} className="border-b border-slate-100">
                  <td className="py-3 pr-4 font-bold text-slate-900 align-top text-xs">{massnahme}</td>
                  <td className="py-3 text-slate-600">{umsetzung}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagebreak" />

        {/* § 8 Betroffenenrechte */}
        <div className="paragraf pt-8">
          <h3>§ 8 Betroffenenrechte</h3>
          <ol className="avvlist">
            <li>Der Auftragsverarbeiter unterstützt den Verantwortlichen bei der Erfüllung
              von Anfragen betroffener Personen (Auskunft, Berichtigung, Löschung,
              Einschränkung, Datenübertragbarkeit, Widerspruch gemäß Art. 15–22 DSGVO).</li>
            <li>Anfragen betroffener Personen, die direkt an den Auftragsverarbeiter gerichtet
              werden, leitet dieser unverzüglich an den Verantwortlichen weiter.</li>
            <li>Der Verantwortliche bleibt allein zuständig für die Beantwortung von
              Betroffenenanfragen.</li>
          </ol>
        </div>

        {/* § 9 Löschung */}
        <div className="paragraf">
          <h3>§ 9 Löschung und Rückgabe von Daten</h3>
          <ol className="avvlist">
            <li>Nach Beendigung des Rahmenvertrags löscht der Auftragsverarbeiter alle
              personenbezogenen Daten des Verantwortlichen und seiner Klienten innerhalb
              von <strong>30 Tagen</strong>, sofern keine gesetzlichen Aufbewahrungspflichten
              entgegenstehen.</li>
            <li>Auf ausdrücklichen Wunsch des Verantwortlichen werden Daten vor der Löschung
              in einem maschinenlesbaren Format (JSON/CSV) exportiert. Der Exportantrag ist
              vor Vertragsende zu stellen.</li>
            <li>Bescheid-Dokumente (Uploads) werden unmittelbar nach Abschluss der Analyse
              gelöscht und nicht dauerhaft gespeichert. Analyseergebnisse werden im Account
              des Verantwortlichen gespeichert und können jederzeit durch den Verantwortlichen
              gelöscht werden.</li>
            <li>Der Auftragsverarbeiter bestätigt die vollständige Löschung auf Anfrage
              schriftlich.</li>
          </ol>
        </div>

        {/* § 10 Datenpannen */}
        <div className="paragraf">
          <h3>§ 10 Meldung von Datenpannen</h3>
          <ol className="avvlist">
            <li>Der Auftragsverarbeiter benachrichtigt den Verantwortlichen unverzüglich,
              spätestens jedoch innerhalb von <strong>72 Stunden</strong> nach Bekanntwerden
              einer Verletzung des Schutzes personenbezogener Daten (Art. 33 DSGVO).</li>
            <li>Die Benachrichtigung enthält mindestens:
              <ul className="mt-2 ml-4 space-y-1 text-slate-600 list-disc">
                <li>Art der Verletzung</li>
                <li>Betroffene Datenkategorien und ungefähre Anzahl der Datensätze</li>
                <li>Voraussichtliche Folgen</li>
                <li>Bereits getroffene und vorgeschlagene Abhilfemaßnahmen</li>
              </ul>
            </li>
            <li>Meldepflichten gegenüber der Aufsichtsbehörde und gegenüber den
              betroffenen Personen verbleiben beim Verantwortlichen.</li>
          </ol>
        </div>

        {/* § 11 Kontrollrechte */}
        <div className="paragraf">
          <h3>§ 11 Kontrollrechte</h3>
          <ol className="avvlist">
            <li>Der Verantwortliche ist berechtigt, die Einhaltung dieses AV-Vertrags zu
              überprüfen. Dazu kann er:
              <ul className="mt-2 ml-4 space-y-1 text-slate-600 list-disc">
                <li>Auskünfte und Nachweise in Textform anfordern</li>
                <li>Prüfberichte, Auditberichte oder Zertifikate anfordern</li>
                <li>Mit angemessener Vorankündigung (14 Tage) Inspektionen durchführen
                  oder durch sachverständige Dritte durchführen lassen</li>
              </ul>
            </li>
            <li>Der Auftragsverarbeiter stellt dem Verantwortlichen alle erforderlichen
              Informationen zur Verfügung und duldet Überprüfungen (Art. 28 Abs. 3 lit. h DSGVO).</li>
            <li>Die Kosten der Kontrolle trägt der Verantwortliche, es sei denn, die Kontrolle
              deckt einen Verstoß des Auftragsverarbeiters auf.</li>
          </ol>
        </div>

        {/* § 12 Haftung */}
        <div className="paragraf">
          <h3>§ 12 Haftung</h3>
          <ol className="avvlist">
            <li>Die Haftung der Parteien richtet sich nach Art. 82 DSGVO.</li>
            <li>Der Auftragsverarbeiter ist von der Haftung befreit, wenn er nachweist,
              dass er in keinerlei Hinsicht für den Umstand verantwortlich ist, durch den
              der Schaden eingetreten ist (Art. 82 Abs. 3 DSGVO).</li>
            <li>Im Übrigen gelten die Haftungsregelungen des Rahmenvertrags (§ 8).</li>
          </ol>
        </div>

        {/* § 13 Schlussbestimmungen */}
        <div className="paragraf">
          <h3>§ 13 Schlussbestimmungen</h3>
          <ol className="avvlist">
            <li>Dieser AV-Vertrag unterliegt dem Recht der Bundesrepublik Deutschland.</li>
            <li>Gerichtsstand ist <strong>Vechta (Niedersachsen)</strong>, soweit gesetzlich zulässig.</li>
            <li>Änderungen bedürfen der Schriftform (E-Mail genügt). Der Auftragsverarbeiter
              informiert den Verantwortlichen über wesentliche Änderungen mit einer Vorlaufzeit
              von 30 Tagen.</li>
            <li>Sollte eine Bestimmung unwirksam sein, bleibt die Wirksamkeit der übrigen
              Bestimmungen unberührt (Salvatorische Klausel).</li>
            <li>Dieser AV-Vertrag ist Bestandteil des Rahmenvertrags {vertragNr} und tritt
              mit dessen Unterzeichnung in Kraft.</li>
          </ol>
        </div>

        {/* Unterschrift */}
        <div className="mt-14 mb-10">
          <div className="h-px bg-slate-200 mb-10" />
          <p className="text-sm font-bold text-slate-700 mb-8">
            Durch ihre Unterschriften bestätigen die Parteien, diesen Auftragsverarbeitungsvertrag
            gelesen, verstanden und als Bestandteil des Rahmenvertrags {vertragNr} akzeptiert zu haben.
          </p>
          <div className="grid grid-cols-2 gap-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Verantwortlicher (Auftraggeber)</p>
              <div className="border-b-2 border-slate-800 h-14 mb-2" />
              <p className="text-xs text-slate-500 font-bold">{kundeOrg}</p>
              <p className="text-xs text-slate-400 mt-0.5">{kundeVertreter}</p>
              <p className="text-xs text-slate-400 mt-3">Ort, Datum</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Auftragsverarbeiter</p>
              <div className="border-b-2 border-slate-800 h-14 mb-2" />
              <p className="text-xs text-slate-500 font-bold">BescheidRecht</p>
              <p className="text-xs text-slate-400 mt-0.5">{ANBIETER.inhaber}</p>
              <p className="text-xs text-slate-400 mt-3">Ort, Datum</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-6 flex justify-between items-center">
          <p className="text-xs text-slate-300 font-bold">Anlage 2 (AVV) · {vertragNr} · Stand {datum}</p>
          <p className="text-xs text-slate-300 font-bold">{ANBIETER.web}</p>
        </div>

        {/* Hinweis */}
        <div className="no-print mt-10 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-xs font-bold text-amber-700 mb-1">Rechtlicher Hinweis</p>
          <p className="text-xs text-amber-600 leading-relaxed">
            Dieser AV-Vertrag basiert auf den Empfehlungen der Datenschutzkonferenz (DSK) gemäß
            Art. 28 DSGVO. Für den Einsatz bei großen Trägern (Caritas, AWO, Diakonie) empfiehlt
            sich eine einmalige Prüfung durch einen auf Datenschutzrecht spezialisierten Anwalt.
          </p>
        </div>

        <div className="no-print mt-6 flex gap-3">
          <Link href="/rahmenvertrag" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            Rahmenvertrag
          </Link>
          <Link href="/rahmenvertrag/anlage-1" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            Anlage 1: Leistungsbeschreibung
          </Link>
          <Link href="/rahmenvertrag/anlage-3" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-sky-500 text-white hover:bg-sky-400 transition-colors">
            Anlage 3: TOM
          </Link>
        </div>
      </div>
    </div>
  );
}
