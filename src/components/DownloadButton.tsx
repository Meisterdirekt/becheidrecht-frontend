'use client';
import React from 'react';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface DownloadProps {
  content: string;
  fileName?: string;
  label?: string;
  className?: string;
}

export default function DownloadButton({
  content,
  fileName = "Widerspruch_BescheidRecht.pdf",
  label = "Dokument als PDF speichern",
  className,
}: DownloadProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(content, 170);
    doc.text(splitText, 15, 20);
    doc.save(fileName);
  };

  return (
    <button
      type="button"
      onClick={generatePDF}
      className={
        className ??
        "flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
      }
    >
      <Download size={20} />
      {label}
    </button>
  );
}
