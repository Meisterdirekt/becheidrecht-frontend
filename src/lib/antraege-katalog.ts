/**
 * Antrags-Katalog: Formfreie Anträge und Pflichtformulare pro Behörde.
 *
 * Formfreie Anträge können von der KI generiert werden.
 * Pflichtformulare verlinken auf die offiziellen Quellen.
 */

export interface FormfreierAntrag {
  id: string;
  titel: string;
  beschreibung: string;
  rechtsgrundlage: string;
  /** Vorausgefüllte Beschreibung für den /assistant Wizard */
  assistantPrompt: string;
}

export interface Pflichtformular {
  titel: string;
  beschreibung: string;
  url: string;
  quelle: string;
}

export interface BehoerdeAntraege {
  traeger: string;
  label: string;
  sgb: string;
  formfreieAntraege: FormfreierAntrag[];
  pflichtformulare: Pflichtformular[];
}

export const ANTRAEGE_KATALOG: BehoerdeAntraege[] = [
  // ─── Jobcenter (SGB II) ──────────────────────────────────────────────
  {
    traeger: "jobcenter",
    label: "Jobcenter (SGB II)",
    sgb: "SGB II",
    formfreieAntraege: [
      {
        id: "ba-mehrbedarf",
        titel: "Mehrbedarf beantragen",
        beschreibung: "Mehrbedarf für Schwangere, Alleinerziehende, behinderte Menschen, kostenaufwändige Ernährung oder dezentrale Warmwassererzeugung.",
        rechtsgrundlage: "§ 21 SGB II",
        assistantPrompt: "Ich möchte beim Jobcenter einen Mehrbedarf beantragen. Bitte erstellen Sie mir ein formfreies Antragsschreiben.",
      },
      {
        id: "ba-erstausstattung",
        titel: "Erstausstattung Wohnung",
        beschreibung: "Erstausstattung für die Wohnung einschließlich Haushaltsgeräte bei Erstbezug, nach Trennung oder Brand.",
        rechtsgrundlage: "§ 24 Abs. 3 Nr. 1 SGB II",
        assistantPrompt: "Ich möchte beim Jobcenter eine Erstausstattung für meine Wohnung beantragen (Möbel, Haushaltsgeräte).",
      },
      {
        id: "ba-erstausstattung-kleidung",
        titel: "Erstausstattung Bekleidung",
        beschreibung: "Erstausstattung für Bekleidung, z. B. bei Schwangerschaft oder nach besonderen Umständen.",
        rechtsgrundlage: "§ 24 Abs. 3 Nr. 2 SGB II",
        assistantPrompt: "Ich möchte beim Jobcenter eine Erstausstattung für Bekleidung beantragen.",
      },
      {
        id: "ba-umzugskosten",
        titel: "Umzugskosten",
        beschreibung: "Übernahme von Umzugskosten bei erforderlichem Wohnungswechsel (vorherige Zusicherung nötig).",
        rechtsgrundlage: "§ 22 Abs. 6 SGB II",
        assistantPrompt: "Ich möchte beim Jobcenter die Übernahme meiner Umzugskosten beantragen. Der Umzug ist erforderlich.",
      },
      {
        id: "ba-darlehen",
        titel: "Darlehen für unabweisbaren Bedarf",
        beschreibung: "Darlehen bei unabweisbarem, einmaligem Bedarf, der nicht aus dem Regelbedarf gedeckt werden kann.",
        rechtsgrundlage: "§ 24 Abs. 1 SGB II",
        assistantPrompt: "Ich möchte beim Jobcenter ein Darlehen für einen unabweisbaren Bedarf beantragen.",
      },
      {
        id: "ba-ueberpruefung",
        titel: "Überprüfungsantrag",
        beschreibung: "Überprüfung eines bestandskräftigen Bescheids, wenn dieser rechtswidrig war. Keine Frist.",
        rechtsgrundlage: "§ 44 SGB X",
        assistantPrompt: "Ich möchte beim Jobcenter einen Überprüfungsantrag nach § 44 SGB X stellen, da ich glaube, dass ein früherer Bescheid rechtswidrig war.",
      },
      {
        id: "ba-akteneinsicht",
        titel: "Akteneinsicht",
        beschreibung: "Einsicht in die Verwaltungsakte beim Jobcenter beantragen.",
        rechtsgrundlage: "§ 25 SGB X",
        assistantPrompt: "Ich möchte beim Jobcenter Akteneinsicht in meine Verwaltungsakte beantragen.",
      },
      {
        id: "ba-bildung-teilhabe",
        titel: "Bildung und Teilhabe",
        beschreibung: "Leistungen für Schulbedarf, Mittagessen, Lernförderung, Ausflüge oder Vereinsbeiträge für Kinder. Hinweis: Einige Kommunen verlangen eigene Formulare.",
        rechtsgrundlage: "§ 28 SGB II",
        assistantPrompt: "Ich möchte beim Jobcenter Leistungen für Bildung und Teilhabe für mein Kind beantragen.",
      },
    ],
    pflichtformulare: [
      {
        titel: "Hauptantrag Grundsicherungsgeld (WBA)",
        beschreibung: "Erstantrag auf Leistungen nach SGB II — muss auf dem offiziellen Vordruck eingereicht werden.",
        url: "https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/buergergeld",
        quelle: "Bundesagentur für Arbeit",
      },
      {
        titel: "Weiterbewilligungsantrag (WBA-F)",
        beschreibung: "Folgeantrag zur Weiterbewilligung — offizieller Vordruck erforderlich.",
        url: "https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/buergergeld",
        quelle: "Bundesagentur für Arbeit",
      },
    ],
  },

  // ─── Krankenkasse (SGB V) ────────────────────────────────────────────
  {
    traeger: "krankenkasse",
    label: "Krankenkasse (SGB V)",
    sgb: "SGB V",
    formfreieAntraege: [
      {
        id: "kk-hilfsmittel",
        titel: "Hilfsmittel beantragen",
        beschreibung: "Antrag auf Kostenübernahme für Hilfsmittel (Rollstuhl, Hörgerät, Prothese etc.).",
        rechtsgrundlage: "§ 33 SGB V",
        assistantPrompt: "Ich möchte bei meiner Krankenkasse die Kostenübernahme für ein Hilfsmittel beantragen.",
      },
      {
        id: "kk-fahrkosten",
        titel: "Fahrkosten zur Behandlung",
        beschreibung: "Erstattung von Fahrtkosten zu ambulanten oder stationären Behandlungen.",
        rechtsgrundlage: "§ 60 SGB V",
        assistantPrompt: "Ich möchte bei meiner Krankenkasse die Erstattung von Fahrtkosten zu meiner Behandlung beantragen.",
      },
      {
        id: "kk-haushaltshilfe",
        titel: "Haushaltshilfe",
        beschreibung: "Haushaltshilfe bei Krankenhausaufenthalt oder schwerer Erkrankung, wenn Kinder unter 12 im Haushalt leben.",
        rechtsgrundlage: "§ 38 SGB V",
        assistantPrompt: "Ich möchte bei meiner Krankenkasse eine Haushaltshilfe beantragen.",
      },
      {
        id: "kk-reha",
        titel: "Rehabilitationsmaßnahme",
        beschreibung: "Antrag auf medizinische Rehabilitation (Kur, Reha-Maßnahme).",
        rechtsgrundlage: "§ 40 SGB V",
        assistantPrompt: "Ich möchte bei meiner Krankenkasse eine Rehabilitationsmaßnahme (Kur/Reha) beantragen.",
      },
      {
        id: "kk-mutter-vater-kind-kur",
        titel: "Mutter-/Vater-Kind-Kur",
        beschreibung: "Antrag auf eine Mutter- oder Vater-Kind-Kur (Vorsorge- oder Rehabilitationsmaßnahme).",
        rechtsgrundlage: "§ 24 SGB V",
        assistantPrompt: "Ich möchte bei meiner Krankenkasse eine Mutter-Kind-Kur bzw. Vater-Kind-Kur beantragen.",
      },
      {
        id: "kk-haeusliche-krankenpflege",
        titel: "Häusliche Krankenpflege",
        beschreibung: "Verordnete Behandlungspflege, Grundpflege oder hauswirtschaftliche Versorgung zu Hause.",
        rechtsgrundlage: "§ 37 SGB V",
        assistantPrompt: "Ich möchte bei meiner Krankenkasse häusliche Krankenpflege beantragen.",
      },
      {
        id: "kk-zuzahlungsbefreiung",
        titel: "Zuzahlungsbefreiung",
        beschreibung: "Befreiung von Zuzahlungen bei Überschreitung der Belastungsgrenze (2% / 1% bei chronisch Kranken).",
        rechtsgrundlage: "§ 62 SGB V",
        assistantPrompt: "Ich möchte bei meiner Krankenkasse eine Befreiung von Zuzahlungen beantragen, da ich die Belastungsgrenze erreicht habe.",
      },
    ],
    pflichtformulare: [
      {
        titel: "Kinderkrankengeld (Muster 21)",
        beschreibung: "Kinderkrankengeld bei Erkrankung eines Kindes — ärztliche Bescheinigung (Muster 21) erforderlich.",
        url: "https://www.bundesgesundheitsministerium.de/themen/praevention/kindergesundheit/faq-kinderkrankengeld",
        quelle: "Bundesgesundheitsministerium",
      },
    ],
  },

  // ─── Pflegekasse (SGB XI) ────────────────────────────────────────────
  {
    traeger: "pflegekasse",
    label: "Pflegekasse (SGB XI)",
    sgb: "SGB XI",
    formfreieAntraege: [
      {
        id: "pk-hoeherstufung",
        titel: "Höherstufung Pflegegrad",
        beschreibung: "Antrag auf Höherstufung des Pflegegrads bei Verschlechterung des Gesundheitszustands.",
        rechtsgrundlage: "§§ 14, 15 SGB XI",
        assistantPrompt: "Ich möchte bei meiner Pflegekasse eine Höherstufung des Pflegegrads beantragen, da sich der Zustand verschlechtert hat.",
      },
      {
        id: "pk-verhinderungspflege",
        titel: "Verhinderungspflege",
        beschreibung: "Kostenübernahme für Ersatzpflege, wenn die Pflegeperson verhindert ist. Gemeinsames Entlastungsbudget mit Kurzzeitpflege: bis 3.539 € pro Jahr.",
        rechtsgrundlage: "§ 39 SGB XI",
        assistantPrompt: "Ich möchte bei meiner Pflegekasse Verhinderungspflege beantragen, da die Pflegeperson vorübergehend verhindert ist.",
      },
      {
        id: "pk-kurzzeitpflege",
        titel: "Kurzzeitpflege",
        beschreibung: "Vorübergehende vollstationäre Pflege, z. B. nach Krankenhausaufenthalt. Gemeinsames Entlastungsbudget mit Verhinderungspflege: bis 3.539 € pro Jahr.",
        rechtsgrundlage: "§ 42 SGB XI",
        assistantPrompt: "Ich möchte bei meiner Pflegekasse Kurzzeitpflege beantragen.",
      },
      {
        id: "pk-wohnraumanpassung",
        titel: "Wohnraumanpassung",
        beschreibung: "Zuschuss für barrierefreien Umbau der Wohnung (bis 4.000 € pro Maßnahme).",
        rechtsgrundlage: "§ 40 Abs. 4 SGB XI",
        assistantPrompt: "Ich möchte bei meiner Pflegekasse einen Zuschuss zur Wohnraumanpassung (barrierefreier Umbau) beantragen.",
      },
      {
        id: "pk-pflegehilfsmittel",
        titel: "Pflegehilfsmittel",
        beschreibung: "Monatliche Pflegehilfsmittel zum Verbrauch (bis 40 € pro Monat) oder technische Pflegehilfsmittel.",
        rechtsgrundlage: "§ 40 SGB XI",
        assistantPrompt: "Ich möchte bei meiner Pflegekasse Pflegehilfsmittel beantragen.",
      },
      {
        id: "pk-entlastungsbetrag",
        titel: "Entlastungsbetrag",
        beschreibung: "Entlastungsbetrag von 125 € monatlich für Betreuungs- und Entlastungsleistungen.",
        rechtsgrundlage: "§ 45b SGB XI",
        assistantPrompt: "Ich möchte bei meiner Pflegekasse den Entlastungsbetrag nach § 45b SGB XI beantragen.",
      },
    ],
    pflichtformulare: [
      {
        titel: "Erstantrag Pflegegrad",
        beschreibung: "Erstantrag auf Feststellung der Pflegebedürftigkeit — formlos bei der Pflegekasse möglich, viele Kassen bieten aber eigene Formulare an.",
        url: "https://www.bundesgesundheitsministerium.de/pflege",
        quelle: "Bundesgesundheitsministerium",
      },
    ],
  },

  // ─── DRV (SGB VI) ────────────────────────────────────────────────────
  {
    traeger: "drv",
    label: "Deutsche Rentenversicherung (SGB VI)",
    sgb: "SGB VI",
    formfreieAntraege: [
      {
        id: "drv-ueberpruefung",
        titel: "Überprüfungsantrag",
        beschreibung: "Überprüfung eines bestandskräftigen Rentenbescheids. Keine Frist.",
        rechtsgrundlage: "§ 44 SGB X",
        assistantPrompt: "Ich möchte bei der Deutschen Rentenversicherung einen Überprüfungsantrag nach § 44 SGB X stellen.",
      },
      {
        id: "drv-akteneinsicht",
        titel: "Akteneinsicht",
        beschreibung: "Einsicht in die Verwaltungsakte bei der DRV beantragen.",
        rechtsgrundlage: "§ 25 SGB X",
        assistantPrompt: "Ich möchte bei der Deutschen Rentenversicherung Akteneinsicht in meine Verwaltungsakte beantragen.",
      },
    ],
    pflichtformulare: [
      {
        titel: "Rentenantrag (R0100)",
        beschreibung: "Antrag auf Altersrente — offizieller Vordruck R0100.",
        url: "https://www.deutsche-rentenversicherung.de/DRV/DE/Online-Services/Formularsuche/formularsuche_node.html",
        quelle: "Deutsche Rentenversicherung",
      },
      {
        titel: "Erwerbsminderungsrente (R0210)",
        beschreibung: "Antrag auf Rente wegen Erwerbsminderung — Vordruck R0210.",
        url: "https://www.deutsche-rentenversicherung.de/DRV/DE/Online-Services/Formularsuche/formularsuche_node.html",
        quelle: "Deutsche Rentenversicherung",
      },
      {
        titel: "Kontenklärung (V0100)",
        beschreibung: "Klärung des Versicherungskontos — Vordruck V0100.",
        url: "https://www.deutsche-rentenversicherung.de/DRV/DE/Online-Services/Formularsuche/formularsuche_node.html",
        quelle: "Deutsche Rentenversicherung",
      },
      {
        titel: "Reha-Antrag (G0100)",
        beschreibung: "Antrag auf medizinische Rehabilitation — Vordruck G0100.",
        url: "https://www.deutsche-rentenversicherung.de/DRV/DE/Online-Services/Formularsuche/formularsuche_node.html",
        quelle: "Deutsche Rentenversicherung",
      },
    ],
  },

  // ─── Versorgungsamt (Schwerbehinderung) ──────────────────────────────
  {
    traeger: "versorgungsamt",
    label: "Versorgungsamt (Schwerbehinderung)",
    sgb: "SGB IX",
    formfreieAntraege: [
      {
        id: "va-neufeststellung",
        titel: "Neufeststellung GdB",
        beschreibung: "Antrag auf Neufeststellung des Grads der Behinderung bei Verschlechterung. Ein formloser Antrag wahrt die Frist — das Versorgungsamt kann ein landesspezifisches Formular nachfordern.",
        rechtsgrundlage: "§ 152 SGB IX",
        assistantPrompt: "Ich möchte beim Versorgungsamt eine Neufeststellung meines Grads der Behinderung (GdB) beantragen, da sich mein Gesundheitszustand verschlechtert hat.",
      },
      {
        id: "va-merkzeichen",
        titel: "Merkzeichen beantragen",
        beschreibung: "Antrag auf Zuerkennung eines Merkzeichens (G, aG, B, H, Bl, Gl, RF, TBl).",
        rechtsgrundlage: "§ 152 Abs. 4 SGB IX",
        assistantPrompt: "Ich möchte beim Versorgungsamt ein Merkzeichen für meinen Schwerbehindertenausweis beantragen.",
      },
    ],
    pflichtformulare: [
      {
        titel: "Erstantrag Schwerbehinderung",
        beschreibung: "Erstantrag auf Feststellung einer Behinderung — landesspezifische Formulare.",
        url: "https://www.bmas.de/DE/Soziales/Teilhabe-und-Inklusion/Rehabilitation-und-Teilhabe/rehabilitation-und-teilhabe.html",
        quelle: "BMAS",
      },
    ],
  },

  // ─── Sozialhilfe (SGB XII) ───────────────────────────────────────────
  {
    traeger: "sozialhilfe",
    label: "Sozialhilfe / Grundsicherung (SGB XII)",
    sgb: "SGB XII",
    formfreieAntraege: [
      {
        id: "sh-bestattungskosten",
        titel: "Bestattungskosten",
        beschreibung: "Übernahme der Bestattungskosten, wenn den Angehörigen die Kosten nicht zugemutet werden können.",
        rechtsgrundlage: "§ 74 SGB XII",
        assistantPrompt: "Ich möchte beim Sozialamt die Übernahme der Bestattungskosten beantragen, da ich die Kosten nicht tragen kann.",
      },
      {
        id: "sh-ueberpruefung",
        titel: "Überprüfungsantrag",
        beschreibung: "Überprüfung eines bestandskräftigen Sozialhilfebescheids.",
        rechtsgrundlage: "§ 44 SGB X",
        assistantPrompt: "Ich möchte beim Sozialamt einen Überprüfungsantrag nach § 44 SGB X stellen.",
      },
      {
        id: "sh-mehrbedarf",
        titel: "Mehrbedarf",
        beschreibung: "Mehrbedarf bei Gehbehinderung, kostenaufwändiger Ernährung oder dezentraler Warmwassererzeugung.",
        rechtsgrundlage: "§ 30 SGB XII",
        assistantPrompt: "Ich möchte beim Sozialamt einen Mehrbedarf nach § 30 SGB XII beantragen.",
      },
    ],
    pflichtformulare: [
      {
        titel: "Grundsicherung im Alter (Erstantrag)",
        beschreibung: "Antrag auf Grundsicherung im Alter und bei Erwerbsminderung — meist örtliche Formulare.",
        url: "https://www.bmas.de/DE/Soziales/Sozialhilfe/Grundsicherung-im-Alter-und-bei-Erwerbsminderung/grundsicherung-im-alter-und-bei-erwerbsminderung.html",
        quelle: "BMAS",
      },
    ],
  },

  // ─── Agentur für Arbeit (SGB III) ────────────────────────────────────
  {
    traeger: "arbeitsagentur",
    label: "Agentur für Arbeit (SGB III)",
    sgb: "SGB III",
    formfreieAntraege: [
      {
        id: "alg-ueberpruefung",
        titel: "Überprüfungsantrag",
        beschreibung: "Überprüfung eines bestandskräftigen Bescheids der Arbeitsagentur.",
        rechtsgrundlage: "§ 44 SGB X",
        assistantPrompt: "Ich möchte bei der Agentur für Arbeit einen Überprüfungsantrag nach § 44 SGB X stellen.",
      },
      {
        id: "alg-akteneinsicht",
        titel: "Akteneinsicht",
        beschreibung: "Einsicht in die Verwaltungsakte bei der Agentur für Arbeit.",
        rechtsgrundlage: "§ 25 SGB X",
        assistantPrompt: "Ich möchte bei der Agentur für Arbeit Akteneinsicht in meine Verwaltungsakte beantragen.",
      },
    ],
    pflichtformulare: [
      {
        titel: "Arbeitslosengeld beantragen",
        beschreibung: "Antrag auf ALG I — online oder bei der örtlichen Agentur.",
        url: "https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/arbeitslosengeld",
        quelle: "Bundesagentur für Arbeit",
      },
    ],
  },

  // ─── Jugendamt (SGB VIII) ────────────────────────────────────────────
  {
    traeger: "jugendamt",
    label: "Jugendamt (SGB VIII)",
    sgb: "SGB VIII",
    formfreieAntraege: [
      {
        id: "ja-hilfe-erziehung",
        titel: "Hilfe zur Erziehung",
        beschreibung: "Antrag auf Hilfe zur Erziehung (Erziehungsberatung, Sozialpädagogische Familienhilfe, Vollzeitpflege etc.).",
        rechtsgrundlage: "§ 27 SGB VIII",
        assistantPrompt: "Ich möchte beim Jugendamt Hilfe zur Erziehung beantragen.",
      },
      {
        id: "ja-eingliederung-35a",
        titel: "Eingliederungshilfe (§ 35a)",
        beschreibung: "Eingliederungshilfe für seelisch behinderte Kinder und Jugendliche.",
        rechtsgrundlage: "§ 35a SGB VIII",
        assistantPrompt: "Ich möchte beim Jugendamt Eingliederungshilfe nach § 35a SGB VIII für mein Kind beantragen.",
      },
    ],
    pflichtformulare: [],
  },

  // ─── Eingliederungshilfe (SGB IX) ────────────────────────────────────
  {
    traeger: "eingliederungshilfe",
    label: "Eingliederungshilfe (SGB IX)",
    sgb: "SGB IX",
    formfreieAntraege: [
      {
        id: "eh-teilhabe",
        titel: "Teilhabeleistungen",
        beschreibung: "Leistungen zur sozialen Teilhabe, zur Teilhabe am Arbeitsleben oder zur Teilhabe an Bildung.",
        rechtsgrundlage: "§ 102 SGB IX",
        assistantPrompt: "Ich möchte Leistungen zur Teilhabe nach dem SGB IX beantragen.",
      },
      {
        id: "eh-persoenliches-budget",
        titel: "Persönliches Budget",
        beschreibung: "Statt Sachleistungen ein Persönliches Budget erhalten, um Leistungen selbst einzukaufen.",
        rechtsgrundlage: "§ 29 SGB IX",
        assistantPrompt: "Ich möchte ein Persönliches Budget nach § 29 SGB IX beantragen, um meine Teilhabeleistungen selbst zu organisieren.",
      },
    ],
    pflichtformulare: [],
  },

  // ─── BAMF / Ausländerbehörde ─────────────────────────────────────────
  {
    traeger: "bamf",
    label: "BAMF / Ausländerbehörde",
    sgb: "AsylbLG",
    formfreieAntraege: [
      {
        id: "bamf-haertefall",
        titel: "Härtefallersuchen",
        beschreibung: "Härtefallersuchen an die Härtefallkommission des jeweiligen Bundeslandes.",
        rechtsgrundlage: "§ 23a AufenthG",
        assistantPrompt: "Ich möchte ein Härtefallersuchen an die Härtefallkommission stellen.",
      },
      {
        id: "bamf-ueberpruefung",
        titel: "Überprüfungsantrag (AsylbLG-Bescheid)",
        beschreibung: "Überprüfung eines Leistungsbescheids nach dem Asylbewerberleistungsgesetz.",
        rechtsgrundlage: "§ 44 SGB X",
        assistantPrompt: "Ich möchte einen Überprüfungsantrag gegen meinen AsylbLG-Bescheid stellen.",
      },
    ],
    pflichtformulare: [],
  },

  // ─── BAföG ───────────────────────────────────────────────────────────
  {
    traeger: "bafoeg",
    label: "BAföG-Amt (Ausbildungsförderung)",
    sgb: "BAföG",
    formfreieAntraege: [
      {
        id: "baf-vorausleistung",
        titel: "Vorausleistung",
        beschreibung: "Antrag auf Vorausleistung, wenn Eltern keinen Unterhalt zahlen.",
        rechtsgrundlage: "§ 36 BAföG",
        assistantPrompt: "Ich möchte beim BAföG-Amt Vorausleistung beantragen, da meine Eltern keinen Unterhalt zahlen.",
      },
      {
        id: "baf-haertefall",
        titel: "Härtefallantrag",
        beschreibung: "Anerkennung außergewöhnlicher Belastungen/Aufwendungen als Härtefreibetrag beim Elterneinkommen.",
        rechtsgrundlage: "§ 25 Abs. 6 BAföG",
        assistantPrompt: "Ich möchte beim BAföG-Amt einen Härtefallantrag stellen.",
      },
    ],
    pflichtformulare: [
      {
        titel: "BAföG-Erstantrag (FormBlatt 1)",
        beschreibung: "Hauptantrag auf Ausbildungsförderung — offizieller Vordruck erforderlich.",
        url: "https://www.bafög.de",
        quelle: "bafög.de (BMBF)",
      },
    ],
  },

  // ─── Elterngeldstelle ────────────────────────────────────────────────
  {
    traeger: "elterngeld",
    label: "Elterngeldstelle",
    sgb: "BEEG",
    formfreieAntraege: [
      {
        id: "eg-aenderung",
        titel: "Änderung der Elterngeldmonate",
        beschreibung: "Nachträgliche Änderung der Bezugsmonate oder Wechsel zwischen Basiselterngeld und ElterngeldPlus. Muss schriftlich erfolgen — manche Stellen fordern landesspezifische Formulare.",
        rechtsgrundlage: "§ 7 BEEG",
        assistantPrompt: "Ich möchte bei der Elterngeldstelle eine Änderung meiner Elterngeldmonate beantragen.",
      },
    ],
    pflichtformulare: [
      {
        titel: "Elterngeld-Erstantrag",
        beschreibung: "Antrag auf Elterngeld — landesspezifische Formulare (online oder Papier).",
        url: "https://familienportal.de/familienportal/familienleistungen/elterngeld/FAQ/wie-und-wo-beantrage-ich-elterngeld--124626",
        quelle: "Familienportal (BMFSFJ)",
      },
    ],
  },

  // ─── Familienkasse ───────────────────────────────────────────────────
  {
    traeger: "familienkasse",
    label: "Familienkasse (Kindergeld)",
    sgb: "EStG / BKGG",
    formfreieAntraege: [
      {
        id: "fk-ueberpruefung",
        titel: "Korrekturantrag Kindergeld",
        beschreibung: "Korrektur eines bestandskräftigen Kindergeldbescheids wegen neuer Tatsachen oder Rechtsfehlern.",
        rechtsgrundlage: "§ 173 AO",
        assistantPrompt: "Ich möchte bei der Familienkasse einen Korrekturantrag für meinen Kindergeldbescheid stellen, da neue Tatsachen vorliegen bzw. ein Rechtsfehler vorliegt.",
      },
    ],
    pflichtformulare: [
      {
        titel: "Kindergeld-Antrag (KG 1)",
        beschreibung: "Antrag auf Kindergeld — offizieller Vordruck KG 1.",
        url: "https://www.arbeitsagentur.de/familie-und-kinder/kindergeld",
        quelle: "Familienkasse / BA",
      },
      {
        titel: "Kinderzuschlag (KiZ 1)",
        beschreibung: "Antrag auf Kinderzuschlag — Vordruck KiZ 1.",
        url: "https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag-verstehen",
        quelle: "Familienkasse / BA",
      },
    ],
  },

  // ─── Wohngeldstelle ──────────────────────────────────────────────────
  {
    traeger: "wohngeld",
    label: "Wohngeldstelle",
    sgb: "WoGG",
    formfreieAntraege: [
      {
        id: "wg-erhoehung",
        titel: "Erhöhungsantrag",
        beschreibung: "Antrag auf Erhöhung des Wohngelds bei gestiegener Miete oder gesunkenem Einkommen. Ein formloser Antrag wahrt den Leistungsbeginn — die Behörde fordert ggf. den amtlichen Vordruck nach.",
        rechtsgrundlage: "§ 27 WoGG",
        assistantPrompt: "Ich möchte bei der Wohngeldstelle einen Erhöhungsantrag für mein Wohngeld stellen.",
      },
    ],
    pflichtformulare: [
      {
        titel: "Wohngeld-Erstantrag",
        beschreibung: "Antrag auf Wohngeld — kommunale Formulare, meist online verfügbar.",
        url: "https://www.wohngeld.org",
        quelle: "wohngeld.org",
      },
    ],
  },

  // ─── Unfallversicherung (SGB VII) ────────────────────────────────────
  {
    traeger: "unfallversicherung",
    label: "Unfallversicherung (SGB VII)",
    sgb: "SGB VII",
    formfreieAntraege: [
      {
        id: "uv-berufskrankheit",
        titel: "Anerkennung Berufskrankheit",
        beschreibung: "Antrag auf Anerkennung einer Berufskrankheit bei der zuständigen Berufsgenossenschaft.",
        rechtsgrundlage: "§ 9 SGB VII",
        assistantPrompt: "Ich möchte bei meiner Berufsgenossenschaft die Anerkennung einer Berufskrankheit beantragen.",
      },
      {
        id: "uv-verletztengeld",
        titel: "Verletztengeld",
        beschreibung: "Antrag auf Verletztengeld nach einem Arbeitsunfall.",
        rechtsgrundlage: "§ 45 SGB VII",
        assistantPrompt: "Ich möchte bei meiner Berufsgenossenschaft Verletztengeld nach einem Arbeitsunfall beantragen.",
      },
    ],
    pflichtformulare: [],
  },

  // ─── Unterhaltsvorschuss ─────────────────────────────────────────────
  {
    traeger: "unterhaltsvorschuss",
    label: "Unterhaltsvorschuss-Stelle",
    sgb: "UVG",
    formfreieAntraege: [
      {
        id: "uvs-ueberpruefung",
        titel: "Überprüfungsantrag",
        beschreibung: "Überprüfung eines Unterhaltsvorschuss-Bescheids.",
        rechtsgrundlage: "§ 44 SGB X",
        assistantPrompt: "Ich möchte bei der Unterhaltsvorschuss-Stelle einen Überprüfungsantrag stellen.",
      },
    ],
    pflichtformulare: [
      {
        titel: "Erstantrag Unterhaltsvorschuss",
        beschreibung: "Antrag auf Unterhaltsvorschuss — kommunale Formulare beim Jugendamt.",
        url: "https://familienportal.de/familienportal/familienleistungen/unterhaltsvorschuss",
        quelle: "Familienportal (BMFSFJ)",
      },
    ],
  },
];

/**
 * Findet die Anträge einer Behörde nach Träger-Key.
 */
export function getAntraegeByTraeger(traeger: string): BehoerdeAntraege | undefined {
  return ANTRAEGE_KATALOG.find((b) => b.traeger === traeger);
}

/** Gesamtzahl aller formfreien Anträge im Katalog */
export function getFormfreiCount(): number {
  return ANTRAEGE_KATALOG.reduce((sum, b) => sum + b.formfreieAntraege.length, 0);
}
