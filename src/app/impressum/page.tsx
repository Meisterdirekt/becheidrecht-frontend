"use client";

import React from 'react';
import Link from 'next/link';

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-[#05070a] text-white flex flex-col">
      {/* HEADER / NAV */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors">
          ← Zurück zur Startseite
        </Link>
        <div className="flex gap-6 items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Impressum</span>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-20 flex-grow">
        <h1 className="text-5xl font-black tracking-tighter uppercase mb-16">Impressum</h1>

        <section className="space-y-12 text-gray-400 text-sm leading-relaxed">
          
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Angaben gemäß § 5 TMG</h2>
            <p className="text-lg text-white/90">
              <strong>BescheidRecht</strong><br />
              Hendrik Berkensträter<br />
              Antoniusstrasse 47<br />
              49377 Vechta<br />
              Deutschland
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Kontakt</h2>
              <p className="text-white/90">
                E-Mail: kontakt@bescheidrecht.de<br />
                Web: www.bescheidrecht.de
              </p>
            </div>
            
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Verantwortlich</h2>
              <p className="text-white/90 text-xs">
                Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:<br />
                Hendrik Berkensträter<br />
                Antoniusstrasse 47, 49377 Vechta
              </p>
            </div>
          </div>

          <div className="space-y-8 pt-8 border-t border-white/5">
             <div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">EU-Streitschlichtung</h2>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                  https://ec.europa.eu/consumers/odr/
                </a>.
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
            </div>

            <div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
              <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>

            <div className="opacity-50">
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Haftung für Inhalte</h2>
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 text-center text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">
        <p>© 2026 BescheidRecht. Alle Rechte vorbehalten.</p>
      </footer>
    </main>
  );
}
