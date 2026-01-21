'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Shield size={28} fill="white" />
          </div>
          <h2 className="text-3xl font-bold">Konto erstellen</h2>
          <p className="text-gray-400 mt-2">Starte deine erste Analyse</p>
        </div>
        
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Deine E-Mail" 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition-all">
            Jetzt Registrieren
          </button>
        </div>

        <p className="text-center mt-6 text-gray-500 text-sm">
          Bereits ein Konto? <Link href="/login" className="text-blue-500">Einloggen</Link>
        </p>
      </div>
    </div>
  );
}
