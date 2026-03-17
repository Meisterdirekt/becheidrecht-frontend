import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formfreie Anträge — Katalog für 16 Behördentypen",
  description:
    "Übersicht formfreier Anträge und Pflichtformulare nach Behördentyp. Direkt ausfüllen und als PDF herunterladen.",
};

export default function AntraegeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
