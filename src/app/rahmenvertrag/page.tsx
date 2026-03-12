"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";

// ─── Anpassen vor Verwendung ────────────────────────────────────────────────

const ANBIETER = {
  name: "BescheidRecht",
  inhaber: "Hendrik Berkensträter",
  adresse: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Antoniusstraße 47, 49377 Vechta",
  email: "kontakt@bescheidrecht.de",
  web: "bescheidrecht.de",
  steuernummer: "Kleinunternehmer gem. § 19 UStG (keine USt-IdNr.)",
  gerichtsstand: process.env.NEXT_PUBLIC_COMPANY_CITY || "Vechta",
};

const PAKETE: Record<string, { nutzer: string; analysen: string; preis: string; sla: string }> = {
  S: { nutzer: "15", analysen: "1.000", preis: "1.490", sla: "99,5 %" },
  M: { nutzer: "50", analysen: "5.000", preis: "3.490", sla: "99,5 %" },
  L: { nutzer: "200", analysen: "unbegrenzt", preis: "7.490", sla: "99,9 %" },
};

// ─── Seite ─────────────────────────────────────────────────────────────────

export default function RahmenvertragPage() {
  const [kundeOrg, setKundeOrg] = useState("Caritas Diözesanverband [Name] e. V.");
  const [kundeAdresse, setKundeAdresse] = useState("[Straße], [PLZ Stadt]");
  const [kundeVertreter, setKundeVertreter] = useState("[Vorstand / Geschäftsführer:in]");
  const [kundeAnsprechpartner, setKundeAnsprechpartner] = useState("[Vor- und Nachname]");
  const [vertragNr, setVertragNr] = useState(() => {
    const now = new Date();
    return `BR-RV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-001`;
  });
  const [vertragsDatum, setVertragsDatum] = useState("");
  const [laufzeitBeginn, setLaufzeitBeginn] = useState("");
  const [paket, setPaket] = useState<"S" | "M" | "L">("M");
  const [datum] = useState(() =>
    new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })
  );

  const p = PAKETE[paket];
  const jahresnetto = (parseFloat(p.preis.replace(".", "")) * 12 * 0.9).toLocaleString("de-DE", { maximumFractionDigits: 0 });

  return (
    <div className="font-sans bg-white min-h-screen text-slate-900" data-theme="light">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .pagebreak { page-break-before: always; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-size: 11pt; }
          .vertrag { max-width: 100%; padding: 2.5cm 2.5cm; }
        }
        @media screen {
          .pagebreak { border-top: 2px dashed #e2e8f0; margin-top: 3rem; padding-top: 3rem; }
        }
        .vertrag p, .vertrag li { line-height: 1.7; }
        .paragraf { margin-bottom: 2rem; }
        .paragraf h3 { font-size: 0.95rem; font-weight: 800; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.4rem; }
        ol.vertragslist { list-style: none; counter-reset: item; padding-left: 0; }
        ol.vertragslist > li { counter-increment: item; display: flex; gap: 0.75rem; margin-bottom: 0.5rem; font-size: 0.875rem; color: #374151; }
        ol.vertragslist > li::before { content: "(" counter(item) ")"; font-weight: 700; flex-shrink: 0; color: #6b7280; }
      `}</style>

      {/* ── Browser-Nav ─────────────────────────────── */}
      <nav className="no-print fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <span className="font-black text-slate-900 text-lg">
          Bescheid<span className="text-sky-500">Recht</span>
          <span className="ml-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Rahmenvertrag</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/angebot" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-medium">
            <ArrowLeft className="h-3.5 w-3.5" /> Zum Angebot
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-colors"
          >
            <Printer className="h-4 w-4" /> Als PDF drucken
          </button>
        </div>
      </nav>

      {/* ── Konfigurations-Panel ─────────────────────── */}
      <div className="no-print bg-slate-50 border-b border-slate-200 pt-20 pb-6 px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Rahmenvertrag konfigurieren — erscheint nicht im Druck
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Organisation (Auftraggeber)</label>
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
              <label className="block text-xs font-bold text-slate-500 mb-1">Ansprechpartner</label>
              <input className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-sky-400" value={kundeAnsprechpartner} onChange={(e) => setKundeAnsprechpartner(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Vertrags-Nr.</label>
              <input className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-sky-400" value={vertragNr} onChange={(e) => setVertragNr(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Vertragsdatum (leer = heute)</label>
              <input type="date" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-sky-400" value={vertragsDatum} onChange={(e) => setVertragsDatum(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Laufzeit beginnt am</label>
              <input type="date" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-sky-400" value={laufzeitBeginn} onChange={(e) => setLaufzeitBeginn(e.target.value)} />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2">Paket</p>
            <div className="flex gap-2">
              {(["S", "M", "L"] as const).map((id) => (
                <button key={id} onClick={() => setPaket(id)}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${paket === id ? "bg-sky-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-sky-300"}`}>
                  Paket {id} — {PAKETE[id].preis} €/Monat
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          VERTRAGSTEXT
      ══════════════════════════════════════════════════ */}
      <div className="vertrag max-w-4xl mx-auto px-12 py-16 pt-10">

        {/* Kopfzeile */}
        <div className="flex justify-between items-start mb-12 pt-8">
          <div>
            <p className="text-2xl font-black tracking-tight">
              Bescheid<span className="text-sky-500">Recht</span>
            </p>
            <p className="text-slate-500 text-sm mt-0.5">{ANBIETER.inhaber}</p>
            <p className="text-slate-500 text-sm">{ANBIETER.adresse}</p>
            <p className="text-slate-500 text-sm">{ANBIETER.email}</p>
            <p className="text-slate-500 text-sm">USt-IdNr.: {ANBIETER.steuernummer}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Rahmenvertrag</p>
            <p className="text-xl font-black">{vertragNr}</p>
            <p className="text-slate-400 text-sm mt-1">{vertragsDatum ? new Date(vertragsDatum).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" }) : datum}</p>
          </div>
        </div>

        {/* Titel */}
        <div className="text-center mb-14">
          <div className="h-0.5 bg-slate-200 mb-8" />
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-3">Rahmenvertrag</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            über die Nutzung der Software-as-a-Service-Plattform<br />„BescheidRecht&rdquo;
          </h1>
          <div className="h-0.5 bg-slate-200 mt-8" />
        </div>

        {/* Vertragsparteien */}
        <div className="grid grid-cols-2 gap-10 mb-14 text-sm">
          <div className="bg-slate-50 rounded-xl p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Auftragnehmer (AN)</p>
            <p className="font-black text-slate-900">{ANBIETER.name}</p>
            <p className="text-slate-600 mt-1">{ANBIETER.inhaber}</p>
            <p className="text-slate-600">{ANBIETER.adresse}</p>
            <p className="text-slate-600">{ANBIETER.email}</p>
            <p className="text-slate-600">USt-IdNr.: {ANBIETER.steuernummer}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Auftraggeber (AG)</p>
            <p className="font-black text-slate-900">{kundeOrg}</p>
            <p className="text-slate-600 mt-1">{kundeAdresse}</p>
            <p className="text-slate-600">vertreten durch: {kundeVertreter}</p>
            <p className="text-slate-600">Ansprechpartner: {kundeAnsprechpartner}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-12 leading-relaxed">
          Die vorgenannten Parteien (zusammen: „Parteien&rdquo;, einzeln: „Partei&rdquo;) schließen folgenden
          Rahmenvertrag über die Bereitstellung und Nutzung der Software-as-a-Service-Plattform
          „BescheidRecht&rdquo; (nachfolgend: „Plattform&rdquo; oder „Software&rdquo;) ab:
        </p>

        {/* § 1 */}
        <div className="paragraf">
          <h3>§ 1 Vertragsgegenstand</h3>
          <ol className="vertragslist">
            <li>Der AN stellt dem AG die Plattform &bdquo;BescheidRecht&rdquo; als Software-as-a-Service (SaaS)
              über das Internet zur Verfügung. Die Plattform ermöglicht die KI-gestützte Analyse
              von Behördenbescheiden, die automatische Identifikation von Fehlertypen sowie die
              Generierung von Musterschreiben-Vorlagen.</li>
            <li>Die Plattform ist kein Ersatz für Rechtsberatung im Sinne des § 3 RDG
              (Rechtsdienstleistungsgesetz). Sie ist ein professionelles Analyse- und Schreibwerkzeug
              gemäß § 2 Abs. 1 RDG. Die fachliche Einschätzung und rechtliche Verantwortung
              verbleiben bei den Mitarbeitenden des AG.</li>
            <li>Gegenstand dieses Vertrages ist ausschließlich die Nutzungsüberlassung der Plattform.
              Individuelle Softwareentwicklung oder Anpassungen sind nicht Vertragsbestandteil,
              soweit nicht gesondert schriftlich vereinbart.</li>
          </ol>
        </div>

        {/* § 2 */}
        <div className="paragraf">
          <h3>§ 2 Leistungsumfang</h3>
          <ol className="vertragslist">
            <li>Der AG erhält im Rahmen von <strong>Paket {paket}</strong> Zugang zur Plattform
              mit folgenden Konditionen:
              <ul className="mt-2 ml-4 space-y-1 text-slate-600">
                <li>— Nutzer-Zugänge: bis zu <strong>{p.nutzer} gleichzeitig aktive Accounts</strong></li>
                <li>— Analysen: <strong>{p.analysen} Bescheidanalysen pro Kalendermonat</strong></li>
                <li>— Verfügbarkeit (SLA): <strong>{p.sla}</strong> (monatlich gemessen, exkl. angekündigte Wartungsfenster)</li>
              </ul>
            </li>
            <li>Im Leistungsumfang enthalten sind: Bescheid-Upload (PDF/Scan), automatische
              Pseudonymisierung personenbezogener Daten, KI-Analyse auf Basis von 130+ dokumentierten
              Fehlertypen in 16 Rechtsgebieten (SGB II–XII, BAMF, BAföG, Wohngeld u.a.),
              Musterschreiben-Generator (DIN A4 PDF) sowie ein Fristen-Dashboard.</li>
            <li>Der AN ist berechtigt, die Plattform weiterzuentwickeln und Funktionen zu ändern,
              sofern der vereinbarte Leistungsumfang nicht wesentlich verschlechtert wird. Der AG
              wird über wesentliche Änderungen mit einer Vorlaufzeit von mindestens 4 Wochen informiert.</li>
            <li>Wartungsfenster werden dem AG mindestens 48 Stunden im Voraus per E-Mail angekündigt.
              Geplante Wartungszeiten zählen nicht als Ausfallzeit im Sinne der SLA.</li>
          </ol>
        </div>

        {/* § 3 */}
        <div className="paragraf">
          <h3>§ 3 Nutzungsrechte</h3>
          <ol className="vertragslist">
            <li>Der AN räumt dem AG für die Laufzeit dieses Vertrages ein einfaches, nicht
              übertragbares, nicht unterlizenzierbares Recht zur Nutzung der Plattform im Rahmen
              seiner eigenen Beratungstätigkeit ein.</li>
            <li>Die Nutzung der Plattform ist ausschließlich dem AG und seinen Mitarbeitenden
              gestattet. Eine Weitergabe von Zugangsdaten an Dritte oder eine Nutzung für Dritte
              (z.B. externe Klienten ohne Aufsicht) ist nicht gestattet.</li>
            <li>Der AG darf die Plattform nicht dekompilieren, disassemblieren oder anderweitig
              rückentwickeln.</li>
          </ol>
        </div>

        {/* § 4 */}
        <div className="paragraf">
          <h3>§ 4 Vergütung und Zahlungsbedingungen</h3>
          <ol className="vertragslist">
            <li>Die monatliche Lizenzgebühr beträgt <strong>{p.preis} € netto zzgl. der gesetzlichen
              Mehrwertsteuer</strong>. Die Abrechnung erfolgt monatlich im Voraus.</li>
            <li>Bei jährlicher Vorauszahlung gewährt der AN einen Rabatt von <strong>10 %</strong>
              auf den Jahresbetrag (= {jahresnetto} € netto für 12 Monate).</li>
            <li>Rechnungen sind innerhalb von <strong>14 Tagen</strong> ohne Abzug zur Zahlung
              fällig. Bei Zahlungsverzug gilt der gesetzliche Verzugszinssatz gemäß § 288 BGB.</li>
            <li>Der AN ist berechtigt, die Lizenzgebühren einmal jährlich um bis zu <strong>5 %</strong>
              anzupassen. Die Anpassung wird dem AG mindestens 6 Wochen vor Wirksamwerden
              schriftlich mitgeteilt. Bei einer Erhöhung über 5 % hat der AG ein
              Sonderkündigungsrecht mit einer Frist von 4 Wochen.</li>
            <li>Ein einmaliges Onboarding-Entgelt in Höhe von
              {paket === "S" ? " 1.500 €" : paket === "M" ? " 2.500 €" : " 4.500 €"} netto
              zzgl. MwSt. wird mit der ersten Rechnung fällig.</li>
          </ol>
        </div>

        {/* Seitenumbruch */}
        <div className="pagebreak" />

        {/* § 5 */}
        <div className="paragraf pt-8">
          <h3>§ 5 Laufzeit und Kündigung</h3>
          <ol className="vertragslist">
            <li>Der Vertrag wird für eine <strong>Mindestlaufzeit von 12 Monaten</strong> ab
              {laufzeitBeginn
                ? ` dem ${new Date(laufzeitBeginn).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}`
                : " dem vereinbarten Leistungsbeginn"} geschlossen.</li>
            <li>Nach Ablauf der Mindestlaufzeit verlängert sich der Vertrag automatisch um jeweils
              12 Monate, sofern er nicht von einer Partei mit einer Frist von <strong>3 Monaten
              zum jeweiligen Vertragsende</strong> schriftlich gekündigt wird.</li>
            <li>Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
              Ein wichtiger Grund liegt insbesondere vor, wenn eine Partei wesentliche
              Vertragspflichten verletzt und die Verletzung trotz schriftlicher Abmahnung mit
              einer Frist von 14 Tagen nicht behebt.</li>
            <li>Im Falle der Kündigung werden bereits gezahlte Lizenzgebühren für den
              ungenutzten Zeitraum anteilig erstattet, sofern der AN die Kündigung zu vertreten
              hat.</li>
          </ol>
        </div>

        {/* § 6 */}
        <div className="paragraf">
          <h3>§ 6 Datenschutz und Datensicherheit</h3>
          <ol className="vertragslist">
            <li>Die Parteien verarbeiten personenbezogene Daten im Zusammenhang mit diesem Vertrag
              gemäß den geltenden datenschutzrechtlichen Bestimmungen, insbesondere der
              Datenschutz-Grundverordnung (DSGVO) und dem Bundesdatenschutzgesetz (BDSG).</li>
            <li>Der AN schließt mit dem AG einen gesonderten
              <strong> Auftragsverarbeitungsvertrag (AV-Vertrag)</strong> gemäß Art. 28 DSGVO ab,
              der Bestandteil dieses Rahmenvertrages wird. Der AV-Vertrag wird spätestens mit
              Vertragsbeginn unterzeichnet.</li>
            <li>Die Plattform pseudonymisiert alle personenbezogenen Daten (Namen, Geburtsdaten,
              IBAN, Adressen, Steuer-IDs etc.) automatisch vor der KI-Verarbeitung
              (Privacy by Design gemäß Art. 25 DSGVO). Der KI-Anbieter erhält keine
              identifizierenden Daten.</li>
            <li>Der AN speichert hochgeladene Dokumente nur für die Dauer der Analyse und löscht
              diese unmittelbar danach. Analyseergebnisse werden im Account des AG gespeichert
              und können jederzeit vom AG gelöscht werden.</li>
            <li>Im Falle eines Datenschutzvorfalls informiert der AN den AG unverzüglich,
              spätestens innerhalb von 72 Stunden nach Bekanntwerden des Vorfalls.</li>
          </ol>
        </div>

        {/* § 7 */}
        <div className="paragraf">
          <h3>§ 7 Pflichten des Auftraggebers</h3>
          <ol className="vertragslist">
            <li>Der AG verpflichtet sich, die Zugangsdaten sicher aufzubewahren und nicht an
              Unbefugte weiterzugeben. Der AG haftet für Schäden, die durch unsachgemäße
              Weitergabe von Zugangsdaten entstehen.</li>
            <li>Der AG stellt sicher, dass nur Mitarbeitende Zugang zur Plattform erhalten,
              die über die notwendige Fachkenntnis verfügen und in der Nutzung eingewiesen wurden.</li>
            <li>Der AG ist verpflichtet, den AN unverzüglich zu informieren, wenn er Kenntnis
              von einer missbräuchlichen Nutzung der Plattform oder einem Sicherheitsvorfall
              erlangt.</li>
            <li>Der AG stellt sicher, dass die durch die Plattform generierten Schreiben-Entwürfe
              vor dem Versand durch eine Fachkraft inhaltlich geprüft werden.</li>
          </ol>
        </div>

        {/* § 8 */}
        <div className="paragraf">
          <h3>§ 8 Haftung</h3>
          <ol className="vertragslist">
            <li>Der AN haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers
              oder der Gesundheit sowie für vorsätzliches oder grob fahrlässiges Verhalten.</li>
            <li>Für leichte Fahrlässigkeit haftet der AN nur bei Verletzung einer wesentlichen
              Vertragspflicht (Kardinalpflicht) und der Höhe nach begrenzt auf den vertragstypisch
              vorhersehbaren Schaden, maximal jedoch auf die im jeweiligen Vertragsjahr
              gezahlten Netto-Lizenzgebühren.</li>
            <li>Der AN haftet nicht für Schäden, die daraus resultieren, dass der AG generierte
              Schreiben-Entwürfe ohne vorherige fachliche Prüfung versendet, oder dass
              KI-Ausgaben als rechtliche Beratung verstanden werden.</li>
            <li>Die Haftung für mittelbare Schäden, Folgeschäden und entgangenen Gewinn ist
              ausgeschlossen, soweit gesetzlich zulässig.</li>
          </ol>
        </div>

        {/* § 9 */}
        <div className="paragraf">
          <h3>§ 9 Vertraulichkeit</h3>
          <ol className="vertragslist">
            <li>Beide Parteien verpflichten sich, alle im Rahmen dieses Vertrages erlangten
              vertraulichen Informationen der jeweils anderen Partei (insbesondere technische,
              kaufmännische und personenbezogene Informationen) streng vertraulich zu behandeln
              und nicht an Dritte weiterzugeben.</li>
            <li>Diese Verpflichtung gilt nicht für Informationen, die allgemein bekannt sind
              oder werden, ohne dass dies auf einer Verletzung dieser Vertraulichkeitspflicht
              beruht.</li>
            <li>Die Vertraulichkeitspflicht besteht über das Ende des Vertrages hinaus für
              einen Zeitraum von <strong>3 Jahren</strong>.</li>
          </ol>
        </div>

        {/* § 10 */}
        <div className="paragraf">
          <h3>§ 10 Schlussbestimmungen</h3>
          <ol className="vertragslist">
            <li>Dieser Vertrag unterliegt dem Recht der Bundesrepublik Deutschland unter
              Ausschluss des UN-Kaufrechts (CISG).</li>
            <li>Ausschließlicher Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang
              mit diesem Vertrag ist <strong>{ANBIETER.gerichtsstand}</strong>, soweit gesetzlich zulässig.</li>
            <li>Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform.
              Dies gilt auch für die Aufhebung des Schriftformerfordernisses.</li>
            <li>Sollten einzelne Bestimmungen dieses Vertrages unwirksam oder undurchführbar sein
              oder werden, so bleibt die Wirksamkeit des Vertrages im Übrigen unberührt
              (Salvatorische Klausel). Die Parteien verpflichten sich, die unwirksame Bestimmung
              durch eine wirksame Regelung zu ersetzen, die dem wirtschaftlichen Zweck der
              unwirksamen Bestimmung am nächsten kommt.</li>
            <li>Dieser Vertrag einschließlich seiner Anlagen stellt die vollständige Vereinbarung
              der Parteien zu seinem Gegenstand dar und ersetzt alle vorherigen mündlichen oder
              schriftlichen Vereinbarungen.</li>
            <li><strong>Anlagen:</strong> Anlage 1 — Leistungsbeschreibung & SLA-Definition;
              Anlage 2 — Auftragsverarbeitungsvertrag (AV-Vertrag) gemäß Art. 28 DSGVO</li>
          </ol>
        </div>

        {/* Unterschrift */}
        <div className="mt-14 mb-10">
          <div className="h-px bg-slate-200 mb-10" />
          <p className="text-sm font-bold text-slate-700 mb-8">
            Durch ihre Unterschriften bestätigen die Parteien, diesen Vertrag gelesen, verstanden
            und akzeptiert zu haben.
          </p>
          <div className="grid grid-cols-2 gap-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Auftraggeber</p>
              <div className="border-b-2 border-slate-800 h-14 mb-2" />
              <p className="text-xs text-slate-500 font-bold">{kundeOrg}</p>
              <p className="text-xs text-slate-400 mt-0.5">{kundeVertreter}</p>
              <p className="text-xs text-slate-400 mt-3">Ort, Datum</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Auftragnehmer</p>
              <div className="border-b-2 border-slate-800 h-14 mb-2" />
              <p className="text-xs text-slate-500 font-bold">BescheidRecht</p>
              <p className="text-xs text-slate-400 mt-0.5">{ANBIETER.inhaber}</p>
              <p className="text-xs text-slate-400 mt-3">Ort, Datum</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-6 flex justify-between items-center">
          <p className="text-xs text-slate-300 font-bold">{vertragNr} · Stand {datum}</p>
          <p className="text-xs text-slate-300 font-bold">{ANBIETER.web}</p>
        </div>

        {/* Links zu Anlagen (nur Browser) */}
        <div className="no-print mt-10 flex gap-3 mb-6">
          <Link href="/rahmenvertrag/anlage-1" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-sky-500 text-white hover:bg-sky-400 transition-colors">
            Anlage 1: Leistungsbeschreibung &amp; SLA
          </Link>
          <Link href="/rahmenvertrag/anlage-2" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-sky-500 text-white hover:bg-sky-400 transition-colors">
            Anlage 2: AV-Vertrag (Art. 28 DSGVO)
          </Link>
        </div>

        {/* Hinweis (nur Browser) */}
        <div className="no-print mt-4 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-xs font-bold text-amber-700 mb-1">Rechtlicher Hinweis</p>
          <p className="text-xs text-amber-600 leading-relaxed">
            Diese Vorlage ist ein Ausgangsdokument und ersetzt keine anwaltliche Beratung.
            Für Verträge mit großen Organisationen (Caritas, AWO etc.) empfiehlt sich eine einmalige
            Prüfung durch einen auf IT-Recht spezialisierten Anwalt (~200–500 €). Das schützt Sie
            bei Streitfällen und erhöht die Seriosität gegenüber dem Kunden deutlich.
          </p>
        </div>
      </div>
    </div>
  );
}
