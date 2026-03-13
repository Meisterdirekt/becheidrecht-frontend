/**
 * AG19 — Design-Quality-Guardian
 *
 * Wöchentlicher Design-System-Audit (Donnerstag 05:00 UTC) — prüft:
 *   1. Hardcoded Hex-Farben statt CSS-Variablen
 *   2. Fehlende responsive Prefixes (mobile-first)
 *   3. Fehlende aria-Labels auf Icon-Buttons
 *   4. Verbotene Patterns (framer-motion, !important, inline styles, falscher Font)
 *   5. Tailwind-Konsistenz (Spacing, Border-Radius, Typografie)
 *   6. Dark/Light Mode Coverage
 *   7. Design-System Klassen-Nutzung
 *
 * Erstellt GitHub Issue mit konkreten Findings + Handlungsempfehlungen.
 * Kosten: €0 — reine statische Code-Analyse, kein API-Call.
 */

import fs from "fs";
import path from "path";
import { reportInfo } from "@/lib/error-reporter";
import { createGitHubIssueManaged } from "./tools/github-issues";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DesignGuardianResult {
  farb_violations: DesignViolation[];
  responsive_violations: DesignViolation[];
  a11y_violations: DesignViolation[];
  verbotene_patterns: DesignViolation[];
  tailwind_violations: DesignViolation[];
  darkmode_violations: DesignViolation[];
  klassen_violations: DesignViolation[];
  gesamt_status: "ok" | "warnung" | "kritisch";
  gesamt_score: number; // 0-100
  issues_created: string[];
  zusammenfassung: string;
  dateien_geprueft: number;
}

export interface DesignViolation {
  datei: string;
  zeile: number;
  regel: string;
  gefunden: string;
  empfehlung: string;
  severity: "info" | "warnung" | "kritisch";
}

// ---------------------------------------------------------------------------
// Scan-Konfiguration
// ---------------------------------------------------------------------------

const SRC_DIR = path.join(process.cwd(), "src");
const GLOBALS_CSS = path.join(SRC_DIR, "app", "globals.css");

/** Dateien die gescannt werden (TSX + CSS) */
function collectFiles(dir: string, ext: string[]): string[] {
  const results: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
        results.push(...collectFiles(full, ext));
      } else if (entry.isFile() && ext.some((e) => entry.name.endsWith(e))) {
        results.push(full);
      }
    }
  } catch {
    // Verzeichnis nicht lesbar
  }
  return results;
}

function relativePath(absPath: string): string {
  return path.relative(process.cwd(), absPath);
}

// ---------------------------------------------------------------------------
// Phase 1: Hardcoded Farben
// ---------------------------------------------------------------------------

/** Hex-Farben die NICHT in CSS-Variablen oder Tailwind-Klassen stehen */
const ALLOWED_HEX = new Set([
  // Design-System Farben (in globals.css definiert)
  "#05070a", "#0c0f14", "#f1f5f9", "#0ea5e9", "#38bdf8", "#0284c7",
  "#64748b", "#0f172a", "#475569", "#fff", "#ffffff", "#000", "#000000",
]);

function checkHardcodedColors(files: string[]): DesignViolation[] {
  const violations: DesignViolation[] = [];
  // Hex-Farben in className oder style Attributen
  const hexPattern = /#[0-9a-fA-F]{3,8}\b/g;

  for (const file of files) {
    if (!file.endsWith(".tsx") && !file.endsWith(".ts")) continue;
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Nur in JSX/Template-Strings suchen, nicht in Imports/Kommentaren
      if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*") || line.trimStart().startsWith("import")) continue;

      // style={{ ... }} mit Hex-Farben
      if (line.includes("style=") || line.includes("Style")) {
        const matches = line.match(hexPattern);
        if (matches) {
          for (const hex of matches) {
            if (!ALLOWED_HEX.has(hex.toLowerCase())) {
              violations.push({
                datei: relativePath(file),
                zeile: i + 1,
                regel: "CSS-Variablen statt hardcoded Hex",
                gefunden: `Hardcoded Farbe "${hex}" in Style-Attribut`,
                empfehlung: "var(--accent), var(--bg), var(--text) etc. verwenden",
                severity: "warnung",
              });
            }
          }
        }
      }

      // Inline color/background mit Hex (nicht in Tailwind-Klassen)
      if ((line.includes('color:') || line.includes('background:') || line.includes('backgroundColor:')) && !line.includes('var(--')) {
        const matches = line.match(hexPattern);
        if (matches) {
          for (const hex of matches) {
            if (!ALLOWED_HEX.has(hex.toLowerCase())) {
              violations.push({
                datei: relativePath(file),
                zeile: i + 1,
                regel: "CSS-Variablen statt hardcoded Hex",
                gefunden: `Inline-Farbe "${hex}"`,
                empfehlung: "CSS-Variable verwenden: var(--accent), var(--bg) etc.",
                severity: "warnung",
              });
            }
          }
        }
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Phase 2: Responsive Prefixes (Mobile-First)
// ---------------------------------------------------------------------------

function checkResponsive(files: string[]): DesignViolation[] {
  const violations: DesignViolation[] = [];

  // Desktop-First Patterns (sollten mobile-first sein)
  const desktopFirstPatterns = [
    { pattern: /\blg:hidden\b/, msg: "lg:hidden → statt hidden lg:block (mobile-first)" },
    { pattern: /\bmd:hidden\b/, msg: "md:hidden → statt hidden md:block (mobile-first)" },
  ];

  // Fehlende responsive Breakpoints bei großen Texten
  const largeTextWithoutResponsive = /\btext-(4xl|5xl|6xl|7xl)\b(?!.*md:text-)/;

  for (const file of files) {
    if (!file.endsWith(".tsx")) continue;
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) continue;

      // Desktop-first Check
      for (const { pattern, msg } of desktopFirstPatterns) {
        if (pattern.test(line)) {
          violations.push({
            datei: relativePath(file),
            zeile: i + 1,
            regel: "Mobile-First Design",
            gefunden: msg.split(" → ")[0],
            empfehlung: msg,
            severity: "info",
          });
        }
      }

      // Große Texte ohne responsive Prefix
      if (largeTextWithoutResponsive.test(line) && line.includes("className")) {
        const match = line.match(/text-(4xl|5xl|6xl|7xl)/);
        if (match) {
          violations.push({
            datei: relativePath(file),
            zeile: i + 1,
            regel: "Responsive Typografie",
            gefunden: `text-${match[1]} ohne responsive Breakpoint`,
            empfehlung: `text-3xl md:text-${match[1]} (mobile-first)`,
            severity: "warnung",
          });
        }
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Phase 3: Accessibility
// ---------------------------------------------------------------------------

function checkAccessibility(files: string[]): DesignViolation[] {
  const violations: DesignViolation[] = [];

  for (const file of files) {
    if (!file.endsWith(".tsx")) continue;
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) continue;

      // Icon-only Buttons ohne aria-label
      // Pattern: <button ...> <Icon /> </button> ohne aria-label
      if (line.includes("<button") && !line.includes("aria-label") && !line.includes("aria-labelledby")) {
        // Prüfe ob in den nächsten 3 Zeilen nur ein Icon und kein Text
        const chunk = lines.slice(i, Math.min(i + 5, lines.length)).join(" ");
        const hasIcon = /Icon|<svg|<Loader|<X |<Menu /.test(chunk);
        const hasText = />[^<{]+</.test(chunk.replace(/<[^>]+>/g, (m) => m)); // Einfacher Heuristic
        if (hasIcon && !hasText && !chunk.includes("aria-label")) {
          violations.push({
            datei: relativePath(file),
            zeile: i + 1,
            regel: "WCAG: aria-label auf Icon-Buttons",
            gefunden: "Button ohne sichtbaren Text und ohne aria-label",
            empfehlung: 'aria-label="Beschreibung" hinzufügen',
            severity: "warnung",
          });
        }
      }

      // Bilder ohne alt-Text
      if (line.includes("<img") && !line.includes("alt=") && !line.includes("alt =")) {
        violations.push({
          datei: relativePath(file),
          zeile: i + 1,
          regel: "WCAG: Alt-Text auf Bildern",
          gefunden: "<img> ohne alt-Attribut",
          empfehlung: 'alt="Beschreibung" oder alt="" für dekorative Bilder',
          severity: "kritisch",
        });
      }

      // Clickable div ohne role/tabIndex
      if (line.includes("onClick") && (line.includes("<div") || line.includes("<span")) && !line.includes("role=") && !line.includes("tabIndex")) {
        violations.push({
          datei: relativePath(file),
          zeile: i + 1,
          regel: "WCAG: Interaktive Elemente",
          gefunden: "div/span mit onClick ohne role/tabIndex",
          empfehlung: 'role="button" tabIndex={0} hinzufügen oder <button> verwenden',
          severity: "warnung",
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Phase 4: Verbotene Patterns
// ---------------------------------------------------------------------------

function checkForbiddenPatterns(files: string[]): DesignViolation[] {
  const violations: DesignViolation[] = [];

  const forbidden = [
    { pattern: /from\s+["']framer-motion["']/, regel: "Keine Animations-Libraries", empfehlung: "CSS Transitions verwenden", severity: "kritisch" as const },
    { pattern: /from\s+["']gsap["']/, regel: "Keine Animations-Libraries", empfehlung: "CSS Transitions verwenden", severity: "kritisch" as const },
    { pattern: /from\s+["']lottie/, regel: "Keine Animations-Libraries", empfehlung: "CSS Transitions verwenden", severity: "kritisch" as const },
    { pattern: /!important/, regel: "Kein !important", empfehlung: "Spezifischere Selektoren oder Tailwind-Klassen verwenden", severity: "warnung" as const },
    { pattern: /font-family\s*:/, regel: "Keine inline font-family", empfehlung: "font-sans (Outfit) oder font-mono verwenden", severity: "warnung" as const },
    { pattern: /z-\[(1[0-9]{2,}|[2-9]\d{2,})\]/, regel: "z-index zu hoch", empfehlung: "Max z-[100] für Modals, z-50 für Nav", severity: "warnung" as const },
    { pattern: /\bany\b\s*[;,)\]}]/, regel: "Kein any in TypeScript", empfehlung: "Korrekten Typ verwenden", severity: "info" as const },
  ];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) continue;

      for (const { pattern, regel, empfehlung, severity } of forbidden) {
        if (pattern.test(line)) {
          const match = line.match(pattern);
          violations.push({
            datei: relativePath(file),
            zeile: i + 1,
            regel,
            gefunden: match?.[0] ?? line.trim().slice(0, 60),
            empfehlung,
            severity,
          });
        }
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Phase 5: Tailwind-Konsistenz
// ---------------------------------------------------------------------------

function checkTailwindConsistency(files: string[]): DesignViolation[] {
  const violations: DesignViolation[] = [];

  for (const file of files) {
    if (!file.endsWith(".tsx")) continue;
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*") || line.trimStart().startsWith("import")) continue;

      // Falsche Border-Radius auf Containern (sollte rounded-2xl sein)
      if (line.includes("className") && /\brounded-(sm|md|lg)\b/.test(line) && /\bp-(6|8|10)\b/.test(line)) {
        violations.push({
          datei: relativePath(file),
          zeile: i + 1,
          regel: "Border-Radius: Container = rounded-2xl",
          gefunden: `Container mit ${line.match(/rounded-(sm|md|lg)/)?.[0]}`,
          empfehlung: "rounded-2xl für Container, rounded-xl für innere Elemente",
          severity: "info",
        });
      }

      // Buttons mit falscher Rundung
      if (line.includes("className") && /btn-primary/.test(line) && /rounded-(xl|2xl|lg)/.test(line)) {
        violations.push({
          datei: relativePath(file),
          zeile: i + 1,
          regel: "Button-Shape: btn-primary = rounded-full",
          gefunden: "btn-primary mit falschem border-radius",
          empfehlung: "btn-primary verwendet rounded-full (pill shape)",
          severity: "warnung",
        });
      }

      // Shadow auf normalen Cards (verboten)
      if (line.includes("className") && /\bshadow-(sm|md|lg|xl)\b/.test(line) && /\bcard\b/.test(line) && !/\bhero\b/i.test(line) && !/\bmodal\b/i.test(line) && !/\bpro\b/i.test(line)) {
        violations.push({
          datei: relativePath(file),
          zeile: i + 1,
          regel: "Cards: Border statt Shadow",
          gefunden: "Shadow auf Standard-Card",
          empfehlung: "Border-System verwenden (border-white/10), Shadow nur für Hero/Modal/Pro",
          severity: "info",
        });
      }

      // Fixed pixel widths auf Containern
      if (line.includes("className") && /\bw-\[\d+px\]/.test(line) && !line.includes("glow") && !line.includes("orb")) {
        violations.push({
          datei: relativePath(file),
          zeile: i + 1,
          regel: "Keine fixen Pixel-Breiten",
          gefunden: line.match(/w-\[\d+px\]/)?.[0] ?? "",
          empfehlung: "max-w-{size} verwenden (max-w-7xl, max-w-4xl etc.)",
          severity: "warnung",
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Phase 6: Dark/Light Mode Coverage
// ---------------------------------------------------------------------------

function checkDarkLightMode(files: string[]): DesignViolation[] {
  const violations: DesignViolation[] = [];

  // Prüfe ob globals.css prefers-reduced-motion hat
  try {
    const css = fs.readFileSync(GLOBALS_CSS, "utf8");
    if (!css.includes("prefers-reduced-motion")) {
      violations.push({
        datei: relativePath(GLOBALS_CSS),
        zeile: 1,
        regel: "prefers-reduced-motion Support",
        gefunden: "Keine @media (prefers-reduced-motion: reduce) Regel",
        empfehlung: "Animationen/Transitions für reduced-motion deaktivieren",
        severity: "warnung",
      });
    }
  } catch {
    // globals.css nicht lesbar
  }

  // Prüfe TSX-Dateien auf hardcoded white/dark Farben ohne Light-Mode-Override
  for (const file of files) {
    if (!file.endsWith(".tsx")) continue;
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) continue;

      // text-white ohne Dark/Light-Handling (heuristisch — nur wenn kein Theme-Aware-Pattern)
      if (line.includes("bg-white") && !line.includes("bg-white/") && !line.includes("dark:") && line.includes("className")) {
        violations.push({
          datei: relativePath(file),
          zeile: i + 1,
          regel: "Dark-First: bg-white braucht Theme-Handling",
          gefunden: "bg-white ohne Opacity oder Theme-Handling",
          empfehlung: "bg-white/[0.03] (Dark) oder var(--bg-elevated) verwenden",
          severity: "info",
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Phase 7: Design-System Klassen-Nutzung
// ---------------------------------------------------------------------------

function checkDesignSystemUsage(files: string[]): DesignViolation[] {
  const violations: DesignViolation[] = [];

  for (const file of files) {
    if (!file.endsWith(".tsx")) continue;
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*") || line.trimStart().startsWith("import")) continue;

      // Label-Styling inline statt .label-upper Klasse
      if (line.includes("tracking-widest") && line.includes("uppercase") && line.includes("text-[10px]") && !line.includes("label-upper")) {
        violations.push({
          datei: relativePath(file),
          zeile: i + 1,
          regel: "Design-System: .label-upper Klasse verwenden",
          gefunden: "Inline Label-Styling statt Klasse",
          empfehlung: 'className="label-upper" verwenden',
          severity: "info",
        });
      }

      // Input-Styling inline statt .input-field Klasse
      if (line.includes("<input") && line.includes("border-white/10") && line.includes("bg-white/5") && !line.includes("input-field")) {
        violations.push({
          datei: relativePath(file),
          zeile: i + 1,
          regel: "Design-System: .input-field Klasse verwenden",
          gefunden: "Inline Input-Styling statt Klasse",
          empfehlung: 'className="input-field" verwenden',
          severity: "info",
        });
      }

      // Button-Styling inline statt .btn-primary
      if (line.includes("tracking-[0.2em]") && line.includes("uppercase") && line.includes("font-bold") &&
          (line.includes("bg-[var(--accent)]") || line.includes("bg-accent")) && !line.includes("btn-primary")) {
        violations.push({
          datei: relativePath(file),
          zeile: i + 1,
          regel: "Design-System: .btn-primary Klasse verwenden",
          gefunden: "Inline Button-Styling statt Klasse",
          empfehlung: 'className="btn-primary" verwenden',
          severity: "info",
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Score berechnen
// ---------------------------------------------------------------------------

function calculateScore(result: DesignGuardianResult): number {
  const weights = {
    kritisch: 5,
    warnung: 2,
    info: 0.5,
  };

  const allViolations = [
    ...result.farb_violations,
    ...result.responsive_violations,
    ...result.a11y_violations,
    ...result.verbotene_patterns,
    ...result.tailwind_violations,
    ...result.darkmode_violations,
    ...result.klassen_violations,
  ];

  let penalty = 0;
  for (const v of allViolations) {
    penalty += weights[v.severity];
  }

  // Score: 100 minus Penalty, min 0
  return Math.max(0, Math.round(100 - penalty));
}

// ---------------------------------------------------------------------------
// GitHub Issue erstellen
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Report formatieren
// ---------------------------------------------------------------------------

function formatReport(result: DesignGuardianResult): string {
  const lines: string[] = [
    `## AG19 Design-Guardian Audit — ${new Date().toLocaleDateString("de-DE")}`,
    `**Design-Score:** ${result.gesamt_score}/100 ${result.gesamt_score >= 90 ? "🟢" : result.gesamt_score >= 70 ? "🟡" : result.gesamt_score >= 50 ? "🟠" : "🔴"}`,
    `**Status:** ${result.gesamt_status === "ok" ? "✅ Design-System konform" : result.gesamt_status === "warnung" ? "⚠️ Abweichungen gefunden" : "🔴 Kritische Violations"}`,
    `**Dateien geprüft:** ${result.dateien_geprueft}`,
    "",
  ];

  const sections: Array<{ title: string; icon: string; violations: DesignViolation[] }> = [
    { title: "Farb-Violations", icon: "🎨", violations: result.farb_violations },
    { title: "Responsive-Design", icon: "📱", violations: result.responsive_violations },
    { title: "Accessibility (WCAG)", icon: "♿", violations: result.a11y_violations },
    { title: "Verbotene Patterns", icon: "🚫", violations: result.verbotene_patterns },
    { title: "Tailwind-Konsistenz", icon: "🔧", violations: result.tailwind_violations },
    { title: "Dark/Light Mode", icon: "🌗", violations: result.darkmode_violations },
    { title: "Design-System Klassen", icon: "📐", violations: result.klassen_violations },
  ];

  for (const { title, icon, violations } of sections) {
    if (violations.length === 0) continue;

    lines.push(`### ${icon} ${title} (${violations.length})`);
    lines.push("| Datei | Zeile | Gefunden | Empfehlung | Severity |");
    lines.push("|-------|-------|----------|------------|----------|");

    for (const v of violations.slice(0, 15)) {
      const severityIcon = v.severity === "kritisch" ? "🔴" : v.severity === "warnung" ? "🟡" : "ℹ️";
      lines.push(`| \`${v.datei}\` | ${v.zeile} | ${v.gefunden.slice(0, 50)} | ${v.empfehlung.slice(0, 50)} | ${severityIcon} |`);
    }

    if (violations.length > 15) {
      lines.push(`| ... | ... | +${violations.length - 15} weitere | ... | ... |`);
    }
    lines.push("");
  }

  // Zusammenfassung
  const totalViolations =
    result.farb_violations.length +
    result.responsive_violations.length +
    result.a11y_violations.length +
    result.verbotene_patterns.length +
    result.tailwind_violations.length +
    result.darkmode_violations.length +
    result.klassen_violations.length;

  const kritisch = [
    ...result.farb_violations, ...result.responsive_violations, ...result.a11y_violations,
    ...result.verbotene_patterns, ...result.tailwind_violations, ...result.darkmode_violations,
    ...result.klassen_violations,
  ].filter((v) => v.severity === "kritisch").length;

  lines.push("### 📊 Zusammenfassung");
  lines.push(`- **Gesamt:** ${totalViolations} Violations (${kritisch} kritisch)`);
  lines.push(`- **Score:** ${result.gesamt_score}/100`);

  if (kritisch > 0) {
    lines.push("");
    lines.push("### 🎯 Prioritäten");
    lines.push("1. **Sofort:** Kritische Violations beheben (fehlende alt-Texte, verbotene Libraries)");
    lines.push("2. **Diese Woche:** Warnungen beheben (hardcoded Farben, fehlende responsive Prefixes)");
    lines.push("3. **Nächste Iteration:** Info-Level anpassen (Design-System-Klassen konsolidieren)");
  }

  lines.push("");
  lines.push("---");
  lines.push(`*Automatisch erstellt von AG19 Design-Guardian • ${new Date().toISOString()}*`);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Haupt-Funktion
// ---------------------------------------------------------------------------

export async function runDesignGuardian(): Promise<DesignGuardianResult> {
  reportInfo("[AG19] Design-Guardian Audit gestartet", { timestamp: new Date().toISOString() });

  // Alle TSX + CSS Dateien sammeln
  const tsxFiles = collectFiles(SRC_DIR, [".tsx", ".ts"]);
  const cssFiles = collectFiles(SRC_DIR, [".css"]);
  const allFiles = [...tsxFiles, ...cssFiles];

  reportInfo("[AG19] Dateien gesammelt", { tsx: tsxFiles.length, css: cssFiles.length });

  // Phase 1-7 ausführen
  const farbViolations = checkHardcodedColors(tsxFiles);
  reportInfo("[AG19] Phase 1 (Farben) abgeschlossen", { findings: farbViolations.length });

  const responsiveViolations = checkResponsive(tsxFiles);
  reportInfo("[AG19] Phase 2 (Responsive) abgeschlossen", { findings: responsiveViolations.length });

  const a11yViolations = checkAccessibility(tsxFiles);
  reportInfo("[AG19] Phase 3 (A11y) abgeschlossen", { findings: a11yViolations.length });

  const verbotenePatterns = checkForbiddenPatterns(allFiles);
  reportInfo("[AG19] Phase 4 (Verbotene Patterns) abgeschlossen", { findings: verbotenePatterns.length });

  const tailwindViolations = checkTailwindConsistency(tsxFiles);
  reportInfo("[AG19] Phase 5 (Tailwind) abgeschlossen", { findings: tailwindViolations.length });

  const darkmodeViolations = checkDarkLightMode([...tsxFiles, ...cssFiles]);
  reportInfo("[AG19] Phase 6 (Dark/Light) abgeschlossen", { findings: darkmodeViolations.length });

  const klassenViolations = checkDesignSystemUsage(tsxFiles);
  reportInfo("[AG19] Phase 7 (Klassen) abgeschlossen", { findings: klassenViolations.length });

  // Ergebnis zusammenbauen
  const result: DesignGuardianResult = {
    farb_violations: farbViolations,
    responsive_violations: responsiveViolations,
    a11y_violations: a11yViolations,
    verbotene_patterns: verbotenePatterns,
    tailwind_violations: tailwindViolations,
    darkmode_violations: darkmodeViolations,
    klassen_violations: klassenViolations,
    gesamt_status: "ok",
    gesamt_score: 0,
    issues_created: [],
    zusammenfassung: "",
    dateien_geprueft: allFiles.length,
  };

  result.gesamt_score = calculateScore(result);

  const hasCritical = [...farbViolations, ...a11yViolations, ...verbotenePatterns].some((v) => v.severity === "kritisch");
  const hasWarning = [
    ...farbViolations, ...responsiveViolations, ...a11yViolations,
    ...verbotenePatterns, ...tailwindViolations, ...darkmodeViolations,
  ].some((v) => v.severity === "warnung");

  result.gesamt_status = hasCritical ? "kritisch" : hasWarning ? "warnung" : "ok";

  const totalViolations =
    farbViolations.length + responsiveViolations.length + a11yViolations.length +
    verbotenePatterns.length + tailwindViolations.length + darkmodeViolations.length +
    klassenViolations.length;

  result.zusammenfassung = `AG19 Design-Guardian: ${result.gesamt_status.toUpperCase()} — Score ${result.gesamt_score}/100, ${totalViolations} Violations, ${allFiles.length} Dateien geprüft`;

  // GitHub Issue erstellen wenn Violations > 0
  if (totalViolations > 0) {
    const report = formatReport(result);
    const scoreLabel = result.gesamt_score >= 90 ? "🟢" : result.gesamt_score >= 70 ? "🟡" : result.gesamt_score >= 50 ? "🟠" : "🔴";
    const issueUrl = await createGitHubIssueManaged({
      title: `🎨 AG19 Design-Guardian: ${scoreLabel} Score ${result.gesamt_score}/100 — ${new Date().toLocaleDateString("de-DE")}`,
      body: report,
      labels: ["design", "automated", "quality"],
      agentPrefix: "AG19",
    });

    if (issueUrl) {
      result.issues_created.push(issueUrl);
      reportInfo("[AG19] GitHub Issue erstellt", { issueUrl });
    }
  }

  reportInfo("[AG19] Design-Guardian Audit abgeschlossen", {
    score: result.gesamt_score,
    status: result.gesamt_status,
    violations: totalViolations,
  });

  return result;
}
