# 🔑 Korrekte Supabase Keys holen

## WICHTIG: Ihre Keys sind derzeit FALSCH!

Der aktuelle ANON_KEY in Ihrer .env.local ist ungültig.

## So holen Sie die RICHTIGEN Keys:

### 1. Supabase Dashboard öffnen
- Gehen Sie zu: https://supabase.com/dashboard
- Melden Sie sich an
- Wählen Sie Ihr Projekt "xprrzmcickfparpogbpj" aus

### 2. Keys finden
- Klicken Sie links auf das **Zahnrad-Symbol** (Settings)
- Gehen Sie zu **Project Settings** → **API**
- Dort finden Sie:

```
Project URL:
https://xprrzmcickfparpogbpj.supabase.co

anon / public Key:
eyJ... (beginnt mit eyJ und ist SEHR LANG - ca. 200-300 Zeichen!)
```

### 3. Keys kopieren und eintragen

**Lokale Entwicklung (.env.local):**
Bearbeiten Sie die Datei `/home/henne1990/bescheidrecht-frontend/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://xprrzmcickfparpogbpj.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ... HIER DEN LANGEN KEY EINFÜGEN ..."
```

**Vercel (Production):**
1. Gehen Sie zu: https://vercel.com/dashboard
2. Wählen Sie Ihr Projekt "bescheidrecht-frontend"
3. Gehen Sie zu **Settings** → **Environment Variables**
4. Fügen Sie hinzu (für Production):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xprrzmcickfparpogbpj.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJ... DER LANGE KEY ...`
5. Klicken Sie auf **Save**
6. Gehen Sie zu **Deployments** und klicken Sie oben rechts auf **Redeploy**

### 4. Nach dem Update testen

**Lokal:**
```bash
cd /home/henne1990/bescheidrecht-frontend
npm run dev
```

Dann öffnen Sie: http://localhost:3000/api/auth-debug
- Sollte zeigen: `configured: true`

**Vercel:**
Nach Redeploy öffnen Sie: https://ihre-domain.de/api/auth-debug
- Sollte zeigen: `configured: true`

## ⚠️ WARUM IST DAS WICHTIG?

Ohne den richtigen ANON_KEY kann:
- ❌ Keine Registrierung stattfinden
- ❌ Kein Login stattfinden
- ❌ Keine E-Mail gesendet werden
- ❌ Keine Verbindung zu Supabase aufgebaut werden

Der Key ist wie ein Passwort - ohne den richtigen Key blockt Supabase alle Anfragen!
