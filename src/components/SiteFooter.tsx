import React from "react";
import Link from "next/link";

interface SiteFooterProps {
  blog?: string;
  impressum?: string;
  datenschutz?: string;
  agb?: string;
  copyright?: string;
}

const DEFAULT_FOOTER = {
  blog: "Blog",
  impressum: "Impressum",
  datenschutz: "Datenschutz",
  agb: "AGB",
  copyright: "© 2026 BescheidRecht. Alle Rechte vorbehalten.",
};

export function SiteFooter({
  blog = DEFAULT_FOOTER.blog,
  impressum = DEFAULT_FOOTER.impressum,
  datenschutz = DEFAULT_FOOTER.datenschutz,
  agb = DEFAULT_FOOTER.agb,
  copyright: copyrightText = DEFAULT_FOOTER.copyright,
}: SiteFooterProps) {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap justify-center gap-8">
          <Link href="/blog" className="text-[12px] font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            {blog}
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
        <p className="text-[11px] font-bold tracking-[0.2em] text-white/30 uppercase">
          {copyrightText}
        </p>
      </div>
    </footer>
  );
}
