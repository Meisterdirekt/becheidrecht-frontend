"use client";

import { useEffect } from "react";

/**
 * Wenn der User von der Passwort-Reset-E-Mail kommt, landet er mit #access_token=...&type=recovery in der URL.
 * Supabase kann je nach Einstellung auf /, /login oder /reset-password leiten.
 * Wir leiten immer auf /reset-password weiter, damit das Formular "Neues Passwort" erscheint.
 */
export function RecoveryRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname === "/reset-password") return;
    const hash = window.location.hash || "";
    if (hash.includes("type=recovery")) {
      window.location.replace("/reset-password" + hash);
    }
  }, []);
  return null;
}
