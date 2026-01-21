'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Download, CheckCircle2, MessageSquare, Scale, FileText, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('DE');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const translations: any = {
    DE: {
      hero: "Auch genug vom Behörden-Wahnsinn?",
      sub: "Laden Sie Ihr Dokument hoch und lassen Sie sich durch unsere KI-gesteuerte Analyse helfen. Die KI prüft genau, ob alles korrekt ist und erstellt Ihnen ein passendes Schreiben, das Sie direkt losschicken können.",
      upload: "Dokument jetzt hochladen",
      download: "Schreiben herunterladen",
      plans: ["Basis", "Plus", "Sozial PRO", "Business"],
      boxes: ["KI-Rechtscheck", "Fertige Schreiben", "Datenschutz"],
      boxTexts: ["Prüfung auf Formfehler und Fristen.", "Direkter Download als PDF oder Word.", "Ihre Dokumente werden sicher verschlüsselt."]
    },
    RU: {
      hero: "Устали от бюрократического безумия?",
      sub: "Загрузите свой документ и позвольте нашему ИИ помочь вам. ИИ проверит все детали и создаст подходящее письмо, которое вы сможете отправить сразу.",
      upload: "Загрузить документ",
      download: "Скачать письмо",
      plans: ["Базовый", "Плюс", "Социальный ПРО", "Бизнес"],
      boxes: ["ИИ-Проверка", "Готовые письма", "Защита данных"],
      boxTexts: ["Проверка формальных ошибок и сроков.", "Прямая загрузка в PDF или Word.", "Ваши документы надежно зашифрованы."]
    },
    EN: {
      hero: "Tired of bureaucratic madness?",
      sub: "Upload your document and let our AI-driven analysis help you. The AI checks exactly if everything is correct and creates a suitable letter for you.",
      upload: "Upload document now",
      download: "Download letter",
      plans: ["Basic", "Plus", "Social PRO", "Business"],
      boxes: ["AI Legal Check", "Ready Letters", "Data Protection"],
      boxTexts: ["Check for formal errors and deadlines.", "Direct download as PDF or Word.", "Your documents are securely encrypted."]
    },
    TR: {
      hero: "Bürokrasi çılgınlığından bıktınız mı?",
      sub: "Belgenizi yükleyin ve yapay zeka destekli analizimizin size yardımcı olmasına izin verin. Yapay zeka her şeyi kontrol eder ve hazır mektup oluşturur.",
      upload: "Belgeyi şimdi yükle",
      download: "Mektubu indir",
      plans: ["Temel", "Artı", "Sosyal PRO", "İş Dünyası"],
      boxes: ["YZ Hukuk Kontrolü", "Hazır Metinler", "Veri Koruma"],
      boxTexts: ["Hatalar ve süreler için kontrol.", "PDF veya Word olarak indirme.", "Belgeleriniz güvenli bir şekilde şifrelenir."]
    },
    AR: {
      hero: "هل سئمت من الجنون البيروقراطي؟",
      sub: "قم بتحميل مستندك ودع تحليلنا المدعوم بالذكاء الاصطناعي يساعدك. يتحقق الذكاء الاصطناعي من صحة كل شيء ويقوم بإنشاء خطاب جاهز لك.",
      upload: "تحميل المستند الآن",
      download: "تحميل الخطاب",
      plans: ["أساسي", "بلاس", "برو اجتماعي", "أعمال"],
      boxes: ["فحص قانوني ذكي", "خطابات جاهزة", "حماية البيانات"],
      boxTexts: ["التحقق من الأخطاء الشكلية والمواعيد.", "تحميل مباشر بصيغة PDF أو Word.", "مستنداتك مشفرة بشكل آمن."]
    }
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
        <div className="text-xl font-bold text-blue-500 uppercase tracking-tighter">BescheidRecht</div>
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
          {['DE', 'EN', 'TR', 'AR', 'RU'].map((langCode) => (
            <button 
              key={langCode} 
              onClick={() => setLang(langCode)} 
              className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${lang === langCode ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              {langCode}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-16 px-6 pb-24 text-center">
        <h1 className="text-3xl md:text-5xl font-black mb-6 max-w-4xl mx-auto leading-tight">{t.hero}</h1>
        <p className="text-gray-400 max-w-3xl mx-auto mb-12 text-md leading-relaxed">{t.sub}</p>

        <div className="max-w-2xl mx-auto bg-[#0a0c10] border border-white/10 p-12 rounded-[2.5rem] shadow-2xl mb-20">
          {!isAnalyzed ? (
            <button onClick={() => setIsAnalyzed(true)} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl text-xl font-black transition-all shadow-lg shadow-blue-600/20 italic">
              {t.upload}
            </button>
          ) : (
            <div className="text-left space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20 flex gap-4 text-sm italic text-gray-300">
                <MessageSquare className="text-blue-500 shrink-0" />
                <p>Analyse abgeschlossen. Ihr Dokument wurde geprüft. Das Schreiben steht bereit.</p>
              </div>
              <button className="w-full bg-white text-black py-4 rounded-xl font-black flex items-center justify-center gap-3">
                <Download size={20} /> {t.download}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-16 max-w-6xl mx-auto text-left">
          {[
            { name: t.plans[0], price: "9,90 €", features: ["5 Analysen", "5 Schreiben"], btn: "Wählen", high: false },
            { name: t.plans[1], price: "17,90 €", features: ["15 Analysen", "15 Schreiben", "Anträge"], btn: "Wählen", high: true },
            { name: t.plans[2], price: "49 €", features: ["50 Analysen", "50 Schreiben", "Multi"], btn: "Wählen", high: false, dark: true },
            { name: t.plans[3], price: "99 €", features: ["150 Analysen", "150 Schreiben", "Profi"], btn: "Wählen", high: false, dark: true }
          ].map((p, i) => (
            <div key={i} className={`p-6 rounded-2xl border transition-all ${p.high ? 'bg-blue-600 border-blue-400 scale-105 shadow-2xl z-10 pb-10' : p.dark ? 'bg-[#002147] border-white/10' : 'bg-[#0d1117] border-white/5'}`}>
              <h3 className="text-[10px] font-bold opacity-80 uppercase mb-1">{p.name}</h3>
              <div className="text-2xl font-black mb-6 italic">{p.price}</div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight opacity-90 italic">
                    <CheckCircle2 size={12} className="text-white" /> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-2.5 rounded-lg font-black text-[10px] uppercase transition ${p.high || p.dark ? 'bg-white text-blue-900' : 'bg-blue-600 text-white'}`}>{p.btn}</button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {t.boxes.map((box, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl text-left hover:bg-white/10 transition">
              <div className="mb-3">
                {i === 0 ? <Scale size={20} className="text-blue-500" /> : i === 1 ? <FileText size={20} className="text-blue-500" /> : <ShieldCheck size={20} className="text-blue-500" />}
              </div>
              <h4 className="font-black text-xs uppercase mb-1 tracking-widest">{box}</h4>
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed">{t.boxTexts[i]}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
