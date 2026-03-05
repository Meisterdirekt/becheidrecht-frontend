/**
 * Erzeugt ein Test-Bescheid-PDF zum Hochladen auf /analyze.
 * Ausführen: node scripts/generate-test-bescheid.js
 * Ergebnis: public/test-bescheid.pdf
 */
const fs = require("fs");
const path = require("path");

// jspdf lädt in Node ohne DOM
const { jsPDF } = require("jspdf");

const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
doc.setFont("helvetica");
doc.setFontSize(11);

let y = 25;
doc.text("Jobcenter Musterstadt", 20, y);
y += 8;
doc.text("Aktenzeichen: BG-123456-2026", 20, y);
y += 6;
doc.text("Datum: 01.02.2026", 20, y);
y += 12;
doc.text("B e s c h e i d", 20, y);
y += 10;
doc.text("Leistungsbescheid nach dem Zweiten Buch Sozialgesetzbuch (SGB II)", 20, y);
y += 10;
doc.text("Hiermit wird über Ihren Antrag auf Leistungen nach dem SGB II entschieden.", 20, y);
y += 8;
doc.text("Ihre monatliche Leistung wird ab 01.03.2026 um 30 % gekürzt.", 20, y);
y += 8;
doc.text("Die Begründung erfolgt in der Anlage. Ein Rechtsmittelbelehrung ist beigefügt.", 20, y);
y += 12;
doc.text("Rechtsbehelfsbelehrung:", 20, y);
y += 6;
doc.text("Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen.", 20, y);
y += 5;
doc.text("Fristende: 02.03.2026.", 20, y);

const outPath = path.join(__dirname, "..", "public", "test-bescheid.pdf");
const buf = Buffer.from(doc.output("arraybuffer"));
fs.writeFileSync(outPath, buf);
console.log("Test-Bescheid geschrieben:", outPath);
