'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  User,
  HeartPulse,
  Pill,
  Printer,
  Calendar,
  Sparkles,
  Phone,
  Clock,
  LogOut,
  FileText,
  Loader2,
  AlertCircle,
  Leaf,
  CheckCircle2
} from 'lucide-react';
import { formatDate, formatABHA, getDoshaColor } from '@/lib/utils';
import { DIET_PRESETS } from '@/lib/ayush-data';
import AIPatientSummaryCard from '@/components/AIPatientSummaryCard';
import AIPatientSummaryModal from '@/components/AIPatientSummaryModal';

export default function PatientPortalPage() {
  const params = useParams();
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  useEffect(() => {
    async function loadPatientPortalData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/patients/${params.id}`);
        if (!res.ok) {
          setError('Patient record not found');
          return;
        }
        const data = await res.json();
        setPatient(data.patient);
      } catch (err) {
        setError('Failed to load patient records');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      loadPatientPortalData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-stone-500">Loading your AyushCase Health Records...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-stone-900">{error || 'Patient not found'}</h2>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          <span>Back to Login</span>
        </Link>
      </div>
    );
  }

  const doshaStyle = getDoshaColor(patient.prakritiType);

  // Get diet guidance
  let dietAdvice = DIET_PRESETS.general;
  if (patient.prakritiType?.includes('Vata')) dietAdvice = DIET_PRESETS.vata;
  else if (patient.prakritiType?.includes('Pitta')) dietAdvice = DIET_PRESETS.pitta;
  else if (patient.prakritiType?.includes('Kapha')) dietAdvice = DIET_PRESETS.kapha;

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-herb text-white flex items-center justify-center font-black text-lg shadow-sm">
            {patient.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-stone-900">{patient.name}</h1>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Patient Portal
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {patient.gender}, {patient.age} Yrs • Contact: {patient.contact}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setSummaryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-700 to-herb text-white hover:from-emerald-800 hover:to-emerald-900 shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>AI Medical Passport</span>
          </button>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Portal</span>
          </Link>
        </div>
      </div>

      {/* ABHA Digital Health Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-herb to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/60 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-200">
                Ayushman Bharat Digital Health Record
              </span>
            </div>

            <div>
              <span className="text-[10px] text-stone-300 uppercase block font-semibold">
                ABHA Number (आभा पहचान)
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-amber-300">
                {patient.abhaId ? formatABHA(patient.abhaId) : '91-XXXX-XXXX-XXXX'}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-xs pt-1 text-emerald-100">
              <div>
                <span className="text-[10px] text-stone-300 block">Full Name:</span>
                <span className="font-bold">{patient.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-300 block">Gender / Age:</span>
                <span className="font-bold">{patient.gender} / {patient.age} Yrs</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-300 block">Blood Group:</span>
                <span className="font-bold">{patient.bloodGroup || '—'}</span>
              </div>
            </div>
          </div>

          {/* Prakriti Badge on Health Card */}
          <div className="bg-emerald-800/80 backdrop-blur-sm p-4 rounded-2xl border border-emerald-600/60 text-center shrink-0">
            <span className="text-[10px] uppercase font-bold text-amber-200 block mb-1">
              Your Ayurvedic Prakriti
            </span>
            <div className="text-base font-black text-white">
              {patient.prakritiType || 'Tridoshic (Balanced)'}
            </div>
            <span className="text-[10px] text-emerald-300 block mt-1">
              Personalized Constitution
            </span>
          </div>
        </div>
      </div>

      {/* AI Doctor Handover & Portable Medical Passport Card */}
      <AIPatientSummaryCard patient={patient} isPatientPortal={true} />

      {/* Personalized Ahara & Vihara Lifestyle Tips */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
            Your Ayurvedic Dietary (Pathya) & Lifestyle Guide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1.5">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recommended Foods (Pathya - सेवन योग्य)</span>
            </div>
            <p className="text-stone-700 leading-relaxed text-[11px]">{dietAdvice.pathya}</p>
          </div>

          <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-200 space-y-1.5">
            <div className="font-bold text-rose-950 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                ✕
              </span>
              <span>Foods to Avoid (Apathya - त्याज्य)</span>
            </div>
            <p className="text-stone-700 leading-relaxed text-[11px]">{dietAdvice.apathya}</p>
          </div>
        </div>
      </div>

      {/* Consultation Records & Prescriptions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-700" />
          <h2 className="text-base font-black text-stone-900">
            Your Prescriptions & Case History ({patient.cases?.length || 0} visits)
          </h2>
        </div>

        {(!patient.cases || patient.cases.length === 0) ? (
          <div className="p-10 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-400 italic">
            No consultation records on file yet.
          </div>
        ) : (
          <div className="space-y-4">
            {patient.cases.map((c, idx) => {
              let meds = [];
              try {
                if (c.prescription) {
                  meds = typeof c.prescription === 'string'
                    ? JSON.parse(c.prescription)
                    : c.prescription;
                }
              } catch (e) {
                meds = [];
              }

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4 hover:border-emerald-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div>
                      <div className="font-bold text-sm text-stone-900">
                        Consultation on {formatDate(c.visitDate)}
                      </div>
                      <div className="text-xs font-semibold text-emerald-800">
                        Diagnosis: {c.ayurvedicDiagnosis} {c.modernDiagnosis ? `(${c.modernDiagnosis})` : ''}
                      </div>
                    </div>

                    <Link
                      href={`/cases/${c.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition self-start sm:self-auto"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View & Download PDF</span>
                    </Link>
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400">
                      Chief Symptoms:
                    </span>
                    <p className="text-stone-700 font-medium">{c.chiefComplaint}</p>
                  </div>

                  {/* Medicines List */}
                  {meds.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        Prescribed Medicines ({meds.length}):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {meds.map((m, mIdx) => (
                          <div
                            key={mIdx}
                            className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2"
                          >
                            <Pill className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-xs text-stone-900">
                                {m.name} {m.form ? `(${m.form})` : ''}
                              </div>
                              <div className="text-[11px] text-stone-500">
                                Dose: {m.dose || 'Standard'} • Timing: {m.timing || 'After food'}
                              </div>
                              {m.anupana && (
                                <div className="text-[10px] text-emerald-800">
                                  With: {m.anupana}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {c.followUpDate && (
                    <div className="text-xs font-semibold text-purple-700 pt-1">
                      📅 Recommended Next Follow-up: {formatDate(c.followUpDate)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Portable Medical Passport AI Modal */}
      <AIPatientSummaryModal
        patientId={patient.id}
        patientData={patient}
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        isPatientPortal={true}
      />
    </div>
  );
}
