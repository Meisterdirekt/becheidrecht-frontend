'use client';
import React from 'react';
import { Download, Printer } from 'lucide-react';
import type { jsPDF } from 'jspdf';

interface DownloadProps {
  content: string;
  findings?: string[];
  fileName?: string;
  label?: string;
  className?: string;
}

function buildPDF(doc: jsPDF, content: string, findings?: string[]): jsPDF {
  let yPos = 20;

  // Auffälligkeiten / Analyseergebnis — vor dem Brief
  if (findings && findings.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Analyseergebnis — Erkannte Auffälligkeiten:", 15, yPos);
    yPos += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const finding of findings) {
      const lines = doc.splitTextToSize(`• ${finding}`, 165);
      if (yPos + lines.length * 5 > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(lines, 18, yPos);
      yPos += lines.length * 5 + 2;
    }

    // Trennlinie
    yPos += 4;
    doc.setDrawColor(180);
    doc.line(15, yPos, 195, yPos);
    yPos += 8;
  }

  // Brief-Text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const splitText = doc.splitTextToSize(content, 170);

  // Seitenumbruch-Logik für langen Text
  for (const line of splitText as string[]) {
    if (yPos > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, 15, yPos);
    yPos += 6;
  }

  // § 2 RDG Disclaimer (Pflicht)
  const disclaimer =
    "Hinweis gemäß § 2 RDG: Dieses Schreiben ist ein KI-gestützter Entwurf und kein Ersatz für eine " +
    "qualifizierte Rechtsberatung. Bei rechtlich komplexen Sachverhalten ziehen Sie bitte die Konsultation " +
    "eines Rechtsanwalts oder einer Beratungsstelle (z.B. VdK, Sozialverband) in Betracht.";
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(120);
  const disclaimerLines = doc.splitTextToSize(disclaimer, 170);
  doc.text(disclaimerLines, 15, pageHeight - 20);

  return doc;
}

export default function DownloadButton({
  content,
  findings,
  fileName = "Widerspruch_BescheidRecht.pdf",
  label = "Dokument als PDF speichern",
  className,
}: DownloadProps) {
  const handleDownload = async () => {
    const { jsPDF } = await import('jspdf');
    buildPDF(new jsPDF(), content, findings).save(fileName);
  };

  const handlePrint = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = buildPDF(new jsPDF(), content, findings);
    const blobUrl = doc.output("bloburl");
    const printWindow = window.open(blobUrl.toString(), "_blank");
    if (printWindow) {
      printWindow.addEventListener("load", () => {
        printWindow.print();
      });
    }
  };

  const btnBase =
    "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-white";

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleDownload}
        className={className ?? `${btnBase} bg-green-600 hover:bg-green-700`}
      >
        <Download size={20} aria-hidden="true" />
        {label}
      </button>
      <button
        type="button"
        onClick={handlePrint}
        aria-label="Dokument direkt drucken"
        className={`${btnBase} bg-[var(--accent)] hover:bg-[var(--accent-hover)]`}
      >
        <Printer size={20} aria-hidden="true" />
        Direkt drucken
      </button>
    </div>
  );
}
