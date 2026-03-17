import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description:
    "Nutzungsbedingungen, Haftungsausschluss und Widerrufsbelehrung für BescheidRecht. Gültig ab 2026.",
};

export default function AgbLayout({ children }: { children: React.ReactNode }) {
  return children;
}
