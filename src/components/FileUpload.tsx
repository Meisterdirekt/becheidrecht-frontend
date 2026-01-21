'use client';
import React, { useState } from 'react';
import { Upload, FileCheck, Loader2 } from 'lucide-react';

// Wir fügen 'btnText' und 'analyzingText' als Variablen hinzu
export default function FileUpload({ btnText, analyzingText }: { btnText: string, analyzingText: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto p-12 rounded-3xl bg-blue-600/5 border-2 border-dashed border-blue-500/30">
      {!file ? (
        <label className="cursor-pointer block text-center">
          <Upload className="mx-auto mb-4 text-blue-500" size={48} />
          <span className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-bold inline-block transition-all">
            {btnText}
          </span>
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
      ) : (
        <div className="text-center">
          <FileCheck className="mx-auto mb-4 text-green-500" size={48} />
          <p className="mb-6 font-medium text-white">{file.name}</p>
          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-bold w-full flex justify-center items-center gap-2 transition-all"
          >
            {isUploading ? <><Loader2 className="animate-spin" /> {analyzingText}</> : 'Start'}
          </button>
        </div>
      )}
    </div>
  );
}
