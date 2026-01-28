import React from 'react';

export const Pricing = () => (
  <section className="bg-white text-black py-20">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 px-6">
      <div className="bg-gray-50 p-6 rounded-xl border flex flex-col min-h-[450px]">
        <span className="text-[10px] font-bold text-gray-400 uppercase">Basic</span>
        <div className="text-2xl font-black mt-2 italic">12,90 €</div>
        <button className="mt-auto bg-blue-600 text-white py-2 rounded font-bold text-xs uppercase">Wählen</button>
      </div>
      {/* ... (Standard, Pro, Business entsprechend Bild 10) */}
      <div className="bg-blue-600 text-white p-8 rounded-xl scale-105 shadow-2xl flex flex-col min-h-[500px]">
        <span className="text-[10px] font-bold uppercase opacity-70">Pro</span>
        <div className="text-4xl font-black mt-2 italic">75 €</div>
        <button className="mt-auto bg-white text-blue-600 py-3 rounded font-bold text-xs uppercase">Wählen</button>
      </div>
    </div>
  </section>
);
