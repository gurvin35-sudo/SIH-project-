'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserPlus,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function NewPatientPage() {
  const router = useRouter();
  const { language, t } = useLanguage();

  const [formData, setFormData] = useState({
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

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create patient');
        setLoading(false);
        return;
      }

      // Navigate to patient's new case taking form immediately!
      router.push(`/patients/${data.patient.id}/case-taking`);
    } catch (err) {
      setError('An unexpected error occurred while saving patient.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Back Link */}
      <Link
        href="/patients"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('backToPatients')}</span>
      </Link>

      <div className="bg-white rounded-3xl shadow-xl border border-stone-200 p-8 space-y-6">
        {/* Header */}
        <div className="border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-stone-900 tracking-tight">
                {language === 'hi' ? 'नया रोगी पंजीकरण' : 'New Patient Registration'}
              </h1>
              <p className="text-xs text-stone-500">
                Register demographics & ABHA ID to immediately begin structured Ayurvedic case-taking
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              {t('fullName')} *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Chandra Sharma"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                {t('age')} (Years) *
              </label>
              <input
                type="number"
                name="age"
                required
                min={1}
                max={120}
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 45"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                {t('gender')} *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-800"
              >
                <option value="Male">{t('male')}</option>
                <option value="Female">{t('female')}</option>
                <option value="Other">{t('other')}</option>
              </select>
            </div>
          </div>

          {/* Contact & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                {t('contactNumber')} *
              </label>
              <input
                type="tel"
                name="contact"
                required
                value={formData.contact}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                {t('emailAddress')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="patient@example.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* ABHA ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-stone-700">
                {t('abhaId')}
              </label>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Ayushman Bharat
              </span>
            </div>
            <input
              type="text"
              name="abhaId"
              value={formData.abhaId}
              onChange={handleChange}
              placeholder="e.g. 91-4523-8891-2304 (14 digits)"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
          </div>

          {/* Blood Group & Allergies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                {t('bloodGroup')}
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-800"
              >
                <option value="">Select Blood Group</option>
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

            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                {t('knownAllergies')}
              </label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="e.g. Sulfa drugs, Peanuts"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              {t('residentialAddress')}
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 14, Civil Lines, New Delhi"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <Link
              href="/patients"
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50"
            >
              {t('cancel')}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('saving')}</span>
                </>
              ) : (
                <span>Register & Start Case Taking →</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
