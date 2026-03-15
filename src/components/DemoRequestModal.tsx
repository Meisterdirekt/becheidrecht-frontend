"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTarif?: string;
}

export function DemoRequestModal({
  isOpen,
  onClose,
  preselectedTarif,
}: DemoRequestModalProps) {
  const [orgName, setOrgName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [beraterCount, setBeraterCount] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"form" | "submitting" | "success" | "error">("form");
  const [serverError, setServerError] = useState("");
  const orgRef = useRef<HTMLInputElement>(null);

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
      setTimeout(() => orgRef.current?.focus(), 100);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);


  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!orgName.trim() || orgName.trim().length < 2)
      errs.orgName = "Pflichtfeld";
    if (!contactName.trim() || contactName.trim().length < 2)
      errs.contactName = "Pflichtfeld";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = "Bitte gültige E-Mail eingeben";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    setServerError("");

    try {
      const res = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_name: orgName.trim(),
          contact_name: contactName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          berater_count: beraterCount ? parseInt(beraterCount, 10) : undefined,
          message: message.trim() || undefined,
          selected_tarif: preselectedTarif || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Ein Fehler ist aufgetreten.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setServerError("Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung.");
      setStatus("error");
    }
  }

  if (!isOpen) return null;

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-white/25 focus:border-[var(--accent)] focus:outline-none transition-colors";
  const labelClass = "block text-sm font-semibold text-[var(--foreground)]/70 mb-1.5";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="presentation"
      aria-hidden="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[var(--bg)] p-6 sm:p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {status === "success" ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
              Vielen Dank!
            </h3>
            <p className="text-sm text-[var(--foreground)]/60 mb-6">
              Wir melden uns innerhalb von 24 Stunden bei Ihnen.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-xl font-bold text-sm bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              Schließen
            </button>
          </div>
        ) : (
          <>
            <h2
              id="demo-modal-title"
              className="text-xl font-bold text-[var(--foreground)] mb-1"
            >
              Kostenlose Demo vereinbaren
            </h2>
            <p className="text-sm text-[var(--foreground)]/50 mb-6">
              10 Minuten Live-Demo mit einem echten Bescheid. Kein Verkaufsgespräch.
              {preselectedTarif && (
                <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)]">
                  {preselectedTarif}
                </span>
              )}
            </p>

            {serverError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="demo-org" className={labelClass}>
                  Organisation *
                </label>
                <input
                  ref={orgRef}
                  id="demo-org"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="z.B. Caritas Köln"
                  className={inputClass}
                  maxLength={200}
                />
                {errors.orgName && (
                  <p className="mt-1 text-xs text-red-400">{errors.orgName}</p>
                )}
              </div>

              <div>
                <label htmlFor="demo-contact" className={labelClass}>
                  Ansprechpartner *
                </label>
                <input
                  id="demo-contact"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Vor- und Nachname"
                  className={inputClass}
                  maxLength={100}
                />
                {errors.contactName && (
                  <p className="mt-1 text-xs text-red-400">{errors.contactName}</p>
                )}
              </div>

              <div>
                <label htmlFor="demo-email" className={labelClass}>
                  E-Mail-Adresse *
                </label>
                <input
                  id="demo-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organisation.de"
                  className={inputClass}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="demo-phone" className={labelClass}>
                    Telefon <span className="font-normal text-[var(--foreground)]/30">(optional)</span>
                  </label>
                  <input
                    id="demo-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+49 ..."
                    className={inputClass}
                    maxLength={30}
                  />
                </div>
                <div>
                  <label htmlFor="demo-berater" className={labelClass}>
                    Anzahl Berater <span className="font-normal text-[var(--foreground)]/30">(optional)</span>
                  </label>
                  <input
                    id="demo-berater"
                    type="number"
                    value={beraterCount}
                    onChange={(e) => setBeraterCount(e.target.value)}
                    placeholder="z.B. 5"
                    className={inputClass}
                    min={1}
                    max={9999}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="demo-message" className={labelClass}>
                  Nachricht <span className="font-normal text-[var(--foreground)]/30">(optional)</span>
                </label>
                <textarea
                  id="demo-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Welche Bescheide prüfen Sie hauptsächlich?"
                  className={`${inputClass} resize-none`}
                  rows={3}
                  maxLength={2000}
                />
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Wird gesendet...
                  </span>
                ) : (
                  "Demo anfragen"
                )}
              </button>

              <p className="text-xs text-center text-[var(--foreground)]/30">
                Ihre Daten werden nur zur Kontaktaufnahme verwendet.{" "}
                <a href="/datenschutz" className="underline hover:text-[var(--accent)]">
                  Datenschutz
                </a>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
