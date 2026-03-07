"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from "@supabase/ssr";

/**
 * ADMIN-SEITE
 *
 * Geschützt: Nur eingeloggte User mit Admin-E-Mail haben Zugang.
 * Admin-E-Mails werden serverseitig über ADMIN_EMAILS geprüft.
 */

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [subscriptionType, setSubscriptionType] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [session, setSession] = useState<{ access_token: string } | null>(null);

  // ── Kunden-Übersicht ─────────────────────────────────────────────────────
  interface Customer {
    user_id: string;
    email: string;
    subscription_type: string;
    status: string;
    analyses_total: number;
    analyses_remaining: number;
    analyses_used: number;
    payment_method: string | null;
    purchased_at: string | null;
    expires_at: string | null;
    updated_at: string | null;
    org_name: string | null;
    org_role: string | null;
  }
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [customersSearch, setCustomersSearch] = useState('');
  const [customersStatusFilter, setCustomersStatusFilter] = useState('');
  const [customersLoaded, setCustomersLoaded] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        const configRes = await fetch("/api/auth-config", { cache: "no-store" });
        const config = await configRes.json();
        if (!config.configured) {
          setAccessDenied(true);
          setCheckingAuth(false);
          return;
        }
        const supabase = createBrowserClient(config.url, config.anonKey);
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!s) {
          setAccessDenied(true);
          setCheckingAuth(false);
          return;
        }
        setSession(s);

        // Test-Anfrage an Admin-API um Berechtigung zu prüfen
        const testRes = await fetch('/api/admin/grant-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${s.access_token}`
          },
          body: JSON.stringify({ email: '__access_check__', subscription_type: 'basic' })
        });
        // 403 = kein Admin, 400 = Admin aber ungültige Daten (= Zugang ok)
        if (testRes.status === 403) {
          setAccessDenied(true);
        }
      } catch {
        setAccessDenied(true);
      }
      setCheckingAuth(false);
    }
    checkAccess();
  }, []);

  async function loadCustomers(search?: string, status?: string) {
    if (!session) return;
    setCustomersLoading(true);
    setCustomersError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/customers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler beim Laden');
      setCustomers(data.customers);
      setCustomersLoaded(true);
    } catch (e: unknown) {
      setCustomersError(e instanceof Error ? e.message : 'Fehler aufgetreten');
    } finally {
      setCustomersLoading(false);
    }
  }

  function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function isExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }

  // ── B2B Einrichtung ────────────────────────────────────────────────────────
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('sozialeinrichtung');
  const [orgContactEmail, setOrgContactEmail] = useState('');
  const [orgAdminEmail, setOrgAdminEmail] = useState('');
  const [orgSubType, setOrgSubType] = useState('b2b_starter');
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgResult, setOrgResult] = useState<string | null>(null);
  const [orgError, setOrgError] = useState<string | null>(null);

  async function handleCreateOrg() {
    if (!orgName.trim() || !orgContactEmail.trim() || !orgAdminEmail.trim()) {
      setOrgError('Einrichtungsname, Kontakt-E-Mail und Admin-E-Mail sind Pflichtfelder');
      return;
    }
    setOrgLoading(true);
    setOrgError(null);
    setOrgResult(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session) headers['Authorization'] = `Bearer ${session.access_token}`;
      const res = await fetch('/api/admin/create-org', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          org_name: orgName.trim(),
          org_type: orgType,
          contact_email: orgContactEmail.trim(),
          admin_email: orgAdminEmail.trim(),
          subscription_type: orgSubType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler beim Erstellen');
      setOrgResult(data.message);
      setOrgName(''); setOrgContactEmail(''); setOrgAdminEmail('');
    } catch (e: unknown) {
      setOrgError(e instanceof Error ? e.message : 'Fehler aufgetreten');
    } finally {
      setOrgLoading(false);
    }
  }

  const subscriptionTypes = [
    { value: 'single', label: 'Einzelkauf (19,90€) - 1 Analyse', analyses: 1 },
    { value: 'basic', label: 'Basic (12,90€/Monat) - 5 Analysen', analyses: 5 },
    { value: 'standard', label: 'Standard (27,90€/Monat) - 15 Analysen', analyses: 15 },
    { value: 'pro', label: 'Pro (75€/Monat) - 50 Analysen', analyses: 50 },
    { value: 'business', label: 'Business (159€/Monat) - 120 Analysen', analyses: 120 },
    { value: 'b2b_starter', label: 'B2B Starter (2.490\u20ac/Jahr) - 300 Analysen', analyses: 300 },
    { value: 'b2b_professional', label: 'B2B Professional (6.990\u20ac/Jahr) - 1000 Analysen', analyses: 1000 },
    { value: 'b2b_enterprise', label: 'B2B Enterprise (14.990\u20ac/Jahr) - 2500 Analysen', analyses: 2500 },
    { value: 'b2b_corporate', label: 'B2B Corporate (29.990\u20ac/Jahr) - 6000 Analysen', analyses: 6000 },
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
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/admin/grant-subscription', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: email.trim(),
          subscription_type: subscriptionType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Freischalten');
      }

      setResult(`Erfolgreich! User "${email}" hat jetzt "${subscriptionType}" mit ${data.analyses_remaining} Analysen.`);
      setEmail('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Zugang wird geprüft...</p>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Zugriff verweigert</h1>
          <p className="text-slate-500 mb-6">Sie haben keine Berechtigung für den Admin-Bereich.</p>
          <Link href="/" className="text-blue-600 font-bold hover:underline">Zur Startseite</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <Link href="/" className="text-2xl font-bold text-slate-900 inline-flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-blue-600 rounded-md"></div>
            BescheidRecht
          </Link>
          <h1 className="text-3xl font-black text-slate-900 mt-4">Admin Panel</h1>
          <p className="text-slate-500 mt-2">Kunden verwalten und freischalten</p>
        </div>

        {/* Kunden-Übersicht */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Kunden-Übersicht</h2>
              {customersLoaded && (
                <p className="text-slate-400 text-sm mt-1">{customers.length} Kunden</p>
              )}
            </div>
            <button
              onClick={() => loadCustomers(customersSearch, customersStatusFilter)}
              disabled={customersLoading}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition-all"
            >
              {customersLoading ? 'Laden...' : customersLoaded ? 'Aktualisieren' : 'Kunden laden'}
            </button>
          </div>

          {/* Filter */}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={customersSearch}
              onChange={(e) => setCustomersSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadCustomers(customersSearch, customersStatusFilter)}
              placeholder="E-Mail suchen..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 text-sm"
            />
            <select
              value={customersStatusFilter}
              onChange={(e) => {
                setCustomersStatusFilter(e.target.value);
                if (customersLoaded) loadCustomers(customersSearch, e.target.value);
              }}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 text-sm"
            >
              <option value="">Alle Status</option>
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
              <option value="expired">Abgelaufen</option>
            </select>
          </div>

          {customersError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm mb-4">
              {customersError}
            </div>
          )}

          {customersLoaded && customers.length > 0 && (
            <div className="overflow-x-auto -mx-8 px-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-3 pr-4 font-bold text-slate-600 whitespace-nowrap">E-Mail</th>
                    <th className="text-left py-3 pr-4 font-bold text-slate-600 whitespace-nowrap">Abo</th>
                    <th className="text-center py-3 pr-4 font-bold text-slate-600 whitespace-nowrap">Status</th>
                    <th className="text-right py-3 pr-4 font-bold text-slate-600 whitespace-nowrap">Analysen</th>
                    <th className="text-left py-3 pr-4 font-bold text-slate-600 whitespace-nowrap">Einrichtung</th>
                    <th className="text-left py-3 pr-4 font-bold text-slate-600 whitespace-nowrap">Zahlung</th>
                    <th className="text-left py-3 font-bold text-slate-600 whitespace-nowrap">Läuft ab</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const expired = isExpired(c.expires_at);
                    const usagePercent = c.analyses_total > 0
                      ? Math.round((c.analyses_used / c.analyses_total) * 100)
                      : 0;
                    return (
                      <tr key={c.user_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 pr-4 text-slate-900 font-medium max-w-[200px] truncate">{c.email}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${
                            c.subscription_type?.startsWith('b2b') ? 'bg-emerald-100 text-emerald-800' :
                            c.subscription_type === 'pro' || c.subscription_type === 'business' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {c.subscription_type || '—'}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                            expired ? 'bg-red-500' :
                            c.status === 'active' ? 'bg-green-500' :
                            'bg-slate-300'
                          }`} title={expired ? 'Abgelaufen' : c.status} />
                        </td>
                        <td className="py-3 pr-4 text-right whitespace-nowrap">
                          <span className={`font-mono text-xs ${c.analyses_remaining <= 0 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                            {c.analyses_remaining}/{c.analyses_total}
                          </span>
                          {c.analyses_total > 0 && (
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-1 ml-auto">
                              <div
                                className={`h-full rounded-full ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-slate-600 text-xs max-w-[140px] truncate">
                          {c.org_name ? (
                            <span>{c.org_name} <span className="text-slate-400">({c.org_role})</span></span>
                          ) : '—'}
                        </td>
                        <td className="py-3 pr-4 text-slate-500 text-xs">{c.payment_method || '—'}</td>
                        <td className={`py-3 text-xs whitespace-nowrap ${expired ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                          {formatDate(c.expires_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {customersLoaded && customers.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-6">Keine Kunden gefunden.</p>
          )}

          {!customersLoaded && !customersLoading && (
            <p className="text-slate-400 text-sm text-center py-6">
              Klicke &quot;Kunden laden&quot; um die Übersicht anzuzeigen.
            </p>
          )}
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
            <li>Klicken Sie &quot;User freischalten&quot;</li>
            <li>User kann jetzt Dokumente hochladen (limitiert)</li>
          </ol>
        </div>

        {/* B2B Einrichtung erstellen */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
          <h2 className="text-xl font-bold text-slate-900 mb-1">B2B-Einrichtung erstellen</h2>
          <p className="text-slate-500 text-sm mb-6">
            Erstellt eine neue Einrichtung mit Analyse-Pool. Der Admin-User muss bereits registriert sein.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Einrichtungsname *</label>
              <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Caritas Kreisverband Münster e.V."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Einrichtungstyp</label>
                <select value={orgType} onChange={e => setOrgType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900">
                  {[['caritas','Caritas'],['diakonie','Diakonie'],['vdk','VdK'],['sovd','SoVD'],['awo','AWO'],['drk','DRK'],
                    ['schuldnerberatung','Schuldnerberatung'],['migrationsberatung','Migrationsberatung'],
                    ['jobcenter','Jobcenter'],['sozialeinrichtung','Sozialeinrichtung'],['sonstige','Sonstige']].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">B2B-Plan</label>
                <select value={orgSubType} onChange={e => setOrgSubType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900">
                  <option value="b2b_starter">Starter — 300 Analysen/Jahr</option>
                  <option value="b2b_professional">Professional — 1.000 Analysen/Jahr</option>
                  <option value="b2b_enterprise">Enterprise — 2.500 Analysen/Jahr</option>
                  <option value="b2b_corporate">Corporate — 6.000 Analysen/Jahr</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Kontakt-E-Mail der Einrichtung *</label>
              <input type="email" value={orgContactEmail} onChange={e => setOrgContactEmail(e.target.value)} placeholder="info@caritas-muenster.de"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">E-Mail des ersten Admins (muss registriert sein) *</label>
              <input type="email" value={orgAdminEmail} onChange={e => setOrgAdminEmail(e.target.value)} placeholder="admin@caritas-muenster.de"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900" />
            </div>

            {orgResult && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">{orgResult}</div>}
            {orgError && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">{orgError}</div>}

            <button onClick={handleCreateOrg} disabled={orgLoading}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-all">
              {orgLoading ? 'Wird erstellt...' : 'Einrichtung erstellen'}
            </button>
          </div>
        </div>

        {/* B2B-Werkzeuge */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
          <h3 className="font-black text-slate-900 text-lg mb-1">B2B-Werkzeuge</h3>
          <p className="text-slate-500 text-sm mb-6">Angebote und Rahmenverträge für Einrichtungen erstellen</p>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/angebot"
              target="_blank"
              className="flex flex-col gap-1.5 p-5 rounded-xl border-2 border-blue-100 bg-blue-50 hover:border-blue-400 transition-all"
            >
              <span className="text-xl">📄</span>
              <span className="font-black text-slate-900 text-sm">Angebot erstellen</span>
              <span className="text-slate-500 text-xs leading-snug">3-seitige Preisübersicht mit Konditionen — als PDF drucken</span>
            </Link>
            <Link
              href="/rahmenvertrag"
              target="_blank"
              className="flex flex-col gap-1.5 p-5 rounded-xl border-2 border-slate-100 bg-slate-50 hover:border-slate-400 transition-all"
            >
              <span className="text-xl">✍️</span>
              <span className="font-black text-slate-900 text-sm">Rahmenvertrag</span>
              <span className="text-slate-500 text-xs leading-snug">Unterschriftsreifer Vertrag (10 §§) — ausfüllen und als PDF drucken</span>
            </Link>
          </div>
          <p className="text-slate-400 text-xs mt-4">
            Tipp: Erst Angebot schicken → nach Zusage Rahmenvertrag ausfüllen → beide als PDF speichern
          </p>
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
