/**
 * Sentry Edge Runtime Konfiguration (Middleware)
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 0.05,
    beforeSend(event) {
      // Keine Credentials oder API-Keys in Events
      if (event.extra) {
        const sanitized: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(event.extra)) {
          const lower = k.toLowerCase();
          if (lower.includes("key") || lower.includes("secret") || lower.includes("token")) {
            sanitized[k] = "[REDACTED]";
          } else {
            sanitized[k] = v;
          }
        }
        event.extra = sanitized;
      }
      return event;
    },
  });
}
