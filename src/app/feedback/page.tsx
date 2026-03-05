"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Star, Send, CheckCircle, RefreshCw } from "lucide-react";

type FeedbackItem = {
  id: string;
  message: string;
  rating: number | null;
  name: string;
  created_at: string;
};

export default function FeedbackPage() {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [comments, setComments] = useState<FeedbackItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const commentsSectionRef = useRef<HTMLElement>(null);

  const loadComments = () => {
    setCommentsLoading(true);
    fetch("/api/feedback", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setComments(data?.items ?? []))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  };

  useEffect(() => {
    loadComments();
  }, [sent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          rating: rating ?? undefined,
          name: name.trim() || undefined,
          email: email.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Fehler beim Senden.");
        return;
      }
      setSent(true);
      setMessage("");
      setRating(null);
      setName("");
      setEmail("");
      // Nach kurzer Verzögerung zur Liste scrollen, sobald sie aktualisiert wird
      setTimeout(() => {
        commentsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    } catch {
      setError("Verbindungsfehler. Bitte später erneut versuchen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-mesh text-white flex flex-col">
      <SiteNavSimple backHref="/" backLabel="Zurück zur Startseite" />
      <div className="max-w-xl mx-auto px-6 py-20 flex-grow w-full">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-2">
          Ihre Meinung
        </p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Feedback</h1>
        <p className="text-white/60 text-sm mb-10">
          Was gefällt Ihnen? Was können wir verbessern? Ihre Nachricht und Bewertung werden unten
          öffentlich angezeigt (Name nur, wenn Sie ihn angeben – sonst „Anonym“). E-Mail wird nie veröffentlicht.
        </p>

        {sent ? (
          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 flex flex-col items-center gap-4 animate-fadeIn">
            <CheckCircle className="h-12 w-12 text-green-400" />
            <p className="text-green-200 font-medium text-center">
              Vielen Dank für Ihr Feedback. Wir haben Ihre Nachricht erhalten.
            </p>
            <p className="text-green-200/90 text-sm text-center">
              Ihr Eintrag erscheint unten in der Liste (ggf. Seite kurz nach unten scrollen).
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-[var(--accent)] text-sm font-bold uppercase tracking-wider hover:underline"
            >
              Weiteres Feedback senden
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                Ihre Nachricht <span className="text-[var(--accent)]">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="z.B. Die Analyse hat mir sehr geholfen. Ich vermisse..."
                rows={5}
                maxLength={2000}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[var(--accent)] transition-colors resize-y"
              />
              <p className="text-[11px] text-white/40 mt-1">Mind. 10 Zeichen, max. 2000. {message.length}/2000</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                Bewertung <span className="font-normal text-white/40">(optional)</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:scale-110"
                    aria-label={`${n} von 5 Sternen`}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        rating !== null && n <= rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-white/40"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                  Name <span className="font-normal text-white/40">(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ihr Name"
                  maxLength={100}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                  E-Mail <span className="font-normal text-white/40">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ihre@email.de"
                  maxLength={200}
                  className="input-field w-full"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm animate-fadeIn" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || message.trim().length < 10}
              className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                "Wird gesendet..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Feedback senden
                </>
              )}
            </button>
          </form>
        )}

        <p className="mt-8 text-white/40 text-xs">
          Details zur Verarbeitung siehe{" "}
          <Link href="/datenschutz" className="text-[var(--accent)] hover:underline">
            Datenschutz
          </Link>
          .
        </p>

        <section ref={commentsSectionRef} className="mt-16 pt-16 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-2">
                Was andere sagen
              </h2>
              <p className="text-white/60 text-sm">
                Feedback von Nutzerinnen und Nutzern – die neuesten zuerst.
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadComments()}
              disabled={commentsLoading}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/50 hover:text-[var(--accent)] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${commentsLoading ? "animate-spin" : ""}`} />
              Liste aktualisieren
            </button>
          </div>
          {commentsLoading ? (
            <p className="text-white/50 text-sm">Lade Einträge …</p>
          ) : comments.length === 0 ? (
            <p className="text-white/50 text-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              Noch keine Einträge. Seien Sie die oder der Erste – schreiben Sie oben Ihr Feedback!
            </p>
          ) : (
            <ul className="space-y-6">
              {comments.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
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
                    <span className="text-[11px] text-white/50">
                      {item.name} · {new Date(item.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                    {item.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
