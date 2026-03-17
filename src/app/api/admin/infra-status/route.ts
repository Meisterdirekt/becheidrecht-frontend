/**
 * Infra-Status API — prüft GitHub, Vercel, Supabase
 *
 * GET /api/admin/infra-status?secret=CRON_SECRET
 *
 * Wird vom /infra-check Claude-Skill aufgerufen.
 * Gibt JSON zurück mit Status aller Systeme.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CRON_SECRET = process.env.CRON_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || "";
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || "";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "";

// ---------------------------------------------------------------------------
// Check-Funktionen
// ---------------------------------------------------------------------------

async function checkSupabase() {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Tabellen-Verfügbarkeit prüfen (parallel)
    const tables = ["user_fristen", "urteile", "kennzahlen", "update_protokoll"] as const;
    const results = await Promise.all(
      tables.map((table) => supabase.from(table).select("id").limit(1))
    );
    const tableStatus: Record<string, string> = {};
    tables.forEach((table, i) => {
      const { error } = results[i];
      tableStatus[table] = error
        ? error.code === "42P01"
          ? "nicht angelegt"
          : `Fehler: ${error.message}`
        : "✓ OK";
    });

    return {
      status: "online",
      url: SUPABASE_URL,
      tabellen: tableStatus,
    };
  } catch (err: unknown) {
    return { status: "fehler", fehler: err instanceof Error ? err.message : String(err) };
  }
}

async function checkVercel() {
  if (!VERCEL_TOKEN) {
    return { status: "kein Token", hinweis: "VERCEL_TOKEN in .env.local setzen" };
  }

  try {
    const url = VERCEL_TEAM_ID
      ? `https://api.vercel.com/v6/deployments?teamId=${VERCEL_TEAM_ID}&limit=3`
      : "https://api.vercel.com/v6/deployments?limit=3";

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return { status: "API-Fehler", http: res.status };
    }

    const data = await res.json();
    const deployments = (data.deployments ?? []).slice(0, 3).map((d: { name: string; state: string; createdAt: number; url?: string }) => ({
      name: d.name,
      state: d.state,
      created: new Date(d.createdAt).toLocaleDateString("de-DE"),
      url: d.url ? `https://${d.url}` : null,
    }));

    return {
      status: "online",
      letzte_deployments: deployments,
    };
  } catch (err: unknown) {
    return { status: "fehler", fehler: err instanceof Error ? err.message : String(err) };
  }
}

async function checkGitHub() {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return {
      status: "kein Token",
      hinweis: "GITHUB_TOKEN und GITHUB_REPO (user/repo) in .env.local setzen",
    };
  }

  try {
    const headers = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    };

    const [issuesRes, prsRes, actionsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues?state=open&per_page=5`, { headers }),
      fetch(`https://api.github.com/repos/${GITHUB_REPO}/pulls?state=open&per_page=5`, { headers }),
      fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=3`, { headers }),
    ]);

    const [issues, prs, actions] = await Promise.all([
      issuesRes.json(),
      prsRes.json(),
      actionsRes.json(),
    ]);

    return {
      status: "online",
      repo: GITHUB_REPO,
      offene_issues: Array.isArray(issues) ? issues.length : "?",
      offene_prs: Array.isArray(prs) ? prs.length : "?",
      letzte_actions: Array.isArray(actions.workflow_runs)
        ? actions.workflow_runs.slice(0, 3).map((r: { name: string; status: string; conclusion: string; created_at: string }) => ({
            name: r.name,
            status: r.status,
            conclusion: r.conclusion,
            created: new Date(r.created_at).toLocaleDateString("de-DE"),
          }))
        : [],
    };
  } catch (err: unknown) {
    return { status: "fehler", fehler: err instanceof Error ? err.message : String(err) };
  }
}

async function checkRechtsUpdate() {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Letzter Update-Eintrag im Protokoll
    const { data, error } = await supabase
      .from("update_protokoll")
      .select("created_at, notiz")
      .eq("agent_id", "AG05")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return { letzter_run: null, hinweis: "update_protokoll Tabelle noch nicht angelegt" };
    }

    const lastRun = data ? new Date(data.created_at) : null;
    const daysSince = lastRun
      ? Math.floor((Date.now() - lastRun.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Urteile zählen
    const { count } = await supabase.from("urteile").select("*", { count: "exact", head: true });

    return {
      letzter_run: lastRun?.toLocaleDateString("de-DE") ?? "noch nie",
      tage_seit_update: daysSince,
      urteile_gesamt: count ?? 0,
      notiz: data?.notiz ?? null,
      warnung: daysSince !== null && daysSince > 35 ? "Update überfällig!" : null,
    };
  } catch (err: unknown) {
    return { letzter_run: "unbekannt", fehler: err instanceof Error ? err.message : String(err) };
  }
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secretParam = req.nextUrl.searchParams.get("secret");
  const providedSecret = authHeader?.replace("Bearer ", "") || secretParam || "";

  if (!CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET nicht konfiguriert." }, { status: 500 });
  }
  if (providedSecret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [supabase, vercel, github, rechtsUpdate] = await Promise.all([
    checkSupabase(),
    checkVercel(),
    checkGitHub(),
    checkRechtsUpdate(),
  ]);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    supabase,
    vercel,
    github,
    rechts_update: rechtsUpdate,
  });
}
