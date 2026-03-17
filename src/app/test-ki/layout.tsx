import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KI-Test",
  robots: { index: false, follow: false },
};

export default function TestKiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
