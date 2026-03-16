# INFRASTRUCTURE.md — BescheidRecht

Infra- und Monitoring-Konfiguration. Wird von Claude Code **nicht** automatisch geladen.
Nur relevant für Cron-Debugging, Deployment-Checks und Monitoring-Setup.

---

## Infrastruktur-Env-Vars

```
VERCEL_TOKEN                   # Vercel API (AG16 Deployment-Check)
VERCEL_TEAM_ID                 # Vercel Team-ID
GITHUB_TOKEN                   # GitHub API (AG15/AG16/AG17 Issues/PRs)
GITHUB_REPO                    # Format: owner/repo
CLOUDFLARE_DOMAIN              # Cloudflare Domain
CLOUDFLARE_TOKEN               # Cloudflare API-Token
UPSTASH_REDIS_REST_URL         # Redis für Rate-Limiting (rate-limit.ts)
UPSTASH_REDIS_REST_TOKEN       # Redis Auth-Token
```

## Monitoring-Env-Vars

```
SENTRY_DSN                     # Sentry Error-Tracking
NEXT_PUBLIC_SENTRY_DSN         # Sentry Client-Side (gleicher Wert wie SENTRY_DSN)
SENTRY_AUTH_TOKEN              # Sentry Release-Upload
SENTRY_ORG                     # Sentry Organisation
SENTRY_PROJECT                 # Sentry Projektname
SENTRY_URL                     # Sentry URL
NEXT_PUBLIC_APP_URL            # Produktions-URL für Lighthouse-Audit (https://bescheidrecht.de)
PAGESPEED_API_KEY              # Google PageSpeed Insights API Key (optional, ohne Key: 25 req/Tag limit)
```

## GitHub Actions Secrets

In Repo → Settings → Secrets:

```
ANTHROPIC_API_KEY              # Für AG-CRITIC automatisches PR-Review
NEXT_PUBLIC_SUPABASE_URL       # Für Build-Job
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Für Build-Job
CRON_SECRET                    # Für Cron-Endpunkte
NEXT_PUBLIC_APP_URL            # Für Lighthouse
```