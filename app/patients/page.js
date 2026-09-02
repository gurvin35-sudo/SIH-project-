'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  FilePlus2,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  HeartPulse
} from 'lucide-react';
import { formatDate, formatABHA, getDoshaColor } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageContext';

export default function PatientsPage() {
  const { language, t } = useLanguage();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [prakritiFilter, setPrakritiFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Patient Form State
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    email: '',
    address: '',
    abhaId: '',
    bloodGroup: '',
    allergies: '',
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (genderFilter !== 'all') params.set('gender', genderFilter);
      if (prakritiFilter !== 'all') params.set('prakriti', prakritiFilter);

      const res = await fetch(`/api/patients?${params.toString()}`);
      let patientList = [];
      if (res.ok) {
        const data = await res.json();
        patientList = data.patients || [];
      }

      // Merge locally created patients (retains patients even across Vercel cold-starts)
      try {
        const localRaw = localStorage.getItem('ayushcase_local_patients');
        if (localRaw) {
          const localPatients = JSON.parse(localRaw);
          if (Array.isArray(localPatients)) {
            localPatients.forEach((lp) => {
              const alreadyExists = patientList.some(
                (sp) => sp.id === lp.id || (lp.abhaId && sp.abhaId === lp.abhaId) || (sp.name === lp.name && sp.contact === lp.contact)
              );
              if (!alreadyExists) {
                // Check if filters match
                let match = true;
                if (searchQuery) {
                  const s = searchQuery.toLowerCase();
                  match = lp.name?.toLowerCase().includes(s) || lp.contact?.includes(s) || lp.abhaId?.includes(s);
                }
                if (genderFilter !== 'all' && lp.gender !== genderFilter) match = false;
                if (prakritiFilter !== 'all' && !lp.prakritiType?.includes(prakritiFilter)) match = false;

                if (match) {
                  patientList.unshift(lp);
                }
              }
            });
          }
        }
      } catch (e) {
        // ignore local parse errors
      }

      setPatients(patientList);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, genderFilter, prakritiFilter]);

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSubmitting(true);

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || 'Failed to save patient');
        setModalSubmitting(false);
        return;
      }

      const createdPatient = data.patient;

      // Save to local storage cache so it persists forever in the browser
      if (createdPatient) {
        try {
          const localRaw = localStorage.getItem('ayushcase_local_patients');
          const localList = localRaw ? JSON.parse(localRaw) : [];
          localList.unshift(createdPatient);
          localStorage.setItem('ayushcase_local_patients', JSON.stringify(localList));
        } catch (e) {}
      }

      // Reset form and close modal
      setNewPatient({
        name: '',
        age: '',
        gender: 'Male',
        contact: '',
        email: '',
        address: '',
        abhaId: '',
        bloodGroup: '',
        allergies: '',
      });
      setIsModalOpen(false);
      setModalSubmitting(false);
      fetchPatients();
    } catch (err) {
      setModalError('Network error while saving patient');
      setModalSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title and Add Patient Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-700" />
            <span>{t('patients')} Directory</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your registered AYUSH patients, view longitudinal case histories, and initiate case-taking.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('addPatient')}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPatientsPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span>Gender:</span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="text-xs border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Prakriti Filter */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Prakriti:</span>
            <select
              value={prakritiFilter}
              onChange={(e) => setPrakritiFilter(e.target.value)}
              className="text-xs border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Prakritis</option>
              <option value="Vata">Vata Dominant</option>
              <option value="Pitta">Pitta Dominant</option>
              <option value="Kapha">Kapha Dominant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient List Cards / Table */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-stone-500">Loading patients directory...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200 space-y-3">
          <Users className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-bold text-base text-stone-800">No patients found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery || genderFilter !== 'all' || prakritiFilter !== 'all'
              ? 'Try changing your search keywords or active filters.'
              : 'Add your first patient to start taking clinical Ayurvedic case sheets.'}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add New Patient</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => {
            const latestCase = patient.cases?.[0];
            const doshaStyle = getDoshaColor(patient.prakritiType || latestCase?.prakritiResult);

            return (
              <div
                key={patient.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition flex flex-col justify-between p-5 space-y-4"
              >
                {/* Top Patient Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/patients/${patient.id}`}
                        className="font-bold text-sm text-stone-900 hover:text-emerald-800 transition block"
                      >
                        {patient.name}
                      </Link>
                      <span className="text-xs text-stone-500 font-medium">
                        {patient.gender}, {patient.age} Yrs
                      </span>
                    </div>

                    {/* Prakriti Badge */}
                    {(patient.prakritiType || latestCase?.prakritiResult) ? (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${doshaStyle.bg} ${doshaStyle.text} ${doshaStyle.border} shrink-0`}
                      >
                        {patient.prakritiType || latestCase?.prakritiResult}
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full shrink-0">
                        Unassessed
                      </span>
                    )}
                  </div>

                  {/* Contact & ABHA */}
                  <div className="space-y-1 text-xs text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{patient.contact}</span>
                    </div>
                    {patient.abhaId && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-mono border border-emerald-200">
                          ABHA: {formatABHA(patient.abhaId)}
                        </span>
                      </div>
                    )}
                    {/* Pre-Consultation & OCR Badges */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {patient.preConsultationStatus === 'SENT_TO_DOCTOR' && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          AI Intake Ready
                        </span>
                      )}
                      {patient.documents && patient.documents.length > 0 && (
                        <span className="text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300 px-1.5 py-0.5 rounded">
                          📄 {patient.documents.length} OCR Reports
                        </span>
                      )}
                      {patient.redFlags && (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 px-1.5 py-0.5 rounded">
                          🚨 Emergency Flagged
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Last Diagnosis / Case note */}
                  {latestCase ? (
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] space-y-0.5">
                      <div className="text-stone-400 text-[10px] font-semibold uppercase">
                        Last Case ({formatDate(latestCase.visitDate)}):
                      </div>
                      <div className="font-bold text-emerald-950 truncate">
                        {latestCase.ayurvedicDiagnosis}
                      </div>
                      {latestCase.modernDiagnosis && (
                        <div className="text-stone-500 truncate text-[10px]">
                          {latestCase.modernDiagnosis}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-[11px] text-stone-400 italic">
                      No case records logged yet.
                    </div>
                  )}
                </div>

                {/* Bottom Action CTAs */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/patients/${patient.id}`}
                    className="flex-1 py-1.5 px-3 text-center text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg border border-stone-200 transition"
                  >
                    {t('viewHistory')}
                  </Link>
                  <Link
                    href={`/patients/${patient.id}/case-taking`}
                    className="flex-1 py-1.5 px-3 text-center text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition flex items-center justify-center gap-1"
                  >
                    <FilePlus2 className="w-3.5 h-3.5" />
                    <span>+ New Case</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Patient Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-sm sm:text-base">
                  {language === 'hi' ? 'नया रोगी जोड़ें' : 'Register New Patient'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {t('fullName')} *
                </label>
                <input
                  type="text"
                  required
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {t('age')} (Years) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    placeholder="e.g. 42"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {t('gender')} *
                  </label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-800"
                  >
                    <option value="Male">{t('male')}</option>
                    <option value="Female">{t('female')}</option>
                    <option value="Other">{t('other')}</option>
                  </select>
                </div>
              </div>

              {/* Contact & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {t('contactNumber')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPatient.contact}
                    onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {t('bloodGroup')}
                  </label>
                  <select
                    value={newPatient.bloodGroup}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-800"
                  >
                    <option value="">Select (Optional)</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* ABHA ID */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {t('abhaId')}
                </label>
                <input
                  type="text"
                  value={newPatient.abhaId}
                  onChange={(e) => setNewPatient({ ...newPatient, abhaId: e.target.value })}
                  placeholder="14-digit format e.g. 91-1234-5678-9012"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {t('residentialAddress')}
                </label>
                <input
                  type="text"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  placeholder="Street / City / State"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Known Allergies */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {t('knownAllergies')}
                </label>
                <input
                  type="text"
                  value={newPatient.allergies}
                  onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                  placeholder="e.g. Dust allergy, Penicillin, Ghee intolerance"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {modalSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('saving')}</span>
                    </>
                  ) : (
                    <span>{t('savePatient')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
