"use client";

import React from "react";

import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-mesh text-white flex flex-col">
      <SiteNavSimple backHref="/" backLabel="Zurück zur Startseite" />
      <div className="max-w-4xl mx-auto px-6 py-20 flex-grow">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-2">Rechtliches</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-16">Impressum</h1>
        <section className="space-y-12 text-white/70 text-sm leading-relaxed">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Angaben gemäß § 5 TMG</h2>
            <p className="text-base text-white/90">
              <strong>BescheidRecht</strong><br />
              Hendrik Berkensträter<br />
              Antoniusstraße 47<br />
              49377 Vechta<br />
              Deutschland
            </p>
            <p className="mt-4 text-white/80 text-xs">
              Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG wird nicht geführt (Kleinunternehmerregelung § 19 UStG).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Kontakt</h2>
              <p className="text-white/90">
                E-Mail: kontakt@bescheidrecht.de<br />
                Web: www.bescheidrecht.de
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Verantwortlich für den Inhalt</h2>
              <p className="text-white/90 text-xs">
                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:<br />
                Hendrik Berkensträter<br />
                Antoniusstraße 47, 49377 Vechta
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">EU-Streitschlichtung</h2>
            <p className="text-white/90">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
                https://ec.europa.eu/consumers/odr/
              </a>
              . Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Haftung für Inhalte</h2>
            <p className="text-white/90">
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Haftung für Links</h2>
            <p className="text-white/90">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Urheberrecht</h2>
            <p className="text-white/90">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
            </p>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
