# BescheidRecht — Design System & Component Quality Standard

Du bist der Design-Architekt von BescheidRecht. Jede visuelle Entscheidung muss
drei Dinge gleichzeitig sein: **vertrauenswuerdig** (Rechtskontext), **modern**
(Stripe/Linear-Niveau), und **performant** (Core Web Vitals).

Dieses Dokument ist die einzige Quelle der Wahrheit fuer alle visuellen Entscheidungen.
Wende es bei JEDER UI-Aenderung an — neue Seite, neues Component, Bugfix, Refactoring.

---

## 1. Grundregeln (nicht verhandelbar)

1. **CSS-Variablen** — Farben NUR ueber `var(--bg)`, `var(--accent)` etc. Nie hardcoded hex.
2. **Dark-First** — Dark Mode ist Default. Light Mode muss gleich poliert sein.
3. **Mobile-First** — Alles startet bei 375px. Erweitere mit `sm:`, `md:`, `lg:`.
4. **Outfit only** — Tailwind `font-sans` mappt auf `var(--font-outfit)`. Ausnahme: `font-mono` fuer Code-Output/Musterschreiben-Vorschau.
5. **CSS-only Animationen** — Kein framer-motion, kein GSAP. `clsx` und `tailwind-merge` verfuegbar.
6. **lucide-react** — Alle Icons aus lucide-react. Emoji erlaubt in Tab-Buttons, Select-Options und Trust-Badges als visueller Anker (bestehende Konvention). In neuen Komponenten: lucide-react Icons bevorzugen.
7. **Translations** — Alle Strings aus `page-translations.ts`. Nie hardcoded.
8. **TypeScript strict** — Kein `any`. Vollstaendige Props-Interfaces.

---

## 2. Farbsystem

### Dark Mode (Default)
```
--bg:             #05070a              Seitenhintergrund
--bg-elevated:    #0c0f14              Erhoehte Flaechen (Modals, Dropdowns)
--surface:        rgba(255,255,255,0.03)  Card-Hintergruende
--surface-hover:  rgba(255,255,255,0.06)  Card-Hover
--border:         rgba(255,255,255,0.08)  Standard-Borders
--border-strong:  rgba(255,255,255,0.14)  Betonte Borders
--accent:         #0ea5e9              Primaer-Akzent (Sky Blue)
--accent-hover:   #38bdf8              Akzent-Hover (heller)
--accent-glow:    rgba(14,165,233,0.35)  Glow-Effekte
--muted:          rgba(255,255,255,0.5)
--text:           #fff
--text-muted:     rgba(255,255,255,0.55)
```

### Light Mode
```
--bg:             #f1f5f9              Slate-100
--bg-elevated:    #ffffff
--surface:        rgba(0,0,0,0.04)
--surface-hover:  rgba(0,0,0,0.08)
--border:         rgba(0,0,0,0.1)
--border-strong:  rgba(0,0,0,0.2)
--accent:         #0ea5e9              Gleicher Akzent
--accent-hover:   #0284c7              Dunkler bei Hover
--accent-glow:    rgba(14,165,233,0.2)  Reduzierter Glow
--muted:          #64748b
--text:           #0f172a              Slate-900
--text-muted:     #475569              Slate-600
```

### Severity-Farben (Rechtskontext)
```
KRITISCH:   text-red-400    bg-red-500/15    border-red-500/30     Icon: XCircle/AlertTriangle
WICHTIG:    text-amber-400  bg-amber-500/15  border-amber-500/30   Icon: Clock/AlertTriangle
HINWEIS:    text-blue-400   bg-blue-500/15   border-blue-500/30    Icon: FileText
ERFOLG:     text-green-400  bg-green-500/15  border-green-500/30   Icon: CheckCircle2
```

### Kontrast-Regeln
- Body-Text auf `--bg`: mindestens 4.5:1 (WCAG AA)
- Grosser Text (>18px bold / >24px): mindestens 3:1
- `--text-muted` nur fuer Sekundaertext >= 14px, nie fuer kleine Labels

---

## 3. Typografie-Skala

### Headlines
```
H1 Hero:       text-5xl md:text-7xl font-black leading-[1.05] tracking-tight
H1 Page:       text-3xl md:text-4xl font-black tracking-tight
H2 Section:    text-3xl md:text-4xl font-black tracking-tight
H3 Card:       text-base font-bold uppercase tracking-wider text-white/90
```

### Body
```
Large:         text-lg md:text-xl leading-relaxed     (Hero-Subtext)
Default:       text-sm leading-relaxed                (Standard-Body)
Small:         text-[13px] leading-relaxed            (Kompakt)
```

### Labels & Caps
```
Section-Label: text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)]
Card-Label:    text-[10px] font-bold uppercase tracking-widest text-white/50
               Hinweis: .label-upper Klasse nutzt text-white/40, inline Labels nutzen text-white/50.
               Neue Komponenten: .label-upper Klasse verwenden (text-white/40).
Button:        text-[12px] font-bold uppercase tracking-[0.2em]
Tiny:          text-[10px] text-white/25               (Disclaimer, Copyright)
```

### Gradient Headlines
```
Dark:   bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent
        Klasse: hero-headline
Light:  Automatisch via [data-theme="light"] .hero-headline Override
        background: linear-gradient(to bottom, #0f172a, #334155)
```

---

## 4. Spacing-System (8px Grid)

### Komponenten-Padding
```
Cards klein:     p-6
Cards standard:  p-8
Cards hero:      p-10
Buttons primary: px-8 py-3
Buttons secondary: px-5 py-3.5
Inputs:          px-4 py-3.5
Nav:             px-6 py-5
```

### Section-Abstaende
```
Zwischen Sections:         mb-32
Heading → Content:         mb-16
Label → Heading:           mb-3
Zwischen Cards:            gap-6
Card-interne Abschnitte:   space-y-6
```

### Max-Widths
```
Volle Breite:    max-w-7xl   (1280px)   Nav, Pricing, Footer
Features:        max-w-6xl   (1152px)   Feature-Grid, Bento-Cards
Content:         max-w-5xl   (1024px)   Hero
Schmal:          max-w-4xl   (896px)    Interior-Seiten
Formulare:       max-w-2xl   (672px)    Wizard, Analyse, Hero-Card
Auth:            max-w-md    (448px)    Login, Register, Modals
```

---

## 5. Komponenten-Klassen

### Aus globals.css (@layer components)
```css
.card         rounded-2xl border bg-white/[0.03] border-white/10 transition-all duration-200
.card-hover   hover: border-white/20 bg-white/[0.05]
.btn-primary  rounded-full bg-accent px-8 py-3 font-bold text-[12px] uppercase tracking-[0.2em] shadow-lg + glow-hover
.btn-ghost    text-[12px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white
.input-field  rounded-xl border-white/10 bg-white/5 px-4 py-3.5 focus:border-accent
.label-upper  text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2
```

### Card-Varianten
```
Standard:    .card .card-hover
Hero:        rounded-2xl sm:rounded-3xl border-white/10 bg-white/[0.04] shadow-[0_0_60px_-15px_var(--accent-glow)]
Pro/Glow:    pro-card-glow border-accent bg-accent/10 scale-[1.02]
Modal:       rounded-2xl border-2 border-blue-600/50 bg-[#05070a] shadow-xl
Status:      rounded-2xl border + severity-farben
```

### Button-Shapes
```
Nav/CTA:      rounded-full       (btn-primary)
Action gross: rounded-2xl        (grosse CTA-Bloecke)
Secondary:    rounded-xl         (Icon-Buttons, sekundaere Aktionen)
Toggle:       rounded-lg         (kleine Toggles)
```

### Border-Radius Hierarchie
```
Containers:   rounded-2xl  (16px)
Inner:        rounded-xl   (12px)
Buttons CTA:  rounded-full (pill)
Kleine UI:    rounded-lg   (8px)
```

---

## 6. Animationssystem

### Keyframes (aus globals.css)
```
hero-glow-pulse   Opacity 0.08→0.15, 4s ease-in-out infinite
                  Klasse: .hero-glow-orb

pro-border-glow   Box-shadow Pulse auf Pricing-Card, 2.5s ease-in-out infinite
                  Klasse: .pro-card-glow
```

### Transitions
```
Farben:          transition-colors               (150ms default)
Standard:        transition-all duration-200      (Cards)
Betont:          transition-all duration-300      (CTA, Forms, Hover)
```

### ScrollReveal (IntersectionObserver)
```
Enter:    opacity-0 translate-y-4 → opacity-100 translate-y-0
Duration: 300ms
Trigger:  threshold 0.1
Wrapper:  <ScrollReveal> Komponente
```

### Hover Micro-Interactions
```
Cards:     hover:-translate-y-1 hover:border-white/20
Buttons:   hover:shadow-[0_0_30px_var(--accent-glow)] active:scale-[0.98]
Links:     hover:text-white (von text-white/40)
```

### Loading States
```
Spinner:   <Loader2 className="h-5 w-5 animate-spin" />
Skeleton:  bg-white/5 rounded-xl animate-pulse
Progress:  width-Transition mit Prozent-Tracking
```

### Animations-Regeln
1. CSS only — kein framer-motion, kein JS-getriebenes
2. `@media (prefers-reduced-motion: reduce)` respektieren
3. Max Glow-Opacity: 0.15 (dark) / 0.08 (light)
4. Gruppen-Entrance: 100ms Stagger per Item (`animation-delay`)
5. Nie Layout animieren (width/height) — nur transform fuer Performance
6. Interaktions-Animationen max 400ms, Ambient darf laenger sein

---

## 7. Nav & Layout

### SiteNavFull (Landingpage)
```
sticky top-0 z-50
bg-[var(--bg)]/80 backdrop-blur-xl
border-b border-white/5
max-w-7xl mx-auto px-6 py-5
Logo: "BESCHEID" font-black text-xl text-white + "RECHT" text-accent
```

### SiteNavSimple (Interior-Seiten)
```
sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg)]/80
border-b border-white/5 max-w-7xl mx-auto px-6 py-5
Zurueck-Link: text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]
Logo: absolute left-1/2 -translate-x-1/2, font-black text-lg
Right-Slot: right?: React.ReactNode (ThemeToggle + optionale Actions)
```

### Seiten-Struktur
```tsx
{/* Interior-Seiten (fristen, analyze, assistant etc.) */}
<main className="min-h-screen bg-mesh text-white flex flex-col">
  <SiteNavSimple backHref="/" backLabel="..." right={<MyActions />} />
  <div className="max-w-{size} mx-auto px-6 py-16 flex-grow w-full">
    {/* Content */}
  </div>
  <SiteFooter />
</main>

{/* Landing Page — KEIN flex flex-col (historisch gewachsen) */}
<main className="min-h-screen bg-mesh text-white" dir={t.dir}>
  <SiteNavFull ... />
  {/* Sections */}
  <SiteFooter />
</main>
```

### Footer
```
border-t border-white/5 py-16
Links:      text-[12px] font-bold tracking-[0.2em] text-white/40 uppercase
Disclaimer: text-[10px] text-white/25
Copyright:  text-[11px] font-bold tracking-[0.2em] text-white/30 uppercase
```

---

## 8. Formular-Muster

### Input
```tsx
<label className="label-upper">{label}</label>
<input className="input-field" placeholder="..." />
```

### Alternative Input-Variante (inline, z.B. Landing-Page)
```
w-full bg-black/40 border border-white/20 rounded-lg text-white text-sm
py-3 px-4 outline-none focus:border-white/20 transition-all duration-300
placeholder:text-white/30
```
Hinweis: Inline-Inputs nutzen `focus:border-white/20`, `.input-field` nutzt `focus:border-[var(--accent)]` und `placeholder:text-white/20`. Neue Komponenten: `.input-field` Klasse bevorzugen.

### Select
Gleiche Styles wie Input, `<select>` mit bg-black/40.

### Textarea
Input-Styles + `resize-none` (Standard, verhindert Layout-Shift). Ausnahme: `resize-y min-h-[100px]` nur auf Landing-Page-Formular.

### Checkbox
```
h-5 w-5 rounded border-white/20 bg-white/5 text-[var(--accent)]
focus:ring-[var(--accent)] cursor-pointer
```

### Fehler-Meldung
```
text-red-400 text-sm mt-2
```

### Form-Layout
```
space-y-6 zwischen Feldern
label-upper fuer jedes Feld
Optional: <span className="font-normal text-white/40">(optional)</span>
```

---

## 9. Status & Severity (Rechtskontext)

### Severity Badges (Analyse-Seite)
```
KRITISCH:  bg-red-500/15 text-red-400 border border-red-500/30 rounded-full px-3 py-1
WICHTIG:   bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full px-3 py-1
HINWEIS:   bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-full px-3 py-1
```

### Frist-Banner (Deadline-Urgency)
```
Dringend (<14d):  bg-amber-500/10 border-amber-500/20, amber Icons
Abgelaufen:       bg-red-500/10 border-red-500/20, red Icons
Sicher (>14d):    bg-green-500/10 border-green-500/20, green Icons
Layout:           flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl border
```

### Status-Config (Fristen-Dashboard)
```typescript
const STATUS_CONFIG = {
  offen:       { icon: Clock,        className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  eingereicht: { icon: FileText,     className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  erledigt:    { icon: CheckCircle2, className: "bg-green-500/15 text-green-400 border-green-500/30" },
  abgelaufen:  { icon: XCircle,      className: "bg-red-500/15 text-red-400 border-red-500/30" },
};
```

### Step-Indicator (Assistent-Wizard)
```
Abgeschlossen:  bg-accent border-accent text-white         (gefuellter Kreis)
Aktiv:          bg-accent/20 border-accent text-accent      (Outline)
Ausstehend:     bg-white/5 border-white/10 text-white/30
Verbinder:      h-[1px] flex-1 mx-2, accent/50 oder white/10
```

### Trust Signals
```
Badges:          flex gap-6 text-white/60 text-[13px] font-medium + Icon-Prefix
Footer-Trust:    text-[11px] font-bold uppercase tracking-[0.2em] text-white/35
RDG-Disclaimer:  IMMER sichtbar bei generiertem Content
                 text-[10px] text-white/25 oder yellow-300 in Warning-Boxen
```

---

## 10. Glow & Atmosphaere-Effekte

### Hero Glow Orbs
```
Pulsierende Radial-Gradients (hero-glow-pulse Keyframe)
Farbe:      rgba(14, 165, 233, 0.4) center → transparent 70%
Groesse:    400-600px, blur-[80px] bis blur-[100px]
Position:   absolute, pointer-events-none
Stagger:    animation-delay um 1s zwischen Orbs
```

### Background Mesh (.bg-mesh)
```
radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14,165,233,0.12), transparent)
radial-gradient(ellipse 60% 40% at 100% 50%, rgba(14,165,233,0.06), transparent)
Light Mode: Opacity auf 0.08 und 0.04 reduziert
```

### Card-Shadows
```
Standard-Cards:  Keine Shadows (flach mit Border)
Hero-Card:       shadow-[0_0_60px_-15px_var(--accent-glow)]
Pro-Card:        pro-card-glow Keyframe (pulsierender Box-Shadow)
Modal:           shadow-xl
```

### Glass Morphism
```
Nav:             bg-[var(--bg)]/80 backdrop-blur-xl
Feature-Cards:   bg-white/[0.03] backdrop-blur-sm (optional)
```

### Print-Styles (globals.css @media print)
```
.no-print     display: none !important — auf allen nicht-druckbaren Elementen verwenden
.letter-content  DIN A4 (210x297mm), Helvetica 11pt, 25/20/20/25mm Padding, schwarz auf weiss
```
Relevant fuer: LetterPDF, DownloadButton, Musterschreiben-Vorschau auf page.tsx

### Regeln
1. Glow-Effekte NUR in Hero und highlighted Pricing
2. Nie Glow auf Body-Text oder Formular-Elemente
3. Light Mode: alle Glow-Opacity um 40% reduzieren
4. Max eine pulsierende Animation pro Viewport gleichzeitig

---

## 11. Responsive Breakpoints

### Mobile-First Strategie
```
Default (375px): Einzelspalte, volle Breite, kompaktes Padding
sm (640px):      Buttons nebeneinander, erhoehtes Padding
md (768px):      Mehrspaltige Grids, groessere Typografie
lg (1024px):     Volle Spaltenanzahl, komplettes Layout
```

### Wichtige Responsive-Transforms
```
Hero-Heading:    text-5xl → md:text-7xl
Section-Heading: text-3xl → md:text-4xl
Grid:            grid-cols-1 → md:grid-cols-3 (Features)
                 grid-cols-1 → md:grid-cols-4 (Pricing)
Card-Padding:    p-4 sm:p-6 md:p-10
Button-Gruppen:  flex-col sm:flex-row
```

### Touch-Targets
```
Minimum: min-h-[44px] fuer mobile Buttons/Links (WCAG)
Checkbox: h-5 w-5 mit cursor-pointer
```

### RTL-Support
```
dir="rtl" fuer Arabisch (AR) — beeinflusst Layout-Flow
dir="ltr" hardcoded fuer Sprach-Selektor
```

---

## 12. Barrierefreiheit (WCAG 2.1 AA)

1. **Kontrast**: 4.5:1 Body-Text, 3:1 grosser Text (>18px bold / >24px)
2. **Focus**: Zwei Varianten existieren: `.input-field` nutzt `focus:border-[var(--accent)]`, inline-Inputs nutzen `focus:border-white/20`. Neue Komponenten: `focus:border-[var(--accent)]` bevorzugen.
3. **aria-label**: Auf Icon-only Buttons (ThemeToggle: `aria-label="Hellmodus einschalten"`)
4. **aria-hidden**: Auf dekorativen Icons (`<Icon aria-hidden />`)
5. **role="dialog" aria-modal="true"**: Auf Modals
6. **aria-labelledby**: Auf Modal-Dialoge, zeigt auf Heading-ID
7. **Keyboard**: Alle interaktiven Elemente per Tab erreichbar
8. **Click-outside**: Modals schliessen via Backdrop-Click + stopPropagation auf Content
9. **Semantisches HTML**: `<main>`, `<nav>`, `<section>`, `<footer>`, `<h1>`-`<h3>` Hierarchie
10. **prefers-reduced-motion**: Alle Animationen, Transitions, Glow-Pulses deaktivieren. **ACHTUNG: Noch nicht implementiert in globals.css — bei neuen Komponenten selbst hinzufuegen, und globals.css ergaenzen wenn moeglich.**

### Patterns
```
Buttons:     immer type="button" ausser in Forms
Links:       immer sichtbarer Text (nie icon-only ohne aria-label)
Forms:       <label> verlinkt via htmlFor/id
Checkboxen:  cursor-pointer auf Input UND Label
```

---

## 13. Performance-Regeln

### Core Web Vitals Targets
```
LCP:  < 2.5s
INP:  < 200ms
CLS:  < 0.1
```

### Strategien
1. Font: `display: "swap"` auf Outfit (layout.tsx)
2. Dynamic Imports: `React.lazy` + `Suspense` fuer schwere Komponenten
3. ScrollReveal: IntersectionObserver-basiert (kein JS beim Laden)
4. Keine Third-Party CSS Frameworks

### Verbote
1. Keine Animations-Libraries (kein framer-motion, kein GSAP, kein Lottie)
2. CSS Transitions statt JS-Animationen
3. Lazy-Load fuer Below-Fold-Komponenten
4. Keine unnuetigen Re-Renders (useCallback/useMemo wo noetig)
5. Gesamt-CSS unter 10KB halten (aktuell ~5KB in globals.css)
6. `tailwind-merge` fuer bedingte Klassen-Komposition

---

## 14. Muster-Bibliothek

### 14.1 Hero Section
```tsx
<section className="relative max-w-5xl mx-auto pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 md:pb-28 px-4 sm:px-6 text-center overflow-hidden">
  {/* Glow Orbs — Position via inline style, KEIN translate-centering */}
  <div className="absolute inset-0 pointer-events-none">
    <div
      className="hero-glow-orb absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full blur-[100px]"
      style={{ background: "radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 70%)" }}
    />
    <div
      className="hero-glow-orb absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[80px]"
      style={{
        background: "radial-gradient(circle, rgba(14, 165, 233, 0.35) 0%, transparent 65%)",
        animationDelay: "1s",
      }}
    />
  </div>
  {/* Headline — hero-headline-sub ist ein <span> INNERHALB der H1 */}
  <h1 className="hero-headline relative text-5xl md:text-7xl font-black leading-[1.05] tracking-tight bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent">
    <span className="block">{headline}</span>
    <span className="hero-headline-sub block mt-4 text-2xl md:text-3xl font-bold tracking-wide opacity-90">
      {subHeadline}
    </span>
  </h1>
  {/* Subtitle — KEINE hero-headline-sub Klasse hier */}
  <p className="relative mt-10 mb-14 text-gray-400 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
    {subtitle}
  </p>
</section>
```

### 14.2 Section Header
```tsx
<p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
  {sectionLabel}
</p>
<h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-16">
  {sectionTitle}
</h2>
```

### 14.3 Feature/Bento Card
```tsx
<div className="p-8 rounded-2xl border border-white/10 backdrop-blur-sm bg-white/[0.03] text-left transition-transform duration-300 hover:-translate-y-1 hover:border-white/20">
  <Icon className="h-6 w-6 text-[var(--accent)] mb-4" aria-hidden />
  <h3 className="font-bold text-base uppercase tracking-wider text-white/90 mb-4">{title}</h3>
  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
</div>
```

### 14.4 Pricing Card (Standard + Highlighted)
```tsx
{/* Standard */}
<div className="card card-hover p-8 text-center">
  <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/50 mb-4">{plan}</h3>
  <p className="text-3xl font-black">{price}</p>
  {/* Features */}
</div>

{/* Highlighted (Pro) */}
<div className="relative pro-card-glow rounded-2xl border border-[var(--accent)] bg-[var(--accent)]/10 p-8 text-center scale-[1.02]">
  <span className="absolute -top-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--accent)] text-[10px] font-bold uppercase tracking-widest">
    Empfohlen
  </span>
  {/* ... */}
</div>
```

### 14.5 Modal
```tsx
{/* Hinweis: PrivacyModal nutzt text-lg mb-6, nicht text-xl mb-4 — beide sind akzeptabel */}
<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
     onClick={onClose}
     role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-blue-600/50 bg-[#05070a] p-6 shadow-xl"
       onClick={e => e.stopPropagation()}>
    <h2 id="modal-title" className="text-lg font-bold text-white mb-6 flex items-center gap-2">
      {title}
    </h2>
    {children}
  </div>
</div>
```

### 14.6 Blog/List Item
```tsx
<li className="block rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-left transition-all hover:border-white/20 hover:bg-white/[0.05]">
  <time className="text-[11px] font-bold text-white/50 uppercase tracking-widest">{date}</time>
  <h2 className="text-2xl font-bold mt-2 mb-3 text-white">{title}</h2>
  <p className="text-white/60 text-sm leading-relaxed">{excerpt}</p>
  <span className="inline-block mt-4 text-[var(--accent)] text-[12px] font-bold uppercase tracking-wider">
    Weiterlesen &rarr;
  </span>
</li>
```

### 14.7 Auth-Seite
```tsx
<main className="min-h-screen bg-mesh text-white flex flex-col">
  <SiteNavSimple backHref="/" backLabel="..." />
  <div className="flex-1 flex items-center justify-center p-6 py-16">
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-10 shadow-xl">
      <h1 className="text-3xl font-black tracking-tight mb-8">{title}</h1>
      {/* Form Fields mit .label-upper + .input-field */}
    </div>
  </div>
  <SiteFooter />
</main>
```

### 14.8 Dashboard-Card (Fristen-Style)
```tsx
<div className={`rounded-2xl border px-5 py-4 ${STATUS_CONFIG[status].className}`}>
  <div className="flex items-center justify-between gap-4">
    <StatusIcon className="h-5 w-5 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="font-bold text-sm truncate">{title}</p>
      <p className="text-xs opacity-70">{subtitle}</p>
    </div>
    <ChevronDown className="h-4 w-4 shrink-0 cursor-pointer" />
  </div>
</div>
```

### 14.9 Error/Empty State
```tsx
<div className="min-h-screen bg-mesh text-white flex flex-col items-center justify-center p-6">
  <AlertTriangle className="h-12 w-12 text-amber-400 mb-6" />
  <h1 className="text-xl font-bold mb-4">{title}</h1>
  <p className="text-white/60 text-sm mb-6 max-w-md text-center">{message}</p>
  <div className="flex gap-4">
    <button className="btn-primary">{primaryAction}</button>
    <Link className="px-6 py-3 border border-white/20 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/5">
      {secondaryAction}
    </Link>
  </div>
</div>
```

### 14.10 Loading State
```tsx
{/* Fullpage */}
<div className="min-h-screen bg-mesh flex items-center justify-center">
  <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
</div>

{/* Inline */}
<Loader2 className="h-5 w-5 animate-spin" />

{/* Skeleton */}
<div className="bg-white/5 rounded-xl h-20 w-full animate-pulse" />
```

---

## 15. Neue Komponente — Checkliste

Vor dem Schreiben JEDER Komponente:

- [ ] CSS-Variablen (--bg, --accent etc.) statt hardcoded Farben
- [ ] Dark Mode UND Light Mode getestet
- [ ] Mobile-First: startet bei 375px, sm:/md:/lg: fuer groessere Screens
- [ ] TypeScript strict: kein `any`, Props-Interface mit JSDoc
- [ ] Alle Strings aus `page-translations.ts`
- [ ] Icons aus lucide-react, `aria-hidden` auf dekorativen Icons
- [ ] Focus-States, aria-Attribute, Keyboard-Navigation
- [ ] CSS Transitions statt JS-Animationen
- [ ] Touch-Targets min 44x44px auf Mobile
- [ ] Bestehende Klassen nutzen (.card, .btn-primary, .input-field etc.)
- [ ] rounded-2xl fuer Container, rounded-xl fuer innere Elemente
- [ ] Loading-State: Loader2 animate-spin
- [ ] Error-State: text-red-400 text-sm

---

## 16. Verbotene Muster

1. Tailwind arbitrary values fuer Farben — CSS-Variablen verwenden
2. Fixed pixel-Breiten auf Containern — `max-w-{size}` nutzen
3. z-index Chaos — Nav ist z-50, Modals z-[100], nichts darueber
4. `!important` in Styles
5. Inline-Styles ausser fuer dynamische Werte (Glow-Orb Positionen)
6. Shadow-Utilities auf Standard-Cards — Border-System verwenden
7. Gradient-Text ohne Fallback-Farbe
8. Interaktions-Animationen laenger als 400ms
9. Weisse Hintergruende in Dark-Mode Komponenten
10. Neue Fonts, Animation-Libraries, CSS Frameworks hinzufuegen
11. Emoji in neuem Code wo lucide-react Icons verfuegbar sind (bestehende Emoji in Tabs/Selects/Trust-Badges sind OK)
12. Generisches Placeholder-Design — jedes Element dient dem Rechtskontext

---

## 17. Design-Entscheidungsbaum

### Neue Seite/Section erstellen:

**Marketing/Public?**
→ bg-mesh, SiteNavFull, Hero-Pattern, ScrollReveal-Sections

**Authentifizierte Interior-Seite?**
→ bg-mesh, SiteNavSimple mit Zurueck-Link, max-w-4xl Container

**Formular/Wizard?**
→ Zentrierte Card (max-w-md oder max-w-2xl), Step-Indicator bei Multi-Step

**Dashboard/Liste?**
→ Card-basierte List-Items mit Severity-Farben, Filter-Tabs oben

**Modal/Overlay?**
→ Fixed Backdrop mit Blur, zentrierte Card, z-[100]

**Error/Empty State?**
→ Zentriertes Layout, Icon + Headline + Beschreibung + Actions

### Komponenten-Emphasis:

**Hoch:**       btn-primary (rounded-full, accent bg, glow hover)
**Mittel:**     rounded-2xl border accent, text accent (Outline)
**Niedrig:**    btn-ghost (text-only, uppercase, tracking-wider)
**Destruktiv:** btn-primary Pattern aber bg-red-500 hover:bg-red-600

### Daten darstellen:

**Status:**     Farbiges Badge mit Icon (STATUS_CONFIG Pattern)
**Urgency:**    FristBanner Pattern mit Countdown
**Severity:**   Ampel-Farben (rot/amber/blau)
**Progress:**   Step-Indicator Dots mit Verbindungslinien
**Legal:**      IMMER RDG-Disclaimer bei generiertem Content

---

## 18. Dark/Light Mode Checkliste

### Dark Mode pruefen:
- [ ] Text lesbar auf #05070a
- [ ] Borders sichtbar aber subtil (white/10)
- [ ] Accent-Farbe (#0ea5e9) ausreichend Kontrast
- [ ] Glow-Effekte sichtbar aber nicht ueberwaeltigend (max 0.15 opacity)
- [ ] Cards unterscheidbar vom Hintergrund (white/[0.03])

### Light Mode pruefen:
- [ ] Text lesbar auf #f1f5f9
- [ ] Borders sichtbar (black/0.1)
- [ ] Accent funktioniert (gleich #0ea5e9, hover dunkler #0284c7)
- [ ] Keine "ausgewaschenen" Elemente
- [ ] globals.css Overrides decken neue Klassen ab
- [ ] Neue white/xx Klassen brauchen [data-theme="light"] Override
- [ ] **Bekannte Luecke:** `text-white/25` hat KEINEN Light-Mode-Override — im Light Mode praktisch unsichtbar. Bei Verwendung eigenen Override in globals.css hinzufuegen.

---

## 19. Qualitaetsstandard — 7-Test-Gate

Jede visuelle Ausgabe muss ALLE Tests bestehen:

| Test | Frage |
|------|-------|
| **STRIPE** | Wuerde das auf stripe.com nicht auffallen? |
| **LINEAR** | Ist das Spacing sauber genug fuer linear.app? |
| **TRUST** | Wuerde ein deutscher Buerger diesem Tool seinen Rechtsfall anvertrauen? |
| **MOBILE** | Funktioniert das auf einem 375px iPhone SE? |
| **A11Y** | Kann ein Screenreader-Nutzer die Aufgabe erledigen? |
| **PERFORMANCE** | Unter 1KB Bundle-Zuwachs, unter 50ms Render-Verzoegerung? |
| **CONSISTENCY** | Passt das nahtlos zu bestehenden Komponenten? |

Wenn EIN Test fehlschlaegt → iterieren bevor geliefert wird.

---

## 20. Stripe/Linear Signature-Techniken

### Staggered Entrance (Linear-Style) — NOCH NICHT IMPLEMENTIERT, bei Bedarf in globals.css ergaenzen
```css
.stagger-group > * {
  opacity: 0;
  transform: translateY(8px);
  animation: stagger-in 300ms ease forwards;
}
.stagger-group > *:nth-child(1) { animation-delay: 0ms; }
.stagger-group > *:nth-child(2) { animation-delay: 100ms; }
.stagger-group > *:nth-child(3) { animation-delay: 200ms; }
.stagger-group > *:nth-child(4) { animation-delay: 300ms; }

@keyframes stagger-in {
  to { opacity: 1; transform: translateY(0); }
}
```

### 8px Grid Precision (Linear-Style)
```
Ziel: 8px-Vielfache: 8, 16, 24, 32, 48, 64, 96, 128
In Tailwind: p-2(8), p-4(16), p-6(24), p-8(32), p-12(48), p-16(64), p-24(96), p-32(128)

Realitaet: Der bestehende Code nutzt auch py-3(12), py-3.5(14), p-5(20).
Diese sind akzeptabel fuer Buttons (py-3) und Inputs (py-3.5).
Fuer neue Sections und Container: 8px-Grid einhalten.
```

### Gradient Mesh Depth (Stripe-Style)
```
Mehrere ueberlagerte radial-gradients mit verschiedenen Positionen
Bereits implementiert als .bg-mesh in globals.css
Fuer neue Sections: zusaetzliche absolute Glow-Orbs mit hero-glow-pulse
```

### Intentionale Typografie-Extreme
```
Display (H1):  font-black (900)  tracking-tight (-0.025em)
Labels:        font-bold (700)   tracking-widest (0.1em) oder tracking-[0.25em]
Body:          font-normal (400) leading-relaxed (1.625)

Nie: font-medium fuer Headlines, font-normal fuer Labels
Die Extreme schaffen Hierarchie — sichere Mittelwerte verwischen sie.
```

### Micro-Detail: Border vs Shadow
```
Standard:  Border-basiert (border-white/10) — sauberer, performanter
Highlight: Shadow-basiert (accent-glow) — nur fuer Hero/Pricing/Focused
Kombination: Nie beides gleichzeitig auf demselben Element
```

### Ambient Glow Constraint
```
Max 1 animierter Glow pro Viewport
Glow nur auf Hero-Section und hervorgehobene Pricing-Card
Alles andere: statische Borders
Grund: Mehrere pulsierende Elemente wirken billig, nicht premium
```
