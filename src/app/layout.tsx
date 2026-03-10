import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { RecoveryRedirect } from "@/components/RecoveryRedirect";
import { Toaster } from "sonner";
import { CommandPalette } from "@/components/CommandPalette";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BescheidRecht",
  description: "Softwaregestützte Analyse für Verwaltungsschreiben",
  openGraph: {
    title: "BescheidRecht",
    description: "KI-gestützte Analyse von Behördenbescheiden — Fehler erkennen, Fristen wahren, Widerspruch einlegen.",
    url: "https://www.bescheidrecht.de",
    siteName: "BescheidRecht",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BescheidRecht",
    description: "KI-gestützte Analyse von Behördenbescheiden — Fehler erkennen, Fristen wahren, Widerspruch einlegen.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const themeScript = `
(function(){
  var t = localStorage.getItem('theme');
  if (t !== 'light' && t !== 'dark') t = 'light';
  document.documentElement.setAttribute('data-theme', t);
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning className={outfit.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased font-sans">
        <RecoveryRedirect />
        <CommandPalette />
        <Toaster
          theme="system"
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontSize: "13px",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
