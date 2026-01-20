export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#e5e7eb",
        padding: "48px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2.75rem", fontWeight: 700 }}>
        BescheidRecht
      </h1>

      <p style={{ marginTop: "16px", maxWidth: "640px", fontSize: "1.1rem" }}>
        Wir helfen dir, behördliche Schreiben zu verstehen und
        rechtssichere Antworten, Anträge oder Widersprüche
        einfach zu erstellen.
      </p>

      <ul style={{ marginTop: "32px", lineHeight: "1.9" }}>
        <li>✔ Verständliche Erklärung von Bescheiden</li>
        <li>✔ Schreiben für Jobcenter, Rente & Sozialamt</li>
        <li>✔ Unterstützung in allen wichtigen Rechtsgebieten</li>
      </ul>

      <button
        style={{
          marginTop: "36px",
          padding: "14px 24px",
          backgroundColor: "#2563eb",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Bescheid prüfen
      </button>
    </main>
  );
}
