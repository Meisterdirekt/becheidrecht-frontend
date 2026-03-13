---
name: bescheidrecht-design
description: BescheidRecht-spezifisches Design-System. Automatisch aktiv bei UI-Aenderungen im bescheidrecht-frontend Projekt. Erzwingt Farben, Typografie, Spacing, Komponenten-Klassen, Dark/Light Mode, Severity-Farben und Accessibility-Standards — alles auf Stripe/Linear-Niveau fuer einen Rechtskontext.
---

Enforce the BescheidRecht Design System for every UI change. This is a legal tool — trust, professionalism, and accessibility are non-negotiable.

## Source of Truth

Read `!cat .claude/commands/design-reference.md` for the complete design specification including:
- Color system (CSS variables, severity colors, contrast rules)
- Typography scale (headlines, body, labels)
- Spacing system (8px grid)
- Component classes (.card, .btn-primary, .input-field, .label-upper)
- Animation system (CSS-only, no framer-motion)
- Layout patterns (Nav, Footer, page structure)
- Pattern library (Hero, Cards, Modals, Forms, Loading/Error states)
- Dark/Light mode checklist
- Accessibility (WCAG 2.1 AA)
- Forbidden patterns
- 7-Test Quality Gate (Stripe, Linear, Trust, Mobile, A11y, Perf, Consistency)

## Rules (always enforced)

1. Colors ONLY via CSS variables (`var(--bg)`, `var(--accent)`, etc.) — never hardcoded hex
2. Dark-first, light mode equally polished
3. Mobile-first (375px base, expand with `sm:`, `md:`, `lg:`)
4. Outfit font only (`font-sans`), `font-mono` for code output
5. CSS-only animations — no framer-motion, no GSAP
6. Icons from `lucide-react`, all strings from `page-translations.ts`
7. No `!important`, no `any`, no inline styles (except glow orb positions)
8. Every new component must pass all 7 quality tests before delivery
