import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BescheidRecht",
  description: "Softwaregestützte Analyse für Verwaltungsschreiben",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={plusJakarta.variable}>
      <body className="antialiased font-sans bg-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
