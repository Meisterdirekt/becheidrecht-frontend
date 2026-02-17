import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { RecoveryRedirect } from "@/components/RecoveryRedirect";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BescheidRecht",
  description: "Softwaregestützte Analyse für Verwaltungsschreiben",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning className={outfit.variable}>
      <body className="min-h-screen bg-[var(--bg)] text-white antialiased font-sans">
        <RecoveryRedirect />
        {children}
      </body>
    </html>
  );
}
