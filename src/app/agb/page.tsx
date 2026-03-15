"use client";

import React from "react";

import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function AGBPage() {
  return (
    <main id="main-content" className="min-h-screen bg-mesh text-[var(--text)] flex flex-col">
      <SiteNavSimple backHref="/" backLabel="Zurück zur Startseite" />
      <div className="max-w-4xl mx-auto px-6 py-20 flex-grow">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-2">Rechtliches</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-16">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <section className="space-y-12 text-[var(--text-muted)] text-sm leading-relaxed">
          <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-8">
            <h2 className="text-[var(--accent)] font-bold uppercase tracking-widest text-xs mb-4">Wichtiger Hinweis – Keine Rechtsberatung</h2>
            <p className="text-[var(--text)] font-medium mb-4">
              BescheidRecht ist ein rein technologisches Analyse- und Textwerkzeug von Hendrik Berkensträter. Wir erbringen <strong>keine Rechtsberatung</strong> und keine Rechtsdienstleistungen im Sinne des Rechtsdienstleistungsgesetzes (RDG). Die angebotenen Funktionen (automatisierte Bescheidanalyse, Erstellung von Schreiben-Entwürfen wie Widersprüche oder Anträge) dienen ausschließlich der <strong>Orientierung und Vorbereitung</strong>. Sie ersetzen in keinem Fall die Prüfung durch eine Rechtsanwältin, einen Rechtsanwalt oder eine andere befugte Stelle. Eine Haftung für die inhaltliche Richtigkeit, Vollständigkeit oder rechtliche Wirksamkeit der erzeugten Texte wird ausgeschlossen (siehe Ziff. 7).
            </p>
            <p className="text-[var(--text)] text-xs">
              Stand: Die jeweils auf der Website angezeigten AGB gelten. Durch Nutzung des Angebots nach Registrierung bzw. Kauf akzeptieren Sie diese Bedingungen.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">1. Geltungsbereich und Vertragspartner</h2>
            <p className="text-[var(--text)] mb-4">
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen Ihnen und dem Anbieter über die Nutzung der Website bescheidrecht.de sowie der damit verbundenen Dienste (Analyse von Bescheiden, Erstellung von Schreiben-Entwürfen, Nutzerkonto, Paketkauf).
            </p>
            <p className="text-[var(--text)]">
              <strong>Vertragspartner</strong> für alle Leistungen ist:<br />
              Hendrik Berkensträter, Antoniusstraße 47, 49377 Vechta, E-Mail: kontakt@bescheidrecht.de.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">2. Vertragsschluss</h2>
            <p className="text-[var(--text)]">
              Der Vertrag über ein kostenpflichtiges Paket kommt zustande, wenn Sie das gewählte Paket auf der Website oder über den angegebenen Vertriebsweg (Mollie) bestellen und die Zahlung erfolgt bzw. bestätigt wird. Die Bestätigung des Vertragsschlusses erfolgt durch E-Mail oder durch die Bereitstellung des Leistungsumfangs (z. B. Gutschrift der Analysen). Für die Nutzung der kostenlosen Bereiche (z. B. Registrierung, Anzeige der Website) gilt mit der Registrierung bzw. Nutzung die Zustimmung zu diesen AGB.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">3. Leistungsumfang</h2>
            <p className="text-[var(--text)]">
              Der Nutzer erhält mit dem Erwerb eines Pakets das Recht, die auf der Website beschriebenen Leistungen zu nutzen (insbesondere die automatisierte Analyse hochgeladener Bescheide und die Erstellung von Schreiben-Entwürfen). Die genaue Anzahl der Analysen und der Umfang ergeben sich aus der Darstellung des jeweiligen Pakets beim Kauf. Die Ergebnisse (Analysen, Texte) dienen ausschließlich der Orientierung und ersetzen keine professionelle Rechtsprüfung oder anwaltliche Beratung. Ein Anspruch auf bestimmte technische Verfügbarkeit (z. B. 100 % Laufzeit der Server) besteht nur im Rahmen der gesetzlichen Vorgaben; geplante Wartungen werden bei Möglichkeit angekündigt.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">4. Widerrufsrecht (Verbraucher)</h2>
            <p className="text-[var(--text)] mb-4">
              <strong>4.1</strong> Wenn Sie Verbraucher im Sinne von § 13 BGB sind (natürliche Person, Geschäft zu einem Zweck, der weder Ihrer gewerblichen noch Ihrer selbständigen beruflichen Tätigkeit zugerechnet werden kann), steht Ihnen ein Widerrufsrecht nach folgender Maßgabe zu.
            </p>
            <p className="text-[var(--text)] mb-4">
              <strong>4.2 Widerrufsfrist:</strong> Sie können Ihre Vertragserklärung innerhalb von 14 Tagen ohne Angabe von Gründen widerrufen. Die Frist beginnt nach Abschluss des Vertrags. Zur Wahrung der Frist genügt die rechtzeitige Absendung des Widerrufs (z. B. per E-Mail an kontakt@bescheidrecht.de).
            </p>
            <p className="text-[var(--text)] mb-4">
              <strong>4.3 Vorabvollzug bei digitalen Inhalten:</strong> Wenn Sie uns ausdrücklich dazu auffordern oder zustimmen, dass wir mit der Erbringung der vertraglichen Leistung vor Ablauf der Widerrufsfrist beginnen (z. B. durch Start der ersten Analyse nach dem Kauf), erkennen Sie an, dass mit Beginn der Ausführung Ihr Widerrufsrecht für diese Leistung erlischt. Sie können vor Beginn der Ausführung jederzeit widersprechen. Die Einwilligung in den Vorabvollzug kann z. B. durch Anklicken einer entsprechenden Bestätigung oder durch Nutzung der Analyse-Funktion nach dem Kauf erfolgen.
            </p>
            <p className="text-[var(--text)]">
              <strong>4.4 Folgen des Widerrufs:</strong> Im Falle eines wirksamen Widerrufs haben wir die empfangenen Leistungen (Zahlung) unverzüglich zurückzugewähren. Die Rückzahlung erfolgt mit demselben Zahlungsmittel, sofern nicht ausdrücklich anders vereinbart.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">5. Preise und Zahlung</h2>
            <p className="text-[var(--text)] mb-4">
              Die jeweils gültigen Preise ergeben sich aus der Darstellung auf der Website bzw. beim Abschluss des gewählten Pakets. Alle Preise verstehen sich in Euro. Es wird keine Umsatzsteuer ausgewiesen (Kleinunternehmerregelung gemäß § 19 UStG). Die Zahlung erfolgt über die beim Kauf angegebene Zahlungsart (über den Zahlungsdienstleister Mollie B.V.). Bei Zahlungsverzug sind wir berechtigt, Verzugszinsen in gesetzlicher Höhe zu berechnen; der Nachweis eines höheren Schadens bleibt vorbehalten.
            </p>
            <p className="text-[var(--text)]">
              Ein Anspruch auf Rückerstattung wegen nicht genutzter Analysen oder Schreiben innerhalb des gekauften Pakets besteht nur, soweit gesetzlich oder in diesen AGB vorgesehen (z. B. Widerruf).
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">6. Nutzung, Konto, Sperrung</h2>
            <p className="text-[var(--text)]">
              Die Nutzung des Angebots setzt eine Registrierung und die Einhaltung dieser AGB voraus. Sie sind verpflichtet, Ihre Zugangsdaten geheim zu halten und Dritten keinen Zugang zu verschaffen. Wir sind berechtigt, bei Verdacht auf Missbrauch, Verstößen gegen diese AGB oder aus wichtigem Grund das Konto vorübergehend oder dauerhaft zu sperren. Ein Anspruch auf Nutzung bestimmter Funktionen oder auf Fortbestand des Kontos besteht nur im Rahmen des Vertrags und der gesetzlichen Vorgaben.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">7. Haftung</h2>
            <p className="text-[var(--text)] mb-4">
              <strong>7.1</strong> Die Nutzung des Analyse- und Schreiben-Tools erfolgt auf eigenes Risiko. Wir erbringen keine Rechtsberatung; die erzeugten Analysen und Texte sind unverbindliche Entwürfe und Orientierungshilfen. Eine Haftung für die <strong>inhaltliche Richtigkeit, Vollständigkeit, rechtliche Wirksamkeit oder Eignung</strong> der Analyseergebnisse und der generierten Schreiben-Entwürfe wird <strong>ausgeschlossen</strong>. Insbesondere übernehmen wir keine Gewähr dafür, dass Widersprüche, Anträge oder andere Schreiben in Ihrem konkreten Fall Erfolg haben oder frist- oder formgerecht sind.
            </p>
            <p className="text-[var(--text)] mb-4">
              <strong>7.2</strong> Die Haftung für Schäden aus leichter Fahrlässigkeit ist – soweit nicht zwingende gesetzliche Vorschriften (z. B. Produkthaftung, Verletzung von Leben, Körper oder Gesundheit, arglistiges Verschweigen eines Mangels, Garantien) entgegenstehen – ausgeschlossen. Die Haftung für Vorsatz und grobe Fahrlässigkeit sowie bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) bleibt im gesetzlich zulässigen Umfang unberührt; in diesen Fällen ist die Haftung auf den vorhersehbaren, typischerweise eintretenden Schaden begrenzt.
            </p>
            <p className="text-[var(--text)]">
              <strong>7.3</strong> Wir haften nicht für Schäden, die durch fehlerhafte oder unvollständige Eingaben des Nutzers, durch unsachgemäße Nutzung des Angebots oder durch die Weitergabe bzw. Verwendung der erzeugten Texte ohne eigene Prüfung entstehen.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">8. Urheberrecht und Nutzungsrechte</h2>
            <p className="text-[var(--text)]">
              Alle Rechte an der Website, der Software und den Inhalten (Texte, Grafiken, Logik) liegen beim Anbieter bzw. den jeweiligen Rechteinhabern. Dem Nutzer wird lediglich ein einfaches, nicht übertragbares Recht zur Nutzung der Dienste im Rahmen des Vertrags eingeräumt. Die von Ihnen erzeugten Schreiben-Entwürfe und Analysen stehen Ihnen zur persönlichen Nutzung zur Verfügung; wir erheben kein Eigentum an Ihren eigenen Inhalten, verarbeiten diese aber im erforderlichen Umfang zur Leistungserbringung (vgl. Datenschutzerklärung).
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">9. Änderungen der AGB und des Angebots</h2>
            <p className="text-[var(--text)]">
              Wir behalten uns vor, diese AGB und das Leistungsangebot bei Bedarf anzupassen. Änderungen der AGB werden Ihnen in textlicher Form (z. B. per E-Mail oder durch Veröffentlichung auf der Website mit Hinweis) mitgeteilt. Widersprechen Sie nicht innerhalb von 14 Tagen nach Zugang der Mitteilung und nutzen Sie das Angebot weiter, gelten die geänderten AGB als angenommen. Auf die Frist und die Folgen des Schweigens weisen wir in der Mitteilung hin. Wesentliche Verschlechterungen des Leistungsumfangs für bereits gekaufte Pakete sind nur mit Ihrer Zustimmung zulässig, soweit nicht gesetzliche Gründe (z. B. Sicherheit) entgegenstehen.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">10. Schlussbestimmungen</h2>
            <p className="text-[var(--text)] mb-4">
              Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit dem Vertrag ist, soweit gesetzlich zulässig, der Sitz des Anbieters (Vechta). Für Verbraucher mit Wohnsitz in der EU gelten zwingend die Bestimmungen des Staates ihres Wohnsitzes, soweit diese für sie günstiger sind.
            </p>
            <p className="text-[var(--text)]">
              Sollte eine Bestimmung dieser AGB unwirksam oder undurchführbar sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt (salvatorische Klausel).
            </p>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
