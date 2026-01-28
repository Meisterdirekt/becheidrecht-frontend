"use client";

import React from 'react';
import Link from 'next/link';

export default function AGBPage() {
  return (
    <main className="min-h-screen bg-[#05070a] text-white flex flex-col">
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors">
          ← Zurück zur Startseite
        </Link>
        <div className="flex gap-6 items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">AGB</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-20 flex-grow">
        <h1 className="text-5xl font-black tracking-tighter uppercase mb-16">AGB</h1>

        <section className="space-y-12 text-gray-400 text-sm leading-relaxed">
          
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-8">
            <h2 className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-4">Wichtiger Hinweis</h2>
            <p className="text-white font-medium">
              BescheidRecht ist ein rein technologisches Analyse-Tool von Hendrik Berkensträter. Wir erbringen keine Rechtsberatung oder Rechtsdienstleistungen im Sinne des RDG.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">1. Vertragspartner</h2>
              <p>
                Vertragspartner für alle Leistungen ist:<br />
                Hendrik Berkensträter, Antoniusstrasse 47, 49377 Vechta.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
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
          </div>
        </section>
      </div>

      <footer className="border-t border-white/5 py-12 text-center text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">
        <p>© 2026 BescheidRecht. Alle Rechte vorbehalten.</p>
      </footer>
    </main>
  );
}
