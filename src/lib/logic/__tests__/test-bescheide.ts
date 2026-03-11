/**
 * Test-Bescheide mit Ground-Truth für Regressionstests.
 *
 * Jeder Bescheid ist ein realistischer pseudonymisierter Volltext
 * mit erwarteten Fehlerkatalog-Treffern (IDs + Mindest-Severity).
 *
 * Top-5 Rechtsgebiete: BA/ALG (SGB II/III), DRV (SGB VI), KK (SGB V), ALG (SGB III), PK (SGB XI)
 */

export interface TestBescheid {
  /** Eindeutiger Test-Name */
  name: string;
  /** Rechtsgebiet-Kürzel */
  rechtsgebiet: string;
  /** Erwartete Fehlerkatalog-Prefixes für Suche */
  prefixes: string[];
  /** Pseudonymisierter Bescheid-Volltext */
  text: string;
  /** Stichwörter die AG02 extrahieren sollte */
  erwartete_stichworte: string[];
  /** Fehler-IDs die gefunden werden MÜSSEN */
  erwartete_fehler_ids: string[];
  /** Minimale Severity die erkannt werden muss */
  min_severity: "hinweis" | "wichtig" | "kritisch";
}

export const TEST_BESCHEIDE: TestBescheid[] = [
  // ══════════════════════════════════════════════════════════════════════
  // BA / SGB II — Jobcenter (3 Bescheide)
  // ══════════════════════════════════════════════════════════════════════
  {
    name: "BA-01: KdU-Kürzung ohne schlüssiges Konzept",
    rechtsgebiet: "SGB II",
    prefixes: ["BA_", "ALG_"],
    text: `Jobcenter [STADT] — Bescheid
Aktenzeichen: BG-[AZ]-2026
Datum: 15.01.2026

Sehr geehrte/r [NAME],

Ihr Antrag auf Leistungen nach dem SGB II wird wie folgt beschieden:

Die Kosten der Unterkunft werden ab dem 01.03.2026 auf den angemessenen Betrag
von 450,00 € monatlich begrenzt. Ihre tatsächlichen Kosten der Unterkunft in Höhe
von 620,00 € übersteigen die Angemessenheitsgrenze. Es wird eine Differenz von
170,00 € nicht übernommen.

Die Angemessenheitsgrenze wurde auf Basis der Wohngeldtabelle (§ 12 WoGG) + 10%
Sicherheitszuschlag ermittelt.

Heizkosten werden in tatsächlicher Höhe von 85,00 € übernommen.

Regelbedarf: 563,00 €
Kosten der Unterkunft (angemessen): 450,00 €
Heizkosten: 85,00 €
Gesamtleistung: 1.098,00 €

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe
Widerspruch einlegen. Der Widerspruch ist schriftlich oder zur Niederschrift
beim Jobcenter [STADT] einzulegen.`,
    erwartete_stichworte: ["Kosten der Unterkunft", "KdU", "Angemessenheit", "Wohngeldtabelle"],
    erwartete_fehler_ids: ["BA_004"],
    min_severity: "kritisch",
  },
  {
    name: "BA-02: Sanktion 100% ohne Verhältnismäßigkeitsprüfung",
    rechtsgebiet: "SGB II",
    prefixes: ["BA_", "ALG_"],
    text: `Jobcenter [STADT] — Sanktionsbescheid
Aktenzeichen: BG-[AZ]-2026
Datum: 20.02.2026

Sehr geehrte/r [NAME],

wegen wiederholter Pflichtverletzung nach § 31a SGB II wird Ihr Regelbedarf
ab dem 01.04.2026 für die Dauer von drei Monaten um 100 % gemindert.

Sie haben am 10.02.2026 einen zumutbaren Termin zur Eingliederungsvereinbarung
ohne wichtigen Grund nicht wahrgenommen. Dies stellt eine wiederholte
Pflichtverletzung dar. Zuvor wurden bereits Minderungen in Höhe von 10 % und
30 % festgestellt.

Eine Minderung um 100 % ist nach dem Grundsicherungsgeldgesetz vorgesehen.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.`,
    erwartete_stichworte: ["Sanktion", "Kürzung", "Pflichtverletzung", "100%", "Minderung"],
    erwartete_fehler_ids: ["BA_019"],
    min_severity: "kritisch",
  },
  {
    name: "BA-03: Einkommensanrechnung Freibetrag falsch",
    rechtsgebiet: "SGB II",
    prefixes: ["BA_", "ALG_"],
    text: `Jobcenter [STADT] — Änderungsbescheid
Aktenzeichen: BG-[AZ]-2026
Datum: 05.03.2026

Sehr geehrte/r [NAME],

aufgrund der Aufnahme einer Erwerbstätigkeit zum 01.03.2026 wird Ihr
Leistungsanspruch nach dem SGB II wie folgt neu berechnet:

Bruttoeinkommen: 1.200,00 €
Nettoeinkommen: 980,00 €

Abzüge:
- Grundfreibetrag (§ 11b Abs. 2 SGB II): 100,00 €
- Erwerbstätigenfreibetrag (§ 11b Abs. 3 SGB II): 80,00 €
  (20% von 400,00 €)

Anrechenbares Einkommen: 800,00 €

Regelbedarf: 563,00 €
Kosten der Unterkunft: 520,00 €
Bedarf gesamt: 1.083,00 €
Abzüglich Einkommen: 800,00 €
Leistungsanspruch: 283,00 €

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.`,
    erwartete_stichworte: ["Einkommen", "Anrechnung", "Freibetrag", "Erwerbseinkommen"],
    erwartete_fehler_ids: ["BA_007", "BA_008"],
    min_severity: "kritisch",
  },

  // ══════════════════════════════════════════════════════════════════════
  // DRV / SGB VI — Rentenversicherung (3 Bescheide)
  // ══════════════════════════════════════════════════════════════════════
  {
    name: "DRV-01: Erwerbsminderungsrente abgelehnt trotz Gutachten",
    rechtsgebiet: "SGB VI",
    prefixes: ["DRV_"],
    text: `Deutsche Rentenversicherung [REGION] — Bescheid
Versicherungsnummer: [VSNR]
Datum: 10.01.2026

Sehr geehrte/r [NAME],

Ihr Antrag auf Rente wegen voller Erwerbsminderung vom 15.11.2025 wird abgelehnt.

Begründung:
Nach dem Ergebnis der medizinischen Begutachtung sind Sie noch in der Lage,
mindestens sechs Stunden täglich unter den üblichen Bedingungen des allgemeinen
Arbeitsmarktes erwerbstätig zu sein. Die Voraussetzungen des § 43 Abs. 2 SGB VI
liegen daher nicht vor.

Das Gutachten von Dr. [NAME] vom 20.12.2025 stellt fest, dass Sie leichte
Tätigkeiten im Wechsel zwischen Sitzen, Stehen und Gehen vollschichtig ausüben
können. Schwere Tätigkeiten und Arbeiten über Kopf sind ausgeschlossen.

Die versicherungsrechtlichen Voraussetzungen (36 Monate Pflichtbeiträge in den
letzten 5 Jahren) sind erfüllt.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.`,
    erwartete_stichworte: ["Erwerbsminderung", "Erwerbsminderungsrente", "Gutachten", "Zurechnungszeit"],
    erwartete_fehler_ids: ["DRV_007"],
    min_severity: "kritisch",
  },
  {
    name: "DRV-02: Versicherungsverlauf lückenhaft — Zeiten fehlen",
    rechtsgebiet: "SGB VI",
    prefixes: ["DRV_"],
    text: `Deutsche Rentenversicherung Bund — Versicherungsverlauf
Versicherungsnummer: [VSNR]
Datum: 28.02.2026

Sehr geehrte/r [NAME],

im Rahmen der Kontenklärung nach § 149 Abs. 5 SGB VI teilen wir Ihnen
Ihren aktuellen Versicherungsverlauf mit.

Folgende Zeiten sind gespeichert:
- 01.09.1995 – 30.06.1998: Schulausbildung (Anrechnungszeit)
- 01.09.1998 – 31.08.2001: Berufsausbildung bei [FIRMA]
- 01.09.2001 – 30.06.2005: Pflichtbeitragszeit [FIRMA]
- 01.01.2007 – 31.12.2015: Pflichtbeitragszeit [FIRMA]
- 01.07.2016 – laufend: Pflichtbeitragszeit [FIRMA]

Lücke: 01.07.2005 – 31.12.2006 (18 Monate) — keine Zeiten gespeichert.

Bitte teilen Sie uns mit, ob in diesem Zeitraum Versicherungszeiten
vorliegen (z.B. Beschäftigung, Kindererziehung, Arbeitslosigkeit).

Ihre bisher ermittelten Entgeltpunkte: 38,4521`,
    erwartete_stichworte: ["Rente", "Rentenberechnung", "Wartezeit", "Rentenbescheid"],
    erwartete_fehler_ids: ["DRV_005"],
    min_severity: "wichtig",
  },
  {
    name: "DRV-03: Entgeltpunkte falsch berechnet",
    rechtsgebiet: "SGB VI",
    prefixes: ["DRV_"],
    text: `Deutsche Rentenversicherung [REGION] — Rentenbescheid
Versicherungsnummer: [VSNR]
Datum: 01.03.2026

Sehr geehrte/r [NAME],

ab dem 01.04.2026 erhalten Sie eine Altersrente für langjährig Versicherte
nach § 36 SGB VI.

Berechnung:
Persönliche Entgeltpunkte: 42,3150
Zugangsfaktor: 1,0
Rentenartfaktor: 1,0
Aktueller Rentenwert: 39,32 €

Monatliche Bruttorente: 1.663,54 €

KV-Beitrag (7,3% + 0,85% Zusatzbeitrag): 135,58 €
PV-Beitrag (1,7%): 28,28 €

Monatliche Nettorente: 1.499,68 €

In die Berechnung sind 45 Versicherungsjahre eingeflossen.
Für das Jahr 2004 wurde ein Entgelt von 28.000,00 € zugrunde gelegt.
Das tatsächliche Bruttoentgelt laut Meldung betrug 35.420,00 €.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.`,
    erwartete_stichworte: ["Rente", "Rentenbescheid", "Rentenberechnung", "Altersrente"],
    erwartete_fehler_ids: ["DRV_005"],
    min_severity: "kritisch",
  },

  // ══════════════════════════════════════════════════════════════════════
  // KK / SGB V — Krankenkasse (3 Bescheide)
  // ══════════════════════════════════════════════════════════════════════
  {
    name: "KK-01: Krankengeld falsch berechnet",
    rechtsgebiet: "SGB V",
    prefixes: ["KK_"],
    text: `[KRANKENKASSE] — Bescheid über Krankengeld
Versichertennummer: [KVNR]
Datum: 12.01.2026

Sehr geehrte/r [NAME],

ab dem 15.01.2026 erhalten Sie Krankengeld nach § 44 SGB V.

Berechnung des Krankengeldes:
Regelmäßiges Bruttoentgelt: 3.500,00 € monatlich
Kalendertägliches Bruttoentgelt: 116,67 €
70 % des Bruttoentgelts: 81,67 €

Nettoentgelt: 2.450,00 € monatlich
Kalendertägliches Nettoentgelt: 81,67 €
90 % des Nettoentgelts: 73,50 €

Ihr kalendertägliches Krankengeld beträgt: 73,50 € (brutto)

Abzüge:
- Rentenversicherung (9,3%): 6,84 €
- Arbeitslosenversicherung (1,3%): 0,96 €
- Pflegeversicherung (1,7%): 1,25 €

Krankengeld netto: 64,45 € kalendertäglich

Hinweis: Einmalzahlungen (Weihnachtsgeld, Urlaubsgeld) wurden bei der
Berechnung nicht berücksichtigt, da diese nicht regelmäßig gezahlt werden.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.`,
    erwartete_stichworte: ["Krankengeld", "Kostenübernahme", "Leistungsbescheid"],
    erwartete_fehler_ids: ["KK_005"],
    min_severity: "kritisch",
  },
  {
    name: "KK-02: Hilfsmittel abgelehnt ohne Einzelfallprüfung",
    rechtsgebiet: "SGB V",
    prefixes: ["KK_"],
    text: `[KRANKENKASSE] — Ablehnungsbescheid
Versichertennummer: [KVNR]
Datum: 20.02.2026

Sehr geehrte/r [NAME],

Ihr Antrag auf Versorgung mit einem elektrischen Rollstuhl vom 05.02.2026
wird abgelehnt.

Begründung:
Das beantragte Hilfsmittel ist nicht im Hilfsmittelverzeichnis nach § 139
SGB V gelistet. Eine Versorgung nach § 33 SGB V kann daher nicht erfolgen.

Ein manueller Rollstuhl wurde Ihnen bereits am 10.05.2024 bewilligt und
ist weiterhin funktionsfähig.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.`,
    erwartete_stichworte: ["Hilfsmittel", "Kostenübernahme", "Leistungsbescheid"],
    erwartete_fehler_ids: ["KK_005"],
    min_severity: "kritisch",
  },
  {
    name: "KK-03: Genehmigungsfiktion nach § 13 Abs. 3a SGB V",
    rechtsgebiet: "SGB V",
    prefixes: ["KK_"],
    text: `[KRANKENKASSE] — Ablehnungsbescheid
Versichertennummer: [KVNR]
Datum: 10.03.2026

Sehr geehrte/r [NAME],

Ihr Antrag auf eine stationäre Rehabilitationsmaßnahme vom 05.01.2026
wird abgelehnt.

Begründung:
Nach Prüfung durch den Medizinischen Dienst (Gutachten vom 08.03.2026)
sind die Voraussetzungen für eine stationäre Rehabilitation nicht erfüllt.
Eine ambulante Behandlung ist ausreichend.

Hinweis: Ihr Antrag wurde am 05.01.2026 gestellt. Die Bearbeitungsfrist
von 5 Wochen (bei Einschaltung des MD) endete am 09.02.2026. Eine
Mitteilung über die Verzögerung wurde Ihnen nicht zugesandt.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.`,
    erwartete_stichworte: ["Genehmigungsfiktion", "Frist", "5 Wochen", "nicht entschieden"],
    erwartete_fehler_ids: ["KK_011"],
    min_severity: "kritisch",
  },

  // ══════════════════════════════════════════════════════════════════════
  // ALG / SGB III — Arbeitsagentur (3 Bescheide)
  // ══════════════════════════════════════════════════════════════════════
  {
    name: "ALG-01: Sperrzeit ohne Anhörung",
    rechtsgebiet: "SGB III",
    prefixes: ["BA_", "ALG_"],
    text: `Agentur für Arbeit [STADT] — Sperrzeitbescheid
Kundennummer: [KDNR]
Datum: 25.01.2026

Sehr geehrte/r [NAME],

es wird eine Sperrzeit von 12 Wochen nach § 159 Abs. 1 Satz 2 Nr. 1 SGB III
wegen Arbeitsaufgabe festgestellt.

Sie haben Ihr Beschäftigungsverhältnis bei [FIRMA] zum 31.12.2025 selbst
gekündigt, ohne dass ein wichtiger Grund vorlag.

Ihr Anspruch auf Arbeitslosengeld ruht daher in der Zeit vom 01.01.2026
bis zum 25.03.2026. Die Anspruchsdauer mindert sich um 90 Tage (ein Viertel).

Vor Erlass dieses Bescheides wurde keine Anhörung nach § 24 SGB X
durchgeführt.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.`,
    erwartete_stichworte: ["Sperrzeit", "§ 159 SGB III", "Arbeitsaufgabe", "Anhörung", "§ 24 SGB X"],
    erwartete_fehler_ids: ["ALG_007"],
    min_severity: "kritisch",
  },
  {
    name: "ALG-02: Bemessungszeitraum falsch gewählt",
    rechtsgebiet: "SGB III",
    prefixes: ["BA_", "ALG_"],
    text: `Agentur für Arbeit [STADT] — Bewilligungsbescheid Arbeitslosengeld
Kundennummer: [KDNR]
Datum: 15.02.2026

Sehr geehrte/r [NAME],

Ihnen wird ab dem 01.02.2026 Arbeitslosengeld nach dem SGB III bewilligt.

Berechnung:
Bemessungszeitraum: 01.01.2025 – 31.12.2025
Bemessungsentgelt: 2.800,00 € monatlich (auf Basis Teilzeit ab 07/2025)
Leistungsentgelt: 1.960,00 € (Steuerklasse I, kein Kind)

Täglicher Leistungssatz: 39,20 € (60% des Leistungsentgelts)
Monatliches ALG: 1.176,00 €

Anspruchsdauer: 12 Monate (bei 24 Monaten Versicherungspflicht in den
letzten 30 Monaten, Alter unter 50).

Hinweis: Im Zeitraum 01.01.2024 – 30.06.2025 waren Sie in Vollzeit
beschäftigt mit einem Bruttoentgelt von 3.800,00 € monatlich. Die Teilzeit
ab 07/2025 wurde für den gesamten Bemessungszeitraum zugrunde gelegt.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.`,
    erwartete_stichworte: ["Bemessungszeitraum", "Bemessungsentgelt", "Arbeitslosengeld", "Teilzeit"],
    erwartete_fehler_ids: ["ALG_008"],
    min_severity: "kritisch",
  },
  {
    name: "ALG-03: Anspruchsdauer falsch berechnet",
    rechtsgebiet: "SGB III",
    prefixes: ["BA_", "ALG_"],
    text: `Agentur für Arbeit [STADT] — Bewilligungsbescheid Arbeitslosengeld
Kundennummer: [KDNR]
Datum: 01.03.2026

Sehr geehrte/r [NAME],

Ihnen wird ab dem 01.03.2026 Arbeitslosengeld bewilligt.

Täglicher Leistungssatz: 52,80 €

Anspruchsdauer: 12 Monate

Grundlage: 36 Monate Versicherungspflichtverhältnis in den letzten
30 Monaten. Ihr Alter zum Zeitpunkt der Antragstellung: 55 Jahre.

Hinweis: Bei einem Alter von 55 Jahren und mindestens 36 Monaten
Versicherungspflicht beträgt die Anspruchsdauer nach § 147 Abs. 2 SGB III
eigentlich 18 Monate.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.`,
    erwartete_stichworte: ["Anspruchsdauer", "§ 147 SGB III", "Alter", "Versicherungspflicht"],
    erwartete_fehler_ids: ["ALG_009"],
    min_severity: "kritisch",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PK / SGB XI — Pflegekasse (3 Bescheide)
  // ══════════════════════════════════════════════════════════════════════
  {
    name: "PK-01: Pflegegrad-Einstufung zu niedrig",
    rechtsgebiet: "SGB XI",
    prefixes: ["PK_"],
    text: `[PFLEGEKASSE] — Bescheid über Pflegegrad
Versichertennummer: [KVNR]
Datum: 18.01.2026

Sehr geehrte/r [NAME],

aufgrund des Gutachtens des Medizinischen Dienstes vom 10.01.2026
wird Ihnen ab dem 01.02.2026 Pflegegrad 2 zuerkannt.

Gesamtpunktzahl: 32,5 Punkte (Schwellenwert PG 2: 27 – unter 47,5 Punkte)

Modulbewertung:
Modul 1 (Mobilität): 5 Punkte (gewichtet: 5,0)
Modul 2 (Kognitive/kommunikative Fähigkeiten): 3 Punkte (gewichtet: 3,75)
Modul 3 (Verhaltensweisen): 1 Punkt (gewichtet: 1,25)
Modul 4 (Selbstversorgung): 18 Punkte (gewichtet: 7,2)
Modul 5 (Krankheitsbedingte Anforderungen): 8 Punkte (gewichtet: 8,0)
Modul 6 (Gestaltung Alltagsleben): 6 Punkte (gewichtet: 7,3)

Hinweis: Der Gutachter hat die nächtliche Versorgung (2x pro Nacht
Toilettengang mit Hilfe) nicht im Modul 1 berücksichtigt. Ebenso wurde
die Medikamentengabe (5x täglich) in Modul 5 mit nur 1 Punkt bewertet.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.`,
    erwartete_stichworte: ["Pflegegrad", "Begutachtung", "Pflegebedürftigkeit", "Gutachter"],
    erwartete_fehler_ids: ["PK_005"],
    min_severity: "kritisch",
  },
  {
    name: "PK-02: Verhinderungspflege abgelehnt",
    rechtsgebiet: "SGB XI",
    prefixes: ["PK_"],
    text: `[PFLEGEKASSE] — Ablehnungsbescheid
Versichertennummer: [KVNR]
Datum: 05.02.2026

Sehr geehrte/r [NAME],

Ihr Antrag auf Verhinderungspflege nach § 39 SGB XI wird abgelehnt.

Begründung:
Die häusliche Pflege wurde noch nicht mindestens 6 Monate in häuslicher
Umgebung durchgeführt. Die Vorpflegezeit nach § 39 Abs. 1 Satz 1 SGB XI
ist nicht erfüllt.

Hinweis: Pflegegrad 3 besteht seit dem 01.06.2025. Die Pflege wird seit
dem 15.05.2025 durch Ihre Ehefrau [NAME] erbracht. Der Antrag auf
Verhinderungspflege wurde am 20.01.2026 gestellt — 8 Monate nach Beginn
der Pflege.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.`,
    erwartete_stichworte: ["Verhinderungspflege", "Pflegeperson", "Verhinderung", "Pflegegrad 2"],
    erwartete_fehler_ids: ["PK_008"],
    min_severity: "wichtig",
  },
  {
    name: "PK-03: Pflegeleistungen gekürzt ohne Begründung",
    rechtsgebiet: "SGB XI",
    prefixes: ["PK_"],
    text: `[PFLEGEKASSE] — Änderungsbescheid
Versichertennummer: [KVNR]
Datum: 28.02.2026

Sehr geehrte/r [NAME],

ab dem 01.04.2026 werden Ihre Pflegeleistungen wie folgt geändert:

Bisher: Pflegegeld Pflegegrad 3: 573,00 € monatlich
Neu: Pflegegeld Pflegegrad 3: 573,00 € monatlich

Sachleistungen bisher: 1.432,00 € monatlich
Sachleistungen neu: 1.200,00 € monatlich

Die Kürzung der Sachleistungen erfolgt aufgrund einer Neuberechnung.
Nähere Angaben zur Neuberechnung können bei der Pflegekasse erfragt werden.

Kombinationsleistung:
Sie erhalten derzeit 50% Sachleistung und 50% Pflegegeld.
Pflegegeld anteilig: 286,50 €
Sachleistung anteilig: 600,00 €
Gesamt: 886,50 €

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.`,
    erwartete_stichworte: ["Pflegeleistung", "Sachleistung", "Geldleistung", "Leistungsbescheid"],
    erwartete_fehler_ids: ["PK_006"],
    min_severity: "wichtig",
  },
];
