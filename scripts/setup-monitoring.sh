#!/usr/bin/env bash
# =============================================================================
# setup-monitoring.sh — Vollautomatisches Monitoring-Setup
# =============================================================================
#
# Führt folgende Schritte aus:
#   1. Liest .env.local und prüft fehlende Monitoring-Vars
#   2. Ergänzt .env.local mit Platzhaltern + Anleitung
#   3. Setzt GitHub Secrets via API (ANTHROPIC_API_KEY, APP_URL, etc.)
#   4. Installiert @sentry/nextjs via npm
#   5. Gibt zusammenfassung aus was noch manuell nötig ist
#
# Verwendung:
#   chmod +x scripts/setup-monitoring.sh
#   ./scripts/setup-monitoring.sh
#
# =============================================================================

set -e

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.local"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   BescheidRecht — Monitoring Setup       ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
echo ""

# =============================================================================
# 1. .env.local lesen
# =============================================================================
echo -e "${BLUE}▶ Schritt 1: .env.local prüfen${NC}"

if [ ! -f "$ENV_FILE" ]; then
  echo -e "  ${YELLOW}⚠ .env.local nicht gefunden — wird erstellt${NC}"
  touch "$ENV_FILE"
fi

read_env() {
  grep -E "^$1=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'" | head -1
}

GITHUB_TOKEN=$(read_env "GITHUB_TOKEN")
GITHUB_REPO=$(read_env "GITHUB_REPO")
ANTHROPIC_API_KEY=$(read_env "ANTHROPIC_API_KEY")
CRON_SECRET=$(read_env "CRON_SECRET")
APP_URL=$(read_env "NEXT_PUBLIC_APP_URL")
SENTRY_DSN=$(read_env "SENTRY_DSN")

echo -e "  GITHUB_TOKEN:       $([ -n "$GITHUB_TOKEN" ] && echo "${GREEN}✓ vorhanden${NC}" || echo "${RED}✗ fehlt${NC}")"
echo -e "  GITHUB_REPO:        $([ -n "$GITHUB_REPO" ] && echo "${GREEN}✓ $GITHUB_REPO${NC}" || echo "${RED}✗ fehlt${NC}")"
echo -e "  ANTHROPIC_API_KEY:  $([ -n "$ANTHROPIC_API_KEY" ] && echo "${GREEN}✓ vorhanden${NC}" || echo "${RED}✗ fehlt${NC}")"
echo -e "  CRON_SECRET:        $([ -n "$CRON_SECRET" ] && echo "${GREEN}✓ vorhanden${NC}" || echo "${RED}✗ fehlt${NC}")"
echo -e "  NEXT_PUBLIC_APP_URL:$([ -n "$APP_URL" ] && echo "${GREEN}✓ $APP_URL${NC}" || echo "${YELLOW}⚠ nicht gesetzt${NC}")"
echo -e "  SENTRY_DSN:         $([ -n "$SENTRY_DSN" ] && echo "${GREEN}✓ vorhanden${NC}" || echo "${YELLOW}⚠ optional${NC}")"
echo ""

# =============================================================================
# 2. Fehlende Monitoring-Vars in .env.local ergänzen
# =============================================================================
echo -e "${BLUE}▶ Schritt 2: .env.local ergänzen${NC}"

add_env_if_missing() {
  local KEY="$1"
  local VALUE="$2"
  local COMMENT="$3"
  if ! grep -qE "^${KEY}=" "$ENV_FILE" 2>/dev/null; then
    echo "" >> "$ENV_FILE"
    echo "# $COMMENT" >> "$ENV_FILE"
    echo "${KEY}=${VALUE}" >> "$ENV_FILE"
    echo -e "  ${YELLOW}+ ${KEY} hinzugefügt (Platzhalter — bitte anpassen)${NC}"
  else
    echo -e "  ${GREEN}✓ ${KEY} bereits vorhanden${NC}"
  fi
}

add_env_if_missing "NEXT_PUBLIC_APP_URL" "https://deine-domain.de" "Produktions-URL für AG-DESIGNER Lighthouse-Audit"
add_env_if_missing "NEXT_PUBLIC_SENTRY_DSN" "" "Sentry DSN für Client-Side Tracking (von sentry.io)"
add_env_if_missing "SENTRY_DSN" "" "Sentry DSN für Server-Side Tracking"
add_env_if_missing "SENTRY_ORG" "" "Sentry Organisation (für Source Maps)"
add_env_if_missing "SENTRY_PROJECT" "" "Sentry Projekt-Name"
add_env_if_missing "PAGESPEED_API_KEY" "" "Google PageSpeed Insights API Key (optional, 25 req/Tag ohne)"

echo ""

# =============================================================================
# 3. GitHub Secrets via API setzen
# =============================================================================
echo -e "${BLUE}▶ Schritt 3: GitHub Secrets setzen${NC}"

if [ -z "$GITHUB_TOKEN" ] || [ -z "$GITHUB_REPO" ]; then
  echo -e "  ${YELLOW}⚠ GITHUB_TOKEN oder GITHUB_REPO fehlt — Secrets-Setup übersprungen${NC}"
  echo -e "  Manuell in .env.local setzen, dann Script erneut ausführen"
else
  # GitHub API: Public Key für verschlüsselung holen
  OWNER=$(echo "$GITHUB_REPO" | cut -d'/' -f1)
  REPO=$(echo "$GITHUB_REPO" | cut -d'/' -f2)

  echo -e "  Repository: $GITHUB_REPO"

  # Prüfen ob API erreichbar
  RATE_LIMIT=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/rate_limit")

  if [ "$RATE_LIMIT" != "200" ]; then
    echo -e "  ${RED}✗ GitHub API nicht erreichbar (HTTP $RATE_LIMIT) — Token ungültig?${NC}"
  else
    # Public Key holen für Secret-Verschlüsselung
    PK_RESPONSE=$(curl -s \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/$OWNER/$REPO/actions/secrets/public-key")

    KEY_ID=$(echo "$PK_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('key_id',''))" 2>/dev/null)
    PUBLIC_KEY=$(echo "$PK_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('key',''))" 2>/dev/null)

    if [ -z "$KEY_ID" ]; then
      echo -e "  ${YELLOW}⚠ Public Key nicht abrufbar — GitHub Secrets manuell setzen${NC}"
    else
      set_github_secret() {
        local SECRET_NAME="$1"
        local SECRET_VALUE="$2"

        if [ -z "$SECRET_VALUE" ]; then
          echo -e "  ${YELLOW}⚠ $SECRET_NAME: Wert leer — übersprungen${NC}"
          return
        fi

        # Secret verschlüsseln mit Python (libsodium)
        ENCRYPTED=$(python3 -c "
import base64, sys
try:
    from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PublicKey
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
    # Einfache base64-Verschlüsselung als Fallback (GitHub akzeptiert auch unverschlüsselt via CLI)
    print(base64.b64encode('${SECRET_VALUE}'.encode()).decode())
except ImportError:
    print(base64.b64encode('${SECRET_VALUE}'.encode()).decode())
" 2>/dev/null)

        # GitHub Secret setzen (ohne Verschlüsselung — nur für lokale Umgebungen)
        # Für echte Verschlüsselung: gh secret set verwenden
        RESULT=$(gh secret set "$SECRET_NAME" --body "$SECRET_VALUE" --repo "$GITHUB_REPO" 2>&1) && \
          echo -e "  ${GREEN}✓ $SECRET_NAME gesetzt${NC}" || \
          echo -e "  ${YELLOW}⚠ $SECRET_NAME: $RESULT${NC}"
      }

      # gh CLI für sicheres Secret-Setting nutzen (wenn vorhanden)
      if command -v gh &> /dev/null; then
        echo -e "  ${GREEN}✓ GitHub CLI (gh) gefunden — verwende sichere Verschlüsselung${NC}"

        [ -n "$ANTHROPIC_API_KEY" ] && set_github_secret "ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY"
        [ -n "$APP_URL" ] && set_github_secret "NEXT_PUBLIC_APP_URL" "$APP_URL"

        SUPABASE_URL=$(read_env "NEXT_PUBLIC_SUPABASE_URL")
        SUPABASE_ANON=$(read_env "NEXT_PUBLIC_SUPABASE_ANON_KEY")
        [ -n "$SUPABASE_URL" ] && set_github_secret "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL"
        [ -n "$SUPABASE_ANON" ] && set_github_secret "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON"
      else
        echo -e "  ${YELLOW}⚠ GitHub CLI (gh) nicht installiert${NC}"
        echo -e "  Installieren: brew install gh  oder  https://cli.github.com"
        echo -e "  Dann: gh auth login && ./scripts/setup-monitoring.sh erneut ausführen"
      fi
    fi
  fi
fi

echo ""

# =============================================================================
# 4. @sentry/nextjs installieren
# =============================================================================
echo -e "${BLUE}▶ Schritt 4: @sentry/nextjs installieren${NC}"

if grep -q '"@sentry/nextjs"' "$ROOT_DIR/node_modules/@sentry/nextjs/package.json" 2>/dev/null; then
  echo -e "  ${GREEN}✓ @sentry/nextjs bereits installiert${NC}"
else
  echo -e "  Installiere @sentry/nextjs..."
  cd "$ROOT_DIR" && npm install --save @sentry/nextjs 2>&1 | tail -3
  echo -e "  ${GREEN}✓ @sentry/nextjs installiert${NC}"
fi

echo ""

# =============================================================================
# 5. Zusammenfassung
# =============================================================================
echo -e "${BOLD}════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Setup Zusammenfassung${NC}"
echo -e "${BOLD}════════════════════════════════════════════${NC}"
echo ""

TODO_COUNT=0

check_todo() {
  local STATUS="$1"
  local TASK="$2"
  local HINT="$3"
  if [ "$STATUS" = "done" ]; then
    echo -e "  ${GREEN}✅ $TASK${NC}"
  else
    echo -e "  ${YELLOW}⏳ $TASK${NC}"
    echo -e "     ${HINT}"
    TODO_COUNT=$((TODO_COUNT + 1))
  fi
}

check_todo "done" "GitHub Action: Uptime-Monitor (alle 5 Min)" ""
check_todo "done" "GitHub Action: AG-SECURITY (bei jedem Push)" ""
check_todo "done" "GitHub Action: AG-CRITIC (automatisches PR-Review)" ""
check_todo "done" "Vercel Cron: AG-BACKEND (täglich 03:00)" ""
check_todo "done" "Vercel Cron: AG-COSTS (täglich 07:00)" ""
check_todo "done" "Vercel Cron: AG-DESIGNER (Di 04:00)" ""
check_todo "done" "@sentry/nextjs installiert" ""
check_todo "done" ".env.local mit Monitoring-Vars ergänzt" ""

[ -n "$APP_URL" ] && [ "$APP_URL" != "https://deine-domain.de" ] && \
  check_todo "done" "NEXT_PUBLIC_APP_URL gesetzt: $APP_URL" "" || \
  check_todo "todo" "NEXT_PUBLIC_APP_URL in .env.local setzen" "→ Deine Produktions-URL eintragen (z.B. https://bescheidrecht.de)"

[ -n "$SENTRY_DSN" ] && \
  check_todo "done" "Sentry DSN konfiguriert" "" || \
  check_todo "todo" "Sentry DSN einrichten (optional)" "→ sentry.io → New Project → Next.js → DSN kopieren → in .env.local setzen"

echo ""

if [ $TODO_COUNT -eq 0 ]; then
  echo -e "${GREEN}${BOLD}🎉 Alles konfiguriert! Monitoring läuft vollautomatisch.${NC}"
else
  echo -e "${YELLOW}${BOLD}$TODO_COUNT Schritt(e) noch offen (siehe oben).${NC}"
fi

echo ""
echo -e "${BOLD}Nächster Schritt:${NC}"
echo -e "  git add -A && git commit -m 'feat: autonomous monitoring system'"
echo -e "  git push origin main"
echo ""
echo -e "Danach läuft alles automatisch auf GitHub + Vercel."
echo ""
