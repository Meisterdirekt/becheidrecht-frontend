import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum — Kontakt und Anbieterangaben",
  description:
    "Anbieterinformationen und Kontaktdaten gemäß § 5 TMG. BescheidRecht, Hendrik Berkensträter, Vechta.",
};

export default function ImpressumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
