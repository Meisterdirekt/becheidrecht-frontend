import React from "react";
import Link from "next/link";

interface SiteFooterProps {
  feedback?: string;
  impressum?: string;
  datenschutz?: string;
  agb?: string;
  barrierefreiheit?: string;
  kiTransparenz?: string;
  disclaimer?: string;
  copyright?: string;
}

const DEFAULT_FOOTER = {
  feedback: "Feedback",
  impressum: "Impressum",
  datenschutz: "Datenschutz",
  agb: "AGB",
  disclaimer: "Kein Ersatz für Rechtsberatung. Informationsdienst gem. § 2 RDG.",
  copyright: "© 2026 BescheidRecht. Alle Rechte vorbehalten.",
};

export function SiteFooter({
  feedback = DEFAULT_FOOTER.feedback,
  impressum = DEFAULT_FOOTER.impressum,
  datenschutz = DEFAULT_FOOTER.datenschutz,
  agb = DEFAULT_FOOTER.agb,
  barrierefreiheit = "Barrierefreiheit",
  kiTransparenz = "KI-Transparenz",
  disclaimer = DEFAULT_FOOTER.disclaimer,
  copyright: copyrightText = DEFAULT_FOOTER.copyright,
}: SiteFooterProps) {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-6">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          <Link href="/feedback" className="text-sm font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            {feedback}
          </Link>
          <Link href="/impressum" className="text-sm font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            {impressum}
          </Link>
          <Link href="/datenschutz" className="text-sm font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            {datenschutz}
          </Link>
          <Link href="/agb" className="text-sm font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            {agb}
          </Link>
          <Link href="/avv" className="text-sm font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            AVV
          </Link>
          <Link href="/b2b" className="text-sm font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            Für Einrichtungen
          </Link>
          <Link href="/barrierefreiheit" className="text-sm font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            {barrierefreiheit}
          </Link>
          <Link href="/ki-transparenz" className="text-sm font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            {kiTransparenz}
          </Link>
        </div>
        <p className="text-xs text-center text-white/40 leading-relaxed">
          {disclaimer}
        </p>
        <p className="text-xs font-bold tracking-[0.2em] text-white/30 uppercase text-center">
          {copyrightText}
        </p>
      </div>
    </footer>
  );
}
