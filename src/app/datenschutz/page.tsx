"use client";

import React from "react";

import { SiteNavSimple } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function DatenschutzPage() {
  return (
    <main id="main-content" className="min-h-screen bg-mesh text-[var(--text)] flex flex-col">
      <SiteNavSimple backHref="/" backLabel="Zurück zur Startseite" />
      <div className="max-w-4xl mx-auto px-6 py-20 flex-grow">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-2">Rechtliches</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Datenschutzerklärung</h1>
        <p className="text-[var(--text-muted)] opacity-70 text-sm mb-16">Stand: März 2026</p>
        <section className="space-y-12 text-[var(--text-muted)] text-sm leading-relaxed">
          <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-8">
            <h2 className="text-[var(--accent)] font-bold uppercase tracking-widest text-xs mb-4">Geltungsbereich</h2>
            <p className="text-[var(--text)] font-medium">
              Diese Datenschutzerklärung gilt für die Website bescheidrecht.de sowie die mit ihr verbundenen Dienste (Analyse, Schreiben-Erstellung, Nutzerkonto, Zahlung). Sie informiert Sie über die Verarbeitung personenbezogener Daten und Ihre Rechte nach der DSGVO.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">1. Verantwortliche Stelle</h2>
            <p className="text-[var(--text)]">
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br /><br />
              <strong>Hendrik Berkensträter</strong><br />
              Antoniusstraße 47<br />
              49377 Vechta<br />
              E-Mail: kontakt@bescheidrecht.de
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">2. Allgemeine Hinweise</h2>
            <p className="text-[var(--text)]">
              Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften (DSGVO, BDSG) sowie dieser Datenschutzerklärung. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifizierbar sind. Die Datenübertragung zwischen Ihrem Gerät und unseren Servern erfolgt verschlüsselt (SSL/TLS). Wir erheben und verarbeiten nur die Daten, die für die Erbringung unserer Leistungen oder aufgrund gesetzlicher Pflichten erforderlich sind.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">3. Hosting und technisch notwendige Daten</h2>
            <p className="text-[var(--text)] mb-4">
              Die Website wird bei einem externen Hosting-Anbieter betrieben. Beim Aufruf der Website werden durch den Betreiber bzw. den Hosting-Provider automatisch Zugriffsdaten (IP-Adresse, Datum, Uhrzeit, aufgerufene Seite, Browsertyp, Referrer) in Server-Logfiles erhoben. Diese Daten werden ausschließlich zur Sicherstellung des Betriebs, zur Abwehr von Missbrauch und zur Behebung von Störungen verwendet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). Die Logs werden nach kurzer Frist (in der Regel nicht länger als 30 Tage) gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </p>
            <p className="text-[var(--text-muted)] text-xs">
              Wir setzen dabei Dienste von Anbietern ein, die Auftragsverarbeiter im Sinne von Art. 28 DSGVO sein können (z. B. Vercel Inc. für das Hosting). Mit diesen bestehen Verträge zur Auftragsverarbeitung; die Daten werden nur im EWR bzw. in Drittländern mit angemessenem Schutzniveau verarbeitet.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">4. Nutzerkonto, Anmeldung und Cookies</h2>
            <p className="text-[var(--text)] mb-4">
              Für die Registrierung, Anmeldung und Nutzung Ihres Kontos setzen wir den Dienst Supabase (Supabase Inc., USA; Datenverarbeitung erfolgt auf Servern in Frankfurt, EU) ein. Dabei werden E-Mail-Adresse, Passwort (verschlüsselt), ggf. Name und Adresse sowie Ihr Nutzungs- und Abo-Status verarbeitet. Zur Aufrechterhaltung Ihrer Sitzung werden technisch notwendige Cookies bzw. vergleichbare Techniken verwendet (Session-Cookies). Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (technisch notwendige Sitzung).
            </p>
            <p className="text-[var(--text-muted)] text-xs">
              Wir setzen keine Analyse- oder Marketing-Cookies ohne Ihre Einwilligung. Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden oder diese ablehnen; die Nutzung des eingeloggten Bereichs erfordert dann ggf. eine erneute Anmeldung.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">5. Dokumenten-Upload und Bescheid-Analyse</h2>
            <p className="text-[var(--text)] mb-4">
              Die von Ihnen hochgeladenen Dokumente (PDF oder Bild) werden ausschließlich zur automatisierten Strukturierung und Analyse verarbeitet. Dafür nutzen wir u. a. Dienste von OpenAI (OpenAI, LLC). Die Inhalte werden zur Verarbeitung an den Anbieter übermittelt; eine dauerhafte Speicherung der Dokumenteninhalte bei Dritten erfolgt nicht über den für die Verarbeitung erforderlichen Zeitraum hinaus. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) vor dem Upload sowie, soweit Sie bereits Kunde sind, Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
            </p>
            <p className="text-[var(--text-muted)] text-xs">
              Hochgeladene Dateien werden auf unseren Systemen nicht dauerhaft gespeichert und nach Erledigung des Vorgangs gelöscht. Analyseergebnisse (Behörde, Rechtsgebiet, erkannte Fehler, Dringlichkeit) werden in pseudonymisierter Form für maximal 90 Tage gespeichert, um Ihnen den Zugriff auf Ihre Ergebnisse zu ermöglichen, und danach automatisch gelöscht. Es gelten ggf. gesetzliche Aufbewahrungspflichten.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-8">
            <h2 className="text-[var(--accent)] font-bold uppercase tracking-widest text-xs mb-4">Bescheid-Analyse und KI-Verarbeitung</h2>
            <p className="text-[var(--text)] mb-4">
              Bei der Analyse Ihres Bescheids werden personenbezogene Daten verarbeitet. Wir schützen Ihre Daten wie folgt:
            </p>
            <h3 className="text-[var(--text)] font-semibold text-sm mt-6 mb-2">Pseudonymisierung</h3>
            <p className="text-[var(--text)] mb-4">
              Vor der Übertragung an unseren KI-Dienstleister werden Namen, Adressen, Geburtsdaten, E-Mail-Adressen, Telefonnummern, IBAN, BIC, Steuer-IDs und Sozialversicherungsnummern automatisch durch Platzhalter ersetzt.
            </p>
            <h3 className="text-[var(--text)] font-semibold text-sm mt-6 mb-2">Externe Verarbeitung</h3>
            <p className="text-[var(--text)] mb-4">
              Die Analyse erfolgt primär über <strong>Anthropic, PBC (USA)</strong> – Claude-KI-Modelle – sowie als technischen Fallback über <strong>OpenAI LLC (USA)</strong>. Der pseudonymisierte Text wird zur Verarbeitung an den jeweils eingesetzten Dienstleister übertragen. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Ihre Einwilligung vor dem Upload) sowie Art. 49 Abs. 1 lit. a DSGVO (Drittlandübermittlung in die USA mit Ihrer Einwilligung). Mit Anthropic und OpenAI bestehen Auftragsverarbeitungsverträge gemäß Art. 28 DSGVO.
            </p>
            <h3 className="text-[var(--text)] font-semibold text-sm mt-6 mb-2">Speicherung bei KI-Dienstleistern und auf unseren Systemen</h3>
            <p className="text-[var(--text)] mb-4">
              Unsere KI-Dienstleister (Anthropic, OpenAI) speichern Ihre Daten nicht dauerhaft; nach der Analyse werden sie dort gelöscht. Auf unseren eigenen Systemen werden pseudonymisierte Analyseergebnisse (Behörde, Rechtsgebiet, erkannte Fehler, Dringlichkeit — keine Klartextdaten aus Ihrem Bescheid) für maximal 90 Tage gespeichert und danach automatisch gelöscht.
            </p>
            <h3 className="text-[var(--text)] font-semibold text-sm mt-6 mb-2">Widerruf</h3>
            <p className="text-[var(--text)]">
              Sie können Ihre Einwilligung jederzeit per E-Mail an datenschutz@bescheidrecht.de widerrufen.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">6. Erstellung von Schreiben (Musterschreiben)</h2>
            <p className="text-[var(--text)]">
              Für die Erstellung von Schreiben-Entwürfen (z. B. Widerspruch, Anträge) nutzen wir Dienste von Anthropic (Anthropic PBC). Die von Ihnen eingegebenen Daten (Aktenzeichen, Bescheiddatum, Stichpunkte, ggf. Adresse) sowie die zuvor analysierten Bescheidinhalte werden dabei zur Generierung des Textes verarbeitet. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) bzw. Ihrer Nutzung des Angebots. Eine dauerhafte Speicherung der eingegebenen Inhalte bei Dritten erfolgt nicht über den Verarbeitungszeitraum hinaus.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">7. Zahlung und Abrechnung</h2>
            <p className="text-[var(--text)]">
              Sofern Sie ein kostenpflichtiges Paket erwerben, erfolgt die Abwicklung über einen externen Zahlungs- bzw. Vertriebspartner (Mollie B.V., Amsterdam). Dabei können Zahlungsdaten (z. B. E-Mail, Transaktions-ID, Paket) an den Anbieter übermittelt werden. Die Verarbeitung unterliegt den Datenschutzbestimmungen des jeweiligen Anbieters; Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie ggf. Art. 6 Abs. 1 lit. c DSGVO (steuerrechtliche Aufbewahrung).
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">7b. E-Mail-Benachrichtigungen (Fristen-Erinnerungen)</h2>
            <p className="text-[var(--text)]">
              Wenn Sie für eine Analyse eine Frist gespeichert haben, erhalten Sie per E-Mail eine Erinnerung, bevor die Frist abläuft. Für den E-Mail-Versand nutzen wir den Dienst <strong>Resend (Resend Inc., USA)</strong>. Dabei werden Ihre E-Mail-Adresse sowie die Fristinformationen (Behörde, Rechtsgebiet, Fristdatum) an Resend übermittelt. Mit Resend besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO inkl. Standardvertragsklauseln (SCCs). Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">8. Feedback-Formular</h2>
            <p className="text-[var(--text)]">
              Über unser Feedback-Formular (z. B. unter „Feedback" im Footer) können Sie uns Anregungen oder Kritik mitteilen. Dabei werden die von Ihnen eingegebenen Daten (Nachricht, optional Bewertung, Name, E-Mail) an uns übermittelt und in unserer Datenbank (Auftragsverarbeiter: Supabase) gespeichert. Die Verarbeitung erfolgt auf Grundlage Ihrer Einwilligung beim Absenden (Art. 6 Abs. 1 lit. a DSGVO) bzw. unseres berechtigten Interesses an der Verbesserung unseres Angebots (Art. 6 Abs. 1 lit. f DSGVO). <strong>Nachricht, Bewertung und – sofern angegeben – Ihr Name können auf der Website öffentlich angezeigt werden</strong> (z. B. unter „Was andere sagen"). Ihre E-Mail-Adresse wird nicht veröffentlicht. Eine Weitergabe an Dritte erfolgt nicht, soweit nicht gesetzlich erforderlich.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">9. Echtzeit-Anzeige „Besucher online"</h2>
            <p className="text-[var(--text)]">
              Auf der Website wird angezeigt, wie viele Besucher sich gerade auf der Seite befinden (z. B. „X Besucher gerade online"). Dafür nutzen wir die Realtime-Funktion unseres Datenbankanbieters (Supabase). Es wird nur eine anonyme Zählung vorgenommen; es werden keine personenbezogenen Daten (z. B. IP-Adresse) gespeichert oder ausgewertet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer lebendigen Darstellung der Nutzung).
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">10. Speicherdauer</h2>
            <p className="text-[var(--text)]">
              Wir speichern personenbezogene Daten nur so lange, wie es für die Erbringung der Leistung, die Abwicklung des Vertrags oder die Erfüllung gesetzlicher Aufbewahrungspflichten (z. B. steuer- oder handelsrechtlich) erforderlich ist. Hochgeladene Dokumente werden nicht dauerhaft auf unseren Servern gespeichert und nach Erledigung des Vorgangs gelöscht. Pseudonymisierte Analyseergebnisse werden nach maximal 90 Tagen automatisch gelöscht. Nach Ende der Speicherfrist werden die Daten gelöscht oder anonymisiert.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">11. Ihre Rechte</h2>
            <p className="text-[var(--text)] mb-4">
              Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:
            </p>
            <ul className="list-disc list-inside text-[var(--text)] space-y-2 mb-4">
              <li><strong>Auskunft</strong> (Art. 15 DSGVO)</li>
              <li><strong>Berichtigung</strong> (Art. 16 DSGVO)</li>
              <li><strong>Löschung</strong> (Art. 17 DSGVO)</li>
              <li><strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
              <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
              <li><strong>Widerspruch</strong> gegen die Verarbeitung (Art. 21 DSGVO), soweit die Verarbeitung auf Art. 6 Abs. 1 lit. f DSGVO beruht</li>
              <li><strong>Widerruf einer Einwilligung</strong> (Art. 7 Abs. 3 DSGVO) – die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt unberührt</li>
            </ul>
            <p className="text-[var(--text)]">
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte per E-Mail an <strong>datenschutz@bescheidrecht.de</strong>. Sie haben ferner das Recht, sich bei einer Aufsichtsbehörde für den Datenschutz zu beschweren (z. B. die für Ihren Wohnsitz zuständige Landesdatenschutzbehörde oder den Bundesbeauftragten für den Datenschutz und die Informationsfreiheit).
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">12. Fehlerüberwachung (Sentry)</h2>
            <p className="text-[var(--text)]">
              Zur Erkennung und Behebung technischer Fehler setzen wir den Dienst Sentry (Functional Software Inc., USA) ein. Bei einem Fehler werden technische Informationen (Fehlermeldung, betroffene Seite, Browsertyp, ggf. gekürzte IP-Adresse) automatisch an Sentry übermittelt. Die Verarbeitung erfolgt auf Grundlage unseres berechtigten Interesses an der Stabilität und Sicherheit der Website (Art. 6 Abs. 1 lit. f DSGVO). Es besteht ein Auftragsverarbeitungsvertrag mit Sentry gemäß Art. 28 DSGVO. Personenbezogene Daten werden dabei nicht gezielt erfasst; Fehlerberichte werden nach 90 Tagen gelöscht.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">13. Rate-Limiting (Upstash)</h2>
            <p className="text-[var(--text)]">
              Zum Schutz vor Missbrauch und zur Sicherstellung der Verfügbarkeit setzen wir den Dienst Upstash (Upstash Inc., USA; Datenverarbeitung auf Servern in der EU/Frankfurt) ein. Dabei werden ausschließlich gehashte IP-Adressen und Zähler kurzfristig gespeichert, um Anfragelimits durchzusetzen. Eine Identifizierung einzelner Nutzer ist anhand dieser Daten nicht möglich. Die Verarbeitung erfolgt auf Grundlage unseres berechtigten Interesses an der Sicherheit und Stabilität der Plattform (Art. 6 Abs. 1 lit. f DSGVO). Es besteht ein Auftragsverarbeitungsvertrag mit Upstash gemäß Art. 28 DSGVO.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-xs mb-4">14. Änderungen dieser Erklärung</h2>
            <p className="text-[var(--text)]">
              Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, um sie an geänderte Rechtslage oder an Änderungen unseres Angebots anzupassen. Die jeweils aktuelle Version finden Sie auf dieser Seite. Bei wesentlichen Änderungen werden wir Sie, soweit erforderlich, gesondert informieren.
            </p>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
