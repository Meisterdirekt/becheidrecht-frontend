"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center animate-fadeIn max-w-md text-center">
        <div className="w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-3">Zahlung erfolgreich</h1>
        <p className="text-white/60 text-sm mb-8">
          Ihre Zahlung wurde erfolgreich verarbeitet. Ihr Analyse-Kontingent
          wird in wenigen Sekunden freigeschaltet.
        </p>
        <Link href="/analyze" className="btn-primary">
          Bescheid analysieren
        </Link>
      </div>
    </main>
  );
}
