import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Berechnet die verbleibenden Tage bis zum Fristdatum.
 * Exakt dieselbe Logik wie in /api/fristen/route.ts (Zeilen 66-72).
 */
export function berechneTageVerbleibend(fristDatum: string): number {
  const fristDate = new Date(fristDatum);
  if (isNaN(fristDate.getTime())) {
    throw new Error(`Ungueltiges Datum: "${fristDatum}"`);
  }
  fristDate.setHours(0, 0, 0, 0);

  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  return Math.ceil(
    (fristDate.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24)
  );
}

describe('berechneTageVerbleibend', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-03T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Frist in 14 Tagen ergibt 14', () => {
    expect(berechneTageVerbleibend('2026-03-17')).toBe(14);
  });

  it('Frist heute ergibt 0', () => {
    expect(berechneTageVerbleibend('2026-03-03')).toBe(0);
  });

  it('Frist abgelaufen ergibt negative Zahl', () => {
    expect(berechneTageVerbleibend('2026-02-28')).toBe(-3);
  });

  it('Frist morgen ergibt 1', () => {
    expect(berechneTageVerbleibend('2026-03-04')).toBe(1);
  });

  it('Frist gestern ergibt -1', () => {
    expect(berechneTageVerbleibend('2026-03-02')).toBe(-1);
  });

  it('Frist in 30 Tagen', () => {
    expect(berechneTageVerbleibend('2026-04-02')).toBe(30);
  });

  it('Ungueltiges Datum wirft Fehler', () => {
    expect(() => berechneTageVerbleibend('kein-datum')).toThrowError(
      'Ungueltiges Datum: "kein-datum"'
    );
  });

  it('Leerer String wirft Fehler', () => {
    expect(() => berechneTageVerbleibend('')).toThrowError('Ungueltiges Datum');
  });
});
