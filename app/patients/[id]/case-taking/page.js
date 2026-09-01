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
  Info
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
        setPatient(data.patient);

        // Pre-populate if patient already had a prakriti
        if (data.patient?.prakritiType) {
          setFormData((prev) => ({
            ...prev,
            prakritiResult: data.patient.prakritiType,
          }));
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
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 font-semibold text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

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
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                <span>{t('tabPrescription')}</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Prescribe Ayurvedic formulations with Anupana, recommend Panchakarma, and specify Pathya/Apathya.
              </p>
            </div>

            {/* Prescription Builder */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-800">
                {t('prescriptionLabel')} (Aushadha Sevana)
              </label>
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
    </div>
  );
}
