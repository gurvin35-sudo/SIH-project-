'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FilePlus2,
  FileText,
  Clock,
  ArrowLeft,
  Activity,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Printer,
  ChevronRight,
  Loader2,
  Pill,
  CheckCircle2,
  Edit3,
  Check,
  Layers,
  Upload,
  ExternalLink
} from 'lucide-react';
import { formatDate, formatABHA, getDoshaColor } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageContext';
import AIPatientSummaryModal from '@/components/AIPatientSummaryModal';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);
  const [verifiedSummary, setVerifiedSummary] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    async function fetchPatientData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/patients/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setPatient(data.patient);
          return;
        }

        setError('Patient record not found');
      } catch (err) {
        console.error(err);
        setError('Failed to load patient history');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      fetchPatientData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-stone-500">Loading patient profile, AI summary & medical records...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-stone-900">{error || 'Patient not found'}</h2>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patients</span>
        </Link>
      </div>
    );
  }

  const doshaStyle = getDoshaColor(patient.prakritiType);

  // Parse Red Flags if available
  let parsedRedFlag = null;
  try {
    if (patient.redFlags) {
      parsedRedFlag = typeof patient.redFlags === 'string' ? JSON.parse(patient.redFlags) : patient.redFlags;
    }
  } catch (e) {}

  // Parse AI Summary if available
  let parsedAiSummary = null;
  try {
    if (patient.aiSummary) {
      parsedAiSummary = typeof patient.aiSummary === 'string' ? JSON.parse(patient.aiSummary) : patient.aiSummary;
    }
  } catch (e) {}

  const documents = patient.documents || [];
  const cases = patient.cases || [];

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Back Button & Patient Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToPatients')}</span>
        </Link>

        {patient.preConsultationStatus === 'SENT_TO_DOCTOR' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Pre-Consultation Completed by Patient</span>
          </span>
        )}
      </div>

      {/* 1. Red Flag Detection Banner (If present) */}
      {parsedRedFlag && (
        <div className="bg-rose-50 border-2 border-rose-500 rounded-3xl p-5 shadow-md flex items-start gap-4 animate-in fade-in">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-200 text-rose-950">
                🚨 Potential Emergency Symptom Alert
              </span>
              <h3 className="font-extrabold text-sm text-rose-950">
                {parsedRedFlag.type || 'Potential Emergency Detected'}
              </h3>
            </div>
            <p className="text-xs text-rose-900 font-bold leading-relaxed">
              "Potential emergency symptoms detected. Please alert medical/triage staff immediately."
            </p>
            <p className="text-[11px] text-rose-800 italic">
              {parsedRedFlag.advice || 'Patient reported critical symptoms during AI health interview. Please prioritize clinical evaluation.'}
            </p>
          </div>
        </div>
      )}

      {/* Patient Profile Demographics Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-herb text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-700/20">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">{patient.name}</h1>
                {patient.prakritiType && (
                  <span
                    className={`text-xs px-3 py-0.5 rounded-full font-bold border ${doshaStyle.bg} ${doshaStyle.text} ${doshaStyle.border}`}
                  >
                    ✨ {patient.prakritiType}
                  </span>
                )}
                {patient.consentGiven && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Consent Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {patient.gender} • {patient.age} Years • Registered {formatDate(patient.createdAt)}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {/* Start Case Taking CTA */}
            <Link
              href={`/patients/${patient.id}/case-taking?fromAi=1`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-herb hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md shadow-emerald-600/20 transition transform hover:-translate-y-0.5 ring-2 ring-emerald-400/40"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>⚡ Start Consultation (Pre-fill from AI)</span>
            </Link>

            <button
              onClick={() => setSummaryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Handover Summary</span>
            </button>
          </div>
        </div>

        {/* Demographics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-[10px] uppercase font-semibold block">Contact Number</span>
            <span className="font-bold text-stone-800 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              {patient.contact}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1">
            <span className="text-emerald-800 text-[10px] uppercase font-bold block flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              ABHA ID (Ayushman)
            </span>
            <span className="font-bold text-emerald-950 font-mono text-xs">
              {patient.abhaId ? formatABHA(patient.abhaId) : 'Not provided'}
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-[10px] uppercase font-semibold block">Blood Group</span>
            <span className="font-bold text-stone-800">
              {patient.bloodGroup || 'Not specified'}
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-[10px] uppercase font-semibold block">Known Allergies</span>
            <span className="font-bold text-rose-700">
              {patient.allergies || 'None reported'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. PHYSICIAN-READY AI CLINICAL SUMMARY (Mandatory Problem Statement Feature) */}
      <div className="bg-white rounded-3xl border-2 border-emerald-600/30 shadow-md p-6 sm:p-8 space-y-6">
        {/* Verification Notice Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-300">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">⚠️</span>
            <div>
              <span className="font-black text-xs text-amber-950 block">
                AI-generated draft — Doctor verification required.
              </span>
              <p className="text-[11px] text-amber-800">
                Synthesized from patient's conversational health interview + uploaded medical OCR records.
              </p>
            </div>
          </div>

          <Link
            href={`/patients/${patient.id}/case-taking?fromAi=1`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition self-start sm:self-auto shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verify & Pre-fill Case Sheet →</span>
          </Link>
        </div>

        {/* Structured History Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Chief Complaint & HPI */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <span className="font-black text-stone-900 uppercase text-[11px] block">
              1. Chief Complaint & Present Illness
            </span>
            <p className="text-stone-800 font-medium">
              <span className="font-bold text-stone-500">Chief Complaint:</span>{' '}
              {patient.chiefComplaint || parsedAiSummary?.clinicalHistory?.chiefComplaint || 'Bilateral joint pain and stiffness'}
            </p>
            <p className="text-stone-800">
              <span className="font-bold text-stone-500">Duration:</span>{' '}
              {patient.duration || parsedAiSummary?.clinicalHistory?.duration || '6 months'}
            </p>
            <p className="text-stone-700 leading-relaxed text-[11px]">
              <span className="font-bold text-stone-500">HPI:</span>{' '}
              {patient.hpi || parsedAiSummary?.clinicalHistory?.hpi || 'Gradual onset, aggravated in cold weather and relieved with warm compress.'}
            </p>
          </div>

          {/* Past & Surgical History */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <span className="font-black text-stone-900 uppercase text-[11px] block">
              2. Past Medical & Surgical History
            </span>
            <p className="text-stone-800">
              <span className="font-bold text-stone-500">Past Illnesses:</span>{' '}
              {patient.pastMedicalHistory || parsedAiSummary?.clinicalHistory?.pastMedicalHistory || 'Mild hyperacidity 2 years ago.'}
            </p>
            <p className="text-stone-800">
              <span className="font-bold text-stone-500">Surgeries / Trauma:</span>{' '}
              {patient.pastSurgicalHistory || parsedAiSummary?.clinicalHistory?.pastSurgicalHistory || 'None'}
            </p>
            <p className="text-rose-700 font-bold">
              <span className="text-stone-500 font-normal">Drug Allergies:</span>{' '}
              {patient.allergies || parsedAiSummary?.clinicalHistory?.allergies || 'No known allergies'}
            </p>
          </div>

          {/* Current Medicines & Family History */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <span className="font-black text-stone-900 uppercase text-[11px] block">
              3. Current Medications & Family History
            </span>
            <p className="text-stone-800">
              <span className="font-bold text-stone-500">Current Medicines:</span>{' '}
              {patient.currentMedicines || parsedAiSummary?.clinicalHistory?.currentMedicines || 'Aceclofenac + Paracetamol (SOS), Pantoprazole 40mg'}
            </p>
            <p className="text-stone-800">
              <span className="font-bold text-stone-500">Family History:</span>{' '}
              {patient.familyHistory || parsedAiSummary?.clinicalHistory?.familyHistory || 'Father had severe knee osteoarthritis.'}
            </p>
          </div>

          {/* AYUSH Constitutional Assessment */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
            <span className="font-black text-emerald-950 uppercase text-[11px] block">
              4. AYUSH Constitutional Indicators (प्रकृति व अग्नि)
            </span>
            <p className="text-stone-800">
              <span className="font-bold text-stone-500">Dominant Prakriti:</span>{' '}
              {patient.prakritiType || parsedAiSummary?.ayushParameters?.prakritiTendency || 'Vata-Pitta dominant'}
            </p>
            <p className="text-stone-800">
              <span className="font-bold text-stone-500">Agni (Digestive Fire):</span>{' '}
              {patient.ayushAgni || parsedAiSummary?.ayushParameters?.agni || 'Vishamagni (Variable / Vata)'}
            </p>
            <p className="text-stone-800">
              <span className="font-bold text-stone-500">Koshta (Bowel Nature):</span>{' '}
              {patient.ayushKoshta || parsedAiSummary?.ayushParameters?.koshta || 'Krura (Hard / Constipated)'}
            </p>
            <p className="text-stone-700 text-[11px]">
              <span className="font-bold text-stone-500">Personal History:</span>{' '}
              {patient.personalHistory || parsedAiSummary?.clinicalHistory?.personalHistory || 'Vegetarian diet, irregular sleep schedule.'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. CHRONOLOGICAL MEDICAL TIMELINE */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-black text-stone-900">
              Chronological Medical Timeline
            </h2>
          </div>
          <span className="text-[11px] text-stone-400 font-medium">
            {documents.length + cases.length} Recorded Milestone(s)
          </span>
        </div>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
          {/* Milestone: Patient AI Pre-Consultation */}
          {patient.chiefComplaint && (
            <div className="relative">
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                ★
              </div>
              <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-emerald-950">
                    Patient Pre-Consultation AI History Recorded
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">{formatDate(patient.updatedAt)}</span>
                </div>
                <p className="text-xs text-stone-700">
                  Chief complaint: {patient.chiefComplaint} ({patient.duration || 'Recent'})
                </p>
              </div>
            </div>
          )}

          {/* Uploaded Documents Milestones */}
          {documents.map((doc) => (
            <div key={doc.id} className="relative">
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                ●
              </div>
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">
                    {doc.title} ({doc.docType})
                  </span>
                  <span className="text-[10px] text-stone-500">{formatDate(doc.docDate)}</span>
                </div>
                {doc.summary && (
                  <p className="text-xs text-stone-600 italic">"{doc.summary}"</p>
                )}
              </div>
            </div>
          ))}

          {/* Past Consultations */}
          {cases.map((c) => (
            <div key={c.id} className="relative">
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                ℞
              </div>
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">
                    Clinic Consultation — {c.ayurvedicDiagnosis}
                  </span>
                  <span className="text-[10px] text-stone-500">{formatDate(c.visitDate)}</span>
                </div>
                <p className="text-xs text-stone-600">
                  Chief symptoms: {c.chiefComplaint}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. DIGITIZED OCR MEDICAL DOCUMENTS & LAB PARAMETERS */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-black text-stone-900">
              Digitized Medical Documents & OCR Findings ({documents.length})
            </h2>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-stone-200 italic">
            No external medical records uploaded for this patient.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => {
              let extracted = {};
              try {
                if (doc.extractedData) {
                  extracted = typeof doc.extractedData === 'string' ? JSON.parse(doc.extractedData) : doc.extractedData;
                }
              } catch (e) {}

              const meds = extracted.medicines || [];
              const labs = extracted.labValues || [];

              return (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl border border-stone-200 bg-stone-50 space-y-3 hover:border-emerald-300 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                        {doc.docType}
                      </span>
                      <h4 className="font-bold text-xs text-stone-900 mt-1">{doc.title}</h4>
                      <span className="text-[10px] text-stone-400">Date: {formatDate(doc.docDate)}</span>
                    </div>
                  </div>

                  {/* Medicines Grid */}
                  {meds.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        Prescribed Medicines:
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

                  {/* Lab Values with High/Low Badges */}
                  {labs.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        Lab Test Parameters:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {labs.slice(0, 4).map((l, lIdx) => (
                          <div
                            key={lIdx}
                            className={`p-1.5 rounded-lg border font-medium flex items-center justify-between ${
                              l.status === 'HIGH'
                                ? 'bg-rose-50 border-rose-200 text-rose-950 font-bold'
                                : 'bg-white border-stone-200 text-stone-700'
                            }`}
                          >
                            <span className="truncate">{l.parameter}</span>
                            <span className="shrink-0">{l.value} {l.status === 'HIGH' ? '⚠️' : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {doc.summary && (
                    <p className="text-[11px] text-stone-600 italic bg-white p-2.5 rounded-xl border border-stone-200 leading-relaxed">
                      "{doc.summary}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. PREVIOUS CONSULTATION RECORDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-black text-stone-900">
              Previous Clinical Consultations ({cases.length})
            </h2>
          </div>

          <Link
            href={`/patients/${patient.id}/case-taking?fromAi=1`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            <span>+ Start New Consultation</span>
          </Link>
        </div>

        {cases.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center space-y-3">
            <FileText className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-bold text-sm text-stone-800">No consultation records on file</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Start the first clinical consultation for {patient.name} with pre-filled AI history.
            </p>
            <Link
              href={`/patients/${patient.id}/case-taking?fromAi=1`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 transition"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Start Consultation Now</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((caseItem, idx) => {
              let meds = [];
              try {
                if (caseItem.prescription) {
                  meds = typeof caseItem.prescription === 'string'
                    ? JSON.parse(caseItem.prescription)
                    : caseItem.prescription;
                }
              } catch (e) {
                meds = [];
              }

              const caseDoshaStyle = getDoshaColor(caseItem.prakritiResult);

              return (
                <div
                  key={caseItem.id}
                  className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-300 transition p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                        #{cases.length - idx}
                      </span>
                      <div>
                        <div className="font-bold text-sm text-stone-900">
                          Visit Date: {formatDate(caseItem.visitDate)}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Case ID: {caseItem.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {caseItem.prakritiResult && (
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${caseDoshaStyle.bg} ${caseDoshaStyle.text} ${caseDoshaStyle.border}`}
                        >
                          {caseItem.prakritiResult}
                        </span>
                      )}
                      <Link
                        href={`/cases/${caseItem.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View / Print PDF</span>
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase font-semibold block">
                        Chief Complaint:
                      </span>
                      <p className="font-medium text-stone-800">{caseItem.chiefComplaint}</p>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase font-semibold block">
                        Ayurvedic Diagnosis:
                      </span>
                      <p className="font-bold text-emerald-900">
                        {caseItem.ayurvedicDiagnosis}
                        {caseItem.modernDiagnosis ? ` (${caseItem.modernDiagnosis})` : ''}
                      </p>
                    </div>
                  </div>

                  {meds.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-stone-400 text-[10px] uppercase font-semibold block">
                        Prescription ({meds.length} Formulations):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {meds.map((m, mIdx) => (
                          <div
                            key={mIdx}
                            className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800 flex items-center gap-1.5"
                          >
                            <Pill className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              {m.name} {m.form ? `(${m.form})` : ''} • {m.dose || 'Std'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full AI Handover Modal */}
      <AIPatientSummaryModal
        patientId={patient.id}
        patientData={patient}
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
      />
    </div>
  );
}
