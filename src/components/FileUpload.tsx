'use client';
import React, { useState, useEffect } from 'react';
import { Upload, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DownloadButton from './DownloadButton';

export default function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: sub } = await supabase.from('user_subscriptions').select('analyses_left').eq('id', user.id).single();
        if (sub) setCredits(sub.analyses_left);
      }
    };
    fetchUserAndCredits();
  }, []);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleStartAnalysis = async () => {
    if (!file || !user || credits === null || credits <= 0) return;

    setIsUploading(true);
    try {
      const base64Image = await convertToBase64(file);

      // API AUFRUF AN DEIN BACKEND
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, language: 'Deutsch' }),
      });

      const data = await response.json();

      if (data.result) {
        setAnalysisResult(data.result);
        // CREDIT ABZIEHEN
        const newCredits = credits - 1;
        await supabase.from('user_subscriptions').update({ analyses_left: newCredits }).eq('id', user.id);
        setCredits(newCredits);
      } else {
        alert("Fehler bei der Analyse: " + (data.error || "Unbekannter Fehler"));
      }
    } catch (err) {
      console.error(err);
      alert("Ein technischer Fehler ist aufgetreten.");
    }
    setIsUploading(false);
  };

  if (!user) return <div className="text-center p-10 bg-white/5 rounded-3xl border border-white/10 text-gray-400 italic">Bitte logge dich ein, um fortzufahren.</div>;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Credit Anzeige */}
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
        <span className="text-sm text-gray-400 italic">Account: {user.email}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Guthaben:</span>
          <span className={`font-bold ${credits! > 0 ? 'text-green-400' : 'text-red-500'}`}>{credits} Analysen</span>
        </div>
      </div>

      {/* Upload Bereich */}
      <div className={`relative group p-12 rounded-[2rem] border-2 border-dashed transition-all ${file ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-blue-500/30'}`}>
        {!file ? (
          <label className="flex flex-col items-center cursor-pointer">
            <Upload className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={48} />
            <span className="text-xl font-bold mb-2 text-white">Bescheid hochladen</span>
            <span className="text-sm text-gray-500">JPG, PNG oder PDF (max. 10MB)</span>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm mb-4">
              <ShieldCheck size={16} /> Datei bereit zur Analyse
            </div>
            <p className="text-2xl font-bold text-white mb-8">{file.name}</p>
            
            {!analysisResult && (
              <button 
                onClick={handleStartAnalysis}
                disabled={isUploading || credits! <= 0}
                className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-[0_0_30px_-10px_rgba(37,99,235,0.5)] transition-all flex justify-center items-center gap-3 disabled:opacity-50"
              >
                {isUploading ? <><Loader2 className="animate-spin" /> Die "Omega-Instanz" prüft...</> : 'Rechtliche Analyse starten'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Ergebnis Anzeige */}
      {analysisResult && (
        <div className="mt-12 space-y-6 animate-in slide-in-from-bottom-5 duration-700">
           <div className="flex items-center gap-3 text-blue-400 font-bold text-lg"><ShieldCheck /> Analyse-Ergebnis & Widerspruch</div>
           <div className="bg-[#0a0c10] border border-white/10 p-8 rounded-[2rem] text-gray-300 font-serif leading-relaxed text-lg shadow-inner">
             <pre className="whitespace-pre-wrap">{analysisResult}</pre>
           </div>
           <div className="flex justify-center pt-4">
              <DownloadButton content={analysisResult} />
           </div>
        </div>
      )}
    </div>
  );
}
