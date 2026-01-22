export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-[#05070a] text-white px-6 py-24">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold mb-10">Datenschutzerklärung</h1>

        <section className="space-y-6 text-white/80 text-sm leading-relaxed">

          <p>
            Der Schutz Ihrer personenbezogenen Daten ist uns ein wichtiges Anliegen.
            Nachfolgend informieren wir Sie über die Verarbeitung Ihrer Daten bei der Nutzung
            von <strong>BescheidRecht</strong>.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Verantwortlicher</h2>
          <p>
            Verantwortlich für die Datenverarbeitung ist der Betreiber der Plattform
            BescheidRecht. Die Kontaktdaten entnehmen Sie bitte dem Impressum.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Zugriffsdaten</h2>
          <p>
            Beim Besuch der Website werden automatisch Informationen durch den Browser
            übermittelt (z. B. IP-Adresse, Datum und Uhrzeit, Browsertyp).
            Diese Daten dienen ausschließlich der technischen Bereitstellung und Sicherheit
            der Website.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">3. Hochgeladene Dokumente</h2>
          <p>
            Wenn Sie Dokumente hochladen, werden diese ausschließlich zur Durchführung der
            KI-Analyse verarbeitet.
            Die Dokumente werden nicht dauerhaft gespeichert und nach Abschluss der Analyse
            automatisch gelöscht, sofern keine gesetzliche Aufbewahrungspflicht besteht.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. KI-Analyse</h2>
          <p>
            Zur Analyse der hochgeladenen Inhalte setzen wir KI-Technologien ein.
            Die Verarbeitung erfolgt ausschließlich zum Zweck der Bereitstellung der
            angeforderten Analyse und der Erstellung von Textvorlagen.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Weitergabe von Daten</h2>
          <p>
            Eine Weitergabe personenbezogener Daten an Dritte erfolgt nur, soweit dies zur
            technischen Durchführung der Leistung erforderlich ist oder eine gesetzliche
            Verpflichtung besteht.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">6. Zahlungsabwicklung</h2>
          <p>
            Für kostenpflichtige Leistungen erfolgt die Zahlungsabwicklung über externe
            Zahlungsdienstleister. Dabei gelten deren Datenschutzerklärungen ergänzend.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">7. Ihre Rechte</h2>
          <p>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
            Verarbeitung sowie auf Widerspruch und Datenübertragbarkeit im Rahmen der
            gesetzlichen Vorgaben.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">8. Datensicherheit</h2>
          <p>
            Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre
            Daten vor unbefugtem Zugriff zu schützen.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">9. Änderungen</h2>
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an rechtliche
            oder technische Änderungen anzupassen.
          </p>

        </section>

      </div>
    </main>
  );
}
