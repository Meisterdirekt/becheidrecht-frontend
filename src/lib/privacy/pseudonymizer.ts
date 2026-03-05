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
  email: string[];
  phone: string[];
  bic: string[];
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
    email: [],
    phone: [],
    bic: [],
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
  const bicRegex = /\b[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g;
  pseudonymized = pseudonymized.replace(bicRegex, (match) =>
    pushAndReplace(map, 'bic', match, '[BIC')
  );

  // SOZIALVERSICHERUNGSNUMMERN (verschiedene Formate)
  const svnRegex = /\b(\d{2}\s?\d{6}\s?[A-Z]\s?\d{3})\b/g;
  pseudonymized = pseudonymized.replace(svnRegex, (match) =>
    pushAndReplace(map, 'socialSecurityNumber', match, '[SV_NUMMER')
  );

  const svn2Regex = /\b\d{12}\b/g; // 12-stellige Rentenversicherungsnummer
  pseudonymized = pseudonymized.replace(svn2Regex, (match) =>
    pushAndReplace(map, 'socialSecurityNumber', match, '[SV_NUMMER')
  );

  // STEUER-IDs (11 Ziffern, nur wenn Kontext „Steuer“/„Id“ in Nähe – sonst zu viele False Positives)
  // Fallback: 11 Ziffern in typischen ID-Kontexten (nach „Nr.“, „Nummer“, „ID“, etc.)
  const taxIdRegex = /\b(\d{3}\s?\d{3}\s?\d{3}\s?\d{2})\b/g; // Format mit Leerzeichen
  pseudonymized = pseudonymized.replace(taxIdRegex, (match) =>
    pushAndReplace(map, 'taxId', match, '[STEUER_ID')
  );

  const taxIdCompactRegex = /(?:Steuer-?ID|IdNr|Identifikationsnummer|Steueridentifikationsnummer)[:\s]*(\d{11})\b/gi;
  pseudonymized = pseudonymized.replace(taxIdCompactRegex, (_, id) =>
    pushAndReplace(map, 'taxId', id, '[STEUER_ID')
  );

  const taxIdStandaloneRegex = /\b(\d{11})\b/g;
  pseudonymized = pseudonymized.replace(taxIdStandaloneRegex, (match) =>
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
      pushAndReplace(map, 'birthdate', match, '[GEBURTSDATUM')
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

  // PLZ + Ort
  const plzOrtRegex = /\b(\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)?)\b/g;
  pseudonymized = pseudonymized.replace(plzOrtRegex, (match) =>
    pushAndReplace(map, 'address', match, '[PLZ_ORT')
  );

  // NAMEN "NACHNAME, Vorname" (vor Standard-Namen)
  const nameCommaRegex = /\b([A-ZÄÖÜ][a-zäöüß]{2,},\s*[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*)\b/g;
  pseudonymized = pseudonymized.replace(nameCommaRegex, (match) =>
    pushAndReplace(map, 'name', match, '[NAME')
  );

  // NAMEN (Vor- und Nachnamen, Vorname Nachname)
  const nameRegex = /\b([A-ZÄÖÜ][a-zäöüß]{1,}(?:\s+[A-ZÄÖÜ][a-zäöüß]{1,})+)\b/g;
  pseudonymized = pseudonymized.replace(nameRegex, (match) =>
    pushAndReplace(map, 'name', match, '[NAME')
  );

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
    const placeholder = `[GEBURTSDATUM_${index + 1}]`;
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

  map.email.forEach((original, index) => {
    depseudonymized = depseudonymized.replace(re(`[E_MAIL_${index + 1}]`), original);
  });

  map.phone.forEach((original, index) => {
    depseudonymized = depseudonymized.replace(re(`[TELEFON_${index + 1}]`), original);
  });

  map.bic.forEach((original, index) => {
    depseudonymized = depseudonymized.replace(re(`[BIC_${index + 1}]`), original);
  });

  return depseudonymized;
}

function re(s: string): RegExp {
  return new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
}
