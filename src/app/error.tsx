"use client";

import { useEffect } from "react";
import Link from "next/link";

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
    <div className="min-h-screen bg-mesh text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-xl font-bold mb-4">Etwas ist schiefgelaufen</h1>
      <p className="text-white/60 text-sm mb-6 max-w-md text-center">
        {error.message || "Ein unerwarteter Fehler ist aufgetreten."}
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-2xl font-bold text-sm uppercase tracking-widest"
        >
          Erneut versuchen
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-white/20 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/5"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
