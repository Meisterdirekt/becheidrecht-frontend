'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Upload, MessageSquare, Download } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const plans = [
    {
      name: "Basis",
      price: "9,90 €",
      features: ["5 Analysen", "5 Schreiben", "max. 10 Seiten"],
      buttonText: "Basis wählen",
      highlight: false
    },
    {
      name: "Plus",
      price: "17,90 €",
      features: ["15 Analysen", "15 Schreiben", "max. 20 Seiten", "Anträge & Widersprüche"],
      buttonText: "Plus wählen",
      highlight: true,
      badge: "Beliebt"
    },
    {
      name: "Sozial PRO",
      price: "49 €",
      features: ["50 Analysen", "50 Schreiben", "max. 30 Seiten", "Mehrplatzfähig"],
      buttonText: "PRO wählen",
      highlight: false,
      dark: true
    },
    {
      name: "Business",
      price: "99 €",
      features: ["150 Analysen", "150 Schreiben", "max. 50 Seiten", "Berufliche Nutzung", "Höchste Priorität"],
      buttonText: "Business wählen",
      highlight: false,
      dark: true
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#002147] font-sans">
      {/* HEADER */}
      <nav className="p-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-xl font-bold text-[#0056b3]">
          <span className="p-1 bg-[#0056b3] text-white rounded">📄</span> BescheidRecht
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex bg-gray-100 p-1 rounded-lg border">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded text-[10px] font-bold ${lang === l ? 'bg-[#0056b3] text-white' : 'text-gray-500'}`}>{l}</button>
            ))}
          </div>
          <Link href="/login" className="text-sm font-medium text-[#0056b3]">Anmelden</Link>
          <Link href="/register" className="bg-[#0056b3] text-white px-4 py-2 rounded text-sm font-bold">Registrieren</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-16 px-6 pb-24 text-center">
        {/* HERO */}
        <h1 className="text-5xl font-bold mb-4 text-[#002147]">Behördenschreiben <br/> endlich verstehen</h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">KI-gestützte Analyse und Erstellung von Schreiben im deutschen Recht. Verständlich, korrekt, bezahlbar.</p>

        {/* PREISE SEKTION - EXAKT NACH BILD */}
        <section className="py-20">
          <h2 className="text-3xl font-bold mb-2">Transparente Preise</h2>
          <p className="text-gray-500 mb-12">Wähle das Paket, das zu deiner Situation passt. Jederzeit kündbar.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {plans.map((plan, i) => (
              <div key={i} className={`relative rounded-lg p-8 text-left transition-all ${
                plan.highlight ? 'bg-[#007bff] text-white scale-105 shadow-xl pb-12' : 
                plan.dark ? 'bg-[#002147] text-white pb-12' : 'bg-[#e9f2ff] text-[#002147] pb-12'
              }`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3da9fc] text-white px-4 py-1 rounded-full text-xs font-bold">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <div className="text-3xl font-bold mb-6">{plan.price}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm opacity-90">
                      <CheckCircle2 size={16} className={plan.highlight || plan.dark ? "text-white" : "text-[#007bff]"} /> {feat}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-md font-bold text-sm transition ${
                  plan.highlight ? 'bg-white text-[#007bff]' : 
                  plan.dark ? 'bg-white text-[#002147]' : 'bg-[#0056b3] text-white'
                }`}>
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
