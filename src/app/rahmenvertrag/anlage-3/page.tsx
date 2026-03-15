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

export default function Anlage3Page() {
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
          .tom { max-width: 100%; padding: 2.5cm 2.5cm; }
        }
        @media screen {
          .pagebreak { border-top: 2px dashed #e2e8f0; margin-top: 3rem; padding-top: 3rem; }
        }
        .tom p, .tom li { line-height: 1.7; }
        .paragraf { margin-bottom: 2rem; }
        .paragraf h3 { font-size: 0.95rem; font-weight: 800; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.4rem; }
      `}</style>

      {/* Nav */}
      <nav className="no-print fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <span className="font-black text-slate-900 text-lg">
          Bescheid<span className="text-sky-500">Recht</span>
          <span className="ml-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Anlage 3 &middot; TOM</span>
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
            Anlage konfigurieren &mdash; erscheint nicht im Druck
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Vertrags-Nr. (aus Rahmenvertrag)</label>
              <input className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-sky-400" value={vertragNr} onChange={(e) => setVertragNr(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Dokument */}
      <div className="tom max-w-4xl mx-auto px-12 py-16 pt-10">

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
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Anlage 3</p>
            <p className="text-lg font-black">Technische und organisatorische</p>
            <p className="text-lg font-black">Maßnahmen (TOM)</p>
            <p className="text-slate-400 text-sm mt-1">zum Rahmenvertrag {vertragNr}</p>
          </div>
        </div>

        {/* Titel */}
        <div className="text-center mb-14">
          <div className="h-0.5 bg-slate-200 mb-8" />
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-3">Anlage 3 zum Rahmenvertrag {vertragNr}</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Technische und organisatorische Maßnahmen<br />gemäß Art. 32 DSGVO
          </h1>
          <p className="text-slate-500 text-sm mt-3">Stand: {datum}</p>
          <div className="h-0.5 bg-slate-200 mt-8" />
        </div>

        <p className="text-sm text-slate-600 mb-12 leading-relaxed">
          Diese Anlage beschreibt die technischen und organisatorischen Maßnahmen, die
          BescheidRecht zum Schutz personenbezogener Daten gemäß Art. 32 DSGVO trifft.
          Sie ist Bestandteil des Auftragsverarbeitungsvertrags (Anlage 2) zum
          Rahmenvertrag {vertragNr}.
        </p>

        {/* 1. Vertraulichkeit */}
        <div className="paragraf">
          <h3>1. Vertraulichkeit (Art. 32 Abs. 1 lit. b DSGVO)</h3>

          <p className="text-sm text-slate-600 font-bold mb-3 mt-4">1.1 Zutrittskontrolle</p>
          <p className="text-sm text-slate-500 italic mb-2">Maßnahmen, die verhindern, dass Unbefugte Zutritt zu Datenverarbeitungsanlagen erhalten.</p>
          <table className="w-full text-sm border-collapse mb-6">
            <tbody>
              {[
                ["Infrastruktur", "Cloud-only — kein eigenes physisches Rechenzentrum. Alle Systeme laufen auf Vercel (Edge Network) und Supabase (AWS EU/Frankfurt)."],
                ["Rechenzentren", "Vercel: SOC 2 Type II zertifiziert, ISO 27001. Supabase/AWS: SOC 2, ISO 27001, biometrische Zutrittskontrolle, 24/7-Überwachung."],
                ["Lokaler Arbeitsplatz", "Verschlüsselte Festplatte (LUKS/FileVault). Bildschirmsperre bei Inaktivität. Zugang nur über passwortgeschütztes Benutzerkonto."],
              ].map(([label, wert]) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-bold text-slate-900 w-44 align-top">{label}</td>
                  <td className="py-2.5 text-slate-600">{wert}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-sm text-slate-600 font-bold mb-3">1.2 Zugangskontrolle</p>
          <p className="text-sm text-slate-500 italic mb-2">Maßnahmen, die verhindern, dass Unbefugte Datenverarbeitungssysteme nutzen können.</p>
          <table className="w-full text-sm border-collapse mb-6">
            <tbody>
              {[
                ["Authentifizierung", "Supabase Auth mit bcrypt-Passwort-Hashing (Kostenfaktor 10). JWT-basierte Session-Verwaltung mit automatischem Token-Refresh."],
                ["Zugang Infrastruktur", "Vercel, Supabase, GitHub: Zugang nur über persönliche Accounts mit 2-Faktor-Authentifizierung (TOTP/WebAuthn)."],
                ["API-Schlüssel", "Alle API-Keys (Anthropic, OpenAI, Mollie, Sentry) in Environment-Variablen gespeichert, nicht im Quellcode. Rotation bei Verdacht auf Kompromittierung."],
                ["Admin-Zugang", "Dual-Auth: ADMIN_SECRET (Bearer Token) oder Supabase JWT + ADMIN_EMAILS-Whitelist. Kein öffentlicher Admin-Zugang."],
                ["Rate-Limiting", "Globales Rate-Limiting über Upstash Redis (persistiert über Serverless-Instanzen). Schützt alle kritischen Endpunkte vor Brute-Force und Denial-of-Service."],
              ].map(([label, wert]) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-bold text-slate-900 w-44 align-top">{label}</td>
                  <td className="py-2.5 text-slate-600">{wert}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-sm text-slate-600 font-bold mb-3">1.3 Zugriffskontrolle</p>
          <p className="text-sm text-slate-500 italic mb-2">Maßnahmen, die gewährleisten, dass Berechtigte nur auf die ihnen zugeordneten Daten zugreifen.</p>
          <table className="w-full text-sm border-collapse mb-6">
            <tbody>
              {[
                ["Row Level Security (RLS)", "Auf allen Datenbank-Tabellen aktiviert. PostgreSQL-Policies stellen sicher, dass jeder authentifizierte Nutzer ausschließlich seine eigenen Daten sieht (WHERE auth.uid() = user_id)."],
                ["B2B-Isolation", "Einrichtungen sehen nur Daten ihrer Organisation. Mitgliedschaft wird über is_org_member()-Funktion (SECURITY DEFINER) geprüft. Kein IDOR-Risiko."],
                ["Service-Role-Key", "Nur serverseitig verfügbar (nie im Frontend-Bundle). Wird ausschließlich für administrative Operationen verwendet (Cron-Jobs, Webhooks, Admin-Panel)."],
                ["Berechtigungskonzept", "Drei Rollen: Nutzer (eigene Daten), Org-Admin (Einrichtungsdaten + Mitgliederverwaltung), System-Admin (ADMIN_EMAILS-Whitelist)."],
              ].map(([label, wert]) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-bold text-slate-900 w-44 align-top">{label}</td>
                  <td className="py-2.5 text-slate-600">{wert}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-sm text-slate-600 font-bold mb-3">1.4 Trennungskontrolle</p>
          <p className="text-sm text-slate-500 italic mb-2">Maßnahmen, die gewährleisten, dass zu unterschiedlichen Zwecken erhobene Daten getrennt verarbeitet werden.</p>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {[
                ["Mandantentrennung", "Logische Trennung über Supabase RLS auf Datenbankebene. Jede Einrichtung hat eine eigene organizations-ID. Kein Shared-State zwischen Einrichtungen."],
                ["Zwecktrennung", "Analyseergebnisse, Fristen, Nutzungsstatistiken und Zahlungsdaten werden in getrennten Tabellen gespeichert. Keine Vermischung von Zwecken."],
                ["Umgebungstrennung", "Strikte Trennung von Entwicklung und Produktion. Debug-Endpunkte sind in der Produktionsumgebung deaktiviert (NODE_ENV-Check)."],
              ].map(([label, wert]) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-bold text-slate-900 w-44 align-top">{label}</td>
                  <td className="py-2.5 text-slate-600">{wert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagebreak" />

        {/* 2. Integrität */}
        <div className="paragraf pt-8">
          <h3>2. Integrität (Art. 32 Abs. 1 lit. b DSGVO)</h3>

          <p className="text-sm text-slate-600 font-bold mb-3 mt-4">2.1 Weitergabekontrolle</p>
          <p className="text-sm text-slate-500 italic mb-2">Maßnahmen, die verhindern, dass Daten bei der Übertragung unbefugt gelesen, kopiert oder verändert werden.</p>
          <table className="w-full text-sm border-collapse mb-6">
            <tbody>
              {[
                ["Transportverschlüsselung", "TLS 1.2/1.3 für alle Verbindungen (Browser → Vercel → Supabase → Anthropic API). HSTS-Header erzwingen HTTPS. Kein unverschlüsselter Datenverkehr."],
                ["Pseudonymisierung", "Vor jeder Übertragung an KI-Dienstleister (Anthropic, OpenAI) werden personenbezogene Daten automatisch durch Platzhalter ersetzt: Namen, IBAN, Geburtsdaten, Adressen, Steuer-IDs, Sozialversicherungsnummern. Der KI-Anbieter erhält keine Klardaten."],
                ["Zero-Data-Retention", "Anthropic (primär) und OpenAI (Fallback) speichern API-Anfragen nicht dauerhaft und verwenden sie nicht für Modell-Training. Vertraglich über DPA abgesichert."],
                ["Content-Security-Policy", "CSP-Header verhindern das Nachladen von Scripts aus unbekannten Quellen (XSS-Schutz)."],
              ].map(([label, wert]) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-bold text-slate-900 w-44 align-top">{label}</td>
                  <td className="py-2.5 text-slate-600">{wert}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-sm text-slate-600 font-bold mb-3">2.2 Eingabekontrolle</p>
          <p className="text-sm text-slate-500 italic mb-2">Maßnahmen, die gewährleisten, dass nachträglich überprüft werden kann, ob und von wem Daten eingegeben, verändert oder entfernt wurden.</p>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {[
                ["Audit-Protokollierung", "Alle Analysevorgänge werden mit Zeitstempel, User-ID und Ergebnis-Metadaten protokolliert. Kein Zugriff durch unbefugte Personen."],
                ["Fehlerprotokollierung", "Sentry Error-Tracking für technische Fehler. Keine gezielte PII-Erfassung. Fehlerberichte werden nach 90 Tagen gelöscht."],
                ["Versionskontrolle", "Quellcode in Git (GitHub) mit vollständiger Änderungshistorie. Jede Änderung ist einem Autor zugeordnet. Automatisierte Code-Reviews bei Pull Requests."],
              ].map(([label, wert]) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-bold text-slate-900 w-44 align-top">{label}</td>
                  <td className="py-2.5 text-slate-600">{wert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. Verfügbarkeit und Belastbarkeit */}
        <div className="paragraf">
          <h3>3. Verfügbarkeit und Belastbarkeit (Art. 32 Abs. 1 lit. b DSGVO)</h3>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {[
                ["Hosting-Architektur", "Serverless-Architektur auf Vercel (Edge Network). Automatische horizontale Skalierung bei Last. Kein Single Point of Failure durch globales Edge-Deployment. Region: EU/Frankfurt (fra1)."],
                ["Datenbank", "Supabase (managed PostgreSQL) in AWS EU/Frankfurt. Automatische tägliche Backups mit 30 Tagen Aufbewahrung. Point-in-Time-Recovery verfügbar."],
                ["Monitoring", "Automatisierte Health-Checks alle 5 Minuten (UptimeRobot + eigener Cron). Automatische GitHub-Issue-Erstellung bei Ausfällen. Täglicher Backend-Health-Check (Cron 03:00 UTC)."],
                ["DDoS-Schutz", "Vercel Edge Network mit integriertem DDoS-Schutz. Zusätzlich: Rate-Limiting auf Anwendungsebene über Upstash Redis."],
                ["Wiederherstellung", "Recovery Time Objective (RTO): < 4 Stunden. Recovery Point Objective (RPO): < 24 Stunden (tägliche Backups). Vercel-Deployments sind immutable und können per Rollback wiederhergestellt werden."],
              ].map(([label, wert]) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-bold text-slate-900 w-44 align-top">{label}</td>
                  <td className="py-2.5 text-slate-600">{wert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagebreak" />

        {/* 4. Pseudonymisierung */}
        <div className="paragraf pt-8">
          <h3>4. Pseudonymisierung (Art. 32 Abs. 1 lit. a DSGVO)</h3>
          <p className="text-sm text-slate-600 mb-4">
            BescheidRecht implementiert eine automatische Pseudonymisierung aller personenbezogenen
            Daten vor der KI-Verarbeitung. Dies ist die zentrale Datenschutzmaßnahme der Plattform
            (Privacy by Design gemäß Art. 25 DSGVO).
          </p>
          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-2 pr-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-56">Datenkategorie</th>
                <th className="text-left py-2 text-xs font-bold uppercase tracking-wider text-slate-400">Ersetzung</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {[
                ["Vor- und Nachname", "[NAME_1], [NAME_2], ..."],
                ["Geburtsdatum", "[GEBURTSDATUM]"],
                ["Adresse", "[ADRESSE]"],
                ["IBAN", "[IBAN]"],
                ["BIC", "[BIC]"],
                ["Steuer-ID", "[STEUER_ID]"],
                ["Sozialversicherungsnummer", "[SV_NUMMER]"],
                ["E-Mail-Adresse", "[EMAIL]"],
                ["Telefonnummer", "[TELEFON]"],
                ["Aktenzeichen", "Wird beibehalten (kein PII)"],
              ].map(([kategorie, ersetzung]) => (
                <tr key={kategorie} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-bold text-slate-900">{kategorie}</td>
                  <td className="py-2 text-slate-600 font-mono text-xs">{ersetzung}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm text-slate-600">
            Die Re-Identifizierung erfolgt ausschließlich clientseitig nach Rückkehr der
            Analyseergebnisse. Der KI-Anbieter hat zu keinem Zeitpunkt Zugang zu Klardaten.
          </p>
        </div>

        {/* 5. Verschlüsselung */}
        <div className="paragraf">
          <h3>5. Verschlüsselung (Art. 32 Abs. 1 lit. a DSGVO)</h3>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {[
                ["Transport (in transit)", "TLS 1.2/1.3 für alle Verbindungen. HSTS mit max-age=63072000 (2 Jahre), includeSubDomains und preload. X-Content-Type-Options: nosniff."],
                ["Speicherung (at rest)", "AES-256 Verschlüsselung der PostgreSQL-Datenbank (Supabase/AWS). Verschlüsselte Backups."],
                ["Passwörter", "bcrypt-Hashing mit Kostenfaktor 10. Keine Klartextspeicherung. Keine Passwort-Recovery über E-Mail (nur Reset-Link mit Token)."],
                ["API-Schlüssel", "Gespeichert in Vercel Environment Variables (verschlüsselt at rest). Nicht im Quellcode, nicht in Git-History, nicht im Frontend-Bundle."],
              ].map(([label, wert]) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-bold text-slate-900 w-44 align-top">{label}</td>
                  <td className="py-2.5 text-slate-600">{wert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 6. Regelmäßige Überprüfung */}
        <div className="paragraf">
          <h3>6. Verfahren zur regelmäßigen Überprüfung (Art. 32 Abs. 1 lit. d DSGVO)</h3>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {[
                ["Automatisierte Sicherheitsscans", "Bei jedem Code-Push: npm audit (Dependency-Vulnerabilities) und Secrets-Scan (verhindert versehentliches Committen von API-Keys). GitHub Actions Workflow."],
                ["Code-Review", "Jeder Pull Request wird automatisch durch KI-gestütztes Code-Review geprüft (PR-Review Workflow). Fokus auf Sicherheit, Datenleaks, Auth-Lücken."],
                ["Agent-Audit", "Wöchentliches automatisiertes Audit aller KI-Agenten: Metriken, Anomalie-Erkennung, Performance-Überwachung. Ergebnisse als GitHub Issue."],
                ["Content-Audit", "Monatliche automatische Prüfung: Kennzahlen-Integrität, Fehlerkatalog-Konsistenz, Weisungs-Aktualität."],
                ["Design-Audit", "Wöchentliche automatisierte Prüfung: Lighthouse Performance, Core Web Vitals, Accessibility-Score."],
                ["Datenlöschung", "Täglicher Cron-Job (04:00 UTC) löscht Analyseergebnisse und erledigte Fristen nach 90 Tagen (DSGVO-Datensparsamkeit)."],
              ].map(([label, wert]) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-bold text-slate-900 w-44 align-top">{label}</td>
                  <td className="py-2.5 text-slate-600">{wert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 7. Datensparsamkeit */}
        <div className="paragraf">
          <h3>7. Datensparsamkeit und Speicherbegrenzung</h3>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {[
                ["Bescheid-Dokumente", "Werden nach der Analyse nicht dauerhaft gespeichert. Verarbeitung nur im Arbeitsspeicher."],
                ["Analyseergebnisse", "Pseudonymisiert gespeichert (keine Klardaten aus dem Bescheid). Automatische Löschung nach 90 Tagen."],
                ["Erledigte Fristen", "Automatische Löschung nach 90 Tagen."],
                ["KI-Anfragen", "Anthropic und OpenAI: Zero-Data-Retention. API-Anfragen werden weder gespeichert noch für Training verwendet."],
                ["Sentry-Fehlerberichte", "Automatische Löschung nach 90 Tagen. Keine gezielte PII-Erfassung."],
                ["Rate-Limiting-Daten", "Nur gehashte IP-Adressen und Zähler, kurzfristig (Minuten bis Stunden)."],
              ].map(([label, wert]) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-bold text-slate-900 w-44 align-top">{label}</td>
                  <td className="py-2.5 text-slate-600">{wert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 8. Organisatorische Maßnahmen */}
        <div className="paragraf">
          <h3>8. Organisatorische Maßnahmen</h3>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {[
                ["Verschwiegenheit", "Alle Personen mit Zugang zu personenbezogenen Daten unterliegen der Verschwiegenheitspflicht."],
                ["Incident-Response", "Datenpannen werden innerhalb von 72 Stunden gemäß Art. 33 DSGVO an die zuständige Aufsichtsbehörde gemeldet. Betroffene Einrichtungen werden unverzüglich informiert."],
                ["Schulung", "Regelmäßige Auseinandersetzung mit aktuellen Datenschutzanforderungen und Sicherheitsstandards."],
                ["Dokumentation", "Diese TOM werden mindestens jährlich überprüft und bei wesentlichen Änderungen der Infrastruktur oder Verarbeitungsprozesse aktualisiert."],
              ].map(([label, wert]) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-bold text-slate-900 w-44 align-top">{label}</td>
                  <td className="py-2.5 text-slate-600">{wert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Versionshistorie */}
        <div className="paragraf">
          <h3>Versionshistorie</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-2 pr-4 text-xs font-bold uppercase tracking-wider text-slate-400">Version</th>
                <th className="text-left py-2 pr-4 text-xs font-bold uppercase tracking-wider text-slate-400">Datum</th>
                <th className="text-left py-2 text-xs font-bold uppercase tracking-wider text-slate-400">Änderung</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-2.5 pr-4 font-bold text-slate-900">1.0</td>
                <td className="py-2.5 pr-4">März 2026</td>
                <td className="py-2.5">Erstversion</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-14 border-t border-slate-100 pt-6 flex justify-between items-center">
          <p className="text-xs text-slate-300 font-bold">Anlage 3 (TOM) &middot; {vertragNr} &middot; Stand {datum}</p>
          <p className="text-xs text-slate-300 font-bold">{ANBIETER.web}</p>
        </div>

        {/* Links */}
        <div className="no-print mt-10 flex gap-3">
          <Link href="/rahmenvertrag" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            Rahmenvertrag
          </Link>
          <Link href="/rahmenvertrag/anlage-1" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            Anlage 1: Leistungsbeschreibung
          </Link>
          <Link href="/rahmenvertrag/anlage-2" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            Anlage 2: AV-Vertrag
          </Link>
        </div>
      </div>
    </div>
  );
}
