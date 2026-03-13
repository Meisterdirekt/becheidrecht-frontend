/**
 * AG-DESIGNER — Wöchentlicher Design & Performance Audit (Multi-Page)
 * GET /api/cron/design-audit?secret=CRON_SECRET
 *
 * Läuft jeden Dienstag 04:00 UTC via Vercel Cron.
 * Nutzt Google PageSpeed Insights API (kostenlos, kein Key nötig).
 * Prüft 4 Seiten: Homepage, B2B, Login, Datenschutz.
 * Erstellt GitHub Issue bei Score-Regression oder kritischen Befunden.
 */

import { NextResponse } from "next/server";
import { reportInfo } from "@/lib/error-reporter";
import { createGitHubIssueManaged } from "@/lib/logic/agents/tools/github-issues";

export const runtime = "nodejs";
export const maxDuration = 120;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PAGES_TO_TEST = [
  { path: "", label: "Homepage" },
  { path: "/b2b", label: "B2B" },
  { path: "/login", label: "Login" },
  { path: "/datenschutz", label: "Datenschutz" },
];

const SCORE_THRESHOLDS = {
  performance: { warn: 70, critical: 50 },
  accessibility: { warn: 85, critical: 70 },
  bestPractices: { warn: 80, critical: 65 },
  seo: { warn: 85, critical: 70 },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LighthouseScore = {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
};

type AuditResult = {
  url: string;
  strategy: "mobile" | "desktop";
  scores: LighthouseScore;
  coreWebVitals: {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
    tbt?: number;
  };
  error?: string;
};

type PageResult = {
  label: string;
  url: string;
  mobile: AuditResult;
  desktop: AuditResult;
  mobileIssues: string[];
  desktopIssues: string[];
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function verifySecret(req: Request): boolean {
  const url = new URL(req.url);
  const authHeader = req.headers?.get?.("authorization") || "";
  const secret = url.searchParams.get("secret") || authHeader.replace("Bearer ", "");
  const expected = process.env.CRON_SECRET;
  return !!expected && secret === expected;
}

// ---------------------------------------------------------------------------
// Lighthouse
// ---------------------------------------------------------------------------

async function runLighthouse(targetUrl: string, strategy: "mobile" | "desktop"): Promise<AuditResult> {
  const apiUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  apiUrl.searchParams.set("url", targetUrl);
  apiUrl.searchParams.set("strategy", strategy);
  apiUrl.searchParams.set("category", "performance");
  apiUrl.searchParams.set("category", "accessibility");
  apiUrl.searchParams.set("category", "best-practices");
  apiUrl.searchParams.set("category", "seo");

  if (process.env.PAGESPEED_API_KEY) {
    apiUrl.searchParams.set("key", process.env.PAGESPEED_API_KEY);
  }

  try {
    const res = await fetch(apiUrl.toString(), {
      signal: AbortSignal.timeout(35_000),
    });

    if (!res.ok) {
      return {
        url: targetUrl,
        strategy,
        scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
        coreWebVitals: {},
        error: `PageSpeed API Error: ${res.status}`,
      };
    }

    const data = await res.json();
    const cats = data.lighthouseResult?.categories || {};
    const audits = data.lighthouseResult?.audits || {};

    return {
      url: targetUrl,
      strategy,
      scores: {
        performance: Math.round((cats.performance?.score || 0) * 100),
        accessibility: Math.round((cats.accessibility?.score || 0) * 100),
        bestPractices: Math.round((cats["best-practices"]?.score || 0) * 100),
        seo: Math.round((cats.seo?.score || 0) * 100),
      },
      coreWebVitals: {
        lcp: audits["largest-contentful-paint"]?.numericValue,
        fid: audits["max-potential-fid"]?.numericValue,
        cls: audits["cumulative-layout-shift"]?.numericValue,
        fcp: audits["first-contentful-paint"]?.numericValue,
        ttfb: audits["server-response-time"]?.numericValue,
        tbt: audits["total-blocking-time"]?.numericValue,
      },
    };
  } catch (err) {
    return {
      url: targetUrl,
      strategy,
      scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
      coreWebVitals: {},
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

function scoreEmoji(score: number, type: keyof typeof SCORE_THRESHOLDS): string {
  const t = SCORE_THRESHOLDS[type];
  if (score >= 90) return "🟢";
  if (score >= t.warn) return "🟡";
  if (score >= t.critical) return "🟠";
  return "🔴";
}

function detectRegressions(result: AuditResult): string[] {
  const issues: string[] = [];
  const s = result.scores;

  for (const [key, label] of [
    ["performance", "Performance"],
    ["accessibility", "Accessibility"],
    ["bestPractices", "Best Practices"],
    ["seo", "SEO"],
  ] as const) {
    const score = s[key as keyof LighthouseScore];
    const t = SCORE_THRESHOLDS[key as keyof typeof SCORE_THRESHOLDS];
    if (score < t.critical) {
      issues.push(`🔴 ${label} KRITISCH: ${score}/100 (Limit: ${t.critical})`);
    } else if (score < t.warn) {
      issues.push(`🟠 ${label} zu niedrig: ${score}/100 (Warnung ab: ${t.warn})`);
    }
  }

  const cwv = result.coreWebVitals;
  if (cwv.lcp && cwv.lcp > 4000) issues.push(`🔴 LCP zu langsam: ${(cwv.lcp / 1000).toFixed(1)}s (Ziel: <2.5s)`);
  if (cwv.cls && cwv.cls > 0.25) issues.push(`🔴 CLS zu hoch: ${cwv.cls.toFixed(3)} (Ziel: <0.1)`);
  if (cwv.tbt && cwv.tbt > 600) issues.push(`🔴 TBT zu hoch: ${cwv.tbt.toFixed(0)}ms (Ziel: <200ms)`);
  if (cwv.fcp && cwv.fcp > 3000) issues.push(`🟠 FCP zu langsam: ${(cwv.fcp / 1000).toFixed(1)}s (Ziel: <1.8s)`);
  if (cwv.ttfb && cwv.ttfb > 800) issues.push(`🟠 TTFB zu hoch: ${cwv.ttfb.toFixed(0)}ms (Ziel: <200ms)`);

  return issues;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function formatScoreTable(scores: LighthouseScore): string {
  return [
    `| Kategorie | Score |`,
    `|-----------|-------|`,
    `| Performance | ${scoreEmoji(scores.performance, "performance")} ${scores.performance}/100 |`,
    `| Accessibility | ${scoreEmoji(scores.accessibility, "accessibility")} ${scores.accessibility}/100 |`,
    `| Best Practices | ${scoreEmoji(scores.bestPractices, "bestPractices")} ${scores.bestPractices}/100 |`,
    `| SEO | ${scoreEmoji(scores.seo, "seo")} ${scores.seo}/100 |`,
  ].join("\n");
}

function formatPageSection(pr: PageResult): string {
  const mc = pr.mobile.coreWebVitals;
  const dc = pr.desktop.coreWebVitals;
  const allIssues = [
    ...pr.mobileIssues.map((i) => `📱 ${i}`),
    ...pr.desktopIssues.map((i) => `🖥️ ${i}`),
  ];

  const lines = [
    `### 📄 ${pr.label} (\`${pr.url}\`)`,
  ];

  if (allIssues.length > 0) {
    lines.push(`**Probleme (${allIssues.length}):**`);
    lines.push(allIssues.map((i) => `- ${i}`).join("\n"));
    lines.push("");
  }

  if (pr.mobile.error || pr.desktop.error) {
    if (pr.mobile.error) lines.push(`⚠️ Mobile-Fehler: ${pr.mobile.error}`);
    if (pr.desktop.error) lines.push(`⚠️ Desktop-Fehler: ${pr.desktop.error}`);
    lines.push("");
  }

  lines.push(`**📱 Mobile:**`);
  lines.push(formatScoreTable(pr.mobile.scores));
  lines.push(`CWV: LCP ${mc.lcp ? `${(mc.lcp / 1000).toFixed(1)}s` : "—"} | CLS ${mc.cls?.toFixed(3) ?? "—"} | TBT ${mc.tbt?.toFixed(0) ?? "—"}ms`);
  lines.push("");

  lines.push(`**🖥️ Desktop:**`);
  lines.push(formatScoreTable(pr.desktop.scores));
  lines.push(`CWV: LCP ${dc.lcp ? `${(dc.lcp / 1000).toFixed(1)}s` : "—"} | CLS ${dc.cls?.toFixed(3) ?? "—"} | TBT ${dc.tbt?.toFixed(0) ?? "—"}ms`);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// GET Handler
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    console.warn("[AG-DESIGNER] NEXT_PUBLIC_APP_URL nicht gesetzt — Audit übersprungen.");
    return NextResponse.json({
      success: false,
      message: "NEXT_PUBLIC_APP_URL nicht gesetzt — Audit übersprungen",
    });
  }

  reportInfo("[AG-DESIGNER] Wöchentlicher Multi-Page Design-Audit gestartet", { appUrl, pages: PAGES_TO_TEST.length });

  const pageResults: PageResult[] = [];

  // Sequentiell — Rate-Limit-freundlich (8 Requests bei 25/Tag-Limit)
  for (const { path, label } of PAGES_TO_TEST) {
    const targetUrl = `${appUrl}${path}`;
    const mobile = await runLighthouse(targetUrl, "mobile");
    const desktop = await runLighthouse(targetUrl, "desktop");
    const mobileIssues = mobile.error ? [`API-Fehler: ${mobile.error}`] : detectRegressions(mobile);
    const desktopIssues = desktop.error ? [`API-Fehler: ${desktop.error}`] : detectRegressions(desktop);
    pageResults.push({ label, url: targetUrl, mobile, desktop, mobileIssues, desktopIssues });
  }

  const totalIssues = pageResults.reduce(
    (sum, pr) => sum + pr.mobileIssues.length + pr.desktopIssues.length, 0
  );

  if (totalIssues > 0) {
    const body = [
      `## AG-DESIGNER Multi-Page Audit — ${new Date().toLocaleDateString("de-DE")}`,
      `**Seiten geprüft:** ${pageResults.length} | **Probleme gesamt:** ${totalIssues}`,
      "",
      ...pageResults.map(formatPageSection),
      "",
      `### Score-Schwellwerte`,
      `🟢 Gut (≥90) | 🟡 OK (≥Warnung) | 🟠 Niedrig (≥Kritisch) | 🔴 Kritisch (<Kritisch)`,
      "",
      `---`,
      `*Automatisch erstellt von AG-DESIGNER • ${new Date().toISOString()}*`,
    ].join("\n");

    await createGitHubIssueManaged({
      title: `🎨 AG-DESIGNER: ${totalIssues} Problem(e) auf ${pageResults.length} Seiten — ${new Date().toLocaleDateString("de-DE")}`,
      body,
      labels: ["performance", "design", "automated"],
      agentPrefix: "AG-DESIGNER",
    });
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    pagesChecked: pageResults.length,
    totalIssues,
    pages: pageResults.map((pr) => ({
      label: pr.label,
      url: pr.url,
      mobile: { scores: pr.mobile.scores, issues: pr.mobileIssues.length, error: pr.mobile.error },
      desktop: { scores: pr.desktop.scores, issues: pr.desktopIssues.length, error: pr.desktop.error },
    })),
  });
}
