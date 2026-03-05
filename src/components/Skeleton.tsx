"use client";

import React from "react";

/* ── Skeleton primitives with shimmer animation ── */

interface SkeletonBaseProps {
  className?: string;
}

export function SkeletonLine({ className = "" }: SkeletonBaseProps) {
  return (
    <div
      className={`skeleton-shimmer rounded-lg h-4 w-full ${className}`}
      role="status"
      aria-label="Laden…"
    />
  );
}

export function SkeletonCard({ className = "" }: SkeletonBaseProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 p-6 space-y-4 ${className}`}
      role="status"
      aria-label="Laden…"
    >
      <div className="skeleton-shimmer rounded-lg h-5 w-2/5" />
      <div className="skeleton-shimmer rounded-lg h-4 w-full" />
      <div className="skeleton-shimmer rounded-lg h-4 w-4/5" />
      <div className="skeleton-shimmer rounded-lg h-4 w-3/5" />
    </div>
  );
}

export function SkeletonGrid({
  count = 3,
  className = "",
}: SkeletonBaseProps & { count?: number }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
