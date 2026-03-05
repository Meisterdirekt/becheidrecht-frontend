# 🚀 BESCHEIDRECHT - KOMPLETTE LAUNCH-CHECKLISTE

**Von der Idee bis zur Live-Schaltung**

---

## 📊 ÜBERSICHT

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 1: Technisches Setup           │ ✅ IN ARBEIT    │
│ PHASE 2: Supabase-Konfiguration     │ ⏳ NEXT         │
│ PHASE 3: Rechtliches & Gewerbe      │ 📋 OFFEN        │
│ PHASE 4: Payment (Digistore24)      │ 📋 OFFEN        │
│ PHASE 5: Domain & E-Mail            │ 📋 OFFEN        │
│ PHASE 6: Deployment & Testing       │ 📋 OFFEN        │
│ PHASE 7: DSGVO & Compliance         │ 📋 OFFEN        │
│ PHASE 8: Live-Schaltung             │ 📋 OFFEN        │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ PHASE 1: TECHNISCHES SETUP (ERLEDIGT!)

### 1.1 Supabase Keys ✅
- [x] Korrekter ANON_KEY eingetragen
- [x] Supabase URL korrekt
- [x] Lokale .env.local aktualisiert
- [x] Auth-Config getestet → `configured: true`

**Status:** ✅ KOMPLETT

---

## ⏳ PHASE 2: SUPABASE-KONFIGURATION (JETZT!)

### 2.1 E-Mail-Bestätigung ausschalten (WICHTIG!)

**Warum:** Ohne SMTP-Setup würden Nutzer keine Bestätigungs-E-Mails bekommen.

**Schritte:**
1. **Öffnen:** https://supabase.com/dashboard
2. **Projekt auswählen:** xprrzmcickfparpogbpj
3. **Navigation:** Authentication → Providers
4. **Email finden** und anklicken
5. **"Confirm email" auf AUS schalten**
6. **Save** klicken

**Ergebnis:** Nutzer können sich sofort nach Registrierung anmelden.

✅ **TODO:** Diese Einstellung jetzt vornehmen!

---

### 2.2 URL Configuration (wichtig für Redirects)

**Schritte:**
1. **Supabase Dashboard:** Authentication → URL Configuration
2. **Site URL:** `https://bescheidrecht.de` (oder Ihre Domain)
3. **Redirect URLs hinzufügen:**
   ```
   https://bescheidrecht.de/**
   https://www.bescheidrecht.de/**
   http://localhost:3000/** (für lokale Entwicklung)
   ```
4. **Save**

✅ **TODO:** Nach Domain-Setup durchführen

---

### 2.3 E-Mail Templates (optional, später)

**Für später (wenn SMTP konfiguriert):**
- Confirm Signup Template
- Reset Password Template
- Invite User Template

**Jetzt:** Kann übersprungen werden (E-Mail-Bestätigung ist aus)

---

## 📋 PHASE 3: RECHTLICHES & GEWERBE

### 3.1 Gewerbeanmeldung 🏢

**Was Sie brauchen:**
- [ ] Personalausweis
- [ ] Ca. 20-60€ Gebühr (je nach Stadt)
- [ ] Tätigkeitsbeschreibung

**Wo:**
- Gewerbeamt Ihrer Stadt/Gemeinde
- Oft online möglich: https://www.gewerbeanmeldung.de

**Tätigkeit angeben:**
```
"Online-Dienstleistungen im Bereich Rechtsberatung und
Dokumentenanalyse; SaaS-Anwendung zur Analyse von
Behördenbescheiden"
```

⚠️ **WICHTIG:**
- Keine Rechtsberatung im engeren Sinne (würden Anwaltslizenz brauchen)
- Formulierung: "Technische Analyse und Aufbereitung von Dokumenten"

**Nach Anmeldung erhalten Sie:**
- ✅ Gewerbeschein
- ✅ Steuernummer (automatisch vom Finanzamt)
- ✅ Fragebogen zur steuerlichen Erfassung

---

### 3.2 Steuernummer & Finanzamt 💰

**Automatisch nach Gewerbeanmeldung:**
1. Gewerbeamt meldet Ihr Gewerbe ans Finanzamt
2. Finanzamt schickt "Fragebogen zur steuerlichen Erfassung"
3. Fragebogen ausfüllen (ca. 2-4 Wochen Bearbeitungszeit)
4. Sie erhalten Steuernummer per Post

**Was Sie angeben müssen:**
- Geschätzte Umsätze (1. Jahr)
- Rechtsform (Einzelunternehmen)
- Kleinunternehmerregelung? (Empfehlung: JA, wenn Umsatz < 22.000€)

**Kleinunternehmerregelung:**
- ✅ Keine Umsatzsteuer ausweisen
- ✅ Keine Umsatzsteuer-Voranmeldung
- ✅ Einfachere Buchhaltung
- ⚠️ Keine Vorsteuer-Abzug

---

### 3.3 Impressum ✍️

**Pflichtangaben (§5 TMG):**
```
Name und Anschrift:
[Ihr vollständiger Name]
[Straße, Hausnummer]
[PLZ, Ort]

Kontakt:
E-Mail: info@bescheidrecht.de
Telefon: [Optional, aber empfohlen]

Steuernummer: [Nach Erhalt eintragen]
oder USt-IdNr.: [Falls vorhanden]

Verantwortlich für den Inhalt:
[Ihr Name]

Berufshaftpflichtversicherung:
[Optional, aber empfohlen bei Rechtsdienstleistungen]

Verbraucherstreitbeilegung:
Wir sind nicht verpflichtet und nicht bereit, an einem
Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
teilzunehmen.
```

**Wo eintragen:**
- Datei: `/src/app/impressum/page.tsx`
- TODO: Nach Gewerbeanmeldung aktualisieren

---

### 3.4 Datenschutzerklärung 🔒

**Pflichtangaben (DSGVO):**
- [ ] Verantwortlicher (Ihr Name, Anschrift)
- [ ] Datenschutzbeauftragter (nur bei >20 Mitarbeitern Pflicht)
- [ ] Welche Daten werden erhoben?
  - E-Mail, Name bei Registrierung
  - Hochgeladene Dokumente
  - Analyseergebnisse
- [ ] Rechtsgrundlage (Art. 6 DSGVO)
- [ ] Speicherdauer
- [ ] Rechte der Betroffenen
- [ ] Cookies & Tracking
- [ ] Supabase als Auftragsverarbeiter
- [ ] OpenAI als Auftragsverarbeiter (für KI-Analyse)

**Generator nutzen:**
- https://www.e-recht24.de/muster-datenschutzerklaerung.html (Premium)
- https://datenschutz-generator.de (Kostenlos, Basis)

**TODO:**
- Generator nutzen
- Text in `/src/app/datenschutz/page.tsx` einfügen
- Supabase und OpenAI als Dienstleister erwähnen

---

### 3.5 AGB (Allgemeine Geschäftsbedingungen) 📜

**Wichtige Punkte:**
- Vertragsschluss (bei Registrierung / Zahlung)
- Leistungsumfang (Analyse, aber KEINE Rechtsberatung!)
- Haftungsausschluss
- Widerrufsrecht (14 Tage bei Online-Käufen)
- Laufzeit und Kündigung
- Zahlungsbedingungen
- Urheberrechte
- Schlussbestimmungen

**Wo holen:**
- IT-Recht-Kanzlei München (€): https://www.it-recht-kanzlei.de
- Trusted Shops (€): https://www.trustedshops.de
- Anwalt für IT-Recht konsultieren (empfohlen!)

⚠️ **WICHTIG:**
Keine kostenlosen Muster aus dem Internet!
Bei Rechtsdienstleistungen ist rechtssichere AGB wichtig.

**TODO:**
- AGB von Anwalt erstellen lassen (ca. 300-800€)
- Text in `/src/app/agb/page.tsx` einfügen

---

## 💰 PHASE 4: PAYMENT - DIGISTORE24 INTEGRATION

### 4.1 Digistore24 Account erstellen

**Schritte:**
1. **Registrieren:** https://www.digistore24.com/join
2. **Verifizierung:** Personalausweis hochladen
3. **Bankverbindung:** IBAN angeben (für Auszahlungen)
4. **Steuerdaten:** Nach Erhalt eintragen

**Gebühren:**
- 7,9% + 1€ pro Verkauf (Deutschland)
- Automatische Abwicklung von Steuern
- Automatische Rechnungserstellung

---

### 4.2 Produkt in Digistore24 anlegen

**Produkt-Setup:**
1. **Digistore Dashboard:** Produkte → Neues Produkt
2. **Produktname:** "BescheidRecht - Bescheidanalyse"
3. **Produkttyp:** Dienstleistung / SaaS
4. **Preis:** Z.B. 29,90€ (einmalig) oder 9,90€/Monat (Abo)
5. **Mehrwertsteuer:** 19% (wenn keine Kleinunternehmerregelung)
6. **Lieferung:** Sofort (digitales Produkt)

**Zahlungsarten aktivieren:**
- [x] Kreditkarte (empfohlen)
- [x] PayPal
- [x] Sofortüberweisung
- [x] SEPA-Lastschrift

---

### 4.3 Digistore24 API Integration

**Was wir brauchen:**
- Digistore24 Product-ID
- IPN (Instant Payment Notification) Webhook
- API-Key (für erweiterte Integration)

**Integration in die App:**

**Datei erstellen:** `/src/app/api/digistore/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Digistore24 IPN verarbeiten
    const { event, order_id, buyer_email, product_id } = data;

    if (event === 'on_payment') {
      // Zahlung erfolgreich → Nutzer freischalten
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // User in Datenbank als "paid" markieren
      await supabase
        .from('users')
        .update({ subscription_status: 'active', order_id })
        .eq('email', buyer_email);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
```

**Webhook in Digistore24 eintragen:**
1. Digistore Dashboard → Produkt → IPN-Einstellungen
2. URL: `https://bescheidrecht.de/api/digistore/webhook`
3. Alle Events aktivieren: `on_payment`, `on_refund`, `on_rebill`

---

### 4.4 Bezahlseite erstellen

**Datei:** `/src/app/pricing/page.tsx` (neu erstellen)

**Features:**
- Preisübersicht
- "Jetzt kaufen" Button
- Redirect zu Digistore24 Checkout
- Nach Zahlung: Redirect zurück zur App

**Digistore Checkout-Link:**
```
https://www.digistore24.com/product/[PRODUCT_ID]?email={USER_EMAIL}
```

---

### 4.5 Supabase: User Subscription Tracking

**Datenbank-Tabelle erstellen:**

```sql
-- In Supabase: SQL Editor
CREATE TABLE user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  subscription_status text CHECK (subscription_status IN ('free', 'active', 'cancelled', 'expired')),
  order_id text,
  product_id text,
  started_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Index für schnelle Abfragen
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_email ON user_subscriptions(email);
```

---

## 🌐 PHASE 5: DOMAIN & E-MAIL (HOSTINGER)

### 5.1 Domain bei Hostinger

**Sie haben bereits:**
- Domain: bescheidrecht.de (vermutlich)
- Hosting: Hostinger

**Prüfen:**
1. Hostinger Login: https://www.hostinger.de
2. Domains → bescheidrecht.de
3. DNS-Einstellungen prüfen

---

### 5.2 Domain mit Vercel verbinden

**Schritte:**
1. **Vercel Dashboard:** https://vercel.com/dashboard
2. **Projekt auswählen:** bescheidrecht-frontend
3. **Settings → Domains**
4. **Add Domain:** bescheidrecht.de
5. **Vercel zeigt DNS-Einträge:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

6. **Hostinger DNS aktualisieren:**
   - Hostinger → Domains → bescheidrecht.de → DNS
   - A-Record: @ → 76.76.21.21
   - CNAME: www → cname.vercel-dns.com
   - TTL: 3600

7. **Warten:** 5-60 Minuten (DNS-Propagation)
8. **Vercel prüft automatisch** und stellt SSL-Zertifikat aus

---

### 5.3 E-Mail bei Hostinger einrichten

**E-Mail-Adressen erstellen:**
1. **Hostinger:** E-Mail → E-Mail-Konten
2. **Erstellen:**
   - info@bescheidrecht.de (Kundenservice)
   - noreply@bescheidrecht.de (Systemmails)
   - support@bescheidrecht.de (Support-Anfragen)

**Passwörter:** Sicher generieren und speichern!

---

### 5.4 SMTP für Supabase (optional, später)

**Wenn Sie E-Mail-Bestätigung aktivieren wollen:**

1. **Hostinger Support kontaktieren:**
   ```
   Betreff: SMTP-Daten für externes Versenden

   Ich möchte E-Mails über noreply@bescheidrecht.de von
   einer externen Anwendung (Supabase) versenden.

   Bitte teilen Sie mir die SMTP-Daten mit:
   - Host
   - Port
   - Verschlüsselung (TLS/SSL)
   - Authentifizierung
   ```

2. **Supabase konfigurieren:**
   - Dashboard → Project Settings → Auth → SMTP
   - Host, Port, Username, Password eintragen
   - Test-Mail senden

**Jetzt:** Kann übersprungen werden (E-Mail-Bestätigung ist aus)

---

## 🚀 PHASE 6: DEPLOYMENT & TESTING

### 6.1 Vercel Environment Variables

**Umgebungsvariablen in Vercel setzen:**

1. **Vercel Dashboard:** Settings → Environment Variables
2. **Hinzufügen (für Production):**

```
NEXT_PUBLIC_SUPABASE_URL=https://xprrzmcickfparpogbpj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (Ihr Key)
SUPABASE_URL=https://xprrzmcickfparpogbpj.supabase.co
SUPABASE_ANON_KEY=eyJ... (Ihr Key)
SUPABASE_SERVICE_ROLE_KEY=[Aus Supabase Dashboard]
OPENAI_API_KEY=[Ihr OpenAI Key]
OMEGA_PROMPT=[Ihr KI-Prompt]
```

3. **Save**

---

### 6.2 Git Repository & Deployment

**Falls noch nicht gemacht:**

```bash
cd /home/henne1990/bescheidrecht-frontend

# Git initialisieren
git init
git add .
git commit -m "Initial commit - Launch-ready"

# GitHub Repository erstellen (auf github.com)
# Dann verbinden:
git remote add origin https://github.com/IHR-USERNAME/bescheidrecht-frontend.git
git branch -M main
git push -u origin main
```

**Vercel automatisch deployen:**
- Vercel ist bereits mit Git verbunden?
- Jeder Push → automatisches Deployment
- Preview für jeden Branch

---

### 6.3 Testing Checkliste

**Vor Live-Schaltung testen:**

**Registrierung & Login:**
- [ ] Neue E-Mail registrieren
- [ ] Sofortige Weiterleitung zur Startseite
- [ ] Eingeloggt bleiben nach Reload
- [ ] Ausloggen funktioniert
- [ ] Erneut einloggen

**Passwort-Reset:**
- [ ] "Passwort vergessen" → E-Mail kommt an (wenn SMTP aktiv)
- [ ] Reset-Link funktioniert
- [ ] Neues Passwort setzen
- [ ] Login mit neuem Passwort

**Dokument-Analyse:**
- [ ] PDF hochladen funktioniert
- [ ] OCR erkennt Text
- [ ] KI-Analyse läuft
- [ ] Ergebnis wird angezeigt
- [ ] Download als PDF funktioniert

**Payment (wenn integriert):**
- [ ] Pricing-Seite anzeigen
- [ ] Digistore24 Checkout öffnet
- [ ] Test-Zahlung (Digistore Test-Mode)
- [ ] User wird freigeschaltet

**Rechtliches:**
- [ ] Impressum vollständig
- [ ] Datenschutz vollständig
- [ ] AGB vollständig
- [ ] Cookie-Banner (falls verwendet)

**Mobile:**
- [ ] Responsive Design auf Handy
- [ ] Alle Funktionen auf Tablet
- [ ] Touch-Bedienung funktioniert

**Performance:**
- [ ] Lighthouse Score > 90
- [ ] Ladezeit < 3 Sekunden
- [ ] Bilder optimiert

---

## 🔒 PHASE 7: DSGVO & COMPLIANCE

### 7.1 Datenschutz-Verträge

**Auftragsverarbeitungsverträge (AVV):**

1. **Supabase:**
   - Standard DPA: https://supabase.com/dpa
   - Herunterladen und archivieren
   - Server-Standort: EU (gut für DSGVO!)

2. **OpenAI:**
   - DPA: https://openai.com/policies/data-processing-addendum
   - ⚠️ Server in USA → zusätzliche Maßnahmen nötig
   - Nutzer informieren in Datenschutzerklärung

3. **Vercel:**
   - DPA: https://vercel.com/legal/dpa
   - Server weltweit → EU-Server bevorzugen

4. **Digistore24:**
   - DPA automatisch bei Nutzung
   - https://www.digistore24.com/datenschutz

---

### 7.2 Cookie-Banner (falls nötig)

**Wann nötig?**
- Wenn Sie Tracking-Cookies verwenden (Google Analytics, Facebook Pixel, etc.)
- Wenn Sie Marketing-Cookies setzen

**Wenn KEINE Cookies außer technisch notwendige:**
- Kein Banner nötig
- In Datenschutzerklärung erwähnen

**Wenn doch:**
- Lösung: Cookiebot, Usercentrics, Borlabs Cookie
- Kosten: ca. 9-39€/Monat

---

### 7.3 Berufshaftpflicht (empfohlen!)

**Warum?**
- Sie analysieren rechtliche Dokumente
- Fehler könnten Nutzer Geld kosten
- Schutz vor Schadensersatzforderungen

**Wo?**
- Hiscox (Online-Dienstleister): https://www.hiscox.de
- Exali (IT & Online): https://www.exali.de
- Kosten: ca. 10-30€/Monat

**Deckungssumme:**
- Mindestens 1 Mio. € (empfohlen: 3 Mio. €)

---

## 🎯 PHASE 8: LIVE-SCHALTUNG

### 8.1 Pre-Launch Checkliste

**24 Stunden vor Launch:**

- [ ] Alle Tests durchgeführt (Phase 6.3)
- [ ] Impressum, Datenschutz, AGB online
- [ ] Gewerbeschein vorhanden
- [ ] Steuernummer vorhanden (oder Antrag gestellt)
- [ ] Digistore24 konfiguriert
- [ ] Domain mit Vercel verbunden
- [ ] SSL-Zertifikat aktiv (https://)
- [ ] E-Mails funktionieren
- [ ] Backup-System eingerichtet (Supabase macht automatisch)
- [ ] Monitoring eingerichtet (Vercel Analytics)

---

### 8.2 Launch-Day

**Morgens:**
1. [ ] Letzte Tests auf Produktionsumgebung
2. [ ] Alle Team-Mitglieder informiert (falls vorhanden)
3. [ ] Support-E-Mail bereit (info@bescheidrecht.de)

**Launch:**
1. [ ] Domain von "Wartungsmodus" auf "Live" schalten
2. [ ] Social Media Posts vorbereitet (optional)
3. [ ] Erste Kunden-Anmeldungen überwachen

**Abends:**
1. [ ] Logs prüfen (Vercel Dashboard)
2. [ ] Fehler-Monitoring
3. [ ] Erste Kundenfeedback sammeln

---

### 8.3 Post-Launch

**Erste Woche:**
- [ ] Täglich Logs prüfen
- [ ] Kunden-Support beantworten
- [ ] Performance überwachen
- [ ] Fehler schnell fixen

**Erste Monat:**
- [ ] Umsätze tracken
- [ ] Finanzamt informieren (erste Umsätze)
- [ ] Marketing anpassen
- [ ] Features basierend auf Feedback

---

## 📊 KOSTEN-ÜBERSICHT

| Position | Einmalig | Monatlich |
|----------|----------|-----------|
| Gewerbeanmeldung | 20-60€ | - |
| AGB vom Anwalt | 300-800€ | - |
| Supabase | - | 0-25€ |
| Vercel | - | 0-20€ |
| Domain (Hostinger) | - | 1-5€ |
| E-Mail (Hostinger) | - | enthalten |
| OpenAI API | - | ~10-50€ |
| Digistore24 | - | 7,9% + 1€/Verkauf |
| Berufshaftpflicht | - | 10-30€ |
| **GESAMT** | **~500-1000€** | **~50-150€** |

---

## 🎯 ZEITPLAN

**Ohne Gewerbe (nur Technik):** 1-2 Tage
**Mit Gewerbe (alles):** 2-4 Wochen

### Woche 1-2:
- ✅ Technisches Setup (ERLEDIGT!)
- ⏳ Supabase-Konfiguration
- 📋 Gewerbeanmeldung
- 📋 Fragebogen Finanzamt

### Woche 2-3:
- Steuernummer abwarten
- Impressum, Datenschutz, AGB erstellen
- Digistore24 Setup
- Domain-Verbindung

### Woche 3-4:
- Testing
- Digistore24 Integration finalisieren
- Launch-Vorbereitung

### Woche 4:
- 🚀 LIVE!

---

## 📞 WICHTIGE KONTAKTE

**Behörden:**
- Gewerbeamt: [Ihre Stadt]
- Finanzamt: [Ihr zuständiges FA]

**Dienstleister:**
- Hostinger Support: https://www.hostinger.de/kontakt
- Supabase Support: https://supabase.com/support
- Vercel Support: https://vercel.com/help
- Digistore24 Support: support@digistore24.com

**Rechtliches:**
- IT-Recht-Kanzlei: https://www.it-recht-kanzlei.de
- e-Recht24: https://www.e-recht24.de

---

## ✅ NÄCHSTE SCHRITTE (PRIORITÄT)

### JETZT SOFORT:
1. ✅ Supabase: E-Mail-Bestätigung AUSschalten
2. ✅ Lokal testen: Registrierung + Login
3. ✅ Vercel: Environment Variables setzen
4. ✅ Vercel: Redeploy

### DIESE WOCHE:
1. 📋 Gewerbeanmeldung
2. 📋 Impressum-Text vorbereiten (mit Platzhalter für Steuernr.)
3. 📋 Datenschutzerklärung generieren
4. 📋 Digistore24 Account erstellen

### NÄCHSTE WOCHE:
1. 📋 Steuernummer erhalten
2. 📋 Impressum aktualisieren
3. 📋 Domain mit Vercel verbinden
4. 📋 AGB von Anwalt erstellen lassen

### IN 2-3 WOCHEN:
1. 🚀 Beta-Testing
2. 🚀 Digistore24 final einrichten
3. 🚀 LIVE-LAUNCH!

---

**Sind Sie bereit? Lassen Sie uns starten! 💪**
