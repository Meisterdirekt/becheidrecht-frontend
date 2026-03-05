import { analyzeDocument } from './src/lib/logic/forensic_engine';

async function runTest() {
  console.log("🔍 Prüfe System-Integrität...");
  const testText = "Bescheid vom 10.01.2026. Wir zahlen Ihnen 502 Euro Regelsatz.";
  
  try {
    const output = await analyzeDocument(testText);
    console.log("🚀 KI hat geantwortet!");
    console.log("Ergebnis:", JSON.stringify(output, null, 2));
  } catch (err: any) {
    console.error("❌ FEHLER:", err?.message || "Unbekannter Fehler");
  }
}

runTest();
