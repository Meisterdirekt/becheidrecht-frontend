"use client";

import { useEffect } from "react";

/**
 * Setzt auf der B2B-Seite standardmäßig Light-Mode,
 * sofern der Nutzer noch keine eigene Präferenz gespeichert hat.
 */
export function B2BThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (!stored) {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);
  return null;
}
