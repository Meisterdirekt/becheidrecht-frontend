export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

export const posts: BlogPost[] = [
  {
    slug: "willkommen-bei-bescheidrecht",
    title: "Willkommen bei BescheidRecht",
    date: "2026-02-10",
    excerpt: "Kurze Einführung in BescheidRecht und was Sie mit unserem Tool erreichen können.",
    content:
      "BescheidRecht unterstützt Sie dabei, Behördenbescheide und Verwaltungsbriefe schneller zu verstehen und typische Fehlerquellen zu erkennen.\n\n" +
      "Wir analysieren Ihre Dokumente auf Auffälligkeiten, Fristen und Begründungen – ohne Rechtsberatung zu ersetzen. Unser Ziel: Licht ins Dunkel der Paragraphen bringen und Ihnen Zeit zu sparen.\n\n" +
      "In diesem Blog finden Sie künftig Tipps zum Umgang mit Bescheiden, Hinweise zu Fristen und Widersprüchen sowie Neuigkeiten zu BescheidRecht.",
  },
  {
    slug: "fristen-bei-bescheiden",
    title: "Fristen bei Bescheiden – worauf Sie achten sollten",
    date: "2026-02-09",
    excerpt: "Überblick über wichtige Fristen in Verwaltungsverfahren und wie Sie sie im Blick behalten.",
    content:
      "In Bescheiden und Verwaltungsentscheidungen spielen Fristen eine zentrale Rolle. Verpasste Fristen können Rechte gefährden.\n\n" +
      "Typische Fristen sind etwa die Einspruchs- oder Widerspruchsfrist (oft einen Monat nach Bekanntgabe), die Klagefrist vor dem Verwaltungsgericht sowie Ausschlussfristen für Anträge.\n\n" +
      "BescheidRecht hilft Ihnen, solche Fristen in Ihrem Dokument zu identifizieren. So behalten Sie den Überblick und können rechtzeitig reagieren. Dies ersetzt keine anwaltliche Beratung.",
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return posts.map((p) => p.slug);
}
