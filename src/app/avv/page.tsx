"use client";

import Link from "next/link";
import { FileText, Download } from "lucide-react";

export default function AvvPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-24">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[var(--bg)]/90 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/b2b" className="text-[var(--text)] font-black text-lg tracking-tight hover:opacity-80 transition-opacity">
            BESCHEID<span className="text-[var(--accent)]">RECHT</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/b2b" className="text-sm text-[var(--text-muted)] opacity-60 hover:opacity-100 transition-opacity">B2B-Übersicht</Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 border border-[var(--border)] rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              Drucken / PDF
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)]">Rechtliches · Art. 28 DSGVO</p>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text)] mb-4">
            Auftragsverarbeitungsvertrag
          </h1>
          <p className="text-[var(--text-muted)] text-base sm:text-lg max-w-2xl leading-relaxed">
            Vertrag zur Auftragsverarbeitung personenbezogener Daten gemäß Art. 28 DSGVO
            zwischen BescheidRecht und beauftragenden Einrichtungen.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-muted)] opacity-70">
            Stand: März 2026 · Version 1.0
          </div>
        </div>

        {/* Inhalt */}
        <div className="space-y-8 text-sm leading-relaxed">

          <Section title="Präambel">
            <p>
              Die nachstehende Vereinbarung zur Auftragsverarbeitung (im Folgenden „AVV&rdquo;) regelt die
              Verarbeitung personenbezogener Daten durch BescheidRecht (Auftragsverarbeiter) im Auftrag
              der jeweiligen Einrichtung (Verantwortlicher), die den Dienst BescheidRecht im Rahmen
              eines B2B-Abonnements nutzt.
            </p>
            <p>
              Diese AVV gilt als Bestandteil des zwischen den Parteien geschlossenen Nutzungsvertrags
              und tritt mit der Aktivierung des B2B-Zugangs in Kraft. Sie gilt für alle Tätigkeiten,
              bei denen Mitarbeiter der Einrichtung personenbezogene Daten von Klienten in die
              BescheidRecht-Plattform eingeben oder hochladen.
            </p>
          </Section>

          <Section title="§ 1 — Vertragsgegenstand und Laufzeit">
            <p>
              <strong>1.1</strong> BescheidRecht verarbeitet im Auftrag der Einrichtung personenbezogene
              Daten im Rahmen der Bereitstellung der KI-gestützten Bescheidanalyse-Plattform.
            </p>
            <p>
              <strong>1.2</strong> Die Laufzeit dieser AVV entspricht der Laufzeit des zugrunde liegenden
              B2B-Nutzungsvertrags. Sie endet automatisch mit der Beendigung des Nutzungsvertrags.
            </p>
            <p>
              <strong>1.3</strong> Die Pflichten aus dieser AVV, die über das Vertragsende hinausgehen
              (insbesondere Löschung oder Rückgabe von Daten), bleiben bis zu ihrer vollständigen
              Erfüllung bestehen.
            </p>
          </Section>

          <Section title="§ 2 — Art, Zweck und Umfang der Verarbeitung">
            <p>
              <strong>2.1 Art der Verarbeitung:</strong> Erheben, Speichern, Strukturieren, Auslesen,
              Abfragen, Pseudonymisieren, Analysieren, Löschen.
            </p>
            <p>
              <strong>2.2 Zweck der Verarbeitung:</strong> Prüfung von Behördenbescheiden auf formale
              und inhaltliche Fehler mittels KI-gestützter Analyse; Generierung von
              Musterschreiben-Vorlagen; Verwaltung von Fristen; Bereitstellung einer
              Einrichtungs-Übersicht über Analysevorgänge.
            </p>
            <p>
              <strong>2.3 Kategorien personenbezogener Daten:</strong> Name, Anschrift, Geburtsdatum,
              Aktenzeichen, Bescheiddaten, IBAN, Steuer-ID sowie sonstige im Bescheid enthaltene
              personenbezogene Angaben der Klienten der Einrichtung. Mitarbeiterdaten (E-Mail,
              Nutzungsstatistiken) der Einrichtung.
            </p>
            <p>
              <strong>2.4 Kategorien betroffener Personen:</strong> Klienten der Einrichtung
              (Bescheidinhaber); Mitarbeiter der Einrichtung (Berater, Admins).
            </p>
          </Section>

          <Section title="§ 3 — Weisungsgebundenheit">
            <p>
              <strong>3.1</strong> BescheidRecht verarbeitet personenbezogene Daten ausschließlich
              auf dokumentierte Weisung der Einrichtung, es sei denn, eine gesetzliche Pflicht
              erfordert eine andere Verarbeitung.
            </p>
            <p>
              <strong>3.2</strong> Die Nutzung der Plattform gemäß Nutzungsvertrag und
              Produktdokumentation gilt als dokumentierte Weisung.
            </p>
            <p>
              <strong>3.3</strong> BescheidRecht teilt der Einrichtung unverzüglich mit, wenn eine
              Weisung nach Einschätzung von BescheidRecht gegen datenschutzrechtliche Vorschriften
              verstößt.
            </p>
          </Section>

          <Section title="§ 4 — Pflichten von BescheidRecht (Auftragsverarbeiter)">
            <p>BescheidRecht verpflichtet sich:</p>
            <ul>
              <li>Personenbezogene Daten ausschließlich zum vereinbarten Zweck zu verarbeiten</li>
              <li>Geeignete technische und organisatorische Maßnahmen (TOMs) nach Art. 32 DSGVO zu treffen und aufrechtzuerhalten</li>
              <li>Sicherzustellen, dass alle Personen mit Zugang zu den Daten der Verschwiegenheitspflicht unterliegen</li>
              <li>Die Einrichtung unverzüglich (innerhalb von 72 Stunden) über Datenpannen nach Art. 33 DSGVO zu informieren</li>
              <li>Die Einrichtung bei der Erfüllung von Betroffenenrechten (Art. 15–22 DSGVO) zu unterstützen</li>
              <li>Die Einrichtung bei Datenschutz-Folgenabschätzungen (Art. 35 DSGVO) zu unterstützen, soweit erforderlich</li>
              <li>Alle erforderlichen Informationen zum Nachweis der Einhaltung dieser AVV zur Verfügung zu stellen</li>
            </ul>
          </Section>

          <Section title="§ 5 — Pflichten der Einrichtung (Verantwortlicher)">
            <p>Die Einrichtung verpflichtet sich:</p>
            <ul>
              <li>Klienten über die Datenverarbeitung durch BescheidRecht gemäß Art. 13/14 DSGVO zu informieren</li>
              <li>Nur Daten einzureichen, für deren Verarbeitung eine Rechtsgrundlage besteht</li>
              <li>Zugangsdaten (Passwörter, Session-Tokens) sicher zu verwahren</li>
              <li>Datenpannen, die im Einflussbereich der Einrichtung entstanden sind, unverzüglich zu melden</li>
              <li>BescheidRecht über Änderungen im Nutzungsumfang zu informieren, die Datenschutzrelevanz haben könnten</li>
            </ul>
          </Section>

          <Section title="§ 6 — Technische und organisatorische Maßnahmen (TOMs)">
            <p>BescheidRecht trifft folgende technischen und organisatorischen Schutzmaßnahmen:</p>
            <div className="space-y-4">
              <TomItem title="Pseudonymisierung">
                Vor der KI-Analyse werden personenbezogene Daten (Name, IBAN, Geburtsdatum,
                Adresse, Steuer-ID etc.) automatisch durch Platzhalter ersetzt. Der KI-Anbieter
                erhält keine Klardaten.
              </TomItem>
              <TomItem title="Verschlüsselung">
                Alle Daten werden bei der Übertragung via TLS 1.2/1.3 verschlüsselt.
                Datenbankzugriffe erfolgen ausschließlich verschlüsselt.
              </TomItem>
              <TomItem title="Zugriffskontrolle">
                Authentifizierung über Supabase Auth (bcrypt-Passwort-Hashing).
                Row Level Security (RLS) stellt sicher, dass Nutzer nur ihre eigenen Daten sehen.
                B2B-Org-Mitglieder sehen nur die Daten ihrer Einrichtung.
              </TomItem>
              <TomItem title="Datensparsamkeit">
                Bescheid-Dokumente werden nach der Analyse nicht dauerhaft gespeichert.
                Der KI-Anbieter (Anthropic) hat eine Zero-Data-Retention-Policy für API-Anfragen.
              </TomItem>
              <TomItem title="Audit-Protokollierung">
                Analysevorgänge werden mit Zeitstempel und Nutzer-ID protokolliert.
                Kein Zugriff auf Protokolle durch unbefugte Personen.
              </TomItem>
              <TomItem title="Verfügbarkeit">
                Hosting auf Vercel (EU-Region) mit automatischer Skalierung und 99,9 % SLA.
                Datenbankhosting via Supabase (EU-Region).
              </TomItem>
              <TomItem title="Incident-Response">
                Datenpannen werden innerhalb von 72 Stunden gemäß Art. 33 DSGVO an die
                zuständige Aufsichtsbehörde gemeldet. Betroffene Einrichtungen werden
                unverzüglich informiert.
              </TomItem>
            </div>
          </Section>

          <Section title="§ 7 — Unterauftragnehmer">
            <p>
              BescheidRecht setzt folgende Unterauftragnehmer ein, die im Rahmen der
              Leistungserbringung personenbezogene Daten verarbeiten können. Die Einrichtung
              erteilt hiermit ihre allgemeine Genehmigung zur Beauftragung dieser Unterauftragnehmer:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-strong)]">
                    <th className="text-left py-3 pr-4 text-[var(--text-muted)] font-bold text-xs uppercase tracking-widest">Anbieter</th>
                    <th className="text-left py-3 pr-4 text-[var(--text-muted)] font-bold text-xs uppercase tracking-widest">Zweck</th>
                    <th className="text-left py-3 text-[var(--text-muted)] font-bold text-xs uppercase tracking-widest">Sitz / Rechtsgrundlage</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--text-muted)]">
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 pr-4 font-medium text-[var(--text)]">Vercel Inc.</td>
                    <td className="py-3 pr-4">Hosting, CDN, Serverless Functions</td>
                    <td className="py-3">USA (Serverstandort: EU/Frankfurt) — DPA + SCCs</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 pr-4 font-medium text-[var(--text)]">Supabase Inc.</td>
                    <td className="py-3 pr-4">Datenbank, Authentifizierung</td>
                    <td className="py-3">EU-Region — DPA + SCCs</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 pr-4 font-medium text-[var(--text)]">Anthropic, PBC</td>
                    <td className="py-3 pr-4">KI-Verarbeitung (pseudonymisiert)</td>
                    <td className="py-3">USA — DPA + SCCs, Zero-Retention</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 pr-4 font-medium text-[var(--text)]">OpenAI LLC</td>
                    <td className="py-3 pr-4">Technischer Fallback (OCR/Analyse bei Nichtverfügbarkeit von Anthropic)</td>
                    <td className="py-3">USA — DPA + SCCs, Zero-Retention (API)</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 pr-4 font-medium text-[var(--text)]">Mollie B.V.</td>
                    <td className="py-3 pr-4">Zahlungsabwicklung</td>
                    <td className="py-3">NL (EU) — PCI-DSS, DSGVO</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 pr-4 font-medium text-[var(--text)]">Functional Software Inc. (Sentry)</td>
                    <td className="py-3 pr-4">Fehlerüberwachung und Stabilitätsmonitoring</td>
                    <td className="py-3">USA — DPA + SCCs</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-[var(--text)]">Upstash Inc.</td>
                    <td className="py-3 pr-4">Rate-Limiting (Redis, keine personenbezogenen Daten)</td>
                    <td className="py-3">USA — DPA + SCCs, EU-Region</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[var(--text-muted)] opacity-70 text-sm mt-4">
              BescheidRecht informiert die Einrichtung rechtzeitig über geplante Änderungen bei
              Unterauftragnehmern. Die Einrichtung hat das Recht, gegen beabsichtigte Änderungen
              Einspruch zu erheben.
            </p>
          </Section>

          <Section title="§ 8 — Betroffenenrechte">
            <p>
              <strong>8.1</strong> BescheidRecht unterstützt die Einrichtung, soweit möglich,
              bei der Erfüllung von Anfragen betroffener Personen (Auskunft, Berichtigung, Löschung,
              Einschränkung, Datenübertragbarkeit, Widerspruch gem. Art. 15–22 DSGVO).
            </p>
            <p>
              <strong>8.2</strong> Anfragen betroffener Personen, die direkt an BescheidRecht
              gerichtet werden, leitet BescheidRecht unverzüglich an die zuständige Einrichtung
              weiter.
            </p>
            <p>
              <strong>8.3</strong> Die Einrichtung bleibt Verantwortlicher im Sinne der DSGVO und
              ist für die Beantwortung von Betroffenenanfragen zuständig.
            </p>
          </Section>

          <Section title="§ 9 — Datenpannen">
            <p>
              <strong>9.1</strong> BescheidRecht benachrichtigt die Einrichtung unverzüglich,
              spätestens jedoch innerhalb von 72 Stunden nach Bekanntwerden einer Verletzung des
              Schutzes personenbezogener Daten.
            </p>
            <p>
              <strong>9.2</strong> Die Benachrichtigung enthält mindestens: Art der Verletzung,
              betroffene Datenkategorien und -mengen, voraussichtliche Folgen und getroffene
              Abhilfemaßnahmen.
            </p>
            <p>
              <strong>9.3</strong> Meldepflichten gegenüber Aufsichtsbehörden und betroffenen
              Personen verbleiben beim Verantwortlichen (Einrichtung).
            </p>
          </Section>

          <Section title="§ 10 — Löschung und Rückgabe von Daten">
            <p>
              <strong>10.1</strong> Nach Beendigung des Nutzungsvertrags löscht BescheidRecht
              alle personenbezogenen Daten der Einrichtung und ihrer Klienten innerhalb von
              30 Tagen, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </p>
            <p>
              <strong>10.2</strong> Auf ausdrücklichen Wunsch der Einrichtung können Daten
              vor der Löschung in einem maschinenlesbaren Format (JSON/CSV) exportiert werden.
              Der Exportantrag ist vor Vertragsende zu stellen.
            </p>
            <p>
              <strong>10.3</strong> Bescheid-Dokumente (Uploads) werden unmittelbar nach der
              Analyse gelöscht und nicht dauerhaft gespeichert.
            </p>
          </Section>

          <Section title="§ 11 — Kontrollrechte der Einrichtung">
            <p>
              <strong>11.1</strong> Die Einrichtung ist berechtigt, die Einhaltung dieser AVV
              durch BescheidRecht zu überprüfen. Dazu kann sie:
            </p>
            <ul>
              <li>Auskünfte und Nachweise in Textform anfordern</li>
              <li>Anerkannte Prüfberichte (Auditberichte, Zertifikate) anfordern</li>
              <li>Mit angemessener Vorankündigung (14 Tage) eigene Inspektionen durchführen oder durch Dritte durchführen lassen</li>
            </ul>
            <p>
              <strong>11.2</strong> Die Einrichtung trägt die Kosten derartiger Kontrollen,
              es sei denn, BescheidRecht hat eine Datenpanne verursacht.
            </p>
          </Section>

          <Section title="§ 12 — Haftung">
            <p>
              <strong>12.1</strong> BescheidRecht haftet der Einrichtung für Schäden aus
              Datenschutzverstößen nach Art. 82 DSGVO.
            </p>
            <p>
              <strong>12.2</strong> BescheidRecht ist von der Haftung befreit, wenn nachgewiesen
              wird, dass BescheidRecht in keinerlei Hinsicht für den Umstand, durch den der Schaden
              eingetreten ist, verantwortlich ist.
            </p>
            <p>
              <strong>12.3</strong> Im Übrigen gilt die Haftungsbegrenzung gemäß dem zugrunde
              liegenden Nutzungsvertrag.
            </p>
          </Section>

          <Section title="§ 13 — Schlussbestimmungen">
            <p>
              <strong>13.1</strong> Diese AVV unterliegt deutschem Recht.
            </p>
            <p>
              <strong>13.2</strong> Gerichtsstand ist Vechta (Niedersachsen), soweit gesetzlich zulässig.
            </p>
            <p>
              <strong>13.3</strong> Änderungen dieser AVV bedürfen der Textform (E-Mail genügt).
              BescheidRecht informiert Einrichtungen über wesentliche Änderungen mit einer
              Vorlaufzeit von 30 Tagen.
            </p>
            <p>
              <strong>13.4</strong> Sollte eine Bestimmung dieser AVV unwirksam sein, berührt dies
              die Wirksamkeit der übrigen Bestimmungen nicht.
            </p>
          </Section>

          {/* Kontakt / Unterschrift */}
          <div className="bg-[var(--accent)]/[0.04] border border-[var(--accent)]/20 rounded-2xl p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-4">Verantwortlicher / Auftragsverarbeiter</p>
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-[var(--text-muted)] text-sm mb-2 uppercase tracking-widest">Auftragsverarbeiter</p>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  <strong className="text-[var(--text)]">Hendrik Berkensträter</strong><br />
                  BescheidRecht<br />
                  Antoniusstraße 47<br />
                  49377 Vechta<br />
                  <a href="mailto:kontakt@bescheidrecht.de" className="text-[var(--accent)] hover:underline">kontakt@bescheidrecht.de</a>
                </p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-sm mb-2 uppercase tracking-widest">Verantwortlicher</p>
                <p className="text-[var(--text-muted)] leading-relaxed text-sm">
                  Die jeweilige Einrichtung (Verantwortlicher im Sinne Art. 4 Nr. 7 DSGVO),
                  wie im B2B-Nutzungsvertrag angegeben.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row gap-4">
              <Link
                href="mailto:kontakt@bescheidrecht.de?subject=AVV%20BescheidRecht%20B2B"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-bold rounded-xl text-sm hover:bg-[var(--accent-hover)] transition-colors"
              >
                AVV per E-Mail anfordern
              </Link>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); window.print(); }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[var(--border)] text-[var(--text-muted)] font-bold rounded-xl text-sm hover:border-[var(--border-strong)] hover:text-[var(--text)] transition-colors"
              >
                <Download className="h-4 w-4" />
                Als PDF drucken
              </a>
            </div>
          </div>

          {/* Footer-Links */}
          <div className="flex flex-wrap gap-4 text-sm text-[var(--text-muted)] opacity-50 pt-4">
            <Link href="/datenschutz" className="hover:opacity-100 transition-opacity">Datenschutzerklärung</Link>
            <Link href="/impressum" className="hover:opacity-100 transition-opacity">Impressum</Link>
            <Link href="/agb" className="hover:opacity-100 transition-opacity">AGB</Link>
            <Link href="/b2b" className="hover:opacity-100 transition-opacity">B2B-Übersicht</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
      <h2 className="text-[var(--text)] font-bold uppercase tracking-widest text-sm mb-5">{title}</h2>
      <div className="space-y-4 text-[var(--text-muted)] text-[14px] leading-relaxed [&_ul]:pl-5 [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:text-[var(--text-muted)] [&_strong]:text-[var(--text)]">
        {children}
      </div>
    </div>
  );
}

function TomItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/60 mt-2 flex-shrink-0" />
      <div>
        <p className="font-bold text-[var(--text)] text-sm mb-0.5">{title}</p>
        <p className="text-[var(--text-muted)] text-sm">{children}</p>
      </div>
    </div>
  );
}
