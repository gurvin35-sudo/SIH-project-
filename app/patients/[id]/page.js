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
  Printer,
  ChevronRight,
  Loader2,
  Pill
} from 'lucide-react';
import { formatDate, formatABHA, getDoshaColor } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageContext';
import AIPatientSummaryModal from '@/components/AIPatientSummaryModal';
import AIPatientSummaryCard from '@/components/AIPatientSummaryCard';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

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

        // Fallback to locally stored patient record
        try {
          const localRaw = localStorage.getItem('ayushcase_local_patients');
          if (localRaw) {
            const list = JSON.parse(localRaw);
            const found = list.find((p) => p.id === params.id);
            if (found) {
              setPatient(found);
              return;
            }
          }
        } catch (e) {}

        setError('Patient not found');
      } catch (err) {
        // Fallback on network error
        try {
          const localRaw = localStorage.getItem('ayushcase_local_patients');
          if (localRaw) {
            const list = JSON.parse(localRaw);
            const found = list.find((p) => p.id === params.id);
            if (found) {
              setPatient(found);
              return;
            }
          }
        } catch (e) {}
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
        <p className="text-xs text-stone-500">Loading patient profile and case history...</p>
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

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button */}
      <Link
        href="/patients"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('backToPatients')}</span>
      </Link>

      {/* Patient Profile Demographics Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-herb text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-700/20">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">{patient.name}</h1>
                {patient.prakritiType && (
                  <span
                    className={`text-xs px-3 py-0.5 rounded-full font-bold border ${doshaStyle.bg} ${doshaStyle.text} ${doshaStyle.border}`}
                  >
                    ✨ {patient.prakritiType}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {patient.gender} • {patient.age} Years • Registered {formatDate(patient.createdAt)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => setSummaryModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-800 to-herb text-white hover:from-emerald-900 hover:to-emerald-950 shadow-md shadow-emerald-900/20 transition transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>AI Handover Summary</span>
            </button>

            {/* New Case Button */}
            <Link
              href={`/patients/${patient.id}/case-taking`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition transform hover:-translate-y-0.5"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>+ Start New Case Record</span>
            </Link>
          </div>
        </div>

        {/* Demographics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Contact */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-[10px] uppercase font-semibold block">Contact Number</span>
            <span className="font-bold text-stone-800 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              {patient.contact}
            </span>
          </div>

          {/* ABHA ID */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1">
            <span className="text-emerald-800 text-[10px] uppercase font-bold block flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              ABHA ID (Ayushman)
            </span>
            <span className="font-bold text-emerald-950 font-mono text-xs">
              {patient.abhaId ? formatABHA(patient.abhaId) : 'Not provided'}
            </span>
          </div>

          {/* Blood Group */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-[10px] uppercase font-semibold block">Blood Group</span>
            <span className="font-bold text-stone-800">
              {patient.bloodGroup || 'Not specified'}
            </span>
          </div>

          {/* Known Allergies */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-[10px] uppercase font-semibold block">Known Allergies</span>
            <span className="font-bold text-rose-700">
              {patient.allergies || 'None reported'}
            </span>
          </div>
        </div>

        {patient.address && (
          <div className="text-xs text-stone-600 flex items-center gap-1.5 pt-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Address: {patient.address}</span>
          </div>
        )}
      </div>

      {/* AI Clinical Handover Summary Card */}
      <AIPatientSummaryCard patient={patient} />

      {/* Longitudinal Case History Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-black text-stone-900 tracking-tight">
              Clinical Case History Timeline ({patient.cases?.length || 0} visits)
            </h2>
          </div>
        </div>

        {(!patient.cases || patient.cases.length === 0) ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-bold text-base text-stone-800">No case records yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Start the first clinical consultation for {patient.name} to document complaints, Prakriti,
              Ashtavidha Pariksha, and prescription.
            </p>
            <Link
              href={`/patients/${patient.id}/case-taking`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 transition"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Record First Case</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {patient.cases.map((caseItem, idx) => {
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
                  {/* Visit Date & Diagnosis Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                        #{patient.cases.length - idx}
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
                        <span>View / Print Sheet</span>
                      </Link>
                    </div>
                  </div>

                  {/* Chief Complaint & Diagnoses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Chief Complaint */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400">
                        Chief Complaints:
                      </span>
                      <p className="text-stone-800 font-medium leading-relaxed">
                        {caseItem.chiefComplaint}
                      </p>
                      {caseItem.duration && (
                        <p className="text-[11px] text-stone-500">Duration: {caseItem.duration}</p>
                      )}
                    </div>

                    {/* Dual Diagnosis */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-800">
                          Ayurvedic Diagnosis (Roga):
                        </span>
                        <div className="font-bold text-stone-900 text-xs">
                          {caseItem.ayurvedicDiagnosis}
                        </div>
                      </div>
                      {caseItem.modernDiagnosis && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-400">
                            Modern / ICD-11:
                          </span>
                          <div className="text-stone-600 text-[11px]">
                            {caseItem.modernDiagnosis}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pariksha Mini Badges */}
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    {caseItem.nadiPariksha && (
                      <span className="px-2 py-1 rounded bg-stone-100 text-stone-700 border border-stone-200">
                        <strong>Nadi:</strong> {caseItem.nadiPariksha.split('(')[0]}
                      </span>
                    )}
                    {caseItem.jihvaPariksha && (
                      <span className="px-2 py-1 rounded bg-stone-100 text-stone-700 border border-stone-200">
                        <strong>Jihva:</strong> {caseItem.jihvaPariksha.split('(')[0]}
                      </span>
                    )}
                    {caseItem.malaPariksha && (
                      <span className="px-2 py-1 rounded bg-stone-100 text-stone-700 border border-stone-200">
                        <strong>Mala:</strong> {caseItem.malaPariksha.split('(')[0]}
                      </span>
                    )}
                    {caseItem.agniType && (
                      <span className="px-2 py-1 rounded bg-stone-100 text-stone-700 border border-stone-200">
                        <strong>Agni:</strong> {caseItem.agniType}
                      </span>
                    )}
                  </div>

                  {/* Medicines Summary */}
                  {meds.length > 0 && (
                    <div className="pt-2 border-t border-stone-100">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                        Prescribed Medicines ({meds.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {meds.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200"
                          >
                            <Pill className="w-3 h-3 text-emerald-600" />
                            <span>{m.name} ({m.dose || 'Standard'})</span>
                          </span>
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
