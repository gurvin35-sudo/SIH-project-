'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Pill,
  Clock,
  Calendar,
  User,
  Stethoscope,
  Building2,
  Edit3,
  Check,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Layers,
  Leaf,
  Droplets,
  Flame,
  FileText,
  X,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { KNOWN_AYUSH_FORMS } from '@/lib/prescription-extractor';
import { formatDate } from '@/lib/utils';

export function getFormBadgeInfo(form) {
  if (!form) return { label: 'Formulation', icon: Pill, color: 'bg-stone-100 text-stone-700 border-stone-200' };
  const lower = form.toLowerCase();

  if (lower.includes('churna') || lower.includes('choorna') || lower.includes('powder')) {
    return { label: form, icon: Leaf, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  }
  if (lower.includes('vati') || lower.includes('gutika') || lower.includes('guggulu') || lower.includes('habb') || lower.includes('pill')) {
    return { label: form, icon: Pill, color: 'bg-amber-100 text-amber-900 border-amber-300' };
  }
  if (lower.includes('kwath') || lower.includes('kashayam') || lower.includes('decoction')) {
    return { label: form, icon: Flame, color: 'bg-orange-100 text-orange-900 border-orange-300' };
  }
  if (lower.includes('asava') || lower.includes('arishta') || lower.includes('sharbat') || lower.includes('arq') || lower.includes('syrup')) {
    return { label: form, icon: Droplets, color: 'bg-purple-100 text-purple-900 border-purple-300' };
  }
  if (lower.includes('taila') || lower.includes('thailam') || lower.includes('roghan') || lower.includes('oil') || lower.includes('ointment')) {
    return { label: form, icon: Droplets, color: 'bg-teal-100 text-teal-900 border-teal-300' };
  }
  if (lower.includes('bhasma') || lower.includes('parpam') || lower.includes('rasayana') || lower.includes('lehya') || lower.includes('majun')) {
    return { label: form, icon: Sparkles, color: 'bg-rose-100 text-rose-900 border-rose-300' };
  }
  if (lower.includes('tablet') || lower.includes('capsule')) {
    return { label: form, icon: Pill, color: 'bg-sky-100 text-sky-900 border-sky-300' };
  }

  return { label: form, icon: Pill, color: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
}

export default function PrescriptionReviewCard({
  prescription,
  rawOcrText = '',
  documentPreviewUrl = null,
  fileName = '',
  onConfirm = null,
  onCancel = null,
  isDoctorView = false,
  showRawToggle = true
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showOriginalDocModal, setShowOriginalDocModal] = useState(false);
  const [showRawOcr, setShowRawOcr] = useState(false);

  // Editable prescription copy
  const [editableData, setEditableData] = useState(() => {
    return JSON.parse(JSON.stringify(prescription || {}));
  });

  const medications = editableData.medications || editableData.medicines || [];

  // Update Medication field
  const handleUpdateMed = (idx, field, value) => {
    const nextMeds = [...medications];
    nextMeds[idx] = { ...nextMeds[idx], [field]: value.trim() ? value : null };
    setEditableData({
      ...editableData,
      medications: nextMeds,
      medicines: nextMeds
    });
  };

  // Add Medication
  const handleAddMed = () => {
    const newMed = {
      name: '',
      form: 'Churna',
      dose: null,
      frequency: 'Twice daily',
      duration: null,
      timing: 'After food',
      anupana: 'Warm water',
      pathya: null,
      apathya: null,
      route: 'Oral',
      instructions: null
    };
    const nextMeds = [...medications, newMed];
    setEditableData({
      ...editableData,
      medications: nextMeds,
      medicines: nextMeds
    });
  };

  // Remove Medication
  const handleRemoveMed = (idx) => {
    const nextMeds = medications.filter((_, i) => i !== idx);
    setEditableData({
      ...editableData,
      medications: nextMeds,
      medicines: nextMeds
    });
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(editableData);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* 1. Medical Safety & Transparency Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300/80 text-amber-950 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <span className="font-extrabold uppercase text-[10px] tracking-wider text-amber-900 block">
            AI/OCR Extracted Information Notice
          </span>
          <p className="text-stone-800 leading-relaxed font-medium">
            AI/OCR extracted information. Please verify it against the original prescription before confirming. Unmentioned values are kept empty.
          </p>
        </div>
      </div>

      {/* 2. Prescription Header & Quick Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xl">🌿</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-stone-900">
                Extracted Prescription & Formulation Review
              </h3>
              <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {editableData.ayushSystem || 'AYUSH'}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {medications.length} formulation{medications.length !== 1 ? 's' : ''} extracted from document
            </p>
          </div>
        </div>

        {/* Toolbar CTAs */}
        <div className="flex items-center gap-2 flex-wrap">
          {documentPreviewUrl && (
            <button
              type="button"
              onClick={() => setShowOriginalDocModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>View Original Document</span>
            </button>
          )}

          {showRawToggle && rawOcrText && (
            <button
              type="button"
              onClick={() => setShowRawOcr(!showRawOcr)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition"
            >
              {showRawOcr ? <EyeOff className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{showRawOcr ? 'Hide Raw OCR' : 'Raw OCR Text'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
              isEditing
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-stone-800 border border-stone-300 hover:bg-stone-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Save & Review' : 'Edit Information'}</span>
          </button>
        </div>
      </div>

      {/* 3. Raw OCR Text Drawer (Collapsible) */}
      {showRawOcr && rawOcrText && (
        <div className="p-4 rounded-2xl bg-stone-900 text-stone-100 text-xs font-mono space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-[10px] text-stone-400 border-b border-stone-800 pb-1">
            <span>Raw OCR Text Stream</span>
            <span>{rawOcrText.length} characters</span>
          </div>
          <pre className="whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed text-[11px] text-emerald-300">
            {rawOcrText}
          </pre>
        </div>
      )}

      {/* 4. Document Metadata Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Doctor / Practitioner</span>
          <span className="font-bold text-stone-900 block truncate">
            {editableData.doctor?.name || editableData.doctor || <span className="text-stone-400 italic">Not specified</span>}
          </span>
        </div>

        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Prescription Date</span>
          <span className="font-bold text-stone-900 block">
            {editableData.prescriptionDate || editableData.docDate || <span className="text-stone-400 italic">Not specified</span>}
          </span>
        </div>

        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Diagnosed Condition</span>
          <span className="font-bold text-emerald-950 block truncate">
            {editableData.diagnosis || <span className="text-stone-400 italic">Not specified</span>}
          </span>
        </div>

        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Hospital / Clinic</span>
          <span className="font-bold text-stone-800 block truncate">
            {editableData.doctor?.clinicOrHospital || editableData.hospitalClinic || <span className="text-stone-400 italic">Not specified</span>}
          </span>
        </div>
      </div>

      {/* 5. MEDICATIONS LIST (VIEW MODE VS EDIT MODE) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-stone-700 tracking-wider flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-emerald-600" />
            <span>Prescribed Formulations ({medications.length})</span>
          </span>

          {isEditing && (
            <button
              type="button"
              onClick={handleAddMed}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Formulation</span>
            </button>
          )}
        </div>

        {medications.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-stone-200 italic space-y-2">
            <p>No specific medicines detected in the document text.</p>
            {isEditing && (
              <button
                type="button"
                onClick={handleAddMed}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                + Add First Formulation
              </button>
            )}
          </div>
        ) : !isEditing ? (
          /* ================= VIEW MODE CARDS ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((med, idx) => {
              const badge = getFormBadgeInfo(med.form);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border-2 border-stone-200/90 shadow-xs hover:border-emerald-300 transition p-5 space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Medicine Name & Form Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h4 className="font-extrabold text-sm text-stone-900">
                            {med.name}
                          </h4>
                        </div>
                      </div>

                      {med.form ? (
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${badge.color}`}>
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                          Form unspecified
                        </span>
                      )}
                    </div>

                    {/* Core Prescription Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50/80 p-3 rounded-xl border border-stone-200/80">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Dose / Quantity</span>
                        <span className="font-bold text-stone-800">
                          {med.dose || <span className="text-stone-400 italic font-normal text-[11px]">Not specified</span>}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Frequency</span>
                        <span className="font-bold text-stone-800">
                          {med.frequency || <span className="text-stone-400 italic font-normal text-[11px]">Not specified</span>}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Timing / Kala</span>
                        <span className="font-semibold text-stone-800">
                          {med.timing || <span className="text-stone-400 italic font-normal text-[11px]">Not specified</span>}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Duration</span>
                        <span className="font-semibold text-stone-800">
                          {med.duration || <span className="text-stone-400 italic font-normal text-[11px]">Not specified</span>}
                        </span>
                      </div>
                    </div>

                    {/* Anupana (Vehicle) */}
                    <div className="flex items-center gap-1.5 text-xs text-stone-700 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/70">
                      <span className="text-[11px] font-bold text-emerald-900 shrink-0">🥛 Anupana:</span>
                      <span className="font-semibold text-emerald-950">
                        {med.anupana || <span className="text-stone-400 italic font-normal">Not specified</span>}
                      </span>
                    </div>

                    {/* Route or Instructions if present */}
                    {(med.route || med.instructions) && (
                      <div className="text-[11px] text-stone-600 space-y-0.5 pt-0.5">
                        {med.route && (
                          <p><strong>Route:</strong> {med.route}</p>
                        )}
                        {med.instructions && (
                          <p className="italic text-stone-500">"{med.instructions}"</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ================= EDIT MODE FORM ================= */
          <div className="space-y-4">
            {medications.map((med, idx) => (
              <div
                key={idx}
                className="p-4 bg-stone-50 rounded-2xl border border-stone-300 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Formulation Name (e.g. Triphala, Yogaraj Guggulu)"
                      value={med.name || ''}
                      onChange={(e) => handleUpdateMed(idx, 'name', e.target.value)}
                      className="flex-1 font-bold text-sm p-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMed(idx)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Delete formulation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
                  <div>
                    <label className="block font-bold text-stone-500 mb-1">Form</label>
                    <input
                      type="text"
                      placeholder="Churna, Vati, Kwath..."
                      value={med.form || ''}
                      onChange={(e) => handleUpdateMed(idx, 'form', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-stone-300 bg-white"
                      list={`forms-list-${idx}`}
                    />
                    <datalist id={`forms-list-${idx}`}>
                      {KNOWN_AYUSH_FORMS.map((f) => (
                        <option key={f} value={f} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-500 mb-1">Dose / Quantity</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 g, 500 mg"
                      value={med.dose || ''}
                      onChange={(e) => handleUpdateMed(idx, 'dose', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-500 mb-1">Frequency</label>
                    <input
                      type="text"
                      placeholder="Once daily, BD..."
                      value={med.frequency || ''}
                      onChange={(e) => handleUpdateMed(idx, 'frequency', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-500 mb-1">Timing (Kala)</label>
                    <input
                      type="text"
                      placeholder="Bedtime, After food..."
                      value={med.timing || ''}
                      onChange={(e) => handleUpdateMed(idx, 'timing', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-500 mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="14 days, 1 month..."
                      value={med.duration || ''}
                      onChange={(e) => handleUpdateMed(idx, 'duration', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-500 mb-1">Anupana</label>
                    <input
                      type="text"
                      placeholder="Warm water, Honey..."
                      value={med.anupana || ''}
                      onChange={(e) => handleUpdateMed(idx, 'anupana', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Overall Regimen, Pathya & Procedures */}
      {(editableData.pathya || editableData.apathya || editableData.procedures?.length > 0 || editableData.followUp) && (
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
          <span className="font-extrabold text-stone-800 block uppercase text-[10px] tracking-wider">
            Clinical Advice & Regimen
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-stone-700">
            {editableData.pathya && (
              <div><strong className="text-emerald-800">Pathya (DOs):</strong> {editableData.pathya}</div>
            )}
            {editableData.apathya && (
              <div><strong className="text-rose-700">Apathya (DONTs):</strong> {editableData.apathya}</div>
            )}
            {editableData.procedures?.length > 0 && (
              <div className="sm:col-span-2">
                <strong className="text-purple-900">Therapies / Panchakarma:</strong>{' '}
                {editableData.procedures.map(p => p.name + (p.details ? ` (${p.details})` : '')).join('; ')}
              </div>
            )}
            {editableData.followUp && (
              <div><strong className="text-sky-800">Follow-up:</strong> {editableData.followUp}</div>
            )}
          </div>
        </div>
      )}

      {/* 7. Bottom Confirmation & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
          >
            ← Upload Another Document
          </button>
        )}

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 via-herb to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white shadow-xl shadow-emerald-700/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Confirm & Add to Digital Health Record</span>
          </button>
        </div>
      </div>

      {/* 8. Lightbox Modal for Original Document Preview */}
      {showOriginalDocModal && documentPreviewUrl && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-stone-300">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs">{fileName || 'Original Document Preview'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowOriginalDocModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-stone-100 min-h-[300px]">
              <img
                src={documentPreviewUrl}
                alt="Original Prescription"
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-md"
              />
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-200 text-right text-xs">
              <button
                type="button"
                onClick={() => setShowOriginalDocModal(false)}
                className="px-4 py-1.5 bg-stone-800 text-white font-bold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
