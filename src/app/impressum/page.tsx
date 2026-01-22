export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-[#05070a] text-white px-6 py-24">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold mb-10">Impressum</h1>

        <section className="space-y-6 text-white/80 text-sm leading-relaxed">

          <p>
            Angaben gemäß § 5 TMG
          </p>

          <p>
            <strong>BescheidRecht</strong><br />
            Betreiber: <br />
            Name / Firma<br />
            Straße Hausnummer<br />
            PLZ Ort<br />
            Deutschland
          </p>

          <p>
            <strong>Kontakt</strong><br />
            E-Mail: kontakt@bescheidrecht.de
          </p>

          <p>
            <strong>Umsatzsteuer-ID</strong><br />
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
            <br />
            (falls vorhanden, sonst entfernen)
          </p>

          <p>
            <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</strong><br />
            Name / Firma<br />
            Anschrift wie oben
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            Haftung für Inhalte
          </h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte
            auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
            Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen
            zu überwachen.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            Haftung für Links
          </h2>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren
            Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
            fremden Inhalte auch keine Gewähr übernehmen.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">
            Urheberrecht
          </h2>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
            diesen Seiten unterliegen dem deutschen Urheberrecht.
          </p>

        </section>

      </div>
    </main>
  );
}

