'use client';
import React from 'react';
import Link from 'next/link';
import FileUpload from '../components/FileUpload';
import { Shield, Gavel, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <nav className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield size={24} fill="white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">Bescheid<span className="text-blue-500">Recht</span></span>
        </div>
        <Link href="/login">
          <button className="px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm">Login</button>
        </Link>
      </nav>
      <header className="pt-24 pb-16 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6">Dein Recht in der <span className="text-blue-500">Omega-Instanz</span></h1>
        <p className="max-w-2xl mx-auto text-gray-400 text-lg mb-12">Lade deinen Bescheid hoch. Unsere KI prüft ihn auf Fehler und schreibt deinen Widerspruch.</p>
        <FileUpload />
      </header>
    </main>
  );
}
