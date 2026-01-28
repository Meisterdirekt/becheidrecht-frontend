"use client";

import React, { useState } from 'react';

const translations = {
  DE: {
    headline: "EFFIZIENZ STEIGERN. ZEIT SPAREN. ENTLASTUNG SCHAFFEN.",
    text: "Die Analyse von Sozial- und Verwaltungsschreiben darf keine wertvollen Kapazitäten binden. BescheidRecht ist das digitale Präzisionswerkzeug für die automatisierte Strukturierung komplexer Dokumente. Wir liefern die technologische Lösung, um bürokratische Prozesse massiv zu beschleunigen, wertvolle Zeit zu sparen und die Fehlerquote in der Sachbearbeitung signifikant zu senken. \n\n Laden Sie Ihr Dokument hoch und erhalten Sie unmittelbar eine tiefgreifende strukturelle Analyse sowie einen professionell formulierten Antwort-Entwurf. Gewinnen Sie die Kontrolle über Ihren Terminkalender zurück, entlasten Sie Ihre Ressourcen und sichern Sie eine gleichbleibend hohe Qualität in jedem Verfahren – hochperformant, zeitsparend und absolut präzise.",
    button: "DOKUMENT JETZT HOCHLADEN",
  },
  EN: {
    headline: "BOOST EFFICIENCY. SAVE TIME. CREATE RELIEF.",
    text: "The analysis of social and administrative documents must not tie up valuable capacities. BescheidRecht is the digital precision tool for the automated structuring of complex documents. We provide the technological solution to massively accelerate bureaucratic processes, save valuable time, and significantly reduce error rates in case processing. \n\n Upload your document and immediately receive a profound structural analysis and a professionally formulated response draft. Regain control of your schedule, relieve your resources, and ensure consistently high quality in every procedure – high-performance, time-saving, and absolutely precise.",
    button: "UPLOAD DOCUMENT NOW",
  },
  TR: {
    headline: "VERİMLİLİĞİ ARTIRIN. ZAMANDAN TASARRUF EDİN. RAHATLIK SAĞLAYIN.",
    text: "Sosyal ve idari belgelerin analizi değerli kapasiteleri meşgul etmemelidir. BescheidRecht, karmaşık belgelerin otomatik yapılandırılması için dijital hassas bir araçtır. Bürokrasi süreçlerini büyük ölçüde hızlandırmak, değerli zamandan tasarruf etmek ve dosya işlemedeki hata oranlarını önemli ölçüde düşürmek için teknolojik çözümler sunuyoruz. \n\n Belgenizi yükleyin und anında derinlemesine yapısal bir analiz ile profesyonelce formüle edilmiş bir yanıt taslağı alın. Takviminizi geri kazanın, kaynaklarınızı rahatlatın ve her prosedürde sürdürülebilir yüksek kalite sağlayın – yüksek performanslı, zaman tasarrufu sağlayan ve kesinlikle hassas.",
    button: "BELGEYİ ŞİMDİ YÜKLE",
  },
  RU: {
    headline: "ПОВЫШЕНИЕ ЭФФЕКТИВНОСТИ. ЭКОНОМИЯ ВРЕМЕНИ. ОБЛЕГЧЕНИЕ РАБОТЫ.",
    text: "Анализ социальных и административных документов не должен отнимать ценные ресурсы. BescheidRecht — это цифровой прецизионный инструмент для автоматизированного структурирования сложных документов. Мы предлагаем технологическое решение для массового ускорения бюрократических процессов, экономии драгоценного времени и значительного снижения количества ошибок в делопроизводстве. \n\n Загрузите документ и мгновенно получите глубокий структурный анализ и профессионально сформулированный проект ответа. Верните контроль над своим графиком, разгрузите ресурсы и обеспечьте неизменно высокое качество – высокопроизводительно, экономно и абсолютно точно.",
    button: "ЗАГРУЗИТЬ ДОКУМЕНТ",
  },
  AR: {
    headline: "تعزيز الكفاءة. توفير الوقت. إحداث طفرة في الراحة.",
    text: "يجب ألا يستهلك تحليل الوثائق الاجتماعية والإدارية قدرات ثمينة. BescheidRecht هو أداة الدقة الرقمية للأتمتة الهيكلية للمستندات المعقدة. نحن نقدم الحل التكنولوجي لتسريع العمليات البيروقراطية بشكل هائل، وتوفير الوقت الثمين، وخفض معدلات الخطأ في معالجة الملفات بشكل ملحوظ. \n\n قم برفع مستندك واحصل فوراً على تحليل هيكلي عميق ومسودة رد مصاغة باحترافية. استعد السيطرة على جدولك الزمني، وخفف العبء عن مواردك، واضمن جودة عالية ومتسقة في كل إجراء - أداء عالٍ، موفر للوقت، ودقة مطلقة.",
    button: "تحميل المستند الآن",
  }
};

export default function Page() {
  const [lang, setLang] = useState('DE');
  const t = translations[lang as keyof typeof translations];

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      {/* NAVIGATION */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <div className="flex gap-4">
          {Object.keys(translations).map((l) => (
            <button 
              key={l} 
              onClick={() => setLang(l)}
              className={`text-xs font-bold transition-colors ${lang === l ? 'text-blue-500' : 'text-white/40 hover:text-white'}`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-6 items-center">
          <button className="text-white/80 hover:text-white text-xs font-bold uppercase tracking-widest">Anmelden</button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded uppercase tracking-widest transition-colors">Registrieren</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-4xl mx-auto py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase mb-12 leading-tight">
          {t.headline}
        </h1>
        <p className="text-xl text-gray-400 max-w-xl mx-auto leading-relaxed text-base md:text-lg whitespace-pre-line mb-12">
          {t.text}
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-lg font-black text-sm tracking-[0.2em] uppercase transition-all shadow-2xl shadow-blue-900/40 active:scale-95">
          {t.button}
        </button>
      </section>

      {/* ERKLÄRUNGS-KÄSTCHEN */}
      <section className="max-w-5xl mx-auto px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
            <h3 className="font-bold mb-3 text-lg">Analyse</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Strukturierte Prüfung Ihres Bescheids auf Auffälligkeiten, Fristen und Begründungen.
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
            <h3 className="font-bold mb-3 text-lg">Automatische Schreiben</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Klar formulierte Schreiben als Vorlage zur direkten Weiterverwendung in Ihrem Verfahren.
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
            <h3 className="font-bold mb-3 text-lg">Verständlich & sicher</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Einfach erklärt, DSGVO-konform verarbeitet und jederzeit nachvollziehbar strukturiert.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pb-32 px-6">
        <h2 className="text-center text-4xl font-black mb-4 uppercase tracking-tighter">Transparente Preise</h2>
        <p className="text-center text-white/40 mb-16 text-sm">Wählen Sie das Paket, das zu Ihrer Situation passt.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
          <div className="bg-white/[0.03] rounded-xl p-8 border border-white/10 flex flex-col">
            <p className="text-[10px] font-bold text-white/40 mb-2 tracking-[0.2em]">BASIC</p>
            <p className="text-3xl font-bold mb-6">12,90 €</p>
            <ul className="text-white/50 text-xs space-y-3 mb-8 flex-grow">
              <li>• 5 Dokumente</li>
              <li>• Automatisierte Analyse</li>
              <li>• Ideal für einzelne Bescheide</li>
            </ul>
            <button className="w-full bg-blue-600 py-3 rounded font-bold text-[10px] uppercase tracking-widest">Basic wählen</button>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-8 border border-white/10 flex flex-col">
            <p className="text-[10px] font-bold text-white/40 mb-2 tracking-[0.2em]">STANDARD</p>
            <p className="text-3xl font-bold mb-6">27,90 €</p>
            <ul className="text-white/50 text-xs space-y-3 mb-8 flex-grow">
              <li>• 12 Dokumente</li>
              <li>• Widersprüche & Anträge</li>
              <li>• Für regelmäßige Nutzung</li>
            </ul>
            <button className="w-full bg-blue-600 py-3 rounded font-bold text-[10px] uppercase tracking-widest">Standard wählen</button>
          </div>
          <div className="bg-blue-600 rounded-xl p-8 shadow-2xl flex flex-col scale-105 z-10">
            <p className="text-[10px] font-bold text-white/80 mb-2 tracking-[0.2em]">PRO</p>
            <p className="text-4xl font-bold mb-6">75 €</p>
            <ul className="text-white/90 text-xs space-y-3 mb-8 flex-grow">
              <li>• 35 Dokumente</li>
              <li>• Priorisierte Verarbeitung</li>
              <li>• Komplexe Verfahren</li>
            </ul>
            <button className="w-full bg-white text-blue-600 py-3 rounded font-bold text-[10px] uppercase tracking-widest">Pro wählen</button>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-8 border border-white/10 flex flex-col">
            <p className="text-[10px] font-bold text-white/40 mb-2 tracking-[0.2em]">BUSINESS</p>
            <p className="text-3xl font-bold mb-6">159 €</p>
            <ul className="text-white/50 text-xs space-y-3 mb-8 flex-grow">
              <li>• 90 Dokumente</li>
              <li>• Für Kanzleien & Einrichtungen</li>
              <li>• Hohe Nutzung & Effizienz</li>
            </ul>
            <button className="w-full bg-white text-black py-3 rounded font-bold text-[10px] uppercase tracking-widest">Business wählen</button>
          </div>
        </div>
      </section>

      {/* EINZELKAUF */}
      <section className="py-32 px-6">
        <h3 className="text-center text-3xl font-black mb-4 uppercase tracking-tighter">Einzelnes Dokument</h3>
        <p className="text-center text-white/40 mb-12 text-sm">Für einen einmaligen Bescheid – ohne Abo.</p>
        <div className="max-w-md mx-auto">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-center">
            <p className="text-[10px] font-bold text-white/40 mb-2 tracking-[0.2em]">EINZELKAUF</p>
            <p className="text-5xl font-black mb-8 text-blue-500">19,90 €</p>
            <ul className="text-white/60 text-sm space-y-4 mb-10 text-left list-none">
              <li><span className="text-blue-500 mr-2">✔</span> 1 Dokument</li>
              <li><span className="text-blue-500 mr-2">✔</span> Automatisierte Analyse</li>
              <li><span className="text-blue-500 mr-2">✔</span> 1 Schreiben</li>
              <li><span className="text-red-500/50 mr-2">✖</span> Kein Abo</li>
            </ul>
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded font-bold text-xs uppercase tracking-[0.2em] transition-colors">
              Einzelkauf starten
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-16 text-center text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">
        <div className="flex justify-center gap-12 mb-8">
          <a href="/impressum" className="hover:text-white transition-colors">Impressum</a>
          <a href="/datenschutz" className="hover:text-white transition-colors">Datenschutz</a>
          <a href="/agb" className="hover:text-white transition-colors">AGB</a>
        </div>
        <p>© 2026 BescheidRecht. Alle Rechte vorbehalten.</p>
      </footer>
    </main>
  );
}
