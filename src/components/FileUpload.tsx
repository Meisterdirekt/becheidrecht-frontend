'use client';
import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    // Simulation der Analyse
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto p-8 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/5 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
          <Upload size={32} />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Bescheid hier ablegen</p>
          <p className="text-sm text-gray-500">PDF oder Bild (max. 10MB)</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          id="file-upload" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <label 
          htmlFor="file-upload"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold cursor-pointer transition-all"
        >
          Datei auswählen
        </label>
        {file && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
            <FileText size={20} className="text-blue-400" />
            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
            <button onClick={handleUpload} disabled={loading} className="ml-4 text-blue-500 font-bold">
              {loading ? <Loader2 className="animate-spin" /> : 'Analyse starten'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
