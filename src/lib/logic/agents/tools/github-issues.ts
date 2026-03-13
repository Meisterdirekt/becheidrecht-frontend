/**
 * Shared GitHub Issue Management — Auto-Close + Deduplication + Create
 *
 * Wird von allen Issue-erstellenden Agenten verwendet (AG-BACKEND, AG-COSTS,
 * AG-DESIGNER, AG17, AG18, AG19). Verhindert Issue-Pile-Up durch:
 *   1. closeStaleIssues: Schließt alte Issues desselben Agenten
 *   2. isDuplicateRecent: Prüft ob bereits ein Issue in den letzten 24h existiert
 *   3. createGitHubIssueManaged: Kombiniert alles in einem Aufruf
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ManagedIssueOpts {
  title: string;
  body: string;
  labels: string[];
  /** Prefix im Titel zur Identifikation, z.B. "AG-DESIGNER", "AG19" */
  agentPrefix: string;
  /** Wie viele offene Issues behalten (default: 1) */
  keepOpen?: number;
}

interface GitHubIssue {
  number: number;
  title: string;
  created_at: string;
  html_url: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGitHubConfig(): { token: string; repo: string } | null {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return null;
  return { token, repo };
}

async function githubApi(
  path: string,
  method: "GET" | "POST" | "PATCH",
  token: string,
  body?: Record<string, unknown>,
): Promise<Response> {
  return fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(10_000),
  });
}

// ---------------------------------------------------------------------------
// 1. Close Stale Issues
// ---------------------------------------------------------------------------

/**
 * Schließt alte offene Issues eines Agenten. Behält die neuesten `keep` offen.
 * Identifiziert Issues über Labels UND agentPrefix im Titel.
 */
export async function closeStaleIssues(
  labels: string[],
  agentPrefix: string,
  keep: number = 1,
): Promise<number> {
  const cfg = getGitHubConfig();
  if (!cfg) return 0;

  try {
    const labelParam = labels.join(",");
    const res = await githubApi(
      `/repos/${cfg.repo}/issues?labels=${encodeURIComponent(labelParam)}&state=open&sort=created&direction=desc&per_page=20`,
      "GET",
      cfg.token,
    );

    if (!res.ok) return 0;

    const issues: GitHubIssue[] = await res.json();

    // Nur Issues mit dem Agent-Prefix im Titel
    const agentIssues = issues.filter((i) => i.title.includes(agentPrefix));

    // Die neuesten `keep` behalten, Rest schließen
    const toClose = agentIssues.slice(keep);
    let closed = 0;

    for (const issue of toClose) {
      try {
        const closeRes = await githubApi(
          `/repos/${cfg.repo}/issues/${issue.number}`,
          "PATCH",
          cfg.token,
          { state: "closed", state_reason: "not_planned" },
        );
        if (closeRes.ok) closed++;
      } catch {
        // Einzelnes Close fehlgeschlagen — weiter machen
      }
    }

    if (closed > 0) {
      console.log(`[github-issues] ${closed} alte ${agentPrefix}-Issues geschlossen`);
    }

    return closed;
  } catch (err) {
    console.error("[github-issues] closeStaleIssues Fehler:", err);
    return 0;
  }
}

// ---------------------------------------------------------------------------
// 2. Duplicate Check
// ---------------------------------------------------------------------------

/**
 * Prüft ob in den letzten 24h bereits ein Issue mit dem agentPrefix erstellt wurde.
 */
export async function isDuplicateRecent(
  labels: string[],
  agentPrefix: string,
): Promise<boolean> {
  const cfg = getGitHubConfig();
  if (!cfg) return false;

  try {
    const labelParam = labels.join(",");
    const res = await githubApi(
      `/repos/${cfg.repo}/issues?labels=${encodeURIComponent(labelParam)}&state=open&sort=created&direction=desc&per_page=5`,
      "GET",
      cfg.token,
    );

    if (!res.ok) return false;

    const issues: GitHubIssue[] = await res.json();
    const now = Date.now();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;

    return issues.some((i) => {
      if (!i.title.includes(agentPrefix)) return false;
      const created = new Date(i.created_at).getTime();
      return now - created < twentyFourHoursMs;
    });
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 3. Managed Issue Creation
// ---------------------------------------------------------------------------

/**
 * Erstellt ein GitHub Issue mit automatischem Close alter Issues + Dedup-Check.
 * Gibt die Issue-URL zurück oder null bei Fehler/Duplikat.
 */
export async function createGitHubIssueManaged(
  opts: ManagedIssueOpts,
): Promise<string | null> {
  const cfg = getGitHubConfig();
  if (!cfg) return null;

  const keep = opts.keepOpen ?? 1;

  // Schritt 1: Alte Issues schließen
  await closeStaleIssues(opts.labels, opts.agentPrefix, keep);

  // Schritt 2: Duplikat-Check (verhindert doppelte Issues bei Mehrfach-Trigger)
  const isDup = await isDuplicateRecent(opts.labels, opts.agentPrefix);
  if (isDup) {
    console.log(`[github-issues] ${opts.agentPrefix}: Duplikat in letzten 24h — übersprungen`);
    return null;
  }

  // Schritt 3: Issue erstellen
  try {
    const res = await githubApi(
      `/repos/${cfg.repo}/issues`,
      "POST",
      cfg.token,
      {
        title: opts.title,
        body: opts.body,
        labels: opts.labels,
      },
    );

    if (res.ok) {
      const data = await res.json();
      return data.html_url ?? null;
    }

    console.error(`[github-issues] ${opts.agentPrefix}: Issue erstellen fehlgeschlagen:`, res.status);
    return null;
  } catch (err) {
    console.error(`[github-issues] ${opts.agentPrefix}: Exception:`, err);
    return null;
  }
}
