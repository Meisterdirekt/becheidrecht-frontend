# Mitarbeiter-Zugang – Wer darf was?

Damit du Angestellten schnell Zugang gibst, ohne Prompts oder Keys rauszugeben.

---

## 🔴 Das bekommen Mitarbeiter NIEMALS (nur du)

| Was | Warum |
|-----|------|
| **Ordner `vault/`** (komplett) | Enthält omega_prompt.txt, keys.env, rules.json, provider_logins.txt. |
| **Datei `vault/keys.env`** | OpenAI- und andere API-Schlüssel. |
| **Datei `vault/omega_prompt.txt`** | Deine KI-Master-Anweisung. |
| **Datei `vault/provider_logins.txt`** | GitHub-, Vercel-, Hosting-Zugänge. |
| **Datei `vault/rules.json`** | Taktische Insider-Regeln. |
| **Datei `.env.local`** (auf dem Server / in Vercel) | Enthält ggf. weitere Secrets. Du pflegst sie nur selbst in Vercel/Server. |
| **SYSTEM_MAP.md** | Deine Chef-Übersicht mit allen sensiblen Pfaden. |

**Wichtig:** Der Ordner `vault/` ist per `.gitignore` aus dem Git-Repo ausgeschlossen. Wer nur das GitHub-Repo klont, sieht ihn gar nicht – das ist gewollt.

---

## 🟢 Das dürfen Mitarbeiter bekommen (je nach Rolle)

### 1) Server warten / Deployment

- **Zugang:** Vercel-Dashboard (nur Projekt „Bescheidrecht“, keine anderen Projekte), oder SSH-Zugang zum Server – **ohne** Zugriff auf den Ordner `vault/` und ohne `.env`-Dateien mit Keys.
- **Was sie tun:** Deploy auslösen, Logs ansehen, Domain prüfen, Speicher/Performance prüfen.
- **Was sie nicht brauchen:** `vault/`, OpenAI-Key, `omega_prompt.txt`. Die laufen bei dir (lokal oder auf deinem Rechner) bzw. du trägst Keys nur in Vercel ein und hältst sie geheim.

**Chef-Checkliste:**  
□ Vercel: Projekt einladen als „Member“ (nicht Owner), keine Env-Vars mit Keys zeigen/ändern lassen.  
□ Server: Eigenen User anlegen, nur Verzeichnis ohne `vault/` freigeben; `vault/` außerhalb ihres Zugriffs.

---

### 2) Frontend / Design / Texte

- **Zugang:** GitHub-Repo (Clone/Read oder „Collaborator“ mit Push auf `main` oder einen Branch).
- **Was sie sehen:** Alles außer `vault/` und `.env*` – also `src/app/`, `src/components/`, `public/`, Rechtstexte (Impressum, AGB, Datenschutz), `tailwind.config.js`, `package.json`.
- **Was sie nicht sehen:** Weil `vault/` und `.env*` in `.gitignore` stehen, erscheinen sie im Repo gar nicht.

**Chef-Checkliste:**  
□ GitHub: Repo „bescheidrecht-frontend“ einladen, Rolle „Write“ reicht (kein Admin nötig).  
□ Sie klonen das Repo – fertig. Kein Zugang zu deinem Rechner, kein Vault, keine Keys.

---

### 3) Content / Fehlerkatalog-Texte (ohne Zugriff auf KI-Prompt/Keys)

- **Zugang:** Du kannst **eine Kopie** von `vault/error_catalog.json` (nur diese Datei) als Datei teilen oder in einem geschützten Cloud-Ordner (z. B. nur Lese-Zugang) legen.
- **Was sie tun:** Texte für Fehlerlisten vorschlagen (z. B. neue SGB-Punkte). Du prüfst und übernimmst die Änderung selbst in deinem `vault/error_catalog.json`.
- **Was sie nicht bekommen:** `omega_prompt.txt`, `keys.env`, Zugang zu deinem Vault-Ordner oder Server.

**Chef-Checkliste:**  
□ Nur error_catalog.json teilen (Copy-Paste oder Export), nie den ganzen Ordner `vault/`.  
□ Änderungen laufen über dich: Sie liefern Text, du fügst ein.

---

### 4) Lokale Entwicklung (ohne echte KI / ohne Keys)

- **Zugang:** Repo klonen + eine `.env.local` nur mit **unkritischen** Werten (siehe `.env.example`).
- **Was sie tun:** `npm run dev`, Frontend anpassen, neue Seiten/Components bauen. Die **Analyse** (Upload → KI) funktioniert bei ihnen nicht, weil kein Zugriff auf `vault/keys.env`.
- **Was sie nicht bekommen:** `vault/`, `keys.env`, deine echte `.env.local` mit Keys.

**Chef-Checkliste:**  
□ Sie kopieren `.env.example` nach `.env.local` und tragen nur das ein, was du explizit freigibst (z. B. öffentliche Supabase-URL/Anon-Key, wenn du das für Frontend-Dev erlauben willst).  
□ Du gibst **niemals** OpenAI-Key oder Zugang zu `vault/` heraus.

---

## 📋 Kurze Chef-Checkliste beim Freigeben

- [ ] Rolle klar machen: Server / Frontend / Content / nur Lesen?
- [ ] Nur den Zugang geben, der für die Rolle nötig ist (siehe oben).
- [ ] Nie `vault/`, nie `keys.env`, nie `omega_prompt.txt`, nie `provider_logins.txt` teilen.
- [ ] Vercel/Server: Env-Vars und Keys nur du; Mitarbeiter nur Deployment/Logs wenn nötig.
- [ ] Wenn jemand das Repo klont: Er sieht automatisch keinen Vault (`.gitignore`). Du musst nichts extra löschen.

---

## Optional: Eigene Zugangs-Liste (nur bei dir)

Du kannst intern (z. B. in einer privaten Datei oder in `vault/provider_logins.txt`) festhalten:

- Wer hat welchen Zugang? (GitHub-Nutzername, Vercel-E-Mail, Server-User)
- Wann vergeben? Wann entzogen?

Diese Liste sollte **nicht** im Git-Repo liegen – nur bei dir oder in einem sicheren Tresor.

---

*Dieses Dokument kannst du im Repo lassen (keine Geheimnisse). SYSTEM_MAP.md und vault/ bleiben nur bei dir und werden nicht mit ins Repo gepusht.*
