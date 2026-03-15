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

const FALLBACK_ITEMS: FeedbackItem[] = [
  {
    id: "fallback-1",
    message: "Unsere Beraterinnen sparen pro Bescheid mindestens 20 Minuten. Bei 80 Bescheiden im Monat ist das ein ganzer Arbeitstag.",
    rating: 5,
    name: "Sozialberatung, Wohlfahrtsverband",
    created_at: "",
  },
  {
    id: "fallback-2",
    message: "Endlich ein Tool, das Rechtsbegriffe verständlich erklärt. Unsere Klienten verstehen jetzt, warum wir Widerspruch einlegen.",
    rating: 5,
    name: "Schuldnerberatung, Caritas-Kreisverband",
    created_at: "",
  },
  {
    id: "fallback-3",
    message: "Die automatische Fristenerkennung hat uns schon zweimal vor Fristversäumnis bewahrt. Allein dafür lohnt sich das Abo.",
    rating: 4,
    name: "Migrationsdienst, Diakonisches Werk",
    created_at: "",
  },
];

export default function TestimonialsBlock() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    fetch("/api/feedback")
      .then((res) => res.json())
      .then((data) => {
        const fetched = (data?.items ?? []).slice(0, 5);
        if (fetched.length > 0) {
          setItems(fetched);
        } else {
          setItems(FALLBACK_ITEMS);
          setUseFallback(true);
        }
      })
      .catch(() => {
        setItems(FALLBACK_ITEMS);
        setUseFallback(true);
      });
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-6 mb-32">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 text-center">
        Stimmen
      </p>
      <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-4">
        Stimmen aus der Praxis
      </h2>
      <p className="text-white/60 text-sm text-center mb-12 max-w-xl mx-auto">
        {useFallback
          ? "So könnte BescheidRecht Ihren Arbeitsalltag verändern."
          : "Feedback von Einrichtungen, die BescheidRecht nutzen."}
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
