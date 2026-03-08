/**
 * Sentry Client-Side Konfiguration
 * Wird automatisch von @sentry/nextjs geladen wenn vorhanden.
 *
 * Setup:
 * 1. npm install @sentry/nextjs
 * 2. SENTRY_DSN in .env.local setzen (von sentry.io → Projekt → Settings → Client Keys)
 * 3. next.config.js nutzt withSentryConfig Wrapper (bereits konfiguriert)
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,   // DSGVO: kein Nutzertext im Replay
        blockAllMedia: true,
      }),
    ],
    beforeSend(event) {
      // Keine PII weiterleiten
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });
}
