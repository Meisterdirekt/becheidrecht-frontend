/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

// Sentry nur aktivieren wenn DSN gesetzt ist
const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (sentryDsn) {
  try {
    const { withSentryConfig } = require("@sentry/nextjs");
    module.exports = withSentryConfig(nextConfig, {
      silent: true,
      widenClientFileUpload: true,
      hideSourceMaps: true,
      disableLogger: true,
      // org/project/authToken bewusst weggelassen — verhindert CLI-Aufruf beim Build
      // Fehlerreporting läuft über DSN in sentry.client.config.ts / sentry.server.config.ts
      sourcemaps: {
        disable: true,
      },
    });
  } catch {
    // @sentry/nextjs nicht installiert — normal weitermachen
    module.exports = nextConfig;
  }
} else {
  module.exports = nextConfig;
}
