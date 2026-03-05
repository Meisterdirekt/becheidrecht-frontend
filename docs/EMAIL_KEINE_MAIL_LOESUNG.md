# Keine E-Mail bei Registrierung – systematische Lösung

## Option A: Prüfen, ob das Problem am eigenen SMTP (Hostinger) liegt

1. **Supabase** → **Project Settings** → **Auth** → **SMTP Settings**
2. **Enable Custom SMTP** einmal **AUS** schalten und speichern.
3. Mit einer **neuen** E-Mail-Adresse registrieren (z. B. Gmail).
4. **Posteingang + Spam** prüfen.

- **Wenn JETZT eine Mail ankommt:** Supabase funktioniert, das Problem liegt am **Hostinger-SMTP** (Zugangsdaten, Port oder Hostinger blockiert externen Versand). Dann Custom SMTP wieder **AN** und Option B oder C unten.
- **Wenn auch ohne Custom SMTP keine Mail ankommt:** Projekt-Limits oder E-Mail-Log prüfen (Support/Docs).

---

## Option B: Gmail für den Versand testen (nur zum Testen)

So siehst du, ob mit anderem SMTP Mails ankommen:

1. **Google-Konto:** 2-Faktor-Aktivierung aktivieren.
2. **App-Passwort** erzeugen: Google-Konto → Sicherheit → „App-Passwörter“ → Passwort für „Mail“ wählen, 16-stelliges Passwort kopieren.
3. **Supabase** → **Auth** → **SMTP**:
   - Sender email: deine Gmail-Adresse (z. B. deine@gmail.com)
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: deine Gmail-Adresse
   - Password: das 16-stellige **App-Passwort** (nicht dein normales Gmail-Passwort)
4. Custom SMTP **AN**, speichern.
5. Nochmal registrieren (neue E-Mail) und Posteingang/Spam prüfen.

Wenn mit Gmail Mails ankommen, ist klar: Hostinger-SMTP ist die Ursache.

---

## Option C: Ohne Bestätigungs-Mail weitermachen (Sofort-Lösung)

Damit Nutzer sich **sofort** nach der Registrierung einloggen können, **ohne** E-Mail:

1. **Supabase** → **Authentication** → **Sign In / Providers** → **Email**
2. **Confirm email** auf **AUS** stellen und speichern.
3. Ab dann: Registrierung → Nutzer wird angelegt → deine App leitet zum Login weiter oder loggt direkt ein (je nach deinem Code). **Keine** Bestätigungs-Mail.
4. **Passwort vergessen** kann weiterhin E-Mails nutzen – dafür SMTP später (z. B. nach Rücksprache mit Hostinger) einrichten.

---

## Option D: Hostinger nach SMTP-Daten fragen

Bei Hostinger Support (Chat/Ticket) anfragen:

- „Ich nutze eine App (Supabase) und möchte E-Mails über mein Postfach **info@bescheidrecht.de** versenden. Welche SMTP-Daten (Host, Port, Verschlüsselung) soll ich verwenden? Darf externer SMTP-Versand (von euren Servern aus) genutzt werden?“

Oft antworten sie mit exaktem Host (z. B. `smtp.hostinger.com`), Port (587 oder 465) und ob ein App-Passwort nötig ist.

---

## Kurz-Entscheidung

| Ziel | Vorgehen |
|-----|----------|
| **Schnell registrieren lassen, E-Mail später** | Option C: Confirm email AUS. |
| **Herausfinden, ob Hostinger schuld ist** | Option A (Custom SMTP aus) oder Option B (Gmail testen). |
| **Hostinger-SMTP dauerhaft nutzen** | Option D + danach die genannten Daten in Supabase eintragen. |
