# Stand: Was wir an Weisungen, Gesetzen und Quellen drin haben

Kurzer Überblick, was im Projekt **strukturiert vorhanden** ist und was **verlinkt** wird.

---

## ✅ Strukturiert im Projekt (von der KI/Engine genutzt)

| Inhalt | Datei | Verwendung |
|--------|--------|------------|
| **Fachliche Weisungen BA** (7 Weisungen, Nummer, Datum, gültig ab/bis, Thema, Rechtsgrundlage) | `weisungen_2025_2026.json` | Wird von der Engine geladen und der KI als Kontext gegeben (BA/Jobcenter, SGB III). |
| **Behördenfehler-Logik** (61 Fehlertypen mit Prüflogik, Rechtsbasis, Musterschreiben-Hinweis) | `behoerdenfehler_logik.json` | Wird von der Engine geladen und der KI als Kontext gegeben. Enthält für jeden Träger die **Rechtsgrundlagen** (Gesetze, Weisungen, Richtlinien) als Referenz. |

---

## ✅ Gesetze & Recht

- **Nicht als Volltext** im Projekt – aber **überall referenziert**:
  - In jedem Fehlertyp: Feld **rechtsbasis** (z. B. „§ 14 SGB I“, „SGB VI“, „AsylG“, „AufenthG“, „VwVfG“).
  - In allen `*_quellen.md`: Tabellen mit Rechtsgrundlage (SGB I–XII, AufenthG, AsylG, EStG, BKGG, VwVfG, VwGO, SchwbAwV, VersMedV, etc.).
- **Links zu Gesetzen:** In den Quell-Dateien verlinkt (gesetze-im-internet.de, rvRecht, bamf.de, etc.), sodass die genauen Normen nachgeschlagen werden können.

---

## ✅ Weisungen / Richtlinien / GRA

| Träger | Weisungen/Richtlinien | Wo im Projekt |
|--------|------------------------|----------------|
| **BA / Jobcenter** | 7 Fachliche Weisungen (u. a. BBiE, Kurzarbeitergeld, FbW, eAU, § 52a SGB II, § 45 SGB III, Aufhebung FbW SGB 2) | `weisungen_2025_2026.json` (strukturiert, wird geladen) |
| **DRV** | GRA SGB I, SGB VI (Rente, Reha, Erwerbsminderung) | `rentenversicherung_quellen.md` + Verweis rvRecht (Link); Fehlertypen DRV_* mit rechtsbasis |
| **Pflegekasse** | Richtlinien GKV-Spitzenverband (Die-RiLi, UGu-RiLi, Pflegeberatung, Leistungsrecht) | `pflegeversicherung_quellen.md` + Link GKV-Spitzenverband; PK_* |
| **Krankenkasse** | Richtlinien/Vereinbarungen GKV-Spitzenverband (SGB V) | `krankenversicherung_quellen.md` + Link; KK_* |
| **Sozialhilfe/Grundsicherung** | SGB XII, Landeserlässe | `sozialhilfe_grundsicherung_quellen.md`; SH_* |
| **Familienkasse** | EStG, BKGG, BA-Infos | `familienkasse_quellen.md`; FK_* |
| **BA SGB III** | SGB III, Fachliche Weisungen BA (soweit SGB III) | `arbeit_sgb3_quellen.md`; ALG_* |
| **Jugendamt** | SGB VIII | `jugendamt_sgb8_quellen.md`; JA_* |
| **Eingliederungshilfe** | SGB IX | `eingliederungshilfe_sgb9_quellen.md`; EH_* |
| **Unfallversicherung** | SGB VII, DGUV-Richtlinien (§ 31 Abs. 2 SGB VII) | `unfallversicherung_sgb7_quellen.md` + Link DGUV; UV_* |
| **Versorgungsämter** | SGB IX, SchwbAwV, VersMedV | `versorgungsaemter_quellen.md`; VA_* |
| **BAMF/Ausländerbehörden** | AsylG, AufenthG, VwVfG, VwGO | `bamf_auslaenderrecht_quellen.md`; BAMF_* |

---

## ✅ Sonstiges

- **Checkliste** (manuell): `behoerden_checkliste.md` – Prüfpunkte zu Weisungen/Verfahren.
- **Übersichten:** `quellen_uebersicht.md`, `behoerden_traeger_uebersicht.md` – alle Träger und offiziellen Quellen-Links.

---

## Kurzantwort

**Ja:** Wir haben **Weisungen** (BA strukturiert in JSON + bei allen anderen Trägern verlinkt/ referenziert), **Gesetze** (überall als Rechtsgrundlage in Fehlertypen und Quell-Dateien genannt und teils verlinkt) und **Richtlinien/GRA** (GKV, DGUV, rvRecht, BAMF, etc.) in den Quell-Dateien mit Links und in der Fehlerlogik als Kontext für die KI. Die Engine lädt `behoerdenfehler_logik.json` und `weisungen_2025_2026.json` und gibt beides an die KI weiter – damit sind Weisungen und die maßgeblichen Gesetze/Richtlinien im Kontext „drin“.
