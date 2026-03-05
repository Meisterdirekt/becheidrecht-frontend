/**
 * Shared Constants für Agent-Tools.
 * Zentral definiert um Duplikation zu vermeiden.
 */

/** Erlaubte Domains für Web-Recherche (AG04) und URL-Abruf */
export const LEGAL_DOMAIN_WHITELIST = [
  "bundessozialgericht.de",
  "bundesverfassungsgericht.de",
  "gesetze-im-internet.de",
  "sozialgerichtsbarkeit.de",
  "bmas.de",
  "arbeitsagentur.de",
];

/** Maximale Zeichenzahl für abgerufene URLs */
export const MAX_FETCH_CHARS = 10_000;

/** Maximale Zeichenzahl für Suchergebnisse */
export const MAX_SEARCH_CONTENT_CHARS = 2_000;

/** Budget-Schwelle in EUR — darüber werden nicht-kritische Agenten übersprungen */
export const BUDGET_LIMIT_EUR = 0.80;

/** Schwelle in EUR ab der AG06 (Prompt-Optimierer) aktiv wird */
export const AG06_COST_TRIGGER_EUR = 0.50;
