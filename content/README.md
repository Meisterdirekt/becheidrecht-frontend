# Content: Weisungen & Behördenfehler-Logik

Dieser Ordner enthält strukturierte Daten für die KI-Analyse von Bescheiden.

**Wahrheitsgemäße Nutzung:** Alle Angaben in `weisungen_2025_2026.json` und `behoerdenfehler_logik.json` stammen ausschließlich aus den bereitgestellten offiziellen Dokumenten (Fachliche Weisungen BA, FW zu SGB I). Sie werden bewusst so begrenzt genutzt – nur was sich 1:1 aus den Quellen belegen lässt.

| Datei | Zweck |
|-------|--------|
| **weisungen_2025_2026.json** | Übersicht Fachliche Weisungen (z. B. BA), Gültigkeit, Verweise. Wird für Kontext und Aktualisierungen genutzt. |
| **behoerdenfehler_logik.json** | Fehlertypen mit Prüflogik und Musterschreiben-Hinweisen. Die Engine lädt diese Datei und fügt sie dem KI-Prompt hinzu – die KI kann dann z. B. prüfen, ob der Bescheid von einer Weisung abweicht. |
| **behoerden_checkliste.md** | Manuelle Checkliste: Welche Weisungen/Vorgaben die Behörde befolgen muss. |
| **quellen_uebersicht.md** | Übersicht aller genutzten Quellen (alle erfassten Träger mit Links). |
| **rentenversicherung_quellen.md** | DRV: rvRecht, GRA SGB I/VI. |
| **pflegeversicherung_quellen.md** | Pflegekasse: GKV-Spitzenverband (SGB XI). |
| **sozialhilfe_grundsicherung_quellen.md** | SGB XII: Deutscher Verein, Landesrecht. |
| **krankenversicherung_quellen.md** | Krankenkasse: GKV-Spitzenverband (SGB V). |
| **familienkasse_quellen.md** | Familienkasse: BA, Familienportal (Kindergeld, Kinderzuschlag). |
| **arbeit_sgb3_quellen.md** | Agentur für Arbeit SGB III: ALG I, Insolvenzgeld. |
| **jugendamt_sgb8_quellen.md** | Jugendamt: Deutscher Verein (SGB VIII). |
| **eingliederungshilfe_sgb9_quellen.md** | Eingliederungshilfe: Deutscher Verein (SGB IX). |
| **unfallversicherung_sgb7_quellen.md** | Unfallversicherung: DGUV (SGB VII). |
| **versorgungsaemter_quellen.md** | Versorgungsämter: Schwerbehinderung, VersMedV, Bundes-/Landesportale. |
| **bamf_auslaenderrecht_quellen.md** | BAMF / Ausländerbehörden: Asyl, Aufenthalt (AsylG, AufenthG, VwVfG) – bamf.de, gesetze-im-internet.de. |
| **behoerden_traeger_uebersicht.md** | Übersicht: Alle erfassten Behörden/Träger inkl. BAMF. |
| **stand_quellen.md** | Stand: Was an Weisungen, Gesetzen und Quellen drin ist (strukturiert vs. verlinkt). |

## Erweitern

- **Neue Weisung:** Eintrag in `weisungen_2025_2026.json` ergänzen (Behörde, Nummer, Datum, gültig_ab, Thema).
- **Neuer Fehlertyp:** Objekt in `behoerdenfehler_logik.json` anlegen (id, titel, beschreibung, rechtsbasis, prueflogik, musterschreiben_hinweis).

Die Engine (`src/lib/logic/engine.ts`) lädt `behoerdenfehler_logik.json` automatisch und gibt den Inhalt an die KI weiter.
