import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BescheidRecht",
  description: "KI-Analyse für deine Bescheide",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body style={{ fontFamily: 'sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
