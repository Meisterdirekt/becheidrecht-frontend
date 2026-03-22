"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CheckoutButtonProps {
  productKey: "starter" | "team" | "einrichtung";
  label: string;
  highlight?: boolean;
  className?: string;
}

/**
 * Startet eine Mollie-Zahlung und leitet zum Checkout weiter.
 * Fallback: Wenn nicht eingeloggt oder Mollie nicht konfiguriert → mailto.
 */
export function CheckoutButton({ productKey, label, highlight, className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/mollie/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_key: productKey }),
      });

      if (res.status === 401) {
        // Nicht eingeloggt → Login mit Redirect zurück
        window.location.href = "/login?redirect=/#pricing";
        return;
      }

      if (res.status === 503) {
        // Mollie nicht konfiguriert → Fallback mailto
        window.location.href = `mailto:info@bescheidrecht.de?subject=Anfrage%20${encodeURIComponent(productKey)}-Tarif`;
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Zahlung konnte nicht gestartet werden.");
        return;
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch {
      toast.error("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 ${
        highlight
          ? "bg-white text-[var(--accent)] hover:bg-white/90"
          : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
      } ${className ?? ""}`}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : label}
      {!loading && <ArrowRight className="h-3 w-3" />}
    </button>
  );
}
