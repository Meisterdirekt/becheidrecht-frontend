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

    // § 2 RDG Disclaimer (Pflicht)
    const disclaimer =
      "Hinweis gemäß § 2 RDG: Dieses Schreiben ist ein KI-gestützter Entwurf und kein Ersatz für eine " +
      "qualifizierte Rechtsberatung. Bei rechtlich komplexen Sachverhalten empfehlen wir die Konsultation " +
      "eines Rechtsanwalts oder einer Beratungsstelle.";
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(120);
    const disclaimerLines = doc.splitTextToSize(disclaimer, 170);
    doc.text(disclaimerLines, 15, pageHeight - 20);

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
