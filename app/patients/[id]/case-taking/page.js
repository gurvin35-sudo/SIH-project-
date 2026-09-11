'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FilePlus2,
  ArrowLeft,
  Sparkles,
  Activity,
  HeartPulse,
  Stethoscope,
  Pill,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
  FileCheck2,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Info,
  Download,
  Check,
  X,
  FileText,
  Layers,
  Eye,
  BookOpen
} from 'lucide-react';
import {
  PRAKRITI_QUESTIONS,
  ASHTAVIDHA_PARIKSHA,
  COMMON_ROGAS,
  PANCHAKARMA_THERAPIES,
  DIET_PRESETS
} from '@/lib/ayush-data';
import { formatDate, formatABHA } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageContext';
import DoshaMeter from '@/components/DoshaMeter';
import PrescriptionBuilder from '@/components/PrescriptionBuilder';
import VoiceInputButton from '@/components/VoiceInputButton';

export default function CaseTakingPage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [activeTab, setActiveTab] = useState('chief_complaint');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Digitized Prescriptions Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedImportMeds, setSelectedImportMeds] = useState({});
  const [importIncludeDiet, setImportIncludeDiet] = useState(true);
  const [importIncludePanchakarma, setImportIncludePanchakarma] = useState(true);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    visitDate: new Date().toISOString().slice(0, 10),
    chiefComplaint: '',
    duration: '',
    hpi: '',
    pastMedicalHistory: '',
    familyHistory: '',

    // Prakriti Answers
    prakritiAnswers: {},
    vataScore: 0,
    pittaScore: 0,
    kaphaScore: 0,
    prakritiResult: '',

    // Ashtavidha Pariksha
    nadiPariksha: '',
    jihvaPariksha: '',
    malaPariksha: '',
    mutraPariksha: '',
    sparshaPariksha: '',
    drukPariksha: '',
    shabdaPariksha: '',
    aakritiPariksha: '',
    agniType: 'Samagni',
    koshtaType: 'Madhyama',

    // Diagnosis
    ayurvedicDiagnosis: '',
    modernDiagnosis: '',
    prognosis: 'Sukha Sadhya (Easily curable)',

    // Prescription & Therapies
    prescription: [
      {
        name: 'Triphala Churna',
        form: 'Churna',
        dose: '3-5g',
        anupana: 'Warm water (Ushnodaka)',
        timing: 'Bedtime (Nishakala)',
        duration: '14 days',
      },
    ],
    panchakarmaAdvice: '',
    pathyaDiet: '',
    apathyaDiet: '',
    lifestyleAdvice: '',
    followUpDate: '',
  });

  const [autoPopulatedFromAi, setAutoPopulatedFromAi] = useState(false);

  // Fetch Patient Details
  useEffect(() => {
    async function loadPatient() {
      try {
        setLoadingPatient(true);
        const res = await fetch(`/api/patients/${params.id}`);
        if (!res.ok) {
          setError('Patient not found');
          return;
        }
        const data = await res.json();
        const p = data.patient;
        setPatient(p);

        // Pre-populate if patient completed pre-consultation history or has prakriti
        let hasAiData = false;
        setFormData((prev) => {
          const next = { ...prev };
          if (p.chiefComplaint) {
            next.chiefComplaint = p.chiefComplaint;
            hasAiData = true;
          }
          if (p.duration) next.duration = p.duration;
          if (p.hpi) next.hpi = p.hpi;
          if (p.pastMedicalHistory) next.pastMedicalHistory = p.pastMedicalHistory;
          if (p.familyHistory) next.familyHistory = p.familyHistory;
          if (p.prakritiType) next.prakritiResult = p.prakritiType;
          if (p.ayushAgni) next.agniType = p.ayushAgni.split(' ')[0] || 'Samagni';
          if (p.ayushKoshta) next.koshtaType = p.ayushKoshta.split(' ')[0] || 'Madhyama';
          return next;
        });

        if (hasAiData) {
          setAutoPopulatedFromAi(true);
        }
      } catch (err) {
        setError('Failed to load patient information');
      } finally {
        setLoadingPatient(false);
      }
    }
    if (params.id) {
      loadPatient();
    }
  }, [params.id]);

  // Extract all medications and dietary/panchakarma data from patient's digitized OCR documents
  const digitizedDocsWithMeds = React.useMemo(() => {
    if (!patient?.documents) return [];
    return patient.documents
      .map((doc, dIdx) => {
        let data = {};
        try {
          if (doc.extractedData) {
            data = typeof doc.extractedData === 'string' ? JSON.parse(doc.extractedData) : doc.extractedData;
          }
        } catch (e) {
          data = {};
        }
        const meds = data.medications || data.medicines || [];
        return {
          docId: doc.id || `doc-${dIdx}`,
          docTitle: doc.title || 'Medical Document',
          docDate: doc.docDate,
          ayushSystem: data.ayushSystem || doc.docType || 'Prescription',
          doctor: data.doctor,
          diagnosis: data.diagnosis,
          pathya: data.pathya || data.pathyaDiet,
          apathya: data.apathya || data.apathyaDiet,
          panchakarma: data.procedures || data.panchakarmaAdvice || data.treatment,
          meds: meds.map((m, mIdx) => ({
            id: `${doc.id || dIdx}-med-${mIdx}`,
            name: m.name || '',
            form: m.form || 'Vati / Gutika (Tablet)',
            dose: m.dose || m.dosage || '',
            timing: m.timing || '',
            anupana: m.anupana || '',
            duration: m.duration || '14 days',
            route: m.route || 'Oral',
            docTitle: doc.title || 'Prescription',
          })),
        };
      })
      .filter((d) => d.meds.length > 0);
  }, [patient?.documents]);

  const totalDigitizedMedsCount = digitizedDocsWithMeds.reduce((acc, d) => acc + d.meds.length, 0);

  const handleOpenImportModal = () => {
    const initialSelection = {};
    digitizedDocsWithMeds.forEach((docGroup) => {
      docGroup.meds.forEach((med) => {
        initialSelection[med.id] = true;
      });
    });
    setSelectedImportMeds(initialSelection);
    setImportModalOpen(true);
  };

  const handleToggleMed = (medId) => {
    setSelectedImportMeds((prev) => ({
      ...prev,
      [medId]: !prev[medId],
    }));
  };

  const handleToggleSelectAll = () => {
    const allSelected = digitizedDocsWithMeds.every((docGroup) =>
      docGroup.meds.every((m) => selectedImportMeds[m.id])
    );
    const nextSelection = {};
    digitizedDocsWithMeds.forEach((docGroup) => {
      docGroup.meds.forEach((med) => {
        nextSelection[med.id] = !allSelected;
      });
    });
    setSelectedImportMeds(nextSelection);
  };

  const handleConfirmImport = () => {
    const medsToAdd = [];
    let importedPathya = '';
    let importedApathya = '';
    let importedPanchakarma = '';

    digitizedDocsWithMeds.forEach((docGroup) => {
      docGroup.meds.forEach((med) => {
        if (selectedImportMeds[med.id]) {
          medsToAdd.push({
            name: med.name,
            form: med.form || 'Vati / Gutika (Tablet)',
            dose: med.dose || '1-2 tablets',
            anupana: med.anupana || 'Warm water (Ushnodaka)',
            timing: med.timing || 'Twice daily after food (Adhahbhakta)',
            duration: med.duration || '14 days',
          });
        }
      });
      if (importIncludeDiet) {
        if (docGroup.pathya && !importedPathya.includes(docGroup.pathya)) {
          importedPathya = importedPathya ? `${importedPathya}, ${docGroup.pathya}` : docGroup.pathya;
        }
        if (docGroup.apathya && !importedApathya.includes(docGroup.apathya)) {
          importedApathya = importedApathya ? `${importedApathya}, ${docGroup.apathya}` : docGroup.apathya;
        }
      }
      if (importIncludePanchakarma && docGroup.panchakarma) {
        if (!importedPanchakarma.includes(docGroup.panchakarma)) {
          importedPanchakarma = importedPanchakarma ? `${importedPanchakarma}, ${docGroup.panchakarma}` : docGroup.panchakarma;
        }
      }
    });

    if (medsToAdd.length > 0) {
      setFormData((prev) => {
        // If current prescription has only 1 empty or default dummy item, replace it; else append
        const isDefaultDummy =
          prev.prescription.length === 1 &&
          prev.prescription[0].name === 'Triphala Churna' &&
          prev.prescription[0].dose === '3-5g';

        const nextPrescription = isDefaultDummy ? medsToAdd : [...prev.prescription, ...medsToAdd];

        return {
          ...prev,
          prescription: nextPrescription,
          pathyaDiet: importedPathya
            ? prev.pathyaDiet
              ? `${prev.pathyaDiet}\n${importedPathya}`
              : importedPathya
            : prev.pathyaDiet,
          apathyaDiet: importedApathya
            ? prev.apathyaDiet
              ? `${prev.apathyaDiet}\n${importedApathya}`
              : importedApathya
            : prev.apathyaDiet,
          panchakarmaAdvice: importedPanchakarma
            ? prev.panchakarmaAdvice
              ? `${prev.panchakarmaAdvice}, ${importedPanchakarma}`
              : importedPanchakarma
            : prev.panchakarmaAdvice,
        };
      });
      setImportSuccessMsg(
        `Successfully imported ${medsToAdd.length} medication${medsToAdd.length > 1 ? 's' : ''} from digitized records!`
      );
      setTimeout(() => setImportSuccessMsg(''), 4500);
    }
    setImportModalOpen(false);
  };

  // Handle Prakriti Option Selection & Auto-Score Calculation
  const handlePrakritiSelect = (questionId, option) => {
    const updatedAnswers = {
      ...formData.prakritiAnswers,
      [questionId]: option,
    };

    let v = 0;
    let p = 0;
    let k = 0;

    Object.values(updatedAnswers).forEach((opt) => {
      if (opt.dosha === 'vata') v++;
      if (opt.dosha === 'pitta') p++;
      if (opt.dosha === 'kapha') k++;
    });

    let dominant = 'Tridoshic (Balanced)';
    const maxScore = Math.max(v, p, k);

    if (v === p && p === k && v > 0) {
      dominant = 'Tridosha Sama (Balanced)';
    } else if (v === p && v === maxScore) {
      dominant = 'Vata-Pitta dominant';
    } else if (p === k && p === maxScore) {
      dominant = 'Pitta-Kapha dominant';
    } else if (v === k && v === maxScore) {
      dominant = 'Vata-Kapha dominant';
    } else if (v === maxScore) {
      dominant = v - Math.max(p, k) >= 2 ? 'Vata dominant' : p > k ? 'Vata-Pitta' : 'Vata-Kapha';
    } else if (p === maxScore) {
      dominant = p - Math.max(v, k) >= 2 ? 'Pitta dominant' : v > k ? 'Pitta-Vata' : 'Pitta-Kapha';
    } else if (k === maxScore) {
      dominant = k - Math.max(v, p) >= 2 ? 'Kapha dominant' : p > v ? 'Kapha-Pitta' : 'Kapha-Vata';
    }

    // Auto-suggest Pathya/Apathya based on dominant dosha if not manually typed
    let pathyaSuggest = formData.pathyaDiet;
    let apathyaSuggest = formData.apathyaDiet;
    if (dominant.includes('Vata') && !formData.pathyaDiet) {
      pathyaSuggest = DIET_PRESETS.vata.pathya;
      apathyaSuggest = DIET_PRESETS.vata.apathya;
    } else if (dominant.includes('Pitta') && !formData.pathyaDiet) {
      pathyaSuggest = DIET_PRESETS.pitta.pathya;
      apathyaSuggest = DIET_PRESETS.pitta.apathya;
    } else if (dominant.includes('Kapha') && !formData.pathyaDiet) {
      pathyaSuggest = DIET_PRESETS.kapha.pathya;
      apathyaSuggest = DIET_PRESETS.kapha.apathya;
    }

    setFormData((prev) => ({
      ...prev,
      prakritiAnswers: updatedAnswers,
      vataScore: v,
      pittaScore: p,
      kaphaScore: k,
      prakritiResult: dominant,
      pathyaDiet: pathyaSuggest,
      apathyaDiet: apathyaSuggest,
    }));
  };

  // Handle Roga Selection from preset
  const handleSelectRoga = (roga) => {
    setFormData((prev) => ({
      ...prev,
      ayurvedicDiagnosis: roga.ayurvedic,
      modernDiagnosis: roga.modern,
      hpi: prev.hpi ? prev.hpi : `Suspected dusti: ${roga.dosha}. Symptoms: ${roga.symptoms}.`,
    }));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.chiefComplaint) {
      setActiveTab('chief_complaint');
      setError('Chief Complaint is required.');
      return;
    }

    if (!formData.ayurvedicDiagnosis) {
      setActiveTab('diagnosis');
      setError('Ayurvedic Diagnosis is required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        patientId: params.id,
      };

      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save case record');
        setSaving(false);
        return;
      }

      // Navigate to the newly generated official case record / print view!
      router.push(`/cases/${data.caseRecord.id}`);
    } catch (err) {
      setError('Network error while saving case record');
      setSaving(false);
    }
  };

  if (loadingPatient) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-stone-500">Preparing AYUSH Case-Taking Console...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'chief_complaint', label: t('tabChiefComplaint'), icon: Activity },
    { id: 'prakriti', label: t('tabPrakriti'), icon: Compass },
    { id: 'pariksha', label: t('tabPariksha'), icon: HeartPulse },
    { id: 'diagnosis', label: t('tabDiagnosis'), icon: Stethoscope },
    { id: 'prescription', label: t('tabPrescription'), icon: Pill },
  ];

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Top Patient Header Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/patients/${params.id}`}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
            title="Back to patient history"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-stone-900 tracking-tight">
                {patient?.name}
              </h1>
              <span className="text-xs text-stone-500 font-medium">
                ({patient?.age}y / {patient?.gender})
              </span>
              {patient?.abhaId && (
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  ABHA: {formatABHA(patient.abhaId)}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              {language === 'hi' ? 'आयुर्वेदिक क्लिनिकल केस शीट' : 'Ayurvedic Clinical Case-Taking Console'}
            </p>
          </div>
        </div>

        {/* Visit Date */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-stone-500 font-semibold">Visit Date:</span>
          <input
            type="date"
            value={formData.visitDate}
            onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
            className="p-2 text-xs rounded-xl border border-stone-300 font-medium focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* AI Pre-Population Notice */}
      {autoPopulatedFromAi && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-xs text-emerald-950 block">
                Auto-populated from Patient's AI Pre-Consultation History
              </span>
              <p className="text-[11px] text-emerald-800">
                Chief Complaint, Duration, HPI, Past History, Family History, Prakriti, and Agni/Koshta have been loaded. Doctor verification active.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
            Time Saved: ~15 mins
          </span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-stone-200 pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT SECTIONS */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8">
        {/* ================= TAB 1: CHIEF COMPLAINT & HISTORY ================= */}
        {activeTab === 'chief_complaint' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <span>{t('tabChiefComplaint')}</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Record the presenting complaints, duration, onset, and chronological history.
              </p>
            </div>

            {/* Chief Complaint Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800">
                  {t('chiefComplaintLabel')} *
                </label>
                <VoiceInputButton
                  onTranscript={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      chiefComplaint: prev.chiefComplaint ? `${prev.chiefComplaint} ${text}` : text,
                    }))
                  }
                />
              </div>
              <textarea
                rows={3}
                required
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                placeholder="e.g. Bilateral knee pain for 6 months, morning stiffness for 30 minutes, burning sour reflux after spicy food..."
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800">
                {t('durationLabel')}
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 6 months / 2 weeks / Acute onset 3 days ago"
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* History of Present Illness (HPI) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800">
                  {t('hpiLabel')}
                </label>
                <VoiceInputButton
                  onTranscript={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      hpi: prev.hpi ? `${prev.hpi} ${text}` : text,
                    }))
                  }
                />
              </div>
              <textarea
                rows={3}
                value={formData.hpi}
                onChange={(e) => setFormData({ ...formData, hpi: e.target.value })}
                placeholder="Details of onset, progression, relieving factors (warm food/oil), aggravating factors (cold weather/curd/stress)..."
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Past Medical History & Family History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-800">
                  {t('pastHistoryLabel')}
                </label>
                <textarea
                  rows={2}
                  value={formData.pastMedicalHistory}
                  onChange={(e) => setFormData({ ...formData, pastMedicalHistory: e.target.value })}
                  placeholder="Past surgeries, chronic conditions, jaundice, typhoid..."
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-800">
                  {t('familyHistoryLabel')}
                </label>
                <textarea
                  rows={2}
                  value={formData.familyHistory}
                  onChange={(e) => setFormData({ ...formData, familyHistory: e.target.value })}
                  placeholder="Diabetes, Hypertension, Joint disorders in parents/siblings..."
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('prakriti')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <span>Next: Prakriti Assessment →</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PRAKRITI ASSESSMENT ================= */}
        {activeTab === 'prakriti' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600" />
                <span>{t('prakritiHeading')}</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">{t('prakritiDesc')}</p>
            </div>

            {/* Live Dosha Meter Visualizer */}
            <DoshaMeter
              vata={formData.vataScore}
              pitta={formData.pittaScore}
              kapha={formData.kaphaScore}
              result={formData.prakritiResult}
            />

            {/* Structured Questionnaire Cards */}
            <div className="space-y-5 pt-2">
              {PRAKRITI_QUESTIONS.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="p-4 bg-stone-50/70 rounded-2xl border border-stone-200/80 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center justify-center">
                      {qIdx + 1}
                    </span>
                    <h3 className="font-bold text-xs text-stone-800">
                      {language === 'hi' ? q.labelHi : q.labelEn}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {q.options.map((opt) => {
                      const isSelected = formData.prakritiAnswers[q.id]?.id === opt.id;
                      const doshaBadge =
                        opt.dosha === 'vata'
                          ? 'Vata (वात)'
                          : opt.dosha === 'pitta'
                          ? 'Pitta (पित्त)'
                          : 'Kapha (कफ)';

                      const borderActive =
                        opt.dosha === 'vata'
                          ? 'border-sky-500 bg-sky-50/70 text-sky-900 ring-2 ring-sky-300'
                          : opt.dosha === 'pitta'
                          ? 'border-amber-500 bg-amber-50/70 text-amber-900 ring-2 ring-amber-300'
                          : 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-300';

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handlePrakritiSelect(q.id, opt)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                            isSelected
                              ? borderActive
                              : 'border-stone-200 bg-white hover:border-emerald-300 text-stone-700'
                          }`}
                        >
                          <p className="text-[11px] leading-relaxed mb-2">
                            {language === 'hi' ? opt.textHi : opt.textEn}
                          </p>
                          <span
                            className={`self-start text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              opt.dosha === 'vata'
                                ? 'bg-sky-100 text-sky-800'
                                : opt.dosha === 'pitta'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {doshaBadge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setActiveTab('chief_complaint')}
                className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pariksha')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <span>Next: Ashtavidha Pariksha →</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ASHTAVIDHA PARIKSHA ================= */}
        {activeTab === 'pariksha' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-600" />
                <span>{t('ashtavidhaHeading')}</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Classical 8-fold Ayurvedic clinical diagnostic examination.
              </p>
            </div>

            {/* Agni & Koshta */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                  {t('agniTitle')} (Digestive Fire)
                </label>
                <select
                  value={formData.agniType}
                  onChange={(e) => setFormData({ ...formData, agniType: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-emerald-300 bg-white focus:ring-2 focus:ring-emerald-500 text-stone-800"
                >
                  <option value="Samagni">Samagni (Balanced & Normal digestion)</option>
                  <option value="Vishamagni">Vishamagni (Irregular / Bloating / Vata)</option>
                  <option value="Tikshnagni">Tikshnagni (Intense / Acidic / Pitta)</option>
                  <option value="Mandagni">Mandagni (Slow / Sluggish / Kapha)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                  {t('koshtaTitle')} (Bowel Nature)
                </label>
                <select
                  value={formData.koshtaType}
                  onChange={(e) => setFormData({ ...formData, koshtaType: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-emerald-300 bg-white focus:ring-2 focus:ring-emerald-500 text-stone-800"
                >
                  <option value="Madhyama">Madhyama Koshta (Moderate / Normal)</option>
                  <option value="Krura">Krura Koshta (Hard stool / Constipation - Vata)</option>
                  <option value="Mridu">Mridu Koshta (Soft / Easily purged - Pitta)</option>
                </select>
              </div>
            </div>

            {/* Ashtavidha 8 Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nadi (Pulse) */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  {language === 'hi' ? ASHTAVIDHA_PARIKSHA.nadi.labelHi : ASHTAVIDHA_PARIKSHA.nadi.labelEn}
                </label>
                <select
                  value={formData.nadiPariksha}
                  onChange={(e) => setFormData({ ...formData, nadiPariksha: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500 text-stone-800"
                >
                  <option value="">-- Select Nadi Gati --</option>
                  {ASHTAVIDHA_PARIKSHA.nadi.options.map((opt) => (
                    <option key={opt.id} value={opt.labelEn}>
                      {language === 'hi' ? opt.labelHi : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jihva (Tongue) */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  {language === 'hi' ? ASHTAVIDHA_PARIKSHA.jihva.labelHi : ASHTAVIDHA_PARIKSHA.jihva.labelEn}
                </label>
                <select
                  value={formData.jihvaPariksha}
                  onChange={(e) => setFormData({ ...formData, jihvaPariksha: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500 text-stone-800"
                >
                  <option value="">-- Select Jihva Lakshan --</option>
                  {ASHTAVIDHA_PARIKSHA.jihva.options.map((opt) => (
                    <option key={opt.id} value={opt.labelEn}>
                      {language === 'hi' ? opt.labelHi : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mala (Stool) */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  {language === 'hi' ? ASHTAVIDHA_PARIKSHA.mala.labelHi : ASHTAVIDHA_PARIKSHA.mala.labelEn}
                </label>
                <select
                  value={formData.malaPariksha}
                  onChange={(e) => setFormData({ ...formData, malaPariksha: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500 text-stone-800"
                >
                  <option value="">-- Select Mala Pariksha --</option>
                  {ASHTAVIDHA_PARIKSHA.mala.options.map((opt) => (
                    <option key={opt.id} value={opt.labelEn}>
                      {language === 'hi' ? opt.labelHi : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mutra (Urine) */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  {language === 'hi' ? ASHTAVIDHA_PARIKSHA.mutra.labelHi : ASHTAVIDHA_PARIKSHA.mutra.labelEn}
                </label>
                <select
                  value={formData.mutraPariksha}
                  onChange={(e) => setFormData({ ...formData, mutraPariksha: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500 text-stone-800"
                >
                  <option value="">-- Select Mutra Varna & Gati --</option>
                  {ASHTAVIDHA_PARIKSHA.mutra.options.map((opt) => (
                    <option key={opt.id} value={opt.labelEn}>
                      {language === 'hi' ? opt.labelHi : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sparsha (Touch) */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  {language === 'hi' ? ASHTAVIDHA_PARIKSHA.sparsha.labelHi : ASHTAVIDHA_PARIKSHA.sparsha.labelEn}
                </label>
                <select
                  value={formData.sparshaPariksha}
                  onChange={(e) => setFormData({ ...formData, sparshaPariksha: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500 text-stone-800"
                >
                  <option value="">-- Select Sparsha --</option>
                  {ASHTAVIDHA_PARIKSHA.sparsha.options.map((opt) => (
                    <option key={opt.id} value={opt.labelEn}>
                      {language === 'hi' ? opt.labelHi : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Druk (Eyes) */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  {language === 'hi' ? ASHTAVIDHA_PARIKSHA.druk.labelHi : ASHTAVIDHA_PARIKSHA.druk.labelEn}
                </label>
                <select
                  value={formData.drukPariksha}
                  onChange={(e) => setFormData({ ...formData, drukPariksha: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500 text-stone-800"
                >
                  <option value="">-- Select Druk --</option>
                  {ASHTAVIDHA_PARIKSHA.druk.options.map((opt) => (
                    <option key={opt.id} value={opt.labelEn}>
                      {language === 'hi' ? opt.labelHi : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shabda (Voice) */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  {language === 'hi' ? ASHTAVIDHA_PARIKSHA.shabda.labelHi : ASHTAVIDHA_PARIKSHA.shabda.labelEn}
                </label>
                <select
                  value={formData.shabdaPariksha}
                  onChange={(e) => setFormData({ ...formData, shabdaPariksha: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500 text-stone-800"
                >
                  <option value="">-- Select Shabda --</option>
                  {ASHTAVIDHA_PARIKSHA.shabda.options.map((opt) => (
                    <option key={opt.id} value={opt.labelEn}>
                      {language === 'hi' ? opt.labelHi : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aakriti (Build) */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  {language === 'hi' ? ASHTAVIDHA_PARIKSHA.aakriti.labelHi : ASHTAVIDHA_PARIKSHA.aakriti.labelEn}
                </label>
                <select
                  value={formData.aakritiPariksha}
                  onChange={(e) => setFormData({ ...formData, aakritiPariksha: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500 text-stone-800"
                >
                  <option value="">-- Select Aakriti --</option>
                  {ASHTAVIDHA_PARIKSHA.aakriti.options.map((opt) => (
                    <option key={opt.id} value={opt.labelEn}>
                      {language === 'hi' ? opt.labelHi : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setActiveTab('prakriti')}
                className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('diagnosis')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <span>Next: Dual Diagnosis →</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 4: DUAL DIAGNOSIS ================= */}
        {activeTab === 'diagnosis' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                <span>{t('tabDiagnosis')}</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Formulate Ayurvedic clinical diagnosis side-by-side with modern ICD-11 terminology.
              </p>
            </div>

            {/* Quick Common Rogas Selector */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-950">
                  Quick Roga & ICD-11 Library (Click to apply)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {COMMON_ROGAS.map((r) => (
                  <button
                    key={r.ayurvedic}
                    type="button"
                    onClick={() => handleSelectRoga(r)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-950 shadow-2xs transition flex items-center gap-1"
                  >
                    <span>{r.ayurvedic}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dual Diagnosis Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-emerald-950">
                  {t('ayurvedicDiagnosisLabel')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ayurvedicDiagnosis}
                  onChange={(e) => setFormData({ ...formData, ayurvedicDiagnosis: e.target.value })}
                  placeholder="e.g. Amavata / Sandhigatavata / Amlapitta"
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-stone-900"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-800">
                  {t('modernDiagnosisLabel')}
                </label>
                <input
                  type="text"
                  value={formData.modernDiagnosis}
                  onChange={(e) => setFormData({ ...formData, modernDiagnosis: e.target.value })}
                  placeholder="e.g. Rheumatoid Arthritis (ICD-11: FA20)"
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-700"
                />
              </div>
            </div>

            {/* Prognosis (Sadhya-Asadhyata) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-800">
                {t('prognosisLabel')}
              </label>
              <select
                value={formData.prognosis}
                onChange={(e) => setFormData({ ...formData, prognosis: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500 text-stone-800"
              >
                <option value="Sukha Sadhya (Easily Curable)">
                  Sukha Sadhya (Easily Curable with standard chikitsa)
                </option>
                <option value="Krichra Sadhya (Difficult to Cure / Requires intensive therapy)">
                  Krichra Sadhya (Curable with effort / Intensive panchakarma)
                </option>
                <option value="Yapya (Palliative / Manageable long-term)">
                  Yapya (Palliative / Requires continuous Rasayana & dietary compliance)
                </option>
                <option value="Asadhya (Incurable)">
                  Asadhya (Incurable / Advanced structural degeneration)
                </option>
              </select>
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setActiveTab('pariksha')}
                className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('prescription')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <span>Next: Prescription & Chikitsa →</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 5: CHIKITSA & PRESCRIPTION ================= */}
        {activeTab === 'prescription' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100">
              <div>
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-600" />
                  <span>{t('tabPrescription')}</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Prescribe Ayurvedic formulations with Anupana, recommend Panchakarma, and specify Pathya/Apathya.
                </p>
              </div>

              {/* Digitized Prescriptions 1-Click Import CTA */}
              {digitizedDocsWithMeds.length > 0 && (
                <button
                  type="button"
                  onClick={handleOpenImportModal}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs transition transform hover:-translate-y-0.5 self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Import from Digitized Records</span>
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {totalDigitizedMedsCount}
                  </span>
                </button>
              )}
            </div>

            {/* Success Toast / Notice */}
            {importSuccessMsg && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            {/* Prescription Builder */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-800">
                  {t('prescriptionLabel')} (Aushadha Sevana)
                </label>
                {digitizedDocsWithMeds.length > 0 && (
                  <span className="text-[11px] text-stone-500">
                    💡 {totalDigitizedMedsCount} medication{totalDigitizedMedsCount > 1 ? 's' : ''} available to import from uploaded records
                  </span>
                )}
              </div>
              <PrescriptionBuilder
                medicines={formData.prescription}
                onChange={(meds) => setFormData({ ...formData, prescription: meds })}
              />
            </div>

            {/* Panchakarma Advice */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800">
                  {t('panchakarmaLabel')}
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData((prev) => ({
                        ...prev,
                        panchakarmaAdvice: prev.panchakarmaAdvice
                          ? `${prev.panchakarmaAdvice}, ${e.target.value}`
                          : e.target.value,
                      }));
                    }
                  }}
                  className="text-[11px] border border-stone-300 rounded-lg px-2 py-1 bg-white"
                >
                  <option value="">+ Quick Add Therapy</option>
                  {PANCHAKARMA_THERAPIES.map((th) => (
                    <option key={th} value={th}>
                      {th}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                rows={2}
                value={formData.panchakarmaAdvice}
                onChange={(e) => setFormData({ ...formData, panchakarmaAdvice: e.target.value })}
                placeholder="e.g. Abhyanga with Mahanarayana Taila + Swedana for 7 days; Janu Basti with Murivenna..."
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Pathya (DOs) & Apathya (DONTs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-emerald-900">
                  {t('pathyaLabel')}
                </label>
                <textarea
                  rows={3}
                  value={formData.pathyaDiet}
                  onChange={(e) => setFormData({ ...formData, pathyaDiet: e.target.value })}
                  placeholder="Wholesome freshly cooked meals, cow ghee, moong dal, warm water, regular sleep..."
                  className="w-full text-xs p-3 rounded-xl border border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-rose-900">
                  {t('apathyaLabel')}
                </label>
                <textarea
                  rows={3}
                  value={formData.apathyaDiet}
                  onChange={(e) => setFormData({ ...formData, apathyaDiet: e.target.value })}
                  placeholder="Cold drinks, curd at night, dry foods, skipping meals, day sleep..."
                  className="w-full text-xs p-3 rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Dinacharya & Lifestyle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800">
                {t('lifestyleLabel')}
              </label>
              <textarea
                rows={2}
                value={formData.lifestyleAdvice}
                onChange={(e) => setFormData({ ...formData, lifestyleAdvice: e.target.value })}
                placeholder="Yoga Asanas (Tadasana, Bhujangasana), Anulom Vilom Pranayama 15 min, Abhyanga before bath..."
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Follow-up Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800">
                {t('followUpDateLabel')}
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full max-w-xs text-xs px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Submit Complete Case Record */}
            <div className="pt-6 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('diagnosis')}
                className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Record...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{t('saveCaseRecord')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= DIGITIZED PRESCRIPTIONS IMPORT MODAL ================= */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-stone-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Import Digitized Prescriptions</h3>
                  <p className="text-xs text-emerald-200/80">
                    Select verified medications from {patient?.name}'s uploaded medical records
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selection Toolbar */}
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 font-semibold text-stone-700 transition"
                >
                  {digitizedDocsWithMeds.every((dg) => dg.meds.every((m) => selectedImportMeds[m.id]))
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
                <span className="text-stone-500 font-medium">
                  {Object.values(selectedImportMeds).filter(Boolean).length} of {totalDigitizedMedsCount} medications selected
                </span>
              </div>
              <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                {digitizedDocsWithMeds.length} Document{digitizedDocsWithMeds.length > 1 ? 's' : ''} Found
              </span>
            </div>

            {/* Scrollable Medicines List */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {digitizedDocsWithMeds.map((docGroup) => (
                <div
                  key={docGroup.docId}
                  className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-stone-200/70 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {docGroup.ayushSystem}
                      </span>
                      <span className="text-xs font-bold text-stone-900">{docGroup.docTitle}</span>
                    </div>
                    <span className="text-[11px] text-stone-400">
                      {docGroup.docDate ? formatDate(docGroup.docDate) : 'Uploaded Record'}
                    </span>
                  </div>

                  {docGroup.diagnosis && (
                    <div className="text-[11px] text-stone-600 bg-white px-2.5 py-1.5 rounded-lg border border-stone-200">
                      <strong>Diagnosis:</strong> {docGroup.diagnosis}
                    </div>
                  )}

                  <div className="space-y-2">
                    {docGroup.meds.map((med) => {
                      const isSelected = !!selectedImportMeds[med.id];
                      return (
                        <div
                          key={med.id}
                          onClick={() => handleToggleMed(med.id)}
                          className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? 'bg-emerald-50/90 border-emerald-400 shadow-2xs'
                              : 'bg-white border-stone-200 hover:border-stone-300 opacity-70'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleMed(med.id)}
                            className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-stone-900">{med.name}</span>
                              {med.form && (
                                <span className="text-[10px] px-2 py-0.5 bg-emerald-100/70 text-emerald-900 rounded font-semibold">
                                  {med.form}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 text-[11px] text-stone-600 mt-1">
                              {med.dose && (
                                <span className="bg-stone-100 px-1.5 py-0.5 rounded">
                                  <strong>Dose:</strong> {med.dose}
                                </span>
                              )}
                              {med.timing && (
                                <span className="bg-stone-100 px-1.5 py-0.5 rounded">
                                  <strong>Timing:</strong> {med.timing}
                                </span>
                              )}
                              {med.anupana && (
                                <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded">
                                  🥛 <strong>Anupana:</strong> {med.anupana}
                                </span>
                              )}
                              {med.duration && (
                                <span className="bg-stone-100 px-1.5 py-0.5 rounded">
                                  ⏱️ {med.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Extra Import Options */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Additional Digitized Data:
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    checked={importIncludeDiet}
                    onChange={(e) => setImportIncludeDiet(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span>Import dietary guidelines (Pathya / Apathya) if present</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    checked={importIncludePanchakarma}
                    onChange={(e) => setImportIncludePanchakarma(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span>Import Panchakarma & procedures if present</span>
                </label>
              </div>

              {/* Medical Safety Disclaimer */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Doctor Verification Required:</strong> AI & OCR extracted information must be clinically verified against the patient's original physical records before finalizing.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-100 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={Object.values(selectedImportMeds).filter(Boolean).length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <Download className="w-4 h-4" />
                <span>
                  Import Selected ({Object.values(selectedImportMeds).filter(Boolean).length}) Medications
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
