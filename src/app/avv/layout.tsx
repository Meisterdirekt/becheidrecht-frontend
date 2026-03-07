import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auftragsverarbeitungsvertrag (AVV) — BescheidRecht",
  description:
    "Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO zwischen BescheidRecht und Einrichtungen, die BescheidRecht als B2B-Tool nutzen.",
};

export default function AvvLayout({ children }: { children: React.ReactNode }) {
  return children;
}
