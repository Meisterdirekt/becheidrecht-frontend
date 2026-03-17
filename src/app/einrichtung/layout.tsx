import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Einrichtungs-Dashboard",
  robots: { index: false, follow: false },
};

export default function EinrichtungLayout({ children }: { children: React.ReactNode }) {
  return children;
}
