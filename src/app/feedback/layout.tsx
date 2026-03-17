import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback geben — BescheidRecht verbessern",
  description:
    "Bewerten Sie BescheidRecht und teilen Sie Verbesserungsvorschläge. Ihre Rückmeldung hilft uns, das Tool besser zu machen.",
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
