# 🔒 PAYWALL - INSTALLATION & TESTING

## ✅ WAS IST FERTIG:

### 1. **SQL-Tabelle** ✅
```
Datei: supabase_subscription_table.sql
→ Erstellt user_subscriptions Tabelle
→ Automatische Subscription bei Registrierung
→ Funktionen zum Kaufen/Verbrauchen
```

### 2. **Neue Preise** ✅
```
Basic:      19,90€/Monat → 5 Analysen
Standard:   49,90€/Monat → 15 Analysen
Pro:        129€/Monat → 50 Analysen
Business:   249€/Monat → 120 Analysen
Einzelkauf: 19,90€ → 1 Analyse (sozial!)
```

### 3. **API-Routen** ✅
```
/api/subscription-status → Abo-Status abfragen
/api/use-analysis → Analyse verbrauchen (Counter--)
/api/admin/grant-subscription → User manuell freischalten
```

### 4. **Admin-Seite** ✅
```
/admin → User manuell freischalten/upgraden
```

---

## 🚀 INSTALLATION (JETZT TUN):

### **SCHRITT 1: Supabase Tabelle erstellen** (5 Min)

1. **Öffnen Sie:** https://supabase.com/dashboard
2. **Wählen Sie Ihr Projekt**
3. **Links: SQL Editor** klicken
4. **"+ New query"** klicken
5. **Öffnen Sie die Datei:**
   ```
   /home/henne1990/bescheidrecht-frontend/supabase_subscription_table.sql
   ```
6. **Kopieren Sie das KOMPLETTE SQL** (von oben bis unten!)
7. **Einfügen in Supabase SQL Editor**
8. **"Run" klicken** (oder Strg+Enter)
9. **Erfolg:** Sollte "Success. No rows returned" zeigen ✅

**Fertig!** Die Tabelle ist erstellt!

---

### **SCHRITT 2: Lokaler Test** (10 Min)

**Terminal öffnen:**
```bash
cd /home/henne1990/bescheidrecht-frontend
npm run dev
```

**Im Browser öffnen:**
```
http://localhost:3000
```

**Preise prüfen:**
- Scrollen Sie zu den Preisen
- Sollten die NEUEN Preise sehen (19,90€, 49,90€, 129€, 249€)

**Admin-Seite öffnen:**
```
http://localhost:3000/admin
```

---

### **SCHRITT 3: User freischalten testen** (5 Min)

**Szenario: Sie schalten sich selbst frei**

1. **Registrieren Sie sich** (falls noch nicht):
   ```
   http://localhost:3000/register
   E-Mail: test@beispiel.de
   Passwort: test1234
   ```

2. **Gehen Sie zur Admin-Seite:**
   ```
   http://localhost:3000/admin
   ```

3. **User freischalten:**
   - E-Mail: `test@beispiel.de`
   - Abo-Typ: `Basic (19,90€/Monat) - 5 Analysen`
   - Klick: "User freischalten"

4. **Erfolg:**
   - Sollte grüne Meldung zeigen: "✅ Erfolgreich! ..."

5. **API testen:**
   ```
   http://localhost:3000/api/subscription-status
   ```
   - Sollte Ihren Abo-Status zeigen (aber nur wenn eingeloggt)

---

## ⚠️ WAS NOCH FEHLT:

### **Upload-Sperre auf Startseite**

**Aktuell:**
- Jeder kann uploaden (auch Free-User)

**Soll:**
- Upload nur für zahlende User
- Free-User sehen "Jetzt kaufen" Button

**Das müssen wir als Nächstes anpassen!**

---

## 🎯 NÄCHSTE SCHRITTE:

### **Option A: Ich passe die Startseite an** (30 Min)
```
→ Upload-Bereich prüft Abo-Status
→ Free-User: Upload gesperrt
→ Zahlende User: Upload frei
→ Nach Upload: Counter reduzieren
```

### **Option B: Sie testen erstmal**
```
→ Admin-Seite testen
→ User freischalten
→ API-Routen testen
→ Dann sage ich Ihnen Bescheid, wie es weitergeht
```

---

## 📋 TEST-CHECKLISTE:

```
☐ Supabase SQL ausgeführt
☐ npm run dev gestartet
☐ Neue Preise sichtbar (19,90€, 49,90€, ...)
☐ Admin-Seite erreichbar (/admin)
☐ Test-User registriert
☐ Test-User über Admin freigeschaltet
☐ Freischaltung erfolgreich (grüne Meldung)
```

---

## ❓ HÄUFIGE FEHLER:

### "Success. No rows returned" bei SQL
✅ **Das ist RICHTIG!** Die Tabelle wurde erstellt.

### "relation already exists"
✅ **Tabelle existiert schon.** Alles ok!

### "User nicht gefunden" bei Admin
❌ **User muss sich ZUERST registrieren!**
→ Erst /register, dann /admin

### API gibt "Not authenticated"
❌ **Sie müssen eingeloggt sein!**
→ Erst /login, dann API aufrufen

---

## 🚀 BEREIT?

**Führen Sie SCHRITT 1-3 aus!**

**Dann sagen Sie mir:**
- "Tabelle erstellt ✅"
- "Admin-Seite funktioniert ✅"
- "User freigeschaltet ✅"

**Dann passe ich die Startseite an!** 💪
