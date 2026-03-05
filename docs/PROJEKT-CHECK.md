# Projekt-Check – Stand vor Go-Live

Einmaliger Durchlauf: Flows, JSON-Logik, Prompts, technische Konsistenz.

---

## ✅ Was durchgängig passt

### Behördenfehler-Logik (content/behoerdenfehler_logik.json)
- **Struktur:** Jeder Eintrag hat `id`, `titel`, `beschreibung`, `rechtsbasis`, `severity`, `prueflogik`, `musterschreiben_hinweis`, `severity_beschreibung`.
- **IDs/Präfixe:** BA_, ALG_, DRV_, PK_, SH_, KK_, FK_, JA_, EH_, UV_, VA_, BAMF_ – alle in der JSON vorhanden.
- **TRAEGER_TO_PREFIX (letter-generator.ts):** Jeder Träger (jobcenter, drv, krankenkasse, pflegekasse, …) hat passende Präfixe; jeder Präfix aus der JSON wird einem Träger zugeordnet. **Keine Lücken.**

### Analyse-Flow (engine.ts)
- Liest **content/behoerdenfehler_logik.json** und **content/weisungen_2025_2026.json**.
- **Vault (lokal):** omega_prompt.txt + error_catalog.json → wenn vorhanden, werden sie genutzt.
- **Ohne Vault (z. B. Vercel):** Fallback-Prompt + leeres Katalog-Array; Analyse läuft mit OPENAI_API_KEY.
- JSON-Schema für KI-Antwort ist fest vorgegeben; Fallback bei Parse-Fehler; § 2 RDG / vorsichtige Formulierungen im Prompt verankert.

### Schreiben-Generator (generate-letter)
- **loadBehoerdenLogik(prefixes)** filtert die JSON nach Träger-Präfixen; bis zu 15 Einträge gehen als Kontext in den User-Prompt (titel, beschreibung, rechtsbasis, musterschreiben_hinweis).
- System-Prompt: Betreff, Bezug Bescheid, Sachverhalt, Rechtsgrundlage, Forderung, Frist (1 Monat bei Widerspruch), Grußformel; kein „rechtssicher“; § 2 RDG.
- Aktenzeichen/Bescheiddatum validiert; 7 Schreibentypen inkl. „Änderungsantrag / Höherstufung“.

### Weisungen (content/weisungen_2025_2026.json)
- Gültiges JSON; Struktur `bundesagentur_fuer_arbeit` → Weisungsnummern mit datum, gueltig_ab, thema, sgb_ii/sgb_iii, rechtsgrundlage. Wird von der Analyse-Engine als Kontext mitgegeben.

### Auth & Abo
- Analyze: Auth erforderlich; use-analysis reduziert Guthaben (in Produktion); **Dev-Modus:** 999 Analysen, kein Abzug.
- Generate-letter: in Produktion Abo-Check; **Dev-Modus:** Check übersprungen.
- subscription-status: einheitlich; in Dev 999 für Tests.

### Frontend
- Mehrsprachigkeit (DE/EN/RU/AR/TR) für Startseite, Nav, Footer, Formulare.
- Behörden/Schreibentypen bleiben bewusst auf Deutsch.
- PDF DIN A4 (LetterPDF), Druck-CSS, Copy/PDF/Drucken-Buttons; Bild-Upload für Analyse (OCR) mit 10-MB-Limit.

---

## ⚠️ Offen / zu beachten

### 1. Payment-Webhook (Digistore)
- **src/app/api/webhook/route.ts** ist aktuell Stub: `POST` antwortet nur mit `{ received: true }`.
- **Bis Go-Live:** Webhook-URL bei Digistore eintragen und in der Route echte Verarbeitung einbauen (Signature prüfen, Zahlung zuordnen, in Supabase `user_subscriptions` eintragen/erhöhen).

### 2. Omega-Prompt / Vault (Analyse-Qualität)
- **Lokal:** Wenn `vault/omega_prompt.txt` und `vault/error_catalog.json` existieren, nutzt die Analyse-Engine sie.
- **Vercel/Production:** Meist kein vault → es gilt der **Fallback-Prompt** in engine.ts (kurz, generisch). Für feiner abgestimmte Analysen später: Omega-Prompt als Env-Variable oder sichere Ablage (nicht im Repo) bereitstellen und in engine einbauen.

### 3. forensic_engine.ts
- Wird **nicht** verwendet; Analyse läuft ausschließlich über **engine.ts** (runForensicAnalysis). Datei kann Legacy/Reserve sein – kein Fehler, nur Hinweis.

### 4. Umgebungsvariablen
- **.env.example** enthält jetzt Hinweise für OPENAI_API_KEY und **ANTHROPIC_API_KEY** (für Schreiben-Generator).
- Ohne ANTHROPIC_API_KEY antwortet generate-letter mit „nicht konfiguriert“.

---

## Kurzfassung

- **JSON-Logik (Behördenfehler + Weisungen):** Konsistent, alle Träger zugeordnet, bis ins Detail nutzbar.
- **Omega-/System-Prompts (Analyse + Schreiben):** Klar strukturiert, RDG-konform, Kontext aus behoerdenfehler_logik wird korrekt eingebunden.
- **Technik:** Auth, Abo, Dev-Testmodus, Mehrsprache, PDF/Druck, Bild-Upload – durchgängig verzahnt.

**Konkret vor Go-Live:** Digistore-Webhook implementieren; ANTHROPIC_API_KEY (und ggf. OPENAI_API_KEY) auf Vercel setzen. Optional: Omega-Prompt/Error-Katalog für Produktion bereitstellen.
