"use client";
import { useState } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState("Bereit für System-Check...");
  const [ergebnis, setErgebnis] = useState("");

  const starteTest = async () => {
    setStatus("⏳ KI arbeitet... Bitte warten...");
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: "Bescheid vom 10.01.2026. Ihr Regelsatz beträgt 502 Euro." }),
      });
      const data = await res.json();
      setErgebnis(JSON.stringify(data, null, 2));
      setStatus("✅ Analyse abgeschlossen!");
    } catch (error) {
      setStatus("❌ Fehler beim Aufruf der API");
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#121212', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#00ff00' }}>🚀 BescheidRecht KI-Zentrale</h1>
      <p>Status: <strong>{status}</strong></p>
      <button 
        onClick={starteTest}
        style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer', background: '#00ff00', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
      >
        MOTOR STARTEN
      </button>
      <div style={{ marginTop: '30px' }}>
        <h3>Ergebnis der KI:</h3>
        <pre style={{ background: '#000', padding: '20px', borderRadius: '10px', overflowX: 'auto', border: '1px solid #333' }}>
          {ergebnis || "Noch keine Daten..."}
        </pre>
      </div>
    </div>
  );
}
