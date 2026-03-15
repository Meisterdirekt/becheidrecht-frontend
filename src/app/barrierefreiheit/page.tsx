"use client";

import React from "react";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function BarrierefreiheitPage() {
  return (
    <main id="main-content" className="min-h-screen bg-mesh text-[var(--text)] flex flex-col">
      <SiteNavSimple backHref="/" backLabel="Zurück zur Startseite" />
      <div className="max-w-4xl mx-auto px-6 py-20 flex-grow">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-2">Barrierefreiheit</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Erklärung zur Barrierefreiheit</h1>
        <p className="text-[var(--text-muted)] opacity-70 text-sm mb-16">Stand: März 2026</p>

        <section className="space-y-12 text-[var(--text-muted)] text-sm leading-relaxed">

          <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-8">
            <h2 className="text-[var(--accent)] font-bold uppercase tracking-widest text-xs mb-4">Geltungsbereich</h2>
            <p className="text-[var(--text)] font-medium">
              Diese Erklärung zur Barrierefreiheit gilt für die Website bescheidrecht.de und deren Dienste.
              BescheidRecht ist bestrebt, seinen Webauftritt gemäß der EU-Richtlinie 2016/2102,
              dem Barrierefreiheitsstärkungsgesetz (BFSG) sowie der BITV 2.0 barrierefrei zugänglich zu machen.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">Konformitätsstatus</h2>
            <p className="text-[var(--text)]">
              Diese Website ist <strong>teilweise konform</strong> mit der EN 301 549 und den Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
              Im Folgenden werden bekannte Einschränkungen und geplante Verbesserungen beschrieben.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">Umgesetzte Maßnahmen</h2>
            <ul className="text-[var(--text)] space-y-2 list-disc list-inside">
              <li>Semantische HTML-Struktur mit korrekter Überschriftenhierarchie</li>
              <li>Skip-Link zum Hauptinhalt für Tastaturnavigation</li>
              <li>Formularfelder mit zugeordneten Labels (htmlFor/id-Verknüpfung)</li>
              <li>ARIA-Attribute für Dialoge, Modals und interaktive Elemente</li>
              <li>Farbkontraste gemäß WCAG AAA (Kontrastverhältnis &gt; 7:1 im Light-Mode)</li>
              <li>Unterstützung für reduzierte Bewegung (prefers-reduced-motion)</li>
              <li>Mehrsprachige Oberfläche (DE, EN, RU, AR, TR) mit RTL-Unterstützung</li>
              <li>Tastaturnavigation in allen interaktiven Komponenten</li>
              <li>ARIA-Live-Regionen für dynamische Statusmeldungen</li>
              <li>Automatisierte Prüfung via eslint-plugin-jsx-a11y</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">Bekannte Einschränkungen</h2>
            <ul className="text-[var(--text)] space-y-2 list-disc list-inside">
              <li>PDF-Dokumente, die zum Download generiert werden, sind derzeit nicht vollständig barrierefrei (keine Tagged-PDF-Struktur)</li>
              <li>Einige komplexe Analyse-Ergebnisse können für Screenreader schwer zu erfassen sein</li>
              <li>Die Echtzeit-Streaming-Ausgabe (SSE) des Widerspruchsassistenten wird möglicherweise nicht optimal von allen assistiven Technologien wiedergegeben</li>
            </ul>
            <p className="text-[var(--text)] mt-4">
              Wir arbeiten kontinuierlich daran, diese Einschränkungen zu beheben.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">Feedback und Kontakt</h2>
            <p className="text-[var(--text)]">
              Sollten Sie Barrieren auf unserer Website feststellen oder Verbesserungsvorschläge haben,
              kontaktieren Sie uns bitte:
            </p>
            <p className="text-[var(--text)] mt-4">
              <strong>Hendrik Berkensträter</strong><br />
              E-Mail: info@bescheidrecht.de<br />
              Antoniusstraße 47, 49377 Vechta
            </p>
            <p className="text-[var(--text)] mt-4">
              Wir bemühen uns, Ihre Anfrage innerhalb von 14 Tagen zu beantworten und festgestellte Barrieren zeitnah zu beseitigen.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">Durchsetzungsverfahren</h2>
            <p className="text-[var(--text)]">
              Sollte unsere Antwort auf Ihre Beschwerde nicht zufriedenstellend sein, können Sie sich an die zuständige
              Durchsetzungsstelle wenden. In Niedersachsen ist dies:
            </p>
            <p className="text-[var(--text)] mt-4">
              <strong>Landesbeauftragte/r für Menschen mit Behinderungen Niedersachsen</strong><br />
              Hannah-Arendt-Platz 2<br />
              30159 Hannover<br />
              Telefon: 0511 120-4006
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">Technische Spezifikationen</h2>
            <p className="text-[var(--text)]">
              Die Barrierefreiheit von bescheidrecht.de basiert auf den folgenden Technologien:
            </p>
            <ul className="text-[var(--text)] space-y-2 list-disc list-inside mt-4">
              <li>HTML5 mit semantischen Elementen</li>
              <li>CSS mit CSS Custom Properties für Theming (Dark/Light-Mode)</li>
              <li>WAI-ARIA 1.2 für erweiterte Zugänglichkeit</li>
              <li>JavaScript/TypeScript (React/Next.js) mit progressiver Verbesserung</li>
            </ul>
            <p className="text-[var(--text)] mt-4">
              Diese Technologien werden für die Konformität mit WCAG 2.1 Level AA benötigt.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">Bewertungsmethode</h2>
            <p className="text-[var(--text)]">
              Die Barrierefreiheit wurde bewertet durch:
            </p>
            <ul className="text-[var(--text)] space-y-2 list-disc list-inside mt-4">
              <li>Automatisierte Prüfung mit eslint-plugin-jsx-a11y</li>
              <li>Manuelle Prüfung der Tastaturnavigation und Screenreader-Kompatibilität</li>
              <li>Kontrastprüfung gemäß WCAG AAA-Kriterien</li>
            </ul>
            <p className="text-[var(--text)] mt-4">
              Diese Erklärung wurde am 15. März 2026 erstellt und wird regelmäßig aktualisiert.
            </p>
          </div>

        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
