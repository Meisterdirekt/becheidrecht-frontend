# Registrierung: Keine E-Mail kommt an – Checkliste

Damit bei der Registrierung eine Bestätigungs-E-Mail verschickt wird, müssen in Supabase folgende Punkte stimmen.

---

## 1. "Confirm email" muss AN sein

- **Supabase** → **Authentication** → **Providers** → **Email**
- **Confirm email** = **AN** (Enable email confirmations)
- Nur dann schickt Supabase beim Sign-up eine Bestätigungs-Mail. Wenn es AUS ist, wird **keine** E-Mail versendet (Nutzer kann sofort einloggen).

---

## 2. Custom SMTP prüfen

- **Supabase** → **Project Settings** (Zahnrad) → **Auth** → **SMTP Settings**
- **Enable Custom SMTP** = an
- **Sender email:** deine Adresse (z. B. noreply@bescheidrecht.de)
- **Host:** z. B. smtp.hostinger.com (laut Hostinger)
- **Port:** 587 (TLS) oder 465 (SSL)
- **Username:** volle E-Mail-Adresse (z. B. noreply@bescheidrecht.de)
- **Password:** Passwort dieses Postfachs
- **Speichern** und ggf. mit "Send test email" testen (falls angeboten).

---

## 3. E-Mail-Vorlage "Confirm signup"

- **Supabase** → **Authentication** → **Email Templates**
- **Confirm signup** auswählen
- Prüfen: Vorlage ist aktiv und enthält z. B. `{{ .ConfirmationURL }}` für den Bestätigungs-Link.
- **Subject** z. B. "Bestätigen Sie Ihre E-Mail-Adresse" – kann so bleiben oder angepasst werden.

---

## 4. Nach Registrierung testen

1. Auf der App **Registrierung** mit einer **neuen** E-Mail-Adresse (noch nie registriert).
2. Wenn die Meldung **"Wir haben Ihnen eine E-Mail geschickt"** erscheint: **Posteingang und Spam** prüfen (auch "Werbe-/Promotions"-Ordner bei Gmail).
3. Wenn keine E-Mail ankommt: auf der gleichen Seite **"Bestätigungs-Mail erneut senden"** klicken und wieder Posteingang/Spam prüfen.
4. In **Supabase** → **Authentication** → **Logs** prüfen, ob beim Sign-up oder Resend Fehler (z. B. SMTP) geloggt werden.

---

## 5. Häufige Ursachen

| Problem | Lösung |
|--------|--------|
| "Confirm email" ist AUS | In Providers → Email auf AN stellen. |
| SMTP falsch (Host/Port/Passwort) | Hostinger-Daten prüfen, Passwort des Postfachs (nicht Hostinger-Login). |
| E-Mail landet im Spam | Spam-Ordner prüfen; Absender (noreply@bescheidrecht.de) evtl. bei Hostinger als vertrauenswürdig einstufen. |
| Supabase nutzt noch internen Versand | Custom SMTP speichern und Test-Mail senden; danach Registrierung erneut testen. |
| Rate Limit | Bei vielen Versuchen kurz warten oder andere E-Mail-Adresse zum Testen nutzen. |

---

## 6. Optional: E-Mail nur zum Testen ausschalten

Wenn du **ohne** Bestätigungs-E-Mail testen willst (sofort einloggen nach Registrierung):

- **Confirm email** = **AUS**
- Dann wird **keine** E-Mail versendet, Nutzer wird nach Registrierung direkt weitergeleitet (wenn die App das so vorsieht).

Sobald SMTP und "Confirm email" stimmen, sollte die Bestätigungs-Mail bei der Registrierung ankommen.
