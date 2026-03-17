import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meine Analysen — Übersicht",
  robots: { index: false, follow: false },
};

export default function AnalysenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
