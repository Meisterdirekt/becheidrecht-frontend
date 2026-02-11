# Domain (bescheidrecht.de) mit der Website verbinden

Schritt-für-Schritt: Hostinger-Domain auf Vercel zeigen lassen und Supabase anpassen.

---

## Voraussetzung

- Die App ist bei **Vercel** mit GitHub verbunden (Repository: bescheidrecht-frontend).
- Deine Domain **bescheidrecht.de** liegt bei **Hostinger**.

---

## Teil 1: Domain in Vercel eintragen

1. Auf **https://vercel.com** einloggen.
2. Dein **Projekt** auswählen (bescheidrecht-frontend / BescheidRecht).
3. Oben auf **Settings** gehen.
4. Links **Domains** auswählen.
5. Unter **Add** deine Domain eintragen:
   - **bescheidrecht.de** (ohne www) eingeben und **Add** klicken.
   - Optional: **www.bescheidrecht.de** ebenfalls hinzufügen (Vercel schlägt oft vor, www auf die Hauptdomain weiterzuleiten).
6. Vercel zeigt dir jetzt an, **welche DNS-Einträge** du setzen musst, z. B.:
   - **A-Record:** Name `@`, Value eine IP (z. B. `76.76.21.21`)  
   - oder **CNAME:** Name `@` oder `www`, Value `cname.vercel-dns.com`  
   (Die genauen Werte stehen in Vercel unter Domains → deine Domain → „Configuration“.)
7. **Nicht schließen** – die Werte brauchst du im nächsten Schritt.

---

## Teil 2: DNS bei Hostinger anpassen

1. Auf **https://www.hostinger.de** einloggen.
2. Zu **Domains** oder zu deiner **Website** gehen und die Domain **bescheidrecht.de** auswählen.
3. **DNS / DNS-Verwaltung / Nameserver** oder **Zone Editor** öffnen (je nach Hostinger-Oberfläche).
4. Die Einträge setzen, die **Vercel** dir angezeigt hat:

   **Variante A (Vercel gibt A-Record vor):**
   - Typ: **A**
   - Name/Host: **@** (oder leer, oder „bescheidrecht.de“)
   - Wert/Points to: die **IP-Adresse** von Vercel (z. B. `76.76.21.21`)
   - TTL: 3600 oder Standard

   **Variante B (Vercel gibt CNAME vor):**
   - Typ: **CNAME**
   - Name/Host: **@** oder **www**
   - Wert/Points to: **cname.vercel-dns.com** (oder was Vercel anzeigt)
   - TTL: 3600 oder Standard

5. Alte Einträge für **@** oder **www**, die auf etwas anderes zeigen, **löschen oder anpassen**, damit nur Vercel genutzt wird.
6. **Speichern**. DNS-Änderungen können 5 Minuten bis 48 Stunden dauern (oft 15–30 Min.).

---

## Teil 3: SSL in Vercel prüfen

1. Zurück in **Vercel** → Projekt → **Settings** → **Domains**.
2. Neben **bescheidrecht.de** sollte nach einiger Zeit **Valid** / ein Häkchen stehen.
3. Wenn Vercel „Certificate“ oder „SSL“ anbietet: aktivieren (Vercel macht das oft automatisch).

---

## Teil 4: Supabase auf deine Domain umstellen

Damit der Link in der Bestätigungs-Mail auf **bescheidrecht.de** führt:

1. **Supabase Dashboard** öffnen → dein Projekt.
2. **Project Settings** (Zahnrad) → **Authentication**.
3. Unter **URL Configuration**:
   - **Site URL:** von der alten URL (z. B. `https://xxx.vercel.app`) auf **https://bescheidrecht.de** ändern.
   - **Redirect URLs:** `https://bescheidrecht.de/**` und `https://bescheidrecht.de` eintragen (falls noch nicht vorhanden). Optional auch `https://www.bescheidrecht.de/**`.
4. **Save** klicken.

Ab dann nutzt Supabase für Links in E-Mails (z. B. Bestätigung, Passwort-Reset) deine Domain.

---

## Kurz-Checkliste

- [ ] Vercel: Domain **bescheidrecht.de** unter Settings → Domains hinzugefügt.
- [ ] Hostinger: DNS wie von Vercel vorgegeben (A oder CNAME) gesetzt und gespeichert.
- [ ] 15–30 Min. gewartet, dann **https://bescheidrecht.de** im Browser getestet.
- [ ] Supabase: Site URL und Redirect URLs auf **https://bescheidrecht.de** umgestellt.

---

*Wenn eine Schritt-Anzeige bei dir anders heißt (z. B. „DNS Zone“ statt „DNS-Verwaltung“), die Schritte sinngemäß anwenden. Die Werte (IP oder CNAME) kommen von Vercel.*
