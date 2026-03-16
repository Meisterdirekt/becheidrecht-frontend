---
description: Regeln fuer UI-Komponenten — Mobile-First, Translations, Accessibility, Design-System
globs: src/components/**/*.tsx, src/app/**/page.tsx
---

# UI-Komponenten Regeln

1. **Mobile First** — Immer 375px zuerst. Responsive via `sm:`, `md:`, `lg:` Prefixes. Kein Desktop-only Layout.

2. **Translations** — Alle sichtbaren Strings aus `src/lib/page-translations.ts` laden. Nie hardcoded. Sprachen: DE, RU, EN, AR, TR.

3. **Arabisch (RTL)** — Bei Layout-relevanten Aenderungen `dir="rtl"` beruecksichtigen.

4. **Design-System Farben** — CSS-Variablen verwenden, keine Hex-Werte:
   - `var(--bg)`, `var(--accent)`, `var(--accent-hover)`
   - Severity: `red-500` (kritisch), `amber-500` (wichtig), `blue-500` (hinweis), `green-500` (erfolg)

5. **Accessibility** — `aria-label` auf Icon-Buttons. Kontrast WCAG AAA (>7:1) im Light-Mode. Fokus-States sichtbar.

6. **Lazy Loading** — Schwere Komponenten mit `dynamic(() => import(...), { ssr: false })` laden. Bundle-Size minimal halten.

7. **Dark/Light Mode** — Jede `bg-*` Klasse braucht ein `dark:` Gegenstueck (oder CSS-Variable die beides abdeckt).

8. **Fehler-UI** — Deutsche Meldungen, freundlich formuliert. Der User ist kein Entwickler.
