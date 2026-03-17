import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pitch Deck",
  robots: { index: false, follow: false },
};

export default function PitchDeckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
