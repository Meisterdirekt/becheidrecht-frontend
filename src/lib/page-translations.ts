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
  trustPrice: "Team-Lizenzen ab 199 €/Mo",
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
  pricingBasicPrice: "199 €",
  pricingBasicF1: "1 Nutzer-Zugang",
  pricingBasicF2: "50 Analysen / Monat",
  pricingBasicF3: "Automatische Pseudonymisierung",
  pricingBasicCta: "Demo starten",
  pricingStandardName: "Team",
  pricingStandardPrice: "399 €",
  pricingStandardF1: "Bis 3 Nutzer-Zugänge",
  pricingStandardF2: "Fristen-Dashboard",
  pricingStandardF3: "Prioritäts-Support & Onboarding",
  pricingStandardCta: "Demo starten",
  pricingProName: "Einrichtung",
  pricingProPrice: "699 €",
  pricingProF1: "Bis 10 Nutzer-Zugänge",
  pricingProF2: "Unbegrenzte Analysen",
  pricingProF3: "Prioritäts-Support & Onboarding",
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
  pricingPerMonth: "/ Monat · netto zzgl. 19 % MwSt.",
};

const EN: PageT = {
  ...DE,
  dir: "ltr",
  headline: "BescheidRecht",
  headlineSub: "AI Support for Your Caseworkers.",
  text: "Social workers at Caritas, AWO and Diakonie review official notices every day — for their clients. BescheidRecht gives your team instant AI analysis, professional letter drafts and comprehensive deadline tracking. GDPR-compliant. Ready to use immediately.",
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
  trustDsgvo: "GDPR Art. 25",
  trustSofort: "< 60 sec. analysis",
  trustPrice: "Team licences from €199/mo",
  sectionWhatWeOffer: "What we offer",
  sectionAnalyseWriteSecure: "AI Tools for Your Team",
  feature1Title: "AI Case Analysis",
  feature1Desc: "130+ verified error types across 16 areas of law (SGB II–XII, BAMF, BAföG). Your caseworkers see immediately where a notice is legally challengeable.",
  feature2Title: "Letters in 60 Seconds",
  feature2Desc: "Legally structured drafts for objections, applications and enquiries — exportable as DIN A4 PDF.",
  feature3Title: "GDPR by Design",
  feature3Desc: "Complete pseudonymisation before every AI analysis. Client data leaves your organisation only anonymised.",
  sectionPrices: "Team Licences",
  sectionTransparentPrices: "Transparent pricing for organisations",
  recommended: "POPULAR",
  pricingBasicF1: "1 user account",
  pricingBasicF2: "50 analyses / month",
  pricingBasicF3: "Automatic pseudonymisation",
  pricingBasicCta: "Start demo",
  pricingStandardF1: "Up to 3 user accounts",
  pricingStandardF2: "Deadline dashboard",
  pricingStandardF3: "Priority support & onboarding",
  pricingStandardCta: "Start demo",
  pricingProF1: "Up to 10 user accounts",
  pricingProF2: "Unlimited analyses",
  pricingProF3: "Priority support & onboarding",
  pricingProCta: "Start demo",
  pricingBusinessF1: "Multiple locations & associations",
  pricingBusinessF2: "SLA & compliance package",
  pricingBusinessF3: "Dedicated account manager",
  pricingBusinessCta: "Contact us",
  pricingPerMonth: "/ month · net excl. 19 % VAT",
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
  // B2B
  partnerSectionLabel: "For organisations like",
  stat1Val: "130+", stat1Lbl: "Recognised error types",
  stat2Val: "16", stat2Lbl: "Areas of law (SGB II–XII)",
  stat3Val: "< 60s", stat3Lbl: "Analysis time per notice",
  stat4Val: "GDPR", stat4Lbl: "Art. 25 Privacy by Design",
  workflowSectionLabel: "How it works",
  workflowSectionTitle: "3 steps to an objection",
  workflow1Title: "Upload notice",
  workflow1Desc: "Caseworker uploads the notice as PDF or scan. Automatic pseudonymisation protects all client data immediately.",
  workflow2Title: "AI analyses in < 60 sec.",
  workflow2Desc: "13 specialised AI agents check for 130+ error types across 16 areas of law — with deadline calculation and legal basis.",
  workflow3Title: "Export letter",
  workflow3Desc: "Ready-to-use objection as DIN A4 PDF. Caseworker reviews, signs — and the client receives their objection.",
  demoCTALabel: "For your organisation",
  demoCTATitle: "Ready to deploy in your organisation?",
  demoCTAText: "We'll show you in 30 minutes how BescheidRecht fits into your workflows. Free, non-binding, tailored to your organisation.",
  demoCTAPrimary: "Schedule demo",
  demoCTASecondary: "Request pilot project",
};

const RU: PageT = {
  ...DE,
  dir: "ltr",
  headline: "ПОВЫШАЙТЕ ЭФФЕКТИВНОСТЬ. ЭКОНОМЬТЕ ВРЕМЯ.",
  headlineSub: "ИИ-поддержка для ваших специалистов.",
  text: "Социальные работники Caritas, AWO и Diakonie ежедневно проверяют решения — для своих клиентов. BescheidRecht даёт вашей команде мгновенный ИИ-анализ, профессиональные черновики писем и полный контроль сроков. Соответствует GDPR. Готов к работе сразу.",
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
  trustDsgvo: "GDPR Ст. 25",
  trustSofort: "< 60 сек. анализ",
  trustPrice: "Командные лицензии от 89 €/мес.",
  sectionWhatWeOffer: "Что мы предлагаем",
  sectionAnalyseWriteSecure: "ИИ-инструменты для вашей команды",
  feature1Title: "ИИ-анализ случая",
  feature1Desc: "130+ проверенных типов ошибок в 16 правовых областях. Ваши специалисты сразу видят, где решение юридически уязвимо.",
  feature2Title: "Письмо за 60 секунд",
  feature2Desc: "Юридически структурированные черновики возражений — экспорт в DIN A4 PDF.",
  feature3Title: "GDPR by Design",
  feature3Desc: "Полная псевдонимизация перед каждым ИИ-анализом. Данные клиентов покидают организацию только анонимно.",
  sectionPrices: "Командные лицензии",
  sectionTransparentPrices: "Прозрачные цены для организаций",
  recommended: "ПОПУЛЯРНО",
  pricingBasicCta: "Демо",
  pricingStandardCta: "Демо",
  pricingProCta: "Демо",
  pricingBusinessCta: "Связаться",
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
  // B2B
  partnerSectionLabel: "Для организаций как",
  stat1Val: "130+", stat1Lbl: "Типов ошибок",
  stat2Val: "16", stat2Lbl: "Правовых областей",
  stat3Val: "< 60с", stat3Lbl: "Время анализа на решение",
  stat4Val: "GDPR", stat4Lbl: "Ст. 25 Privacy by Design",
  workflowSectionLabel: "Как это работает",
  workflowSectionTitle: "3 шага к возражению",
  workflow1Title: "Загрузить решение",
  workflow1Desc: "Специалист загружает решение как PDF или скан. Автоматическая псевдонимизация защищает данные клиентов сразу.",
  workflow2Title: "ИИ анализирует за < 60 сек.",
  workflow2Desc: "13 специализированных ИИ-агента проверяют 130+ типов ошибок в 16 правовых областях.",
  workflow3Title: "Экспорт письма",
  workflow3Desc: "Готовое к использованию возражение в DIN A4 PDF.",
  demoCTALabel: "Для вашей организации",
  demoCTATitle: "Готовы развернуть в вашей организации?",
  demoCTAText: "Мы покажем вам за 30 минут, как BescheidRecht вписывается в ваши рабочие процессы. Бесплатно, без обязательств.",
  demoCTAPrimary: "Запланировать демо",
  demoCTASecondary: "Запросить пилот",
  pricingPerMonth: "/ мес.",
};

const AR: PageT = {
  ...DE,
  dir: "rtl",
  headline: "زيادة الكفاءة. توفير الوقت. خلق الراحة.",
  headlineSub: "دعم الذكاء الاصطناعي لفريقك المتخصص.",
  text: "يراجع المستشارون الاجتماعيون في Caritas وAWO وDiakonie القرارات يومياً — لعملائهم. BescheidRecht يمنح فريقك تحليلاً فورياً بالذكاء الاصطناعي، ومسودات خطابات احترافية، ومتابعة شاملة للمواعيد. متوافق مع GDPR. جاهز للاستخدام فوراً.",
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
  trustDsgvo: "GDPR المادة 25",
  trustSofort: "تحليل في < 60 ثانية",
  trustPrice: "تراخيص الفريق من 89 يورو/شهر",
  sectionWhatWeOffer: "ما نقدمه",
  sectionAnalyseWriteSecure: "أدوات الذكاء الاصطناعي لفريقك",
  feature1Title: "تحليل القضايا بالذكاء الاصطناعي",
  feature1Desc: "أكثر من 130 نوع خطأ في 16 مجالاً قانونياً. فريقك يرى فوراً أين يمكن الطعن قانونياً في القرار.",
  feature2Title: "خطاب في 60 ثانية",
  feature2Desc: "مسودات منظمة قانونياً للاعتراضات — قابلة للتصدير كـ PDF.",
  feature3Title: "حماية البيانات بالتصميم",
  feature3Desc: "إخفاء هوية كامل قبل كل تحليل. بيانات العملاء لا تغادر مؤسستك بشكل صريح.",
  sectionPrices: "تراخيص الفريق",
  sectionTransparentPrices: "أسعار شفافة للمؤسسات",
  recommended: "الأكثر شعبية",
  pricingBasicCta: "ابدأ العرض",
  pricingStandardCta: "ابدأ العرض",
  pricingProCta: "ابدأ العرض",
  pricingBusinessCta: "تواصل معنا",
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
  // B2B
  partnerSectionLabel: "للمؤسسات مثل",
  stat1Val: "130+", stat1Lbl: "أنواع الأخطاء",
  stat2Val: "16", stat2Lbl: "مجالات قانونية",
  stat3Val: "< 60ث", stat3Lbl: "وقت التحليل لكل قرار",
  stat4Val: "GDPR", stat4Lbl: "المادة 25 خصوصية بالتصميم",
  workflowSectionLabel: "كيف يعمل",
  workflowSectionTitle: "3 خطوات للاعتراض",
  workflow1Title: "رفع القرار",
  workflow1Desc: "يرفع المتخصص القرار كـ PDF. إخفاء الهوية التلقائي يحمي جميع بيانات العميل فوراً.",
  workflow2Title: "الذكاء الاصطناعي يحلل في < 60 ثانية",
  workflow2Desc: "13 وكيلاً متخصصاً يفحصون 130+ نوع خطأ في 16 مجالاً قانونياً.",
  workflow3Title: "تصدير الخطاب",
  workflow3Desc: "اعتراض جاهز للاستخدام كـ PDF. يراجع المتخصص ويوقع — ويتلقى العميل اعتراضه.",
  demoCTALabel: "لمؤسستك",
  demoCTATitle: "هل أنت مستعد للنشر في مؤسستك?",
  demoCTAText: "سنريك في 30 دقيقة كيف يتناسب BescheidRecht مع سير عملك. مجاني وغير ملزم.",
  demoCTAPrimary: "حجز عرض",
  demoCTASecondary: "طلب مشروع تجريبي",
  pricingPerMonth: "/ شهر",
};

const TR: PageT = {
  ...DE,
  dir: "ltr",
  headline: "VERİMLİLİĞİ ARTIRIN. ZAMAN KAZANIN.",
  headlineSub: "Uzmanlarınız için Yapay Zeka Desteği.",
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
  // B2B
  partnerSectionLabel: "Şu gibi kurumlar için",
  stat1Val: "130+", stat1Lbl: "Hata türü",
  stat2Val: "16", stat2Lbl: "Hukuk alanı",
  stat3Val: "< 60sn", stat3Lbl: "Karar başına analiz süresi",
  stat4Val: "GDPR", stat4Lbl: "Md. 25 Tasarımla Gizlilik",
  workflowSectionLabel: "Nasıl çalışır",
  workflowSectionTitle: "3 adımda itiraz",
  workflow1Title: "Kararı yükle",
  workflow1Desc: "Uzman kararı PDF olarak yükler. Otomatik anonimleştirme tüm müvekkil verilerini anında korur.",
  workflow2Title: "YZ < 60 saniyede analiz eder",
  workflow2Desc: "13 uzman YZ ajanı 16 hukuk alanında 130+ hata türünü kontrol eder.",
  workflow3Title: "Yazıyı dışa aktar",
  workflow3Desc: "DIN A4 PDF olarak kullanıma hazır itiraz. Uzman inceler, imzalar — müvekkil itirazını alır.",
  demoCTALabel: "Kurumunuz için",
  demoCTATitle: "Kurumunuzda kullanıma hazır mısınız?",
  demoCTAText: "BescheidRecht'in iş akışlarınıza nasıl uyduğunu 30 dakikada göstereceğiz. Ücretsız, bağlayıcı değil.",
  demoCTAPrimary: "Demo planla",
  demoCTASecondary: "Pilot proje talep et",
  pricingPerMonth: "/ ay",
};

export const pageTranslations: Record<Lang, PageT> = { DE, EN, RU, AR, TR };

export function getPageT(lang: Lang): PageT {
  return pageTranslations[lang];
}
