import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bescheid analysieren — KI-Fehleranalyse und Musterschreiben",
  description:
    "Laden Sie Ihren Behördenbescheid hoch. Die KI erkennt automatisch Fehler, berechnet Fristen und erstellt einen Widerspruchsentwurf — in unter 2 Minuten.",
};

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
