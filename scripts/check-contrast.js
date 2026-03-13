#!/usr/bin/env node
/**
 * WCAG AAA Contrast Checker
 * Scannt alle .tsx-Dateien auf Farbklassen mit unzureichendem Kontrast im Light-Mode.
 *
 * Nutzung: node scripts/check-contrast.js
 */

const fs = require('fs');
const path = require('path');

function findFiles(dir, ext, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findFiles(full, ext, results);
    else if (entry.name.endsWith(ext)) results.push(full);
  }
  return results;
}

// Farben als [R, G, B]
const COLORS = {
  '#f1f5f9': [241, 245, 249], // --bg (light)
  '#ffffff': [255, 255, 255], // --bg-elevated (light)
  '#0f172a': [15, 23, 42],   // --text
  '#1e293b': [30, 41, 59],   // --text-muted
  '#334155': [51, 65, 85],   // --text-faint
  '#475569': [71, 85, 105],  // slate-600
  '#64748b': [100, 116, 139],// slate-500
  '#94a3b8': [148, 163, 184],// slate-400
  '#cbd5e1': [203, 213, 225],// slate-300
};

// Relative Luminanz (WCAG 2.1)
function luminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(c1, c2) {
  const l1 = luminance(c1);
  const l2 = luminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Problemklassen: Tailwind-Textfarben die im Light-Mode OHNE Override zu wenig Kontrast hätten
const PROBLEMATIC_PATTERNS = [
  // text-white mit Opacity < 60 → ohne Override auf weißem BG unsichtbar
  { pattern: /text-white\/(\d+)/g, check: (match) => {
    const opacity = parseInt(match[1]);
    // white mit Opacity auf #f1f5f9 → fast unsichtbar
    return opacity < 60 ? `text-white/${opacity} — braucht Light-Mode Override (CSS vorhanden)` : null;
  }},
  // text-gray/slate unter 600 → Kontrast auf #f1f5f9 unter 7:1
  { pattern: /text-(gray|slate)-(\d{3})/g, check: (match) => {
    const shade = parseInt(match[2]);
    if (shade <= 400) {
      const colorMap = { 300: '#cbd5e1', 400: '#94a3b8' };
      const hex = colorMap[shade];
      if (hex && COLORS[hex]) {
        const ratio = contrastRatio(COLORS[hex], COLORS['#f1f5f9']);
        if (ratio < 4.5) {
          return `text-${match[1]}-${shade} — ${ratio.toFixed(1)}:1 auf #f1f5f9 (braucht Override)`;
        }
      }
    }
    return null;
  }},
];

// Scan
const srcDir = path.join(__dirname, '..', 'src');
const files = findFiles(srcDir, '.tsx').map(f => path.relative(srcDir, f));

let totalIssues = 0;
const issues = [];

for (const file of files) {
  const fullPath = path.join(srcDir, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    for (const { pattern, check } of PROBLEMATIC_PATTERNS) {
      pattern.lastIndex = 0;
      let m;
      while ((m = pattern.exec(lines[i])) !== null) {
        const issue = check(m);
        if (issue) {
          issues.push({ file: `src/${file}`, line: i + 1, issue });
          totalIssues++;
        }
      }
    }
  }
}

// Report
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  WCAG AAA Contrast Audit — BescheidRecht               ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log();

// Kontrast-Referenz
console.log('Kontrast-Referenz (auf --bg #f1f5f9):');
const bgLight = COLORS['#f1f5f9'];
const refs = [
  ['--text     #0f172a', COLORS['#0f172a']],
  ['--text-muted #1e293b', COLORS['#1e293b']],
  ['--text-faint #334155', COLORS['#334155']],
  ['slate-600  #475569', COLORS['#475569']],
  ['slate-500  #64748b', COLORS['#64748b']],
  ['slate-400  #94a3b8', COLORS['#94a3b8']],
];
for (const [label, color] of refs) {
  const ratio = contrastRatio(color, bgLight);
  const status = ratio >= 7 ? '✓ AAA' : ratio >= 4.5 ? '~ AA ' : '✗ FAIL';
  console.log(`  ${status}  ${ratio.toFixed(1)}:1  ${label}`);
}
console.log();

if (issues.length === 0) {
  console.log('✓ Keine ungeschützten Kontrastprobleme gefunden.');
  console.log('  Alle text-white/* und text-gray/slate-* Klassen haben CSS-Overrides.');
} else {
  console.log(`⚠ ${totalIssues} Stellen mit potenziellen Kontrastproblemen:`);
  console.log('  (Prüfe ob globals.css Light-Mode Overrides diese abdecken)\n');
  for (const { file, line, issue } of issues) {
    console.log(`  ${file}:${line}`);
    console.log(`    → ${issue}`);
  }
}

console.log();
process.exit(issues.length > 0 ? 1 : 0);
