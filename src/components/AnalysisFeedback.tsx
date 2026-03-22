"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, AlertTriangle, XCircle, MessageSquare, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface FehlerFeedbackItem {
  index: number;
  correct: boolean;
}

interface SavedFeedback {
  id: string;
  feedback_type: "correct" | "partially_correct" | "incorrect";
  correction_text: string | null;
  fehler_feedback: FehlerFeedbackItem[];
  created_at: string;
}

interface Props {
  analysisResultId: string;
  fehler: string[];
  token: string;
}

const FEEDBACK_OPTIONS = [
  { type: "correct" as const, label: "Korrekt", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10 border-green-500/30", bgActive: "bg-green-500/20 border-green-500/50" },
  { type: "partially_correct" as const, label: "Teilweise", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30", bgActive: "bg-amber-500/20 border-amber-500/50" },
  { type: "incorrect" as const, label: "Nicht korrekt", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10 border-red-400/30", bgActive: "bg-red-400/20 border-red-400/50" },
] as const;

export default function AnalysisFeedback({ analysisResultId, fehler, token }: Props) {
  const [selectedType, setSelectedType] = useState<"correct" | "partially_correct" | "incorrect" | null>(null);
  const [correctionText, setCorrectionText] = useState("");
  const [fehlerFeedback, setFehlerFeedback] = useState<Record<number, boolean>>({});
  const [showDetails, setShowDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const loadExisting = useCallback(async () => {
    try {
      const res = await fetch(`/api/analysis-feedback?analysis_id=${analysisResultId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (json.feedback) {
        const fb = json.feedback as SavedFeedback;
        setSelectedType(fb.feedback_type);
        setCorrectionText(fb.correction_text || "");
        if (Array.isArray(fb.fehler_feedback)) {
          const map: Record<number, boolean> = {};
          fb.fehler_feedback.forEach((f: FehlerFeedbackItem) => { map[f.index] = f.correct; });
          setFehlerFeedback(map);
        }
        setSaved(true);
      }
    } catch {
      // Leises Scheitern — Feedback-Load ist nicht kritisch
    } finally {
      setLoaded(true);
    }
  }, [analysisResultId, token]);

  useEffect(() => { loadExisting(); }, [loadExisting]);

  async function handleSave() {
    if (!selectedType) return;
    setSaving(true);
    setError("");

    try {
      const fehlerFb = Object.entries(fehlerFeedback).map(([idx, correct]) => ({
        index: parseInt(idx),
        correct,
      }));

      const res = await fetch("/api/analysis-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          analysis_id: analysisResultId,
          feedback_type: selectedType,
          correction_text: correctionText || null,
          fehler_feedback: fehlerFb,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || "Speichern fehlgeschlagen.");
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  function toggleFehler(index: number) {
    setFehlerFeedback((prev) => {
      const next = { ...prev };
      if (next[index] === undefined) {
        next[index] = false; // Markiere als inkorrekt
      } else if (next[index] === false) {
        next[index] = true; // Markiere als korrekt
      } else {
        delete next[index]; // Zuruecksetzen
      }
      return next;
    });
    setSaved(false);
  }

  if (!loaded) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 animate-fadeIn">
      <h2 className="text-sm font-extrabold uppercase tracking-widest text-white/60 mb-1">
        Analyse bewerten
      </h2>
      <p className="text-xs text-white/40 mb-4">
        Ihr Feedback hilft uns, die Analysequalitaet zu verbessern.
      </p>

      {/* Feedback-Typ Buttons */}
      <div className="flex gap-2 mb-4">
        {FEEDBACK_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = selectedType === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => { setSelectedType(opt.type); setSaved(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                isActive ? opt.bgActive : `${opt.bg} opacity-60 hover:opacity-100`
              }`}
            >
              <Icon size={14} className={opt.color} />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Per-Fehler Feedback (aufklappbar) */}
      {selectedType && selectedType !== "correct" && fehler.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/70 transition-colors mb-2"
          >
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Einzelne Auffaelligkeiten bewerten
          </button>

          {showDetails && (
            <div className="space-y-1.5 pl-1">
              {fehler.map((f, i) => {
                const state = fehlerFeedback[i];
                return (
                  <button
                    key={i}
                    onClick={() => toggleFehler(i)}
                    className="flex items-start gap-2 w-full text-left text-xs py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="flex-shrink-0 mt-0.5">
                      {state === undefined && <span className="inline-block w-3.5 h-3.5 rounded border border-white/20" />}
                      {state === true && <CheckCircle size={14} className="text-green-500" />}
                      {state === false && <XCircle size={14} className="text-red-400" />}
                    </span>
                    <span className="text-white/60">{f}</span>
                  </button>
                );
              })}
              <p className="text-[10px] text-white/30 pl-2 mt-1">
                Klicken: nicht korrekt → korrekt → zuruecksetzen
              </p>
            </div>
          )}
        </div>
      )}

      {/* Freitext */}
      {selectedType && selectedType !== "correct" && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs text-white/50 mb-1.5">
            <MessageSquare size={12} />
            Was war falsch oder fehlte? (optional)
          </div>
          <textarea
            value={correctionText}
            onChange={(e) => { setCorrectionText(e.target.value); setSaved(false); }}
            maxLength={1000}
            rows={3}
            placeholder="z.B. Der Bescheid erwaehnt keinen Mehrbedarf, trotzdem wurde einer als Fehler erkannt..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/25 resize-none focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
          />
          <p className="text-[10px] text-white/30 text-right mt-0.5">{correctionText.length}/1000</p>
        </div>
      )}

      {/* Speichern */}
      {selectedType && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              saved
                ? "bg-green-500/15 text-green-400 border border-green-500/30"
                : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white"
            }`}
          >
            {saving ? (
              <><Loader2 size={12} className="animate-spin" /> Speichern...</>
            ) : saved ? (
              <><CheckCircle size={12} /> Gespeichert</>
            ) : (
              "Feedback senden"
            )}
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
