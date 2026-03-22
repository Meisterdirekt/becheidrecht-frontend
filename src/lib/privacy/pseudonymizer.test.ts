import { describe, it, expect } from 'vitest';
import { pseudonymizeText, depseudonymizeText } from './pseudonymizer';

describe('pseudonymizer', () => {
  it('Namen werden pseudonymisiert', () => {
    const text = 'Max Mustermann wohnt in Berlin.';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[NAME_1]');
    expect(map.name[0]).toBe('Max Mustermann');
  });

  it('Geburtsdaten werden als DATUM pseudonymisiert', () => {
    const text = 'Geboren am 01.01.1990';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[DATUM_1]');
    expect(map.birthdate[0]).toBe('01.01.1990');
  });

  it('De-Pseudonymisierung stellt Original wieder her', () => {
    const original = 'Max Mustermann, geb. 01.01.1990';
    const { pseudonymized, map } = pseudonymizeText(original);
    const restored = depseudonymizeText(pseudonymized, map);
    expect(restored).toBe(original);
  });

  it('IBAN wird pseudonymisiert', () => {
    const text = 'Kontonummer: DE89 3704 0044 0532 0130 00';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[IBAN_1]');
    expect(map.bankAccount.length).toBeGreaterThanOrEqual(1);
  });

  it('Mehrere Namen werden nacheinander pseudonymisiert', () => {
    const text = 'Antragsteller: Max Mustermann. Ehepartner: Maria Müller.';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[NAME_1]');
    expect(pseudonymized).toContain('[NAME_2]');
    expect(map.name).toContain('Max Mustermann');
    expect(map.name).toContain('Maria Müller');
  });

  it('E-Mail wird pseudonymisiert', () => {
    const text = 'Kontakt: max.mustermann@example.de';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[E_MAIL_1]');
    expect(map.email[0]).toBe('max.mustermann@example.de');
  });

  it('Telefonnummer wird pseudonymisiert', () => {
    const text = 'Rufen Sie uns an: +49 123 456789';
    const { pseudonymized } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[TELEFON_1]');
  });

  it('Leerer Text bleibt unverändert', () => {
    const text = '';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toBe('');
    expect(map.name).toHaveLength(0);
  });

  // --- Neue Tests ---

  it('Zusammengesetzte Namen (Doppelname) werden erkannt', () => {
    const text = 'Frau Maria-Anna Schreiber-Hoffmann hat Widerspruch eingelegt.';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[NAME_1]');
    expect(map.name[0]).toBe('Maria-Anna Schreiber-Hoffmann');
  });

  it('Aktenzeichen nach Kontext-Schlüsselwort werden pseudonymisiert', () => {
    // Generisches Aktenzeichen (kein JC-Format) — nur Kontext-Regex
    const text = 'Aktenzeichen: 456-789-2024, Bescheid vom 01.01.2025';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[AKTENZEICHEN_1]');
    expect(map.caseNumber[0]).toBe('456-789-2024');
  });

  it('Standalone JC-Aktenzeichen werden pseudonymisiert', () => {
    const text = 'Ihr Vorgang JC-2024-001234 wurde bearbeitet.';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[AKTENZEICHEN_1]');
    expect(map.caseNumber).toContain('JC-2024-001234');
  });

  it('Sozialgerichts-Aktenzeichen werden pseudonymisiert', () => {
    const text = 'Verfahren S 32 AS 1234/24 am Sozialgericht Dortmund.';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[AKTENZEICHEN_1]');
    expect(map.caseNumber[0]).toBe('S 32 AS 1234/24');
  });

  it('Namen matchen NICHT über Zeilenumbrüche', () => {
    const text = 'Sachbearbeiter: Karl-Heinz Weber\nFrau Maria-Anna Schreiber-Hoffmann';
    const { pseudonymized, map } = pseudonymizeText(text);
    // Jeder Name muss einzeln erkannt werden, nicht als ein Block über \n
    expect(map.name).toContain('Karl-Heinz Weber');
    expect(map.name).toContain('Maria-Anna Schreiber-Hoffmann');
    // Kein Name darf \n enthalten
    for (const name of map.name) {
      expect(name).not.toContain('\n');
    }
  });

  it('Steuernummer wird pseudonymisiert', () => {
    const text = 'Steuer-ID: 12 345 678 901';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[STEUER_ID_1]');
    expect(map.taxId.length).toBeGreaterThanOrEqual(1);
  });

  it('Sozialversicherungsnummer wird pseudonymisiert', () => {
    const text = 'Versicherungsnummer: 12 070680 T 123';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[SV_NUMMER_1]');
    expect(map.socialSecurityNumber.length).toBe(1);
  });

  it('Adresse mit PLZ + Ort wird pseudonymisiert', () => {
    const text = 'Wohnhaft: Hauptstraße 42a, 12345 Berlin';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[ADRESSE_1]');
    expect(pseudonymized).toContain('[PLZ_ORT_');
    expect(map.address).toContain('Hauptstraße 42a');
  });

  it('Aktenzeichen Round-Trip (de-pseudonymisierung)', () => {
    const original = 'Aktenzeichen: 456-789-2024';
    const { pseudonymized, map } = pseudonymizeText(original);
    const restored = depseudonymizeText(pseudonymized, map);
    expect(restored).toBe(original);
  });

  it('JC-Aktenzeichen Round-Trip', () => {
    const original = 'Ihr Vorgang JC-2024-001234 wurde bearbeitet.';
    const { pseudonymized, map } = pseudonymizeText(original);
    const restored = depseudonymizeText(pseudonymized, map);
    expect(restored).toBe(original);
  });

  it('Bescheiddatum wird als DATUM erkannt (nicht GEBURTSDATUM)', () => {
    const text = 'Bescheid vom 01.01.2025';
    const { pseudonymized } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[DATUM_1]');
    expect(pseudonymized).not.toContain('GEBURTSDATUM');
  });

  it('Adelspräfixe werden als Namensteil erkannt', () => {
    const text = 'Herr Karl-Heinz von der Heide hat Widerspruch eingelegt.';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[NAME_1]');
    expect(map.name[0]).toBe('Karl-Heinz von der Heide');
    expect(pseudonymized).not.toContain('von der Heide');
  });

  it('Komma-Regex stoppt vor Anrede-Wörtern', () => {
    const text = 'Frau Maria-Anna Schreiber-Hoffmann, Herr Karl-Heinz Weber';
    const { pseudonymized, map } = pseudonymizeText(text);
    // Beide Namen separat erkannt, nicht als ein Block
    expect(map.name).toContain('Maria-Anna Schreiber-Hoffmann');
    expect(map.name).toContain('Karl-Heinz Weber');
    // Kein Name enthält "Herr" oder "Frau"
    for (const name of map.name) {
      expect(name).not.toMatch(/\bHerr\b/);
      expect(name).not.toMatch(/\bFrau\b/);
    }
  });

  it('Krankenversicherungsnummer (GKV) wird pseudonymisiert', () => {
    const text = 'Versichertennummer: A123456789';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[KV_NUMMER_1]');
    expect(map.healthInsuranceNumber[0]).toBe('A123456789');
  });

  it('Standalone GKV-Nummer wird erkannt', () => {
    const text = 'Ihre Nummer ist A987654321, bitte angeben.';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[KV_NUMMER_1]');
    expect(map.healthInsuranceNumber).toContain('A987654321');
  });

  it('KV-Nummer Round-Trip', () => {
    const original = 'KV-Nr: A123456789';
    const { pseudonymized, map } = pseudonymizeText(original);
    const restored = depseudonymizeText(pseudonymized, map);
    expect(restored).toBe(original);
  });

  it('Adelspräfix-Name Round-Trip', () => {
    const original = 'Herr Ludwig van den Berg hat Einspruch erhoben.';
    const { pseudonymized, map } = pseudonymizeText(original);
    const restored = depseudonymizeText(pseudonymized, map);
    expect(restored).toBe(original);
  });
});
