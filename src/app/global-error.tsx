"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "24px", maxWidth: "400px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: "28px",
            }}
          >
            !
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              marginBottom: "12px",
            }}
          >
            Kritischer Fehler
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "14px",
              lineHeight: 1.6,
              marginBottom: "32px",
            }}
          >
            Die Anwendung konnte nicht geladen werden. Bitte laden Sie die Seite
            neu.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                padding: "12px 24px",
                borderRadius: "16px",
                border: "none",
                background: "#6366f1",
                color: "#fff",
                fontWeight: 700,
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
              }}
            >
              Neu laden
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error has no Next.js context */}
            <a
              href="/"
              style={{
                padding: "12px 24px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent",
                color: "rgba(255,255,255,0.6)",
                fontWeight: 700,
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Startseite
            </a>
          </div>
          {error.digest && (
            <p
              style={{
                marginTop: "24px",
                color: "rgba(255,255,255,0.2)",
                fontSize: "11px",
                fontFamily: "monospace",
              }}
            >
              Fehler-ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
