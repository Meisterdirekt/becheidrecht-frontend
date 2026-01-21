'use client';
import React from 'react';
import Link from 'next/link';
import { Shield, Upload, Scale, FileText } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center border-b border-white/5">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
          BescheidRecht
        </div>
        <div className="space-x-6 flex items-center">
          <Link href="/login" className="hover:text-blue-400 transition">Login</Link>
          <Link href="/register" className="bg-blue-600 px-5 py-2 rounded-full font-bold hover:bg-blue-500 transition">
            Jetzt starten
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto pt-20 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Auch genug vom <span className="text-blue-500">Behörden-Wahnsinn?</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 leading-relaxed">
          Laden Sie Ihr Dokument hoch und lassen Sie sich durch unsere KI-gesteuerte Analyse helfen. 
          Die KI prüft genau, ob alles korrekt ist und erstellt Ihnen ein passendes Schreiben, 
          das Sie direkt absenden können.
        </p>

        <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl mb-12">
          <div className="flex justify-center mb-6">
            <Upload size={48} className="text-blue-500 animate-bounce" />
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-xl font-bold transition-all shadow-lg shadow-blue-500/20">
            Dokument jetzt hochladen
          </button>
          <p className="mt-4 text-sm text-gray-500">PDF, JPG oder PNG (Max. 10MB)</p>
        </div>

        {/* Disclaimer Hinweis */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl mb-20 text-left">
          <p className="text-sm text-yellow-200/80">
            <strong>Hinweis:</strong> Wir bieten keine Rechtsberatung im Sinne des Rechtsdienstleistungsgesetzes an. 
            Unsere KI unterstützt Sie bei der Prüfung und Erstellung von Entwürfen. 
            Sie können die erstellten Schreiben ruhigen Gewissens nutzen, die finale Verantwortung liegt jedoch bei Ihnen.
          </p>
        </div>

        {/* Features / Abos Ersatz */}
        <div className="grid md:grid-cols-3 gap-6 pb-20">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <Scale className="text-blue-500 mb-4" />
            <h3 className="font-bold mb-2">KI-Rechtscheck</h3>
            <p className="text-sm text-gray-400">Prüfung auf Formfehler und Fristen.</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <FileText className="text-blue-500 mb-4" />
            <h3 className="font-bold mb-2">Fertige Schreiben</h3>
            <p className="text-sm text-gray-400">Direkter Download als PDF oder Word.</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <Shield className="text-blue-500 mb-4" />
            <h3 className="font-bold mb-2">Datenschutz</h3>
            <p className="text-sm text-gray-400">Ihre Dokumente werden sicher verschlüsselt.</p>
          </div>
        </div>
      </main>

      {/* Footer für AGB */}
      <footer className="border-t border-white/5 p-10 text-center text-gray-600 text-sm">
        <div className="space-x-6 mb-4">
          <Link href="/agb" className="hover:text-white">AGB</Link>
          <Link href="/datenschutz" className="hover:text-white">Datenschutz</Link>
          <Link href="/impressum" className="hover:text-white">Impressum</Link>
        </div>
        <p>© 2024 BescheidRecht. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
}
