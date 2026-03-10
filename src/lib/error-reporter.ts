/**
 * Error Reporter — zentrales Error-Tracking
 *
 * Nutzt Sentry wenn SENTRY_DSN gesetzt ist.
 * Fällt zurück auf strukturiertes console.error + optionalen GitHub-Issue-Alert.
 *
 * Verwendung:
 *   import { reportError, reportWarning } from "@/lib/error-reporter";
 *   reportError(err, { context: "AG02", userId: "..." });
 */

type ErrorContext = Record<string, string | number | boolean | null | undefined>;

function isSentryAvailable(): boolean {
  return !!process.env.SENTRY_DSN;
}

type SentryLike = {
  captureException: (err: Error) => void;
  captureMessage: (msg: string) => void;
  withScope: (cb: (scope: { setExtra: (k: string, v: unknown) => void; setLevel: (l: string) => void }) => void) => void;
};

async function getSentry(): Promise<SentryLike | null> {
  if (!isSentryAvailable()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Sentry = await import("@sentry/nextjs" as string) as any;
    return Sentry as SentryLike;
  } catch {
    return null;
  }
}

export async function reportError(
  err: unknown,
  context?: ErrorContext
): Promise<void> {
  const error = err instanceof Error ? err : new Error(String(err));

  const Sentry = await getSentry();
  if (Sentry) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
      }
      Sentry.captureException(error);
    });
    return;
  }

  // Fallback: strukturiertes Logging
  console.error(
    JSON.stringify({
      level: "error",
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    })
  );

  // GitHub Issue für kritische Fehler wenn Token vorhanden
  if (context?.critical && process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
    await createGitHubAlert("Kritischer Fehler", error.message, context).catch(() => {});
  }
}

export async function reportWarning(
  message: string,
  context?: ErrorContext
): Promise<void> {
  const Sentry = await getSentry();
  if (Sentry) {
    Sentry.withScope((scope) => {
      scope.setLevel("warning");
      if (context) {
        Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
      }
      Sentry.captureMessage(message);
    });
    return;
  }

  console.warn(
    JSON.stringify({
      level: "warning",
      message,
      context,
      timestamp: new Date().toISOString(),
    })
  );
}

export function reportInfo(
  message: string,
  context?: ErrorContext
): void {
  console.log(
    JSON.stringify({
      level: "info",
      message,
      context,
      timestamp: new Date().toISOString(),
    })
  );
}

async function createGitHubAlert(
  title: string,
  body: string,
  context?: ErrorContext
): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return;

  const contextLines = context
    ? Object.entries(context)
        .map(([k, v]) => `- **${k}:** ${v}`)
        .join("\n")
    : "";

  await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: `🚨 ${title}`,
      body: `## Fehler\n\`\`\`\n${body}\n\`\`\`\n\n## Kontext\n${contextLines}\n\n---\n*Automatisch erstellt: ${new Date().toISOString()}*`,
      labels: ["bug", "automated"],
    }),
  });
}
