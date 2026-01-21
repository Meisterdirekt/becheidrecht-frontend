"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function uploadAndAnalyze() {
    if (!file) return;

    setLoading(true);
    setText("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setText(data.text || "Kein Text erkannt");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold mb-4">
        Behördenschreiben endlich verstehen
      </h1>

      <p className="text-slate-300 mb-6">
        Lade ein Dokument oder Foto hoch – wir lesen den Text aus.
      </p>

      <label className="bg-blue-600 px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700">
        Dokument hochladen
        <input
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>

      {file && (
        <button
          onClick={uploadAndAnalyze}
          className="mt-4 bg-green-600 px-6 py-3 rounded-lg hover:bg-green-700"
        >
          {loading ? "Analysiere..." : "Text auslesen"}
        </button>
      )}

      {text && (
        <div className="mt-8 max-w-3xl bg-slate-800 p-6 rounded-lg text-sm whitespace-pre-wrap">
          {text}
        </div>
      )}
    </main>
  );
}
