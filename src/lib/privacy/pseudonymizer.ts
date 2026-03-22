/**
 * Pseudonymisierung personenbezogener Daten für die Bescheid-Analyse.
 * Sensible Daten werden vor der KI-Verarbeitung durch Platzhalter ersetzt.
 * NIEMALS echte sensible Daten in Logs oder Konsole ausgeben.
 * Vollständige Abdeckung zur Minimierung von Restrisiken.
 */

export interface PseudonymizationMap {
  name: string[];
  address: string[];
  birthdate: string[];
  bankAccount: string[];
  taxId: string[];
  socialSecurityNumber: string[];
  healthInsuranceNumber: string[];
  email: string[];
  phone: string[];
  bic: string[];
  caseNumber: string[];
}

function pushAndReplace<T extends keyof PseudonymizationMap>(
  map: PseudonymizationMap,
  key: T,
  match: string,
  placeholderPrefix: string
): string {
  const arr = map[key] as string[];
  if (!arr.includes(match)) arr.push(match);
  return `${placeholderPrefix}_${arr.indexOf(match) + 1}]`;
}

export function pseudonymizeText(text: string): {
  pseudonymized: string;
  map: PseudonymizationMap;
} {
  const map: PseudonymizationMap = {
    name: [],
    address: [],
    birthdate: [],
    bankAccount: [],
    taxId: [],
    socialSecurityNumber: [],
    healthInsuranceNumber: [],
    email: [],
    phone: [],
    bic: [],
    caseNumber: [],
  };

  let pseudonymized = text;

  // Reihenfolge: Spezifische Muster zuerst, um Überlappungen zu vermeiden

  // E-MAIL
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  pseudonymized = pseudonymized.replace(emailRegex, (match) =>
    pushAndReplace(map, 'email', match, '[E_MAIL')
  );

  // IBAN vor Telefon (sonst wird Teil der IBAN als Telefon erkannt)
  const ibanRegex = /\b(DE\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}|AT\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}|CH\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4})\b/gi;
  pseudonymized = pseudonymized.replace(ibanRegex, (match) =>
    pushAndReplace(map, 'bankAccount', match, '[IBAN')
  );

  // TELEFONNUMMERN (DE: +49, 0049, 0xxx – nach IBAN)
  const phoneRegex = /(?:\+49|0049)\s*\d[\d\s\/\-]{8,14}\d|\b0[2-9]\d{1,3}\s?\d[\d\s\/\-]{5,12}\d\b/g;
  pseudonymized = pseudonymized.replace(phoneRegex, (match) =>
    pushAndReplace(map, 'phone', match, '[TELEFON')
  );

  // BIC/SWIFT (8 oder 11 Zeichen, alphanumerisch)
  // Kontext-gebunden: nur nach "BIC", "SWIFT", "BLZ" oder am Ende eines Bankdaten-Blocks
  const bicRegex = /(?:BIC|SWIFT|BIC-Code|Bankleitzahl)[:\s]+([A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?)\b/gi;
  pseudonymized = pseudonymized.replace(bicRegex, (full, bic) =>
    full.replace(bic, pushAndReplace(map, 'bic', bic, '[BIC'))
  );
  // Standalone BIC nur wenn genau 8 oder 11 Zeichen und nicht reines Wort (mind. 1 Ziffer oder lowercase-Mix)
  const bicStandaloneRegex = /\b([A-Z]{4}[A-Z]{2}[A-Z0-9]{2}[A-Z0-9]{3})\b/g;
  pseudonymized = pseudonymized.replace(bicStandaloneRegex, (match) => {
    // Filtere reine Großbuchstaben-Wörter ohne Ziffer (z. B. "JOBCENTER", "BESCHEID")
    if (/\d/.test(match) || match.length === 8) {
      return pushAndReplace(map, 'bic', match, '[BIC');
    }
    return match;
  });

  // SOZIALVERSICHERUNGSNUMMERN (verschiedene Formate)
  const svnRegex = /\b(\d{2}\s?\d{6}\s?[A-Z]\s?\d{3})\b/g;
  pseudonymized = pseudonymized.replace(svnRegex, (match) =>
    pushAndReplace(map, 'socialSecurityNumber', match, '[SV_NUMMER')
  );

  const svn2Regex = /\b\d{12}\b/g; // 12-stellige Rentenversicherungsnummer
  pseudonymized = pseudonymized.replace(svn2Regex, (match) =>
    pushAndReplace(map, 'socialSecurityNumber', match, '[SV_NUMMER')
  );

  // KRANKENVERSICHERUNGSNUMMERN (GKV: Buchstabe + 9 Ziffern, z.B. A123456789)
  // Kontextgebunden: nach Schlüsselwörtern wie "Versichertennummer", "KV-Nr", etc.
  const kvContextRegex = /(?:Versichertennummer|Versicherungsnummer|KV-?Nr\.?|Krankenversicherung(?:snummer)?|Mitgliedsnummer|KV-Nummer)[:\s]+([A-Z]\d{9})\b/gi;
  pseudonymized = pseudonymized.replace(kvContextRegex, (full, nr) =>
    full.replace(nr, pushAndReplace(map, 'healthInsuranceNumber', nr, '[KV_NUMMER'))
  );
  // Standalone: Buchstabe + exakt 9 Ziffern (häufiges GKV-Format)
  const kvStandaloneRegex = /\b([A-Z]\d{9})\b/g;
  pseudonymized = pseudonymized.replace(kvStandaloneRegex, (match) =>
    pushAndReplace(map, 'healthInsuranceNumber', match, '[KV_NUMMER')
  );

  // STEUER-IDs (11 Ziffern in allen gängigen Formaten)
  // Format 1: Nach Kontext-Schlüsselwort (mit oder ohne Leerzeichen in der Nummer)
  const taxIdContextRegex = /(?:Steuer-?ID|Steuer-?Identifikationsnummer|IdNr\.?|Identifikationsnummer|St\.-?Nr\.?|Steuernummer)[:\s]*(\d[\d\s]{9,14}\d)/gi;
  pseudonymized = pseudonymized.replace(taxIdContextRegex, (full, id) => {
    const digits = id.replace(/\s/g, '');
    if (digits.length === 11) {
      return full.replace(id, pushAndReplace(map, 'taxId', id.trim(), '[STEUER_ID'));
    }
    return full;
  });

  // Format 2: Typisches DE-Steuer-ID-Muster — 2+3+3+3 oder 3+3+3+2 mit optionalen Leerzeichen
  const taxIdSpacedRegex = /\b(\d{2}\s\d{3}\s\d{3}\s\d{3}|\d{3}\s\d{3}\s\d{3}\s\d{2})\b/g;
  pseudonymized = pseudonymized.replace(taxIdSpacedRegex, (match) =>
    pushAndReplace(map, 'taxId', match, '[STEUER_ID')
  );

  // Format 3: Kompakt 11 Ziffern ohne Leerzeichen
  const taxIdCompactRegex = /\b(\d{11})\b/g;
  pseudonymized = pseudonymized.replace(taxIdCompactRegex, (match) =>
    pushAndReplace(map, 'taxId', match, '[STEUER_ID')
  );

  // GEBURTSDATEN (alle gängigen Formate)
  const birthdateFormats = [
    /\b(\d{1,2}\.\d{1,2}\.\d{4})\b/g,
    /\b(\d{4}-\d{2}-\d{2})\b/g,
    /\b(\d{1,2}-\d{1,2}-\d{4})\b/g,
    /\b(\d{1,2}\s+(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s+\d{4})\b/gi,
  ];
  for (const re of birthdateFormats) {
    pseudonymized = pseudonymized.replace(re, (match) =>
      pushAndReplace(map, 'birthdate', match, '[DATUM')
    );
  }

  // ADRESSEN (Straße + Hausnummer, diverse Endungen)
  const addressRegex = /\b([A-ZÄÖÜ][a-zäöüß]*(?:straße|str\.|strasse|weg|allee|platz|gasse|ring|damm|ufer|steig|pfad)\s+\d{1,4}[a-z]?)\b/gi;
  pseudonymized = pseudonymized.replace(addressRegex, (match) =>
    pushAndReplace(map, 'address', match, '[ADRESSE')
  );

  const addressNrRegex = /\b([A-ZÄÖÜ][a-zäöüß]+\s+(?:Nr\.?|Hausnummer|Hnr\.?)\s*\d{1,4}[a-z]?)\b/gi;
  pseudonymized = pseudonymized.replace(addressNrRegex, (match) =>
    pushAndReplace(map, 'address', match, '[ADRESSE')
  );

  // PLZ + Ort (nur horizontaler Whitespace, kein Newline — verhindert Aktenzeichen-Matches)
  const plzOrtRegex = /\b(\d{5}[ \t]+[A-ZÄÖÜ][a-zäöüß]{3,}(?:[ \t]+[A-ZÄÖÜ][a-zäöüß]{2,})?)\b/g;
  pseudonymized = pseudonymized.replace(plzOrtRegex, (match) =>
    pushAndReplace(map, 'address', match, '[PLZ_ORT')
  );

  // AKTENZEICHEN — spezifische Muster ZUERST (vor Kontext-Regex, sonst werden sie verschluckt)

  // Standalone Jobcenter-Aktenzeichen (JC-YYYY-NNNNNN)
  const caseNumberJCRegex = /\bJC-\d{4}-\d{4,8}\b/g;
  pseudonymized = pseudonymized.replace(caseNumberJCRegex, (match) =>
    pushAndReplace(map, 'caseNumber', match, '[AKTENZEICHEN')
  );

  // Sozialgerichts-Aktenzeichen (S 32 AS 1234/24, L 7 AS 123/25, B 14 AS 1/23 R)
  const caseNumberCourtRegex = /\b[SLB]\s+\d{1,3}\s+[A-Z]{2,3}\s+\d{1,5}\/\d{2,4}(?:\s+[A-Z]{1,3})?\b/g;
  pseudonymized = pseudonymized.replace(caseNumberCourtRegex, (match) =>
    pushAndReplace(map, 'caseNumber', match, '[AKTENZEICHEN')
  );

  // Kontext-Aktenzeichen (nach Schlüsselwörtern — generischer Fallback)
  // Überspringe Matches die bereits einen Platzhalter enthalten (von spezifischeren Regexes oben)
  const caseNumberContextRegex = /(?:Aktenzeichen|Az\.?|Geschäftszeichen|Gz\.?|Unser Zeichen|Ihr Zeichen|BG-Nr\.?|Vorgangsnummer|Kundennummer)[:\s]+([^\n,;]{3,30})/gi;
  pseudonymized = pseudonymized.replace(caseNumberContextRegex, (full, id) => {
    if (/\[AKTENZEICHEN_\d+\]/.test(id)) return full;
    return full.replace(id, pushAndReplace(map, 'caseNumber', id.trim(), '[AKTENZEICHEN'));
  });

  // Häufige deutsche Wörter/Begriffe die KEINE Namen sind (Behörden-Sprache)
  const NO_NAME = new Set([
    // Anreden / Grußformeln
    'Sehr','Geehrte','Geehrter','Geehrten','Damen','Herren','Freundlichen','Grüßen',
    'Hochachtungsvoll','Mit','Bitte','Danke','Liebe','Lieber',
    // Deutsche Artikel / Pronomen / Adjektive (Satzanfang)
    'Eine','Einen','Einem','Einer','Eines',
    'Der','Die','Das','Dem','Den','Des',
    'Ein','Kein','Keine','Keinen','Keinem','Keiner',
    'Ihrer','Ihrem','Ihren','Ihres','Ihre','Ihr','Sie','Ihnen',
    'Dieser','Diese','Dieses','Diesem','Diesen',
    'Alle','Allen','Allem','Aller',
    'Gegen','Auf','Über','Unter','Nach','Vor','Bei','Seit',
    'Ordnungsgemäße','Ordnungsgemäßen','Vollständige','Vollständigen',
    'Fehlende','Fehlenden','Falsche','Falschen',
    // Behörden-Substantive
    'Bescheid','Hinweis','Begründung','Rechtsbehelfsbelehrung','Sachbearbeiter',
    'Aktenzeichen','Zeitraum','Leistungen','Leistung','Antrag','Widerspruch',
    'Anhörung','Zustellung','Bekanntgabe','Bewilligung','Festsetzung',
    'Widerspruchsfrist','Klagefrist','Einspruchsfrist','Rechtsmittelfrist',
    'Anspruch','Ansprüche','Kosten','Regelbedarf','Regelbedarfsstufe',
    'Unterkunft','Heizung','Warmwasser','Gesamtleistung','Monatlich',
    'Antragsteller','Bearbeiter','Bearbeiterin',
    // Behörden-Institutionen
    'Jobcenter','Bundesagentur','Rentenversicherung','Krankenkasse','Pflegekasse',
    'Sozialamt','Versorgungsamt','Familienkasse','Jugendamt','Finanzamt',
    'Bundessozialgericht','Sozialgericht','Verwaltungsgericht','Landessozialgericht',
    // Rechtsbegriffe
    'Sozialgesetzbuch','Grundgesetz','Zweiten','Dritten','Ersten','Zweites',
    'Drittes','Erstes','Viertes','Fünftes','Buch',
    // Monate / Wochentage
    'Januar','Februar','März','April','Mai','Juni','Juli','August',
    'September','Oktober','November','Dezember',
    'Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag',
    // Richtungsangaben / Straßenzusätze
    'Nord','Süd','West','Ost','Mitte','Straße','Platz','Weg','Ring','Allee','Damm',
    // Häufige Städtenamen
    'Dortmund','Berlin','Hamburg','München','Köln','Frankfurt','Stuttgart',
    'Düsseldorf','Leipzig','Dresden','Hannover','Nürnberg','Duisburg','Bochum',
    // Sonstiges
    'Telefon','Fax','Datum','Ort','Seite',
  ]);

  function isName(word: string): boolean {
    return !NO_NAME.has(word);
  }

  // Adelspräfixe — zählen als Namensteil, obwohl sie klein geschrieben sind
  const ADELS_PRAEFIXE = ['von', 'van', 'de', 'zu', 'vom', 'zum', 'zur', 'der', 'den', 'ten'];
  const adelsSet = new Set(ADELS_PRAEFIXE);

  // Namens-Segment: Groß-Buchstabe + Kleinbuchstaben, optional mit Bindestrich-Teil
  const nameSeg = '[A-ZÄÖÜ][a-zäöüß]+(?:-[A-ZÄÖÜ][a-zäöüß]+)*';
  // Adelspräfix-Segment: optionale Kette von Kleinbuchstaben-Wörtern (von, der, zu, ...)
  const adelsSeg = `(?:(?:${ADELS_PRAEFIXE.join('|')})[ \\t]+)*`;

  // NAMEN "NACHNAME, Vorname" — Komma-Format (z.B. "Maier-Schulze, Karl-Heinz")
  // Stoppt vor Anrede-Wörtern damit "Hoffmann, Herr Karl" nicht als ein Name gematcht wird
  const ANREDE_STOP = '(?:Herr|Frau|Sachbearbeiter|Antragsteller(?:in)?|Bearbeiter(?:in)?)';
  const nameCommaRegex = new RegExp(`\\b(${nameSeg},[ \\t]*(?!${ANREDE_STOP}\\b)${adelsSeg}${nameSeg}(?:[ \\t]+(?!${ANREDE_STOP}\\b)${adelsSeg}${nameSeg})*)`, 'g');
  pseudonymized = pseudonymized.replace(nameCommaRegex, (match) => {
    const firstWord = match.split(/[-,\s]/)[0];
    return isName(firstWord) ? pushAndReplace(map, 'name', match, '[NAME') : match;
  });

  // NAMEN nach expliziten Kontext-Signalen: "Herr/Frau X", "Sachbearbeiter: X Y"
  // Unterstützt Adelspräfixe: "Herr Karl-Heinz von der Heide"
  const nameContextRegex = new RegExp(
    `(?:(?:Herr|Frau|Sachbearbeiter|Antragsteller(?:in)?|Bearbeiter(?:in)?)[ \\t]+)(${adelsSeg}${nameSeg}(?:[ \\t]+${adelsSeg}${nameSeg})*)`,
    'g'
  );
  pseudonymized = pseudonymized.replace(nameContextRegex, (full, name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.every((p: string) => adelsSet.has(p) || isName(p.split('-')[0]))) {
      return full.replace(name, pushAndReplace(map, 'name', name.trim(), '[NAME'));
    }
    return full;
  });

  // NAMEN im "Vorname Nachname"-Format (kein Match über Zeilenumbrüche)
  // Unterstützt Adelspräfixe: "Karl-Heinz von der Heide"
  const nameRegex = new RegExp(`\\b(${nameSeg}(?:[ \\t]+${adelsSeg}${nameSeg})+)\\b`, 'g');
  pseudonymized = pseudonymized.replace(nameRegex, (match) => {
    const parts = match.split(/\s+/);
    if (parts.length >= 2 && parts.every((p: string) => adelsSet.has(p) || isName(p.split('-')[0]))) {
      return pushAndReplace(map, 'name', match, '[NAME');
    }
    return match;
  });

  return { pseudonymized, map };
}

export function depseudonymizeText(
  text: string,
  map: PseudonymizationMap
): string {
  let depseudonymized = text;

  map.name.forEach((original, index) => {
    const placeholder = `[NAME_${index + 1}]`;
    depseudonymized = depseudonymized.replace(
      new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      original
    );
  });

  map.birthdate.forEach((original, index) => {
    const placeholder = `[DATUM_${index + 1}]`;
    depseudonymized = depseudonymized.replace(
      new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      original
    );
  });

  map.address.forEach((original, index) => {
    const placeholder1 = `[ADRESSE_${index + 1}]`;
    const placeholder2 = `[PLZ_ORT_${index + 1}]`;
    const re = (s: string) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    depseudonymized = depseudonymized
      .replace(re(placeholder1), original)
      .replace(re(placeholder2), original);
  });

  map.bankAccount.forEach((original, index) => {
    const placeholder = `[IBAN_${index + 1}]`;
    depseudonymized = depseudonymized.replace(
      new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      original
    );
  });

  map.taxId.forEach((original, index) => {
    const placeholder = `[STEUER_ID_${index + 1}]`;
    depseudonymized = depseudonymized.replace(
      new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      original
    );
  });

  map.socialSecurityNumber.forEach((original, index) => {
    const placeholder = `[SV_NUMMER_${index + 1}]`;
    depseudonymized = depseudonymized.replace(re(placeholder), original);
  });

  map.healthInsuranceNumber.forEach((original, index) => {
    depseudonymized = depseudonymized.replace(re(`[KV_NUMMER_${index + 1}]`), original);
  });

  map.email.forEach((original, index) => {
    depseudonymized = depseudonymized.replace(re(`[E_MAIL_${index + 1}]`), original);
  });

  map.phone.forEach((original, index) => {
    depseudonymized = depseudonymized.replace(re(`[TELEFON_${index + 1}]`), original);
  });

  map.bic.forEach((original, index) => {
    depseudonymized = depseudonymized.replace(re(`[BIC_${index + 1}]`), original);
  });

  map.caseNumber.forEach((original, index) => {
    depseudonymized = depseudonymized.replace(re(`[AKTENZEICHEN_${index + 1}]`), original);
  });

  return depseudonymized;
}

function re(s: string): RegExp {
  return new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
}
