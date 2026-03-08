#!/usr/bin/env python3
"""
AG-ONBOARDING — Kunden-Account anlegen
=======================================
Direkt via Supabase Admin API — kein laufender Server nötig.

Verwendung:
  python3 scripts/create-customer.py \
    --email "kunde@beispiel.de" \
    --first-name "Max" \
    --last-name "Mustermann" \
    --plan "basic"

Oder interaktiv:
  python3 scripts/create-customer.py
"""

import argparse
import json
import sys
import urllib.request
import urllib.error
from datetime import datetime, timedelta
from pathlib import Path

# ─── Farben ───────────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
BOLD   = "\033[1m"
NC     = "\033[0m"

# ─── Abo-Konfiguration ────────────────────────────────────────────────────────
PLANS = {
    "single":           {"analysen": 1,    "monate": 0,  "label": "Einzel-Analyse"},
    "basic":            {"analysen": 5,    "monate": 1,  "label": "Basic (5 Analysen/Mo)"},
    "standard":         {"analysen": 15,   "monate": 1,  "label": "Standard (15 Analysen/Mo)"},
    "pro":              {"analysen": 50,   "monate": 1,  "label": "Pro (50 Analysen/Mo)"},
    "business":         {"analysen": 120,  "monate": 1,  "label": "Business (120 Analysen/Mo)"},
    "b2b_starter":      {"analysen": 300,  "monate": 12, "label": "B2B Starter (300/Jahr)"},
    "b2b_professional": {"analysen": 1000, "monate": 12, "label": "B2B Professional (1000/Jahr)"},
    "b2b_enterprise":   {"analysen": 2500, "monate": 12, "label": "B2B Enterprise (2500/Jahr)"},
    "b2b_corporate":    {"analysen": 6000, "monate": 12, "label": "B2B Corporate (6000/Jahr)"},
}

# ─── .env.local lesen ─────────────────────────────────────────────────────────
def load_env():
    env_file = Path(__file__).parent.parent / ".env.local"
    env = {}
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env

# ─── Supabase Admin API ───────────────────────────────────────────────────────
def supabase_request(method, path, supabase_url, service_key, data=None):
    url = f"{supabase_url}/auth/v1{path}"
    req = urllib.request.Request(url, method=method)
    req.add_header("apikey", service_key)
    req.add_header("Authorization", f"Bearer {service_key}")
    req.add_header("Content-Type", "application/json")
    if data:
        req.data = json.dumps(data).encode()
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read()), e.code

def supabase_db(method, path, supabase_url, service_key, data=None, params=None):
    url = f"{supabase_url}/rest/v1{path}"
    if params:
        url += "?" + "&".join(f"{k}={v}" for k, v in params.items())
    req = urllib.request.Request(url, method=method)
    req.add_header("apikey", service_key)
    req.add_header("Authorization", f"Bearer {service_key}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=representation")
    if data:
        req.data = json.dumps(data).encode()
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            body = r.read()
            return json.loads(body) if body else [], r.status
    except urllib.error.HTTPError as e:
        body = e.read()
        return json.loads(body) if body else {}, e.code

# ─── Hauptfunktion ────────────────────────────────────────────────────────────
def create_customer(email, first_name, last_name, plan, env):
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    service_key  = env.get("SUPABASE_SERVICE_ROLE_KEY", "")

    if not supabase_url or not service_key:
        print(f"{RED}✗ SUPABASE_URL oder SERVICE_ROLE_KEY fehlt in .env.local{NC}")
        sys.exit(1)

    plan_config = PLANS.get(plan)
    if not plan_config:
        print(f"{RED}✗ Ungültiger Plan: {plan}{NC}")
        print(f"  Erlaubt: {', '.join(PLANS.keys())}")
        sys.exit(1)

    print(f"\n{BOLD}Lege Account an...{NC}")
    print(f"  E-Mail:   {email}")
    print(f"  Name:     {first_name} {last_name}")
    print(f"  Plan:     {plan_config['label']}")
    print()

    # 1. Prüfen ob User bereits existiert
    existing, status = supabase_db(
        "GET", "/user_subscriptions",
        supabase_url, service_key,
        params={"email": f"eq.{email.lower().strip()}", "select": "user_id"}
    )
    if isinstance(existing, list) and len(existing) > 0:
        print(f"{YELLOW}⚠ Account mit '{email}' existiert bereits.{NC}")
        print(f"  User-ID: {existing[0]['user_id']}")
        print(f"  Nutze /kunde-abo-setzen um das Abo zu ändern.")
        sys.exit(0)

    # 2. Auth-User anlegen + Einladungs-Email senden
    print(f"  1/3 Auth-User anlegen + Einladungs-Email senden...")
    invite_data, invite_status = supabase_request(
        "POST", "/admin/users",
        supabase_url, service_key,
        data={
            "email": email.lower().strip(),
            "email_confirm": True,
            "user_metadata": {
                "first_name": first_name.strip(),
                "last_name": last_name.strip(),
            },
            "invite": True,
        }
    )

    if invite_status not in (200, 201) or "id" not in invite_data:
        print(f"{RED}✗ User-Anlage fehlgeschlagen (HTTP {invite_status}):{NC}")
        print(f"  {invite_data}")
        sys.exit(1)

    user_id = invite_data["id"]
    print(f"  {GREEN}✓ User angelegt: {user_id}{NC}")

    # 3. Auf user_subscriptions Zeile warten (DB-Trigger)
    print(f"  2/3 Subscription initialisieren...")
    import time
    sub_exists = False
    for _ in range(8):
        rows, _ = supabase_db(
            "GET", "/user_subscriptions",
            supabase_url, service_key,
            params={"user_id": f"eq.{user_id}", "select": "user_id"}
        )
        if isinstance(rows, list) and len(rows) > 0:
            sub_exists = True
            break
        time.sleep(0.5)

    if not sub_exists:
        # Manuell anlegen wenn Trigger nicht gefeuert hat
        supabase_db(
            "POST", "/user_subscriptions",
            supabase_url, service_key,
            data={
                "user_id": user_id,
                "email": email.lower().strip(),
                "subscription_type": "free",
                "status": "active",
                "analyses_total": 0,
                "analyses_used": 0,
                "analyses_remaining": 0,
            }
        )

    # 4. Abo zuweisen
    print(f"  3/3 Abo zuweisen ({plan_config['label']})...")
    monate = plan_config["monate"]
    expires_at = None
    if monate > 0:
        expires_at = (datetime.utcnow() + timedelta(days=monate * 30)).strftime("%Y-%m-%dT%H:%M:%SZ")

    update_result, update_status = supabase_db(
        "PATCH", "/user_subscriptions",
        supabase_url, service_key,
        data={
            "subscription_type": plan,
            "status": "active",
            "analyses_total": plan_config["analysen"],
            "analyses_remaining": plan_config["analysen"],
            "analyses_used": 0,
            "order_id": f"ADMIN_{int(time.time())}",
            "payment_method": "admin_created",
            "purchased_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "expires_at": expires_at,
            "updated_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        },
        params={"user_id": f"eq.{user_id}"}
    )

    if update_status not in (200, 201):
        print(f"{RED}✗ Abo-Zuweisung fehlgeschlagen (HTTP {update_status}):{NC}")
        print(f"  {update_result}")
        sys.exit(1)

    # ─── Erfolgsmeldung ───────────────────────────────────────────────────────
    print(f"\n{GREEN}{BOLD}✅ Account erfolgreich angelegt!{NC}")
    print(f"{'─' * 45}")
    print(f"  {BOLD}User-ID:{NC}   {user_id}")
    print(f"  {BOLD}E-Mail:{NC}    {email.lower().strip()}")
    print(f"  {BOLD}Name:{NC}      {first_name} {last_name}")
    print(f"  {BOLD}Plan:{NC}      {plan_config['label']}")
    print(f"  {BOLD}Analysen:{NC}  {plan_config['analysen']}")
    if expires_at:
        expires_formatted = datetime.strptime(expires_at, "%Y-%m-%dT%H:%M:%SZ").strftime("%d.%m.%Y")
        print(f"  {BOLD}Läuft bis:{NC} {expires_formatted}")
    else:
        print(f"  {BOLD}Läuft bis:{NC} unbegrenzt (Einzel)")
    print(f"{'─' * 45}")
    print(f"  {YELLOW}📧 Einladungs-Email wurde an {email} gesendet.{NC}")
    print(f"  Der Kunde muss sein Passwort über den Link setzen.\n")

# ─── CLI ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="BescheidRecht — Kunden-Account anlegen")
    parser.add_argument("--email",      help="E-Mail des Kunden")
    parser.add_argument("--first-name", help="Vorname")
    parser.add_argument("--last-name",  help="Nachname")
    parser.add_argument("--plan",       help=f"Abo-Typ: {', '.join(PLANS.keys())}")
    args = parser.parse_args()

    print(f"\n{BOLD}╔══════════════════════════════════════════╗{NC}")
    print(f"{BOLD}║   BescheidRecht — AG-ONBOARDING          ║{NC}")
    print(f"{BOLD}╚══════════════════════════════════════════╝{NC}")

    env = load_env()

    # Interaktiver Modus wenn keine Args
    email      = args.email      or input("\n  E-Mail des Kunden: ").strip()
    first_name = args.first_name or input("  Vorname:           ").strip()
    last_name  = args.last_name  or input("  Nachname:          ").strip()

    if not args.plan:
        print(f"\n  Verfügbare Pläne:")
        for key, cfg in PLANS.items():
            print(f"    {key:<22} {cfg['analysen']:>5} Analysen  {cfg['label']}")
        plan = input("\n  Plan wählen: ").strip()
    else:
        plan = args.plan

    if not email or not plan:
        print(f"{RED}✗ E-Mail und Plan sind Pflichtfelder.{NC}")
        sys.exit(1)

    create_customer(email, first_name or "", last_name or "", plan, env)

if __name__ == "__main__":
    main()
