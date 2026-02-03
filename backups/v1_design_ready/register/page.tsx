"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    pass: ''
  });

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center p-6 py-20">
      <div className="max-w-xl w-full bg-white/[0.03] border border-white/10 p-10 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-black mb-8 uppercase italic tracking-tighter">Registrierung</h1>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
          
          {/* Vor- & Nachname */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Vorname</label>
            <input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="Max" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Nachname</label>
            <input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="Mustermann" />
          </div>

          {/* E-Mail vollflächig */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">E-Mail Adresse</label>
            <input type="email" className="w-full bg-white/5 border border-white/10 p-4 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="name@beispiel.de" />
          </div>

          {/* Anschrift */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Straße & Hausnummer</label>
            <input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="Musterstraße 1" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">PLZ & Ort</label>
            <input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="12345 Berlin" />
          </div>

          {/* Passwort */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Passwort</label>
            <input type="password" occupation="new-password" className="w-full bg-white/5 border border-white/10 p-4 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="••••••••" />
          </div>

          {/* Button */}
          <div className="md:col-span-2 pt-4">
            <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-lg font-black text-[11px] uppercase tracking-widest transition-all">
              Account Erstellen
            </button>
          </div>
        </form>
        
        <div className="mt-8 flex flex-col gap-4 items-center border-t border-white/5 pt-8">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            Bereits ein Konto? <Link href="/login" className="text-blue-500 hover:underline">Hier anmelden</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
