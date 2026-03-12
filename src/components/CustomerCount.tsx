"use client";

import React, { useState, useEffect } from "react";

export function CustomerCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stats/customer-count", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setCount(typeof data?.count === "number" ? data.count : 0))
      .catch(() => setCount(null));
  }, []);

  if (count === null || count === 0) return null;

  return (
    <span className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">
      {count === 1 ? "1 zahlender Nutzer" : `${count} zahlende Nutzer`}
    </span>
  );
}
