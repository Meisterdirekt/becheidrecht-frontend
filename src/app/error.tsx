"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold mb-4">Etwas ist schiefgelaufen</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6 max-w-md text-center">
          {error.message || "Ein unerwarteter Fehler ist aufgetreten."}
        </p>
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-colors"
          >
            Erneut versuchen
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-[var(--border)] rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
