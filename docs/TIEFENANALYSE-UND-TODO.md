# Tiefenanalyse BescheidRecht – Stand & To-do für Go-Live

**Datum:** Nach vollständiger Prüfung von KI-Logik, JSON, Omega-Prompt, Rechtlichem und Build.

---

## 1. KI-Logik & Engine – Status: in Ordnung

- **engine.ts** lädt `vault/omega_prompt.txt` und `vault/error_catalog.json`; falls nicht vorhanden: Fallback-Prompt und leeres Katalog-Array.
- **OpenAI-Key:** zuerst aus `vault/keys.env`, sonst `process.env.OPENAI_API_KEY`.
- **Behördenfehler + Weisungen:** `content/behoerdenfehler_logik.json` und `content/weisungen_2025_2026.json` werden geladen und als Kontext in den System-Prompt eingebaut.
- **Ausgabe:** Strikte JSON-Struktur; bei Parse-Fehler oder fehlendem Key gibt die Engine eine klare Meldung zurück (z. B. „OpenAI-Key fehlt …“, „Engine-Fehler: …“).
- **Anpassung:** Diese Engine-Meldungen werden auf der Analyse-Seite jetzt als **Fehlermeldung** angezeigt (roter Kasten), nicht mehr als Musterschreiben-Text.

---

## 2. JSON-Logik (Behörden, Schreiben) – Status: in Ordnung

- **behoerdenfehler_logik.json:** Alle erwarteten IDs/Präfixe (BA_, ALG_, DRV_, PK_, …) vorhanden; Struktur mit titel, beschreibung, rechtsbasis, musterschreiben_hinweis, severity, prueflogik.
- **TRAEGER_TO_PREFIX** in letter-generator.ts deckt alle Träger ab; keine Lücken.
- **generate-letter** filtert die Logik nach Träger-Präfixen und baut bis zu 15 Einträge in den User-Prompt ein (titel, beschreibung, rechtsbasis, musterschreiben_hinweis).
- **weisungen_2025_2026.json** wird in der Engine als Kontext „Fachliche Weisungen BA“ genutzt.

---

## 3. Omega-Prompt & Rechtliches (§ 2 RDG) – Status: in Ordnung

- **Omega/Error-Katalog:** Nur in engine.ts; bei fehlendem Vault (z. B. Vercel) wird der Fallback-Prompt genutzt.
- **§ 2 RDG / keine Rechtsberatung:** In engine.ts, generate-letter System-Prompt, LetterPDF-Footer, AGB, Consent- und Warn-Texte (DE/EN/RU/AR/TR) umgesetzt.
- **AGB, Impressum, Datenschutz:** Anbieter, Adresse, Domain konsistent; Feedback und Echtzeit-Besucher in der Datenschutzerklärung erwähnt.

---

## 4. Fehlermeldungen – Status: bereinigt

- APIs liefern durchweg deutsche, verständliche `error`-Texte (401, 400, 403, 503, 500).
- Analyse-Seite: Engine-Fehler („OpenAI-Key fehlt“, „Engine-Fehler: …“, JSON-Parse-Hinweis) werden nun als Fehler angezeigt, nicht als Musterschreiben.
- **not-found.tsx** wurde ergänzt; Build schlägt nicht mehr fehl (zuvor „Cannot find module for page: /_not-found“).

---

## 5. Build – Status: erfolgreich

- `npm run build` läuft durch (nach Anlage von `app/not-found.tsx` und ggf. sauberem Build mit `rm -rf .next`).
- Einzige Warnung: Node.js 18 Deprecation (Supabase); optional auf Node 20+ wechseln.

---

## 6. Was du noch machen musst (To-do für Go-Live)

### Pflicht / wichtig

| Nr. | Aufgabe | Kurzbeschreibung |
|-----|--------|-------------------|
| 1 | **Digistore-Webhook** | In `src/app/api/webhook/route.ts` ist aktuell nur ein Stub (antwortet mit `{ received: true }`). Bei Digistore die Webhook-URL eintragen, Signatur prüfen, bei Zahlung in Supabase `user_subscriptions` eintragen/erhöhen. |
| 2 | **Umgebungsvariablen (Produktion)** | Auf Vercel (oder deinem Hosting): `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` setzen. Ohne ANTHROPIC_API_KEY funktioniert der Schreiben-Generator nicht. |
| 3 | **Domain** | bescheidrecht.de mit Vercel verbinden (DNS A/CNAME), SSL prüfen. |
| 4 | **Gewerbe anmelden** | Falls noch nicht geschehen: Gewerbe beim Gewerbeamt anmelden (Impressum/AGB verweisen auf dich als Anbieter). |
| 5 | **Kleinunternehmerregelung** | Impressum erwähnt bereits „USt wird nicht geführt (§ 19 UStG)“. Wenn du die Regelung nutzt, ist das so in Ordnung; bei Umsatzgrenze ggf. USt-ID nachtragen. |

### Optional / später

| Nr. | Aufgabe | Kurzbeschreibung |
|-----|--------|-------------------|
| 6 | **Omega-Prompt in Produktion** | Auf Vercel gibt es meist keinen `vault/`. Für bessere Analysequalität: Omega-Prompt (und ggf. error_catalog) als Env-Variable oder sichere Ablage bereitstellen und in engine einbauen. |
| 7 | **forensic_engine.ts** | Wird nicht genutzt; kann als Reserve bleiben oder gelöscht werden. |
| 8 | **Node-Version** | Optional auf Node 20+ wechseln (Supabase-Warnung vermeiden). |
| 9 | **Zahlungsflow testen** | Nach Webhook-Implementierung: Testkauf (Digistore Testmodus), prüfen ob Abo/Guthaben in Supabase ankommt. |
| 10 | **Google-Eintrag / Werbung** | Je nach Plan: Eintrag in Google Business, ggf. Anzeigen oder organische Sichtbarkeit. |

---

## Kurzfassung

- **Technik:** KI-Logik, JSON-Logik, Omega/Fallback, Gesetze/§ 2 RDG und Fehlermeldungen sind durchgängig geprüft und wo nötig angepasst.
- **Build:** Erfolgreich; keine fehlenden Seiten mehr.
- **Offen für den Start:** Vor allem Digistore-Webhook, Env-Variablen in Produktion, Domain, Gewerbe – der Rest ist optional oder später möglich.
