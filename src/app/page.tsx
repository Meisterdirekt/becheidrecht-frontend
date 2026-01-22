'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  return (
    <div style={{ backgroundColor: '#05070a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
      {/* Navigation - Bleibt wie gewünscht */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', maxWidth: '1280px', margin: '0 auto', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6', letterSpacing: '-1px' }}>BESCHEIDRECHT</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: lang === l ? '#2563eb' : 'transparent', color: lang === l ? 'white' : '#6b7280' }}>{l}</button>
            ))}
          </div>
          <Link href="/login" style={{ fontSize: '12px', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}>ANMELDEN</Link>
          <Link href="/register" style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>REGISTRIEREN</Link>
        </div>
      </nav>

      <main style={{ maxWidth: '1600px', margin: '0 auto', paddingTop: '80px', paddingLeft: '32px', paddingRight: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '64px', fontWeight: '900', marginBottom: '32px', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-2px' }}>Auch genug vom Behörden-Wahnsinn?</h1>
        
        {/* Buttons - Bleiben exakt gleich aufgebaut */}
        <div style={{ maxWidth: '896px', margin: '0 auto 120px auto', backgroundColor: '#0a0c10', border: '1px solid rgba(255,255,255,0.1)', padding: '48px', borderRadius: '48px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button onClick={() => setIsAnalyzed(true)} style={{ flex: 1, backgroundColor: '#2563eb', color: 'white', padding: '40px', borderRadius: '24px', fontWeight: '900', fontSize: '20px', border: '1px solid #60a5fa', cursor: 'pointer', fontStyle: 'italic' }}><Upload style={{ marginRight: '12px' }} /> SCHREIBEN HOCHLADEN</button>
            <button style={{ flex: 1, backgroundColor: isAnalyzed ? 'white' : 'rgba(255,255,255,0.05)', color: isAnalyzed ? 'black' : '#374151', padding: '40px', borderRadius: '24px', fontWeight: '900', fontSize: '20px', border: '1px solid rgba(255,255,255,0.1)', cursor: isAnalyzed ? 'pointer' : 'not-allowed' }}><Download style={{ marginRight: '12px' }} /> SCHREIBEN RUNTERLADEN</button>
          </div>
        </div>

        {/* ABO-SÄULEN - RADIKAL GROSS (900px Höhe erzwungen) */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '32px', marginBottom: '160px' }}>
          {[
            { n: "BASIS", p: "9,90 €", f: ["5 Analysen", "5 Schreiben"], h: '800px', bg: '#0d1117' },
            { n: "PLUS", p: "17,90 €", f: ["15 Analysen", "15 Schreiben", "Anträge"], h: '950px', bg: '#2563eb', shadow: '0 0 60px rgba(37,99,235,0.4)', scale: '1.05' },
            { n: "SOZIAL PRO", p: "49 €", f: ["50 Analysen", "50 Schreiben"], h: '800px', bg: '#00142d' },
            { n: "BUSINESS", p: "99 €", f: ["Unbegrenzt", "Service"], h: '800px', bg: '#00142d' }
          ].map((plan, i) => (
            <div key={i} style={{ 
              flex: 1, 
              minWidth: '320px', 
              backgroundColor: plan.bg, 
              minHeight: plan.h, 
              borderRadius: '56px', 
              border: '1px solid rgba(255,255,255,0.1)', 
              padding: '64px', 
              textAlign: 'left', 
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: plan.shadow || 'none',
              transform: plan.scale ? `scale(${plan.scale})` : 'none',
              zIndex: plan.scale ? 10 : 1
            }}>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: '900', opacity: 0.5, letterSpacing: '4px', marginBottom: '32px' }}>{plan.n}</div>
                <div style={{ fontSize: '80px', fontWeight: '900', fontStyle: 'italic', marginBottom: '48px', letterSpacing: '-4px' }}>{plan.p}</div>
                <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '48px' }}></div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {plan.f.map((f, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '22px', fontWeight: 'bold', marginBottom: '32px', fontStyle: 'italic' }}>
                      <CheckCircle2 size={28} /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button style={{ width: '100%', padding: '28px', borderRadius: '24px', fontWeight: '900', fontSize: '20px', backgroundColor: plan.scale ? 'white' : '#2563eb', color: plan.scale ? '#2563eb' : 'white', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>Wählen</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
