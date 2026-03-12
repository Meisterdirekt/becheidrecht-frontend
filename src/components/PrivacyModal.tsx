"use client";

import React, { useEffect, useCallback } from "react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
  bullet4: string;
  rights: string;
  btnLabel: string;
}

export function PrivacyModal({
  isOpen,
  onClose,
  title,
  bullet1,
  bullet2,
  bullet3,
  bullet4,
  rights,
  btnLabel,
}: PrivacyModalProps) {
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      onClick={onClose}
    >
      <div
        className="modal-content w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-[var(--accent)]/50 bg-[var(--bg)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="privacy-modal-title"
          className="text-lg font-bold text-white mb-6 flex items-center gap-2"
        >
          🔒 {title}
        </h2>
        <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
          Wie wir Ihre Daten schützen:
        </p>
        <ul className="space-y-4 text-sm text-white/85 leading-relaxed mb-6">
          <li className="flex gap-2">
            <span className="text-[var(--accent)] flex-shrink-0">✓</span>
            <span>{bullet1}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--accent)] flex-shrink-0">✓</span>
            <span>{bullet2}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--accent)] flex-shrink-0">✓</span>
            <span>{bullet3}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--accent)] flex-shrink-0">✓</span>
            <span>{bullet4}</span>
          </li>
        </ul>
        <p className="text-sm text-white/70 mb-6 leading-relaxed">{rights}</p>
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
