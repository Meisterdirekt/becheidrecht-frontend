"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  password: string;
  passwordConfirm: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const redirectTo = next && next.startsWith("/") ? next : "/";
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [emailConfirmSent, setEmailConfirmSent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadConfig() {
      try {
        const res = await fetch("/api/auth-config", { cache: "no-store" });
        if (!res.ok) throw new Error("Config fehlgeschlagen");
        const data = await res.json();
        if (cancelled) return;
        if (data.configured && data.url && data.anonKey) {
          setSupabase(createBrowserClient(data.url, data.anonKey));
        } else {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          if (url && key) setSupabase(createBrowserClient(url, key));
        }
      } catch {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && key) setSupabase(createBrowserClient(url, key));
      }
      if (!cancelled) setConfigLoading(false);
    }
    loadConfig();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Pflichtfeld";
    if (!formData.lastName.trim()) newErrors.lastName = "Pflichtfeld";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Ungültige E-Mail-Adresse";
    if (formData.password.length < 8) newErrors.password = "Mindestens 8 Zeichen";
    if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = "Passwörter stimmen nicht überein";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!supabase) {
      setErrors({ email: "Registrierung derzeit nicht verfügbar. Bitte Supabase konfigurieren." });
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            street: formData.street.trim() || undefined,
            city: formData.city.trim() || undefined,
          },
        },
      });
      if (err) {
        setErrors({ email: err.message });
        return;
      }
      if (data.session) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setEmailConfirmSent(true);
      }
    } catch {
      setErrors({ email: "Ein Fehler ist aufgetreten. Bitte erneut versuchen." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-mesh text-white flex flex-col">
      <SiteNavSimple backHref="/" backLabel="Zurück zur Startseite" />
      <div className="flex-1 flex items-center justify-center p-6 py-16">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 md:p-10 shadow-xl">
          <Link href="/" className="text-[11px] text-white/40 hover:text-white uppercase tracking-wider transition-colors mb-6 inline-block">
            ← Startseite
          </Link>
          <h1 className="text-3xl font-black tracking-tight mb-8">Registrierung</h1>

          {emailConfirmSent ? (
            <div className="rounded-2xl bg-green-500/10 border border-green-500/30 p-6 space-y-4">
              <p className="text-green-200 text-sm leading-relaxed">
                Wir haben Ihnen eine E-Mail an <strong className="text-white">{formData.email}</strong> gesendet.
                Bitte klicken Sie den Link in der E-Mail, um Ihr Konto zu bestätigen.
              </p>
              <p className="text-white/60 text-xs">Posteingang und Spam-Ordner prüfen.</p>
              <Link href="/login" className="inline-block text-[var(--accent)] font-bold text-sm hover:underline">
                Zum Login
              </Link>
            </div>
          ) : (
            <>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit} noValidate>
                {(["firstName", "lastName"] as const).map((name) => (
                  <div key={name}>
                    <label className="label-upper">
                      {name === "firstName" ? "Vorname" : "Nachname"} <span className="text-[var(--accent)]">*</span>
                    </label>
                    <input
                      type="text"
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      autoComplete={name === "firstName" ? "given-name" : "family-name"}
                      className={`input-field ${errors[name] ? "border-red-500/50" : ""}`}
                      placeholder={name === "firstName" ? "Max" : "Mustermann"}
                    />
                    {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="label-upper">E-Mail <span className="text-[var(--accent)]">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    className={`input-field ${errors.email ? "border-red-500/50" : ""}`}
                    placeholder="name@beispiel.de"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="label-upper">Straße & Hausnummer <span className="text-white/30">(optional)</span></label>
                  <input type="text" name="street" value={formData.street} onChange={handleChange} autoComplete="street-address" className="input-field" placeholder="Musterstraße 1" />
                </div>
                <div>
                  <label className="label-upper">PLZ & Ort <span className="text-white/30">(optional)</span></label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} autoComplete="postal-code" className="input-field" placeholder="12345 Berlin" />
                </div>
                <div>
                  <label className="label-upper">Passwort <span className="text-[var(--accent)]">*</span></label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className={`input-field ${errors.password ? "border-red-500/50" : ""}`}
                    placeholder="Min. 8 Zeichen"
                  />
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="label-upper">Passwort wiederholen <span className="text-[var(--accent)]">*</span></label>
                  <input
                    type="password"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className={`input-field ${errors.passwordConfirm ? "border-red-500/50" : ""}`}
                    placeholder="Passwort wiederholen"
                  />
                  {errors.passwordConfirm && <p className="text-red-400 text-xs mt-1">{errors.passwordConfirm}</p>}
                </div>
                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || configLoading || !supabase}
                    className="w-full btn-primary py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {configLoading ? "Lade …" : isLoading ? "Wird erstellt …" : "Account erstellen"}
                  </button>
                </div>
              </form>
              <div className="mt-8 pt-8 border-t border-white/10 text-center">
                <p className="text-[12px] text-white/50">
                  Bereits ein Konto?{" "}
                  <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
                    Hier anmelden
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-white/60 text-sm">Lade …</div>}>
      <RegisterForm />
    </Suspense>
  );
}
