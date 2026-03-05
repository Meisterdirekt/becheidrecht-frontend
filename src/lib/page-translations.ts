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
  formAktenzeichenOptional: string;
  formAktenzeichenHint: string;
  formBescheiddatumLabel: string;
  formBescheiddatumOptional: string;
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
  footerFeedback: string;
  footerImpressum: string;
  footerDatenschutz: string;
  footerAgb: string;
  footerDisclaimer: string;
  footerCopyright: string;
  letterGreeting: string;
  letterClosing: string;
  consentPrivacyLink: string;
  privacyModalTitle: string;
  privacyModalBullet1: string;
  privacyModalBullet2: string;
  privacyModalBullet3: string;
  privacyModalBullet4: string;
  privacyModalRights: string;
  privacyModalBtn: string;
  pseudonymPreviewLink: string;
  pseudonymPreviewTitle: string;
  pseudonymPreviewBefore: string;
  pseudonymPreviewAfter: string;
  pseudonymPreviewNote: string;
  pseudonymPreviewBtn: string;
  // B2B
  partnerSectionLabel: string;
  stat1Val: string; stat1Lbl: string;
  stat2Val: string; stat2Lbl: string;
  stat3Val: string; stat3Lbl: string;
  stat4Val: string; stat4Lbl: string;
  workflowSectionLabel: string;
  workflowSectionTitle: string;
  workflow1Title: string; workflow1Desc: string;
  workflow2Title: string; workflow2Desc: string;
  workflow3Title: string; workflow3Desc: string;
  demoCTALabel: string;
  demoCTATitle: string;
  demoCTAText: string;
  demoCTAPrimary: string;
  demoCTASecondary: string;
  pricingPerMonth: string;
}

const DE: PageT = {
  dir: "ltr",
  headline: "BescheidRecht",
  headlineSub: "KI-Unterstützung für Ihre Fachkräfte.",
  text: "Sozialberater:innen bei Caritas, AWO und Diakonie prüfen täglich Bescheide — für ihre Klientinnen und Klienten. BescheidRecht gibt Ihrem Team sofortige KI-Analyse, professionelle Schreiben-Entwürfe und lückenlose Fristüberwachung. DSGVO-konform. Sofort einsetzbar.",
  button: "Dokument jetzt hochladen",
  consent: "Ich willige in die Datenverarbeitung ein und habe die Datenschutzinformationen gelesen.",
  tabAnalyze: "Bescheid analysieren",
  tabLetter: "Schreiben erstellen",
  formBehoerdeLabel: "Für welche Behörde soll das Schreiben sein?",
  formBehoerdePlaceholder: "Bitte Behörde auswählen...",
  formSchreibentypLabel: "Was möchten Sie schreiben?",
  formSchreibentypPlaceholder: "Bitte Typ auswählen...",
  formStichpunkteLabel: "Beschreiben Sie kurz Ihre Situation",
  formStichpunktePlaceholder: "z.B. \"Bescheid vom 01.02.2026 erhalten, ALG wurde um 30% gekürzt...\"",
  formStichpunkteHint: "Mindestens 10 Zeichen. Max 500 Zeichen.",
  formAktenzeichenLabel: "Aktenzeichen / Bescheid-Nummer:",
  formAktenzeichenOptional: "(optional)",
  formAktenzeichenHint: "Steht oben rechts auf Ihrem Bescheid.",
  formBescheiddatumLabel: "Datum des Bescheids:",
  formBescheiddatumOptional: "(optional)",
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
  trustDsgvo: "DSGVO Art. 25",
  trustSofort: "< 60 Sek. Analyse",
  trustPrice: "Team-Lizenzen ab 89 €/Mo",
  sectionWhatWeOffer: "Was wir bieten",
  sectionAnalyseWriteSecure: "KI-Werkzeuge für Ihre Fachkräfte",
  feature1Title: "KI-Fallanalyse",
  feature1Desc: "130+ geprüfte Fehlertypen aus 16 Rechtsgebieten (SGB II–XII, BAMF, BAföG). Ihre Fachkräfte sehen sofort, wo ein Bescheid rechtlich angreifbar ist.",
  feature2Title: "Schreiben in 60 Sekunden",
  feature2Desc: "Rechtlich strukturierte Entwürfe für Widersprüche, Anträge und Anfragen — direkt exportierbar als DIN A4 PDF.",
  feature3Title: "DSGVO by Design",
  feature3Desc: "Vollständige Pseudonymisierung vor jeder KI-Analyse. Klientendaten verlassen Ihre Einrichtung nicht im Klartext.",
  sectionPrices: "Team-Lizenzen",
  sectionTransparentPrices: "Transparente Preise für Einrichtungen",
  recommended: "BELIEBT",
  pricingBasicName: "Starter",
  pricingBasicPrice: "89 €",
  pricingBasicF1: "Bis 3 Fachkräfte",
  pricingBasicF2: "Unbegrenzte Bescheid-Analysen",
  pricingBasicF3: "DSGVO-Dokumentation inklusive",
  pricingBasicCta: "Demo starten",
  pricingStandardName: "Team",
  pricingStandardPrice: "199 €",
  pricingStandardF1: "Bis 10 Fachkräfte",
  pricingStandardF2: "Fristen-Dashboard für alle",
  pricingStandardF3: "Prioritäts-Support & Onboarding",
  pricingStandardCta: "Demo starten",
  pricingProName: "Einrichtung",
  pricingProPrice: "399 €",
  pricingProF1: "Unbegrenzte Nutzer",
  pricingProF2: "Mandantenverwaltung & API",
  pricingProF3: "Eigene Vorlagen & Branding",
  pricingProCta: "Demo starten",
  pricingBusinessName: "Rahmenvertrag",
  pricingBusinessPrice: "Auf Anfrage",
  pricingBusinessF1: "Mehrere Standorte & Verbände",
  pricingBusinessF2: "SLA & Compliance-Paket",
  pricingBusinessF3: "Dedizierter Kundenbetreuer",
  pricingBusinessCta: "Kontakt aufnehmen",
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
  footerFeedback: "Feedback",
  footerImpressum: "Impressum",
  footerDatenschutz: "Datenschutz",
  footerAgb: "AGB",
  footerDisclaimer: "Kein Ersatz für Rechtsberatung. Informationsdienst gem. § 2 RDG.",
  footerCopyright: "© 2026 BescheidRecht. Alle Rechte vorbehalten.",
  letterGreeting: "Sehr geehrte Damen und Herren,",
  letterClosing: "Mit freundlichen Grüßen",
  consentPrivacyLink: "Datenschutzinformationen",
  privacyModalTitle: "Datenschutz bei der Bescheid-Analyse",
  privacyModalBullet1: "Automatische Pseudonymisierung – Namen, Adressen, Geburtsdaten, E-Mail, Telefon, IBAN, BIC, Steuer-ID und Sozialversicherungsnummern werden vor der Analyse durch Platzhalter ersetzt.",
  privacyModalBullet2: "Externe Verarbeitung – Die Analyse erfolgt über unseren KI-Dienstleister. Der pseudonymisierte Text wird dorthin übertragen.",
  privacyModalBullet3: "Keine dauerhafte Speicherung – Unser KI-Dienstleister speichert Ihre Daten nicht dauerhaft. Nach der Analyse werden sie gelöscht.",
  privacyModalBullet4: "Sofortige Wiederherstellung – Nach der Analyse werden die echten Daten blitzschnell wieder eingesetzt.",
  privacyModalRights: "Ihre Rechte: Sie können der Datenverarbeitung jederzeit widersprechen. Weitere Informationen in unserer Datenschutzerklärung.",
  privacyModalBtn: "Verstanden",
  pseudonymPreviewLink: "Pseudonymisierung in Aktion ansehen →",
  pseudonymPreviewTitle: "Pseudonymisierung in Aktion",
  pseudonymPreviewBefore: "Beispiel: Original",
  pseudonymPreviewAfter: "So wird analysiert",
  pseudonymPreviewNote: "Diese Vorschau nutzt nur Beispieltext. Bei Ihrem eigenen Bescheid läuft der gleiche Ablauf automatisch im Hintergrund.",
  pseudonymPreviewBtn: "Verstanden",
  // B2B
  partnerSectionLabel: "Für Einrichtungen wie",
  stat1Val: "130+", stat1Lbl: "Erkannte Fehlertypen",
  stat2Val: "16", stat2Lbl: "Rechtsgebiete (SGB II–XII)",
  stat3Val: "< 60s", stat3Lbl: "Analysezeit pro Bescheid",
  stat4Val: "DSGVO", stat4Lbl: "Art. 25 Privacy by Design",
  workflowSectionLabel: "So einfach geht's",
  workflowSectionTitle: "In 3 Schritten zum Widerspruch",
  workflow1Title: "Bescheid hochladen",
  workflow1Desc: "Fachkraft lädt den Bescheid als PDF oder Scan hoch. Automatische Pseudonymisierung schützt alle Klientendaten sofort.",
  workflow2Title: "KI analysiert in < 60 Sek.",
  workflow2Desc: "13 spezialisierte KI-Agenten prüfen auf 130+ Fehlertypen aus 16 Rechtsgebieten — mit Fristberechnung und Rechtsbasis.",
  workflow3Title: "Schreiben exportieren",
  workflow3Desc: "Direkt verwendbarer Widerspruch als DIN A4 PDF. Fachkraft prüft, unterschreibt — und der Klient erhält seinen Widerspruch.",
  demoCTALabel: "Für Ihre Einrichtung",
  demoCTATitle: "Bereit für den Einsatz in Ihrer Einrichtung?",
  demoCTAText: "Wir zeigen Ihnen in 30 Minuten, wie BescheidRecht in Ihre Arbeitsabläufe passt. Kostenlos, unverbindlich, auf Ihre Einrichtung zugeschnitten.",
  demoCTAPrimary: "Demo vereinbaren",
  demoCTASecondary: "Pilotprojekt anfragen",
  pricingPerMonth: "/ Monat",
};

const EN: PageT = {
  ...DE,
  dir: "ltr",
  headline: "BOOST EFFICIENCY. SAVE TIME. CREATE RELIEF.",
  headlineSub: "Upload letter. Find errors.",
  text: "Official letters are complicated – BescheidRecht is simple. We analyse your documents for typical problem areas and give you the right facts for your response. Not legal advice, but clear support so you can act with confidence.",
  button: "Upload document now",
  consent: "I consent to data processing and have read the Privacy information.",
  tabAnalyze: "Analyse notice",
  tabLetter: "Create letter",
  formBehoerdeLabel: "Which authority is the letter for?",
  formBehoerdePlaceholder: "Select authority...",
  formSchreibentypLabel: "What do you want to write?",
  formSchreibentypPlaceholder: "Select type...",
  formStichpunkteLabel: "Briefly describe your situation",
  formStichpunktePlaceholder: "e.g. \"Notice received on..., benefit cut by...\"",
  formStichpunkteHint: "At least 10 characters. Max 500.",
  formAktenzeichenLabel: "Reference / Case number:",
  formAktenzeichenOptional: "(optional)",
  formAktenzeichenHint: "Shown top right on your notice.",
  formBescheiddatumLabel: "Date of notice:",
  formBescheiddatumOptional: "(optional)",
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
  footerDisclaimer: "Not a substitute for legal advice. Information service acc. to § 2 RDG.",
  footerCopyright: "© 2026 BescheidRecht. All rights reserved.",
  letterGreeting: "Dear Sir or Madam,",
  letterClosing: "Yours sincerely",
  consentPrivacyLink: "Privacy information",
  privacyModalTitle: "Privacy in document analysis",
  privacyModalBullet1: "Automatic pseudonymization – Names, addresses, dates of birth, email, phone, IBAN, BIC, tax ID and social security numbers are replaced by placeholders before analysis.",
  privacyModalBullet2: "External processing – Analysis is performed via our AI provider. The pseudonymized text is transmitted there.",
  privacyModalBullet3: "No permanent storage – Our AI provider does not store your data permanently. It is deleted after analysis.",
  privacyModalBullet4: "Immediate restoration – After analysis, the original data is quickly restored.",
  privacyModalRights: "Your rights: You may object to data processing at any time. Further information in our privacy policy.",
  privacyModalBtn: "Understood",
  pseudonymPreviewLink: "See pseudonymization in action →",
  pseudonymPreviewTitle: "Pseudonymization in action",
  pseudonymPreviewBefore: "Example: Original",
  pseudonymPreviewAfter: "As sent for analysis",
  pseudonymPreviewNote: "This preview uses sample text only. With your own document, the same process runs automatically in the background.",
  pseudonymPreviewBtn: "Understood",
};

const RU: PageT = {
  ...DE,
  dir: "ltr",
  headline: "ПОВЫШАЙТЕ ЭФФЕКТИВНОСТЬ. ЭКОНОМЬТЕ ВРЕМЯ.",
  headlineSub: "Загрузите письмо. Найдите ошибки.",
  text: "Анализ социальных и административных документов не должен отнимать ценные ресурсы. BescheidRecht – цифровой инструмент для автоматизированной проверки. Загрузите документ и получите анализ.",
  button: "Загрузить документ",
  consent: "Я даю согласие на обработку данных и прочитал Информацию о защите данных.",
  tabAnalyze: "Анализ решения",
  tabLetter: "Создать письмо",
  formBehoerdeLabel: "Для какого ведомства письмо?",
  formBehoerdePlaceholder: "Выберите ведомство...",
  formSchreibentypLabel: "Что вы хотите написать?",
  formSchreibentypPlaceholder: "Выберите тип...",
  formStichpunkteLabel: "Кратко опишите ситуацию",
  formStichpunktePlaceholder: "Напр. «Получил решение от..., выплаты снижены...»",
  formStichpunkteHint: "Минимум 10 символов. Макс. 500.",
  formAktenzeichenLabel: "Номер дела / ссылка:",
  formAktenzeichenOptional: "(необязательно)",
  formAktenzeichenHint: "Указан вверху справа на решении.",
  formBescheiddatumLabel: "Дата решения:",
  formBescheiddatumOptional: "(необязательно)",
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
  footerDisclaimer: "Не заменяет юридическую консультацию. Информационный сервис согл. § 2 RDG.",
  footerCopyright: "© 2026 BescheidRecht. Все права защищены.",
  letterGreeting: "Уважаемые дамы и господа,",
  letterClosing: "С уважением",
  consentPrivacyLink: "Информацию о защите данных",
  privacyModalTitle: "Защита данных при анализе документов",
  privacyModalBullet1: "Автоматическая псевдонимизация – Имена, адреса, даты рождения, e-mail, телефон, IBAN, BIC, ИНН и номера соцстрахования заменяются плейсхолдерами перед анализом.",
  privacyModalBullet2: "Внешняя обработка – Анализ выполняется через нашего ИИ-провайдера. Псевдонимизированный текст передаётся туда.",
  privacyModalBullet3: "Без постоянного хранения – Наш ИИ-провайдер не хранит ваши данные постоянно. Они удаляются после анализа.",
  privacyModalBullet4: "Мгновенное восстановление – После анализа подлинные данные быстро восстанавливаются.",
  privacyModalRights: "Ваши права: Вы можете в любое время возразить против обработки данных. Подробнее в нашей политике конфиденциальности.",
  privacyModalBtn: "Понятно",
  pseudonymPreviewLink: "Посмотреть псевдонимизацию в действии →",
  pseudonymPreviewTitle: "Псевдонимизация в действии",
  pseudonymPreviewBefore: "Пример: оригинал",
  pseudonymPreviewAfter: "Отправляется на анализ",
  pseudonymPreviewNote: "Этот предпросмотр использует только пример текста. С вашим документом тот же процесс выполняется автоматически.",
  pseudonymPreviewBtn: "Понятно",
};

const AR: PageT = {
  ...DE,
  dir: "rtl",
  headline: "زيادة الكفاءة. توفير الوقت. خلق الراحة.",
  headlineSub: "ارفع الخطاب. اكتشف الأخطاء.",
  text: "لا ينبغي أن يستهلك تحليل المراسلات الاجتماعية والإدارية قدرات قيمة. BescheidRecht هي الأداة الرقمية للتحليل الآلي. ارفع مستندك واحصل على التحليل.",
  button: "رفع المستند الآن",
  consent: "أوافق على معالجة البيانات وقرأت معلومات الخصوصية.",
  tabAnalyze: "تحليل القرار",
  tabLetter: "إنشاء خطاب",
  formBehoerdeLabel: "لمصلحة أي جهة الخطاب؟",
  formBehoerdePlaceholder: "اختر الجهة...",
  formSchreibentypLabel: "ماذا تريد أن تكتب؟",
  formSchreibentypPlaceholder: "اختر النوع...",
  formStichpunkteLabel: "صف وضعك باختصار",
  formStichpunktePlaceholder: "مثلاً: «استلمت القرار في...، تم خفض المنفعة...»",
  formStichpunkteHint: "10 أحرف على الأقل. 500 كحد أقصى.",
  formAktenzeichenLabel: "رقم الملف / المرجع:",
  formAktenzeichenOptional: "(اختياري)",
  formAktenzeichenHint: "يظهر أعلى اليمين في القرار.",
  formBescheiddatumLabel: "تاريخ القرار:",
  formBescheiddatumOptional: "(اختياري)",
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
  footerDisclaimer: "لا يُغني عن الاستشارة القانونية. خدمة معلومات وفقاً لـ § 2 RDG.",
  footerCopyright: "© 2026 BescheidRecht. جميع الحقوق محفوظة.",
  letterGreeting: "السيدات والسادة المحترمون،",
  letterClosing: "مع خالص التقدير",
  consentPrivacyLink: "معلومات الخصوصية",
  privacyModalTitle: "الخصوصية في تحليل المستندات",
  privacyModalBullet1: "إخفاء الهوية تلقائياً – يتم استبدال الأسماء والعناوين وتواريخ الميلاد والبريد الإلكتروني والهاتف ورقم الآيبان ورقم البنك ورقم الضريبة وأرقام الضمان الاجتماعي بواصفات قبل التحليل.",
  privacyModalBullet2: "المعالجة الخارجية – يتم التحليل عبر مزود الذكاء الاصطناعي. يُرسل النص المُستعار إليه.",
  privacyModalBullet3: "بدون تخزين دائم – لا يخزن مزود الذكاء الاصطناعي بياناتك بشكل دائم. تُحذف بعد التحليل.",
  privacyModalBullet4: "استعادة فورية – بعد التحليل تُستعاد البيانات الأصلية بسرعة.",
  privacyModalRights: "حقوقك: يمكنك الاعتراض على معالجة البيانات في أي وقت. مزيد من المعلومات في سياسة الخصوصية.",
  privacyModalBtn: "فهمت",
  pseudonymPreviewLink: "عرض إخفاء الهوية في العمل ←",
  pseudonymPreviewTitle: "إخفاء الهوية في العمل",
  pseudonymPreviewBefore: "مثال: الأصل",
  pseudonymPreviewAfter: "كما يُرسل للتحليل",
  pseudonymPreviewNote: "هذا المعاينة تستخدم نصاً مثالياً فقط. مع مستندك يتم تنفيذ نفس العملية تلقائياً في الخلفية.",
  pseudonymPreviewBtn: "فهمت",
};

const TR: PageT = {
  ...DE,
  dir: "ltr",
  headline: "VERİMLİLİĞİ ARTIRIN. ZAMAN KAZANIN.",
  headlineSub: "Belge yükleyin. Hataları bulun.",
  text: "Sosyal ve idari yazıların analizi değerli kapasiteleri bağlamamalıdır. BescheidRecht, karmaşık belgelerin otomatik yapılandırılması için dijital araçtır. Belgenizi yükleyin, anında analiz alın.",
  button: "Belgeyi şimdi yükle",
  consent: "Veri işlemeye izin veriyorum ve Gizlilik bilgilerini okudum.",
  tabAnalyze: "Karar analizi",
  tabLetter: "Yazı oluştur",
  formBehoerdeLabel: "Yazı hangi kurum için?",
  formBehoerdePlaceholder: "Kurum seçin...",
  formSchreibentypLabel: "Ne yazmak istiyorsunuz?",
  formSchreibentypPlaceholder: "Tür seçin...",
  formStichpunkteLabel: "Durumunuzu kısaca anlatın",
  formStichpunktePlaceholder: "Örn: \"... tarihli karar alındı, ödeme kısıldı...\"",
  formStichpunkteHint: "En az 10 karakter. Maks. 500.",
  formAktenzeichenLabel: "Dosya no / Referans:",
  formAktenzeichenOptional: "(isteğe bağlı)",
  formAktenzeichenHint: "Kararın sağ üstünde.",
  formBescheiddatumLabel: "Karar tarihi:",
  formBescheiddatumOptional: "(isteğe bağlı)",
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
  footerDisclaimer: "Hukuki danışmanlık yerine geçmez. § 2 RDG kapsamında bilgi hizmeti.",
  footerCopyright: "© 2026 BescheidRecht. Tüm hakları saklıdır.",
  letterGreeting: "Sayın Yetkili,",
  letterClosing: "Saygılarımla",
  consentPrivacyLink: "Gizlilik bilgilerini",
  privacyModalTitle: "Belge analizinde gizlilik",
  privacyModalBullet1: "Otomatik anonimleştirme – İsimler, adresler, doğum tarihleri, e-posta, telefon, IBAN, BIC, vergi kimlik no ve sosyal güvenlik numaraları analizden önce yer tutucularla değiştirilir.",
  privacyModalBullet2: "Harici işleme – Analiz yapay zeka sağlayıcımız üzerinden yapılır. Anonimleştirilmiş metin oraya iletilir.",
  privacyModalBullet3: "Kalıcı depolama yok – Yapay zeka sağlayıcımız verilerinizi kalıcı olarak saklamaz. Analizden sonra silinir.",
  privacyModalBullet4: "Anında geri yükleme – Analizden sonra gerçek veriler hızla geri yüklenir.",
  privacyModalRights: "Haklarınız: Veri işlemeye her zaman itiraz edebilirsiniz. Daha fazla bilgi gizlilik politikamızda.",
  privacyModalBtn: "Anladım",
  pseudonymPreviewLink: "Anonimleştirmeyi göster →",
  pseudonymPreviewTitle: "Anonimleştirme önizlemesi",
  pseudonymPreviewBefore: "Örnek: Orijinal",
  pseudonymPreviewAfter: "Analize böyle gönderilir",
  pseudonymPreviewNote: "Bu önizleme yalnızca örnek metin kullanır. Kendi belgenizde aynı işlem arka planda otomatik çalışır.",
  pseudonymPreviewBtn: "Anladım",
};

export const pageTranslations: Record<Lang, PageT> = { DE, EN, RU, AR, TR };

export function getPageT(lang: Lang): PageT {
  return pageTranslations[lang];
}
