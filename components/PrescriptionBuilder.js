'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Pill, Sparkles, BookOpen } from 'lucide-react';
import { AYURVEDIC_MEDICINES } from '@/lib/ayush-data';
import { useLanguage } from './LanguageContext';

const FORM_OPTIONS = [
  'Vati / Gutika (Tablet)',
  'Churna (Powder)',
  'Kwath / Kashayam (Decoction)',
  'Asava / Arishta (Fermented Liquid)',
  'Taila (Medicated Oil)',
  'Ghruta (Medicated Ghee)',
  'Avaleha / Lehyam (Herbal Paste)',
  'Bhasma / Rasayoga (Mineral Compound)',
  'Lepa / Malahara (Ointment)',
  'Capsule',
];

const TIMING_OPTIONS = [
  'Twice daily after food (Adhahbhakta)',
  'Before meals twice daily (Pragbhakta)',
  'Bedtime with warm water/milk (Nishakala)',
  'Empty stomach early morning (Rasayana Kala)',
  'Thrice daily with honey',
  'During meals with food (Sambhukta)',
  'SOS (In case of acute pain/discomfort)',
];

const ANUPANA_OPTIONS = [
  'Warm water (Ushnodaka)',
  'Lukewarm water (Koshnodaka)',
  'Honey (Madhu)',
  'Cow Milk (Godugdha)',
  'Pure Cow Ghee (Goghrita)',
  'Coconut Water (Narikela Jala)',
  'Buttermilk with cumin (Takra)',
  'Rasnadi Kwath',
  'Equal quantity of water',
  'Lemon water',
];

export default function PrescriptionBuilder({ medicines = [], onChange }) {
  const { language } = useLanguage();
  const [selectedFormulary, setSelectedFormulary] = useState('');

  const handleAddMedicine = (preset = null) => {
    const newMed = preset
      ? {
          name: preset.name,
          form: preset.form,
          dose: preset.defaultDose || '1-2 tablets',
          anupana: preset.anupana || 'Warm water',
          timing: preset.timing || 'Twice daily after food',
          duration: '14 days',
        }
      : {
          name: '',
          form: 'Vati / Gutika (Tablet)',
          dose: '2 tablets',
          anupana: 'Warm water (Ushnodaka)',
          timing: 'Twice daily after food (Adhahbhakta)',
          duration: '14 days',
        };

    onChange([...medicines, newMed]);
  };

  const handleUpdateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemoveMedicine = (index) => {
    const updated = medicines.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleQuickAddFromFormulary = (e) => {
    const drugName = e.target.value;
    if (!drugName) return;
    const found = AYURVEDIC_MEDICINES.find((m) => m.name === drugName);
    if (found) {
      handleAddMedicine(found);
      setSelectedFormulary('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Formulary Quick Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-semibold text-emerald-900">
            {language === 'hi' ? 'आयुर्वेदिक औषधि कोश (Quick Formulary)' : 'Quick Formulary Selector'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <select
            value={selectedFormulary}
            onChange={handleQuickAddFromFormulary}
            className="w-full text-xs bg-white border border-emerald-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800"
          >
            <option value="">-- Choose Classical Medicine to Add --</option>
            {AYURVEDIC_MEDICINES.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name} ({m.form}) — {m.defaultDose}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Medicines Table / List */}
      {medicines.length === 0 ? (
        <div className="text-center py-8 px-4 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/60">
          <Pill className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <p className="text-xs text-stone-500 mb-3">
            {language === 'hi'
              ? 'कोई औषधि नहीं जोड़ी गई है। नीचे दिए गए बटन या औषधि कोश से चुनें।'
              : 'No medicines added to this prescription yet.'}
          </p>
          <button
            type="button"
            onClick={() => handleAddMedicine()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'औषधि जोड़ें' : 'Add Medication'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {medicines.map((med, idx) => (
            <div
              key={idx}
              className="p-4 bg-white border border-stone-200 rounded-xl shadow-sm hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-stone-700">
                    {med.name || 'Untitled Medicine'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMedicine(idx)}
                  className="text-stone-400 hover:text-rose-600 p-1 rounded transition"
                  title="Remove medicine"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Drug Name */}
                <div className="md:col-span-4">
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Medicine / Formulation Name *
                  </label>
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                    placeholder="e.g. Yograj Guggulu, Triphala"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Form */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Form (Kalpana)
                  </label>
                  <input
                    type="text"
                    list={`form-options-${idx}`}
                    value={med.form || ''}
                    onChange={(e) => handleUpdateMedicine(idx, 'form', e.target.value)}
                    placeholder="Vati / Churna / Kwath"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <datalist id={`form-options-${idx}`}>
                    {FORM_OPTIONS.map((f) => (
                      <option key={f} value={f} />
                    ))}
                  </datalist>
                </div>

                {/* Dosage */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Dose (Matra)
                  </label>
                  <input
                    type="text"
                    value={med.dose || ''}
                    onChange={(e) => handleUpdateMedicine(idx, 'dose', e.target.value)}
                    placeholder="2 tablets / 3g"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Duration */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={med.duration || ''}
                    onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)}
                    placeholder="14 days / 1 month"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Anupana */}
                <div className="md:col-span-6">
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Anupana (Vehicle / Medium)
                  </label>
                  <input
                    type="text"
                    list={`anupana-options-${idx}`}
                    value={med.anupana || ''}
                    onChange={(e) => handleUpdateMedicine(idx, 'anupana', e.target.value)}
                    placeholder="Warm water / Honey / Cow Milk / Ghee"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <datalist id={`anupana-options-${idx}`}>
                    {ANUPANA_OPTIONS.map((a) => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>
                </div>

                {/* Timing / Kala */}
                <div className="md:col-span-6">
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Oushadha Sevana Kala (Timing)
                  </label>
                  <input
                    type="text"
                    list={`timing-options-${idx}`}
                    value={med.timing || ''}
                    onChange={(e) => handleUpdateMedicine(idx, 'timing', e.target.value)}
                    placeholder="Twice daily after food / Bedtime"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <datalist id={`timing-options-${idx}`}>
                    {TIMING_OPTIONS.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleAddMedicine()}
            className="w-full py-2.5 border-2 border-dashed border-emerald-300 hover:border-emerald-500 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? '+ अन्य औषधि जोड़ें' : '+ Add Another Medicine'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
