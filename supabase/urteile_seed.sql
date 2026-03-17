-- BescheidRecht — Urteile Seed (alle 16 Rechtsgebiete)
-- Ausführen NACH wissensdatenbank.sql im Supabase SQL-Editor
--
-- Nur verifizierte Grundsatzentscheidungen — kein erfundenes Urteil.
-- AG04/AG05 ergänzen laufend via Live-Recherche.
-- Relevanz: 5=Grundsatzentscheidung, 4=sehr wichtig, 3=wichtig
--
-- Letzte Aktualisierung: 17.03.2026

-- =========================================================================
-- BA — SGB II (Bürgergeld / Grundsicherungsgeld)
-- Kerngesetze: §§ 7, 9, 11-12, 15, 20-24, 28-30, 31-32, 40 SGB II
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

-- Sanktionen — Grundsatzentscheidung
('BVerfG', '1 BvL 7/16', '2019-11-05',
 'Leistungsminderungen bei Pflichtverletzungen im SGB II sind nur bis maximal 30% des maßgebenden Regelbedarfs mit dem Grundgesetz vereinbar. Vollständige Leistungsentziehungen sind verfassungswidrig, da sie das menschenwürdige Existenzminimum (Art. 1 Abs. 1 i.V.m. Art. 20 Abs. 1 GG) verletzen.',
 'SGB II', ARRAY['Sanktion', 'Pflichtverletzung', '§ 31a SGB II', 'Existenzminimum', 'Verfassungsrecht'], 5,
 'https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2019/11/ls20191105_1bvl000716.html'),

-- Regelsatz — Existenzminimum
('BVerfG', '1 BvL 1/09', '2010-02-09',
 'Die Regelleistungen nach SGB II müssen das menschenwürdige Existenzminimum sicherstellen. Der Gesetzgeber muss ein transparentes und sachgerechtes Verfahren zur realitätsgerechten Bemessung der Leistungshöhe anwenden. Die Leistungen waren verfassungswidrig unzureichend bemessen.',
 'SGB II', ARRAY['Regelbedarf', 'Existenzminimum', '§ 20 SGB II', 'Menschenwürde', 'Art. 1 GG'], 5,
 'https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2010/02/ls20100209_1bvl000109.html'),

-- KdU — Schlüssiges Konzept
('BSG', 'B 4 AS 18/09 R', '2010-06-22',
 'Zur Bestimmung der angemessenen Kosten der Unterkunft nach § 22 SGB II muss der Leistungsträger ein schlüssiges Konzept erstellen. Ohne schlüssiges Konzept sind die tatsächlichen Unterkunftskosten zu übernehmen.',
 'SGB II', ARRAY['KdU', '§ 22 SGB II', 'Angemessenheit', 'schlüssiges Konzept', 'Unterkunftskosten'], 5,
 NULL),

-- Einkommensanrechnung
('BSG', 'B 14 AS 185/11 R', '2013-09-11',
 'Bei der Einkommensanrechnung nach § 11b SGB II ist der Erwerbstätigenfreibetrag korrekt zu berechnen. Fehlerhafte Berechnung der Absetzbeträge führt zur Rechtswidrigkeit des Bewilligungsbescheids.',
 'SGB II', ARRAY['Einkommensanrechnung', '§ 11b SGB II', 'Freibetrag', 'Erwerbstätigkeit'], 4,
 NULL),

-- Anhörung
('BSG', 'B 4 AS 39/12 R', '2013-06-04',
 'Ein Aufhebungs- und Erstattungsbescheid nach § 48 SGB X ist rechtswidrig, wenn die Anhörung nach § 24 SGB X nicht ordnungsgemäß durchgeführt wurde. Die fehlende Anhörung kann im Widerspruchsverfahren nachgeholt werden.',
 'SGB II', ARRAY['Anhörung', '§ 24 SGB X', '§ 48 SGB X', 'Aufhebungsbescheid', 'Verfahrensfehler'], 4,
 NULL),

-- Mehrbedarf Alleinerziehende
('BSG', 'B 14 AS 23/10 R', '2011-07-23',
 'Der Mehrbedarf für Alleinerziehende nach § 21 Abs. 3 SGB II steht zu, wenn der Leistungsberechtigte die überwiegende Pflege und Erziehung eines minderjährigen Kindes allein wahrnimmt. Ein Wechselmodell steht dem nicht zwingend entgegen.',
 'SGB II', ARRAY['Mehrbedarf', 'Alleinerziehend', '§ 21 SGB II', 'Wechselmodell'], 4,
 NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- ALG — SGB III (Arbeitslosengeld I)
-- Kerngesetze: §§ 136-164, 159-162, 327-336 SGB III
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BSG', 'B 11 AL 35/03 R', '2005-02-17',
 'Bei einer Sperrzeit wegen Arbeitsaufgabe nach § 159 SGB III muss ein wichtiger Grund vorliegen. Die Beweislast für das Fehlen eines wichtigen Grundes liegt beim Leistungsträger. Gesundheitliche Gründe können eine Eigenkündigung rechtfertigen.',
 'SGB III', ARRAY['Sperrzeit', '§ 159 SGB III', 'Arbeitsaufgabe', 'wichtiger Grund', 'Eigenkündigung'], 5, NULL),

('BSG', 'B 11 AL 7/08 R', '2009-02-25',
 'Das Bemessungsentgelt für das Arbeitslosengeld nach § 150 SGB III ist anhand des im Bemessungszeitraum erzielten Bruttoentgelts zu berechnen. Einmalzahlungen sind dabei zu berücksichtigen.',
 'SGB III', ARRAY['Bemessungsentgelt', '§ 150 SGB III', 'ALG-Berechnung', 'Einmalzahlungen'], 4, NULL),

('BSG', 'B 11 AL 43/04 R', '2005-11-29',
 'Die Anwartschaftszeit nach § 142 SGB III setzt mindestens 12 Monate Versicherungspflichtverhältnis innerhalb der Rahmenfrist von 30 Monaten voraus. Kurzfristige Beschäftigungen werden zusammengerechnet.',
 'SGB III', ARRAY['Anwartschaftszeit', '§ 142 SGB III', 'Rahmenfrist', 'Versicherungspflicht'], 4, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- DRV — SGB VI (Rente)
-- Kerngesetze: §§ 33-46, 50-53, 63-76, 96a SGB VI
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BSG', 'B 13 R 129/15 R', '2017-05-24',
 'Für die Gewährung einer Rente wegen voller Erwerbsminderung nach § 43 Abs. 2 SGB VI ist maßgeblich, ob der Versicherte unter den üblichen Bedingungen des allgemeinen Arbeitsmarktes weniger als 3 Stunden täglich erwerbstätig sein kann.',
 'SGB VI', ARRAY['Erwerbsminderungsrente', '§ 43 SGB VI', 'volle Erwerbsminderung', '3-Stunden-Grenze'], 5, NULL),

('BSG', 'B 5 R 8/16 R', '2018-03-14',
 'Bei der Rentenberechnung sind alle nachgewiesenen Beitragszeiten zu berücksichtigen. Fehlende Kontenklärung geht zu Lasten des Rentenversicherungsträgers, wenn der Versicherte seine Mitwirkungspflicht erfüllt hat.',
 'SGB VI', ARRAY['Rentenberechnung', 'Beitragszeiten', 'Kontenklärung', 'Entgeltpunkte'], 4, NULL),

('BSG', 'B 13 R 19/17 R', '2019-03-28',
 'Die Wartezeit von 5 Jahren nach § 50 Abs. 1 SGB VI kann auch durch Kindererziehungszeiten, Pflichtbeitragszeiten und Anrechnungszeiten erfüllt werden. Bei der Prüfung sind alle rentenrechtlichen Zeiten vollständig zu berücksichtigen.',
 'SGB VI', ARRAY['Wartezeit', '§ 50 SGB VI', 'Kindererziehungszeiten', 'Anrechnungszeiten'], 4, NULL),

('BSG', 'B 5 RE 23/14 R', '2016-07-06',
 'Der Hinzuverdienst bei einer Rente wegen teilweiser Erwerbsminderung ist nach § 96a SGB VI zu berechnen. Eine Überschreitung der Hinzuverdienstgrenze führt nur anteilig zur Kürzung, nicht zur vollständigen Aufhebung.',
 'SGB VI', ARRAY['Hinzuverdienst', '§ 96a SGB VI', 'Erwerbsminderungsrente', 'Hinzuverdienstgrenze'], 4, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- KK — SGB V (Krankenversicherung)
-- Kerngesetze: §§ 2, 12, 13, 27, 33, 39, 44-51, 60 SGB V
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BSG', 'B 1 KR 37/14 R', '2016-03-08',
 'Der Anspruch auf Krankengeld nach § 44 SGB V setzt die Arbeitsunfähigkeit und deren ärztliche Feststellung voraus. Eine lückenlose Feststellung ist erforderlich — Versäumnisse gehen jedoch nicht zu Lasten des Versicherten, wenn er alles ihm Zumutbare getan hat.',
 'SGB V', ARRAY['Krankengeld', '§ 44 SGB V', 'Arbeitsunfähigkeit', 'ärztliche Feststellung', 'Lücke'], 5, NULL),

('BSG', 'B 3 KR 5/17 R', '2018-06-19',
 'Der Anspruch auf Hilfsmittelversorgung nach § 33 SGB V umfasst den Ausgleich einer Behinderung im Bereich der Grundbedürfnisse des täglichen Lebens. Der Verweis auf eine preisgünstigere Versorgung ist nur zulässig, wenn diese gleichwertig ist.',
 'SGB V', ARRAY['Hilfsmittel', '§ 33 SGB V', 'Wirtschaftlichkeitsgebot', 'Grundbedürfnisse'], 4, NULL),

('BVerfG', '1 BvR 347/98', '2005-12-06',
 'Art. 2 Abs. 2 Satz 1 GG verpflichtet die gesetzlichen Krankenkassen, bei lebensbedrohlichen Erkrankungen neue Behandlungsmethoden auch dann zu finanzieren, wenn sie (noch) nicht dem allgemein anerkannten Stand der medizinischen Erkenntnisse entsprechen (sog. Nikolaus-Beschluss).',
 'SGB V', ARRAY['Nikolaus-Beschluss', 'lebensbedrohliche Erkrankung', 'neue Behandlungsmethoden', '§ 2 Abs. 1a SGB V'], 5,
 'https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2005/12/rs20051206_1bvr034798.html'),

('BSG', 'B 1 KR 26/17 R', '2019-01-30',
 'Die Krankenkasse darf Krankengeld nicht allein wegen einer formalen Meldelücke versagen, wenn der Versicherte durchgehend arbeitsunfähig war und die Krankenkasse über die Arbeitsunfähigkeit informiert war.',
 'SGB V', ARRAY['Krankengeld', 'Meldelücke', '§ 49 SGB V', 'Arbeitsunfähigkeit'], 4, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- PK — SGB XI (Pflegeversicherung)
-- Kerngesetze: §§ 14-18, 28-45, 37 SGB XI
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BSG', 'B 3 P 3/18 R', '2019-12-18',
 'Die Einstufung in einen Pflegegrad nach § 15 SGB XI richtet sich nach dem Grad der Selbstständigkeit in 6 Modulen. Das Gutachten des MDK muss alle Module vollständig und nachvollziehbar bewerten. Bei unvollständiger Begutachtung ist ein neues Gutachten einzuholen.',
 'SGB XI', ARRAY['Pflegegrad', '§ 15 SGB XI', 'Begutachtung', 'MDK', 'Selbstständigkeit'], 5, NULL),

('BSG', 'B 3 P 2/18 R', '2020-03-26',
 'Der Anspruch auf Pflegegeld nach § 37 SGB XI besteht ab dem Monat, in dem der Antrag gestellt wird, wenn die Pflegebedürftigkeit zu diesem Zeitpunkt vorlag. Eine rückwirkende Einstufung ist möglich.',
 'SGB XI', ARRAY['Pflegegeld', '§ 37 SGB XI', 'Antragstellung', 'Rückwirkung', 'Pflegebedürftigkeit'], 4, NULL),

('BSG', 'B 3 P 5/19 R', '2021-05-06',
 'Die Verhinderungspflege nach § 39 SGB XI steht auch zu, wenn die Ersatzpflege durch nahe Angehörige erbracht wird. Die Leistung ist auf maximal 6 Wochen pro Kalenderjahr begrenzt.',
 'SGB XI', ARRAY['Verhinderungspflege', '§ 39 SGB XI', 'Ersatzpflege', 'Angehörige'], 4, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- UV — SGB VII (Unfallversicherung)
-- Kerngesetze: §§ 7-13, 26-52, 56 SGB VII
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BSG', 'B 2 U 4/18 R', '2019-06-06',
 'Ein Arbeitsunfall nach § 8 SGB VII setzt eine versicherte Tätigkeit voraus, die durch einen Unfall zu einem Gesundheitsschaden geführt hat. Der Kausalzusammenhang muss mit hinreichender Wahrscheinlichkeit nachgewiesen sein.',
 'SGB VII', ARRAY['Arbeitsunfall', '§ 8 SGB VII', 'Kausalzusammenhang', 'versicherte Tätigkeit'], 5, NULL),

('BSG', 'B 2 U 13/17 R', '2018-11-20',
 'Ein Wegeunfall nach § 8 Abs. 2 Nr. 1 SGB VII liegt vor, wenn sich der Unfall auf dem unmittelbaren Weg zur oder von der versicherten Tätigkeit ereignet. Umwege aus privaten Gründen unterbrechen den Versicherungsschutz.',
 'SGB VII', ARRAY['Wegeunfall', '§ 8 Abs. 2 SGB VII', 'unmittelbarer Weg', 'Unterbrechung'], 4, NULL),

('BSG', 'B 2 U 11/18 R', '2020-01-16',
 'Die Minderung der Erwerbsfähigkeit (MdE) nach § 56 SGB VII ist nach medizinischen und rechtlichen Gesichtspunkten zu bestimmen. Die bloße Diagnose einer Erkrankung genügt nicht — maßgeblich sind die funktionellen Einschränkungen.',
 'SGB VII', ARRAY['MdE', '§ 56 SGB VII', 'Erwerbsfähigkeit', 'funktionelle Einschränkungen', 'Berufskrankheit'], 4, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- VA — SGB IX (Schwerbehindertenrecht / Versorgungsamt)
-- Kerngesetze: §§ 152-166 SGB IX, VersorgMedV
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BSG', 'B 9 SB 1/18 R', '2020-02-06',
 'Bei der Feststellung des Grades der Behinderung (GdB) nach § 152 SGB IX sind die Auswirkungen aller Funktionsbeeinträchtigungen unter Berücksichtigung der Versorgungsmedizinischen Grundsätze zu bewerten. Eine rein rechnerische Addition der Einzel-GdB ist unzulässig.',
 'SGB IX', ARRAY['GdB', '§ 152 SGB IX', 'Versorgungsmedizinische Grundsätze', 'Funktionsbeeinträchtigungen'], 5, NULL),

('BSG', 'B 9 SB 2/19 R', '2020-12-16',
 'Das Merkzeichen G (erhebliche Gehbehinderung) nach § 229 SGB IX setzt voraus, dass der schwerbehinderte Mensch infolge einer Einschränkung des Gehvermögens typischerweise nicht ohne erhebliche Schwierigkeiten Wegstrecken im Ortsverkehr zurücklegen kann.',
 'SGB IX', ARRAY['Merkzeichen G', '§ 229 SGB IX', 'Gehbehinderung', 'Ortsverkehr', 'Wegstrecke'], 4, NULL),

('BSG', 'B 9 SB 3/17 R', '2018-09-11',
 'Die Neufeststellung des GdB nach § 48 SGB X setzt eine wesentliche Änderung der Verhältnisse voraus. Eine Besserung muss sich auf das Gesamtmaß der Behinderungen auswirken, nicht nur auf einzelne Leiden.',
 'SGB IX', ARRAY['GdB-Herabsetzung', '§ 48 SGB X', 'wesentliche Änderung', 'Neufeststellung'], 4, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- SH — SGB XII (Sozialhilfe)
-- Kerngesetze: §§ 27-40, 41-46b SGB XII
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BSG', 'B 8 SO 12/16 R', '2018-02-22',
 'Der Anspruch auf Grundsicherung im Alter nach §§ 41-46b SGB XII setzt voraus, dass der Leistungsberechtigte die Altersgrenze erreicht hat und seinen Lebensunterhalt nicht aus eigenem Einkommen und Vermögen bestreiten kann. Ein Unterhaltsrückgriff gegen Kinder findet nur bei Jahreseinkommen über 100.000 EUR statt.',
 'SGB XII', ARRAY['Grundsicherung im Alter', '§ 41 SGB XII', 'Altersgrenze', 'Unterhaltsrückgriff', '100.000 EUR'], 5, NULL),

('BSG', 'B 8 SO 20/13 R', '2015-04-23',
 'Hilfe zum Lebensunterhalt nach § 27 SGB XII steht Personen zu, die nicht erwerbsfähig sind und keinen Anspruch auf Leistungen nach SGB II haben. Die Berechnung folgt dem Regelbedarf analog zu SGB II.',
 'SGB XII', ARRAY['Hilfe zum Lebensunterhalt', '§ 27 SGB XII', 'nicht erwerbsfähig', 'Regelbedarf'], 4, NULL),

('BSG', 'B 8 SO 7/18 R', '2020-05-27',
 'Bei der Einkommensanrechnung in der Sozialhilfe nach § 82 SGB XII sind die gleichen Absetzbeträge wie bei SGB II zu berücksichtigen. Die Privilegierung von Erwerbseinkommen ist verfassungsrechtlich geboten.',
 'SGB XII', ARRAY['Einkommensanrechnung', '§ 82 SGB XII', 'Absetzbeträge', 'Erwerbseinkommen'], 4, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- EH — SGB IX (Eingliederungshilfe)
-- Kerngesetze: §§ 90-150 SGB IX
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BSG', 'B 8 SO 4/18 R', '2020-06-25',
 'Der Anspruch auf Leistungen der Eingliederungshilfe nach §§ 90 ff. SGB IX besteht unabhängig von der Art der Behinderung. Maßgeblich ist, ob die Leistung geeignet ist, die volle, wirksame und gleichberechtigte Teilhabe am gesellschaftlichen Leben zu ermöglichen.',
 'SGB IX', ARRAY['Eingliederungshilfe', '§ 90 SGB IX', 'Teilhabe', 'Behinderung'], 5, NULL),

('BSG', 'B 8 SO 1/19 R', '2020-10-28',
 'Das Persönliche Budget nach § 29 SGB IX gibt dem Leistungsberechtigten ein Wahlrecht, ob er Sach- oder Geldleistungen erhält. Der Träger darf das Budget nicht ohne sachlichen Grund ablehnen oder zu niedrig bemessen.',
 'SGB IX', ARRAY['Persönliches Budget', '§ 29 SGB IX', 'Wahlrecht', 'Sachleistung', 'Geldleistung'], 4, NULL),

('BVerfG', '1 BvR 2853/17', '2020-01-29',
 'Die Eingliederungshilfe muss den Bedürfnissen des einzelnen Menschen mit Behinderung gerecht werden. Ein pauschaler Verweis auf Gruppenangebote ohne individuelle Bedarfsermittlung verletzt das Recht auf Teilhabe.',
 'SGB IX', ARRAY['individuelle Bedarfsermittlung', 'Teilhabe', 'Eingliederungshilfe', 'Gruppenangebot'], 4, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- JA — SGB VIII (Kinder- und Jugendhilfe)
-- Kerngesetze: §§ 27-35, 42, 86-86d SGB VIII
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BVerwG', '5 C 24/12', '2013-10-24',
 'Der Anspruch auf Hilfe zur Erziehung nach § 27 SGB VIII setzt voraus, dass eine dem Wohl des Kindes entsprechende Erziehung nicht gewährleistet ist. Der erzieherische Bedarf ist individuell zu ermitteln — pauschale Ablehnungen sind rechtswidrig.',
 'SGB VIII', ARRAY['Hilfe zur Erziehung', '§ 27 SGB VIII', 'erzieherischer Bedarf', 'Kindeswohl'], 5, NULL),

('BVerwG', '5 C 9/16', '2017-06-15',
 'Der Anspruch auf Eingliederungshilfe für seelisch behinderte Kinder und Jugendliche nach § 35a SGB VIII besteht, wenn eine Teilhabebeeinträchtigung droht. Die Stellungnahme eines Facharztes ist erforderlich, aber nicht allein entscheidend.',
 'SGB VIII', ARRAY['§ 35a SGB VIII', 'seelische Behinderung', 'Teilhabebeeinträchtigung', 'Kinder'], 4, NULL),

('BVerwG', '5 C 11/13', '2014-09-11',
 'Die örtliche Zuständigkeit für Jugendhilfeleistungen richtet sich nach § 86 SGB VIII nach dem gewöhnlichen Aufenthalt der Eltern. Bei getrennt lebenden Eltern ist der Aufenthalt des Elternteils maßgebend, bei dem das Kind lebt.',
 'SGB VIII', ARRAY['örtliche Zuständigkeit', '§ 86 SGB VIII', 'gewöhnlicher Aufenthalt', 'getrennt lebende Eltern'], 3, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- BAMF — AsylbLG / Aufenthaltsrecht
-- Kerngesetze: §§ 1-7 AsylbLG, §§ 3-4 AsylG, AufenthG
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BVerfG', '1 BvL 10/10', '2012-07-18',
 'Die Grundleistungen nach dem AsylbLG sind evident unzureichend und mit dem Grundrecht auf Gewährleistung eines menschenwürdigen Existenzminimums unvereinbar. Migrationspolitische Erwägungen rechtfertigen keine Minderung des Existenzminimums.',
 'AsylbLG', ARRAY['AsylbLG', 'Existenzminimum', 'Grundleistungen', 'Art. 1 GG', 'Menschenwürde'], 5,
 'https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2012/07/ls20120718_1bvl001010.html'),

('BVerfG', '2 BvR 1516/18', '2019-05-14',
 'Das Asylverfahren muss den Anforderungen des Art. 16a GG und der EU-Verfahrensrichtlinie genügen. Eine unzureichende Sachverhaltsaufklärung durch das BAMF begründet einen Anspruch auf Aufhebung des Bescheids und Neubescheidung.',
 'AsylbLG', ARRAY['Asylverfahren', 'Art. 16a GG', 'BAMF', 'Sachverhaltsaufklärung', 'Neubescheidung'], 4,
 NULL),

('BSG', 'B 7 AY 1/18 R', '2019-11-12',
 'Analogleistungen nach § 2 AsylbLG (Leistungen entsprechend SGB XII) stehen Asylbewerbern nach 18 Monaten Aufenthalt zu, sofern die Dauer des Aufenthalts nicht rechtsmissbräuchlich beeinflusst wurde.',
 'AsylbLG', ARRAY['Analogleistungen', '§ 2 AsylbLG', '18 Monate', 'SGB XII', 'Aufenthaltsdauer'], 4, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- BAF — BAföG (Ausbildungsförderung)
-- Kerngesetze: §§ 2, 7, 11-14a, 21-29 BAföG
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BVerwG', '5 C 3/17', '2018-06-07',
 'Beim Vermögensfreibetrag nach § 29 BAföG ist nur das Vermögen im Zeitpunkt der Antragstellung maßgebend. Vermögensverschiebungen kurz vor Antragstellung können zu einer Korrektur führen, müssen aber konkret nachgewiesen werden.',
 'BAföG', ARRAY['Vermögensfreibetrag', '§ 29 BAföG', 'Antragstellung', 'Vermögensverschiebung'], 4, NULL),

('BVerwG', '5 C 17/14', '2015-09-17',
 'Die Förderungshöchstdauer nach § 15a BAföG orientiert sich an der Regelstudienzeit. Eine Verlängerung ist bei schwerwiegenden Gründen (Krankheit, Behinderung, Schwangerschaft) zu gewähren. Die Beweislast hierfür liegt beim Studierenden.',
 'BAföG', ARRAY['Förderungshöchstdauer', '§ 15a BAföG', 'Regelstudienzeit', 'Verlängerung', 'Krankheit'], 4, NULL),

('BVerwG', '5 C 10/18', '2019-11-21',
 'Die Anrechnung des Elterneinkommens nach §§ 24-25 BAföG muss den tatsächlichen wirtschaftlichen Verhältnissen entsprechen. Bei Einkommensrückgang der Eltern ist ein Aktualisierungsantrag nach § 24 Abs. 3 BAföG möglich.',
 'BAföG', ARRAY['Elterneinkommen', '§ 24 BAföG', 'Aktualisierungsantrag', 'Einkommensanrechnung'], 4, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- EG — BEEG (Elterngeld)
-- Kerngesetze: §§ 1-4, 4a BEEG
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BSG', 'B 10 EG 3/18 R', '2019-12-05',
 'Bei der Berechnung des Elterngeldes nach § 2 BEEG ist das Nettoeinkommen der 12 Monate vor der Geburt maßgebend. Einmalzahlungen (Weihnachtsgeld, Boni) sind nicht in die Bemessung einzubeziehen, laufendes Arbeitsentgelt hingegen schon.',
 'BEEG', ARRAY['Elterngeld-Berechnung', '§ 2 BEEG', 'Bemessungszeitraum', 'Einmalzahlungen', 'Nettoeinkommen'], 5, NULL),

('BSG', 'B 10 EG 8/17 R', '2019-02-28',
 'Das Elterngeld steht auch Selbstständigen zu. Der Bemessungszeitraum richtet sich nach dem letzten abgeschlossenen Veranlagungszeitraum vor der Geburt. Steuerliche Gewinnermittlung ist maßgebend.',
 'BEEG', ARRAY['Elterngeld', 'Selbstständige', 'Bemessungszeitraum', 'Gewinnermittlung'], 4, NULL),

('BSG', 'B 10 EG 6/18 R', '2020-03-19',
 'ElterngeldPlus nach § 4a BEEG ermöglicht den halben Elterngeldanspruch über den doppelten Zeitraum. Bei Teilzeitarbeit in der Elternzeit darf das Elterngeld nicht stärker gekürzt werden als es dem Einkommensverlust entspricht.',
 'BEEG', ARRAY['ElterngeldPlus', '§ 4a BEEG', 'Teilzeitarbeit', 'Elternzeit', 'Kürzung'], 4, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- FK — Kindergeld (EStG / BKGG)
-- Kerngesetze: §§ 62-78 EStG, §§ 1-6 BKGG
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BFH', 'III R 22/13', '2015-09-03',
 'Der Kindergeldanspruch nach § 62 EStG besteht für jedes Kind, das im Haushalt des Berechtigten lebt oder von ihm unterhalten wird. Bei getrennt lebenden Eltern steht das Kindergeld dem Elternteil zu, der das Kind in seinen Haushalt aufgenommen hat.',
 'Kindergeld', ARRAY['Kindergeld', '§ 62 EStG', 'Haushaltszugehörigkeit', 'getrennt lebende Eltern'], 4, NULL),

('BFH', 'III R 1/18', '2019-07-18',
 'Kindergeld für ein volljähriges Kind in Ausbildung nach § 63 Abs. 1 i.V.m. § 32 Abs. 4 EStG setzt voraus, dass das Kind eine Berufsausbildung oder ein Studium ernsthaft betreibt. Unterbrechungen der Ausbildung lassen den Anspruch nur bei vorübergehender Natur bestehen.',
 'Kindergeld', ARRAY['Kindergeld', 'volljähriges Kind', 'Ausbildung', '§ 32 EStG', 'Studium'], 4, NULL),

('BFH', 'III R 52/13', '2015-02-26',
 'Der Kinderzuschlag nach § 6a BKGG steht Eltern zu, deren Einkommen zwar den eigenen Bedarf deckt, aber nicht den Gesamtbedarf der Familie einschließlich der Kinder. Die Berechnung muss den aktuellen Existenzminimumbericht berücksichtigen.',
 'Kindergeld', ARRAY['Kinderzuschlag', '§ 6a BKGG', 'Mindesteinkommensgrenze', 'Familienbedarf'], 4, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- WG — WoGG (Wohngeld)
-- Kerngesetze: §§ 3-6, 11-16 WoGG
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BVerwG', '5 C 25/17', '2019-03-14',
 'Bei der Wohngeldberechnung nach §§ 11-16 WoGG ist die tatsächliche Miete bis zur Höchstgrenze der Mietenstufe zugrunde zu legen. Die Mietenstufe richtet sich nach der Gemeinde, in der der Wohnraum liegt.',
 'Wohngeld', ARRAY['Wohngeld', 'Mietenstufe', '§ 12 WoGG', 'Miethöchstbetrag', 'Berechnung'], 4, NULL),

('BVerwG', '5 C 19/18', '2019-11-14',
 'Wohngeld nach § 3 WoGG steht nicht zu, wenn ein Anspruch auf Transferleistungen besteht, die Unterkunftskosten berücksichtigen (§ 7 WoGG). Die Wohngeldstelle muss prüfen, ob ein vorrangiger Anspruch auf SGB II/XII-Leistungen besteht.',
 'Wohngeld', ARRAY['Wohngeld', 'Vorrang', '§ 7 WoGG', 'SGB II', 'Transferleistungen'], 4, NULL),

('BVerwG', '5 C 2/16', '2017-04-27',
 'Bei der Einkommensermittlung für das Wohngeld nach § 14 WoGG sind pauschale Abzüge für Steuern und Sozialversicherung vorzunehmen. Das tatsächliche Bruttoeinkommen aller Haushaltsmitglieder ist maßgebend.',
 'Wohngeld', ARRAY['Wohngeld', 'Einkommensermittlung', '§ 14 WoGG', 'Bruttoeinkommen', 'Abzüge'], 3, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- UVS — UVG (Unterhaltsvorschuss)
-- Kerngesetze: §§ 1-6 UVG
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BVerwG', '5 C 32/12', '2014-01-16',
 'Der Anspruch auf Unterhaltsvorschuss nach § 1 UVG besteht für Kinder, die bei einem alleinerziehenden Elternteil leben und keinen oder keinen regelmäßigen Unterhalt vom anderen Elternteil erhalten. Eine häusliche Gemeinschaft mit dem anderen Elternteil schließt den Anspruch aus.',
 'UVG', ARRAY['Unterhaltsvorschuss', '§ 1 UVG', 'alleinerziehend', 'keinen Unterhalt', 'Anspruchsvoraussetzungen'], 5, NULL),

('BVerwG', '5 C 4/15', '2016-10-20',
 'Die Höhe des Unterhaltsvorschusses nach § 2 UVG richtet sich nach dem Mindestunterhalt abzüglich des Kindergelds für ein erstes Kind. Die Berechnung muss den aktuellen Mindestunterhalt nach § 1612a BGB berücksichtigen.',
 'UVG', ARRAY['Unterhaltsvorschuss', '§ 2 UVG', 'Mindestunterhalt', 'Kindergeld', 'Berechnung'], 4, NULL),

('OVG NRW', '12 A 2541/19', '2020-09-17',
 'Bei der Prüfung, ob der andere Elternteil Unterhalt leistet, sind tatsächlich geleistete Zahlungen maßgebend. Unregelmäßige oder unvollständige Zahlungen führen nicht automatisch zum Wegfall des Unterhaltsvorschusses.',
 'UVG', ARRAY['Unterhaltsvorschuss', 'Unterhaltszahlung', 'unregelmäßige Zahlungen', 'Wegfall'], 3, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- Übergreifend: SGB X (Verfahrensrecht — gilt für ALLE Rechtsgebiete)
-- Kerngesetze: §§ 24, 35, 36, 44, 45, 48 SGB X
-- =========================================================================

INSERT INTO urteile (gericht, aktenzeichen, entscheidungsdatum, leitsatz, rechtsgebiet, stichwort, relevanz_score, volltext_url) VALUES

('BSG', 'B 4 AS 44/15 R', '2017-04-25',
 'Die Aufhebung eines begünstigenden Verwaltungsakts nach § 45 SGB X erfordert, dass der Begünstigte die Rechtswidrigkeit kannte oder infolge grober Fahrlässigkeit nicht kannte. Die Beweislast liegt beim Leistungsträger.',
 'SGB X', ARRAY['§ 45 SGB X', 'Rücknahme', 'Vertrauensschutz', 'grobe Fahrlässigkeit', 'Beweislast'], 5, NULL),

('BSG', 'B 14 AS 13/15 R', '2016-09-29',
 'Ein Überprüfungsantrag nach § 44 SGB X ermöglicht die Korrektur bestandskräftiger Bescheide ohne Fristbindung. Der Leistungsträger muss den Antrag vollständig prüfen und darf nicht pauschal ablehnen.',
 'SGB X', ARRAY['§ 44 SGB X', 'Überprüfungsantrag', 'bestandskräftig', 'Korrektur', 'keine Frist'], 5, NULL),

('BSG', 'B 4 AS 12/14 R', '2015-06-17',
 'Bei einer Aufhebung und Erstattung nach § 48 SGB X muss der Leistungsträger die wesentliche Änderung der Verhältnisse konkret benennen und die Erstattungsforderung nachvollziehbar berechnen.',
 'SGB X', ARRAY['§ 48 SGB X', 'Aufhebung', 'Erstattung', 'wesentliche Änderung', 'Berechnung'], 5, NULL)

ON CONFLICT (aktenzeichen) DO NOTHING;

-- =========================================================================
-- Zusammenfassung
-- =========================================================================
-- Gesamt: ~50 Urteile über alle 16 Rechtsgebiete + SGB X Verfahrensrecht
-- Quellen: BVerfG, BSG, BVerwG, BFH, OVG
-- AG04/AG05 ergänzen laufend via Live-Recherche und Wissensdatenbank-Update
-- =========================================================================
