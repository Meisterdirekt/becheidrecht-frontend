"use client";

import React from 'react';
import Link from 'next/link';

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-[#05070a] text-white flex flex-col">
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors">
          ← Zurück zur Startseite
        </Link>
        <div className="flex gap-6 items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Datenschutz</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-20 flex-grow">
        <h1 className="text-5xl font-black tracking-tighter uppercase mb-16">Datenschutzerklärung</h1>

        <section className="space-y-12 text-gray-400 text-sm leading-relaxed">
          
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">1. Verantwortliche Stelle</h2>
            <p className="text-white/90">
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br /><br />
              <strong>Hendrik Berkensträter</strong><br />
              Antoniusstrasse 47<br />
              49377 Vechta<br />
              E-Mail: kontakt@bescheidrecht.de
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">2. Allgemeine Hinweise</h2>
              <p>
                Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung. Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">3. Dokumenten-Upload & Analyse</h2>
              <p>
                BescheidRecht verarbeitet die von Ihnen hochgeladenen Dokumente ausschließlich zur automatisierten Strukturierung und Analyse. Die Datenübertragung erfolgt verschlüsselt (SSL/TLS). Wir speichern diese Daten nur so lange, wie es für die Erbringung der Dienstleistung oder aufgrund gesetzlicher Fristen erforderlich ist.
              </p>
            </div>

            <div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-4">4. Ihre Rechte</h2>
              <p>
                Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Sperrung oder Löschung Ihrer gespeicherten personenbezogenen Daten. Kontaktieren Sie uns hierzu einfach über die oben genannten Kontaktdaten.
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
