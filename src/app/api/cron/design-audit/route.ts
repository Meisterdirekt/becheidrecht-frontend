/**
 * AG-DESIGNER — Wöchentlicher Design & Performance Audit
 * GET /api/cron/design-audit?secret=CRON_SECRET
 *
 * Läuft jeden Dienstag 04:00 UTC via Vercel Cron.
 * Nutzt Google PageSpeed Insights API (kostenlos, kein Key nötig).
 * Prüft: Performance, Accessibility, Best Practices, SEO.
 * Erstellt GitHub Issue bei Score-Regression oder kritischen Befunden.
 */

import { NextResponse } from "next/server";
import { reportInfo } from "@/lib/error-reporter";

export const runtime = "nodejs";
export const maxDuration = 45;

function verifySecret(req: Request): boolean {
  const url = new URL(req.url);
  const authHeader = req.headers?.get?.("authorization") || "";
  const secret = url.searchParams.get("secret") || authHeader.replace("Bearer ", "");
  const expected = process.env.CRON_SECRET;
  return !!expected && secret === expected;
}

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
    lcp?: number;  // Largest Contentful Paint (ms)
    fid?: number;  // First Input Delay (ms)
    cls?: number;  // Cumulative Layout Shift
    fcp?: number;  // First Contentful Paint (ms)
    ttfb?: number; // Time to First Byte (ms)
    tbt?: number;  // Total Blocking Time (ms)
  };
  error?: string;
};

// Mindest-Scores — bei Unterschreitung → Issue
const SCORE_THRESHOLDS = {
  performance: { warn: 70, critical: 50 },
  accessibility: { warn: 85, critical: 70 },
  bestPractices: { warn: 80, critical: 65 },
  seo: { warn: 85, critical: 70 },
};

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

    const scores: LighthouseScore = {
      performance: Math.round((cats.performance?.score || 0) * 100),
      accessibility: Math.round((cats.accessibility?.score || 0) * 100),
      bestPractices: Math.round((cats["best-practices"]?.score || 0) * 100),
      seo: Math.round((cats.seo?.score || 0) * 100),
    };

    const coreWebVitals = {
      lcp: audits["largest-contentful-paint"]?.numericValue,
      fid: audits["max-potential-fid"]?.numericValue,
      cls: audits["cumulative-layout-shift"]?.numericValue,
      fcp: audits["first-contentful-paint"]?.numericValue,
      ttfb: audits["server-response-time"]?.numericValue,
      tbt: audits["total-blocking-time"]?.numericValue,
    };

    return { url: targetUrl, strategy, scores, coreWebVitals };
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

async function createGitHubIssue(title: string, body: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return;

  await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      body,
      labels: ["performance", "design", "automated"],
    }),
  });
}

export async function GET(req: Request) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    console.warn("[AG-DESIGNER] NEXT_PUBLIC_APP_URL nicht gesetzt — Audit übersprungen. Env-Var in Vercel setzen!");
    return NextResponse.json({
      success: false,
      message: "NEXT_PUBLIC_APP_URL nicht gesetzt — Audit übersprungen",
    });
  }

  reportInfo("[AG-DESIGNER] Wöchentlicher Design-Audit gestartet", { appUrl });

  // Mobile + Desktop parallel prüfen
  const [mobile, desktop] = await Promise.all([
    runLighthouse(appUrl, "mobile"),
    runLighthouse(appUrl, "desktop"),
  ]);

  const mobileIssues = mobile.error ? [`API-Fehler: ${mobile.error}`] : detectRegressions(mobile);
  const desktopIssues = desktop.error ? [`API-Fehler: ${desktop.error}`] : detectRegressions(desktop);
  const allIssues = [...mobileIssues.map((i) => `📱 ${i}`), ...desktopIssues.map((i) => `🖥️ ${i}`)];

  if (allIssues.length > 0) {
    const ms = mobile.scores;
    const ds = desktop.scores;
    const mc = mobile.coreWebVitals;
    const dc = desktop.coreWebVitals;

    const body = [
      `## AG-DESIGNER Audit — ${new Date().toLocaleDateString("de-DE")}`,
      `**URL:** ${appUrl}`,
      "",
      `### 🚨 Gefundene Probleme (${allIssues.length})`,
      allIssues.map((i) => `- ${i}`).join("\n"),
      "",
      `### 📱 Mobile Scores`,
      `| Kategorie | Score |`,
      `|-----------|-------|`,
      `| Performance | ${scoreEmoji(ms.performance, "performance")} ${ms.performance}/100 |`,
      `| Accessibility | ${scoreEmoji(ms.accessibility, "accessibility")} ${ms.accessibility}/100 |`,
      `| Best Practices | ${scoreEmoji(ms.bestPractices, "bestPractices")} ${ms.bestPractices}/100 |`,
      `| SEO | ${scoreEmoji(ms.seo, "seo")} ${ms.seo}/100 |`,
      "",
      `**Core Web Vitals (Mobile):**`,
      `LCP: ${mc.lcp ? `${(mc.lcp / 1000).toFixed(1)}s` : "—"} | CLS: ${mc.cls?.toFixed(3) ?? "—"} | TBT: ${mc.tbt?.toFixed(0) ?? "—"}ms | FCP: ${mc.fcp ? `${(mc.fcp / 1000).toFixed(1)}s` : "—"}`,
      "",
      `### 🖥️ Desktop Scores`,
      `| Kategorie | Score |`,
      `|-----------|-------|`,
      `| Performance | ${scoreEmoji(ds.performance, "performance")} ${ds.performance}/100 |`,
      `| Accessibility | ${scoreEmoji(ds.accessibility, "accessibility")} ${ds.accessibility}/100 |`,
      `| Best Practices | ${scoreEmoji(ds.bestPractices, "bestPractices")} ${ds.bestPractices}/100 |`,
      `| SEO | ${scoreEmoji(ds.seo, "seo")} ${ds.seo}/100 |`,
      "",
      `**Core Web Vitals (Desktop):**`,
      `LCP: ${dc.lcp ? `${(dc.lcp / 1000).toFixed(1)}s` : "—"} | CLS: ${dc.cls?.toFixed(3) ?? "—"} | TBT: ${dc.tbt?.toFixed(0) ?? "—"}ms | TTFB: ${dc.ttfb?.toFixed(0) ?? "—"}ms`,
      "",
      `### Score-Schwellwerte`,
      `🟢 Gut (≥90) | 🟡 OK (≥Warnung) | 🟠 Niedrig (≥Kritisch) | 🔴 Kritisch (<Kritisch)`,
      "",
      `---`,
      `*Automatisch erstellt von AG-DESIGNER • ${new Date().toISOString()}*`,
    ].join("\n");

    await createGitHubIssue(
      `🎨 AG-DESIGNER: ${allIssues.length} Performance/Design-Problem(e) — ${new Date().toLocaleDateString("de-DE")}`,
      body
    );
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    url: appUrl,
    mobile: { scores: mobile.scores, issues: mobileIssues.length, error: mobile.error },
    desktop: { scores: desktop.scores, issues: desktopIssues.length, error: desktop.error },
    totalIssues: allIssues.length,
  });
}
