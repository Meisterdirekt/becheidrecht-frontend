import Link from "next/link";
import { FileText, ScrollText, ExternalLink } from "lucide-react";

export const metadata = { robots: "noindex, nofollow" };

export default function InternPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" data-theme="light">
      <div className="max-w-lg w-full">
        <div className="text-center mb-10">
          <p className="text-2xl font-black text-slate-900">
            Bescheid<span className="text-sky-500">Recht</span>
          </p>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold">Interne Werkzeuge</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/angebot"
            target="_blank"
            className="flex items-center gap-5 p-6 bg-white rounded-2xl border-2 border-sky-100 hover:border-sky-400 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-100 transition-colors">
              <FileText className="h-5 w-5 text-sky-500" />
            </div>
            <div className="flex-1">
              <p className="font-black text-slate-900">Angebot erstellen</p>
              <p className="text-slate-500 text-sm mt-0.5">Preisübersicht für Einrichtungen — ausfüllen & als PDF drucken</p>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-sky-400 transition-colors" />
          </Link>

          <Link
            href="/rahmenvertrag"
            target="_blank"
            className="flex items-center gap-5 p-6 bg-white rounded-2xl border-2 border-slate-100 hover:border-slate-400 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-100 transition-colors">
              <ScrollText className="h-5 w-5 text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="font-black text-slate-900">Rahmenvertrag</p>
              <p className="text-slate-500 text-sm mt-0.5">Unterschriftsreifer Vertrag (10 §§) — ausfüllen & als PDF drucken</p>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
          </Link>
        </div>

        <p className="text-center text-slate-300 text-xs mt-10 uppercase tracking-widest">
          Nicht öffentlich verlinkt · Nur intern
        </p>
      </div>
    </main>
  );
}
