'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Leaf,
  Activity,
  Award,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  FileCheck2,
  Mic,
  Printer,
  ChevronRight,
  CheckCircle2,
  Users,
  Compass,
  HeartPulse,
  Globe,
  Check
} from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/components/LanguageContext';

export default function HomePage() {
  const { data: session } = useSession();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-herb to-emerald-900 text-white p-8 sm:p-14 shadow-2xl border border-emerald-700/40">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 text-xs font-semibold backdrop-blur-sm shadow-inner">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Smart India Hackathon 2026 • Ministry of Ayush</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Digitizing Ayurvedic Case-Taking with{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-amber-200 to-emerald-200 bg-clip-text text-transparent">
              Smart Automation
            </span>
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-normal">
            AyushCase helps AYUSH practitioners manage patient case-taking digitally. It provides automatic body-type assessment, structured case records, Ayurvedic and ICD-11 diagnosis support, voice-to-text notes, and secure long-term patient records.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href="/patient-portal"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-lg shadow-amber-500/30 transition transform hover:-translate-y-0.5 ring-2 ring-amber-300/60"
            >
              <HeartPulse className="w-4 h-4 animate-pulse" />
              <span>Patient Portal (Start AI Health Assessment) →</span>
            </Link>

            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-700/90 hover:bg-emerald-600 text-white border border-emerald-500/60 shadow-md transition transform hover:-translate-y-0.5"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Doctor Console</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-800/90 hover:bg-emerald-700 text-white border border-emerald-600/60 shadow-md transition"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Doctor Login (Demo)</span>
              </Link>
            )}
          </div>

          {/* Multi-Language Indian Accessibility Selector */}
          <div className="pt-4 border-t border-emerald-800/80 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-bold flex-wrap">
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>Multi-Language AYUSH Accessibility • बहुभाषी आयुष सुविधा</span>
              <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-600 font-semibold">
                6 Indian Languages Supported
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition transform active:scale-95 ${
                      isSelected
                        ? 'bg-amber-400 text-emerald-950 shadow-md ring-2 ring-amber-300 font-black'
                        : 'bg-emerald-900/90 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60 hover:text-white'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.native}</span>
                    <span className="text-[10px] opacity-75">({lang.label})</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5 text-emerald-950 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Built for Modern AYUSH Clinics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Comprehensive Clinical Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Designed to save clinical documentation time while capturing rich classical Ayurvedic parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Body-Type (Prakriti) Assessment</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Simple guided questions that automatically calculate a patient's Vata, Pitta, and Kapha balance to help suggest personalized treatments.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-stone-900">8-Fold Check (Ashtavidha Pariksha)</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Quick 1-click recording for pulse, tongue, eyes, voice, skin, and digestion without lengthy manual typing.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Dual Diagnosis & Prescriptions</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Connects Ayurvedic conditions with modern ICD-11 medical codes, along with safe herbal remedies, dosage timings, and diet rules.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Demo Access Callout */}
      <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-bold text-emerald-950">
            Ready to test AyushCase?
          </h3>
          <p className="text-xs sm:text-sm text-emerald-800">
            Preloaded with Dr. Ananya Sharma's clinic data and sample patients. Log in instantly.
          </p>
        </div>
        <Link
          href="/login"
          className="shrink-0 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition"
        >
          Instant Demo Login →
        </Link>
      </section>
    </div>
  );
}
