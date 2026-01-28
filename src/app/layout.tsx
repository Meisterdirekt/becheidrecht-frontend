import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BescheidRecht",
  description: "Softwaregestützte Analyse für Verwaltungsschreiben",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{ fontFamily: 'sans-serif', margin: 0, backgroundColor: '#05070a' }}>
        {children}
      </body>
    </html>
  );
}
