import React from "react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap justify-center gap-8">
          <Link href="/blog" className="text-[12px] font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            Blog
          </Link>
          <Link href="/impressum" className="text-[12px] font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            Impressum
          </Link>
          <Link href="/datenschutz" className="text-[12px] font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            Datenschutz
          </Link>
          <Link href="/agb" className="text-[12px] font-bold tracking-[0.2em] text-white/40 uppercase hover:text-white transition-colors">
            AGB
          </Link>
        </div>
        <p className="text-[11px] font-bold tracking-[0.2em] text-white/30 uppercase">
          © 2026 BescheidRecht. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
