# E-Mail-Bestätigung (SMTP) in Supabase einrichten

Damit Bestätigungs-E-Mails bei der Registrierung zuverlässig ankommen, muss in Supabase ein **eigener SMTP-Anbieter** eingetragen werden. Der Standard-Versand von Supabase ist stark limitiert (nur wenige E-Mails/Stunde, nur an Teammitglieder) und führt oft zu „Error sending confirmation email“.

---

## 1. SMTP-Anbieter wählen

Einer der folgenden Dienste reicht (alle mit SMTP-Schnittstelle):

| Anbieter | Hinweis |
|----------|--------|
| **Resend** | Einfach, [Anleitung für Supabase](https://resend.com/docs/send-with-supabase-smtp), kostenloser Einstieg |
| **Brevo** (ehem. Sendinblue) | [SMTP-Daten](https://help.brevo.com/hc/en-us/articles/7924908994450) |
| **SendGrid** (Twilio) | [SMTP](https://www.twilio.com/docs/sendgrid/for-developers/sending-email/getting-started-smtp) |
| **Postmark** | [SMTP](https://postmarkapp.com/developer/user-guide/send-email-with-smtp) |
| **ZeptoMail** (Zoho) | [SMTP](https://www.zoho.com/zeptomail/help/smtp-home.html) |
| **AWS SES** | [SMTP](https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html) |

Du brauchst vom Anbieter:

- **SMTP-Host** (z. B. `smtp.resend.com`)
- **Port** (meist 587 für TLS)
- **Benutzername / Passwort** (oder API-Key als Passwort, je nach Anbieter)
- **Absender-Adresse** (z. B. `no-reply@deinedomain.de`)

---

## 2. In Supabase eintragen

1. **Supabase Dashboard** → dein Projekt  
2. **Project Settings** (Zahnrad links unten) → **Auth**  
3. Abschnitt **SMTP Settings**:
   - **Enable Custom SMTP** aktivieren  
   - **Sender email:** z. B. `no-reply@deinedomain.de` (muss beim Anbieter verifiziert sein)  
   - **Sender name:** z. B. `BescheidRecht`  
   - **Host:** vom Anbieter (z. B. `smtp.resend.com`)  
   - **Port:** z. B. `587`  
   - **Username / Password:** Zugangsdaten des Anbieters  
4. **Save** klicken.

Direktlink (Projekt-URL anpassen):  
`https://supabase.com/dashboard/project/[DEINE-PROJECT-REF]/auth/smtp`

---

## 3. E-Mail-Bestätigung aktiv lassen

- **Authentication** → **Providers** → **Email**  
- **Confirm email** auf **ON** lassen (empfohlen für Produktion).

Dann werden neue User per E-Mail zur Bestätigung aufgefordert; erst nach Klick auf den Link können sie sich anmelden.

---

## 4. Optional: Rate Limits

Unter **Authentication** → **Rate Limits** kannst du das Limit für E-Mails anpassen (nach SMTP-Setup oft z. B. 30/Stunde voreingestellt).

---

## 5. Troubleshooting

- **„Error sending confirmation email“** → Fast immer: Custom SMTP noch nicht oder falsch konfiguriert (Host, Port, User, Passwort, Absender prüfen).  
- **E-Mails landen im Spam** → Beim Anbieter DKIM/SPF/DMARC für die Absender-Domain einrichten.  
- **Nur Teammail-Adressen erhalten E-Mails** → Custom SMTP aktivieren; ohne SMTP versendet Supabase nur an autorisierte Team-Adressen.
