import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Eye,
  Trash2,
  Lock,
  FileText,
  BarChart3,
  ChevronDown,
  ArrowRight,
  Building2,
  CalendarDays,
  Users,
  Clock,
  Shield,
  Zap,
} from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RoiCalculator } from "@/components/RoiCalculator";
import ScrollReveal from "@/components/ScrollReveal";
import { B2BThemeInit } from "@/components/B2BThemeInit";

export const metadata: Metadata = {
  title: "BescheidRecht für Einrichtungen — KI-Bescheidanalyse für Sozialberatung",
  description:
    "Behördenbescheide schnell prüfen statt manuell recherchieren. KI-gestützte Analyse für Sozialarbeiter, Schuldnerberatungen und Wohlfahrtsverbände. 16 Rechtsgebiete, DSGVO-konform.",
};

const DEMO_MAILTO =
  "mailto:info@bescheidrecht.de?subject=Demo-Anfrage%20B2B&body=Guten%20Tag%2C%0A%0Aich%20interessiere%20mich%20f%C3%BCr%20eine%20Demo%20von%20BescheidRecht%20f%C3%BCr%20unsere%20Einrichtung.%0A%0AOrganisation%3A%20%0AAnzahl%20Berater%3A%20%0A%0AMit%20freundlichen%20Gr%C3%BC%C3%9Fen";

const TRAEGER = [
  "Jobcenter / SGB II",
  "Rentenversicherung",
  "Krankenkassen",
  "Pflegekasse",
  "Familienkasse",
  "BAMF",
  "BAföG-Amt",
  "Sozialhilfe / Grundsicherung",
  "Jugendamt",
  "Eingliederungshilfe",
  "Unfallversicherung",
  "Versorgungsamt",
  "Wohngeld",
  "Elterngeld",
  "Unterhaltsvorschuss",
  "Agentur für Arbeit / SGB III",
];

const TARIFE = [
  {
    name: "Starter",
    analysen: "100",
    preis: "299",
    zeitraum: "/ Monat",
    ideal: "Einzelne Beratungsstelle",
    features: [
      "100 Bescheid-Analysen",
      "Widerspruchsschreiben-Generator",
      "Fristen-Dashboard",
      "E-Mail-Support",
    ],
  },
  {
    name: "Team",
    analysen: "400",
    preis: "599",
    zeitraum: "/ Monat",
    ideal: "Kreisverband / Regionalstelle",
    highlight: true,
    features: [
      "400 Bescheid-Analysen",
      "Alle Starter-Features",
      "Prioritäts-Support",
      "Nutzungsstatistiken",
    ],
  },
  {
    name: "Einrichtung",
    analysen: "1.000",
    preis: "999",
    zeitraum: "/ Monat",
    ideal: "Landes-/Bundesverband",
    features: [
      "1.000 Bescheid-Analysen",
      "Alle Team-Features",
      "Persönlicher Ansprechpartner",
      "Individuelles Angebot & SLA",
    ],
  },
];

const SCHRITTE = [
  {
    step: "01",
    Icon: FileText,
    title: "Bescheid hochladen",
    desc: "PDF oder Foto des Bescheids hochladen. Die integrierte OCR erkennt den Text automatisch — auch bei Scans.",
  },
  {
    step: "02",
    Icon: Zap,
    title: "KI analysiert",
    desc: "Unsere KI prüft den Bescheid gegen 130+ bekannte Fehlertypen in 16 Rechtsgebieten. Personenbezogene Daten werden vorher automatisch pseudonymisiert.",
  },
  {
    step: "03",
    Icon: BarChart3,
    title: "Ergebnis & Schreiben",
    desc: "Identifizierte Fehler mit Rechtsgrundlage, Severity-Einstufung, fertiges Widerspruchsschreiben und automatische Fristberechnung.",
  },
];

const DATENSCHUTZ_ITEMS = [
  {
    Icon: ShieldCheck,
    title: "Automatische Pseudonymisierung",
    desc: "Namen, IBAN, Geburtsdaten, Adressen, Steuer-ID — alle personenbezogenen Daten werden vor der KI-Analyse durch Platzhalter ersetzt.",
  },
  {
    Icon: Eye,
    title: "Lokale OCR-Verarbeitung",
    desc: "Texterkennung läuft primär lokal auf dem Server. Bilddaten verlassen den Server nicht.",
  },
  {
    Icon: Trash2,
    title: "Keine dauerhafte Speicherung",
    desc: "Der KI-Anbieter speichert keine Daten. Nach der Analyse werden die Daten gelöscht.",
  },
  {
    Icon: Lock,
    title: "DSGVO-konform",
    desc: "Verschlüsselte Übertragung. Supabase Auth mit Row Level Security. Pseudonymisierung vor jeder KI-Verarbeitung.",
  },
];

const ANWENDUNGSFAELLE = [
  {
    Icon: Users,
    title: "Schuldnerberatung",
    desc: "10–15 Bescheide täglich prüfen, Fristen tracken und Widersprüche vorbereiten — alles in einem Tool.",
  },
  {
    Icon: Clock,
    title: "Teamleitung",
    desc: "Zentrales Fristen-Dashboard für alle Berater. Keine 30-Tage-Frist läuft mehr unbemerkt ab.",
  },
  {
    Icon: Shield,
    title: "Qualitätssicherung",
    desc: "Einheitliche Prüfstandards über alle Rechtsgebiete — von Grundsicherungsgeld bis Pflegegrad.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Wie schnell ist BescheidRecht einsatzbereit?",
    a: "Sofort. Kein IT-Projekt, keine Installation. Nach der Demo und Vertragsabschluss erhalten Ihre Berater innerhalb von 24 Stunden Zugangsdaten und können direkt loslegen.",
  },
  {
    q: "Können mehrere Berater gleichzeitig die Plattform nutzen?",
    a: "Ja. Jeder Berater erhält einen eigenen Zugang. Die Analyse-Credits werden gemeinschaftlich genutzt und im Dashboard getrackt.",
  },
  {
    q: "Was passiert mit den hochgeladenen Bescheiddaten?",
    a: "Alle personenbezogenen Daten (Namen, IBAN, Geburtsdaten etc.) werden automatisch pseudonymisiert, bevor sie die KI sieht. Der KI-Anbieter speichert keine Daten. Nach der Analyse werden Dokumente auf unseren Servern gelöscht.",
  },
  {
    q: "Ersetzt BescheidRecht eine rechtliche Beratung (§ 2 RDG)?",
    a: "Nein. BescheidRecht ist ein professionelles Analyse- und Schreibwerkzeug — kein Ersatz für Rechtsberatung. Das Tool unterstützt Ihre Berater bei der Prüfung und Dokumentation, die fachliche Einschätzung liegt weiterhin bei Ihnen. Alle Ausgaben enthalten einen entsprechenden Disclaimer.",
  },
  {
    q: "Gibt es eine Mindestvertragslaufzeit?",
    a: "Nein. Alle Tarife sind monatlich kündbar. Es gibt keine Einrichtungsgebühr und keinen Lock-in.",
  },
  {
    q: "Kann BescheidRecht in bestehende Systeme integriert werden?",
    a: "BescheidRecht steht aktuell als eigenständige Web-Plattform zur Verfügung. Eine API-Schnittstelle für die Integration in bestehende Fallverwaltungssysteme ist für den Enterprise-Bereich in Planung. Bei konkretem Bedarf sprechen Sie uns gerne an.",
  },
  {
    q: "Gibt es einen Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO?",
    a: "Ja. Als Auftragsverarbeiter stellen wir für alle B2B-Kunden einen standardisierten AVV gemäß Art. 28 DSGVO bereit. Dieser ist online abrufbar und auf Wunsch auch als unterzeichnetes Dokument erhältlich. Alle technischen und organisatorischen Maßnahmen (TOMs) sind darin dokumentiert.",
  },
];

const PROBLEM_ITEMS = [
  "Viele Behördenbescheide enthalten formelle oder inhaltliche Fehler",
  "Manuelle Prüfung kostet wertvolle Beratungszeit",
  "Sozialarbeiter haben zu wenig Zeit für zu viele Fälle",
  "Klienten verlieren Ansprüche, weil Fristen verstreichen",
  "Kein spezialisiertes Tool am Markt verfügbar",
];

const LOESUNG_ITEMS = [
  "Bescheid hochladen — Analyse in wenigen Minuten",
  "Fehler werden mit Rechtsgrundlage identifiziert",
  "Widerspruchsschreiben wird automatisch generiert",
  "Fristen werden erkannt und im Dashboard getrackt",
  "Sofort einsatzbereit — kein IT-Projekt nötig",
];

export default function B2BPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] overflow-x-hidden pb-20 sm:pb-0">
      <B2BThemeInit />

      {/* ── Nav ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full bg-[var(--bg)]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center px-4 sm:px-6 py-4 sm:py-5 max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-white font-black text-lg sm:text-xl tracking-tight hover:opacity-90 transition-opacity"
          >
            BESCHEID<span className="text-[var(--accent)]">RECHT</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/45">
            <a href="#so-funktioniert-es" className="hover:text-white transition-colors">
              So funktioniert es
            </a>
            <a href="#tarife" className="hover:text-white transition-colors">
              Tarife
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>
          <div className="flex gap-3 sm:gap-4 items-center">
            <ThemeToggle />
            <Link href="/" className="hidden sm:inline-flex text-sm font-medium text-white/45 hover:text-white transition-colors">
              Startseite
            </Link>
            <a
              href={DEMO_MAILTO}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/20"
            >
              <CalendarDays className="h-4 w-4" />
              Demo anfragen
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[var(--accent)]/[0.06] rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--accent)]/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-28 pb-14 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/[0.06] mb-8">
            <Building2 className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[var(--accent)]">
              Für Sozialeinrichtungen & Beratungsstellen
            </span>
          </div>

          <h1 className="text-[2.2rem] sm:text-5xl lg:text-[4rem] font-black tracking-tight leading-[1.06] mb-6">
            <span className="block text-white">Behördenbescheide prüfen.</span>
            <span className="block mt-2 bg-gradient-to-r from-[var(--accent)] via-sky-300 to-[var(--accent)] bg-clip-text text-transparent">
              In Minuten statt Stunden.
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-white/45 max-w-2xl mx-auto mb-10 leading-relaxed">
            KI-gestützte Bescheidanalyse für Sozialarbeiter, Schuldnerberatungen und
            Wohlfahrtsverbände. 16 Rechtsgebiete. DSGVO-konform. Sofort einsatzbereit.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-14">
            <a
              href={DEMO_MAILTO}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl transition-all text-[15px] shadow-lg shadow-blue-600/20 hover:shadow-blue-600/35 hover:-translate-y-0.5"
            >
              <CalendarDays className="h-5 w-5" />
              Kostenlose Demo vereinbaren
            </a>
            <a
              href="#so-funktioniert-es"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/10 hover:border-white/25 text-white/60 hover:text-white font-bold rounded-xl transition-all text-[15px]"
            >
              So funktioniert es
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Stat-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {[
              { value: "16", label: "Rechtsgebiete" },
              { value: "130+", label: "Fehlertypen" },
              { value: "Minuten", label: "Analysezeit" },
              { value: "DSGVO", label: "Konform" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4"
              >
                <p className="text-xl sm:text-2xl font-black text-[var(--accent)]">{s.value}</p>
                <p className="text-xs text-white/30 mt-0.5 uppercase tracking-widest">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── "Genutzt von" Bar ────────────────────────── */}
      <ScrollReveal>
      <section className="border-y border-white/5 py-7 sm:py-9">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-white/20 mb-6">
            Für Einrichtungen wie
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
            {[
              "Schuldnerberatungen",
              "Wohlfahrtsverbände",
              "Sozialberatungsstellen",
              "Migrationsdienste",
              "Jobcenter-Beratung",
              "Jugendämter",
              "Pflegeberatung",
            ].map((t) => (
              <span
                key={t}
                className="px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-full text-sm text-white/38"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ── Problem / Lösung ─────────────────────────── */}
      <ScrollReveal>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-24">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-red-500/[0.04] border border-red-500/15 rounded-2xl p-6 sm:p-8 lg:p-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-400/80 mb-6">
              Das Problem heute
            </h2>
            <ul className="space-y-4">
              {PROBLEM_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <XCircle className="h-4 w-4 text-red-500/60 mt-0.5 flex-shrink-0" />
                  <span className="text-white/55 text-[14px] sm:text-[15px] leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[var(--accent)]/[0.04] border border-[var(--accent)]/15 rounded-2xl p-6 sm:p-8 lg:p-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]/80 mb-6">
              Die Lösung: BescheidRecht
            </h2>
            <ul className="space-y-4">
              {LOESUNG_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white/55 text-[14px] sm:text-[15px] leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ── So funktioniert es ───────────────────────── */}
      <ScrollReveal>
      <section id="so-funktioniert-es" className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
          Workflow
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-center mb-4">
          3 Schritte zur Bescheidprüfung
        </h2>
        <p className="text-center text-white/35 mb-14 sm:mb-20 text-[14px] sm:text-[15px]">
          Vom Upload bis zum fertigen Widerspruchsschreiben.
        </p>
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 relative">
          {/* Dashed connector line (desktop) */}
          <div className="hidden md:block absolute top-9 left-[calc(33.333%+8px)] right-[calc(33.333%+8px)] h-px border-t border-dashed border-white/10 pointer-events-none" />
          {SCHRITTE.map((item) => (
            <div
              key={item.step}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-[var(--accent)]/25 hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-8 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-xs font-black text-[var(--accent)] flex-shrink-0">
                  {item.step}
                </span>
                <item.Icon className="h-4 w-4 text-[var(--accent)]/50" />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-3">{item.title}</h3>
              <p className="text-white/40 text-sm sm:text-[14px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      </ScrollReveal>

      {/* ── Rechtsgebiete ────────────────────────────── */}
      <ScrollReveal>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
          Abdeckung
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-center mb-4">
          16 Rechtsgebiete abgedeckt
        </h2>
        <p className="text-center text-white/35 mb-10 sm:mb-12 text-[14px] sm:text-[15px]">
          Von Grundsicherungsgeld über Pflegegrad bis BAföG — ein Tool für alle Bescheide.
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-3xl mx-auto">
          {TRAEGER.map((t) => (
            <span
              key={t}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/[0.04] border border-white/10 rounded-full text-sm text-white/50 hover:border-[var(--accent)]/30 hover:text-white/70 transition-colors"
            >
              {t}
            </span>
          ))}
        </div>
      </section>
      </ScrollReveal>

      {/* ── Anwendungsfaelle ─────────────────────────────── */}
      <ScrollReveal>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
          Einsatzbereiche
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-center mb-14 sm:mb-16">
          Wo BescheidRecht den Unterschied macht
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {ANWENDUNGSFAELLE.map((item) => (
            <div
              key={item.title}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-4 hover:border-white/20 transition-colors"
            >
              <item.Icon className="h-6 w-6 text-[var(--accent)]" aria-hidden />
              <h3 className="font-bold text-base uppercase tracking-wider text-white/90">{item.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      </ScrollReveal>

      {/* ── Interaktiver ROI-Rechner ──────────────────── */}
      <ScrollReveal>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-24">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
            ROI-Rechner
          </p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-center mb-3">
            Was bringt BescheidRecht Ihrer Einrichtung?
          </h2>
          <p className="text-center text-white/35 mb-10 sm:mb-12 text-[14px]">
            Stellen Sie Ihren Anwendungsfall ein und berechnen Sie Ihren konkreten Nutzen.
          </p>
          <RoiCalculator />
        </div>
      </section>
      </ScrollReveal>

      {/* ── Vergleich ────────────────────────────────── */}
      <ScrollReveal>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
          Wettbewerbsvergleich
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-center mb-14 sm:mb-16">
          Warum BescheidRecht?
        </h2>
        <div className="-mx-4 sm:mx-0 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm sm:text-[14px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 pr-4 pl-4 sm:pl-0 text-white/40 font-bold text-xs uppercase tracking-widest">
                  Kriterium
                </th>
                <th className="py-4 px-4 text-white/40 font-bold text-xs uppercase tracking-widest">
                  Manuell
                </th>
                <th className="py-4 px-4 text-white/40 font-bold text-xs uppercase tracking-widest">
                  Andere Tools
                </th>
                <th className="py-4 px-4 text-[var(--accent)] font-bold text-xs uppercase tracking-widest">
                  BescheidRecht
                </th>
              </tr>
            </thead>
            <tbody className="text-white/50">
              {[
                ["Zeitaufwand", "15–30 Min.", "10–20 Min.", "Wenige Minuten"],
                ["Rechtsgebiete", "Je nach Expertise", "1–3 Gebiete", "16 Rechtsgebiete"],
                ["Widerspruchsschreiben", "Manuell erstellen", "Nicht enthalten", "Automatisch generiert"],
                ["Fristüberwachung", "Kalender / Excel", "Nicht enthalten", "Automatisches Dashboard"],
                ["Fehlertypen-Datenbank", "Im Kopf", "Keine", "130+ dokumentierte Fehler"],
                ["DSGVO / Pseudonymisierung", "Manuell", "Teilweise", "Automatisch, vollständig"],
              ].map(([label, manual, andere, br]) => (
                <tr key={label} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pr-4 pl-4 sm:pl-0 font-medium text-white/60">{label}</td>
                  <td className="py-4 px-4">{manual}</td>
                  <td className="py-4 px-4">{andere}</td>
                  <td className="py-4 px-4 text-[var(--accent)] font-bold">{br}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </ScrollReveal>

      {/* ── Datenschutz ──────────────────────────────── */}
      <ScrollReveal>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-24">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
            Datenschutz
          </p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-center">
            Sicherheit für sensible Sozialdaten
          </h2>
          <p className="text-center text-white/35 mb-10 text-[14px]">
            Behördliche Bescheide enthalten hochsensible Daten. Wir nehmen das ernst.
          </p>
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 max-w-3xl mx-auto">
            {DATENSCHUTZ_ITEMS.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                  <item.Icon className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-[14px] sm:text-[15px] mb-1">{item.title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ── Tarife ───────────────────────────────────── */}
      <ScrollReveal>
      <section id="tarife" className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
          Preise
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-center mb-3 sm:mb-4">
          Tarife für Einrichtungen
        </h2>
        <p className="text-center text-white/35 mb-2 text-[14px] sm:text-[15px]">
          Keine Einrichtungsgebühr. Monatlich kündbar.
        </p>
        <p className="text-center text-white/20 mb-12 sm:mb-16 text-sm">
          Alle Preise netto zzgl. 19 % MwSt.
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          {TARIFE.map((tarif) => (
            <div
              key={tarif.name}
              className={`rounded-2xl p-6 sm:p-8 flex flex-col transition-all ${
                tarif.highlight
                  ? "bg-[var(--accent)]/[0.07] border-2 border-[var(--accent)]/35 shadow-xl shadow-blue-600/5"
                  : "bg-white/[0.03] border border-white/10 hover:border-white/20"
              }`}
            >
              {tarif.highlight && (
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-2">
                  Empfohlen
                </span>
              )}
              <h3 className="text-lg sm:text-xl font-bold">{tarif.name}</h3>
              <p className="text-white/35 text-sm mt-1 mb-5">{tarif.ideal}</p>
              <div className="mb-6">
                <span className="text-3xl sm:text-4xl font-black">{tarif.preis}</span>
                {tarif.zeitraum && (
                  <span className="text-white/35 text-[14px] sm:text-[15px]"> €{tarif.zeitraum}</span>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {tarif.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-white/55 text-sm sm:text-[14px]">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={`mailto:info@bescheidrecht.de?subject=Anfrage%20B2B%20Tarif%20${tarif.name}`}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm sm:text-[14px] transition-all ${
                  tarif.highlight
                    ? "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-blue-600/20 hover:-translate-y-0.5"
                    : "border border-white/10 hover:border-white/25 text-white/60 hover:text-white"
                }`}
              >
                <CalendarDays className="h-4 w-4" />
                {tarif.name === "Einrichtung" ? "Angebot anfragen" : "Demo anfragen"}
              </a>
            </div>
          ))}
        </div>
      </section>
      </ScrollReveal>

      {/* ── FAQ ──────────────────────────────────────── */}
      <ScrollReveal>
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
          FAQ
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-center mb-14 sm:mb-16">
          Häufige Fragen
        </h2>
        <div className="divide-y divide-white/8">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="group py-1">
              <summary className="flex justify-between items-center py-5 cursor-pointer list-none select-none gap-4">
                <span className="font-bold text-[14px] sm:text-[15px] text-white/85">{item.q}</span>
                <ChevronDown className="h-5 w-5 text-white/30 flex-shrink-0 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="pb-6 text-white/45 text-sm sm:text-[14px] leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
      </ScrollReveal>

      {/* ── Gründer ──────────────────────────────────── */}
      <ScrollReveal>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-24">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-10 text-center">
            Wer steckt dahinter
          </p>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/20 flex items-center justify-center text-xl font-black text-[var(--accent)] flex-shrink-0">
              HB
            </div>
            <div>
              <p className="font-black text-lg sm:text-xl mb-1">Hendrik Berkensträter</p>
              <p className="text-[var(--accent)] text-sm font-medium mb-5">
                Gründer · BescheidRecht
              </p>
              <div className="space-y-3 text-white/55 text-[14px] sm:text-[15px] leading-relaxed">
                <p>
                  Ich kenne das Gefühl aus eigener Erfahrung: Ein Behördenbescheid liegt auf dem Tisch,
                  man versteht kaum was draufsteht — und weiß nicht, ob man sich überhaupt wehren kann.
                  Genau das ist mir passiert. Nach stundenlanger Recherche in Gesetzestexten stellte ich
                  fest: Der Bescheid war fehlerhaft. Ich hatte Recht, und bekam was mir zustand.
                </p>
                <p>
                  Seitdem lässt mich eine Frage nicht los: Wie vielen Menschen fehlt einfach die Zeit,
                  das Wissen oder die Energie, das selbst herauszufinden? BescheidRecht ist meine
                  Antwort. Ein Tool, das ich mir damals selbst gewünscht hätte — und das ich jetzt
                  gebaut habe, damit andere nicht allein durch diesen Dschungel müssen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* ── Final CTA ────────────────────────────────── */}
      <ScrollReveal>
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-28 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[var(--accent)]/[0.05] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-5 sm:mb-6">
            Bereit für die Demo?
          </h2>
          <p className="text-white/40 text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
            10 Minuten Live-Demo mit einem echten Bescheid. Kein Verkaufsgespräch,
            kein Vertrag — einfach sehen wie es funktioniert.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href={DEMO_MAILTO}
              className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-4 sm:py-5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl transition-all text-base sm:text-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-600/35 hover:-translate-y-0.5"
            >
              <CalendarDays className="h-5 w-5" />
              Kostenlose Demo vereinbaren
            </a>
            <a
              href="#tarife"
              className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-5 border border-white/10 hover:border-white/25 text-white/60 hover:text-white font-bold rounded-xl transition-all text-base sm:text-lg"
            >
              Tarife ansehen
            </a>
          </div>
          <p className="text-white/20 text-sm mt-6 tracking-wide">
            Keine Einrichtungsgebühr &nbsp;&middot;&nbsp; Monatlich kündbar &nbsp;&middot;&nbsp;{" "}
            <a href="/avv" className="underline hover:text-white/40 transition-colors">AVV (Art. 28 DSGVO)</a>
          </p>
        </div>
      </section>
      </ScrollReveal>

      <SiteFooter />

      {/* ── Sticky Mobile CTA ────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-[var(--bg)]/95 backdrop-blur-xl border-t border-white/10 p-4">
        <a
          href={DEMO_MAILTO}
          className="flex items-center justify-center gap-2.5 w-full py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-[15px] transition-all shadow-lg shadow-blue-600/20"
        >
          <CalendarDays className="h-5 w-5" />
          Kostenlose Demo vereinbaren
        </a>
      </div>
    </main>
  );
}
