# 📧 E-Mail-Setup - Vollständige Anleitung

## ⚠️ ERST DURCHFÜHREN, NACHDEM DIE KEYS KORREKT SIND!

Siehe: `ANLEITUNG_KEYS_HOLEN.md`

---

## Problem: "Ich bekomme keine Bestätigungs-E-Mail"

Dies kann 3 Ursachen haben:

### 1. E-Mail-Bestätigung ist in Supabase AKTIVIERT
### 2. SMTP ist nicht oder falsch konfiguriert
### 3. E-Mails landen im Spam

---

## 🎯 SCHNELLSTE LÖSUNG: E-Mail-Bestätigung DEAKTIVIEREN

### Warum?
- Nutzer können sich **sofort** nach Registrierung anmelden
- Keine SMTP-Konfiguration nötig
- Keine Spam-Probleme
- Perfekt für den Start!

### Wie?

1. **Supabase Dashboard öffnen:**
   - https://supabase.com/dashboard
   - Ihr Projekt auswählen

2. **E-Mail-Bestätigung ausschalten:**
   - Linke Sidebar: **Authentication** (🔐 Symbol)
   - Klicken Sie auf **Providers**
   - Finden Sie **Email**
   - Schalten Sie **"Confirm email"** auf **AUS** (OFF)
   - Klicken Sie auf **Save**

3. **Testen:**
   - Öffnen Sie Ihre Website: https://ihre-domain.de/register
   - Registrieren Sie sich mit einer neuen E-Mail
   - Sie sollten **sofort** nach der Registrierung weitergeleitet werden
   - Kein Warten auf E-Mail nötig!

---

## 🔧 ALTERNATIVE: E-Mail-Bestätigung MIT SMTP einrichten

Falls Sie E-Mail-Bestätigung **wollen**, müssen Sie SMTP konfigurieren:

### Option 1: Supabase Standard-E-Mails nutzen (EINFACH)

1. **Supabase Dashboard:**
   - **Authentication** → **Providers** → **Email**
   - **"Confirm email"** = **AN** (ON)
   - **Save**

2. **SMTP Settings:**
   - **Project Settings** (Zahnrad links unten) → **Auth** → **SMTP Settings**
   - **Enable Custom SMTP** = **AUS** (OFF)
   - **Save**

3. **Wichtig:**
   - Supabase versendet E-Mails von ihrer eigenen Domain
   - E-Mails können im Spam landen
   - Nur für Tests geeignet, nicht für Production!

### Option 2: Eigener SMTP (Hostinger) - FÜR PRODUCTION

#### A. Hostinger SMTP-Daten erfragen

**Kontaktieren Sie Hostinger Support:**
```
Betreff: SMTP-Daten für externes Versenden benötigt

Hallo,

ich möchte E-Mails über mein Postfach info@bescheidrecht.de
von einer externen Anwendung (Supabase) versenden.

Bitte teilen Sie mir mit:
1. SMTP Host (z.B. smtp.hostinger.com)
2. SMTP Port (587 für TLS oder 465 für SSL)
3. Benötige ich ein App-Passwort?
4. Ist der externe SMTP-Versand erlaubt?

Vielen Dank!
```

#### B. SMTP in Supabase eintragen

1. **Supabase Dashboard:**
   - **Project Settings** → **Auth** → **SMTP Settings**

2. **Einstellungen:**
   ```
   Enable Custom SMTP: AN (ON)

   Sender email: noreply@bescheidrecht.de
   (oder info@bescheidrecht.de - je nachdem, welches Postfach Sie nutzen)

   Sender name: BescheidRecht

   Host: [VON HOSTINGER ERHALTEN, z.B. smtp.hostinger.com]

   Port: 587 (für TLS) oder 465 (für SSL)

   Username: [VOLLE E-MAIL-ADRESSE, z.B. noreply@bescheidrecht.de]

   Password: [PASSWORT DES POSTFACHS]
   ```

3. **Speichern:** Klicken Sie auf **Save**

4. **Test-E-Mail senden:**
   - Falls angeboten: Klicken Sie auf "Send test email"
   - Tragen Sie Ihre E-Mail ein
   - Prüfen Sie Posteingang + Spam

#### C. E-Mail-Vorlage anpassen (optional)

1. **Supabase Dashboard:**
   - **Authentication** → **Email Templates**
   - Wählen Sie **"Confirm signup"**

2. **Vorlage bearbeiten:**
   ```
   Subject: Bestätigen Sie Ihre E-Mail bei BescheidRecht

   Body:
   Hallo,

   vielen Dank für Ihre Registrierung bei BescheidRecht!

   Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf den
   folgenden Link klicken:

   {{ .ConfirmationURL }}

   Falls Sie sich nicht registriert haben, ignorieren Sie diese E-Mail.

   Mit freundlichen Grüßen
   Ihr BescheidRecht-Team
   ```

3. **Save**

---

## ✅ TESTEN

### 1. Test mit E-Mail-Bestätigung AUS (empfohlen zum Start)

```bash
1. Supabase: Authentication → Providers → Email → "Confirm email" = AUS
2. Ihre Website öffnen: https://ihre-domain.de/register
3. Neue E-Mail eingeben und registrieren
4. ✓ Sie sollten SOFORT weitergeleitet werden zur Startseite
5. ✓ Sie können sich direkt anmelden
```

### 2. Test mit E-Mail-Bestätigung AN

```bash
1. Supabase: Authentication → Providers → Email → "Confirm email" = AN
2. Supabase: SMTP konfiguriert (siehe oben)
3. Ihre Website öffnen: https://ihre-domain.de/register
4. Neue E-Mail eingeben und registrieren
5. ✓ Sie sehen: "Wir haben Ihnen eine E-Mail geschickt"
6. ✓ Prüfen Sie Posteingang + SPAM-Ordner
7. ✓ Klicken Sie auf den Link in der E-Mail
8. ✓ Sie können sich jetzt anmelden
```

---

## 🔍 FEHLERSUCHE

### "Ich sehe keine Fehlermeldung, aber es passiert nichts"

**Diagnose:**
```bash
1. Öffnen Sie: https://ihre-domain.de/api/auth-debug
2. Prüfen Sie:
   - configured: true (muss true sein!)
   - hasUrl: true
   - hasAnonKey: true
```

Falls `configured: false`:
- → Siehe `ANLEITUNG_KEYS_HOLEN.md`
- → Keys sind falsch oder nicht gesetzt

### "Fehlermeldung: Email not confirmed"

**Ursache:** E-Mail-Bestätigung ist AN, aber E-Mail nicht bestätigt

**Lösung 1 (schnell):**
- Supabase → Authentication → Providers → Email → "Confirm email" AUS

**Lösung 2 (sauber):**
- Supabase → Authentication → Users → Ihren User finden → Rechtsklick → "Confirm user"

### "E-Mail kommt nicht an"

**Checkliste:**
1. ✅ SMTP in Supabase konfiguriert?
2. ✅ SMTP-Daten von Hostinger korrekt?
3. ✅ Passwort des Postfachs richtig?
4. ✅ Port korrekt? (587 für TLS, 465 für SSL)
5. ✅ Spam-Ordner geprüft?
6. ✅ Supabase Logs geprüft? (Authentication → Logs)

**Supabase Logs öffnen:**
- Dashboard → Authentication → Logs
- Schauen Sie nach "Failed to send email" oder ähnlichen Fehlern
- Fehler zeigen oft das genaue Problem (z.B. "Invalid password")

---

## 🎯 EMPFEHLUNG

### Für den SOFORTIGEN Start:
1. ✅ Korrekte Keys eintragen (siehe `ANLEITUNG_KEYS_HOLEN.md`)
2. ✅ E-Mail-Bestätigung **AUS** schalten
3. ✅ Testen: Registrierung + Login

### Für PRODUCTION (später):
1. ✅ Hostinger SMTP-Daten holen
2. ✅ SMTP in Supabase konfigurieren
3. ✅ Test-E-Mail senden (in Supabase)
4. ✅ E-Mail-Bestätigung **AN** schalten
5. ✅ Nochmal testen mit neuer E-Mail

---

## 📞 Support-Kontakte

**Supabase Support:**
- https://supabase.com/support
- Oder über Discord: https://discord.supabase.com

**Hostinger Support:**
- https://www.hostinger.de/kontakt
- Live-Chat oder Ticket-System

---

## ⚡ QUICK FIX ZUSAMMENFASSUNG

```bash
1. Korrekte Supabase Keys holen und eintragen
2. Supabase: "Confirm email" AUS schalten
3. Vercel: Redeploy (falls auf Vercel deployed)
4. Testen: Registrierung sollte jetzt funktionieren!
```

**Nach diesem Quick Fix:**
- ✅ Registrierung funktioniert sofort
- ✅ Kein Warten auf E-Mail
- ✅ Nutzer kann sich direkt anmelden
- ✅ Website ist voll funktionsfähig

**SMTP später einrichten** (wenn nötig):
- Für Passwort-Reset-E-Mails
- Für E-Mail-Bestätigung (optional)
