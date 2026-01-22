'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, CheckCircle2, Scale, FileText, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans selection:bg-blue-600">
      {/* HEADER: Bleibt oben rechts wie im Original */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5 bg-[#05070a]">
        <div className="text-xl font-bold text-blue-500 uppercase tracking-tighter">BESCHEIDRECHT</div>
        <div className="flex items-center gap-6">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 text-[10px] font-bold">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>{l}</button>
            ))}
          </div>
          <Link href="/login" className="text-xs font-bold uppercase hover:text-blue-500 transition-colors">ANMELDEN</Link>
          <Link href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase shadow-lg shadow-blue-600/20">REGISTRIEREN</Link>
        </div>
      </nav>

      <main className="w-full max-w-[1500px] mx-auto pt-20 px-8 pb-40 text-center">
        {/* DEINE ÜBERSCHRIFT: Bleibt wie sie ist */}
        <h1 className="text-4xl md:text-6xl font-black mb-8 uppercase italic tracking-tighter leading-tight italic">Auch genug vom Behörden-Wahnsinn?</h1>
        <p className="text-gray-400 max-w-3xl mx-auto mb-16 text-xl">Laden Sie Ihr Dokument hoch und lassen Sie sich durch unsere KI-gesteuerte Analyse helfen.</p>

        {/* FUNKTIONS-BUTTONS: Fest nebeneinander */}
        <div className="max-w-4xl mx-auto bg-[#0a0c10] border border-white/10 p-12 rounded-[3.5rem] shadow-2xl mb-32">
          <div className="flex flex-row gap-6 w-full">
            <button onClick={() => setIsAnalyzed(true)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-12 rounded-3xl font-black italic uppercase tracking-[0.2em] flex items-center justify-center gap-4 border border-blue-400 shadow-2xl text-xl transition-all">
              <Upload size={32} /> SCHREIBEN HOCHLADEN
            </button>
            <button className={`flex-1 py-12 rounded-3xl font-black italic uppercase tracking-[0.2em] flex items-center justify-center gap-4 border text-xl transition-all ${isAnalyzed ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-white/5 border-white/10 text-gray-700 cursor-not-allowed opacity-40'}`}>
              <Download size={32} /> SCHREIBEN RUNTERLADEN
            </button>
          </div>
        </div>

        {/* ABO-SÄULEN: DER ERZWUNGENE AUFBAU PER INLINE-STYLE (PX WERTE) */}
        <div style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'flex-end', justifyContent: 'center', gap: '30px', width: '100%', marginBottom: '120px' }}>
          
          {/* SÄULE 1 */}
          <div style={{ backgroundColor: '#0d1117', minHeight: '750px', flex: '1', borderRadius: '48px', border: '1px solid rgba(255,255,255,0.05)', padding: '60px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '4px', opacity: 0.5, marginBottom: '25px' }}>BASIS</h3>
            <div style={{ fontSize: '72px', fontWeight: '900', fontStyle: 'italic', marginBottom: '40px', letterSpacing: '-3px' }}>9,90 €</div>
            <div style={{ flexGrow: 1, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '20px', fontWeight: '800', marginBottom: '30px', fontStyle: 'italic', textTransform: 'uppercase' }}><CheckCircle2 color="#2563eb" size={26} /> 5 Analysen</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '20px', fontWeight: '800', marginBottom: '30px', fontStyle: 'italic', textTransform: 'uppercase' }}><CheckCircle2 color="#2563eb" size={26} /> 5 Schreiben</li>
              </ul>
            </div>
            <button style={{ width: '100%', padding: '24px', borderRadius: '20px', fontWeight: '900', fontSize: '18px', backgroundColor: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>Wählen</button>
          </div>

          {/* SÄULE 2 (HIGHLIGHT - GRÖSSER) */}
          <div style={{ backgroundColor: '#2563eb', minHeight: '880px', flex: '1.1', borderRadius: '48px', border: '1px solid rgba(255,255,255,0.2)', padding: '60px', textAlign: 'left', display: 'flex', flexDirection: 'column', boxShadow: '0 0 60px rgba(37,99,235,0.4)', transform: 'scale(1.05)', zIndex: 10 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '4px', color: 'white', opacity: 0.8, marginBottom: '25px' }}>PLUS</h3>
            <div style={{ fontSize: '84px', fontWeight: '900', fontStyle: 'italic', marginBottom: '40px', letterSpacing: '-3px' }}>17,90 €</div>
            <div style={{ flexGrow: 1, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '40px' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '20px', fontWeight: '800', marginBottom: '30px', fontStyle: 'italic', textTransform: 'uppercase' }}><CheckCircle2 color="white" size={26} /> 15 Analysen</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '20px', fontWeight: '800', marginBottom: '30px', fontStyle: 'italic', textTransform: 'uppercase' }}><CheckCircle2 color="white" size={26} /> 15 Schreiben</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '20px', fontWeight: '800', marginBottom: '30px', fontStyle: 'italic', textTransform: 'uppercase' }}><CheckCircle2 color="white" size={26} /> Anträge</li>
              </ul>
            </div>
            <button style={{ width: '100%', padding: '24px', borderRadius: '20px', fontWeight: '900', fontSize: '18px', backgroundColor: 'white', color: '#2563eb', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>Wählen</button>
          </div>

          {/* SÄULE 3 */}
          <div style={{ backgroundColor: '#001428', minHeight: '750px', flex: '1', borderRadius: '48px', border: '1px solid rgba(255,255,255,0.05)', padding: '60px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '4px', opacity: 0.5, marginBottom: '25px' }}>SOZIAL PRO</h3>
            <div style={{ fontSize: '72px', fontWeight: '900', fontStyle: 'italic', marginBottom: '40px', letterSpacing: '-3px' }}>49 €</div>
            <div style={{ flexGrow: 1, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '20px', fontWeight: '800', marginBottom: '30px', fontStyle: 'italic', textTransform: 'uppercase' }}><CheckCircle2 color="#2563eb" size={26} /> 50 Analysen</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '20px', fontWeight: '800', marginBottom: '30px', fontStyle: 'italic', textTransform: 'uppercase' }}><CheckCircle2 color="#2563eb" size={26} /> Multi-Check</li>
              </ul>
            </div>
            <button style={{ width: '100%', padding: '24px', borderRadius: '20px', fontWeight: '900', fontSize: '18px', backgroundColor: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>Wählen</button>
          </div>

          {/* SÄULE 4 */}
          <div style={{ backgroundColor: '#001428', minHeight: '750px', flex: '1', borderRadius: '48px', border: '1px solid rgba(255,255,255,0.05)', padding: '60px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '4px', opacity: 0.5, marginBottom: '25px' }}>BUSINESS</h3>
            <div style={{ fontSize: '72px', fontWeight: '900', fontStyle: 'italic', marginBottom: '40px', letterSpacing: '-3px' }}>99 €</div>
            <div style={{ flexGrow: 1, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '20px', fontWeight: '800', marginBottom: '30px', fontStyle: 'italic', textTransform: 'uppercase' }}><CheckCircle2 color="#2563eb" size={26} /> unbegrenzt</li>
              </ul>
            </div>
            <button style={{ width: '100%', padding: '24px', borderRadius: '20px', fontWeight: '900', fontSize: '18px', backgroundColor: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>Wählen</button>
          </div>

        </div>

        {/* FOOTER INFO - BLEIBT UNTER DEN SÄULEN */}
        <div className="flex justify-between items-center opacity-20 border-t border-white/10 pt-10 max-w-5xl mx-auto">
          {["KI-RECHTSCHECK", "FERTIGE SCHREIBEN", "DATENSCHUTZ"].map((t, i) => (
            <span key={i} className="font-black text-xs tracking-widest uppercase italic">{t}</span>
          ))}
        </div>
      </main>
    </div>
  );
}
