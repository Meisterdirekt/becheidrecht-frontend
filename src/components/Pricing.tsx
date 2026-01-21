import React from 'react';
import { Check } from 'lucide-react';

interface PricingProps {
  title: string;
  chooseBtnText: string;
  popularTag: string;
}

const plans = [
  { name: 'Basis', price: '9,90 €', features: ['5 Analysen', '5 Schreiben', 'max. 10 Seiten'], color: 'bg-slate-100', text: 'text-slate-900', btn: 'bg-blue-600 text-white' },
  { name: 'Plus', price: '17,90 €', features: ['15 Analysen', '15 Schreiben', 'max. 20 Seiten', 'Anträge & Widersprüche'], color: 'bg-blue-600', text: 'text-white', popular: true, btn: 'bg-white text-blue-600' },
  { name: 'Sozial PRO', price: '49 €', features: ['50 Analysen', '50 Schreiben', 'max. 30 Seiten', 'Mehrplatzfähig'], color: 'bg-[#002d5d]', text: 'text-white', btn: 'bg-white text-[#002d5d]' },
  { name: 'Business', price: '99 €', features: ['150 Analysen', '150 Schreiben', 'max. 50 Seiten', 'Berufliche Nutzung'], color: 'bg-[#0a192f]', text: 'text-white', btn: 'bg-white text-[#0a192f]' },
];

export default function Pricing({ title, chooseBtnText, popularTag }: PricingProps) {
  return (
    <section className="py-20 px-4">
      <h2 className="text-3xl font-bold text-center mb-12 text-white">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.name} className={`${plan.color} ${plan.text} p-6 rounded-2xl shadow-xl flex flex-col relative ${plan.popular ? 'scale-105 z-10' : ''}`}>
            {plan.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-400 text-white text-xs py-1 px-4 rounded-full font-bold">{popularTag}</span>}
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold mb-6">{plan.price}</div>
            <ul className="space-y-3 mb-8 flex-grow">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm italic">
                  <Check size={16} /> {f}
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-lg font-bold transition-transform hover:scale-105 ${plan.btn}`}>
              {chooseBtnText}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
