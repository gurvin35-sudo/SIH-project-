'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ShieldCheck,
  User,
  HeartPulse,
  Activity,
  FileText,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Mic,
  MicOff,
  Send,
  Calendar,
  Clock,
  Pill,
  Stethoscope,
  Globe,
  FileCheck2,
  Plus,
  Trash2,
  Eye,
  Check
} from 'lucide-react';
import { formatABHA, formatDate } from '@/lib/utils';
import VoiceInputButton from '@/components/VoiceInputButton';

const STEPS = [
  { id: 1, title: 'Profile & Consent', titleHi: 'विवरण एवं सहमति' },
  { id: 2, title: 'AI Health Interview', titleHi: 'एआई स्वास्थ्य संवाद' },
  { id: 3, title: 'Upload & OCR Records', titleHi: 'दस्तावेज़ डिजिटलीकरण' },
  { id: 4, title: 'Clinical Summary', titleHi: 'क्लिनिकल सारांश' },
  { id: 5, title: 'Handover Complete', titleHi: 'चिकित्सक को प्रेषित' },
];

export default function PatientPortalWizardPage() {
  const router = useRouter();

  // Wizard Step
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'

  // Step 1: Patient Profile & Consent
  const [patientData, setPatientData] = useState({
    id: '',
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    email: '',
    address: '',
    bloodGroup: 'B+',
    abhaId: '',
    allergies: '',
    consentGiven: false,
  });

  // Step 2: AI Health Interview State
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [interviewStage, setInterviewStage] = useState('chief_complaint');
  const [collectedHistory, setCollectedHistory] = useState({
    chiefComplaint: '',
    duration: '',
    hpi: '',
    pastMedicalHistory: '',
    pastSurgicalHistory: '',
    currentMedicines: '',
    allergies: '',
    familyHistory: '',
    personalHistory: '',
    reviewOfSystems: '',
    ayushAgni: 'Samagni',
    ayushKoshta: 'Madhyama',
  });
  const [activeRedFlag, setActiveRedFlag] = useState(null);
  const chatBottomRef = useRef(null);

  // Step 3: Medical Documents & OCR
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [samplePresets, setSamplePresets] = useState([]);
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);

  // Step 4: Generated Summary & Handover
  const [generatedSummary, setGeneratedSummary] = useState(null);
  const [isSubmittingToDoctor, setIsSubmittingToDoctor] = useState(false);
  const [savedPatientId, setSavedPatientId] = useState(null);

  // Load OCR Sample Presets on Mount
  useEffect(() => {
    async function loadPresets() {
      try {
        const res = await fetch('/api/ai/ocr-extract');
        if (res.ok) {
          const data = await res.json();
          setSamplePresets(data.presets || []);
        }
      } catch (e) {
        console.error('Failed to load presets:', e);
      }
    }
    loadPresets();
  }, []);

  // Initialize AI Interview when moving to Step 2
  useEffect(() => {
    if (currentStep === 2 && messages.length === 0) {
      startAiInterview();
    }
  }, [currentStep]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiTyping]);

  // Auto-fill Demo Patient
  const handleAutoFillDemo = () => {
    setPatientData({
      id: '',
      name: 'Rajesh Kumar',
      age: '46',
      gender: 'Male',
      contact: '+91 98112 34567',
      email: 'rajesh.kumar@example.com',
      address: 'Sector 14, Rohini, New Delhi',
      bloodGroup: 'B+',
      abhaId: '91-4523-8891-2304',
      allergies: 'None reported',
      consentGiven: true,
    });
  };

  // Start AI Interview
  const startAiInterview = async () => {
    setIsAiTyping(true);
    try {
      const res = await fetch('/api/ai/history-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          userResponse: '',
          collectedData: collectedHistory,
          currentStage: 'chief_complaint'
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages([
          {
            role: 'assistant',
            content: data.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            stage: data.currentStage
          }
        ]);
        setInterviewStage(data.currentStage);
      }
    } catch (err) {
      console.error(err);
      setMessages([
        {
          role: 'assistant',
          content: language === 'hi'
            ? 'नमस्ते! कृपया मुझे बताएं कि आपको क्या मुख्य समस्या महसूस हो रही है?'
            : 'Hello! Please tell me about your primary symptoms or health concern (Chief Complaint).',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Send message in AI Interview
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || currentInput).trim();
    if (!text) return;

    // Add user message
    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setCurrentInput('');
    setIsAiTyping(true);

    try {
      const res = await fetch('/api/ai/history-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userResponse: text,
          language,
          collectedData: collectedHistory,
          currentStage: interviewStage
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.redFlag && data.redFlag.detected) {
          setActiveRedFlag(data.redFlag);
        }

        if (data.collectedData) {
          setCollectedHistory(data.collectedData);
        }

        setInterviewStage(data.currentStage);

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            stage: data.currentStage
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Quick Preset Sample Reports for OCR
  const handleLoadSamplePreset = async (presetId) => {
    setIsOcrProcessing(true);
    try {
      const res = await fetch('/api/ai/ocr-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetId }),
      });
      const data = await res.json();
      if (data.success && data.document) {
        // Prevent duplicate
        if (!uploadedDocs.some((d) => d.title === data.document.title)) {
          setUploadedDocs((prev) => [...prev, data.document]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  // Handle Custom File Upload Simulation
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrProcessing(true);
    try {
      const simulatedText = `Extracted text from ${file.name}:
Patient: ${patientData.name || 'Patient'}
Date: ${new Date().toISOString().slice(0, 10)}
Clinical Findings: Routine diagnostic checkup.
Prescription / Labs: Fasting Blood Sugar: 104 mg/dL (HIGH), HbA1c: 6.0%, Tab. Pan-40 OD x 7 days.`;

      const res = await fetch('/api/ai/ocr-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          rawText: simulatedText
        }),
      });
      const data = await res.json();
      if (data.success && data.document) {
        setUploadedDocs((prev) => [...prev, data.document]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleRemoveDoc = (index) => {
    setUploadedDocs((prev) => prev.filter((_, i) => i !== index));
  };

  // Generate Summary & Review (Step 4)
  const handleGenerateSummary = () => {
    const isHi = language === 'hi';
    const totalDocs = uploadedDocs.length;
    
    // Extract meds and lab values from uploaded docs
    const allMeds = [];
    const allLabs = [];
    uploadedDocs.forEach((doc) => {
      if (doc.extractedData?.medicines) {
        doc.extractedData.medicines.forEach((m) => allMeds.push(m));
      }
      if (doc.extractedData?.labValues) {
        doc.extractedData.labValues.forEach((l) => allLabs.push(l));
      }
    });

    const summaryObj = {
      disclaimer: isHi
        ? '⚠️ एआई द्वारा तैयार क्लिनिकल सारांश — चिकित्सक द्वारा सत्यापन एवं पुष्टि अनिवार्य है।'
        : '⚠️ AI-Generated Clinical Draft — Doctor Verification & Confirmation Required.',
      patientHeader: {
        name: patientData.name || 'Anonymous Patient',
        age: patientData.age || 35,
        gender: patientData.gender,
        contact: patientData.contact,
        abhaId: patientData.abhaId || '91-XXXX-XXXX-XXXX',
        bloodGroup: patientData.bloodGroup,
        language: isHi ? 'हिन्दी (Hindi)' : 'English',
        consentGiven: true,
      },
      redFlags: activeRedFlag,
      clinicalHistory: {
        chiefComplaint: collectedHistory.chiefComplaint || 'Generalized body fatigue and joint discomfort',
        duration: collectedHistory.duration || '2-3 months',
        hpi: collectedHistory.hpi || 'Progressive discomfort with morning stiffness and aggravation in cold weather.',
        pastMedicalHistory: collectedHistory.pastMedicalHistory || 'No major surgical history reported.',
        pastSurgicalHistory: collectedHistory.pastSurgicalHistory || 'None',
        currentMedicines: collectedHistory.currentMedicines || (allMeds.length > 0 ? allMeds.map(m => m.name).join(', ') : 'None'),
        allergies: patientData.allergies || collectedHistory.allergies || 'No known drug allergies (NKDA)',
        familyHistory: collectedHistory.familyHistory || 'Father had joint stiffness / arthritis.',
        personalHistory: collectedHistory.personalHistory || 'Vegetarian diet, irregular sleep, low water intake.',
        reviewOfSystems: collectedHistory.reviewOfSystems || 'Sluggish digestion, occasional gas.'
      },
      ayushParameters: {
        prakritiTendency: collectedHistory.chiefComplaint?.toLowerCase().includes('joint') ? 'Vata-Pitta dominant' : 'Pitta dominant',
        agni: collectedHistory.ayushAgni || 'Vishamagni (Variable)',
        koshta: collectedHistory.ayushKoshta || 'Krura (Hard / Constipated)',
        lifestyleDiet: collectedHistory.personalHistory?.toLowerCase().includes('veg') ? 'Vegetarian' : 'Mixed'
      },
      digitizedRecordsSummary: {
        totalDocumentsUploaded: totalDocs,
        extractedPriorMedicines: allMeds,
        extractedLabParameters: allLabs,
      },
      physicianBrief: isHi
        ? `${patientData.name} (${patientData.age} वर्ष, ${patientData.gender}) ने परामर्श पूर्व एआई इतिहास पूर्ण किया। मुख्य लक्षण: "${collectedHistory.chiefComplaint || 'जोड़ों का दर्द'}"। ${patientData.allergies ? `एलर्जी: ${patientData.allergies}।` : ''} पूर्व जांच रिकॉर्ड्स (${totalDocs}) एवं दवाइयां सफलतापूर्वक ओसीआर द्वारा संकलित की गईं।`
        : `${patientData.name}, a ${patientData.age}-year-old ${patientData.gender.toLowerCase()}, completed AI pre-consultation intake. Chief complaint: "${collectedHistory.chiefComplaint || 'Joint pain & stiffness'}". Allergies: ${patientData.allergies || 'None reported'}. ${totalDocs} previous medical report(s) digitized with OCR extraction.`
    };

    setGeneratedSummary(summaryObj);
    setCurrentStep(4);
  };

  // Submit to Doctor's Queue
  const handleSubmitToDoctor = async () => {
    setIsSubmittingToDoctor(true);
    try {
      const res = await fetch('/api/patient-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientData.id || null,
          name: patientData.name,
          age: patientData.age,
          gender: patientData.gender,
          contact: patientData.contact,
          email: patientData.email,
          address: patientData.address,
          bloodGroup: patientData.bloodGroup,
          abhaId: patientData.abhaId,
          language,
          consentGiven: patientData.consentGiven,
          chiefComplaint: collectedHistory.chiefComplaint,
          duration: collectedHistory.duration,
          hpi: collectedHistory.hpi,
          pastMedicalHistory: collectedHistory.pastMedicalHistory,
          pastSurgicalHistory: collectedHistory.pastSurgicalHistory,
          currentMedicines: collectedHistory.currentMedicines,
          allergies: patientData.allergies || collectedHistory.allergies,
          familyHistory: collectedHistory.familyHistory,
          personalHistory: collectedHistory.personalHistory,
          reviewOfSystems: collectedHistory.reviewOfSystems,
          ayushAgni: collectedHistory.ayushAgni,
          ayushKoshta: collectedHistory.ayushKoshta,
          aiInterviewTranscript: messages,
          documents: uploadedDocs,
          redFlags: activeRedFlag,
          status: 'SENT_TO_DOCTOR'
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedPatientId(data.patientId);
        setCurrentStep(5);
      } else {
        alert(data.error || 'Failed to submit pre-consultation record');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while transmitting record to doctor.');
    } finally {
      setIsSubmittingToDoctor(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Banner & Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-herb text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-stone-900 tracking-tight">
                AyushCase Patient Portal
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Pre-Consultation AI
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {language === 'hi'
                ? 'डॉक्टर से मिलने से पहले अपना स्वास्थ्य इतिहास व रिपोर्ट डिजिटाइज करें'
                : 'Digitize your medical history & documents before your doctor consultation'}
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 border border-stone-200 text-xs font-bold">
            <Globe className="w-3.5 h-3.5 text-stone-500 ml-1" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg transition ${
                language === 'en'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1 rounded-lg transition ${
                language === 'hi'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Stepper Wizard Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-100 -z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 transition-all duration-300 -z-0"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((step) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition shadow-xs ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-emerald-800 text-white ring-4 ring-emerald-100'
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span
                  className={`text-[11px] font-bold mt-1.5 hidden md:block ${
                    isCurrent ? 'text-emerald-900 font-extrabold' : 'text-stone-500'
                  }`}
                >
                  {language === 'hi' ? step.titleHi : step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Red Flag Alert Banner (If triggered anywhere) */}
      {activeRedFlag && (
        <div className="bg-rose-50 border-2 border-rose-400 rounded-3xl p-5 shadow-md flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-200 text-rose-900">
                🚨 Emergency Alert
              </span>
              <h3 className="font-extrabold text-sm text-rose-950">
                {activeRedFlag.type || 'Potential Emergency Symptoms Detected'}
              </h3>
            </div>
            <p className="text-xs text-rose-800 font-medium leading-relaxed">
              {activeRedFlag.warning}
            </p>
            <p className="text-[11px] text-rose-700 italic">
              {activeRedFlag.advice}
            </p>
          </div>
        </div>
      )}

      {/* ================= STEP 1: PATIENT PROFILE & CONSENT ================= */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-lg font-black text-stone-900">
                {language === 'hi' ? 'रोगी पंजीकरण एवं सहमति' : 'Patient Registration & Informed Consent'}
              </h2>
              <p className="text-xs text-stone-500">
                {language === 'hi'
                  ? 'कृपया अपनी मूल जानकारी भरें और स्वास्थ्य मूल्यांकन के लिए सहमति दें।'
                  : 'Enter your basic demographics and provide consent for AI clinical pre-intake.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoFillDemo}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>{language === 'hi' ? 'डेमो डेटा भरें (Rajesh Kumar)' : 'Auto-Fill Demo (Rajesh Kumar)'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {language === 'hi' ? 'पूरा नाम *' : 'Full Name *'}
              </label>
              <input
                type="text"
                required
                value={patientData.name}
                onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                placeholder="e.g. Rajesh Kumar"
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {language === 'hi' ? 'उम्र (वर्ष) *' : 'Age (Years) *'}
              </label>
              <input
                type="number"
                required
                value={patientData.age}
                onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                placeholder="e.g. 46"
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {language === 'hi' ? 'लिंग *' : 'Gender *'}
              </label>
              <select
                value={patientData.gender}
                onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Male">{language === 'hi' ? 'पुरुष (Male)' : 'Male'}</option>
                <option value="Female">{language === 'hi' ? 'महिला (Female)' : 'Female'}</option>
                <option value="Other">{language === 'hi' ? 'अन्य (Other)' : 'Other'}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {language === 'hi' ? 'मोबाइल नंबर *' : 'Contact Number *'}
              </label>
              <input
                type="tel"
                required
                value={patientData.contact}
                onChange={(e) => setPatientData({ ...patientData, contact: e.target.value })}
                placeholder="+91 98112 34567"
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {language === 'hi' ? 'आभा संख्या (ABHA ID)' : 'ABHA Number (Ayushman ID)'}
              </label>
              <input
                type="text"
                value={patientData.abhaId}
                onChange={(e) => setPatientData({ ...patientData, abhaId: e.target.value })}
                placeholder="91-4523-8891-2304"
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {language === 'hi' ? 'रक्त समूह' : 'Blood Group'}
              </label>
              <select
                value={patientData.bloodGroup}
                onChange={(e) => setPatientData({ ...patientData, bloodGroup: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block font-bold text-stone-700 mb-1">
                {language === 'hi' ? 'ज्ञात दवा या खाद्य एलर्जी' : 'Known Drug or Food Allergies'}
              </label>
              <input
                type="text"
                value={patientData.allergies}
                onChange={(e) => setPatientData({ ...patientData, allergies: e.target.value })}
                placeholder={language === 'hi' ? 'उदा. पेनिसिलिन, सल्फा, या कोई नहीं' : 'e.g. Penicillin, Sulfa, None'}
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Digital Consent Box */}
          <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{language === 'hi' ? 'डिजिटल रोगी सहमति एवं गोपनीयता' : 'Digital Patient Consent & Data Privacy'}</span>
            </div>
            <label className="flex items-start gap-3 cursor-pointer text-xs text-stone-700">
              <input
                type="checkbox"
                checked={patientData.consentGiven}
                onChange={(e) => setPatientData({ ...patientData, consentGiven: e.target.checked })}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-stone-300"
              />
              <span className="leading-relaxed">
                {language === 'hi'
                  ? 'मैं स्वेच्छा से अपने पूर्व मेडिकल रिकॉर्ड्स अपलोड करने, एआई स्वास्थ्य संवाद में भाग लेने एवं इस क्लिनिकल सारांश को अपने परामर्शदाता आयुष चिकित्सक (Dr. Ananya Sharma) के साथ साझा करने की सहमति देता/देती हूँ। मैं समझता/समझती हूँ कि यह एआई केवल इतिहास संकलन हेतु है और कोई स्वचालित निदान नहीं करता।'
                  : 'I explicitly consent to digitizing my previous medical records, participating in the AI-assisted history taking, and sharing this clinical synthesis with my consulting AYUSH Vaidya / Medical Practitioner. I understand that this AI collects clinical history and does NOT replace doctor diagnosis.'}
              </span>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={!patientData.name || !patientData.age || !patientData.contact || !patientData.consentGiven}
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              <span>{language === 'hi' ? 'एआई स्वास्थ्य संवाद प्रारंभ करें' : 'Start AI Health Assessment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: AI HEALTH INTERVIEW ================= */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Conversational Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[620px]">
            {/* Chat Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-900 to-herb text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    {language === 'hi' ? 'आयुष क्लिनिकल एआई सहायक' : 'AyushCase Clinical AI Assistant'}
                  </h3>
                  <p className="text-[10px] text-emerald-200">
                    {language === 'hi' ? 'बोलकर या लिखकर उत्तर दें (इतिहास संकलन)' : 'Voice or text enabled history intake'}
                  </p>
                </div>
              </div>

              <div className="text-[10px] font-bold bg-emerald-800/80 px-2.5 py-1 rounded-full border border-emerald-600/60 text-emerald-200">
                {language === 'hi' ? 'चरण: ' : 'Stage: '}
                <span className="text-white capitalize">{interviewStage.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/50">
              {messages.map((msg, idx) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={idx}
                    className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} animate-in fade-in`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1 ${
                        isAssistant
                          ? 'bg-white border border-stone-200 text-stone-800 shadow-xs'
                          : 'bg-emerald-600 text-white shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] opacity-70">
                        <span className="font-bold">
                          {isAssistant
                            ? (language === 'hi' ? 'आयुष एआई' : 'Clinical AI')
                            : (patientData.name || 'You')}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="leading-relaxed font-medium">{msg.content}</p>
                    </div>
                  </div>
                );
              })}

              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="p-3 bg-white rounded-2xl border border-stone-200 text-xs flex items-center gap-2 text-stone-500 shadow-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>{language === 'hi' ? 'एआई लिख रहा है...' : 'AI is processing response...'}</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input & Voice Controller */}
            <div className="p-3.5 bg-white border-t border-stone-200 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? 'यहाँ उत्तर टाइप करें या माइक्रोफ़ोन बटन दबाकर बोलें...'
                      : 'Type your answer here or speak via microphone...'
                  }
                  className="flex-1 p-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {/* Voice Input Button */}
                <VoiceInputButton
                  onTranscript={(transcript) => {
                    setCurrentInput(transcript);
                    handleSendMessage(transcript);
                  }}
                  className="shrink-0"
                />

                <button
                  type="submit"
                  disabled={!currentInput.trim() || isAiTyping}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 shrink-0"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center justify-between text-[10px] text-stone-400 px-1">
                <span>⚡ {language === 'hi' ? 'बोलकर या टाइप करके उत्तर दें' : 'Speak or type your clinical history'}</span>
                <span>🔒 {language === 'hi' ? 'एआई निदान नहीं करता, केवल इतिहास एकत्र करता है' : 'AI collects history, does not diagnose'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Dimension Tracker */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-extrabold text-xs uppercase tracking-wide text-stone-900">
                    {language === 'hi' ? 'इतिहास संकलन स्थिति' : 'Clinical History Progress'}
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  7 Parameters
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${collectedHistory.chiefComplaint ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-stone-50 border-stone-200 text-stone-400'}`}>
                  <span className="font-semibold">1. Chief Complaint</span>
                  {collectedHistory.chiefComplaint ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5" />}
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${collectedHistory.hpi ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-stone-50 border-stone-200 text-stone-400'}`}>
                  <span className="font-semibold">2. Present Illness (HPI)</span>
                  {collectedHistory.hpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5" />}
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${collectedHistory.pastMedicalHistory ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-stone-50 border-stone-200 text-stone-400'}`}>
                  <span className="font-semibold">3. Past Medical History</span>
                  {collectedHistory.pastMedicalHistory ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5" />}
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${collectedHistory.currentMedicines ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-stone-50 border-stone-200 text-stone-400'}`}>
                  <span className="font-semibold">4. Current Medicines & Allergies</span>
                  {collectedHistory.currentMedicines ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5" />}
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${collectedHistory.familyHistory ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-stone-50 border-stone-200 text-stone-400'}`}>
                  <span className="font-semibold">5. Family History</span>
                  {collectedHistory.familyHistory ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5" />}
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${collectedHistory.personalHistory ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-stone-50 border-stone-200 text-stone-400'}`}>
                  <span className="font-semibold">6. Personal Lifestyle (Ahara/Vihara)</span>
                  {collectedHistory.personalHistory ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5" />}
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${collectedHistory.reviewOfSystems ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-stone-50 border-stone-200 text-stone-400'}`}>
                  <span className="font-semibold">7. Digestive Fire (Agni/Koshta)</span>
                  {collectedHistory.reviewOfSystems ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full py-3 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                <span>{language === 'hi' ? 'दस्तावेज़ अपलोड पर आगे बढ़ें' : 'Proceed to Document Upload'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
              >
                ← {language === 'hi' ? 'विवरण संशोधित करें' : 'Back to Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 3: MEDICAL DOCUMENT UPLOAD & OCR ================= */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-lg font-black text-stone-900">
                {language === 'hi' ? 'पूर्व मेडिकल दस्तावेज़ व रिपोर्ट्स अपलोड' : 'Upload Previous Medical Records (OCR Digitization)'}
              </h2>
              <p className="text-xs text-stone-500">
                {language === 'hi'
                  ? 'पुरानी दवा के पर्चे, ब्लड टेस्ट, डिस्चार्ज समरी अपलोड करें ताकि एआई उनसे मुख्य जानकारी निकाल सके।'
                  : 'Upload prescriptions, blood test reports, and discharge summaries for automated OCR entity extraction.'}
              </p>
            </div>

            {/* Quick Demo Preset Load Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-stone-400">⚡ Demo Presets:</span>
              <button
                type="button"
                onClick={() => handleLoadSamplePreset('sample_lab_1')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition"
              >
                + Lab Report (Lipid/HbA1c)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSamplePreset('sample_rx_1')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition"
              >
                + Prescription (Ortho)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSamplePreset('sample_discharge_1')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition"
              >
                + Discharge Summary
              </button>
            </div>
          </div>

          {/* Upload Drop Area */}
          <div className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-3xl p-8 text-center bg-stone-50/50 transition">
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-stone-800">
                  {language === 'hi' ? 'दस्तावेज़ यहाँ अपलोड करें' : 'Drag & drop medical documents or browse'}
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Supports Prescriptions, Lab Reports, Discharge Summaries (PDF, PNG, JPG)
                </p>
              </div>

              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs transition">
                <Camera className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'फ़ाइल चुनें / कैमरा' : 'Select Document from Device'}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* OCR Processing Loader */}
          {isOcrProcessing && (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-emerald-950">
                AI OCR is extracting medicines, lab values, and diagnoses...
              </p>
            </div>
          )}

          {/* Uploaded Documents List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs uppercase tracking-wide text-stone-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Digitized Medical Documents ({uploadedDocs.length})</span>
              </h3>
            </div>

            {uploadedDocs.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-stone-200 italic">
                No documents uploaded yet. You can click the Demo Presets above or upload your records.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadedDocs.map((doc, idx) => {
                  const data = doc.extractedData || {};
                  const meds = data.medicines || [];
                  const labs = data.labValues || [];

                  return (
                    <div
                      key={doc.id || idx}
                      className="bg-stone-50/80 rounded-2xl border border-stone-200 p-5 space-y-3 shadow-xs hover:border-emerald-300 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {doc.docType}
                          </span>
                          <h4 className="font-bold text-xs text-stone-900 mt-1">{doc.title}</h4>
                          <span className="text-[10px] text-stone-400">Date: {doc.docDate ? formatDate(doc.docDate) : 'Recent'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(idx)}
                          className="p-1 rounded text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Extracted Entities */}
                      {meds.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">
                            Extracted Medicines ({meds.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {meds.map((m, mIdx) => (
                              <span
                                key={mIdx}
                                className="text-[11px] px-2 py-0.5 rounded-lg bg-white border border-stone-200 font-medium text-stone-700"
                              >
                                💊 {m.name} ({m.dose || 'Std'})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {labs.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">
                            Extracted Lab Parameters ({labs.length}):
                          </span>
                          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                            {labs.slice(0, 4).map((l, lIdx) => (
                              <div
                                key={lIdx}
                                className={`p-1.5 rounded-lg border font-medium flex items-center justify-between ${
                                  l.status === 'HIGH'
                                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                                    : 'bg-white border-stone-200 text-stone-700'
                                }`}
                              >
                                <span className="truncate">{l.parameter}</span>
                                <span className="font-bold shrink-0">{l.value} {l.status === 'HIGH' ? '⚠️' : ''}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {doc.summary && (
                        <p className="text-[11px] text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200 leading-relaxed italic">
                          "{doc.summary}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
            >
              ← Back to AI Interview
            </button>
            <button
              type="button"
              onClick={handleGenerateSummary}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition"
            >
              <span>{language === 'hi' ? 'क्लिनिकल सारांश व टाइमलाइन देखें' : 'Generate Clinical Summary & Timeline'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: MEDICAL TIMELINE & PHYSICIAN-READY CLINICAL SUMMARY ================= */}
      {currentStep === 4 && generatedSummary && (
        <div className="space-y-6">
          {/* Prominent Verification Notice Required by Problem Statement */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-amber-950">
                  {generatedSummary.disclaimer}
                </h3>
                <p className="text-xs text-amber-800">
                  {language === 'hi'
                    ? 'यह क्लिनिकल ड्राफ्ट आपके डॉक्टर को प्रेषित किया जाएगा। डॉक्टर परामर्श के दौरान इसकी पुष्टि करेंगे।'
                    : 'This synthesized history will be directly forwarded to your consulting physician for verification.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmitToDoctor}
              disabled={isSubmittingToDoctor}
              className="shrink-0 px-6 py-3 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-emerald-700 to-herb hover:from-emerald-800 hover:to-emerald-900 text-white shadow-lg shadow-emerald-700/30 transition transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmittingToDoctor ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{language === 'hi' ? 'डॉक्टर को भेजें 🚀' : 'Send to Doctor 🚀'}</span>
                </>
              )}
            </button>
          </div>

          {/* Chronological Medical Timeline */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Clock className="w-5 h-5 text-emerald-700" />
              <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-wide">
                {language === 'hi' ? 'क्रोनोलॉजिकल मेडिकल टाइमलाइन' : 'Chronological Medical Timeline'}
              </h2>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
              {/* Event 1: Today's AI Intake */}
              <div className="relative">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  ★
                </div>
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-emerald-950">
                      Today: Pre-Consultation AI Health History Completed
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">{new Date().toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-stone-700">
                    Chief Complaint: <span className="font-bold">{generatedSummary.clinicalHistory.chiefComplaint}</span> ({generatedSummary.clinicalHistory.duration})
                  </p>
                </div>
              </div>

              {/* Uploaded Records in Timeline */}
              {uploadedDocs.map((doc, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    ●
                  </div>
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900">
                        {doc.title} ({doc.docType})
                      </span>
                      <span className="text-[10px] text-stone-500">{doc.docDate ? formatDate(doc.docDate) : 'Historical'}</span>
                    </div>
                    {doc.summary && <p className="text-xs text-stone-600 italic">"{doc.summary}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Physician-Ready Structured Clinical Summary */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-stone-900">
                    Physician-Ready Clinical Summary (क्लिनिकल सारांश)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Structured handover for Dr. Ananya Sharma (Sanjeevani Ayurvedic Clinic)
                  </p>
                </div>
              </div>

              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                Status: Ready for Transmission
              </span>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Box 1: Chief Complaint & HPI */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="font-extrabold text-stone-900 uppercase text-[11px] block">
                  1. Chief Complaint & HPI
                </span>
                <p className="text-stone-800 font-medium">
                  <span className="font-bold">Complaint:</span> {generatedSummary.clinicalHistory.chiefComplaint}
                </p>
                <p className="text-stone-800">
                  <span className="font-bold">Duration:</span> {generatedSummary.clinicalHistory.duration}
                </p>
                <p className="text-stone-700 leading-relaxed text-[11px]">
                  <span className="font-bold">History:</span> {generatedSummary.clinicalHistory.hpi}
                </p>
              </div>

              {/* Box 2: Past & Surgical History */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="font-extrabold text-stone-900 uppercase text-[11px] block">
                  2. Past Medical & Surgical History
                </span>
                <p className="text-stone-800">
                  <span className="font-bold">Past Illnesses:</span> {generatedSummary.clinicalHistory.pastMedicalHistory}
                </p>
                <p className="text-stone-800">
                  <span className="font-bold">Surgeries:</span> {generatedSummary.clinicalHistory.pastSurgicalHistory}
                </p>
                <p className="text-rose-700 font-bold">
                  Allergies: {generatedSummary.clinicalHistory.allergies}
                </p>
              </div>

              {/* Box 3: Medications & Family History */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="font-extrabold text-stone-900 uppercase text-[11px] block">
                  3. Current Medications & Family History
                </span>
                <p className="text-stone-800">
                  <span className="font-bold">Current Medicines:</span> {generatedSummary.clinicalHistory.currentMedicines}
                </p>
                <p className="text-stone-800">
                  <span className="font-bold">Family History:</span> {generatedSummary.clinicalHistory.familyHistory}
                </p>
              </div>

              {/* Box 4: AYUSH Constitutional Indicators */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                <span className="font-extrabold text-emerald-950 uppercase text-[11px] block">
                  4. Ayurvedic Constitutional Profile (प्रकृति व अग्नि)
                </span>
                <p className="text-stone-800">
                  <span className="font-bold">Dominant Prakriti:</span> {generatedSummary.ayushParameters.prakritiTendency}
                </p>
                <p className="text-stone-800">
                  <span className="font-bold">Agni (Digestive Fire):</span> {generatedSummary.ayushParameters.agni}
                </p>
                <p className="text-stone-800">
                  <span className="font-bold">Koshta (Bowel Nature):</span> {generatedSummary.ayushParameters.koshta}
                </p>
              </div>
            </div>

            {/* Doctor Handover Action */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
              >
                ← Back to Uploads
              </button>

              <button
                type="button"
                onClick={handleSubmitToDoctor}
                disabled={isSubmittingToDoctor}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
              >
                {isSubmittingToDoctor ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting to Doctor's Queue...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Send to Doctor →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 5: HANDOVER COMPLETED ================= */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8 sm:p-12 text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Handover Transmitted Successfully
            </span>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Pre-Consultation Sent to Dr. Ananya Sharma
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your digitized medical history, OCR documents, and AI clinical summary are now active in the doctor's clinical console.
            </p>
          </div>

          {/* Quick Demo Navigation for SIH Judges */}
          <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 max-w-lg mx-auto text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-stone-900">Demo Presentation Shortcut</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Doctor Console
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Switch directly to the Doctor Portal to see how the doctor opens this patient and instantly reviews the structured history without asking repeat questions.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={savedPatientId ? `/patients/${savedPatientId}` : '/patients'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Open in Doctor Portal →</span>
              </Link>

              {savedPatientId && (
                <Link
                  href={`/patient-portal/${savedPatientId}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 transition"
                >
                  <User className="w-4 h-4" />
                  <span>View Patient Health Card</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
