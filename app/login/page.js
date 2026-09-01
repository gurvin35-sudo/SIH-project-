'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import {
  Leaf,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  Sparkles,
  Stethoscope,
  User,
  ShieldCheck,
  Phone,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { language, t } = useLanguage();

  const [portalType, setPortalType] = useState('doctor'); // 'doctor' | 'patient'

  // Doctor Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Patient Form State
  const [patientIdentifier, setPatientIdentifier] = useState('');
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState('');

  // Doctor Login Submit
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password: password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Patient Portal Login Submit
  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setPatientError('');
    setPatientLoading(true);

    try {
      const res = await fetch('/api/patient-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: patientIdentifier }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPatientError(data.error || 'Patient not found');
        setPatientLoading(false);
        return;
      }

      router.push(`/patient-portal/${data.patient.id}`);
    } catch (err) {
      setPatientError('Network error while looking up patient record');
      setPatientLoading(false);
    }
  };

  const handleFillDemoDoctor = () => {
    setEmail('dr.sharma@ayushcase.in');
    setPassword('Password123');
    setError('');
  };

  const handleFillDemoPatient = () => {
    setPatientIdentifier('91-4523-8891-2304');
    setPatientError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 p-8 space-y-6">
        {/* Top Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-herb flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-700/20">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            AyushCase Portal
          </h1>
          <p className="text-xs text-stone-500">
            Select your portal to access clinical records & health data
          </p>
        </div>

        {/* Portal Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl border border-stone-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setPortalType('doctor')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
              portalType === 'doctor'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Portal</span>
          </button>

          <button
            type="button"
            onClick={() => setPortalType('patient')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
              portalType === 'patient'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Patient Portal</span>
          </button>
        </div>

        {/* ================= DOCTOR LOGIN VIEW ================= */}
        {portalType === 'doctor' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Demo Credentials Quick Button */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-950 block">⚡ Demo Doctor Account</span>
                <span className="text-[11px] text-emerald-700">Dr. Ananya Sharma (BAMS, MD)</span>
              </div>
              <button
                type="button"
                onClick={handleFillDemoDoctor}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
              >
                Auto Fill
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Doctor Form */}
            <form onSubmit={handleDoctorSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Doctor Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dr.sharma@ayushcase.in"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Sign In as Doctor →</span>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-500">
              <span>Are you a new doctor? </span>
              <Link href="/signup" className="font-bold text-emerald-700 hover:underline">
                Register Clinic
              </Link>
            </div>
          </div>
        )}

        {/* ================= PATIENT LOGIN VIEW ================= */}
        {portalType === 'patient' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Demo Patient Quick Fill */}
            <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-sky-950 block">⚡ Demo Patient</span>
                <span className="text-[11px] text-sky-700 font-mono">Rajesh Kumar (ABHA: 91-4523-8891-2304)</span>
              </div>
              <button
                type="button"
                onClick={handleFillDemoPatient}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition"
              >
                Auto Fill
              </button>
            </div>

            {/* Error Alert */}
            {patientError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{patientError}</span>
              </div>
            )}

            {/* Patient Form */}
            <form onSubmit={handlePatientSubmit} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    ABHA ID or Mobile Number *
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                    Ayushman Bharat
                  </span>
                </div>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={patientIdentifier}
                    onChange={(e) => setPatientIdentifier(e.target.value)}
                    placeholder="e.g. 91-4523-8891-2304 or +91 98112 34567"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  View your prescriptions, Prakriti report, and doctor notes.
                </p>
              </div>

              <button
                type="submit"
                disabled={patientLoading}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {patientLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying ABHA ID...</span>
                  </>
                ) : (
                  <span>Access Patient Health Records →</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
