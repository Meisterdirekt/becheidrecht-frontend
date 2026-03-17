import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KI-Transparenz — EU AI Act Compliance",
  description:
    "Informationen zu den eingesetzten KI-Systemen, Hochrisiko-Einstufung und Datenschutz gemäß EU AI Act (VO 2024/1689).",
};

export default function KiTransparenzLayout({ children }: { children: React.ReactNode }) {
  return children;
}
