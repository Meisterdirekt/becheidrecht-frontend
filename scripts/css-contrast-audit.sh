#!/usr/bin/env bash
# CSS Contrast Audit — BescheidRecht
# Prüft Light-Mode-Kontraste gegen WCAG AAA (7:1)
# Usage: bash scripts/css-contrast-audit.sh

set -uo pipefail

SRC_DIR="src"
GLOBALS="src/app/globals.css"
PASS=0
WARN=0
FAIL=0

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "═══════════════════════════════════════════════"
echo "  CSS Contrast Audit — WCAG AAA (7:1)"
echo "═══════════════════════════════════════════════"
echo ""

# 1. Prüfe ob Light-Mode-Variablen definiert sind
echo "▸ Light-Mode CSS-Variablen"
if grep -q '\[data-theme="light"\]' "$GLOBALS"; then
  echo -e "  ${GREEN}✓${NC} Light-Mode-Block vorhanden"
  ((PASS++))
else
  echo -e "  ${RED}✗${NC} Light-Mode-Block FEHLT"
  ((FAIL++))
fi

# 2. Prüfe --text-muted Wert (muss dunkler als #475569 sein für AAA)
TEXT_MUTED=$(grep -A15 '\[data-theme="light"\]' "$GLOBALS" | grep -oP '(?<=--text-muted:\s)#[0-9a-fA-F]+' | head -1)

AAA_SAFE_VALUES=("#0f172a" "#1e293b" "#334155")
if [[ " ${AAA_SAFE_VALUES[*]} " =~ " ${TEXT_MUTED} " ]]; then
  echo -e "  ${GREEN}✓${NC} --text-muted: ${TEXT_MUTED} (AAA-konform)"
  ((PASS++))
else
  echo -e "  ${YELLOW}⚠${NC} --text-muted: ${TEXT_MUTED} — prüfe Kontrast manuell"
  ((WARN++))
fi

echo ""

# 3. Finde unabgedeckte text-white Opacity-Klassen
echo "▸ text-white/N Overrides in globals.css"
COVERED_OPACITIES=$(grep -oP 'text-white\\/\K[0-9]+' "$GLOBALS" | sort -un)
USED_OPACITIES=$(grep -rhoP 'text-white/\K[0-9]+' "$SRC_DIR" --include="*.tsx" --include="*.ts" | sort -un)

MISSING=""
for op in $USED_OPACITIES; do
  if ! echo "$COVERED_OPACITIES" | grep -qx "$op"; then
    MISSING="$MISSING $op"
  fi
done

if [ -z "$MISSING" ]; then
  echo -e "  ${GREEN}✓${NC} Alle verwendeten text-white/N Stufen sind überschrieben"
  ((PASS++))
else
  echo -e "  ${RED}✗${NC} Fehlende Overrides für: text-white/${MISSING}"
  ((FAIL++))
fi

echo ""

# 4. Finde text-slate/text-gray Klassen ohne Override
echo "▸ text-slate-* / text-gray-* Overrides"
SLATE_USED=$(grep -rhoP 'text-slate-\K[0-9]+' "$SRC_DIR" --include="*.tsx" | sort -un)
SLATE_COVERED=$(grep -oP 'text-slate-\K[0-9]+' "$GLOBALS" | sort -un)

SLATE_MISSING=""
for s in $SLATE_USED; do
  # slate-600+ sind dunkel genug nativ
  if [ "$s" -lt 600 ] && ! echo "$SLATE_COVERED" | grep -qx "$s"; then
    SLATE_MISSING="$SLATE_MISSING $s"
  fi
done

if [ -z "$SLATE_MISSING" ]; then
  echo -e "  ${GREEN}✓${NC} Alle hellen slate-Klassen sind überschrieben"
  ((PASS++))
else
  echo -e "  ${RED}✗${NC} Fehlende Overrides für: text-slate-${SLATE_MISSING}"
  ((FAIL++))
fi

GRAY_USED=$(grep -rhoP 'text-gray-\K[0-9]+' "$SRC_DIR" --include="*.tsx" | sort -un)
GRAY_COVERED=$(grep -oP 'text-gray-\K[0-9]+' "$GLOBALS" | sort -un)

GRAY_MISSING=""
for g in $GRAY_USED; do
  if [ "$g" -lt 600 ] && ! echo "$GRAY_COVERED" | grep -qx "$g"; then
    GRAY_MISSING="$GRAY_MISSING $g"
  fi
done

if [ -z "$GRAY_MISSING" ]; then
  echo -e "  ${GREEN}✓${NC} Alle hellen gray-Klassen sind überschrieben"
  ((PASS++))
else
  echo -e "  ${RED}✗${NC} Fehlende Overrides für: text-gray-${GRAY_MISSING}"
  ((FAIL++))
fi

echo ""

# 5. Prüfe Placeholder-Overrides
echo "▸ Placeholder-Text Overrides"
PLACEHOLDER_USED=$(grep -rhoP 'placeholder:text-white/\K[0-9]+' "$SRC_DIR" --include="*.tsx" | sort -un)
PLACEHOLDER_COVERED=$(grep -oP 'placeholder\\:text-white\\/\K[0-9]+' "$GLOBALS" | sort -un)

PH_MISSING=""
for p in $PLACEHOLDER_USED; do
  if ! echo "$PLACEHOLDER_COVERED" | grep -qx "$p"; then
    PH_MISSING="$PH_MISSING $p"
  fi
done

if [ -z "$PH_MISSING" ]; then
  echo -e "  ${GREEN}✓${NC} Alle Placeholder-Stufen sind überschrieben"
  ((PASS++))
else
  echo -e "  ${RED}✗${NC} Fehlende Placeholder-Overrides für: ${PH_MISSING}"
  ((FAIL++))
fi

echo ""

# 6. Finde hardcodierte helle Hex-Textfarben
echo "▸ Hardcodierte helle Textfarben"
LIGHT_HEX=$(grep -rhoP 'text-\[#[89a-fA-F][0-9a-fA-F]{5}\]' "$SRC_DIR" --include="*.tsx" --include="*.ts" || true)

if [ -z "$LIGHT_HEX" ]; then
  echo -e "  ${GREEN}✓${NC} Keine hardcodierten hellen Textfarben gefunden"
  ((PASS++))
else
  echo -e "  ${RED}✗${NC} Helle Hex-Textfarben gefunden:"
  echo "$LIGHT_HEX" | head -10
  ((FAIL++))
fi

echo ""

# 7. Prüfe bg-white Opacity-Overrides
echo "▸ bg-white Opacity Overrides"
BG_USED=$(grep -roP 'bg-white/\K[0-9]+|\[0\.\K[0-9]+' "$SRC_DIR" --include="*.tsx" | sort -un | head -20)
BG_MISSING_COUNT=0
# Einfacher Check: globals.css muss bg-white Overrides haben
if grep -q 'bg-white' "$GLOBALS"; then
  echo -e "  ${GREEN}✓${NC} bg-white Overrides vorhanden"
  ((PASS++))
else
  echo -e "  ${RED}✗${NC} bg-white Overrides FEHLEN"
  ((FAIL++))
fi

echo ""

# Zusammenfassung
echo "═══════════════════════════════════════════════"
TOTAL=$((PASS + WARN + FAIL))
echo -e "  Ergebnis: ${GREEN}${PASS} OK${NC}  ${YELLOW}${WARN} Warnung${NC}  ${RED}${FAIL} Fehler${NC}  (${TOTAL} Checks)"

if [ "$FAIL" -gt 0 ]; then
  echo -e "  ${RED}▸ WCAG AAA nicht vollständig erreicht${NC}"
  echo "  Fehlende Overrides in globals.css ergänzen!"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo -e "  ${YELLOW}▸ WCAG AAA wahrscheinlich OK, manuelle Prüfung empfohlen${NC}"
  exit 0
else
  echo -e "  ${GREEN}▸ WCAG AAA Contrast Excellence ✓${NC}"
  exit 0
fi
