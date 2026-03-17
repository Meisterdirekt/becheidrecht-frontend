import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fristen-Dashboard — Automatische Fristüberwachung",
  description:
    "Übersicht aller Widerspruchsfristen. Automatische Erinnerungen 7, 3 und 1 Tag vor Ablauf. Keine Frist mehr verpassen.",
  robots: { index: false, follow: false },
};

export default function FristenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
