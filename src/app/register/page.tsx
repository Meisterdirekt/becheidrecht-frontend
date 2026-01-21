'use client';
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { data: { full_name: formData.name } }
    });

    if (authError) {
      setError(authError.message);
    } else {
      alert("Erfolg! Bitte bestätige deine E-Mail (Check auch den Spam-Ordner).");
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#05070a] text-white flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Account erstellen</h1>
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-4 text-sm">{error}</div>}
        <form className="space-y-4" onSubmit={handleRegister}>
          <input type="text" placeholder="Name" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4" onChange={(e) => setFormData({...formData, name: e.target.value})}/>
          <input type="email" placeholder="E-Mail" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4" onChange={(e) => setFormData({...formData, email: e.target.value})}/>
          <input type="password" placeholder="Passwort" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4" onChange={(e) => setFormData({...formData, password: e.target.value})}/>
          <button disabled={loading} className="w-full bg-blue-600 py-4 rounded-xl font-bold flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : 'Jetzt registrieren'}
          </button>
        </form>
      </div>
    </main>
  );
}
