---
description: Regeln fuer Cron-Endpunkte — Auth, Error-Reporting, GitHub-Issue-Pattern
globs: src/app/api/cron/**/*.ts
---

# Cron-Route Regeln

1. **CRON_SECRET Auth** — Jede Cron-Route prueft als erstes:
   ```ts
   const secret = req.nextUrl.searchParams.get("secret") || req.headers.get("authorization")?.replace("Bearer ", "");
   if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   ```

2. **GitHub Issues** — Findings als GitHub Issue erstellen via `createGitHubIssueManaged` aus `agents/tools/github-issues.ts`. Verhindert Issue-Pile-Up automatisch.

3. **Error-Reporter** — Start/Ende/Fehler ueber `reportInfo`/`reportError` aus `@/lib/error-reporter` loggen.

4. **Timeout** — Vercel Crons haben max 60s (Hobby) / 300s (Pro). Schwere Arbeit frueh abbrechen statt Timeout.

5. **Idempotent** — Crons muessen sicher mehrfach laufen koennen ohne Duplikate oder Seiteneffekte.

6. **vercel.json** — Neuer Cron? Eintrag in `vercel.json` unter `crons` nicht vergessen. Format: `{ "path": "/api/cron/name", "schedule": "cron-expression" }`.
