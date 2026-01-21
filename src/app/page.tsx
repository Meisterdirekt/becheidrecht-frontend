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
      download: "2 Dateien herunterladen",
      login: "Anmelden",
      register: "Registrieren",
      plans: ["Basis", "Plus", "Sozial PRO", "Business"]
    },
    RU: {
      hero: "Устали от бюрократического безумия?",
      sub: "Загрузите свой документ и позвольте нашему ИИ помочь вам. ИИ проверит все детали и создаст подходящее письмо, которое вы сможете отправить сразу.",
      upload: "Загрузить документ",
      download: "Скачать 2 файла",
      login: "Войти",
      register: "Регистрация",
      plans: ["Базовый", "Плюс", "Социальный ПРО", "Бизнес"]
    },
    EN: {
      hero: "Tired of bureaucratic madness?",
      sub: "Upload your document and let our AI-driven analysis help you. The AI checks exactly if everything is correct and creates a suitable letter for you.",
      upload: "Upload document now",
      download: "Download 2 files",
      login: "Login",
      register: "Register",
      plans: ["Basic", "Plus", "Social PRO", "Business"]
    },
    TR: {
      hero: "Bürokrasi çılgınlığından bıktınız mı?",
      sub: "Belgenizi yükleyin ve yapay zeka destekli analizimizin size yardımcı olmasına izin verin. Yapay zeka her şeyi kontrol eder ve hazır mektup oluşturur.",
      upload: "Belgeyi şimdi yükle",
      download: "2 dosyayı indir",
      login: "Giriş",
      register: "Kayıt Ol",
      plans: ["Temel", "Artı", "Sosyal PRO", "İş Dünyası"]
    },
    AR: {
      hero: "هل سئمت من الجنون البيروقراطي؟",
      sub: "قم بتحميل مستندك ودع تحليلنا المدعوم بالذكاء الاصطناعي يساعدك. يتحقق الذكاء الاصطناعي من صحة كل شيء ويقوم بإنشاء خطاب جاهز لك.",
      upload: "تحميل المستند الآن",
      download: "تحميل ملفين 2",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      plans: ["أساسي", "بلاس", "برو اجتماعي", "أعمال"]
    }
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5 bg-[#05070a]">
        <div className="text-xl font-bold text-blue-500 uppercase tracking-tighter">BescheidRecht</div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex bg-white/5 p-1 rounded-lg border border-white/10">
            {['DE', 'EN', 'TR', 'AR', 'RU'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded text-[10px] font-bold ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}>{l}</button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-bold uppercase hover:text-blue-500 transition-colors">
              {t.login}
            </Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
              {t.register}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-16 px-6 pb-24 text-center">
        <h1 className="text-3xl md:text-5xl font-black mb-6 max-w-4xl mx-auto leading-tight italic uppercase tracking-tighter">
          {t.hero}
        </h1>
        <p className="text-gray-400 max-w-3xl mx-auto mb-12 text-md leading-relaxed font-medium">
          {t.sub}
        </p>

        {/* UPLOAD & DOWNLOAD BEREICH */}
        <div className="max-w-2xl mx-auto bg-[#0a0c10] border border-white/10 p-12 rounded-[2.5rem] shadow-2xl mb-20">
          {!isAnalyzed ? (
            <button 
              onClick={() => setIsAnalyzed(true)} 
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl text-xl font-black transition-all shadow-lg shadow-blue-600/20 italic uppercase tracking-widest"
            >
              {t.upload}
            </button>
          ) : (
            <div className="text-left space-y-6">
              <div className="bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20 flex gap-4 text-sm italic text-gray-300">
                <MessageSquare className="text-blue-500 shrink-0" />
                <p>Analyse abgeschlossen. Das Schreiben steht bereit.</p>
              </div>
              <button className="w-full bg-white text-black py-4 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-gray-200 transition-all shadow-xl">
                <Download size={20} /> {t.download}
              </button>
              <button 
                onClick={() => setIsAnalyzed(false)}
                className="w-full text-[10px] text-gray-500 uppercase font-bold text-center mt-2 hover:text-white"
              >
                Zurück zum Upload
              </button>
            </div>
          )}
        </div>

        {/* ABO SÄULEN */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-16 max-w-6xl mx-auto text-left">
          {[
            { name: t.plans[0], price: "9,90 €", features: ["5 Analysen", "5 Schreiben"], high: false },
            { name: t.plans[1], price: "17,90 €", features: ["15 Analysen", "15 Schreiben"], high: true },
            { name: t.plans[2], price: "49 €", features: ["50 Analysen", "50 Schreiben"], high: false, dark: true },
            { name: t.plans[3], price: "99 €", features: ["150 Analysen", "150 Schreiben"], high: false, dark: true }
          ].map((p, i) => (
            <div key={i} className={`p-6 rounded-2xl border transition-all ${p.high ? 'bg-blue-600 border-blue-400 scale-105 z-10 pb-10' : p.dark ? 'bg-[#002147] border-white/10' : 'bg-[#0d1117] border-white/5'}`}>
              <h3 className="text-[10px] font-bold opacity-80 uppercase mb-1">{p.name}</h3>
              <div className="text-2xl font-black mb-6 italic">{p.price}</div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-80 italic">
                    <CheckCircle2 size={12} className="text-white" /> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-2.5 rounded-lg font-black text-[10px] uppercase ${p.high || p.dark ? 'bg-white text-blue-900' : 'bg-blue-600 text-white'}`}>Wählen</button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {["KI-Rechtscheck", "Fertige Schreiben", "Datenschutz"].map((box, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl text-left hover:bg-white/10 transition">
              <div className="mb-3">
                {i === 0 ? <Scale size={20} className="text-blue-500" /> : i === 1 ? <FileText size={20} className="text-blue-500" /> : <ShieldCheck size={20} className="text-blue-500" />}
              </div>
              <h4 className="font-black text-xs uppercase mb-1 tracking-widest">{box}</h4>
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed">Sichere Bearbeitung Ihrer Anliegen.</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
