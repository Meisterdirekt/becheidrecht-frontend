import React from "react";
import Link from "next/link";
import { VisitorCount } from "@/components/VisitorCount";
import { CustomerCount } from "@/components/CustomerCount";

interface SiteFooterProps {
  blog?: string;
  feedback?: string;
  impressum?: string;
  datenschutz?: string;
  agb?: string;
  disclaimer?: string;
  copyright?: string;
}

const DEFAULT_FOOTER = {
  blog: "Blog",
  feedback: "Feedback",
  impressum: "Impressum",
  datenschutz: "Datenschutz",
  agb: "AGB",
  disclaimer: "Kein Ersatz für Rechtsberatung. Informationsdienst gem. § 2 RDG.",
  copyright: "© 2026 BescheidRecht. Alle Rechte vorbehalten.",
};

export function SiteFooter({
  blog = DEFAULT_FOOTER.blog,
  feedback = DEFAULT_FOOTER.feedback,
  impressum = DEFAULT_FOOTER.impressum,
  datenschutz = DEFAULT_FOOTER.datenschutz,
  agb = DEFAULT_FOOTER.agb,
  disclaimer = DEFAULT_FOOTER.disclaimer,
  copyright: copyrightText = DEFAULT_FOOTER.copyright,
}: SiteFooterProps) {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-6">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          <Link href="/blog" className="text-[12px] font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            {blog}
          </Link>
          <Link href="/feedback" className="text-[12px] font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            {feedback}
          </Link>
          <Link href="/impressum" className="text-[12px] font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            {impressum}
          </Link>
          <Link href="/datenschutz" className="text-[12px] font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            {datenschutz}
          </Link>
          <Link href="/agb" className="text-[12px] font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            {agb}
          </Link>
        </div>
        <p className="text-[10px] text-center text-white/25 leading-relaxed">
          {disclaimer}
        </p>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 flex-wrap">
          <div className="flex items-center gap-6 flex-wrap justify-center sm:justify-start">
            <VisitorCount />
            <CustomerCount />
          </div>
          <p className="text-[11px] font-bold tracking-[0.2em] text-white/30 uppercase">
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
