# 📝 NEUE TEXTE FÜR STARTSEITE (RECHTSSICHER)

## 🎯 ZU ÄNDERNDE STELLEN IN src/app/page.tsx

---

## 1️⃣ TRANSLATIONS OBJEKT (Zeile 7-34)

**ERSETZEN Sie die DE-Texte mit:**

```typescript
const translations = {
  DE: {
    headline: "Behördenschreiben verstehen und strukturieren",
    subheadline: "Software-Tool zur technischen Analyse von Bescheiden – findet Unstimmigkeiten und bereitet Daten strukturiert auf",
    dropzone: "Bescheid hochladen",
    dropzoneSub: "PDF, JPG oder PNG",
    pricingTitle: "TRANSPARENTE PREISE",
    aboutTitle: "WAS WIR BIETEN",
    aboutText: "BescheidRecht ist ein technisches Hilfsmittel zur strukturierten Analyse von Behördenschreiben. Unsere Software prüft automatisch auf formelle Fehler und Unstimmigkeiten – basierend auf öffentlich zugänglichen Verwaltungsvorschriften. Wir bieten KEINE Rechtsberatung und ersetzen keinen Anwalt.",
    step1: "Technische Fehlerprüfung",
    step1Text: "Automatisierte Prüfung auf formelle Unstimmigkeiten, fehlende Angaben und Rechenfehler.",
    step2: "Strukturierte Aufbereitung",
    step2Text: "Übersichtliche Darstellung aller relevanten Daten für Beratungsgespräche.",
    step3: "Musterschreiben-Vorlage",
    step3Text: "Automatisch generierte Vorlage als Basis – keine fertige Rechtsschrift, sondern Orientierung.",
    singlePurchase: "EINZELANALYSE",
    consentText: "ICH WILLIGE EIN, DASS MEINE DATEN ZUR TECHNISCHEN ANALYSE VERARBEITET WERDEN. MIR IST BEKANNT, DASS DIES KEINE RECHTSBERATUNG IST UND KEINEN ANWALT ERSETZT.",
    disclaimer: "⚠️ KEINE RECHTSBERATUNG – Diese technische Analyse ersetzt keine anwaltliche Beratung. Wir sind keine Rechtsanwälte. Bei rechtlichen Fragen konsultieren Sie bitte einen Fachanwalt oder eine anerkannte Beratungsstelle.",
    footer: "© 2026 BESCHEIDRECHT – TECHNISCHE DOKUMENTENANALYSE, KEINE RECHTSBERATUNG",
    features: { analysis: "Technische Analyse", draft: "Musterschreiben-Vorlage", doc: "Dokumente" },
    login: "ANMELDEN",
    register: "JETZT STARTEN"
  },
  // EN, TR, AR, RU bleiben erstmal, können später übersetzt werden
};
```

---

## 2️⃣ BEHÖRDEN-LISTE HINZUFÜGEN

**Nach den translations (ca. Zeile 35), NEU hinzufügen:**

```typescript
// Liste der unterstützten Behörden/Ämter
const supportedAuthorities = [
  "Jobcenter (Bürgergeld/ALG II)",
  "Agentur für Arbeit (Arbeitslosengeld)",
  "Krankenkassen (GKV)",
  "Pflegekassen (Pflegeversicherung)",
  "Deutsche Rentenversicherung",
  "Sozialamt (Grundsicherung/Sozialhilfe)",
  "Versorgungsamt (Schwerbehinderung)",
  "Berufsgenossenschaft (Unfallversicherung)",
  "Wohngeldstelle",
  "Familienkasse (Kindergeld)",
  "BAföG-Amt",
  "Elterngeldstelle"
];
```

---

## 3️⃣ HERO-SECTION MIT DISCLAIMER

**Die Hero-Section (ca. Zeile 150-190) ERSETZEN mit:**

```typescript
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pb-28 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 text-center uppercase tracking-tighter leading-tight">
            {t.headline}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 text-center mb-10 max-w-3xl mx-auto leading-relaxed">
            {t.subheadline}
          </p>

          {/* DISCLAIMER - Rot umrandet, prominent */}
          <div className="max-w-3xl mx-auto mb-10 bg-red-50 border-2 border-red-300 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-black text-red-900 uppercase tracking-wide mb-2">
                  KEINE RECHTSBERATUNG
                </h3>
                <p className="text-sm text-red-800 leading-relaxed">
                  {t.disclaimer}
                </p>
              </div>
            </div>
          </div>

          {/* Unterstützte Behörden */}
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Technische Analyse von Bescheiden dieser Stellen:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {supportedAuthorities.map((authority, idx) => (
                <span
                  key={idx}
                  className="inline-block px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200"
                >
                  {authority}
                </span>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="#upload"
              className="px-8 py-4 bg-blue-600 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg"
            >
              Bescheid analysieren
            </a>
            <a
              href="#pricing"
              className="px-8 py-4 bg-slate-100 text-slate-900 font-black text-sm uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
            >
              Preise ansehen
            </a>
          </div>
        </div>
      </section>
```

---

## 4️⃣ CONSENT-TEXT ANPASSEN

**Den Consent-Bereich (ca. Zeile 215-220) ANPASSEN:**

```typescript
        <div className="flex items-start gap-4 text-left max-w-lg mx-auto bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-md mb-6">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-5 w-5 accent-blue-600 cursor-pointer rounded"
          />
          <label className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed cursor-pointer">
            {t.consentText}
          </label>
        </div>

        <p className="max-w-2xl mx-auto mb-10 text-[10px] text-red-600 font-bold uppercase tracking-[0.15em] leading-relaxed text-center bg-red-50 border border-red-200 rounded-xl p-4">
          ⚠️ Hinweis: Automatisierte, technische Analyse – KEINE Rechtsberatung, ersetzt keinen Anwalt.
          Musterschreiben sind Vorlagen, keine fertigen Rechtsschriften.
        </p>
```

---

## 5️⃣ ERGEBNIS-BEREICH MIT DISCLAIMER

**Im Musterschreiben-Bereich (ca. Zeile 266-289) OBEN einfügen:**

```typescript
            {/* Rechte Spalte: Musterschreiben */}
            <div className="p-6 md:p-8 bg-slate-900 text-white rounded-2xl text-left border border-blue-400/30 shadow-xl shadow-slate-900/20 min-h-[260px] flex flex-col">
              {/* DISCLAIMER OBEN */}
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                <p className="text-xs text-red-200 font-bold">
                  ⚠️ VORLAGE – KEINE RECHTSSCHRIFT!
                  <br/>
                  Lassen Sie dieses Musterschreiben vor Verwendung von einem Anwalt oder Sozialverband prüfen!
                </p>
              </div>

              <h3 className="text-blue-300 font-black text-[10px] uppercase tracking-widest mb-4">
                KI-Generierte Musterschreiben-VORLAGE
              </h3>
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed opacity-90 flex-1">
                {analysisResult || 'Noch keine Vorlage vorhanden. Bitte einen Bescheid hochladen.'}
              </pre>
```

---

## 6️⃣ ABOUT-SECTION ANPASSEN

**Die About-Section (ca. Zeile 303-308):**

```typescript
      <section className="bg-slate-50 py-20 md:py-28 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 uppercase tracking-tighter">
            {t.aboutTitle}
          </h2>
          <p className="text-slate-600 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-8">
            {t.aboutText}
          </p>

          {/* Zusätzlicher Disclaimer */}
          <div className="max-w-2xl mx-auto bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
            <p className="text-sm text-amber-900 font-medium">
              <strong>Wichtig:</strong> Unsere Software dient der Vorbereitung für Gespräche
              mit Rechtsanwälten, Sozialverbänden (z.B. VdK, SoVD) oder Verbraucherzentralen.
              Sie ersetzt keine individuelle rechtliche Beratung.
            </p>
          </div>
        </div>
      </section>
```

---

## 7️⃣ FOOTER ANPASSEN

**Im Footer (ca. Zeile 350-358):**

```typescript
      <footer className="bg-slate-950 text-slate-400 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
            <Link href="/impressum" className="text-[11px] font-bold tracking-widest uppercase hover:text-blue-400 transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-[11px] font-bold tracking-widest uppercase hover:text-blue-400 transition-colors">
              Datenschutz
            </Link>
            <Link href="/agb" className="text-[11px] font-bold tracking-widest uppercase hover:text-blue-400 transition-colors">
              AGB
            </Link>
          </div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-4">
            {t.footer}
          </p>
          <p className="text-[9px] text-slate-600 max-w-2xl mx-auto">
            BescheidRecht bietet technische Dokumentenanalyse ohne Rechtsberatung.
            Wir sind keine Rechtsanwälte. Diese Software ersetzt keine anwaltliche Beratung.
          </p>
        </div>
      </footer>
```

---

## ✅ ZUSAMMENFASSUNG

**Was geändert wird:**
1. ✅ Headline: "Behördenschreiben verstehen..."
2. ✅ Alle Sozialbehörden aufgelistet (12 Behörden)
3. ✅ Disclaimer ROT umrandet (prominent)
4. ✅ "Keine Rechtsberatung" überall
5. ✅ "Musterschreiben-Vorlage" statt "Widerspruch"
6. ✅ Consent-Text angepasst
7. ✅ Footer mit Disclaimer

**Soll ich die KOMPLETTE neue page.tsx erstellen?**
- Dann sage: "Ja, erstelle die komplette Datei"
- Oder: "Ich mache es selbst" (mit dieser Anleitung)

Was wollen Sie? 💪
