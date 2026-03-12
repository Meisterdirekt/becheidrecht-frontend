"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

type FeedbackItem = {
  id: string;
  message: string;
  rating: number | null;
  name: string;
  created_at: string;
};

export default function TestimonialsBlock() {
  const [items, setItems] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    fetch("/api/feedback")
      .then((res) => res.json())
      .then((data) => setItems((data?.items ?? []).slice(0, 5)))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-6 mb-32">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
        Stimmen
      </p>
      <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-4">
        Was Nutzer sagen
      </h2>
      <p className="text-white/60 text-sm text-center mb-12 max-w-xl mx-auto">
        Feedback von Menschen, die BescheidRecht genutzt haben.
      </p>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition-all hover:border-white/20"
          >
            <div className="flex items-center gap-2 mb-3">
              {item.rating != null && (
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-4 w-4 ${
                        n <= item.rating! ? "text-amber-400 fill-amber-400" : "text-white/20"
                      }`}
                    />
                  ))}
                </div>
              )}
              <span className="text-xs text-white/50">{item.name}</span>
            </div>
            <p className="text-white/90 text-sm leading-relaxed line-clamp-4">{item.message}</p>
          </li>
        ))}
      </ul>
      <p className="text-center mt-8">
        <Link
          href="/feedback"
          className="text-[var(--accent)] text-sm font-bold uppercase tracking-wider hover:underline"
        >
          Alle ansehen & Feedback geben →
        </Link>
      </p>
    </section>
  );
}
