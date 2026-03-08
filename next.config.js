/** @type {import('next').NextConfig} */
const nextConfig = {};

// Sentry nur aktivieren wenn DSN gesetzt ist
const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (sentryDsn) {
  try {
    const { withSentryConfig } = require("@sentry/nextjs");
    module.exports = withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      widenClientFileUpload: true,
      hideSourceMaps: true,
      disableLogger: true,
    });
  } catch {
    // @sentry/nextjs nicht installiert — normal weitermachen
    module.exports = nextConfig;
  }
} else {
  module.exports = nextConfig;
}
