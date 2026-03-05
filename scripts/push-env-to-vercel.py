#!/usr/bin/env python3
"""
push-env-to-vercel.py
Liest alle Keys aus .env.local und pusht sie nach Vercel.

Verwendung:
  python3 scripts/push-env-to-vercel.py

Vorher: VERCEL_TOKEN in .env.local aktualisieren.
Neuen Token erstellen: https://vercel.com/account/tokens
"""

import json
import os
import re
import sys
import urllib.request
import urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── .env.local lesen ──────────────────────────────────────────────────────────

def load_env_local() -> dict[str, str]:
    path = os.path.join(ROOT, ".env.local")
    env: dict[str, str] = {}
    try:
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                env[key] = value
    except FileNotFoundError:
        print("❌ .env.local nicht gefunden")
        sys.exit(1)
    return env

# ── .vercel/project.json lesen ────────────────────────────────────────────────

def load_vercel_project() -> tuple[str, str]:
    path = os.path.join(ROOT, ".vercel", "project.json")
    try:
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        return d["projectId"], d["orgId"]
    except (FileNotFoundError, KeyError):
        print("❌ .vercel/project.json fehlt — führe erst 'npx vercel link' aus")
        sys.exit(1)

# ── Vercel API Wrapper ────────────────────────────────────────────────────────

def vercel_request(method: str, path: str, token: str, body: dict | None = None):
    url = f"https://api.vercel.com{path}"
    data = json.dumps(body).encode() if body else None
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read()), None
    except urllib.error.HTTPError as e:
        try:
            error_body = json.loads(e.read())
            code = error_body.get("error", {}).get("code", "unknown")
            msg  = error_body.get("error", {}).get("message", str(e))
            return None, (code, msg)
        except Exception:
            return None, ("http_error", str(e))

# ── Keys konfigurieren ────────────────────────────────────────────────────────

# Keys die nach Vercel sollen (Whitelist)
REQUIRED = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ANTHROPIC_API_KEY",
    "OPENAI_API_KEY",
    "CRON_SECRET",
    "TAVILY_API_KEY",
    "MOLLIE_API_KEY",
    "ADMIN_EMAILS",
    "ADMIN_SECRET",
]

OPTIONAL = [
    "GITHUB_TOKEN",
    "GITHUB_REPO",
]

ALL_TARGETS = ["production", "preview", "development"]

# ── Env-Var pushen ────────────────────────────────────────────────────────────

def push_key(key: str, value: str, token: str, project_id: str, team_id: str):
    # Für NEXT_PUBLIC_ Keys: alle Targets. Für Server-Keys: production + preview.
    targets = ALL_TARGETS if key.startswith("NEXT_PUBLIC_") else ["production", "preview", "development"]

    for target in targets:
        path = f"/v9/projects/{project_id}/env?teamId={team_id}"
        payload = {
            "key": key,
            "value": value,
            "type": "encrypted",
            "target": [target],
        }
        result, error = vercel_request("POST", path, token, payload)

        if error:
            code, msg = error
            if code == "ENV_ALREADY_EXISTS":
                # Existierenden Key updaten
                # Erst ID holen
                existing, _ = vercel_request(
                    "GET",
                    f"/v9/projects/{project_id}/env?teamId={team_id}",
                    token,
                )
                if existing:
                    env_id = next(
                        (e["id"] for e in existing.get("envs", [])
                         if e["key"] == key and target in e.get("target", [])),
                        None,
                    )
                    if env_id:
                        patch_path = f"/v9/projects/{project_id}/env/{env_id}?teamId={team_id}"
                        _, patch_err = vercel_request("PATCH", patch_path, token, {"value": value})
                        if patch_err:
                            print(f"  ⚠️  {key} [{target}] — Update fehlgeschlagen: {patch_err[1]}")
                        else:
                            print(f"  🔄 {key} [{target}] — aktualisiert")
                    else:
                        print(f"  ℹ️  {key} [{target}] — bereits vorhanden")
                else:
                    print(f"  ℹ️  {key} [{target}] — bereits vorhanden")
            elif code == "forbidden" or code == "not_authorized":
                print(f"\n  ❌ VERCEL_TOKEN ungültig!")
                print(f"     Neuen Token: https://vercel.com/account/tokens")
                print(f"     Dann VERCEL_TOKEN in .env.local aktualisieren und Script erneut ausführen.")
                sys.exit(1)
            else:
                print(f"  ⚠️  {key} [{target}] — Fehler: {code} — {msg}")
        else:
            print(f"  ✅ {key} [{target}]")

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    env = load_env_local()
    project_id, org_id = load_vercel_project()
    token = env.get("VERCEL_TOKEN", "")

    if not token:
        print("❌ VERCEL_TOKEN fehlt in .env.local")
        print("   Neuen Token: https://vercel.com/account/tokens")
        sys.exit(1)

    # Token validieren
    result, error = vercel_request("GET", "/v2/user", token)
    if error or (result and result.get("error")):
        print("❌ VERCEL_TOKEN ist ungültig.")
        print("   Neuen Token erstellen: https://vercel.com/account/tokens")
        print("   Dann in .env.local: VERCEL_TOKEN=\"dein-neuer-token\"")
        sys.exit(1)

    username = result.get("user", {}).get("username") or result.get("user", {}).get("email") or "?"
    print(f"✅ Vercel-Account: {username}")
    print(f"   Projekt-ID: {project_id}")
    print(f"   Org/Team-ID: {org_id}")
    print()

    print("── Pflicht-Keys ──────────────────────────────────────────")
    missing = []
    for key in REQUIRED:
        value = env.get(key, "")
        if not value:
            print(f"  ⚠️  {key} — fehlt in .env.local, übersprungen")
            missing.append(key)
            continue
        push_key(key, value, token, project_id, org_id)

    print()
    print("── Optionale Keys ────────────────────────────────────────")
    for key in OPTIONAL:
        value = env.get(key, "")
        if not value:
            print(f"  ─  {key} — nicht gesetzt, übersprungen")
            continue
        push_key(key, value, token, project_id, org_id)

    print()
    if missing:
        print(f"⚠️  Fehlende Keys (müssen manuell in .env.local ergänzt werden):")
        for k in missing:
            print(f"   {k}=...")
        print()

    print("🎉 Fertig! Vercel neu deployen:")
    print(f"   npx vercel --prod --token {token[:8]}...")

if __name__ == "__main__":
    main()
