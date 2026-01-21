'use client';
import React from 'react';
import Link from 'next/link';
import FileUpload from '../components/FileUpload';
import { Shield, scale3d, Gavel, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#05070a] text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_-5px_rgba(37,99,235,1)]">
            <Shield size={24} fill="white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">Bescheid<span className="text-blue-500">Recht</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">Funktionsweise</a>
          <a href="#pricing" className="hover:text-white transition-colors">Preise</a>
        </div>
        <Link href="/login">
          <button className="px-6 py-2.5 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all text-sm">
            Login
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="pt-24 pb-16 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Dein Recht in der <span className="text-blue-500">Omega-Instanz</span>
        </h1>
        <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl leading-relaxed mb-12">
          Lade deinen Bescheid hoch. Unsere KI prüft ihn auf Formfehler, Fristen und materielle Rechtsfehler – und schreibt sofort deinen Widerspruch.
        </p>
        
        {/* Hier kommt die Upload-Komponente rein */}
        <FileUpload />
      </header>

      {/* Trust Section */}
      <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-8 py-20 border-t border-white/5">
        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10">
          <Gavel className="text-blue-500 mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2">Präzise Analyse</h3>
          <p className="text-gray-400 text-sm leading-relaxed">Scannt nach aktuellster Rechtsprechung und findet Fehler, die Menschen oft übersehen.</p>
        </div>
        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10">
          <CheckCircle className="text-blue-500 mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2">Sofort-Widerspruch</h3>
          <p className="text-gray-400 text-sm leading-relaxed">Erstellt ein fertiges PDF-Dokument, das du sofort an die Behörde schicken kannst.</p>
        </div>
        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10">
          <Shield className="text-blue-500 mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2">Sicher & Diskret</h3>
          <p className="text-gray-400 text-sm leading-relaxed">Deine Daten werden verschlüsselt und nur für die Dauer der Analyse verarbeitet.</p>
        </div>
      </section>
    </main>
  );
}
