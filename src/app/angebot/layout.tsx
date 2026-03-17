import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Angebot erstellen",
  robots: { index: false, follow: false },
};

export default function AngebotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
