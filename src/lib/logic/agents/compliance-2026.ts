/**
 * Legal-Watchdog: Gesetzesänderungen Jan–März 2026
 *
 * Recherchiert: 11.03.2026
 * Zweck: Compliance-Referenz für alle Agenten-Prompts.
 * Jede Änderung mit Quell-URL belegt.
 *
 * HARD-STOP-REGEL: Bei juristischer Unsicherheit IMMER konservativ
 * entscheiden — lieber eine veraltete Zahl als eine falsche.
 */

export interface Gesetzesaenderung {
  readonly rechtsgebiet: string;
  readonly kuerzel: string;
  readonly was: string;
  readonly alt: string;
  readonly neu: string;
  readonly ab_wann: string;
  readonly paragraph: string;
  readonly quelle: string;
  readonly status: "in_kraft" | "beschlossen" | "geplant";
}

export const AENDERUNGEN_2026: readonly Gesetzesaenderung[] = [
  // ── SGB II (BA) ──────────────────────────────────────────────────────
  {
    rechtsgebiet: "SGB II",
    kuerzel: "BA",
    was: "Regelsätze Nullrunde (Besitzschutzregelung)",
    alt: "RS1=563€",
    neu: "RS1=563€ unverändert (rechnerisch wäre 557€)",
    ab_wann: "01.01.2026",
    paragraph: "§ 28a Abs. 5 SGB XII i.V.m. § 20 SGB II",
    quelle: "https://www.bundesregierung.de/breg-de/aktuelles/nullrunde-buergergeld-2383676",
    status: "in_kraft",
  },
  {
    rechtsgebiet: "SGB II",
    kuerzel: "BA",
    was: "Auszahlung nur noch per Überweisung",
    alt: "Bar- und Scheckzahlung möglich",
    neu: "Nur noch Überweisung, Barzahlung nur in Ausnahmefällen",
    ab_wann: "01.01.2026",
    paragraph: "§ 42 SGB II",
    quelle: "https://www.vdk.de/aktuelles/aktuelle-meldungen/artikel/neue-regelungen-sozialrecht-in-2026-minijob-rente-krankenkasse/",
    status: "in_kraft",
  },
  {
    rechtsgebiet: "SGB II",
    kuerzel: "BA",
    was: "Umbenennung Bürgergeld → Grundsicherungsgeld + Sanktionsverschärfung",
    alt: "Bürgergeld, mildere Sanktionen, Karenzzeit 1 Jahr, pauschaler Vermögensfreibetrag 15.000€",
    neu: "Grundsicherungsgeld, Vermittlungsvorrang, Sanktionen bis 30% direkt (Arbeitsverweigerung bis 100% inkl. Streichung KdU und KV/PV-Beiträge bei hartnäckiger Verweigerung), Karenzzeit entfällt, altersabhängige Vermögensfreibeträge, Erwerbstätigkeit zumutbar ab 1. Geburtstag des Kindes (bei verfügbarer Betreuung), Vermieter-Auskunftspflicht",
    ab_wann: "01.07.2026",
    paragraph: "SGB II (Neufassung, 13. SGB-II-ÄndG)",
    quelle: "https://www.bundestag.de/dokumente/textarchiv/2026/kw10-de-grundsicherung-1150460",
    status: "beschlossen",
  },

  // ── SGB III (ALG) ────────────────────────────────────────────────────
  {
    rechtsgebiet: "SGB III",
    kuerzel: "ALG",
    was: "Beitragsbemessungsgrenze erhöht",
    alt: "96.600€/Jahr",
    neu: "101.400€/Jahr (8.450€/Monat)",
    ab_wann: "01.01.2026",
    paragraph: "§ 341 SGB III",
    quelle: "https://www.gegen-hartz.de/news/arbeitslosengeld-diese-aenderungen-ab-2026-sind-jetzt-wichtig",
    status: "in_kraft",
  },

  // ── SGB V (KK) ──────────────────────────────────────────────────────
  {
    rechtsgebiet: "SGB V",
    kuerzel: "KK",
    was: "Durchschnittlicher Zusatzbeitrag erhöht",
    alt: "2,5%",
    neu: "2,9% (Spanne 2,18–4,39%)",
    ab_wann: "01.01.2026",
    paragraph: "§ 242a SGB V",
    quelle: "https://www.krankenkassen.de/gesetzliche-krankenkassen/krankenkasse-beitrag/zusatzbeitrag/",
    status: "in_kraft",
  },
  {
    rechtsgebiet: "SGB V",
    kuerzel: "KK",
    was: "Kinderkrankengeld 15 Tage verlängert",
    alt: "15 Tage/Kind (befristet)",
    neu: "15 Tage/Kind verlängert (Alleinerziehende: 30 Tage)",
    ab_wann: "01.01.2026",
    paragraph: "§ 45 SGB V",
    quelle: "https://www.vdk.de/aktuelles/aktuelle-meldungen/artikel/neue-regelungen-sozialrecht-in-2026-minijob-rente-krankenkasse/",
    status: "in_kraft",
  },

  // ── SGB VI (DRV) ────────────────────────────────────────────────────
  {
    rechtsgebiet: "SGB VI",
    kuerzel: "DRV",
    was: "Rentenwert-Erhöhung +4,24%",
    alt: "40,79€",
    neu: "42,52€",
    ab_wann: "01.07.2026",
    paragraph: "§ 68 SGB VI",
    quelle: "https://rentenbescheid24.de/rentenerhoehung-2026-ist-amtlich-tabelle-zeigt-wie-stark-die-rente-ab-juli-steigt/",
    status: "beschlossen",
  },
  {
    rechtsgebiet: "SGB VI",
    kuerzel: "DRV",
    was: "Rentenniveau-Haltelinie verlängert",
    alt: "Garantiert bis 2025",
    neu: "Garantiert bis 01.07.2031 (mind. 48%)",
    ab_wann: "in Kraft",
    paragraph: "§ 154 Abs. 3 SGB VI (Rentenpaket 2025)",
    quelle: "https://www.buerger-geld.org/news/rente/rente-steigt-2026-um-424-prozent-warum-das-plus-vielen-rentnern-nicht-reicht",
    status: "in_kraft",
  },

  // ── SGB IX (EH) ─────────────────────────────────────────────────────
  {
    rechtsgebiet: "SGB IX",
    kuerzel: "EH",
    was: "Vermögensfreigrenze erhöht",
    alt: "67.410€",
    neu: "71.190€",
    ab_wann: "01.01.2026",
    paragraph: "§ 139 SGB IX",
    quelle: "https://www.gegen-hartz.de/news/schwerbehinderung-eingliederungshilfe-seit-01-01-2026-hoehere-freibetraege",
    status: "in_kraft",
  },
  {
    rechtsgebiet: "SGB IX",
    kuerzel: "EH",
    was: "Einkommensfreibetrag-Referenzwert erhöht",
    alt: "45.540€",
    neu: "47.460€",
    ab_wann: "01.01.2026",
    paragraph: "§ 136 SGB IX",
    quelle: "https://www.berlin.de/sen/soziales/service/berliner-sozialrecht/kategorie/rundschreiben/2025_06-1615052.php",
    status: "in_kraft",
  },

  // ── SGB XI (PK) ─────────────────────────────────────────────────────
  {
    rechtsgebiet: "SGB XI",
    kuerzel: "PK",
    was: "Beratungsbesuche reduziert (BEEP-Gesetz)",
    alt: "Quartalsweise PG2-3, halbjährlich PG4-5",
    neu: "Nur noch 2x jährlich für PG 2-5 bei reinem Pflegegeldbezug",
    ab_wann: "01.01.2026",
    paragraph: "§ 37 Abs. 3 SGB XI",
    quelle: "https://pflege-dschungel.de/beep-2026/",
    status: "in_kraft",
  },

  // ── BEEG (EG) ────────────────────────────────────────────────────────
  {
    rechtsgebiet: "BEEG",
    kuerzel: "EG",
    was: "Einkommensgrenze vereinheitlicht",
    alt: "200.000€ Paare (stufenweise Absenkung)",
    neu: "175.000€ einheitlich für Paare und Alleinerziehende",
    ab_wann: "01.01.2026",
    paragraph: "§ 1 Abs. 8 BEEG",
    quelle: "https://www.buerger-geld.org/news/finanzen/elterngeld-2026-hoehe-anspruch-und-akutelle-aenderungen-in-diesem-jahr/",
    status: "in_kraft",
  },
  {
    rechtsgebiet: "BEEG",
    kuerzel: "EG",
    was: "Parallelbezug Basiselterngeld eingeschränkt",
    alt: "Gemeinsamer Bezug länger möglich",
    neu: "Max. 1 Monat parallel, nur in ersten 12 Lebensmonaten",
    ab_wann: "01.01.2026",
    paragraph: "§ 4 BEEG",
    quelle: "https://www.sparkasse.de/aktuelles/aenderungen-eltern-2026.html",
    status: "in_kraft",
  },

  // ── EStG / BKGG (FK) ────────────────────────────────────────────────
  {
    rechtsgebiet: "EStG",
    kuerzel: "FK",
    was: "Kindergeld erhöht",
    alt: "255€/Kind",
    neu: "259€/Kind (+4€)",
    ab_wann: "01.01.2026",
    paragraph: "§ 66 EStG",
    quelle: "https://www.arbeitsagentur.de/presse/2025-53-kindergeld-steigt-ab-januar-2026",
    status: "in_kraft",
  },
  {
    rechtsgebiet: "EStG",
    kuerzel: "FK",
    was: "Kinderfreibetrag erhöht",
    alt: "9.600€",
    neu: "9.756€ (+156€)",
    ab_wann: "01.01.2026",
    paragraph: "§ 32 Abs. 6 EStG",
    quelle: "https://www.arbeitsagentur.de/news/kindergeld-steigt-2026",
    status: "in_kraft",
  },

  // ── UVG (UVS) ────────────────────────────────────────────────────────
  {
    rechtsgebiet: "UVG",
    kuerzel: "UVS",
    was: "Mindestunterhalt leicht erhöht",
    alt: "0-5J: 482€, 6-11J: 554€, 12-17J: 649€",
    neu: "0-5J: 486€, 6-11J: 558€, 12-17J: 653€",
    ab_wann: "01.01.2026",
    paragraph: "§ 1612a BGB, § 2 UVG",
    quelle: "https://www.fokus-sozialrecht.de/mindestunterhalt-und-unterhaltsvorschuss-2026",
    status: "in_kraft",
  },

  // ── AsylbLG (BAMF) ──────────────────────────────────────────────────
  {
    rechtsgebiet: "AsylbLG",
    kuerzel: "BAMF",
    was: "Ukraine-Geflüchtete (nach 01.04.2025) → AsylbLG statt SGB II/XII",
    alt: "SGB II/XII-Leistungen für alle Ukraine-Geflüchteten",
    neu: "Nach 01.04.2025 eingereist → Leistungen nach AsylbLG (reduzierte Gesundheitsversorgung)",
    ab_wann: "in Kraft",
    paragraph: "AsylbLG i.V.m. § 24 AufenthG",
    quelle: "https://www.asyl.net/view/gesetzesaenderungen-zum-jahreswechsel",
    status: "in_kraft",
  },
  {
    rechtsgebiet: "AsylG",
    kuerzel: "BAMF",
    was: "GEAS-Umsetzung (EU-Asylrecht)",
    alt: "Nationales Asylrecht",
    neu: "Anpassung an EU-Vorgaben (AsylG, AufenthG, AsylbLG), Grenzverfahren an EU-Außengrenzen, Sekundärmigrationszentren in Bundesländern",
    ab_wann: "12.06.2026",
    paragraph: "AsylG, AufenthG, AsylbLG (GEAS-Anpassungsgesetz, BT-Beschluss 27.02.2026)",
    quelle: "https://www.bundestag.de/dokumente/textarchiv/2026/kw09-de-geas-1149762",
    status: "beschlossen",
  },

  // ── SGB VIII (JA) ───────────────────────────────────────────────────
  {
    rechtsgebiet: "SGB VIII",
    kuerzel: "JA",
    was: "Rechtsanspruch Ganztagsbetreuung Grundschule (Start)",
    alt: "Kein Rechtsanspruch",
    neu: "Rechtsanspruch auf ganztägige Betreuung für Erstklässler",
    ab_wann: "01.08.2026",
    paragraph: "§ 24 Abs. 4 SGB VIII",
    quelle: "https://www.lebenshilfe.de/informieren/kinder/reform-der-kinder-und-jugendhilfe",
    status: "beschlossen",
  },

  // ── Übergreifend ─────────────────────────────────────────────────────
  {
    rechtsgebiet: "Übergreifend",
    kuerzel: "ALL",
    was: "Mindestlohn erhöht",
    alt: "12,82€/Std.",
    neu: "13,90€/Std.",
    ab_wann: "01.01.2026",
    paragraph: "MiLoG",
    quelle: "https://www.vdk.de/aktuelles/aktuelle-meldungen/artikel/neue-regelungen-sozialrecht-in-2026-minijob-rente-krankenkasse/",
    status: "in_kraft",
  },
  {
    rechtsgebiet: "Übergreifend",
    kuerzel: "ALL",
    was: "Minijob-Grenze erhöht",
    alt: "556€/Monat",
    neu: "603€/Monat",
    ab_wann: "01.01.2026",
    paragraph: "§ 8 SGB IV",
    quelle: "https://www.vdk.de/aktuelles/aktuelle-meldungen/artikel/neue-regelungen-sozialrecht-in-2026-minijob-rente-krankenkasse/",
    status: "in_kraft",
  },
  {
    rechtsgebiet: "Übergreifend",
    kuerzel: "ALL",
    was: "Sozialleistungs-Auszahlung nur noch per Überweisung",
    alt: "Bar/Scheck möglich",
    neu: "Grundsätzlich nur Überweisung",
    ab_wann: "01.01.2026",
    paragraph: "§ 42 SGB II, § 337 SGB III u.a.",
    quelle: "https://www.vdk.de/aktuelles/aktuelle-meldungen/artikel/neue-regelungen-sozialrecht-in-2026-minijob-rente-krankenkasse/",
    status: "in_kraft",
  },

  // ── SGB V (KK) — Versicherungspflichtgrenze ───────────────────────────
  {
    rechtsgebiet: "SGB V",
    kuerzel: "KK",
    was: "Versicherungspflichtgrenze erhöht",
    alt: "73.800€/Jahr (6.150€/Monat)",
    neu: "77.400€/Jahr (6.450€/Monat)",
    ab_wann: "01.01.2026",
    paragraph: "§ 6 Abs. 1 Nr. 1 SGB V, Sozialversicherungsrechengrößenverordnung 2026",
    quelle: "https://www.vdk.de/aktuelles/aktuelle-meldungen/artikel/neue-regelungen-sozialrecht-in-2026-minijob-rente-krankenkasse/",
    status: "in_kraft",
  },

  // ── SGB VI (DRV) — EM-Renten-Hinzuverdienstgrenzen ────────────────────
  {
    rechtsgebiet: "SGB VI",
    kuerzel: "DRV",
    was: "Hinzuverdienstgrenzen bei Erwerbsminderungsrente erhöht",
    alt: "Volle EM: 18.558,75€/Jahr, Teilweise EM: 37.117,50€/Jahr",
    neu: "Volle EM: 20.763,75€/Jahr, Teilweise EM: 41.527,50€/Jahr",
    ab_wann: "01.01.2026",
    paragraph: "§ 96a SGB VI",
    quelle: "https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2026/260305-rentenanpassung-2026.html",
    status: "in_kraft",
  },

  // ── SGB VI (DRV) — Beitragsbemessungsgrenze ──────────────────────────
  {
    rechtsgebiet: "SGB VI",
    kuerzel: "DRV",
    was: "Beitragsbemessungsgrenze allgemeine RV erhöht",
    alt: "West: 96.600€/Jahr (8.050€/Monat)",
    neu: "West: 101.400€/Jahr (8.450€/Monat), einheitlich Ost=West",
    ab_wann: "01.01.2026",
    paragraph: "§ 159 SGB VI, Sozialversicherungsrechengrößenverordnung 2026",
    quelle: "https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2026/260305-rentenanpassung-2026.html",
    status: "in_kraft",
  },

  // ── SGB VI (DRV) — Bezugsgröße ───────────────────────────────────────
  {
    rechtsgebiet: "SGB VI",
    kuerzel: "DRV",
    was: "Bezugsgröße erhöht",
    alt: "West: 3.745€/Monat",
    neu: "West: 3.935€/Monat, einheitlich Ost=West",
    ab_wann: "01.01.2026",
    paragraph: "§ 18 SGB IV",
    quelle: "https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2026/260305-rentenanpassung-2026.html",
    status: "in_kraft",
  },

  // ── SGB VI (DRV) — Durchschnittsentgelt ──────────────────────────────
  {
    rechtsgebiet: "SGB VI",
    kuerzel: "DRV",
    was: "Vorläufiges Durchschnittsentgelt angepasst",
    alt: "45.358€/Jahr (2025)",
    neu: "47.084€/Jahr (2026, vorläufig)",
    ab_wann: "01.01.2026",
    paragraph: "Anlage 1 SGB VI",
    quelle: "https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2026/260305-rentenanpassung-2026.html",
    status: "in_kraft",
  },

  // ── SGB VI (DRV) — Regelaltersgrenze ─────────────────────────────────
  {
    rechtsgebiet: "SGB VI",
    kuerzel: "DRV",
    was: "Regelaltersgrenze weiter angehoben (Jahrgang 1961)",
    alt: "Jahrgang 1960: 66 Jahre + 4 Monate",
    neu: "Jahrgang 1961: 66 Jahre + 6 Monate",
    ab_wann: "01.01.2026",
    paragraph: "§ 235 SGB VI",
    quelle: "https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Allgemeine-Informationen/Wann-kann-ich-in-Rente-gehen/wann-in-rente-gehen.html",
    status: "in_kraft",
  },

  // ── SGB V (KK) — ePA-Sanktionen ──────────────────────────────────────
  {
    rechtsgebiet: "SGB V",
    kuerzel: "KK",
    was: "Elektronische Patientenakte (ePA) verpflichtend für alle Versicherten",
    alt: "ePA freiwillig, Opt-in",
    neu: "ePA automatisch für alle GKV-Versicherten (Opt-out möglich), Leistungserbringer müssen ePA befüllen",
    ab_wann: "15.01.2026",
    paragraph: "§ 341 SGB V, DigiG",
    quelle: "https://www.bundesgesundheitsministerium.de/themen/digitalisierung/elektronische-patientenakte",
    status: "in_kraft",
  },

  // ── SGB V (KK) — DiGA-Erweiterung ────────────────────────────────────
  {
    rechtsgebiet: "SGB V",
    kuerzel: "KK",
    was: "DiGA-Verzeichnis erweitert, Verordnungspflicht gelockert",
    alt: "DiGA nur auf ärztliche Verordnung",
    neu: "Versicherte können DiGA auch direkt bei Krankenkasse beantragen, erweitertes DiGA-Verzeichnis",
    ab_wann: "01.01.2026",
    paragraph: "§ 33a SGB V",
    quelle: "https://www.bundesgesundheitsministerium.de/themen/digitalisierung/digitale-gesundheitsanwendungen",
    status: "in_kraft",
  },
  // ── SGB IX (EH) — Ausgleichsabgabe ──────────────────────────────────
  {
    rechtsgebiet: "SGB IX",
    kuerzel: "EH",
    was: "Ausgleichsabgabe erhöht (erstmals fällig 31.03.2026)",
    alt: "Staffelbeträge bis max. 720€/Monat pro unbesetztem Pflichtplatz",
    neu: "Erhöhte Staffelbeträge bis >800€/Monat, erstmalige Fälligkeit der neuen Sätze zum 31.03.2026, digitaler Behindertenpauschbetrag nur noch elektronisch beantragbar",
    ab_wann: "31.03.2026",
    paragraph: "§ 160 SGB IX",
    quelle: "https://www.gegen-hartz.de/urteile/schwerbehinderung-7-wichtige-aenderungen-im-maerz-2026",
    status: "in_kraft",
  },
] as const;
