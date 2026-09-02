'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ShieldCheck,
  User,
  HeartPulse,
  Pill,
  AlertTriangle,
  FileText,
  Printer,
  Copy,
  Check,
  Clock,
  Activity,
  X,
  RefreshCw,
  Globe,
  Stethoscope,
  ChevronRight,
  Flame,
  Leaf
} from 'lucide-react';
import { formatDate, formatABHA, getDoshaColor } from '@/lib/utils';

export default function AIPatientSummaryModal({
  patientId,
  patientData = null,
  isOpen,
  onClose,
  isPatientPortal = false,
}) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('brief');
  const [language, setLanguage] = useState('en');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    if (isOpen && patientId) {
      loadSummary();
    }
  }, [isOpen, patientId, language]);

  async function loadSummary() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/patients/${patientId}/ai-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, doctorNotes }),
      });
      if (!res.ok) {
        throw new Error('Failed to generate summary');
      }
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      setError('Unable to synthesize AI Clinical Summary at this moment.');
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = () => {
    if (!summary) return;
    const textToCopy = `=========================================
AYUSHCASE AI CLINICAL HANDOVER SUMMARY
Transfer of Care & Medical Record Synthesis
=========================================
Patient: ${summary.patientName} (${summary.age} Yrs, ${summary.gender})
ABHA ID: ${summary.abhaId ? formatABHA(summary.abhaId) : 'N/A'}
Constitution (Prakriti): ${summary.prakriti}
Total Recorded Visits: ${summary.totalVisits}
Last Visit: ${formatDate(summary.lastVisitDate)}
Allergies / Cautions: ${summary.allergies}

CLINICAL SYNOPSIS:
${summary.executiveBrief}

PRIMARY DIAGNOSES:
Ayurvedic: ${summary.primaryAyurvedicDiagnoses.join(', ') || 'N/A'}
Modern: ${summary.primaryModernDiagnoses.join(', ') || 'N/A'}

PARIKSHA & BIO-ENERGY:
Agni: ${summary.parikshaTrends.agni} | Koshta: ${summary.parikshaTrends.koshta}
Nadi: ${summary.parikshaTrends.nadi} | Jihva: ${summary.parikshaTrends.jihva}

ACTIVE MEDICATIONS (${summary.activePrescriptions?.length || 0}):
${summary.activePrescriptions?.map((m, i) => `${i + 1}. ${m.name} - ${m.dose || 'Std'} (${m.timing || 'As directed'}) Anupana: ${m.anupana || 'Water'}`).join('\n') || 'None'}

RECOMMENDED ACTION PLAN:
${summary.recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n')}

${doctorNotes ? `TRANSFERRING DOCTOR REMARKS:\n${doctorNotes}\n` : ''}
Generated via AyushCase Clinical Intelligence on ${new Date().toLocaleDateString()}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const doshaStyle = getDoshaColor(summary?.prakriti || patientData?.prakritiType);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Header (Screen View) */}
        <div className="bg-gradient-to-r from-emerald-900 via-herb to-emerald-950 text-white p-5 sm:p-6 flex items-start justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-black tracking-tight text-white">
                  {isPatientPortal ? 'AI Portable Health Passport' : 'AI Clinical Transfer Summary'}
                </h2>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Doctor-to-Doctor Handover
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Instant synthesis for incoming practitioners & cross-clinic consultations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-1.5 transition text-emerald-100"
              title="Switch English / Hindi"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <span>{language === 'en' ? 'हिन्दी में देखें' : 'View in English'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {[
              { id: 'brief', label: 'Handover Synopsis', icon: FileText },
              { id: 'rx', label: `Active Rx (${summary?.activePrescriptions?.length || 0})`, icon: Pill },
              { id: 'pariksha', label: 'Prakriti & Pariksha', icon: Activity },
              { id: 'cautions', label: 'Alerts & Action Plan', icon: AlertTriangle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold transition shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Handover Slip</span>
            </button>

            <button
              onClick={loadSummary}
              disabled={loading}
              className="p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 disabled:opacity-50 transition"
              title="Refresh Analysis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Modal Body / Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 print:p-0 print:overflow-visible" ref={printRef}>
          
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-black text-stone-800 text-base">Synthesizing Clinical AI Summary...</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Correlating longitudinal case visits, Prakriti bio-energy, Ashtavidha Pariksha, and active medications.
              </p>
            </div>
          ) : error ? (
            <div className="p-8 text-center space-y-3 bg-rose-50 rounded-2xl border border-rose-200">
              <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
              <p className="text-sm font-bold text-rose-900">{error}</p>
              <button
                onClick={loadSummary}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Try Again
              </button>
            </div>
          ) : summary ? (
            <>
              {/* PRINT-ONLY OFFICIAL HEADER */}
              <div className="hidden print:block mb-6 pb-4 border-b-2 border-stone-800 text-stone-900">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-black uppercase tracking-wide">
                      Ministry of Ayush • Clinical Transfer of Care Record
                    </h1>
                    <p className="text-xs text-stone-600">
                      AyushCase AI Health Passport & Inter-Doctor Handover Protocol
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-mono font-bold">Transfer Date: {new Date().toLocaleDateString()}</p>
                    <p className="text-[10px] text-stone-500">Security Hash: {summary.patientId.slice(0, 12)}</p>
                  </div>
                </div>
              </div>

              {/* Patient Identity & Meta Strip */}
              <div className="bg-gradient-to-br from-stone-50 to-stone-100/80 rounded-2xl p-4 sm:p-5 border border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                    {summary.patientName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-black text-stone-900">{summary.patientName}</span>
                      <span className="text-xs text-stone-500">
                        ({summary.gender}, {summary.age} Yrs)
                      </span>
                      {summary.prakriti && (
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${doshaStyle.bg} ${doshaStyle.text} ${doshaStyle.border}`}>
                          ✨ {summary.prakriti}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1 flex-wrap">
                      <span>Blood Group: <strong>{summary.bloodGroup}</strong></span>
                      <span>•</span>
                      <span>Total Visits: <strong>{summary.totalVisits}</strong></span>
                      <span>•</span>
                      <span>Last Seen: <strong>{formatDate(summary.lastVisitDate)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="text-left md:text-right text-xs space-y-1 bg-white p-3 rounded-xl border border-stone-200/80">
                  <div className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                    ABHA Health ID
                  </div>
                  <div className="font-mono font-bold text-emerald-900 text-xs">
                    {summary.abhaId ? formatABHA(summary.abhaId) : 'Not Linked'}
                  </div>
                </div>
              </div>

              {/* TAB 1: EXECUTIVE BRIEF & TIMELINE */}
              {(activeTab === 'brief' || typeof window !== 'undefined') && (
                <div className={`space-y-6 ${activeTab !== 'brief' ? 'hidden print:block' : ''}`}>
                  
                  {/* Executive Handover Narrative */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        Executive Clinical Handover Synopsis
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200/60 text-emerald-900 rounded-md">
                        AI Confidence: {summary.confidenceScore}%
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                      {summary.executiveBrief}
                    </p>
                  </div>

                  {/* Primary Diagnoses Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider block">
                        Ayurvedic Diagnosis History (Roga)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {summary.primaryAyurvedicDiagnoses?.length > 0 ? (
                          summary.primaryAyurvedicDiagnoses.map((d, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-900 font-bold text-xs border border-emerald-200">
                              🌿 {d}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-stone-500 italic">No formal roga logged yet</span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase text-stone-500 tracking-wider block">
                        Modern / ICD-11 Correlates
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {summary.primaryModernDiagnoses?.length > 0 ? (
                          summary.primaryModernDiagnoses.map((d, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-stone-200/80 text-stone-800 font-bold text-xs border border-stone-300">
                              📋 {d}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-stone-500 italic">None specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Complaint Evolution Timeline */}
                  {summary.complaintEvolution?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-stone-600 tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        Longitudinal Visit Trajectory ({summary.complaintEvolution.length} Consultation{summary.complaintEvolution.length > 1 ? 's' : ''})
                      </h4>
                      <div className="space-y-2.5">
                        {summary.complaintEvolution.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl border border-stone-200 bg-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center shrink-0">
                                #{item.visitNumber}
                              </span>
                              <div>
                                <div className="font-bold text-stone-800">
                                  {item.complaint}
                                </div>
                                <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                                  <span>{formatDate(item.date)}</span>
                                  {item.duration && <span>• Duration: {item.duration}</span>}
                                  {item.ayurDiag && <span>• Diagnosis: <strong>{item.ayurDiag}</strong></span>}
                                </div>
                              </div>
                            </div>

                            {item.prognosis && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-stone-100 text-stone-600 self-start sm:self-auto">
                                {item.prognosis}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ACTIVE MEDICATIONS & THERAPIES */}
              {(activeTab === 'rx' || typeof window !== 'undefined') && (
                <div className={`space-y-6 ${activeTab !== 'rx' ? 'hidden print:block' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-stone-700 tracking-wider flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-emerald-600" />
                        Current Active Prescription Load ({summary.activePrescriptions?.length || 0})
                      </h4>
                      <span className="text-[10px] text-stone-400 font-semibold">
                        From latest consultation on {formatDate(summary.lastVisitDate)}
                      </span>
                    </div>

                    {summary.activePrescriptions?.length > 0 ? (
                      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-stone-100 text-stone-700 uppercase font-bold text-[10px] border-b border-stone-200">
                            <tr>
                              <th className="p-3">Medicine / Aushadhi</th>
                              <th className="p-3">Form</th>
                              <th className="p-3">Dosage</th>
                              <th className="p-3">Timing / Kala</th>
                              <th className="p-3">Anupana (Vehicle)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {summary.activePrescriptions.map((m, i) => (
                              <tr key={i} className="hover:bg-stone-50 transition">
                                <td className="p-3 font-bold text-stone-900">{m.name}</td>
                                <td className="p-3 text-stone-600">{m.form || 'Tablet / Vati'}</td>
                                <td className="p-3 font-medium text-stone-700">{m.dose || '1-0-1'}</td>
                                <td className="p-3 text-stone-600">{m.timing || 'After meals (Adhastha)'}</td>
                                <td className="p-3 text-emerald-800 font-semibold">{m.anupana || 'Lukewarm water'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
                        No active prescription records found on file.
                      </div>
                    )}
                  </div>

                  {/* Panchakarma & Diet summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-2">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-900 tracking-wider flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                        Panchakarma Therapies Undergone
                      </span>
                      <p className="text-xs text-stone-800 font-medium">
                        {summary.panchakarmaProcedures?.length > 0
                          ? summary.panchakarmaProcedures.join('; ')
                          : 'No invasive Panchakarma administered yet (Shamana therapy managed).'}
                      </p>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                      <span className="text-[10px] font-extrabold uppercase text-stone-600 tracking-wider flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-stone-500" />
                        Dietary Regimen (Pathya / Apathya)
                      </span>
                      <div className="text-[11px] space-y-1">
                        <div><strong className="text-emerald-800">Pathya (DOs):</strong> {summary.dietAdvice?.pathya}</div>
                        <div><strong className="text-rose-700">Apathya (DONTs):</strong> {summary.dietAdvice?.apathya}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PARIKSHA & PRAKRITI */}
              {(activeTab === 'pariksha' || typeof window !== 'undefined') && (
                <div className={`space-y-6 ${activeTab !== 'pariksha' ? 'hidden print:block' : ''}`}>
                  
                  {/* Prakriti Dosha Distribution Bar */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-stone-800">Lifelong Bio-Energy Constitution (Prakriti)</span>
                      <span className="font-extrabold text-emerald-800">{summary.prakriti}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200">
                        <div className="text-[10px] font-bold text-sky-700 uppercase">Vata</div>
                        <div className="text-lg font-black text-sky-900">{summary.doshaScores.vata}%</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="text-[10px] font-bold text-amber-700 uppercase">Pitta</div>
                        <div className="text-lg font-black text-amber-900">{summary.doshaScores.pitta}%</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="text-[10px] font-bold text-emerald-700 uppercase">Kapha</div>
                        <div className="text-lg font-black text-emerald-900">{summary.doshaScores.kapha}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Pariksha Matrix */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-stone-700 tracking-wider">
                      Ashtavidha Pariksha & Physiological Markers
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-stone-200">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Agni (Digestive Fire)</span>
                        <span className="font-bold text-stone-800">{summary.parikshaTrends.agni}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-stone-200">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Koshta (Bowel Nature)</span>
                        <span className="font-bold text-stone-800">{summary.parikshaTrends.koshta}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-stone-200">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Nadi (Pulse)</span>
                        <span className="font-bold text-stone-800">{summary.parikshaTrends.nadi}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-stone-200">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Jihva (Tongue)</span>
                        <span className="font-bold text-stone-800">{summary.parikshaTrends.jihva}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-stone-200">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Mala (Bowel Movement)</span>
                        <span className="font-bold text-stone-800">{summary.parikshaTrends.mala}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-stone-200">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Known Sensitivities</span>
                        <span className="font-bold text-rose-700">{summary.allergies}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ALERTS & ACTION PLAN FOR NEW DOCTOR */}
              {(activeTab === 'cautions' || typeof window !== 'undefined') && (
                <div className={`space-y-6 ${activeTab !== 'cautions' ? 'hidden print:block' : ''}`}>
                  
                  {/* Critical Cautions */}
                  {summary.criticalAlerts?.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-black uppercase text-rose-700 tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Critical Alerts & Clinical Contraindications
                      </h4>
                      <div className="space-y-2">
                        {summary.criticalAlerts.map((alert, idx) => (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                              alert.severity === 'high'
                                ? 'bg-rose-50 border-rose-300 text-rose-950'
                                : 'bg-amber-50 border-amber-300 text-amber-950'
                            }`}
                          >
                            <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${alert.severity === 'high' ? 'text-rose-600' : 'text-amber-600'}`} />
                            <div>
                              <strong className="block font-bold">{alert.title}</strong>
                              <span>{alert.message}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations for Incoming Doctor */}
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
                    <h4 className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-emerald-700" />
                      Suggested Clinical Action Plan for Incoming Practitioner
                    </h4>
                    <ul className="space-y-2 text-xs text-stone-800">
                      {summary.recommendations?.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Optional Transferring Doctor Note Input (Interactive) */}
                  <div className="space-y-2 print:hidden">
                    <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                      <span>Add Referring Doctor's Note (Optional remarks for new doctor):</span>
                      <span className="text-[10px] text-stone-400 font-normal">Will be included in print / copy</span>
                    </label>
                    <textarea
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder="e.g., Patient is relocating to Bangalore. Advised to continue current Deepana medicines for 10 more days before stepping down..."
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* PRINT-ONLY SIGNATURE & REFERRAL BLOCK */}
              <div className="hidden print:block pt-8 mt-8 border-t-2 border-stone-800 text-stone-900 text-xs">
                {doctorNotes && (
                  <div className="mb-6 p-3 bg-stone-50 border border-stone-300 rounded-lg">
                    <strong>Referring Doctor's Remarks:</strong>
                    <p className="mt-1 italic">{doctorNotes}</p>
                  </div>
                )}
                <div className="flex justify-between items-end pt-4">
                  <div>
                    <p className="font-bold">AyushCase Clinical AI Intelligence System</p>
                    <p className="text-[10px] text-stone-500">Ministry of Ayush • ABHA Integrated Health Summary</p>
                  </div>
                  <div className="text-right">
                    <div className="w-48 border-b border-stone-800 mb-1" />
                    <p className="font-bold">Attending / Referring Physician Signature</p>
                    <p className="text-[10px] text-stone-500">Reg. No. / Hospital Seal</p>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3.5 flex items-center justify-between text-xs text-stone-500 print:hidden">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Portable ABHA Handover Record • AyushCase SIH 2024</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-bold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
