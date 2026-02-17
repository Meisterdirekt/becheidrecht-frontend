"use client";

import React from "react";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function AGBPage() {
  return (
    <main className="min-h-screen bg-mesh text-white flex flex-col">
      <SiteNavSimple backHref="/" backLabel="Zurück zur Startseite" />
      <div className="max-w-4xl mx-auto px-6 py-20 flex-grow">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-2">Rechtliches</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-16">AGB</h1>
        <section className="space-y-12 text-white/70 text-sm leading-relaxed">
          <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-8">
            <h2 className="text-[var(--accent)] font-bold uppercase tracking-widest text-xs mb-4">Wichtiger Hinweis</h2>
            <p className="text-white font-medium">
              BescheidRecht ist ein rein technologisches Analyse-Tool von Hendrik Berkensträter. Wir erbringen keine Rechtsberatung oder Rechtsdienstleistungen im Sinne des RDG.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">1. Vertragspartner</h2>
              <p>
                Vertragspartner für alle Leistungen ist:<br />
                Hendrik Berkensträter, Antoniusstraße 47, 49377 Vechta.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">2. Leistungsumfang</h2>
              <p>
                Der Nutzer erhält durch den Erwerb eines Pakets das Recht, Dokumente automatisiert analysieren zu lassen. Die Ergebnisse dienen der Orientierung und ersetzen keine professionelle Rechtsprüfung.
              </p>
            </div>

            <div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">3. Widerrufsrecht bei digitalen Inhalten</h2>
              <p>
                Mit dem Start der Analyse (Dokumenten-Upload nach Kauf) stimmen Sie ausdrücklich zu, dass wir mit der Vertragserfüllung vor Ablauf der Widerrufsfrist beginnen. Damit erlischt Ihr Widerrufsrecht für diese digitale Dienstleistung.
              </p>
            </div>

            <div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">4. Preise und Zahlung</h2>
              <p>
                Die jeweils gültigen Preise und Zahlungsmodalitäten ergeben sich aus der Darstellung auf der Website bzw. beim Abschluss des gewählten Pakets. Alle Preise verstehen sich in Euro inklusive der gesetzlichen Mehrwertsteuer, sofern nicht ausdrücklich anders angegeben.
              </p>
            </div>

            <div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">5. Haftung</h2>
              <p>
                Die Nutzung des Analyse-Tools erfolgt auf eigenes Risiko. Wir haften nicht für die inhaltliche Richtigkeit der Analyseergebnisse. Eine Haftung für leichte Fahrlässigkeit ist ausgeschlossen, soweit nicht zwingende gesetzliche Vorschriften entgegenstehen. Die Haftung für Vorsatz und grobe Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit bleibt unberührt.
              </p>
            </div>

            <div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">6. Schlussbestimmungen</h2>
              <p>
                Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand für Streitigkeiten ist, soweit gesetzlich zulässig, der Sitz des Anbieters. Sollte eine Bestimmung dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
              </p>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
