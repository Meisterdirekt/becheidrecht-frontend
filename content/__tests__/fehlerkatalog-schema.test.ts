import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const KATALOG_PATH = resolve(__dirname, '..', 'behoerdenfehler_logik.json');

interface PrueflogikEntry {
  bedingungen: string[];
  suchbegriffe: string[];
}

interface FehlerEintrag {
  id: string;
  titel: string;
  beschreibung: string;
  rechtsbasis: string[];
  severity: string;
  prueflogik: PrueflogikEntry;
  musterschreiben_hinweis: string;
  severity_beschreibung: string;
}

describe('behoerdenfehler_logik.json — Schema-Validierung', () => {
  let katalog: FehlerEintrag[];

  it('Datei ist valides JSON', () => {
    const raw = readFileSync(KATALOG_PATH, 'utf-8');
    katalog = JSON.parse(raw);
    expect(Array.isArray(katalog)).toBe(true);
  });

  it('Mindestens 120 Eintraege vorhanden', () => {
    const raw = readFileSync(KATALOG_PATH, 'utf-8');
    katalog = JSON.parse(raw);
    expect(katalog.length).toBeGreaterThanOrEqual(120);
  });

  it('Jeder Eintrag hat alle Pflichtfelder mit korrektem Typ', () => {
    const raw = readFileSync(KATALOG_PATH, 'utf-8');
    katalog = JSON.parse(raw);

    for (const eintrag of katalog) {
      expect(typeof eintrag.id, `id fehlt bei ${JSON.stringify(eintrag).slice(0, 80)}`).toBe('string');
      expect(typeof eintrag.titel, `titel fehlt bei ${eintrag.id}`).toBe('string');
      expect(typeof eintrag.beschreibung, `beschreibung fehlt bei ${eintrag.id}`).toBe('string');
      expect(Array.isArray(eintrag.rechtsbasis), `rechtsbasis kein Array bei ${eintrag.id}`).toBe(true);
      expect(typeof eintrag.severity, `severity fehlt bei ${eintrag.id}`).toBe('string');
      expect(typeof eintrag.prueflogik, `prueflogik fehlt bei ${eintrag.id}`).toBe('object');
      expect(typeof eintrag.musterschreiben_hinweis, `musterschreiben_hinweis fehlt bei ${eintrag.id}`).toBe('string');
      expect(typeof eintrag.severity_beschreibung, `severity_beschreibung fehlt bei ${eintrag.id}`).toBe('string');

      for (const norm of eintrag.rechtsbasis) {
        expect(typeof norm, `rechtsbasis-Eintrag kein String bei ${eintrag.id}`).toBe('string');
      }

      expect(Array.isArray(eintrag.prueflogik.bedingungen), `prueflogik.bedingungen fehlt bei ${eintrag.id}`).toBe(true);
      expect(Array.isArray(eintrag.prueflogik.suchbegriffe), `prueflogik.suchbegriffe fehlt bei ${eintrag.id}`).toBe(true);
    }
  });

  it('severity ist immer "hinweis", "wichtig" oder "kritisch"', () => {
    const raw = readFileSync(KATALOG_PATH, 'utf-8');
    katalog = JSON.parse(raw);

    const erlaubt = ['hinweis', 'wichtig', 'kritisch'];
    for (const eintrag of katalog) {
      expect(
        erlaubt.includes(eintrag.severity),
        `Ungueltiger severity "${eintrag.severity}" bei ${eintrag.id}`
      ).toBe(true);
    }
  });

  it('id ist eindeutig (keine Duplikate)', () => {
    const raw = readFileSync(KATALOG_PATH, 'utf-8');
    katalog = JSON.parse(raw);

    const ids = katalog.map((e) => e.id);
    const unique = new Set(ids);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(unique.size, `Duplikate: ${dupes.join(', ')}`).toBe(ids.length);
  });

  it('Kein Eintrag hat leere Pflichtfelder', () => {
    const raw = readFileSync(KATALOG_PATH, 'utf-8');
    katalog = JSON.parse(raw);

    for (const eintrag of katalog) {
      expect(eintrag.id.trim().length, `id leer`).toBeGreaterThan(0);
      expect(eintrag.titel.trim().length, `titel leer bei ${eintrag.id}`).toBeGreaterThan(0);
      expect(eintrag.beschreibung.trim().length, `beschreibung leer bei ${eintrag.id}`).toBeGreaterThan(0);
      expect(eintrag.rechtsbasis.length, `rechtsbasis leer bei ${eintrag.id}`).toBeGreaterThan(0);
      expect(eintrag.musterschreiben_hinweis.trim().length, `musterschreiben_hinweis leer bei ${eintrag.id}`).toBeGreaterThan(0);
    }
  });
});
