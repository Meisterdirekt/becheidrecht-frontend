"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Clock, TrendingUp, Sparkles } from "lucide-react";

const TARIFE = [
  { name: "Starter", analysen: 300, preis: 199 },
  { name: "Team", analysen: 1000, preis: 399 },
  { name: "Einrichtung", analysen: 2500, preis: 699 },
];

function getEmpfohlenTarif(bescheide: number) {
  if (bescheide <= 300) return TARIFE[0];
  if (bescheide <= 1000) return TARIFE[1];
  return TARIFE[2];
}

function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  unit: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-3">
        <label className="text-xs font-bold uppercase tracking-widest text-white/40">
          {label}
        </label>
        <span className="text-[var(--accent)] font-black text-xl leading-none">
          {value.toLocaleString("de")}{" "}
          <span className="text-white/35 text-sm font-normal">{unit}</span>
        </span>
      </div>
      <div className="relative h-1.5 bg-white/10 rounded-full">
        <div
          className="absolute left-0 top-0 h-full bg-[var(--accent)] rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ accentColor: "var(--accent)" }}
        />
      </div>
      <div className="flex justify-between text-xs text-white/20 mt-1.5">
        <span>{min.toLocaleString("de")}</span>
        <span>{max.toLocaleString("de")}</span>
      </div>
    </div>
  );
}

function ResultCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  green,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  green?: boolean;
}) {
  const borderClass = green
    ? "bg-green-500/[0.07] border-green-500/20"
    : accent
    ? "bg-[var(--accent)]/[0.07] border-[var(--accent)]/20"
    : "bg-white/[0.03] border-white/10";
  const iconClass = green
    ? "text-green-400"
    : accent
    ? "text-[var(--accent)]"
    : "text-white/30";
  const valueClass = green
    ? "text-green-400"
    : accent
    ? "text-[var(--accent)]"
    : "text-white";

  return (
    <div className={`flex items-center gap-4 rounded-2xl p-5 border ${borderClass}`}>
      <Icon className={`h-5 w-5 flex-shrink-0 ${iconClass}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-widest text-white/35 mb-0.5">{label}</p>
        <p className={`text-2xl font-black leading-none ${valueClass}`}>{value}</p>
        {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export function RoiCalculator() {
  const [berater, setBerater] = useState(5);
  const [bescheide, setBescheide] = useState(20);
  const [stundenlohn, setStundenlohn] = useState(35);

  const gesamtBescheide = berater * bescheide;
  const minutenGespart = gesamtBescheide * 24; // 25 min manuell – 1 min KI
  const stundenGespart = parseFloat((minutenGespart / 60).toFixed(1));
  const wertGespart = Math.round(stundenGespart * stundenlohn);
  const tarif = getEmpfohlenTarif(gesamtBescheide);
  const nettovorteil = wertGespart - tarif.preis;
  const roi = tarif.preis > 0 ? Math.round((nettovorteil / tarif.preis) * 100) : 0;

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Inputs */}
      <div className="space-y-8">
        <SliderInput
          label="Anzahl Berater"
          value={berater}
          min={1}
          max={20}
          onChange={setBerater}
          unit="Personen"
        />
        <SliderInput
          label="Bescheide pro Berater / Monat"
          value={bescheide}
          min={5}
          max={50}
          onChange={setBescheide}
          unit="Bescheide"
        />
        <SliderInput
          label="Ø Stundenlohn (brutto)"
          value={stundenlohn}
          min={20}
          max={60}
          step={5}
          onChange={setStundenlohn}
          unit="€/h"
        />
        <p className="text-xs text-white/25 leading-relaxed">
          Berechnung: 25 Min. manuelle Prüfung – 1 Min. mit KI = 24 Min. Ersparnis pro Bescheid.
        </p>
      </div>

      {/* Results */}
      <div className="space-y-3">
        <ResultCard
          icon={Clock}
          label="Zeitersparnis / Monat"
          value={`${stundenGespart} h`}
          sub={`${gesamtBescheide} Bescheide × 24 Min.`}
        />
        <ResultCard
          icon={TrendingUp}
          label="Wert der Zeitersparnis"
          value={`${wertGespart.toLocaleString("de")} €`}
          sub={`${stundenGespart} h × ${stundenlohn} €/h`}
          accent
        />
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-white/35 mb-3">
            Empfohlener Tarif
          </p>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-white">{tarif.name}</p>
              <p className="text-white/35 text-sm mt-0.5">
                bis {tarif.analysen.toLocaleString("de")} Analysen / Monat
              </p>
            </div>
            <p className="text-2xl font-black text-[var(--accent)]">
              {tarif.preis} <span className="text-white/35 text-sm font-normal">€/Mo.</span>
            </p>
          </div>
        </div>
        <ResultCard
          icon={Sparkles}
          label={roi >= 0 ? "ROI — Nettovorteil" : "ROI"}
          value={roi >= 0 ? `+${roi} %` : `${roi} %`}
          sub={`Nettovorteil: ${nettovorteil.toLocaleString("de")} € / Monat`}
          green={nettovorteil > 0}
        />
      </div>
    </div>
  );
}
