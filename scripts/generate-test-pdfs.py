#!/usr/bin/env python3
"""
Generiert 16 Test-Bescheide als PDF (einen pro Rechtsgebiet).
Jeder Bescheid ist realistisch, pseudonymisiert und enthält absichtliche Fehler,
die die BescheidRecht-Pipeline erkennen sollte.

Ausgabe: ~/Dokumente/Test schreiben/
"""

from fpdf import FPDF
import os
import textwrap

OUTPUT_DIR = os.path.expanduser("~/Dokumente/Test schreiben")
os.makedirs(OUTPUT_DIR, exist_ok=True)


class BescheidPDF(FPDF):
    """PDF im Behörden-Stil: A4, DejaVu (Unicode), sachlicher Ton."""

    def __init__(self):
        super().__init__(format="A4")
        self.set_auto_page_break(auto=True, margin=25)
        self.set_margins(20, 20, 20)
        # DejaVu für vollständige Unicode-Unterstützung (Umlaute etc.)
        self.add_font("DejaVu", "", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", uni=True)
        self.add_font("DejaVu", "B", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", uni=True)

    def add_bescheid(self, header_lines: list[str], body: str):
        self.add_page()
        # Header: Behörde + Aktenzeichen
        self.set_font("DejaVu", "B", 11)
        for line in header_lines:
            self.cell(0, 7, line, new_x="LMARGIN", new_y="NEXT")
        self.ln(8)
        # Body
        self.set_font("DejaVu", "", 10)
        for paragraph in body.split("\n\n"):
            text = paragraph.strip().replace("\n", " ")
            if text:
                self.multi_cell(0, 5, text)
                self.ln(3)


# ══════════════════════════════════════════════════════════════════════════════
# 16 Test-Bescheide — einer pro Rechtsgebiet
# ══════════════════════════════════════════════════════════════════════════════

BESCHEIDE = [
    # ── 01: BA (SGB II) — Jobcenter ──────────────────────────────────────────
    {
        "filename": "01_BA_Jobcenter_KdU_Kuerzung.pdf",
        "header": [
            "Jobcenter Dortmund",
            "Bescheid über Leistungen nach dem SGB II",
            "Aktenzeichen: BG-204871-2026",
            "Datum: 10.01.2026",
        ],
        "body": """Sehr geehrter Herr Mustermann,

Ihr Antrag auf Leistungen zur Sicherung des Lebensunterhalts nach dem Zweiten Buch Sozialgesetzbuch (SGB II) wird wie folgt beschieden:

Die Kosten der Unterkunft (KdU) werden ab dem 01.03.2026 auf den angemessenen Betrag von 420,00 Euro monatlich begrenzt. Ihre tatsächlichen Kosten der Unterkunft in Höhe von 610,00 Euro übersteigen die Angemessenheitsgrenze um 190,00 Euro. Dieser Betrag wird nicht übernommen.

Die Angemessenheitsgrenze wurde auf Basis der Wohngeldtabelle (§ 12 WoGG) zuzüglich eines Sicherheitszuschlags von 10 Prozent ermittelt. Ein schlüssiges Konzept im Sinne der Rechtsprechung des BSG (B 4 AS 18/09 R) liegt für die Stadt Dortmund derzeit nicht vor.

Heizkosten werden in tatsächlicher Höhe von 95,00 Euro übernommen.

Berechnung der monatlichen Leistung:
Regelbedarfsstufe 1: 563,00 Euro
Kosten der Unterkunft (begrenzt): 420,00 Euro
Heizkosten: 95,00 Euro
Gesamtleistung: 1.078,00 Euro

Eine Anhörung nach § 24 SGB X wurde nicht durchgeführt.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen. Der Widerspruch ist schriftlich oder zur Niederschrift beim Jobcenter Dortmund, Steinstraße 39, 44147 Dortmund einzulegen.""",
    },

    # ── 02: ALG (SGB III) — Agentur für Arbeit ──────────────────────────────
    {
        "filename": "02_ALG_Arbeitsagentur_Sperrzeit.pdf",
        "header": [
            "Agentur für Arbeit Köln",
            "Sperrzeitbescheid nach § 159 SGB III",
            "Kundennummer: 287K-049821",
            "Datum: 15.01.2026",
        ],
        "body": """Sehr geehrte Frau Schneider,

es wird eine Sperrzeit von 12 Wochen wegen Arbeitsaufgabe nach § 159 Abs. 1 Satz 2 Nr. 1 SGB III festgestellt.

Sie haben Ihr Beschäftigungsverhältnis bei der Firma Schmidt & Partner GmbH zum 31.12.2025 durch Eigenkündigung beendet, ohne dass ein wichtiger Grund im Sinne des § 159 Abs. 1 Satz 1 SGB III vorlag.

Ihr Anspruch auf Arbeitslosengeld ruht daher in der Zeit vom 01.01.2026 bis zum 25.03.2026. Die Anspruchsdauer mindert sich um 90 Tage, also um ein Viertel der Gesamtanspruchsdauer.

Vor Erlass dieses Bescheides wurde keine Anhörung nach § 24 SGB X durchgeführt. Eine schriftliche Anhörung zu den Gründen Ihrer Kündigung ist unterblieben.

Berechnung Ihres Arbeitslosengeldes nach der Sperrzeit:
Bemessungsentgelt: 3.200,00 Euro monatlich
Leistungsentgelt (Steuerklasse I, keine Kinder): 2.240,00 Euro
Täglicher Leistungssatz: 44,80 Euro (60 Prozent)
Monatliches Arbeitslosengeld: 1.344,00 Euro

Anspruchsdauer nach Minderung: 9 Monate (ursprünglich 12 Monate).

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen. Der Widerspruch ist bei der Agentur für Arbeit Köln einzulegen.""",
    },

    # ── 03: DRV (SGB VI) — Rentenversicherung ───────────────────────────────
    {
        "filename": "03_DRV_Rentenversicherung_EM_Ablehnung.pdf",
        "header": [
            "Deutsche Rentenversicherung Westfalen",
            "Bescheid über den Antrag auf Rente wegen Erwerbsminderung",
            "Versicherungsnummer: 12 150365 M 024",
            "Datum: 20.01.2026",
        ],
        "body": """Sehr geehrter Herr Weber,

Ihr Antrag auf Rente wegen voller Erwerbsminderung gemäß § 43 Abs. 2 SGB VI vom 10.10.2025 wird abgelehnt.

Begründung:
Nach dem Ergebnis der medizinischen Begutachtung durch Dr. med. Fischer vom 15.12.2025 sind Sie noch in der Lage, mindestens sechs Stunden täglich unter den üblichen Bedingungen des allgemeinen Arbeitsmarktes erwerbstätig zu sein. Die Voraussetzungen für eine volle Erwerbsminderung liegen daher nicht vor.

Das Gutachten stellt fest, dass Sie leichte bis mittelschwere Tätigkeiten im Wechsel zwischen Sitzen, Stehen und Gehen vollschichtig ausüben können. Heben und Tragen über 10 kg sowie Überkopfarbeiten sind ausgeschlossen.

Ihr behandelnder Orthopäde Dr. med. Krause hatte in seinem Befundbericht vom 05.11.2025 eine maximale Arbeitsfähigkeit von drei Stunden täglich attestiert. Dieses Attest wurde vom Gutachter nicht berücksichtigt und im Gutachten nicht erwähnt.

Die versicherungsrechtlichen Voraussetzungen (mindestens 36 Monate Pflichtbeiträge in den letzten 5 Jahren vor Eintritt der Erwerbsminderung) sind erfüllt (42 Monate Pflichtbeiträge).

Hinweis: Eine Rente wegen teilweiser Erwerbsminderung nach § 43 Abs. 1 SGB VI wurde nicht geprüft.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen.""",
    },

    # ── 04: KK (SGB V) — Krankenkasse ───────────────────────────────────────
    {
        "filename": "04_KK_Krankenkasse_Krankengeld.pdf",
        "header": [
            "AOK Rheinland/Hamburg",
            "Bescheid über Krankengeld nach § 44 SGB V",
            "Versichertennummer: A 123456789",
            "Datum: 25.01.2026",
        ],
        "body": """Sehr geehrte Frau Müller,

ab dem 28.01.2026 erhalten Sie Krankengeld nach § 44 SGB V.

Berechnung des Krankengeldes:
Regelmäßiges monatliches Bruttoentgelt: 3.800,00 Euro
Kalendertägliches Bruttoentgelt: 126,67 Euro
70 Prozent des Bruttoentgelts: 88,67 Euro

Nettoentgelt monatlich: 2.650,00 Euro
Kalendertägliches Nettoentgelt: 88,33 Euro
90 Prozent des Nettoentgelts: 79,50 Euro

Ihr kalendertägliches Krankengeld beträgt: 79,50 Euro (brutto).

Abzüge (Arbeitnehmeranteile):
Rentenversicherung (9,3 Prozent): 7,39 Euro
Arbeitslosenversicherung (1,3 Prozent): 1,03 Euro
Pflegeversicherung (1,7 Prozent): 1,35 Euro
Krankengeld netto: 69,73 Euro kalendertäglich

Hinweis: Einmalzahlungen (Weihnachtsgeld in Höhe von 3.800,00 Euro und Urlaubsgeld in Höhe von 1.500,00 Euro) wurden bei der Berechnung des Regelentgelts nicht berücksichtigt. Diese Sonderzahlungen sind nach § 47 Abs. 2 SGB V in die Berechnung einzubeziehen, wenn sie im Bemessungszeitraum regelmäßig gezahlt werden.

Ihr Arbeitgeber hat die Entgeltfortzahlung am 27.01.2026 eingestellt.

Die maximale Bezugsdauer beträgt 78 Wochen innerhalb von drei Jahren für dieselbe Krankheit (§ 48 SGB V).

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen. Der Widerspruch ist bei der AOK Rheinland/Hamburg einzulegen.""",
    },

    # ── 05: PK (SGB XI) — Pflegekasse ───────────────────────────────────────
    {
        "filename": "05_PK_Pflegekasse_Pflegegrad.pdf",
        "header": [
            "Pflegekasse bei der DAK-Gesundheit",
            "Bescheid über die Feststellung des Pflegegrades",
            "Versichertennummer: D 987654321",
            "Datum: 05.02.2026",
        ],
        "body": """Sehr geehrte Frau Becker,

aufgrund des Gutachtens des Medizinischen Dienstes vom 28.01.2026 wird Ihnen ab dem 01.03.2026 Pflegegrad 2 zuerkannt.

Ergebnis der Begutachtung:
Gesamtpunktzahl: 34,5 Punkte (Schwellenwert Pflegegrad 2: 27,0 bis unter 47,5 Punkte)

Modulbewertung:
Modul 1 - Mobilität: 7 Punkte (gewichtet: 7,0)
Modul 2 - Kognitive und kommunikative Fähigkeiten: 4 Punkte (gewichtet: 5,0)
Modul 3 - Verhaltensweisen und psychische Problemlagen: 2 Punkte (gewichtet: 2,5)
Modul 4 - Selbstversorgung: 20 Punkte (gewichtet: 8,0)
Modul 5 - Bewältigung von krankheitsbedingten Anforderungen: 6 Punkte (gewichtet: 6,0)
Modul 6 - Gestaltung des Alltagslebens: 8 Punkte (gewichtet: 6,0)

Leistungen bei Pflegegrad 2:
Pflegegeld (§ 37 SGB XI): 332,00 Euro monatlich
oder Pflegesachleistungen (§ 36 SGB XI): bis zu 761,00 Euro monatlich

Hinweis: Im Gutachten wurde dokumentiert, dass Sie nachts zweimal zur Toilette begleitet werden müssen und dabei sturzgefährdet sind. Diese nächtliche Versorgung wurde im Modul 1 (Mobilität) nicht bewertet. Ebenso wurde die dreimal tägliche Insulininjektion in Modul 5 mit nur 1 Punkt bewertet, obwohl die Medikamentengabe fünfmal täglich erfolgt (inklusive zwei weiterer oraler Medikamente).

Bei korrekter Bewertung dieser Punkte würde die Gesamtpunktzahl voraussichtlich 48 bis 50 Punkte betragen, was Pflegegrad 3 entspräche.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen.""",
    },

    # ── 06: UV (SGB VII) — Unfallversicherung ───────────────────────────────
    {
        "filename": "06_UV_Unfallversicherung_Arbeitsunfall.pdf",
        "header": [
            "Berufsgenossenschaft Holz und Metall",
            "Bescheid über die Anerkennung eines Arbeitsunfalls",
            "Aktenzeichen: UV-2026-018734",
            "Datum: 10.02.2026",
        ],
        "body": """Sehr geehrter Herr Klein,

Ihr Unfall vom 15.11.2025 wird nicht als Arbeitsunfall im Sinne des § 8 SGB VII anerkannt.

Sachverhalt:
Am 15.11.2025 um 07:15 Uhr sind Sie auf dem Weg zur Arbeitsstätte bei der Firma Metallbau Braun GmbH auf einer vereisten Treppe vor Ihrem Wohnhaus gestürzt und haben sich eine Fraktur des linken Handgelenks (distale Radiusfraktur) zugezogen.

Begründung:
Der Sturz ereignete sich auf der Treppe unmittelbar vor Ihrer Haustür. Dieser Bereich gehört noch zum häuslichen Bereich und nicht zum versicherten Weg zur Arbeitsstätte. Der Versicherungsschutz auf dem Weg zur Arbeit beginnt nach ständiger Rechtsprechung des BSG erst mit dem Durchschreiten der Außentür des Wohngebäudes.

Die Treppe befindet sich jedoch im Außenbereich des Mehrfamilienhauses und ist über die Haustür zugänglich. Nach neuerer Rechtsprechung des BSG (Urteil vom 18.06.2013, B 2 U 7/12 R) beginnt der Versicherungsschutz bei Mehrfamilienhäusern bereits mit Verlassen der Wohnungstür.

Eine Anhörung nach § 24 SGB X wurde durchgeführt. Ihre Stellungnahme vom 02.01.2026 wurde zur Kenntnis genommen, aber in der Begründung nicht gewürdigt.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch beim Sozialgericht einlegen.""",
    },

    # ── 07: VA — Versorgungsamt / Schwerbehinderung ──────────────────────────
    {
        "filename": "07_VA_Versorgungsamt_GdB.pdf",
        "header": [
            "Landesamt für Soziales, Jugend und Versorgung",
            "Bescheid über die Feststellung der Behinderung",
            "Aktenzeichen: SB-LV-2026-043821",
            "Datum: 18.02.2026",
        ],
        "body": """Sehr geehrter Herr Hoffmann,

auf Ihren Antrag vom 05.12.2025 wird ein Grad der Behinderung (GdB) von 40 festgestellt.

Folgende Funktionsbeeinträchtigungen wurden berücksichtigt:
1. Degenerative Veränderungen der Lendenwirbelsäule mit Bandscheibenvorfall L4/L5
   Einzel-GdB: 30
2. Chronische Depression (mittelgradig, rezidivierend)
   Einzel-GdB: 20
3. Bluthochdruck mit medikamentöser Behandlung
   Einzel-GdB: 10

Gesamt-GdB: 40

Die Bildung des Gesamt-GdB erfolgte nach den Versorgungsmedizinischen Grundsätzen (VMG). Die einzelnen GdB-Werte werden nicht addiert, sondern unter Berücksichtigung der wechselseitigen Beziehungen zueinander bewertet.

Hinweis: Ihr Antrag enthielt auch einen Befundbericht von Dr. med. Richter (Psychiater) vom 20.11.2025, der eine schwere depressive Episode mit Angstzuständen diagnostiziert und einen Einzel-GdB von mindestens 30 empfohlen hat. Dieser Befund wurde im ärztlichen Gutachten des Versorgungsamtes nicht erwähnt und offenbar nicht berücksichtigt.

Bei einem GdB von 50 wäre die Schwerbehinderteneigenschaft gegeben (§ 2 Abs. 2 SGB IX). Sie haben Anspruch auf Gleichstellung nach § 2 Abs. 3 SGB IX bei der Agentur für Arbeit, sofern Sie ohne die Gleichstellung einen geeigneten Arbeitsplatz nicht erlangen oder nicht behalten können.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen. Der Widerspruch ist beim Landesamt für Soziales, Jugend und Versorgung einzulegen.""",
    },

    # ── 08: SH (SGB XII) — Sozialhilfe ──────────────────────────────────────
    {
        "filename": "08_SH_Sozialhilfe_Grundsicherung_Alter.pdf",
        "header": [
            "Stadt Essen — Amt für Soziales und Wohnen",
            "Bescheid über Grundsicherung im Alter nach dem 4. Kapitel SGB XII",
            "Aktenzeichen: SH-51-2026-007823",
            "Datum: 22.02.2026",
        ],
        "body": """Sehr geehrte Frau Krause,

Ihr Antrag auf Grundsicherung im Alter und bei Erwerbsminderung gemäß §§ 41 ff. SGB XII wird wie folgt beschieden:

Ihnen werden ab dem 01.03.2026 folgende Leistungen bewilligt:

Regelsatz (Regelbedarfsstufe 1): 563,00 Euro
Kosten der Unterkunft: 380,00 Euro
Heizkosten: 75,00 Euro
Mehrbedarf Gehbehinderung (§ 30 Abs. 1 SGB XII, Merkzeichen G): 95,71 Euro
Gesamtbedarf: 1.113,71 Euro

Anzurechnendes Einkommen:
Altersrente (DRV): 620,00 Euro
Abzüglich Versicherungspauschale (§ 82 Abs. 2 SGB XII): -30,00 Euro
Anrechenbares Einkommen: 590,00 Euro

Monatlicher Leistungsanspruch: 523,71 Euro

Hinweis: Die tatsächlichen Kosten der Unterkunft betragen 480,00 Euro (Kaltmiete). Es wurde ein Betrag von 380,00 Euro als angemessen angesetzt. Ein Kostensenkungsverfahren nach § 35 Abs. 2 SGB XII wurde nicht eingeleitet und eine Frist zur Senkung der Unterkunftskosten wurde Ihnen nicht gesetzt. Nach der Rechtsprechung des BSG sind die tatsächlichen Kosten der Unterkunft für eine Übergangszeit von in der Regel sechs Monaten zu übernehmen.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen. Der Widerspruch ist beim Amt für Soziales und Wohnen der Stadt Essen einzulegen.""",
    },

    # ── 09: EH (SGB IX) — Eingliederungshilfe ───────────────────────────────
    {
        "filename": "09_EH_Eingliederungshilfe_Ablehnung.pdf",
        "header": [
            "Landschaftsverband Rheinland",
            "Bescheid über Leistungen der Eingliederungshilfe nach SGB IX",
            "Aktenzeichen: EH-53-2026-012456",
            "Datum: 28.02.2026",
        ],
        "body": """Sehr geehrter Herr Schmidt,

Ihr Antrag auf Leistungen zur Teilhabe am Arbeitsleben in Form einer Unterstützten Beschäftigung nach § 55 SGB IX vom 10.01.2026 wird abgelehnt.

Begründung:
Nach Prüfung der vorliegenden Unterlagen sind die Voraussetzungen für eine Unterstützte Beschäftigung nicht erfüllt. Sie verfügen über einen Berufsabschluss als Bürokaufmann (IHK, 2015) und waren zuletzt bis zum 30.06.2025 sozialversicherungspflichtig beschäftigt. Eine besondere Unterstützung am Arbeitsplatz erscheint daher nicht erforderlich.

Hinweis: In Ihrem Antrag haben Sie dargelegt, dass Sie seit 2023 unter einer progredienten neurologischen Erkrankung (Multiple Sklerose) leiden, die Ihre beruflichen Fähigkeiten erheblich einschränkt. Ein Gutachten von Prof. Dr. med. Lange (Neurologie) vom 05.01.2026 bescheinigt eine wesentliche Behinderung im Sinne des § 99 SGB IX und empfiehlt Unterstützte Beschäftigung. Dieses Gutachten wurde in der Entscheidung nicht berücksichtigt.

Eine Bedarfsermittlung gemäß § 118 SGB IX (Gesamtplanverfahren) wurde nicht durchgeführt. Nach § 117 SGB IX ist der Träger der Eingliederungshilfe verpflichtet, den individuellen Bedarf in einem Gesamtplanverfahren zu ermitteln.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen.""",
    },

    # ── 10: JA (SGB VIII) — Jugendamt ───────────────────────────────────────
    {
        "filename": "10_JA_Jugendamt_Kita_Ablehnung.pdf",
        "header": [
            "Stadt Düsseldorf — Jugendamt",
            "Bescheid über Leistungen der Kinder- und Jugendhilfe",
            "Aktenzeichen: JA-51-2026-034567",
            "Datum: 05.03.2026",
        ],
        "body": """Sehr geehrte Frau Yilmaz,

Ihr Antrag auf Übernahme der Kosten für einen Integrationshelfer für Ihren Sohn Emre (geb. 12.05.2019) in der Kindertagesstätte Sonnenschein ab dem 01.04.2026 wird abgelehnt.

Begründung:
Die Voraussetzungen für eine Eingliederungshilfe nach § 35a SGB VIII liegen nicht vor. Nach Einschätzung des Gesundheitsamtes vom 20.02.2026 liegt bei Ihrem Sohn keine seelische Behinderung oder drohende seelische Behinderung vor, die eine Teilhabe am gesellschaftlichen Leben beeinträchtigt.

Hinweis: Der Antrag stützt sich auf eine Diagnose von Autismus-Spektrum-Störung (F84.0 ICD-10) durch das Sozialpädiatrische Zentrum (SPZ) vom 15.12.2025. Das SPZ empfiehlt ausdrücklich einen Integrationshelfer. Die Kita-Leitung bestätigt in ihrer Stellungnahme vom 10.01.2026, dass Emre ohne individuelle Unterstützung nicht am Gruppengeschehen teilnehmen kann.

Das Gesundheitsamt hat keine eigene Untersuchung durchgeführt, sondern lediglich die Aktenlage geprüft. Eine persönliche Begutachtung des Kindes hat nicht stattgefunden.

Eine Beratung nach § 14 SGB I über alternative Leistungen oder zuständige Träger wurde nicht angeboten.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen. Der Widerspruch ist beim Jugendamt der Stadt Düsseldorf einzulegen.""",
    },

    # ── 11: BAMF (AsylbLG) — Asyl ───────────────────────────────────────────
    {
        "filename": "11_BAMF_Asylbewerberleistungen.pdf",
        "header": [
            "Sozialamt der Stadt Frankfurt am Main",
            "Bescheid nach dem Asylbewerberleistungsgesetz (AsylbLG)",
            "Aktenzeichen: AsylbLG-65-2026-008912",
            "Datum: 01.03.2026",
        ],
        "body": """Sehr geehrter Herr Ahmad,

Ihr Antrag auf Leistungen nach dem Asylbewerberleistungsgesetz wird wie folgt beschieden:

Ihnen werden ab dem 01.03.2026 Grundleistungen nach § 3 AsylbLG bewilligt.

Monatliche Leistungen:
Notwendiger Bedarf (Ernährung, Unterkunft, Heizung, Kleidung, Gesundheitspflege): 204,00 Euro
Notwendiger persönlicher Bedarf (Barbetrag): 156,00 Euro
Unterkunft: Gemeinschaftsunterkunft (wird in Sachleistung erbracht)
Gesamtleistung (bar): 360,00 Euro

Hinweis: Sie halten sich seit dem 01.02.2024 in Deutschland auf. Ihre Aufenthaltsgestattung wurde am 15.01.2024 erteilt. Seit dem 01.02.2026 halten Sie sich somit länger als 18 Monate im Bundesgebiet auf.

Nach § 2 Abs. 1 AsylbLG erhalten Leistungsberechtigte, die sich seit 18 Monaten ohne wesentliche Unterbrechung im Bundesgebiet aufhalten, Leistungen entsprechend dem SGB XII (sogenannte Analogleistungen). Diese Analogleistungen wurden bei Ihnen nicht geprüft.

Die Analogleistungen nach § 2 AsylbLG würden einen Regelsatz nach Regelbedarfsstufe 1 in Höhe von 563,00 Euro monatlich vorsehen, also erheblich mehr als die bewilligten 360,00 Euro.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen. Der Widerspruch ist beim Sozialamt der Stadt Frankfurt am Main einzulegen.""",
    },

    # ── 12: BAF (BAföG) — Ausbildungsförderung ──────────────────────────────
    {
        "filename": "12_BAF_BAfoeg_Ablehnung.pdf",
        "header": [
            "Studierendenwerk Münster — BAföG-Amt",
            "Bescheid über Ausbildungsförderung nach dem BAföG",
            "Förderungsnummer: BAF-2026-MS-054321",
            "Datum: 10.03.2026",
        ],
        "body": """Sehr geehrte Frau Petersen,

Ihr Antrag auf Ausbildungsförderung nach dem Bundesausbildungsförderungsgesetz (BAföG) für das Sommersemester 2026 wird abgelehnt.

Begründung:
Das anrechenbare Einkommen Ihrer Eltern übersteigt den Freibetrag. Die Förderungsvoraussetzungen nach § 11 BAföG sind daher nicht erfüllt.

Einkommensberechnung (Einkommen der Eltern im vorletzten Kalenderjahr 2024):
Einkommen des Vaters (brutto): 48.000,00 Euro
Einkommen der Mutter (brutto): 32.000,00 Euro
Gesamteinkommen: 80.000,00 Euro

Abzüge nach § 21 BAföG:
Einkommensteuer: -12.400,00 Euro
Sozialpauschale (21,6 Prozent): -14.470,00 Euro
Bereinigtes Einkommen: 53.130,00 Euro

Freibeträge nach § 25 BAföG:
Freibetrag Eltern (verheiratet): 2.415,00 Euro
Freibetrag je Elternteil: 1.605,00 Euro
Gesamt: 4.020,00 Euro

Anrechenbares Einkommen: 49.110,00 Euro

Hinweis: In Ihrem Antrag haben Sie angegeben, dass Ihre Eltern seit März 2025 getrennt leben und Ihr Vater seit Oktober 2025 arbeitslos ist. Das aktuelle Einkommen Ihres Vaters beträgt laut beigefügtem ALG-I-Bescheid 1.800,00 Euro monatlich. Ein Aktualisierungsantrag nach § 24 Abs. 3 BAföG auf Berücksichtigung des aktuellen Einkommens wurde von Ihnen gestellt, aber in diesem Bescheid nicht berücksichtigt.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen. Der Widerspruch ist beim Studierendenwerk Münster einzulegen.""",
    },

    # ── 13: EG (BEEG) — Elterngeld ──────────────────────────────────────────
    {
        "filename": "13_EG_Elterngeld_Berechnung.pdf",
        "header": [
            "Kreis Mettmann — Elterngeldstelle",
            "Bescheid über Elterngeld nach dem BEEG",
            "Aktenzeichen: EG-ME-2026-002345",
            "Datum: 08.03.2026",
        ],
        "body": """Sehr geehrte Frau Lehmann,

für die Geburt Ihres Kindes Mia am 05.02.2026 wird Ihnen Elterngeld bewilligt.

Elterngeld Basiselterngeld für die Lebensmonate 1 bis 12:

Bemessungszeitraum: Januar 2025 bis Dezember 2025

Durchschnittliches monatliches Nettoeinkommen im Bemessungszeitraum: 2.100,00 Euro

Berechnung:
Durchschnittliches Nettoeinkommen: 2.100,00 Euro
Ersatzrate: 65 Prozent (bei Einkommen über 1.240 Euro)
Monatliches Elterngeld: 1.365,00 Euro

Bewilligungszeitraum: 05.02.2026 bis 04.02.2027

Hinweis: Im Bemessungszeitraum (Januar bis Dezember 2025) waren Sie von März bis Juni 2025 wegen einer schwangerschaftsbedingten Erkrankung krankgeschrieben und haben Krankengeld bezogen. Diese Monate mit Krankengeldbezug aufgrund schwangerschaftsbedingter Erkrankung hätten nach § 2b Abs. 1 Satz 2 Nr. 3 BEEG aus dem Bemessungszeitraum ausgeklammert und durch weiter zurückliegende Monate ersetzt werden müssen.

In den Monaten Oktober bis Dezember 2024 betrug Ihr Nettoeinkommen 2.800,00 Euro monatlich. Bei korrekter Berechnung unter Ausklammerung der Krankheitsmonate würde das durchschnittliche Nettoeinkommen voraussichtlich höher ausfallen.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen.""",
    },

    # ── 14: FK (Kindergeld) — Familienkasse ──────────────────────────────────
    {
        "filename": "14_FK_Familienkasse_Kindergeld.pdf",
        "header": [
            "Familienkasse Nordrhein-Westfalen West",
            "Aufhebungs- und Rückforderungsbescheid Kindergeld",
            "Kindergeld-Nr.: FK-204-871-293",
            "Datum: 12.03.2026",
        ],
        "body": """Sehr geehrter Herr Richter,

die Festsetzung von Kindergeld für Ihren Sohn Lukas (geb. 15.03.2000) wird ab dem 01.10.2025 aufgehoben. Das überzahlte Kindergeld in Höhe von 1.554,00 Euro (6 Monate x 259,00 Euro) wird zurückgefordert.

Begründung:
Ihr Sohn Lukas hat am 30.09.2025 sein Bachelorstudium (Betriebswirtschaftslehre) an der Universität Bielefeld abgeschlossen. Da er sich seitdem nicht mehr in einer Berufsausbildung im Sinne des § 32 Abs. 4 Satz 1 Nr. 2 Buchst. a EStG befindet, entfällt der Kindergeldanspruch ab Oktober 2025.

Rückforderung gemäß § 37 Abs. 2 AO in Verbindung mit § 31 Satz 3 EStG: 1.554,00 Euro.

Der Betrag ist innerhalb eines Monats nach Bekanntgabe dieses Bescheides zu erstatten.

Hinweis: Lukas hat sich laut Ihrer Mitteilung am 15.10.2025 für ein Masterstudium (Wirtschaftsinformatik) an der Universität Bielefeld eingeschrieben. Die Einschreibungsbescheinigung lag dem Schreiben bei. Das Masterstudium ist als Teil einer mehraktigen Berufsausbildung kindergeldrechtlich nach § 32 Abs. 4 Satz 1 Nr. 2 Buchst. a EStG zu berücksichtigen, sofern es in einem engen zeitlichen und sachlichen Zusammenhang mit dem Bachelorstudium steht.

Eine Anhörung nach § 91 AO vor Erlass des Aufhebungs- und Rückforderungsbescheides wurde nicht durchgeführt.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Einspruch einlegen. Der Einspruch ist bei der Familienkasse Nordrhein-Westfalen West einzulegen.""",
    },

    # ── 15: WG (WoGG) — Wohngeld ────────────────────────────────────────────
    {
        "filename": "15_WG_Wohngeld_Ablehnung.pdf",
        "header": [
            "Stadt Bochum — Wohngeldstelle",
            "Bescheid über den Wohngeldantrag",
            "Aktenzeichen: WG-32-2026-015678",
            "Datum: 06.03.2026",
        ],
        "body": """Sehr geehrte Frau Nowak,

Ihr Antrag auf Wohngeld (Mietzuschuss) vom 10.02.2026 wird abgelehnt.

Begründung:
Ihr anrechenbares Gesamteinkommen übersteigt die Einkommensgrenze nach dem Wohngeldgesetz (WoGG). Ein Wohngeldanspruch besteht daher nicht.

Haushaltsmitglieder: 1 Person (nur Antragstellerin)

Monatliche Bruttomiete: 520,00 Euro (Höchstbetrag Mietstufe III: 534,00 Euro)
Heizkosten: 80,00 Euro (bei Wohngeldberechnung nicht berücksichtigt)

Einkommensberechnung:
Monatliches Bruttoeinkommen (Teilzeitbeschäftigung): 1.600,00 Euro
Werbungskosten-Pauschale: -83,33 Euro
Anrechenbares Einkommen: 1.516,67 Euro

Bei einem Haushalt mit 1 Person und einem anrechenbaren Einkommen von 1.516,67 Euro besteht kein Wohngeldanspruch.

Hinweis: In Ihrem Antrag haben Sie angegeben, dass auch Ihre Tochter Lisa (geb. 08.07.2018) und Ihr Sohn Ben (geb. 12.11.2020) in Ihrem Haushalt leben. Die Geburtsurkunden und Meldebescheinigungen waren dem Antrag beigefügt. In der Berechnung wurde nur 1 Haushaltsmitglied berücksichtigt statt 3.

Bei einem 3-Personen-Haushalt gelten deutlich höhere Einkommensgrenzen und ein höherer Mietrichtwert. Ihr Wohngeldanspruch wäre in diesem Fall voraussichtlich gegeben.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen. Der Widerspruch ist bei der Wohngeldstelle der Stadt Bochum einzulegen.""",
    },

    # ── 16: UVS (UVG) — Unterhaltsvorschuss ─────────────────────────────────
    {
        "filename": "16_UVS_Unterhaltsvorschuss_Ablehnung.pdf",
        "header": [
            "Stadt Duisburg — Unterhaltsvorschuss-Stelle",
            "Bescheid nach dem Unterhaltsvorschussgesetz (UVG)",
            "Aktenzeichen: UVS-51-2026-009345",
            "Datum: 11.03.2026",
        ],
        "body": """Sehr geehrte Frau Kuhn,

Ihr Antrag auf Unterhaltsvorschuss nach dem Unterhaltsvorschussgesetz (UVG) für Ihren Sohn Tim (geb. 22.08.2018) vom 15.02.2026 wird abgelehnt.

Begründung:
Die Voraussetzungen nach § 1 UVG liegen nicht vor. Unterhaltsvorschuss wird nur gewährt, wenn der alleinerziehende Elternteil ledig, verwitwet, geschieden oder vom Ehegatten dauernd getrennt lebt und das Kind bei ihm wohnt.

Nach den vorliegenden Unterlagen leben Sie seit dem 01.01.2026 von Ihrem Ehemann Herrn Kuhn getrennt. Es liegen keine Nachweise über den Trennungszeitpunkt vor.

Hinweis: In Ihrem Antrag haben Sie die Trennungsvereinbarung vom 20.12.2025 sowie eine Bestätigung des Einwohnermeldeamtes über den Umzug Ihres Ehemannes zum 01.01.2026 beigefügt. Diese Dokumente belegen das dauerhafte Getrenntleben.

Ihr Sohn Tim ist 7 Jahre alt. Bei einem Kind im Alter von 6 bis 11 Jahren beträgt der Unterhaltsvorschuss nach § 2 UVG monatlich 502,00 Euro abzüglich des für ein erstes Kind zu zahlenden Kindergeldes (259,00 Euro), somit 243,00 Euro monatlich.

Herr Kuhn zahlt laut Ihrer Angabe keinen Unterhalt. Vollstreckungsversuche durch das Jugendamt als Beistand (§ 1712 BGB) wurden von Ihnen beantragt. Die Unterhaltsvorschuss-Stelle hat nicht geprüft, ob der barunterhaltspflichtige Elternteil Unterhalt leistet.

Eine Beratung über alternative Leistungen nach § 14 SGB I wurde nicht angeboten.

Rechtsbehelfsbelehrung:
Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen. Der Widerspruch ist bei der Unterhaltsvorschuss-Stelle der Stadt Duisburg einzulegen.""",
    },
]


def main():
    for bescheid in BESCHEIDE:
        pdf = BescheidPDF()
        pdf.add_bescheid(bescheid["header"], bescheid["body"])
        filepath = os.path.join(OUTPUT_DIR, bescheid["filename"])
        pdf.output(filepath)
        print(f"  {bescheid['filename']}")

    print(f"\n{len(BESCHEIDE)} PDFs erstellt in: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
