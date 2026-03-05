# Hostinger – E-Mail einrichten (Schritt für Schritt)

Ziel: Damit BescheidRecht Bestätigungs-E-Mails verschicken kann, richten wir auf Hostinger das Postfach **info@bescheidrecht.de** ein und aktivieren DKIM. Alles in klaren Einzelschritten.

---

# TEIL A: E-Mail-Postfach anlegen

**Wo:** Hostinger (hPanel)  
**Was am Ende steht:** Ein Postfach info@bescheidrecht.de mit einem Passwort, das du in Supabase einträgst.

---

## Schritt A1 – Hostinger öffnen

1. Gehe im Browser zu **hostinger.com** (oder deiner Hostinger-Login-URL).
2. Melde dich an.
3. Du landest im **hPanel** (Übersicht mit Domains, E-Mail, etc.).

---

## Schritt A2 – E-Mail-Bereich öffnen

1. Suche in der linken Leiste oder auf der Übersicht nach **„E-Mail“** oder **„E-Mail-Accounts“**.
2. Klicke darauf.
3. Du siehst eine Liste deiner Domains oder E-Mail-Accounts.

---

## Schritt A3 – Domain auswählen

1. Wähle die Domain **bescheidrecht.de** aus (Klick auf den Namen oder „Verwalten“).
2. Du siehst jetzt die E-Mail-Einstellungen für bescheidrecht.de.

---

## Schritt A4 – Neues Postfach anlegen

1. Klicke auf **„E-Mail-Account erstellen“** oder **„Create account“** (grüner Button oder ähnlich).
2. Es öffnet sich ein Formular.

**Im Formular ausfüllen:**

| Feld | Was du einträgst |
|------|-------------------|
| **E-Mail-Name** / **Username** | `info` (nur das Wort, ohne @bescheidrecht.de) |
| **Passwort** | Ein sicheres Passwort (selbst wählen). **Wichtig:** Dieses Passwort brauchst du später in Supabase – am besten notieren oder in einem Passwort-Manager speichern. |

3. Klicke auf **„Erstellen“** / **„Create“**.
4. Fertig: Du hast jetzt **info@bescheidrecht.de** mit dem gewählten Passwort.

**→ Dieses Passwort in Schritt B (Supabase) unter „Password“ eintragen.**

---

# TEIL B: DKIM – damit E-Mails nicht als Spam gelten

**Wo:** Zuerst wieder Hostinger (E-Mail/DKIM), dann Hostinger (Domains → DNS).  
**Was am Ende steht:** Ein DNS-Eintrag mit dem Namen **hostingermail1._domainkey**, damit Empfänger die E-Mails von info@bescheidrecht.de als vertrauenswürdig einstufen.

---

## Schritt B1 – DKIM-Seite bei Hostinger finden

1. Du bist im **hPanel** von Hostinger.
2. Gehe zu **E-Mail** (wie in A2).
3. Wähle wieder **bescheidrecht.de**.
4. Suche auf der Seite nach einem der Begriffe: **„DKIM“**, **„Authentifizierung“**, **„E-Mail-Sicherheit“**, **„Custom DKIM“**.
5. Klicke darauf. Du siehst jetzt die **DKIM-Einstellungen** für bescheidrecht.de.

**Was du dort siehst:**  
Es stehen drei Dinge da (die genaue Bezeichnung kann etwas abweichen):

- **Name** (oder „Record name“): z. B. `hostingermail1._domainkey`
- **Typ** (oder „Type“): **CNAME** oder **TXT**
- **Wert** (oder „Value“, „Target“, „Points to“): eine längere Zeichenkette von Hostinger

**→ Schreib diese drei Dinge ab oder mach einen Screenshot. Du brauchst sie im nächsten Schritt.**

---

## Schritt B2 – DNS-Zone von bescheidrecht.de öffnen

1. Im **hPanel** in der linken Leiste auf **„Domains“** (oder **„Websites & Domains“**) klicken.
2. In der Liste die Domain **bescheidrecht.de** finden.
3. Daneben auf **„DNS-Zone“**, **„Manage DNS“** oder **„DNS verwalten“** klicken.
4. Du siehst jetzt eine **Tabelle mit DNS-Einträgen** (A, AAAA, CNAME, TXT, MX, …).

**→ Hier fügst du gleich einen neuen Eintrag ein.**

---

## Schritt B3 – Neuen DNS-Eintrag anlegen

1. Auf **„Neuer Eintrag“**, **„Add record“** oder **„+ Record“** klicken.
2. Es erscheinen Felder. **Genau das eintragen, was Hostinger bei DKIM (Schritt B1) angezeigt hat:**

| Feld in der DNS-Zone | Was eintragen |
|----------------------|----------------|
| **Typ** / **Type** | **CNAME** (oder **TXT**, wenn Hostinger bei DKIM „TXT“ sagt) |
| **Name** / **Host** / **Subdomain** | **hostingermail1._domainkey** (exakt so, wie bei DKIM angezeigt; manchmal steht dort auch „hostingermail1._domainkey.bescheidrecht.de“ – dann das übernehmen, was Hostinger zeigt) |
| **Wert** / **Target** / **Points to** / **Value** | Den **kompletten** Wert von der DKIM-Seite kopieren und hier einfügen (CNAME-Zieladresse oder TXT-Text) |
| **TTL** | 14400 lassen oder Standard (falls nicht gefordert) |

3. Auf **„Speichern“** / **„Save“** klicken.
4. Fertig. Der Eintrag erscheint in der DNS-Liste.

**→ 10–30 Minuten warten.** Danach bei Hostinger unter DKIM prüfen, ob der Status von „Pending“ auf **„Verified“** oder **„Aktiv“** wechselt.

---

# TEIL C: In Supabase eintragen (nicht Hostinger)

**Wo:** Supabase-Dashboard (supabase.com → dein Projekt).  
**Was du brauchst:** Das Passwort von info@bescheidrecht.de aus Teil A.

---

## Schritt C1 – SMTP-Seite in Supabase öffnen

1. Gehe zu **supabase.com** und melde dich an.
2. Dein Projekt **BescheidRecht** (oder wie es heißt) auswählen.
3. Links unten auf das **Zahnrad** klicken → **„Project Settings“**.
4. Links in den Einstellungen auf **„Auth“** klicken.
5. Nach unten scrollen bis zum Abschnitt **„SMTP Settings“** (oder **„Email“** mit SMTP).
6. **„Enable Custom SMTP“** (oder „Use custom SMTP“) **anklicken**, damit die Felder aktiv werden.

---

## Schritt C2 – SMTP-Felder ausfüllen

In die Felder **genau** das eintragen:

| Feld in Supabase | Was eintragen |
|------------------|----------------|
| **Sender email** | `info@bescheidrecht.de` |
| **Sender name** | `BescheidRecht` |
| **Host** | `smtp.hostinger.com` |
| **Port number** | `587` |
| **Username** | `info@bescheidrecht.de` |
| **Password** | Das **Passwort**, das du in Teil A4 für info@bescheidrecht.de vergeben hast |

7. Auf **„Save changes“** / **„Speichern“** klicken.

---

## Schritt C3 – „Confirm email“ aktivieren

1. In Supabase links auf **„Authentication“** klicken (nicht Project Settings).
2. Unter **„CONFIGURATION“** auf **„Providers“** oder **„Sign In / Providers“** klicken.
3. In der Liste **„Email“** auswählen (anklicken).
4. Den Schalter **„Confirm email“** auf **ON** stellen.
5. Speichern, falls nötig.

---

# Kurz-Checkliste

- [ ] **A:** Postfach info@bescheidrecht.de auf Hostinger angelegt, Passwort notiert
- [ ] **B1:** DKIM-Seite bei Hostinger geöffnet, Name + Typ + Wert notiert
- [ ] **B2:** DNS-Zone von bescheidrecht.de geöffnet
- [ ] **B3:** Neuer Eintrag (hostingermail1._domainkey) in der DNS-Zone angelegt und gespeichert
- [ ] **B:** Nach 10–30 Min.: DKIM bei Hostinger als „Verified“ sichtbar
- [ ] **C1:** In Supabase SMTP-Settings geöffnet, Custom SMTP aktiviert
- [ ] **C2:** Alle SMTP-Felder ausgefüllt (inkl. Passwort von A), gespeichert
- [ ] **C3:** Unter Authentication → Providers → Email „Confirm email“ auf ON

Wenn du bei einem Schritt nicht weiterkommst: Schreib genau, bei welchem Teil (A, B1, B2, B3, C1, C2, C3) du bist und was auf dem Bildschirm steht – dann kann man es punktgenau sagen.
