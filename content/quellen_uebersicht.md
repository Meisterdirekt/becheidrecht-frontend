# Quellen-Übersicht – Behörden & Träger

Welche offiziellen Quellen für BescheidRecht genutzt werden (wahrheitsgemäß, nur belegbar).

---

## Jobcenter / Bundesagentur für Arbeit (BA)

| Was | Wo |
|-----|-----|
| **Fachliche Weisungen** | PDFs aus Quellordner → `weisungen_2025_2026.json` |
| **Fehlertypen / Prüflogik** | Aus PDFs + FW → `behoerdenfehler_logik.json` (BA_001–BA_003) |
| **Detail** | Siehe `jobcenter_quellen.md` |

---

## Deutsche Rentenversicherung (DRV) – „Rentenkasse“

| Was | Wo |
|-----|-----|
| **Offizielles Rechtsportal** | **rvRecht** – [rvrecht.deutsche-rentenversicherung.de](https://rvrecht.deutsche-rentenversicherung.de/) |
| **Gängige Inhalte** | GRA SGB I (Verfahren), GRA SGB VI (Rente, Reha), Normen SGB I/IV/VI/IX/X, Urteile, Aktuelle Werte |
| **Im Projekt** | `rentenversicherung_quellen.md` (Links + Rente, Reha, Erwerbsminderung, Verfahren). Fehlertypen **DRV_002–DRV_008** (§ 14/16/60 SGB I, Rente, Reha, Erwerbsminderung, § 24/25 SGB X). |

**Hinweis:** Es werden keine kompletten rvRecht-Inhalte gespiegelt. Genutzt werden verlinkte offizielle Seiten und die gleichen verfahrensrechtlichen Maßstäbe (SGB I), die für die DRV in rvRecht dokumentiert sind.

---

## Pflegeversicherung (Pflegekasse / GKV)

| Was | Wo |
|-----|-----|
| **Richtlinien / Vereinbarungen / Formulare** | **GKV-Spitzenverband** – [Pflegeversicherung: Richtlinien, Vereinbarungen, Formulare](https://www.gkv-spitzenverband.de/pflegeversicherung/richtlinien_vereinbarungen_formulare/richtlinien_vereinbarungen_formulare.jsp) |
| **Gängige Inhalte** | Pflegeberatung (§ 7a, § 37 SGB XI), Pflegebedürftigkeit/Begutachtung (§ 18, § 18b SGB XI), Leistungsrecht (Rundschreiben), Qualitätsprüfungen (§§ 114 ff.), Rahmenverträge (§ 75 SGB XI) |
| **Im Projekt** | `pflegeversicherung_quellen.md` (Links + Übersicht). Fehlertypen **PK_002–PK_007** (§ 14/16/60 SGB I, Pflegegrad/Begutachtung, Pflegeleistungen, § 24/25 SGB X). |

**Hinweis:** Referenz ist die offizielle Seite des GKV-Spitzenverbandes; keine Vervielfältigung der dortigen Dokumente.

---

## SGB XII – Sozialhilfe & Grundsicherung im Alter und bei Erwerbsminderung

| Was | Wo |
|-----|-----|
| **Themen & Fachliteratur** | **Deutscher Verein für öffentliche und private Fürsorge** – [Themen A–Z](https://www.deutscher-verein.de/themen/) (u. a. **SGB XII**, **Sozialhilfe**, **Grundsicherung im Alter und bei Erwerbsminderung**); Positionen, Buchshop (Kommentare, Textausgaben), Veranstaltungen. |
| **Träger** | Örtliche/überörtliche Träger nach Landesrecht (Sozialämter, Landkreise, kreisfreie Städte); keine zentrale Bundes-Richtlinienstelle. |
| **Im Projekt** | `sozialhilfe_grundsicherung_quellen.md` (Deutscher Verein, SGB XII, Landesrecht). Fehlertypen **SH_002–SH_006** (§ 14/16/60 SGB I, Leistungsbescheid SGB XII, § 24/25 SGB X). |

**Hinweis:** Weitere relevante Seiten beim Deutschen Verein: Positionen, Buchshop (Sozialrecht), Deutscher Fürsorgetag. Einzelne Themen-URLs können sich ändern; Einstieg über [deutscher-verein.de/themen](https://www.deutscher-verein.de/themen/).

---

## Krankenversicherung (GKV) – SGB V

| Was | Wo |
|-----|-----|
| **Richtlinien / Vereinbarungen** | **GKV-Spitzenverband** – [Krankenversicherung](https://www.gkv-spitzenverband.de/krankenversicherung/krankenversicherung_node.jsp), [Richtlinien und Verträge](https://www.gkv-spitzenverband.de/krankenversicherung/aerztliche_versorgung/richtlinien_und_vertraege/richtlinien_und_vetraege.jsp), Heilmittel, Wirtschaftlichkeitsprüfung |
| **Im Projekt** | `krankenversicherung_quellen.md`. Fehlertypen **KK_002–KK_006** (§ 14/16/60 SGB I, Leistung SGB V, § 24/25 SGB X). |

---

## Familienkasse (Kindergeld, Kinderzuschlag)

| Was | Wo |
|-----|-----|
| **Portale** | [Bundesagentur für Arbeit – Familie und Kinder](https://www.arbeitsagentur.de/familie-und-kinder), [Formulare Kindergeld](https://www.arbeitsagentur.de/familie-und-kinder/downloads-familie-und-kinder/formulare-kindergeld), [Familienportal](https://familienportal.de). Lokal: **Familienkasse.pdf** im Quellordner. |
| **Im Projekt** | `familienkasse_quellen.md`. Fehlertypen **FK_002–FK_006**. |

---

## Agentur für Arbeit – SGB III (ALG I, Insolvenzgeld)

| Was | Wo |
|-----|-----|
| **Portal** | [Bundesagentur für Arbeit](https://www.arbeitsagentur.de). Gleiche Behörde wie Jobcenter, anderes Gesetz (SGB III). |
| **Im Projekt** | `arbeit_sgb3_quellen.md`. Fehlertypen **ALG_002–ALG_006**. |

---

## Jugendamt / Kinder- und Jugendhilfe (SGB VIII)

| Was | Wo |
|-----|-----|
| **Portale** | [Deutscher Verein – SGB VIII](https://www.deutscher-verein.de/themen-des-deutschen-vereins/themenunterseite/sgb-viii/), [Themen A–Z](https://www.deutscher-verein.de/themen/). Träger: Jugendämter (kommunal). |
| **Im Projekt** | `jugendamt_sgb8_quellen.md`. Fehlertypen **JA_002–JA_006**. |

---

## Eingliederungshilfe / Teilhabe (SGB IX)

| Was | Wo |
|-----|-----|
| **Portale** | Deutscher Verein (Themen SGB IX, Bundesteilhabegesetz), BMAS, Landesrecht. Träger: nach Landesrecht. |
| **Im Projekt** | `eingliederungshilfe_sgb9_quellen.md`. Fehlertypen **EH_002–EH_006**. |

---

## Unfallversicherung (SGB VII)

| Was | Wo |
|-----|-----|
| **Portal** | [DGUV – Reha und Leistungen](https://www.dguv.de/de/reha_leistung/index.jsp), [Richtlinien der UV-Träger](https://www.dguv.de/de/reha_leistung/richtlinien-uvt/index.jsp), [Geldleistungen](https://www.dguv.de/de/reha_leistung/geldleistungen/index.jsp). Träger: Berufsgenossenschaften, Unfallkassen. |
| **Im Projekt** | `unfallversicherung_sgb7_quellen.md`. Fehlertypen **UV_002–UV_006**. |

---

## Versorgungsämter / Schwerbehinderung

| Was | Wo |
|-----|-----|
| **Portale** | [Bundesportal – Schwerbehinderung](https://verwaltung.bund.de/leistungsverzeichnis/DE/leistung/99015004037000/herausgeber/BE-L100108_326173/region/11), Landesportale (Versorgungsämter). Rechtsgrundlage: SGB IX, SchwbAwV, VersMedV. |
| **Im Projekt** | `versorgungsaemter_quellen.md`. Fehlertypen **VA_002–VA_006**. |

---

## BAMF / Ausländerbehörden (Asyl & Aufenthalt)

| Was | Wo |
|-----|-----|
| **Portale** | [BAMF](https://www.bamf.de) (Asyl, Flüchtlingsschutz, Aufenthaltserlaubnis), [AufenthG](https://www.gesetze-im-internet.de/aufenthg_2004/), [AsylG](https://www.gesetze-im-internet.de/asylvfg_1992/) (gesetze-im-internet.de). Träger: BAMF (Asyl), Ausländerbehörden (Aufenthalt). |
| **Rechtsgrundlage** | AsylG, AufenthG, VwVfG, VwGO |
| **Im Projekt** | `bamf_auslaenderrecht_quellen.md`. Fehlertypen **BAMF_002–BAMF_006** (Auskunft/Beratung, Antrag, Mitwirkung, Asyl-/Aufenthaltsbescheid, Begründung/Rechtsbehelfsbelehrung). |

---

**Vollständige Liste aller Träger:** **`behoerden_traeger_uebersicht.md`**.
