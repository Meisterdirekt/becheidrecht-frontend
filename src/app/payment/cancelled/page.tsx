"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelledPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center animate-fadeIn max-w-md text-center">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-3">Zahlung abgebrochen</h1>
        <p className="text-white/60 text-sm mb-8">
          Die Zahlung wurde abgebrochen. Es wurde nichts berechnet.
          Sie können es jederzeit erneut versuchen.
        </p>
        <div className="flex gap-4">
          <Link href="/#pricing" className="btn-primary">
            Erneut versuchen
          </Link>
          <Link href="/" className="btn-secondary">
            Zur Startseite
          </Link>
        </div>
      </div>
    </main>
  );
}
