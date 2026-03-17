import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — DSGVO",
  description:
    "Wie BescheidRecht Ihre Daten verarbeitet, speichert und schützt. Konform mit DSGVO Art. 13 und 14.",
};

export default function DatenschutzLayout({ children }: { children: React.ReactNode }) {
  return children;
}
