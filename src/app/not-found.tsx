import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center animate-fadeIn">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Search className="w-10 h-10 text-white/20" />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-3">404</h1>
        <p className="text-white/60 text-sm mb-8">Die angeforderte Seite existiert nicht.</p>
        <Link
          href="/"
          className="btn-primary"
        >
          Zur Startseite
        </Link>
      </div>
    </main>
  );
}
