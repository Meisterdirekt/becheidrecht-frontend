/**
 * Vollständige Übersetzungen für die Startseite (Hero, Tabs, Formular, Ergebnis, Sektionen, Nav, Footer).
 * Sprache wird über den Sprachumschalter (DE/EN/RU/AR/TR) gesteuert.
 */

export type Lang = "DE" | "RU" | "EN" | "AR" | "TR";

export interface PageT {
  dir: "ltr" | "rtl";
  headline: string;
  headlineSub?: string;
  text: string;
  button: string;
  consent: string;
  tabAnalyze: string;
  tabLetter: string;
  formBehoerdeLabel: string;
  formBehoerdePlaceholder: string;
  formSchreibentypLabel: string;
  formSchreibentypPlaceholder: string;
  formStichpunkteLabel: string;
  formStichpunktePlaceholder: string;
  formStichpunkteHint: string;
  formAktenzeichenLabel: string;
  formAktenzeichenHint: string;
  formBescheiddatumLabel: string;
  formBescheiddatumPlaceholder: string;
  formAdresseLabel: string;
  formAdresseOptional: string;
  formStrassePlaceholder: string;
  formPlzPlaceholder: string;
  formOrtPlaceholder: string;
  consentLetter: string;
  btnGenerateLetter: string;
  btnGenerating: string;
  resultTitle: string;
  resultAktenzeichen: string;
  resultBehoerde: string;
  resultDatum: string;
  resultUnserZeichen: string;
  resultAnlage: string;
  resultWarning: string;
  btnCopy: string;
  btnDownloadPdf: string;
  btnPrint: string;
  btnNewLetter: string;
  ctaLetter: string;
  trustDsgvo: string;
  trustSofort: string;
  trustPrice: string;
  sectionWhatWeOffer: string;
  sectionAnalyseWriteSecure: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  sectionPrices: string;
  sectionTransparentPrices: string;
  recommended: string;
  pricingBasicName: string;
  pricingBasicPrice: string;
  pricingBasicF1: string;
  pricingBasicF2: string;
  pricingBasicF3: string;
  pricingBasicCta: string;
  pricingStandardName: string;
  pricingStandardPrice: string;
  pricingStandardF1: string;
  pricingStandardF2: string;
  pricingStandardF3: string;
  pricingStandardCta: string;
  pricingProName: string;
  pricingProPrice: string;
  pricingProF1: string;
  pricingProF2: string;
  pricingProF3: string;
  pricingProCta: string;
  pricingBusinessName: string;
  pricingBusinessPrice: string;
  pricingBusinessF1: string;
  pricingBusinessF2: string;
  pricingBusinessF3: string;
  pricingBusinessCta: string;
  sectionOnce: string;
  sectionSingleDoc: string;
  singleDocDesc: string;
  singleDocF1: string;
  singleDocF2: string;
  singleDocF3: string;
  singleDocNoAbo: string;
  singleDocCta: string;
  trustSgb: string;
  trustWeisungen: string;
  trustRechtsgrundlagen: string;
  navBlog: string;
  navLogin: string;
  navRegister: string;
  footerBlog: string;
  footerImpressum: string;
  footerDatenschutz: string;
  footerAgb: string;
  footerCopyright: string;
  letterGreeting: string;
  letterClosing: string;
}

const DE: PageT = {
  dir: "ltr",
  headline: "BescheidRecht",
  headlineSub: "Brief hochladen. Fehler finden.",
  text: "Behördenbriefe sind kompliziert, BescheidRecht ist einfach. Wir analysieren Ihre Dokumente auf typische Fehlerquellen und liefern Ihnen sofort die passenden Fakten für Ihre Rückmeldung. Keine Rechtsberatung, sondern ehrliche Technik, die Licht ins Dunkel der Paragraphen bringt.",
  button: "Dokument jetzt hochladen",
  consent: "Ich willige ein, dass meine (ggf. sensiblen) Daten zur Analyse durch eine KI verarbeitet werden. Mir ist bekannt, dass dies keine Rechtsberatung ersetzt.",
  tabAnalyze: "Bescheid analysieren",
  tabLetter: "Schreiben erstellen",
  formBehoerdeLabel: "Für welche Behörde soll das Schreiben sein?",
  formBehoerdePlaceholder: "Bitte Behörde auswählen...",
  formSchreibentypLabel: "Was möchten Sie schreiben?",
  formSchreibentypPlaceholder: "Bitte Typ auswählen...",
  formStichpunkteLabel: "Beschreiben Sie kurz Ihre Situation",
  formStichpunktePlaceholder: "z.B. \"Bescheid vom 01.02.2026 erhalten, ALG wurde um 30% gekürzt...\"",
  formStichpunkteHint: "Mindestens 20 Zeichen. Max 500 Zeichen.",
  formAktenzeichenLabel: "Aktenzeichen / Bescheid-Nummer: *",
  formAktenzeichenHint: "Steht oben rechts auf Ihrem Bescheid. (Pflichtfeld)",
  formBescheiddatumLabel: "Datum des Bescheids: *",
  formBescheiddatumPlaceholder: "TT.MM.JJJJ",
  formAdresseLabel: "Ihre Adresse:",
  formAdresseOptional: "(optional – für das Schreiben)",
  formStrassePlaceholder: "Straße & Hausnummer",
  formPlzPlaceholder: "PLZ",
  formOrtPlaceholder: "Ort",
  consentLetter: "Ich willige ein, dass meine Daten zur KI-Analyse verarbeitet werden. Dies ersetzt keine Rechtsberatung.",
  btnGenerateLetter: "Schreiben als Vorlage generieren",
  btnGenerating: "Schreiben wird erstellt...",
  resultTitle: "Ihr Schreiben-Entwurf",
  resultAktenzeichen: "Aktenzeichen:",
  resultBehoerde: "Behörde:",
  resultDatum: "Datum:",
  resultUnserZeichen: "Unser Zeichen:",
  resultAnlage: "Anlage: Kopie des Bescheids vom",
  resultWarning: "Entwurf prüfen vor dem Absenden. Kein Ersatz für Rechtsberatung (§ 2 RDG).",
  btnCopy: "Text kopieren",
  btnDownloadPdf: "Als PDF herunterladen",
  btnPrint: "Drucken",
  btnNewLetter: "Neues Schreiben erstellen",
  ctaLetter: "Schreiben erstellen",
  trustDsgvo: "DSGVO-konform",
  trustSofort: "Sofortanalyse",
  trustPrice: "Einmalig 19,90 € ohne Abo",
  sectionWhatWeOffer: "Was wir bieten",
  sectionAnalyseWriteSecure: "Analyse, Schreiben, Sicherheit",
  feature1Title: "Analyse",
  feature1Desc: "Strukturierte Prüfung Ihres Bescheids auf Auffälligkeiten, Fristen und Begründungen.",
  feature2Title: "Automatische Schreiben",
  feature2Desc: "Professionelle Schreiben als Vorlage zur direkten Weiterverwendung in Ihrem Verfahren.",
  feature3Title: "Verständlich & sicher",
  feature3Desc: "Einfach erklärt, DSGVO-konform verarbeitet und jederzeit nachvollziehbar strukturiert.",
  sectionPrices: "Preise",
  sectionTransparentPrices: "Transparente Preise",
  recommended: "EMPFOHLEN",
  pricingBasicName: "Basic",
  pricingBasicPrice: "12,90 €",
  pricingBasicF1: "5 Dokumente",
  pricingBasicF2: "Automatisierte Analyse",
  pricingBasicF3: "Inkl. Antwort-Entwürfe",
  pricingBasicCta: "Basic wählen",
  pricingStandardName: "Standard",
  pricingStandardPrice: "27,90 €",
  pricingStandardF1: "12 Dokumente",
  pricingStandardF2: "Widerspruchs-Analyse",
  pricingStandardF3: "Persönlicher Support",
  pricingStandardCta: "Standard wählen",
  pricingProName: "Pro",
  pricingProPrice: "75 €",
  pricingProF1: "35 Dokumente",
  pricingProF2: "Priorisierte Bearbeitung",
  pricingProF3: "Kanzlei-Anbindung",
  pricingProCta: "Pro wählen",
  pricingBusinessName: "Business",
  pricingBusinessPrice: "159 €",
  pricingBusinessF1: "90 Dokumente",
  pricingBusinessF2: "Full Service & Client-Manager",
  pricingBusinessF3: "Mehrbenutzer-Schnittstelle",
  pricingBusinessCta: "Business wählen",
  sectionOnce: "Einmalig",
  sectionSingleDoc: "Einzelnes Dokument",
  singleDocDesc: "Für einen einmaligen Bescheid – ohne Abo",
  singleDocF1: "1 Dokument",
  singleDocF2: "Automatisierte Analyse",
  singleDocF3: "1 Schreiben",
  singleDocNoAbo: "Kein Abo",
  singleDocCta: "Einzelkauf starten",
  trustSgb: "Basiert auf SGB I–XII",
  trustWeisungen: "Weisungen Stand 2026",
  trustRechtsgrundlagen: "Geprüfte Rechtsgrundlagen",
  navBlog: "Blog",
  navLogin: "Anmelden",
  navRegister: "Registrieren",
  footerBlog: "Blog",
  footerImpressum: "Impressum",
  footerDatenschutz: "Datenschutz",
  footerAgb: "AGB",
  footerCopyright: "© 2026 BescheidRecht. Alle Rechte vorbehalten.",
  letterGreeting: "Sehr geehrte Damen und Herren,",
  letterClosing: "Mit freundlichen Grüßen",
};

const EN: PageT = {
  ...DE,
  dir: "ltr",
  headline: "BOOST EFFICIENCY. SAVE TIME. CREATE RELIEF.",
  headlineSub: "Upload letter. Find errors.",
  text: "Official letters are complicated – BescheidRecht is simple. We analyse your documents for typical problem areas and give you the right facts for your response. Not legal advice, but clear support so you can act with confidence.",
  button: "Upload document now",
  consent: "I consent to my (possibly sensitive) data being processed by AI for analysis. I am aware that this does not replace legal advice.",
  tabAnalyze: "Analyse notice",
  tabLetter: "Create letter",
  formBehoerdeLabel: "Which authority is the letter for?",
  formBehoerdePlaceholder: "Select authority...",
  formSchreibentypLabel: "What do you want to write?",
  formSchreibentypPlaceholder: "Select type...",
  formStichpunkteLabel: "Briefly describe your situation",
  formStichpunktePlaceholder: "e.g. \"Notice received on..., benefit cut by...\"",
  formStichpunkteHint: "At least 20 characters. Max 500.",
  formAktenzeichenLabel: "Reference / Case number: *",
  formAktenzeichenHint: "Shown top right on your notice. (Required)",
  formBescheiddatumLabel: "Date of notice: *",
  formBescheiddatumPlaceholder: "DD.MM.YYYY",
  formAdresseLabel: "Your address:",
  formAdresseOptional: "(optional – for the letter)",
  formStrassePlaceholder: "Street & number",
  formPlzPlaceholder: "ZIP",
  formOrtPlaceholder: "City",
  consentLetter: "I consent to my data being processed by AI for analysis. This does not replace legal advice.",
  btnGenerateLetter: "Generate letter draft",
  btnGenerating: "Creating letter...",
  resultTitle: "Your letter draft",
  resultAktenzeichen: "Reference:",
  resultBehoerde: "Authority:",
  resultDatum: "Date:",
  resultUnserZeichen: "Our reference:",
  resultAnlage: "Enclosure: Copy of notice of",
  resultWarning: "Check draft before sending. Not a substitute for legal advice (§ 2 RDG).",
  btnCopy: "Copy text",
  btnDownloadPdf: "Download PDF",
  btnPrint: "Print",
  btnNewLetter: "Create new letter",
  ctaLetter: "Create letter",
  trustDsgvo: "GDPR compliant",
  trustSofort: "Instant analysis",
  trustPrice: "One-off €19.90, no subscription",
  sectionWhatWeOffer: "What we offer",
  sectionAnalyseWriteSecure: "Analysis, letters, security",
  feature1Title: "Analysis",
  feature1Desc: "Structured check of your notice for issues, deadlines and reasoning.",
  feature2Title: "Letter drafts",
  feature2Desc: "Professional letter drafts for direct use in your case.",
  feature3Title: "Clear & secure",
  feature3Desc: "Explained simply, GDPR-compliant and transparent.",
  sectionPrices: "Prices",
  sectionTransparentPrices: "Transparent pricing",
  recommended: "RECOMMENDED",
  pricingBasicCta: "Choose Basic",
  pricingStandardCta: "Choose Standard",
  pricingProCta: "Choose Pro",
  pricingBusinessCta: "Choose Business",
  sectionSingleDoc: "Single document",
  singleDocDesc: "For a one-off notice – no subscription",
  singleDocCta: "Start single purchase",
  navBlog: "Blog",
  navLogin: "Log in",
  navRegister: "Register",
  footerCopyright: "© 2026 BescheidRecht. All rights reserved.",
  letterGreeting: "Dear Sir or Madam,",
  letterClosing: "Yours sincerely",
};

const RU: PageT = {
  ...DE,
  dir: "ltr",
  headline: "ПОВЫШАЙТЕ ЭФФЕКТИВНОСТЬ. ЭКОНОМЬТЕ ВРЕМЯ.",
  headlineSub: "Загрузите письмо. Найдите ошибки.",
  text: "Анализ социальных и административных документов не должен отнимать ценные ресурсы. BescheidRecht – цифровой инструмент для автоматизированной проверки. Загрузите документ и получите анализ.",
  button: "Загрузить документ",
  consent: "Я даю согласие на обработку моих данных с помощью ИИ для анализа. Я знаю, что это не замена юридической консультации.",
  tabAnalyze: "Анализ решения",
  tabLetter: "Создать письмо",
  formBehoerdeLabel: "Для какого ведомства письмо?",
  formBehoerdePlaceholder: "Выберите ведомство...",
  formSchreibentypLabel: "Что вы хотите написать?",
  formSchreibentypPlaceholder: "Выберите тип...",
  formStichpunkteLabel: "Кратко опишите ситуацию",
  formStichpunktePlaceholder: "Напр. «Получил решение от..., выплаты снижены...»",
  formStichpunkteHint: "Минимум 20 символов. Макс. 500.",
  formAktenzeichenLabel: "Номер дела / ссылка: *",
  formAktenzeichenHint: "Указан вверху справа на решении. (Обязательно)",
  formBescheiddatumLabel: "Дата решения: *",
  formBescheiddatumPlaceholder: "ДД.ММ.ГГГГ",
  formAdresseLabel: "Ваш адрес:",
  formAdresseOptional: "(по желанию – для письма)",
  formStrassePlaceholder: "Улица и дом",
  formPlzPlaceholder: "Индекс",
  formOrtPlaceholder: "Город",
  consentLetter: "Я согласен на обработку данных ИИ для анализа. Это не замена юридической консультации.",
  btnGenerateLetter: "Создать черновик письма",
  btnGenerating: "Создаём письмо...",
  resultTitle: "Черновик письма",
  resultAktenzeichen: "Номер:",
  resultBehoerde: "Ведомство:",
  resultDatum: "Дата:",
  resultUnserZeichen: "Наш номер:",
  resultAnlage: "Приложение: Копия решения от",
  resultWarning: "Проверьте черновик перед отправкой. Не замена юридической консультации (§ 2 RDG).",
  btnCopy: "Копировать текст",
  btnDownloadPdf: "Скачать PDF",
  btnPrint: "Печать",
  btnNewLetter: "Новое письмо",
  ctaLetter: "Создать письмо",
  trustDsgvo: "Соответствие GDPR",
  trustSofort: "Мгновенный анализ",
  trustPrice: "Один раз 19,90 € без подписки",
  sectionWhatWeOffer: "Что мы предлагаем",
  sectionAnalyseWriteSecure: "Анализ, письма, безопасность",
  feature1Title: "Анализ",
  feature1Desc: "Структурированная проверка решения на нарушения, сроки и обоснование.",
  feature2Title: "Черновики писем",
  feature2Desc: "Профессиональные черновики для использования в вашем деле.",
  feature3Title: "Понятно и безопасно",
  feature3Desc: "Простое объяснение, обработка по GDPR, прозрачность.",
  sectionPrices: "Цены",
  sectionTransparentPrices: "Прозрачные цены",
  recommended: "РЕКОМЕНДУЕМ",
  pricingBasicCta: "Выбрать Basic",
  pricingStandardCta: "Выбрать Standard",
  pricingProCta: "Выбрать Pro",
  pricingBusinessCta: "Выбрать Business",
  sectionSingleDoc: "Один документ",
  singleDocDesc: "Для одного решения – без подписки",
  singleDocCta: "Оформить разовую покупку",
  navBlog: "Блог",
  navLogin: "Вход",
  navRegister: "Регистрация",
  footerBlog: "Блог",
  footerImpressum: "Импрессум",
  footerDatenschutz: "Защита данных",
  footerAgb: "Условия",
  footerCopyright: "© 2026 BescheidRecht. Все права защищены.",
  letterGreeting: "Уважаемые дамы и господа,",
  letterClosing: "С уважением",
};

const AR: PageT = {
  ...DE,
  dir: "rtl",
  headline: "زيادة الكفاءة. توفير الوقت. خلق الراحة.",
  headlineSub: "ارفع الخطاب. اكتشف الأخطاء.",
  text: "لا ينبغي أن يستهلك تحليل المراسلات الاجتماعية والإدارية قدرات قيمة. BescheidRecht هي الأداة الرقمية للتحليل الآلي. ارفع مستندك واحصل على التحليل.",
  button: "رفع المستند الآن",
  consent: "أوافق على معالجة بياناتي بواسطة الذكاء الاصطناعي للتحليل. أعلم أن هذا لا يحل محل الاستشارة القانونية.",
  tabAnalyze: "تحليل القرار",
  tabLetter: "إنشاء خطاب",
  formBehoerdeLabel: "لمصلحة أي جهة الخطاب؟",
  formBehoerdePlaceholder: "اختر الجهة...",
  formSchreibentypLabel: "ماذا تريد أن تكتب؟",
  formSchreibentypPlaceholder: "اختر النوع...",
  formStichpunkteLabel: "صف وضعك باختصار",
  formStichpunktePlaceholder: "مثلاً: «استلمت القرار في...، تم خفض المنفعة...»",
  formStichpunkteHint: "20 حرفاً على الأقل. 500 كحد أقصى.",
  formAktenzeichenLabel: "رقم الملف / المرجع: *",
  formAktenzeichenHint: "يظهر أعلى اليمين في القرار. (مطلوب)",
  formBescheiddatumLabel: "تاريخ القرار: *",
  formBescheiddatumPlaceholder: "يوم.شهر.سنة",
  formAdresseLabel: "عنوانك:",
  formAdresseOptional: "(اختياري – للخطاب)",
  formStrassePlaceholder: "الشارع والرقم",
  formPlzPlaceholder: "الرمز البريدي",
  formOrtPlaceholder: "المدينة",
  consentLetter: "أوافق على معالجة بياناتي بالذكاء الاصطناعي للتحليل. لا يحل محل الاستشارة القانونية.",
  btnGenerateLetter: "إنشاء مسودة خطاب",
  btnGenerating: "جاري إنشاء الخطاب...",
  resultTitle: "مسودة خطابك",
  resultAktenzeichen: "المرجع:",
  resultBehoerde: "الجهة:",
  resultDatum: "التاريخ:",
  resultUnserZeichen: "مرجعنا:",
  resultAnlage: "المرفق: نسخة من القرار المؤرخ",
  resultWarning: "راجع المسودة قبل الإرسال. لا تغني عن الاستشارة القانونية (§ 2 RDG).",
  btnCopy: "نسخ النص",
  btnDownloadPdf: "تحميل PDF",
  btnPrint: "طباعة",
  btnNewLetter: "خطاب جديد",
  ctaLetter: "إنشاء خطاب",
  trustDsgvo: "متوافق مع GDPR",
  trustSofort: "تحليل فوري",
  trustPrice: "مرة واحدة 19.90 يورو بدون اشتراك",
  sectionWhatWeOffer: "ما نقدمه",
  sectionAnalyseWriteSecure: "التحليل، الخطابات، الأمان",
  feature1Title: "التحليل",
  feature1Desc: "فحص منظم للقرار من حيث المخالفات والمواعيد والأسباب.",
  feature2Title: "مسودات الخطابات",
  feature2Desc: "مسودات احترافية للاستخدام في ملفك.",
  feature3Title: "واضح وآمن",
  feature3Desc: "شرح بسيط، معالجة وفق GDPR، شفافية.",
  sectionPrices: "الأسعار",
  sectionTransparentPrices: "أسعار شفافة",
  recommended: "موصى به",
  pricingBasicCta: "اختر Basic",
  pricingStandardCta: "اختر Standard",
  pricingProCta: "اختر Pro",
  pricingBusinessCta: "اختر Business",
  sectionSingleDoc: "مستند واحد",
  singleDocDesc: "لقرار لمرة واحدة – بدون اشتراك",
  singleDocCta: "بدء الشراء الفردي",
  navBlog: "المدونة",
  navLogin: "تسجيل الدخول",
  navRegister: "التسجيل",
  footerCopyright: "© 2026 BescheidRecht. جميع الحقوق محفوظة.",
  letterGreeting: "السيدات والسادة المحترمون،",
  letterClosing: "مع خالص التقدير",
};

const TR: PageT = {
  ...DE,
  dir: "ltr",
  headline: "VERİMLİLİĞİ ARTIRIN. ZAMAN KAZANIN.",
  headlineSub: "Belge yükleyin. Hataları bulun.",
  text: "Sosyal ve idari yazıların analizi değerli kapasiteleri bağlamamalıdır. BescheidRecht, karmaşık belgelerin otomatik yapılandırılması için dijital araçtır. Belgenizi yükleyin, anında analiz alın.",
  button: "Belgeyi şimdi yükle",
  consent: "Verilerimin analiz için yapay zeka tarafından işlenmesine izin veriyorum. Bunun hukuki danışmanlığın yerini tutmadığını biliyorum.",
  tabAnalyze: "Karar analizi",
  tabLetter: "Yazı oluştur",
  formBehoerdeLabel: "Yazı hangi kurum için?",
  formBehoerdePlaceholder: "Kurum seçin...",
  formSchreibentypLabel: "Ne yazmak istiyorsunuz?",
  formSchreibentypPlaceholder: "Tür seçin...",
  formStichpunkteLabel: "Durumunuzu kısaca anlatın",
  formStichpunktePlaceholder: "Örn: \"... tarihli karar alındı, ödeme kısıldı...\"",
  formStichpunkteHint: "En az 20 karakter. Maks. 500.",
  formAktenzeichenLabel: "Dosya no / Referans: *",
  formAktenzeichenHint: "Kararın sağ üstünde. (Zorunlu)",
  formBescheiddatumLabel: "Karar tarihi: *",
  formBescheiddatumPlaceholder: "GG.AA.YYYY",
  formAdresseLabel: "Adresiniz:",
  formAdresseOptional: "(isteğe bağlı – yazı için)",
  formStrassePlaceholder: "Sokak ve numara",
  formPlzPlaceholder: "Posta kodu",
  formOrtPlaceholder: "Şehir",
  consentLetter: "Verilerimin analiz için yapay zeka ile işlenmesine izin veriyorum. Hukuki danışmanlık yerine geçmez.",
  btnGenerateLetter: "Yazı taslağı oluştur",
  btnGenerating: "Yazı oluşturuluyor...",
  resultTitle: "Yazı taslağınız",
  resultAktenzeichen: "Referans:",
  resultBehoerde: "Kurum:",
  resultDatum: "Tarih:",
  resultUnserZeichen: "Bizim referans:",
  resultAnlage: "Ek: ... tarihli kararın kopyası",
  resultWarning: "Göndermeden önce taslağı kontrol edin. Hukuki danışmanlık yerine geçmez (§ 2 RDG).",
  btnCopy: "Metni kopyala",
  btnDownloadPdf: "PDF indir",
  btnPrint: "Yazdır",
  btnNewLetter: "Yeni yazı",
  ctaLetter: "Yazı oluştur",
  trustDsgvo: "GDPR uyumlu",
  trustSofort: "Anında analiz",
  trustPrice: "Tek seferlik 19,90 €, abonelik yok",
  sectionWhatWeOffer: "Neler sunuyoruz",
  sectionAnalyseWriteSecure: "Analiz, yazılar, güvenlik",
  feature1Title: "Analiz",
  feature1Desc: "Kararınızın ihlaller, süreler ve gerekçe açısından yapılandırılmış kontrolü.",
  feature2Title: "Yazı taslakları",
  feature2Desc: "Davanızda doğrudan kullanım için profesyonel taslaklar.",
  feature3Title: "Anlaşılır ve güvenli",
  feature3Desc: "Sade anlatım, GDPR uyumlu işleme, şeffaflık.",
  sectionPrices: "Fiyatlar",
  sectionTransparentPrices: "Şeffaf fiyatlandırma",
  recommended: "ÖNERİLEN",
  pricingBasicCta: "Basic seç",
  pricingStandardCta: "Standard seç",
  pricingProCta: "Pro seç",
  pricingBusinessCta: "Business seç",
  sectionSingleDoc: "Tek belge",
  singleDocDesc: "Tek seferlik karar için – abonelik yok",
  singleDocCta: "Tek alım başlat",
  navBlog: "Blog",
  navLogin: "Giriş",
  navRegister: "Kayıt",
  footerCopyright: "© 2026 BescheidRecht. Tüm hakları saklıdır.",
  letterGreeting: "Sayın Yetkili,",
  letterClosing: "Saygılarımla",
};

export const pageTranslations: Record<Lang, PageT> = { DE, EN, RU, AR, TR };

export function getPageT(lang: Lang): PageT {
  return pageTranslations[lang];
}
