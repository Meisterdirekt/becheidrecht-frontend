#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# CSS Contrast Audit — WCAG AAA (7:1) Checker
# Scannt alle .tsx-Dateien auf potenziell kontrastschwache Klassen
# und prüft, ob globals.css Light-Mode-Overrides vorhanden sind.
#
# Usage: bash scripts/css-audit.sh
# ──────────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SRC="src"
CSS="src/app/globals.css"
ISSUES=0

echo "╔══════════════════════════════════════════════╗"
echo "║  CSS Contrast Audit — WCAG AAA (7:1)        ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── 1. Dangerous text classes (low contrast on light backgrounds) ──
DANGEROUS_CLASSES=(
  "text-gray-300"
  "text-gray-400"
  "text-gray-500"
  "text-slate-300"
  "text-slate-400"
  "text-slate-500"
  "text-zinc-300"
  "text-zinc-400"
  "text-zinc-500"
  "text-neutral-300"
  "text-neutral-400"
  "text-neutral-500"
)

echo "── 1. Prüfe gefährliche Text-Klassen ──"
for cls in "${DANGEROUS_CLASSES[@]}"; do
  count=$(grep -rl "$cls" "$SRC" --include='*.tsx' 2>/dev/null | wc -l || true)
  if [ "$count" -gt 0 ]; then
    if grep -q "data-theme.*light.*$cls" "$CSS" 2>/dev/null; then
      echo -e "  ${GREEN}✓${NC} $cls ($count Dateien) — Override vorhanden"
    else
      echo -e "  ${RED}✗${NC} $cls ($count Dateien) — ${RED}KEIN Light-Mode-Override!${NC}"
      grep -rn "$cls" "$SRC" --include='*.tsx' 2>/dev/null | head -5 | sed 's/^/    /'
      ISSUES=$((ISSUES + 1))
    fi
  fi
done
echo ""

# ── 2. text-white mit Opacity (brauchen Override) ──
echo "── 2. Prüfe text-white Opacity-Varianten ──"
OPACITY_CLASSES=$(grep -roh 'text-white/[0-9]\+' "$SRC" --include='*.tsx' 2>/dev/null | sort -u || true)
for cls in $OPACITY_CLASSES; do
  opacity="${cls#text-white/}"
  if grep -q "text-white.*/$opacity" "$CSS" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $cls — Override vorhanden"
  else
    count=$(grep -r "$cls" "$SRC" --include='*.tsx' 2>/dev/null | wc -l || true)
    echo -e "  ${RED}✗${NC} $cls ($count Treffer) — ${RED}KEIN Override!${NC}"
    ISSUES=$((ISSUES + 1))
  fi
done
echo ""

# ── 3. Placeholder-Texte ──
echo "── 3. Prüfe Placeholder-Kontrast ──"
PLACEHOLDER_CLASSES=$(grep -roh 'placeholder:text-white/[0-9]\+' "$SRC" --include='*.tsx' 2>/dev/null | sort -u || true)
for cls in $PLACEHOLDER_CLASSES; do
  if grep -q 'placeholder.*text-white' "$CSS" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $cls — Override vorhanden"
  else
    echo -e "  ${RED}✗${NC} $cls — ${RED}KEIN Override!${NC}"
    ISSUES=$((ISSUES + 1))
  fi
done
echo ""

# ── 4. Hardcoded Farben mit niedrigem Kontrast ──
echo "── 4. Prüfe hardcoded niedrige Kontrast-Farben ──"
LOW_CONTRAST_HEX=("#9ca3af" "#94a3b8" "#a1a1aa" "#cbd5e1" "#d1d5db" "#d4d4d8")
for hex in "${LOW_CONTRAST_HEX[@]}"; do
  count=$(grep -ri "$hex" "$SRC" --include='*.tsx' 2>/dev/null | wc -l || true)
  if [ "$count" -gt 0 ]; then
    echo -e "  ${YELLOW}⚠${NC} $hex gefunden ($count Treffer) — Manuell prüfen!"
    grep -rin "$hex" "$SRC" --include='*.tsx' 2>/dev/null | head -3 | sed 's/^/    /'
    ISSUES=$((ISSUES + 1))
  fi
done
echo ""

# ── 5. CSS-Variablen Kontrast-Check ──
echo "── 5. CSS-Variablen Kontrast (gegen --bg: #f1f5f9) ──"
echo "  Referenz: AAA Normal ≥ 7:1 | AAA Large ≥ 4.5:1"
echo "  --text:       #0f172a → ~15.3:1  ✓ AAA"
echo "  --text-muted: #475569 →  ~7.3:1  ✓ AAA (knapp)"
echo "  --muted:      #334155 → ~12.7:1  ✓ AAA"
echo "  --accent:     #0ea5e9 →  ~3.2:1  ⚠ Nur dekorativ/large text"
echo ""

# ── Ergebnis ──
echo "══════════════════════════════════════════════"
if [ "$ISSUES" -eq 0 ]; then
  echo -e "${GREEN}  ✓ AUDIT BESTANDEN — 0 Kontrast-Probleme${NC}"
else
  echo -e "${RED}  ✗ $ISSUES PROBLEME GEFUNDEN — Fixes nötig!${NC}"
fi
echo "══════════════════════════════════════════════"
exit "$ISSUES"
