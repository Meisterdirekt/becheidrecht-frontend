import { describe, it, expect } from 'vitest';
import { pseudonymizeText, depseudonymizeText } from './pseudonymizer';

describe('pseudonymizer', () => {
  it('Namen werden pseudonymisiert', () => {
    const text = 'Max Mustermann wohnt in Berlin.';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[NAME_1]');
    expect(map.name[0]).toBe('Max Mustermann');
  });

  it('Geburtsdaten werden pseudonymisiert', () => {
    const text = 'Geboren am 01.01.1990';
    const { pseudonymized, map } = pseudonymizeText(text);
    expect(pseudonymized).toContain('[GEBURTSDATUM_1]');
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
});
