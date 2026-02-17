"use client";

import React, { useState } from 'react';
import Link from 'next/link';

/**
 * ADMIN-SEITE
 *
 * Hier können Sie User manuell freischalten/upgraden
 * WICHTIG: Diese Seite sollte später mit echtem Admin-Login geschützt werden!
 */

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [subscriptionType, setSubscriptionType] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subscriptionTypes = [
    { value: 'single', label: 'Einzelkauf (19,90€) - 1 Analyse', analyses: 1 },
    { value: 'basic', label: 'Basic (19,90€/Monat) - 5 Analysen', analyses: 5 },
    { value: 'standard', label: 'Standard (49,90€/Monat) - 15 Analysen', analyses: 15 },
    { value: 'pro', label: 'Pro (129€/Monat) - 50 Analysen', analyses: 50 },
    { value: 'business', label: 'Business (249€/Monat) - 120 Analysen', analyses: 120 },
    { value: 'b2b_starter', label: 'B2B Starter (2.490€/Jahr) - 300 Analysen', analyses: 300 },
    { value: 'b2b_professional', label: 'B2B Professional (6.990€/Jahr) - 1000 Analysen', analyses: 1000 },
    { value: 'b2b_enterprise', label: 'B2B Enterprise (14.990€/Jahr) - 2500 Analysen', analyses: 2500 },
    { value: 'b2b_corporate', label: 'B2B Corporate (29.990€/Jahr) - 6000 Analysen', analyses: 6000 },
  ];

  async function handleGrant() {
    if (!email.trim()) {
      setError('Bitte E-Mail-Adresse eingeben');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/grant-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          subscription_type: subscriptionType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Freischalten');
      }

      setResult(`✅ Erfolgreich! User "${email}" hat jetzt "${subscriptionType}" mit ${data.analyses_remaining} Analysen.`);
      setEmail('');
    } catch (e: any) {
      setError(e.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <Link href="/" className="text-2xl font-bold text-slate-900 inline-flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-blue-600 rounded-md"></div>
            BescheidRecht
          </Link>
          <h1 className="text-3xl font-black text-slate-900 mt-4">Admin Panel</h1>
          <p className="text-slate-500 mt-2">User manuell freischalten</p>
        </div>

        {/* Warnung */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-amber-900 mb-2">⚠️ WICHTIG</h3>
          <p className="text-sm text-amber-800">
            Diese Seite sollte später mit echtem Admin-Login geschützt werden!
            Aktuell kann jeder, der die URL kennt, User freischalten.
          </p>
        </div>

        {/* Formular */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">User freischalten</h2>

          {/* E-Mail */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              E-Mail-Adresse des Users
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@beispiel.de"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900"
            />
          </div>

          {/* Subscription Type */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Abo-Typ
            </label>
            <select
              value={subscriptionType}
              onChange={(e) => setSubscriptionType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900"
            >
              {subscriptionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Erfolgs-/Fehlermeldung */}
          {result && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
              {result}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleGrant}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Wird freigeschaltet...' : 'User freischalten'}
          </button>
        </div>

        {/* Anleitung */}
        <div className="bg-slate-100 rounded-2xl p-6 mt-6">
          <h3 className="font-bold text-slate-900 mb-3">📝 Anleitung</h3>
          <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
            <li>User muss sich ZUERST registriert haben</li>
            <li>Geben Sie die E-Mail-Adresse des Users ein</li>
            <li>Wählen Sie den Abo-Typ</li>
            <li>Klicken Sie "User freischalten"</li>
            <li>User kann jetzt Dokumente hochladen (limitiert)</li>
          </ol>
        </div>

        {/* Zurück */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-blue-600 font-bold text-sm uppercase tracking-widest hover:underline"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </main>
  );
}
