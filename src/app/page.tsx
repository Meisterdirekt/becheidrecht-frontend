import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Shield, Scale } from "lucide-react";

export default function BescheidRechtLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="text-blue-500 font-bold tracking-wide">BESCHEIDRECHT</div>
        <div className="flex items-center gap-6">
          <div className="flex gap-1 rounded-full bg-white/5 p-1 text-xs">
            {['DE','EN','TR','AR','RU'].map(l => (
              <span key={l} className={`px-2 py-1 rounded-full ${l==='DE' ? 'bg-blue-600 text-white' : 'text-white/60'}`}>
                {l}
              </span>
            ))}
          </div>
          <Button variant="ghost" className="text-white">ANMELDEN</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">REGISTRIEREN</Button>
        </div>
      </header>

      {      {/* Hero */}
      <section className="text-center px-6 py-32">
        <h1 className="text-5xl md:text-6xl font-extrabold italic uppercase mb-8 leading-tight">
          AUCH GENUG VOM BEHÖRDEN-<br />WAHNSINN?
        </h1>
        <p className="max-w-4xl mx-auto text-lg md:text-xl text-white/70 mb-16">
          Laden Sie Ihr Dokument hoch und lassen Sie sich durch unsere KI-gesteuerte Analyse helfen.
          Die KI prüft genau, ob alles korrekt ist und erstellt Ihnen ein passendes Schreiben,
          das Sie direkt losschicken können.
        </p>

        <div className="max-w-2xl mx-auto rounded-[32px] bg-white/5 p-10">
          <Button size="lg" className="w-full py-7 text-base tracking-widest bg-blue-600 hover:bg-blue-700">
            DOKUMENT JETZT HOCHLADEN
          </Button>
        </div>
      </section>

      {/* Pricing */}}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
          {[{
            name: 'BASIS', price: '9,90 €', items: ['5 ANALYSEN', '5 SCHREIBEN'], dark: true
          },{
            name: 'PLUS', price: '17,90 €', items: ['15 ANALYSEN', '15 SCHREIBEN'], highlight: true
          },{
            name: 'SOZIAL PRO', price: '49 €', items: ['50 ANALYSEN', '50 SCHREIBEN'], dark: true
          },{
            name: 'BUSINESS', price: '99 €', items: ['150 ANALYSEN', '150 SCHREIBEN'], dark: true
          }].map((p,i)=>(
            <Card key={i} className={`rounded-2xl ${p.highlight ? 'bg-blue-600' : 'bg-slate-900'}`}>
              <CardContent className="p-6">
                <h3 className="text-sm tracking-widest mb-2">{p.name}</h3>
                <div className="text-3xl font-bold mb-4">{p.price}</div>
                <ul className="space-y-2 text-sm text-white/80 mb-6">
                  {p.items.map((it,idx)=>(
                    <li key={idx} className="flex gap-2 items-center"><CheckCircle className="h-4 w-4" />{it}</li>
                  ))}
                </ul>
                <Button className="w-full bg-white text-black hover:bg-white/90">WÄHLEN</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {[{icon: Scale, title:'KI‑RECHTSCHECK'}, {icon: FileText, title:'FERTIGE SCHREIBEN'}, {icon: Shield, title:'DATENSCHUTZ'}].map((t,i)=>(
            <Card key={i} className="bg-slate-900 rounded-2xl">
              <CardContent className="p-6">
                <t.icon className="h-6 w-6 text-blue-500 mb-4" />
                <h3 className="font-semibold mb-2">{t.title}</h3>
                <p className="text-sm text-white/60">Sichere Bearbeitung Ihrer Anliegen.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
