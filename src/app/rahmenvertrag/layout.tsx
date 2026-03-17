import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rahmenvertrag",
  robots: { index: false, follow: false },
};

export default function RahmenvertragLayout({ children }: { children: React.ReactNode }) {
  return children;
}
