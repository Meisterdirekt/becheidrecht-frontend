import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Widerspruchs-Assistent — Schreiben Schritt für Schritt erstellen",
  description:
    "4-Schritte-Wizard für Widerspruchsschreiben. Der Assistent stellt gezielte Fragen und generiert ein DIN-A4-PDF — professionell und DSGVO-konform.",
};

export default function AssistantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
