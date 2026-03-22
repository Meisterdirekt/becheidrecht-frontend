/**
 * Sentry Server-Side Konfiguration (Node.js Runtime)
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    beforeSend(event) {
      // PII-Muster die in keinem Sentry-Event auftauchen dürfen
      const PII_PATTERNS = [
        /\b[A-Z]{2}\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2,4}\b/,  // IBAN
        /\b\d{2}\.\d{2}\.\d{4}\b/,                                         // Datum DD.MM.YYYY
        /\b\d{2}\s\d{6}\s[A-Z]\s\d{3}\b/,                                 // SVN
        /\b\d{2}\s\d{3}\s\d{3}\s\d{3}\b/,                                 // Steuer-ID
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,                // E-Mail
        /(?:\+49|0049)\s*\d[\d\s/\-]{8,14}\d/,                            // Telefon
      ];

      function containsPII(val: unknown): boolean {
        if (typeof val !== "string") return false;
        return PII_PATTERNS.some((p) => p.test(val));
      }

      function sanitizeValue(val: unknown): unknown {
        if (typeof val === "string" && containsPII(val)) return "[PII_REDACTED]";
        return val;
      }

      // Credentials + PII aus extras filtern
      if (event.extra) {
        const sanitized: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(event.extra)) {
          const lower = k.toLowerCase();
          if (lower.includes("key") || lower.includes("secret") || lower.includes("token")) {
            sanitized[k] = "[REDACTED]";
          } else {
            sanitized[k] = sanitizeValue(v);
          }
        }
        event.extra = sanitized;
      }

      // PII aus Breadcrumbs filtern
      const crumbs = event.breadcrumbs?.values;
      if (Array.isArray(crumbs)) {
        for (const crumb of crumbs) {
          if (crumb.message && containsPII(crumb.message)) {
            crumb.message = "[PII_REDACTED]";
          }
          if (crumb.data) {
            for (const [k, v] of Object.entries(crumb.data)) {
              crumb.data[k] = sanitizeValue(v);
            }
          }
        }
      }

      return event;
    },
  });
}
