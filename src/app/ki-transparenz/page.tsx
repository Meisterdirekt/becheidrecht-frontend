"use client";

import React from "react";
import Link from "next/link";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function KiTransparenzPage() {
  return (
    <main id="main-content" className="min-h-screen bg-mesh text-[var(--text)] flex flex-col">
      <SiteNavSimple backHref="/" backLabel="Zurück zur Startseite" />
      <div className="max-w-4xl mx-auto px-6 py-20 flex-grow">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-2">EU AI Act</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">KI-Transparenz</h1>
        <p className="text-[var(--text-muted)] opacity-70 text-sm mb-16">
          Informationen gemäß EU-Verordnung über Künstliche Intelligenz (AI Act, VO 2024/1689) — Stand: März 2026
        </p>

        <section className="space-y-12 text-[var(--text-muted)] text-sm leading-relaxed">

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8">
            <h2 className="text-amber-400 font-bold uppercase tracking-widest text-xs mb-4">Risikoklassifikation</h2>
            <p className="text-[var(--text)] font-medium">
              BescheidRecht wird als <strong>Hochrisiko-KI-System</strong> gemäß Art. 6 Abs. 2 i. V. m. Anhang III Nr. 8 lit. a der
              EU-KI-Verordnung (VO 2024/1689) eingestuft. Die Anwendung analysiert behördliche Verwaltungsakte im Sozialrecht und
              unterstützt Nutzer bei der Erstellung von Widerspruchsschreiben — dies betrifft den Zugang zu wesentlichen öffentlichen Leistungen.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">1. Eingesetzte KI-Systeme</h2>
            <div className="text-[var(--text)] space-y-4">
              <div>
                <h3 className="font-bold mb-1">Primärsystem: Anthropic Claude (Sonnet / Opus)</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Zweck:</strong> Analyse von Behördenbescheiden, Erkennung von Verfahrens- und Rechtsfehlern, Generierung von Musterschreiben</li>
                  <li><strong>Anbieter:</strong> Anthropic, PBC (San Francisco, USA)</li>
                  <li><strong>Modelle:</strong> Claude Sonnet (Standardanalyse), Claude Opus (Notfallanalyse bei Frist &lt; 7 Tage)</li>
                  <li><strong>Auftragsverarbeitung:</strong> AVV nach Art. 28 DSGVO abgeschlossen</li>
                  <li><strong>Datenspeicherung:</strong> Zero-Data-Retention — API-Anfragen werden nicht gespeichert oder für Training verwendet</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-1">Sekundärsystem: OpenAI GPT-4o (Fallback)</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Zweck:</strong> OCR-Texterkennung bei Bildern, Fallback bei Nichterreichbarkeit des Primärsystems</li>
                  <li><strong>Anbieter:</strong> OpenAI, L.L.C. (San Francisco, USA)</li>
                  <li><strong>Datenspeicherung:</strong> Zero-Data-Retention via API-Konfiguration</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">2. Zweck und Funktionsweise</h2>
            <p className="text-[var(--text)]">
              BescheidRecht analysiert hochgeladene Behördenbescheide aus dem deutschen Sozialrecht (SGB II, III, V, VI, VIII, IX, XII,
              BAMF, BAföG, Elterngeld, Familienkasse, Wohngeld, Unfallversicherung) auf:
            </p>
            <ul className="text-[var(--text)] list-disc list-inside space-y-1 mt-3">
              <li>Verfahrensfehler (fehlende Rechtsbehelfsbelehrung, Begründungsmängel)</li>
              <li>Berechnungsfehler (Regelsatz, Kosten der Unterkunft, Einkommen)</li>
              <li>Rechtsfehler (veraltete Rechtsgrundlagen, Ermessensfehler)</li>
              <li>Fristberechnung und Dringlichkeitseinstufung</li>
            </ul>
            <p className="text-[var(--text)] mt-4">
              Auf Basis der Analyse wird automatisiert ein Musterschreiben generiert, das als Vorlage für einen Widerspruch dient.
              <strong> Dieses Schreiben ist keine Rechtsberatung</strong> im Sinne des § 2 RDG und ersetzt nicht die Konsultation
              eines Rechtsanwalts oder einer Sozialberatungsstelle.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">3. Datenschutz bei der KI-Verarbeitung</h2>
            <div className="text-[var(--text)] space-y-3">
              <p>
                <strong>Pseudonymisierung:</strong> Vor der Übermittlung an KI-Anbieter werden alle personenbezogenen Daten
                automatisch pseudonymisiert. Namen, Adressen, IBAN, Geburtsdaten, Sozialversicherungsnummern und Kontaktdaten
                werden durch Platzhalter ersetzt (z. B. [NAME], [ADRESSE], [IBAN]).
              </p>
              <p>
                <strong>Zero-Retention:</strong> Sowohl Anthropic als auch OpenAI sind vertraglich verpflichtet, API-Anfragen
                nicht zu speichern und nicht für Modelltraining zu verwenden.
              </p>
              <p>
                <strong>Speicherdauer:</strong> Pseudonymisierte Analyseergebnisse werden maximal 90 Tage gespeichert und
                danach automatisch gelöscht (DSGVO-konformer Cron-Job).
              </p>
              <p>
                Details zur Datenverarbeitung finden Sie in unserer{" "}
                <Link href="/datenschutz" className="text-[var(--accent)] hover:underline">Datenschutzerklärung</Link> und im{" "}
                <Link href="/avv" className="text-[var(--accent)] hover:underline">Auftragsverarbeitungsvertrag (AVV)</Link>.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">4. Menschliche Aufsicht</h2>
            <div className="text-[var(--text)] space-y-3">
              <p>Gemäß Art. 14 der EU-KI-Verordnung werden folgende Maßnahmen zur menschlichen Aufsicht umgesetzt:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Qualitätsprüfung:</strong> Ein integrierter Kritik-Agent (AG03) bewertet jede Analyse auf Plausibilität und Vollständigkeit</li>
                <li><strong>Nutzer-Review:</strong> Alle generierten Schreiben werden als &quot;Entwurf&quot; und &quot;Vorlage&quot; gekennzeichnet — Nutzer müssen den Inhalt vor Verwendung prüfen</li>
                <li><strong>Verfeinerung:</strong> Nutzer können Analyse-Ergebnisse durch zusätzlichen Kontext verfeinern lassen</li>
                <li><strong>Automatisiertes Monitoring:</strong> Wöchentliche Agent-Audits (AG17) und monatliche Content-Audits (AG18) prüfen die Systemqualität</li>
                <li><strong>Rechtsupdate-Monitor:</strong> Monatliche Prüfung auf Gesetzesänderungen (AG15) stellt sicher, dass die Wissensbasis aktuell bleibt</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">5. Grenzen und Haftungsausschluss</h2>
            <div className="text-[var(--text)] space-y-3">
              <p>BescheidRecht unterliegt folgenden Einschränkungen:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>KI-Systeme können Fehler machen — Analyseergebnisse sind <strong>nicht rechtsverbindlich</strong></li>
                <li>Die Analyse ersetzt <strong>keine Rechtsberatung</strong> gemäß § 2 Rechtsdienstleistungsgesetz (RDG)</li>
                <li>Musterschreiben sind Entwürfe und müssen vor Verwendung geprüft werden</li>
                <li>Erfolgschancen-Einschätzungen sind statistische Näherungswerte, keine Garantien</li>
                <li>Die Wissensbasis wird regelmäßig aktualisiert, kann aber nicht alle aktuellen Gerichtsentscheidungen abdecken</li>
              </ul>
              <p className="mt-3">
                Detaillierte Haftungsbestimmungen finden Sie in unseren{" "}
                <Link href="/agb" className="text-[var(--accent)] hover:underline">Allgemeinen Geschäftsbedingungen</Link>.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">6. Qualitätssicherung</h2>
            <div className="text-[var(--text)] space-y-3">
              <p>Zur Sicherstellung der Systemqualität werden folgende Maßnahmen eingesetzt:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Multi-Agenten-Pipeline:</strong> 13 spezialisierte Agenten mit definierten Rollen prüfen Eingaben, analysieren, kritisieren und generieren Ausgaben</li>
                <li><strong>Sicherheitsfilter:</strong> Ein Eingangs-Sicherheitsagent (AG08) prüft jede Eingabe auf Manipulation und unzulässige Inhalte</li>
                <li><strong>Fehlerkatalog:</strong> 163 dokumentierte Fehlertypen über 16 Rechtsgebiete mit definierten Prüflogiken</li>
                <li><strong>Automatisierte Tests:</strong> 30+ Testfälle validieren Pipeline-Integrität, Schema-Konformität und Fehlererkennungslogik</li>
                <li><strong>Kosten-Monitoring:</strong> Tägliche Überwachung der API-Kosten mit automatischer Anomalie-Erkennung</li>
                <li><strong>Deployment-Checks:</strong> Tägliche automatisierte Prüfung der Produktionsumgebung</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">7. Kontakt für KI-bezogene Fragen</h2>
            <p className="text-[var(--text)]">
              Bei Fragen zur Funktionsweise unserer KI-Systeme, zur Datenverarbeitung oder zu dieser Transparenzerklärung
              wenden Sie sich bitte an:
            </p>
            <p className="text-[var(--text)] mt-4">
              <strong>Hendrik Berkensträter</strong><br />
              E-Mail: info@bescheidrecht.de<br />
              Antoniusstraße 47, 49377 Vechta
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">Rechtsgrundlagen</h2>
            <ul className="text-[var(--text)] space-y-2 list-disc list-inside">
              <li>EU-Verordnung über Künstliche Intelligenz (AI Act, VO 2024/1689)</li>
              <li>Datenschutz-Grundverordnung (DSGVO, VO 2016/679)</li>
              <li>Rechtsdienstleistungsgesetz (RDG, § 2)</li>
              <li>Barrierefreiheitsstärkungsgesetz (BFSG)</li>
              <li>Digitale-Dienste-Gesetz (DDG)</li>
            </ul>
          </div>

        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
