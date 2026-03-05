# 🔒 STARTSEITE - PAYWALL EINBAUEN

## 📝 ÄNDERUNGEN AN src/app/page.tsx

### **SCHRITT 1: Neue Imports hinzufügen**

**OBEN in der Datei, nach Zeile 5:**

```typescript
import { jsPDF } from 'jspdf';
import { useEffect } from 'react'; // NEU!
import { createBrowserClient } from '@supabase/ssr'; // SCHON DA
```

---

### **SCHRITT 2: Neue State-Variablen hinzufügen**

**In der Page-Komponente, nach Zeile 43:**

```typescript
export default function Page() {
  const [lang, setLang] = useState<keyof typeof translations>('DE');
  const [consent, setConsent] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ====== NEU HINZUFÜGEN ======
  const [user, setUser] = useState<any>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [supabase] = useState(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!url || !key) return null;
    return createBrowserClient(url, key);
  });
  // ====== ENDE NEU ======

  const t = translations[lang];
  const isRTL = lang === 'AR';
```

---

### **SCHRITT 3: User-Status beim Laden prüfen**

**Nach den State-Variablen hinzufügen:**

```typescript
  // ====== NEU: User & Subscription Status laden ======
  useEffect(() => {
    if (!supabase) {
      setLoadingAuth(false);
      return;
    }

    async function loadUserAndSubscription() {
      try {
        // User-Session holen
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setUser(null);
          setSubscriptionStatus({ subscription_type: 'free', analyses_remaining: 0 });
          setLoadingAuth(false);
          return;
        }

        setUser(session.user);

        // Subscription-Status holen
        const token = session.access_token;
        const response = await fetch('/api/subscription-status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSubscriptionStatus(data);
        } else {
          setSubscriptionStatus({ subscription_type: 'free', analyses_remaining: 0 });
        }
      } catch (error) {
        console.error('Error loading user/subscription:', error);
        setSubscriptionStatus({ subscription_type: 'free', analyses_remaining: 0 });
      } finally {
        setLoadingAuth(false);
      }
    }

    loadUserAndSubscription();
  }, [supabase]);
  // ====== ENDE NEU ======
```

---

### **SCHRITT 4: handleUpload anpassen - Counter reduzieren**

**Die bestehende handleUpload-Funktion ERSETZEN durch:**

```typescript
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ====== NEU: Subscription-Check ======
    if (!subscriptionStatus || subscriptionStatus.subscription_type === 'free' || subscriptionStatus.analyses_remaining <= 0) {
      setAnalysisResult(
        "⚠️ Sie haben keine Analysen mehr verfügbar. Bitte upgraden Sie Ihr Abo!"
      );
      return;
    }
    // ====== ENDE NEU ======

    if (!consent) {
      setAnalysisResult(
        "Bitte bestätigen Sie die Einwilligung, bevor Sie einen Bescheid hochladen."
      );
      return;
    }

    setFileName(file.name);
    setAnalysisResult("Omega-Logik entschlüsselt Daten... Bitte warten...");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Fehler bei der Analyse.");
      }

      const data = await response.json();
      setAnalysisData(data);

      // ====== NEU: Counter reduzieren ======
      if (supabase && user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const token = session.access_token;
          const useResponse = await fetch('/api/use-analysis', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (useResponse.ok) {
            const useData = await useResponse.json();
            // Subscription-Status aktualisieren
            setSubscriptionStatus({
              ...subscriptionStatus,
              analyses_remaining: useData.analyses_remaining,
              analyses_used: useData.analyses_used
            });
          }
        }
      }
      // ====== ENDE NEU ======

      let content: any = data.musterschreiben ?? "";

      // [Rest der handleUpload-Funktion bleibt gleich...]
      if (content && typeof content === "object") {
        const rubrum = content.rubrum ?? "";
        const chronologie = content.chronologie ?? "";
        const schluss = content.schluss ?? "";
        content = [rubrum, chronologie, schluss].filter(Boolean).join("\n\n");
      }
      else if (typeof content === "string" && content.trim().startsWith("{")) {
        try {
          const nested = JSON.parse(content);
          if (nested.musterschreiben) {
            const ms = nested.musterschreiben;
            const rubrum = ms.rubrum ?? "";
            const chronologie = ms.chronologie ?? "";
            const schluss = ms.schluss ?? "";
            content = [rubrum, chronologie, schluss].filter(Boolean).join("\n\n");
          }
        } catch {}
      }

      setAnalysisResult(content || "Keine Musterschreiben-Daten vorhanden.");

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Fehler bei der Analyse.";
      setAnalysisResult(msg);
    }
    setLoading(false);
  };
```

---

### **SCHRITT 5: Upload-Bereich mit Paywall**

**Suchen Sie den Upload-Bereich (ca. Zeile 195-213) und ERSETZEN Sie ihn durch:**

```typescript
        {/* ====== Upload-Bereich MIT PAYWALL ====== */}
        <div
          onClick={() => {
            // Nur klickbar wenn User eingeloggt und Analysen verfügbar
            if (!loadingAuth && user && subscriptionStatus?.analyses_remaining > 0 && consent && !loading) {
              fileInputRef.current?.click();
            }
          }}
          className={`w-full max-w-3xl mx-auto mb-6 p-10 md:p-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 shadow-xl ${
            !loadingAuth && user && subscriptionStatus?.analyses_remaining > 0 && consent && !loading
              ? 'border-blue-400 cursor-pointer hover:shadow-2xl hover:from-white hover:to-slate-50 transition-all'
              : 'border-slate-300 cursor-not-allowed opacity-70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleUpload}
            disabled={!user || !subscriptionStatus || subscriptionStatus.analyses_remaining <= 0 || !consent || loading}
          />

          {/* Loading Auth */}
          {loadingAuth && (
            <div className="text-center">
              <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 font-bold uppercase tracking-widest">Lade...</p>
            </div>
          )}

          {/* Nicht eingeloggt */}
          {!loadingAuth && !user && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl bg-slate-300 text-slate-500">
                🔒
              </div>
              <h3 className="font-bold text-slate-900 mb-3 uppercase tracking-widest">
                Anmeldung erforderlich
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Bitte melden Sie sich an, um Dokumente zu analysieren.
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/login"
                  className="px-6 py-3 bg-blue-600 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all"
                >
                  Anmelden
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-3 bg-slate-200 text-slate-900 font-bold uppercase tracking-widest rounded-xl hover:bg-slate-300 transition-all"
                >
                  Registrieren
                </Link>
              </div>
            </div>
          )}

          {/* Eingeloggt, aber kein Abo / Limit erreicht */}
          {!loadingAuth && user && subscriptionStatus && (subscriptionStatus.subscription_type === 'free' || subscriptionStatus.analyses_remaining <= 0) && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl bg-amber-100 text-amber-600 border-2 border-amber-300">
                ⚠️
              </div>
              <h3 className="font-bold text-slate-900 mb-3 uppercase tracking-widest">
                {subscriptionStatus.subscription_type === 'free' ? 'Kein Abo aktiv' : 'Limit erreicht'}
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                {subscriptionStatus.subscription_type === 'free'
                  ? 'Sie benötigen ein Abo, um Dokumente zu analysieren.'
                  : `Sie haben alle ${subscriptionStatus.analyses_total} Analysen verbraucht.`}
              </p>
              {subscriptionStatus.subscription_type !== 'free' && (
                <p className="text-xs text-slate-500 mb-6">
                  Abo-Typ: <strong>{subscriptionStatus.subscription_type}</strong>
                </p>
              )}
              <div className="flex gap-3 justify-center">
                <a
                  href="#pricing"
                  className="px-6 py-3 bg-blue-600 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all"
                >
                  {subscriptionStatus.subscription_type === 'free' ? 'Jetzt kaufen' : 'Upgraden'}
                </a>
              </div>
            </div>
          )}

          {/* Eingeloggt + Abo aktiv */}
          {!loadingAuth && user && subscriptionStatus && subscriptionStatus.analyses_remaining > 0 && (
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl shadow-lg ${
                consent && !loading ? 'bg-blue-600 text-white ring-4 ring-blue-300' :
                consent && loading ? 'bg-blue-600 text-white' :
                'bg-slate-300 text-slate-500'
              }`}>
                {loading ? (
                  <span className="inline-block w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : fileName ? (
                  '✓'
                ) : (
                  '↑'
                )}
              </div>
              <h3 className="font-bold text-slate-900 mb-1 uppercase tracking-widest text-center">
                {loading ? 'Analysiere…' : fileName ? fileName : t.dropzone}
              </h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest text-center mb-3">
                {t.dropzoneSub}
              </p>
              <p className="text-sm text-blue-600 font-bold">
                📊 {subscriptionStatus.analyses_remaining} von {subscriptionStatus.analyses_total} Analysen verfügbar
              </p>
            </div>
          )}
        </div>
        {/* ====== ENDE Upload-Bereich ====== */}
```

---

## 🎯 ZUSAMMENFASSUNG DER ÄNDERUNGEN:

```
1. ✅ Neue Imports (useEffect)
2. ✅ Neue State-Variablen (user, subscriptionStatus)
3. ✅ useEffect zum Laden des User-Status
4. ✅ handleUpload: Counter-Reduzierung
5. ✅ Upload-Bereich: Bedingte Anzeige
```

---

## 🚀 WIE EINBAUEN?

### **OPTION A: Ich mache es für Sie** (EMPFOHLEN)
```
Sagen Sie: "Mach Option A"
→ Ich erstelle eine neue page.tsx mit allen Änderungen
→ Sie ersetzen die alte Datei
```

### **OPTION B: Sie machen es selbst**
```
1. Öffnen Sie src/app/page.tsx
2. Fügen Sie die Code-Snippets ein (siehe oben)
3. Speichern
4. Testen
```

---

## ❓ WAS WOLLEN SIE?

**Sagen Sie mir:**
- "Option A - mach du es" ⭐ SCHNELL
- "Option B - ich mach es selbst"

Dann geht es weiter! 💪
