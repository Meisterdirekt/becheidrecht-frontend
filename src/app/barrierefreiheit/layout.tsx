import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Erklärung zur Barrierefreiheit — WCAG 2.1 Level AA",
  description:
    "BescheidRecht ist barrierefrei gemäß BITV 2.0. Tastaturnavigation, Dark Mode, Kontrast über 7:1.",
};

export default function BarrierefreiheitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
