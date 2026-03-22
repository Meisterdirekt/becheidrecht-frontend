/**
 * Zentrale Plan-Konfiguration
 *
 * Single Source of Truth fuer alle Abo-Typen, Analysen-Kontingente und Laufzeiten.
 * Wird von Admin-Routes, Mollie-Webhook und Cron-Jobs importiert.
 */

export interface PlanConfig {
  analyses: number;
  /** 0 = Einzel-Kauf ohne Ablaufdatum, >0 = Anzahl Monate */
  months: number;
  label: string;
}

export const PLAN_CONFIG: Record<string, PlanConfig> = {
  single:           { analyses: 1,    months: 0,  label: "Einzel-Analyse" },
  basic:            { analyses: 5,    months: 1,  label: "Basic (5 Analysen/Mo)" },
  standard:         { analyses: 15,   months: 1,  label: "Standard (15 Analysen/Mo)" },
  pro:              { analyses: 50,   months: 1,  label: "Pro (50 Analysen/Mo)" },
  business:         { analyses: 120,  months: 1,  label: "Business (120 Analysen/Mo)" },
  b2b_starter:      { analyses: 300,  months: 12, label: "B2B Starter (300/Jahr)" },
  b2b_professional: { analyses: 1000, months: 12, label: "B2B Professional (1000/Jahr)" },
  b2b_enterprise:   { analyses: 2500, months: 12, label: "B2B Enterprise (2500/Jahr)" },
  b2b_corporate:    { analyses: 6000, months: 12, label: "B2B Corporate (6000/Jahr)" },
};

/** Plan-Name → Anzahl Analysen (Shortcut fuer haeufigen Zugriff) */
export const ANALYSES_MAP: Record<string, number> = Object.fromEntries(
  Object.entries(PLAN_CONFIG).map(([k, v]) => [k, v.analyses]),
);

/** Berechnet das Ablaufdatum basierend auf Plan-Typ */
export function computeExpiresAt(subscriptionType: string): string | null {
  const plan = PLAN_CONFIG[subscriptionType];
  if (!plan || plan.months === 0) return null;
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + plan.months);
  return expiryDate.toISOString();
}
