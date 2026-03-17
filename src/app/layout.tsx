import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { RecoveryRedirect } from "@/components/RecoveryRedirect";
import { Toaster } from "sonner";
import { LazyCommandPalette } from "@/components/LazyCommandPalette";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BescheidRecht — KI-Analyse von Behördenbescheiden",
    template: "%s | BescheidRecht",
  },
  description: "KI-gestützte Analyse von Behördenbescheiden für Sozialeinrichtungen. Fehler erkennen, Fristen wahren, Widerspruch einlegen — rechtssicher und DSGVO-konform.",
  metadataBase: new URL("https://www.bescheidrecht.de"),
  alternates: {
    canonical: "/",
    languages: {
      "de": "/",
      "en": "/",
      "ru": "/",
      "ar": "/",
      "tr": "/",
    },
  },
  openGraph: {
    title: "BescheidRecht — KI-Analyse von Behördenbescheiden",
    description: "KI-gestützte Analyse von Behördenbescheiden für Sozialeinrichtungen. Fehler erkennen, Fristen wahren, Widerspruch einlegen.",
    url: "https://www.bescheidrecht.de",
    siteName: "BescheidRecht",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BescheidRecht — KI-Analyse von Behördenbescheiden",
    description: "KI-gestützte Analyse von Behördenbescheiden für Sozialeinrichtungen. Fehler erkennen, Fristen wahren, Widerspruch einlegen.",
  },
  robots: {
    index: true,
    follow: true,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "BescheidRecht",
              "applicationCategory": "LegalService",
              "operatingSystem": "Web",
              "description": "KI-gestützte Analyse von Behördenbescheiden für Sozialeinrichtungen. Fehler erkennen, Fristen wahren, Widerspruch einlegen.",
              "url": "https://www.bescheidrecht.de",
              "inLanguage": ["de", "en", "ru", "ar", "tr"],
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "EUR",
                "lowPrice": "199",
                "highPrice": "699",
                "offerCount": "3",
              },
              "provider": {
                "@type": "Organization",
                "name": "BescheidRecht",
                "url": "https://www.bescheidrecht.de",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--accent)] focus:text-white focus:rounded-lg focus:text-sm focus:font-bold"
        >
          Zum Inhalt springen
        </a>
        <RecoveryRedirect />
        <LazyCommandPalette />
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
