'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Printer,
  ChevronRight,
  FileText,
  AlertTriangle,
  Pill,
  Activity,
  ArrowRight
} from 'lucide-react';
import AIPatientSummaryModal from './AIPatientSummaryModal';

export default function AIPatientSummaryCard({
  patient,
  isPatientPortal = false,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!patient) return null;

  const totalCases = patient.cases?.length || 0;
  const latestCase = patient.cases?.[0] || null;

  return (
    <>
      <div className="bg-gradient-to-br from-emerald-900 via-herb to-emerald-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-emerald-700/60 relative overflow-hidden space-y-4">
        {/* Subtle Ambient Glow */}
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  {isPatientPortal ? 'AI Portable Medical Passport' : 'AI Clinical Transfer & Handover'}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  Instant Doctor Transition
                </span>
              </div>
              <p className="text-xs text-emerald-100/70">
                {isPatientPortal
                  ? 'Show or share this comprehensive summary if you visit a new doctor or hospital'
                  : 'AI-synthesized longitudinal history, Prakriti, active prescriptions, and cautions for doctor handovers'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-white text-emerald-900 hover:bg-emerald-50 shadow-md shadow-emerald-950/30 transition transform hover:-translate-y-0.5 self-start sm:self-auto shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isPatientPortal ? 'View Medical Passport' : 'Generate Doctor Handover'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 relative z-10 text-xs">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <span className="text-emerald-300 text-[10px] uppercase font-semibold block">Constitution</span>
            <span className="font-bold text-white truncate block">
              {patient.prakritiType || latestCase?.prakritiResult || 'Tridoshic'}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <span className="text-emerald-300 text-[10px] uppercase font-semibold block">Total Consultations</span>
            <span className="font-bold text-white block">{totalCases} Visit{totalCases === 1 ? '' : 's'}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <span className="text-emerald-300 text-[10px] uppercase font-semibold block">Latest Roga</span>
            <span className="font-bold text-white truncate block">
              {latestCase?.ayurvedicDiagnosis || 'General Assessment'}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <span className="text-emerald-300 text-[10px] uppercase font-semibold block">Allergies / Cautions</span>
            <span className={`font-bold truncate block ${patient.allergies ? 'text-amber-200' : 'text-emerald-100'}`}>
              {patient.allergies || 'None reported'}
            </span>
          </div>
        </div>
      </div>

      {/* Full Modal */}
      <AIPatientSummaryModal
        patientId={patient.id}
        patientData={patient}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isPatientPortal={isPatientPortal}
      />
    </>
  );
}
