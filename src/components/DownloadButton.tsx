'use client';
import React from 'react';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface DownloadProps {
  content: string; // Der von der KI generierte Text
  fileName?: string;
}

export default function DownloadButton({ content, fileName = "Widerspruch_BescheidRecht.pdf" }: DownloadProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Einfaches Styling für das PDF
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    // Textumbruch-Logik, damit der Text nicht über den Rand geht
    const splitText = doc.splitTextToSize(content, 170);
    doc.text(splitText, 15, 20);
    
    // Download auslösen
    doc.save(fileName);
  };

  return (
    <button 
      onClick={generatePDF}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
    >
      <Download size={20} />
      Dokument als PDF speichern
    </button>
  );
}
