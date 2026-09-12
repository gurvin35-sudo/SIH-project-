'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🌐', short: 'EN' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', short: 'HI' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', flag: '🚩', short: 'MR' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', flag: '🪔', short: 'GU' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🌾', short: 'PA' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🏵️', short: 'KN' },
];

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  supportedLanguages: SUPPORTED_LANGUAGES,
});

const translations = {
  en: {
    // Navigation
    appName: 'AyushCase',
    appTagline: 'AYUSH Clinical Case-Taking & Body-Type (Prakriti) Intelligence',
    dashboard: 'Dashboard',
    patients: 'Patients',
    newCase: 'New Case Record',
    addPatient: 'Add Patient',
    logout: 'Logout',
    login: 'Login',
    signup: 'Register Doctor',
    profile: 'Doctor Profile',
    sihBadge: 'Smart India Hackathon 2026 • Ministry of Ayush',

    // Dashboard
    totalPatients: 'Total Patients',
    casesToday: 'Cases Logged Today',
    activeFollowups: 'Upcoming Follow-ups',
    prakritiDistribution: 'Body Type Distribution (Prakriti)',
    recentCases: 'Recent Case Records',
    recentPatients: 'Recent Patients',
    quickActions: 'Quick Actions',
    startCaseNow: 'Take New Case',
    viewAllPatients: 'View All Patients',
    searchPatientsPlaceholder: 'Search by name, phone, or ABHA ID...',
    noCasesYet: 'No case records found yet.',
    noPatientsYet: 'No patients found.',

    // Patient Form
    patientDetails: 'Patient Information',
    fullName: 'Full Name',
    age: 'Age',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    contactNumber: 'Contact Number',
    emailAddress: 'Email Address (Optional)',
    residentialAddress: 'Address / City',
    abhaId: 'ABHA ID (Ayushman Bharat Health Account)',
    bloodGroup: 'Blood Group',
    knownAllergies: 'Known Allergies / Sensitivities',
    cancel: 'Cancel',
    savePatient: 'Save Patient',
    saving: 'Saving...',

    // Case Taking Tabs
    tabChiefComplaint: '1. Chief Symptoms & History (Pradhana Vedana)',
    tabPrakriti: '2. Body Type Assessment (Prakriti)',
    tabPariksha: '3. 8-Fold Examination (Ashtavidha Pariksha)',
    tabDiagnosis: '4. Dual Diagnosis (Ayurvedic Roga & ICD-11)',
    tabPrescription: '5. Treatment & Prescription (Chikitsa)',

    // Case Taking Fields
    chiefComplaintLabel: 'Chief Symptoms (Pradhana Vedana)',
    durationLabel: 'Duration / Timeline (Kala)',
    hpiLabel: 'History of Present Illness / Causes (Nidana / HPI)',
    pastHistoryLabel: 'Past Medical & Surgical History (Purva Vyadhi)',
    familyHistoryLabel: 'Family Medical History (Kula Vrittanta)',
    voiceInputTip: 'Click microphone for Voice-to-Text dictation',
    prakritiHeading: 'Body Type Analytical Questionnaire (Prakriti)',
    prakritiDesc: 'Select the options that best represent the patient\'s lifelong physical and mental traits.',
    autoScore: 'Live Body-Energy Calculation (Tridosha)',
    dominantConstitution: 'Dominant Body Type (Prakriti)',
    ashtavidhaHeading: '8-Fold Clinical Check (Ashtavidha Pariksha)',
    agniTitle: 'Digestive Fire & Appetite (Agni)',
    koshtaTitle: 'Bowel Movement Nature (Koshta)',
    ayurvedicDiagnosisLabel: 'Ayurvedic Diagnosis (Roga & Dosha)',
    modernDiagnosisLabel: 'Modern Medical Diagnosis (ICD-11)',
    prognosisLabel: 'Disease Curability / Outlook (Prognosis / Sadhya-Asadhyata)',
    prescriptionLabel: 'Herbal Medicines & Dosage (Aushadhi)',
    panchakarmaLabel: 'Detox & External Therapies (Panchakarma)',
    pathyaLabel: 'Wholesome Diet & Habits - DOs (Pathya)',
    apathyaLabel: 'Unwholesome Foods & Habits - DONTs (Apathya)',
    lifestyleLabel: 'Daily Routine & Yoga Advice (Dinacharya)',
    followUpDateLabel: 'Next Follow-Up Date (Punaragaman)',
    saveCaseRecord: 'Save Complete Case Record',

    // Actions & Buttons
    viewDetails: 'View Details',
    viewHistory: 'Case History',
    printPrescription: 'Print / Download PDF',
    backToPatients: '← Back to Patients',
    backToDashboard: '← Back to Dashboard',
    aiSummary: 'AI Clinical Summary',
    doctorHandover: 'AI Doctor Handover',
    medicalPassport: 'Portable Medical Passport',
    copySummary: 'Copy Handover Note',
  },
  hi: {
    // Navigation
    appName: 'आयुषकेस (AyushCase)',
    appTagline: 'आयुष नैदानिक केस-टेकिंग एवं शारीरिक गठन (प्रकृति) विश्लेषण',
    dashboard: 'डैशबोर्ड',
    patients: 'रोगी सूची',
    newCase: 'नया केस दर्ज करें',
    addPatient: 'रोगी जोड़ें',
    logout: 'लॉगआउट',
    login: 'लॉगिन',
    signup: 'चिकित्सक पंजीकरण',
    profile: 'वैद्य प्रोफाइल',
    sihBadge: 'स्मार्ट इंडिया हैकथॉन • आयुष मंत्रालय',

    // Dashboard
    totalPatients: 'कुल पंजीकृत रोगी',
    casesToday: 'आज दर्ज किए गए केस',
    activeFollowups: 'आगामी फॉलो-अप',
    prakritiDistribution: 'शारीरिक प्रकृति वितरण (Prakriti)',
    recentCases: 'हालिया केस रिकॉर्ड',
    recentPatients: 'हाल के रोगी',
    quickActions: 'त्वरित कार्य',
    startCaseNow: 'नया केस शुरू करें',
    viewAllPatients: 'सभी रोगी देखें',
    searchPatientsPlaceholder: 'नाम, फोन या आभा (ABHA) आईडी से खोजें...',
    noCasesYet: 'कोई केस रिकॉर्ड उपलब्ध नहीं है।',
    noPatientsYet: 'कोई रोगी नहीं मिला।',

    // Patient Form
    patientDetails: 'रोगी विवरण',
    fullName: 'पूरा नाम',
    age: 'आयु (वर्ष)',
    gender: 'लिंग',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    contactNumber: 'मोबाइल नंबर',
    emailAddress: 'ईमेल (वैकल्पिक)',
    residentialAddress: 'पता / शहर',
    abhaId: 'आभा आईडी (ABHA - 14 अंक)',
    bloodGroup: 'रक्त समूह',
    knownAllergies: 'ज्ञात एलर्जी / संवेदनशीलता',
    cancel: 'रद्द करें',
    savePatient: 'रोगी सुरक्षित करें',
    saving: 'सुरक्षित हो रहा है...',

    // Case Taking Tabs
    tabChiefComplaint: '१. मुख्य लक्षण एवं इतिहास (Chief Symptoms)',
    tabPrakriti: '२. शारीरिक प्रकृति निर्धारण (Body-Type / Prakriti)',
    tabPariksha: '३. अष्टविध परीक्षा (8-Fold Check / Pariksha)',
    tabDiagnosis: '४. रोग निदान (Ayurvedic Roga & ICD-11)',
    tabPrescription: '५. चिकित्सा एवं औषधि पत्र (Prescription)',

    // Case Taking Fields
    chiefComplaintLabel: 'मुख्य लक्षण (प्रधान वेदना / Chief Symptoms)',
    durationLabel: 'रोग की अवधि (काल / Duration)',
    hpiLabel: 'वर्तमान व्याधि का इतिहास (निदान/संप्राप्ति / HPI)',
    pastHistoryLabel: 'पूर्व व्याधि इतिहास (Past Medical History)',
    familyHistoryLabel: 'कुल वृत्तांत (पारिवारिक इतिहास / Family History)',
    voiceInputTip: 'आवाज से लिखने के लिए माइक पर क्लिक करें',
    prakritiHeading: 'शारीरिक प्रकृति निर्धारण प्रश्नावली (Prakriti Assessment)',
    prakritiDesc: 'रोगी के शारीरिक व मानसिक लक्षणों के अनुसार उचित विकल्प चुनें।',
    autoScore: 'लाइव त्रिदोष गणना (Tridosha Balance)',
    dominantConstitution: 'प्रधान शारीरिक प्रकृति (Dominant Prakriti)',
    ashtavidhaHeading: 'अष्टविध परीक्षा (8-Fold Clinical Check)',
    agniTitle: 'अग्नि परीक्षा (पाचन शक्ति / Digestive Fire)',
    koshtaTitle: 'कोष्ठ परीक्षा (मल त्याग की प्रकृति / Bowel Habit)',
    ayurvedicDiagnosisLabel: 'आयुर्वेदिक निदान (रोग व दोष / Ayurvedic Diagnosis)',
    modernDiagnosisLabel: 'आधुनिक निदान (Modern ICD-11)',
    prognosisLabel: 'रोग साध्यासाध्यता (Prognosis / Curability)',
    prescriptionLabel: 'औषध योग एवं मात्रा (Herbal Medicines / Prescription)',
    panchakarmaLabel: 'पंचकर्म एवं बाह्य उपक्रम (Detox Therapies)',
    pathyaLabel: 'पथ्य (सेवन योग्य खान-पान / DOs - Pathya)',
    apathyaLabel: 'अपथ्य (त्याज्य खान-पान / DONTs - Apathya)',
    lifestyleLabel: 'दिनचर्या, योग एवं प्राणायाम सलाह (Dinacharya)',
    followUpDateLabel: 'पुनरागमन तिथि (Next Visit)',
    saveCaseRecord: 'केस रिकॉर्ड सुरक्षित करें',

    // Actions & Buttons
    viewDetails: 'विवरण देखें',
    viewHistory: 'केस इतिहास',
    printPrescription: 'प्रिंट / PDF डाउनलोड',
    backToPatients: '← रोगी सूची पर वापस',
    backToDashboard: '← डैशबोर्ड पर वापस',
    aiSummary: 'एआई नैदानिक सारांश',
    doctorHandover: 'एआई चिकित्सक हैंडओवर सारांश',
    medicalPassport: 'पोर्टेबल डिजिटल हेल्थ पासपोर्ट',
    copySummary: 'हैंडओवर नोट कॉपी करें',
  },
  mr: {
    appName: 'आयुषकेस (AyushCase)',
    appTagline: 'आयुष क्लिनिकल केस-टेकिंग आणि प्रकृती विश्लेषण',
    dashboard: 'डॅशबोर्ड',
    patients: 'रुग्ण यादी',
    newCase: 'नवीन केस नोंदवा',
    addPatient: 'नवीन रुग्ण जोडा',
    logout: 'लॉगआउट',
    login: 'लॉगिन',
    signup: 'वैद्य नोंदणी',
    totalPatients: 'एकूण रुग्ण',
    casesToday: 'आज नोंदवलेली प्रकरणे',
    prakritiDistribution: 'शारीरिक प्रकृती वितरण',
    recentCases: 'अलीकडील केसेस',
    startCaseNow: 'नवीन केस सुरू करा',
    viewAllPatients: 'सर्व रुग्ण पहा',
    patientDetails: 'रुग्ण माहिती',
    fullName: 'पूर्ण नाव',
    age: 'वय',
    gender: 'लिंग',
    abhaId: 'आभा आयडी (ABHA)',
    chiefComplaintLabel: 'मुख्य लक्षणे (वेदना)',
    ayurvedicDiagnosisLabel: 'आयुर्वेदिक निदान (दोष व व्याधी)',
    prescriptionLabel: 'औषध योजना व मात्रा (Prescription)',
    printPrescription: 'प्रिंट / PDF डाउनलोड',
    backToPatients: '← रुग्ण यादीवर परत',
  },
  gu: {
    appName: 'આયુષકેસ (AyushCase)',
    appTagline: 'આયુષ ક્લિનિકલ કેસ-ટેકિંગ અને પ્રકૃતિ વિશ્લેષણ',
    dashboard: 'ડેશબોર્ડ',
    patients: 'દર્દીઓની યાદી',
    newCase: 'નવો કેસ નોંધો',
    addPatient: 'દર્દી ઉમેરો',
    logout: 'લૉગઆઉટ',
    login: 'લૉગિન',
    signup: 'વૈદ્ય નોંધણી',
    totalPatients: 'કુલ દર્દીઓ',
    casesToday: 'આજના કેસ',
    prakritiDistribution: 'શારીરિક પ્રકૃતિ વિતરણ',
    recentCases: 'તાજેતરના કેસ',
    startCaseNow: 'નવો કેસ શરૂ કરો',
    viewAllPatients: 'બધા દર્દીઓ જુઓ',
    patientDetails: 'દર્દીની વિગતો',
    fullName: 'પૂરું નામ',
    age: 'ઉંમર',
    gender: 'જાતિ',
    abhaId: 'આભા આઈડી (ABHA)',
    chiefComplaintLabel: 'મુખ્ય લક્ષણો (વેદના)',
    ayurvedicDiagnosisLabel: 'આયુર્વેદિક નિદાન',
    prescriptionLabel: 'ઔષધિ અને માત્રા',
    printPrescription: 'પ્રિન્ટ / PDF ડાઉનલોડ',
    backToPatients: '← દર્દી યાદી પર પાછા',
  },
  pa: {
    appName: 'ਆਯੁਸ਼ਕੇਸ (AyushCase)',
    appTagline: 'ਆਯੁਸ਼ ਕਲੀਨਿਕਲ ਕੇਸ-ਟੇਕਿੰਗ ਅਤੇ ਪ੍ਰਕਿਰਤੀ ਵਿਸ਼ਲੇਸ਼ਣ',
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    patients: 'ਮਰੀਜ਼ਾਂ ਦੀ ਸੂਚੀ',
    newCase: 'ਨਵਾਂ ਕੇਸ ਦਰਜ ਕਰੋ',
    addPatient: 'ਮਰੀਜ਼ ਸ਼ਾਮਲ ਕਰੋ',
    logout: 'ਲਾਗ ਆਊਟ',
    login: 'ਲਾਗਇਨ',
    signup: 'ਵੈਦ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
    totalPatients: 'ਕੁੱਲ ਮਰੀਜ਼',
    casesToday: 'ਅੱਜ ਦੇ ਕੇਸ',
    prakritiDistribution: 'ਸਰੀਰਕ ਪ੍ਰਕਿਰਤੀ ਵੰਡ',
    recentCases: 'ਹਾਲੀਆ ਕੇਸ',
    startCaseNow: 'ਨਵਾਂ ਕੇਸ ਸ਼ੁਰੂ ਕਰੋ',
    viewAllPatients: 'ਸਾਰੇ ਮਰੀਜ਼ ਦੇਖੋ',
    patientDetails: 'ਮਰੀਜ਼ ਦਾ ਵੇਰਵਾ',
    fullName: 'ਪੂਰਾ ਨਾਮ',
    age: 'ਉਮਰ',
    gender: 'ਲਿੰਗ',
    abhaId: 'ਆਭਾ ਆਈਡੀ (ABHA)',
    chiefComplaintLabel: 'ਮੁੱਖ ਲੱਛਣ',
    ayurvedicDiagnosisLabel: 'ਆਯੁਰਵੈਦਿਕ ਨਿਦਾਨ',
    prescriptionLabel: 'ਦਵਾਈ ਅਤੇ ਖ਼ੁਰਾਕ',
    printPrescription: 'ਪ੍ਰਿੰਟ / PDF ਡਾਊਨਲੋਡ',
    backToPatients: '← ਮਰੀਜ਼ ਸੂਚੀ ਤੇ ਵਾਪਸ',
  },
  kn: {
    appName: 'ಆಯುಷ್‌ಕೇಸ್ (AyushCase)',
    appTagline: 'ಆಯುಷ್ ಕ್ಲಿನಿಕಲ್ ಕೇಸ್-ಟೇಕಿಂಗ್ ಮತ್ತು ಪ್ರಕೃತಿ ವಿಶ್ಲೇಷಣೆ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    patients: 'ರೋಗಿಗಳ ಪಟ್ಟಿ',
    newCase: 'ಹೊಸ ಕೇಸ್ ದಾಖಲಿಸಿ',
    addPatient: 'ರೋಗಿ ಸೇರಿಸಿ',
    logout: 'ಲಾಗ್‌ಔಟ್',
    login: 'ಲಾಗಿನ್',
    signup: 'ವೈದ್ಯರ ನೋಂದಣಿ',
    totalPatients: 'ಒಟ್ಟು ರೋಗಿಗಳು',
    casesToday: 'ಇಂದಿನ ಕೇಸ್‌ಗಳು',
    prakritiDistribution: 'ದೇಹ ಪ್ರಕೃತಿ ವಿತರಣೆ',
    recentCases: 'ಇತ್ತೀಚಿನ ಕೇಸ್‌ಗಳು',
    startCaseNow: 'ಹೊಸ ಕೇಸ್ ಪ್ರಾರಂಭಿಸಿ',
    viewAllPatients: 'ಎಲ್ಲಾ ರೋಗಿಗಳನ್ನು ನೋಡಿ',
    patientDetails: 'ರೋಗಿಯ ವಿವರಗಳು',
    fullName: 'ಪೂರ್ಣ ಹೆಸರು',
    age: 'ವಯಸ್ಸು',
    gender: 'ಲಿಂಗ',
    abhaId: 'ಆಭಾ ಐಡಿ (ABHA)',
    chiefComplaintLabel: 'ಮುಖ್ಯ ಲಕ್ಷಣಗಳು',
    ayurvedicDiagnosisLabel: 'ಆಯುರ್ವೇದ ರೋಗ ನಿರ್ಣಯ',
    prescriptionLabel: 'ಔಷಧಿ ಮತ್ತು ಪ್ರಮಾಣ',
    printPrescription: 'ಮುದ್ರಿಸಿ / PDF ಡೌನ್‌ಲೋಡ್',
    backToPatients: '← ರೋಗಿಗಳ ಪಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('ayushcase_lang');
    if (saved && translations[saved]) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('ayushcase_lang', lang);
    }
  };

  const t = (key) => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    if (translations.hi && translations.hi[key] && language !== 'en') {
      return translations.hi[key];
    }
    return translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
