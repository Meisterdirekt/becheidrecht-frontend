"use client";

import React, { useMemo, useEffect, useCallback } from "react";
import { pseudonymizeText } from "@/lib/privacy/pseudonymizer";

const EXAMPLE_TEXT = `Antragsteller: Max Mustermann
geboren am 01.01.1990
Musterstraße 1
49377 Vechta

Kontakt: max.mustermann@example.de
Tel: +49 4441 123456

Aktenzeichen: BG-123456-2026
Bescheid vom 15.02.2026`;

interface PseudonymizationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  labelBefore: string;
  labelAfter: string;
  note: string;
  btnLabel: string;
}

export function PseudonymizationPreviewModal({
  isOpen,
  onClose,
  title,
  labelBefore,
  labelAfter,
  note,
  btnLabel,
}: PseudonymizationPreviewModalProps) {
  const { pseudonymized } = useMemo(
    () => pseudonymizeText(EXAMPLE_TEXT),
    []
  );

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm modal-backdrop"
      role="presentation"
      aria-hidden="true"
      onClick={onClose}
    >
      <div
        className="modal-content w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-[var(--accent)]/50 bg-[var(--bg)] p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pseudonym-preview-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="pseudonym-preview-title"
          className="text-lg font-bold text-white mb-6"
        >
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
              {labelBefore}
            </p>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/90 font-mono leading-relaxed whitespace-pre-wrap break-words max-h-[280px] overflow-y-auto">
              {EXAMPLE_TEXT}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-2">
              {labelAfter}
            </p>
            <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4 text-sm text-white/90 font-mono leading-relaxed whitespace-pre-wrap break-words max-h-[280px] overflow-y-auto">
              {pseudonymized}
            </div>
          </div>
        </div>
        <p className="text-sm text-white/60 mb-6 leading-relaxed">{note}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-sm bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          {btnLabel}
        </button>
      </div>
    </div>
  );
}
