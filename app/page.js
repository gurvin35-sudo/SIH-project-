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
  Compass
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function HomePage() {
  const { data: session } = useSession();
  const { language, t } = useLanguage();

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-herb to-emerald-900 text-white p-8 sm:p-14 shadow-2xl border border-emerald-700/40">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 text-xs font-semibold backdrop-blur-sm shadow-inner">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Smart India Hackathon 2024 • Ministry of Ayush</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Digitizing Ayurvedic Case-Taking with{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-amber-200 to-emerald-200 bg-clip-text text-transparent">
              Smart Automation
            </span>
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-normal">
            AyushCase empowers AYUSH practitioners with automated Prakriti (constitution) calculation,
            structured Ashtavidha Pariksha, dual Ayurvedic & ICD-11 diagnosis, instant voice-to-text notes,
            and ABHA-compliant longitudinal patient case records.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-400 hover:bg-emerald-300 text-emerald-950 shadow-lg shadow-emerald-500/30 transition transform hover:-translate-y-0.5"
              >
                <span>Go to Doctor Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-400 hover:bg-emerald-300 text-emerald-950 shadow-lg shadow-emerald-500/30 transition transform hover:-translate-y-0.5"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Doctor Login (Demo)</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-900/80 hover:bg-emerald-800 text-white border border-emerald-700 transition"
                >
                  <span>Register Clinic</span>
                </Link>
              </>
            )}
          </div>

          {/* Features Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-emerald-800/60 text-xs text-emerald-200/90">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Prakriti Scoring Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Ashtavidha Pariksha</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Voice-to-Text Input</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>1-Click PDF / Print</span>
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
            <h3 className="font-bold text-base text-stone-900">Automated Prakriti Assessment</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Structured 8-parameter questionnaire that calculates real-time Vata, Pitta, and Kapha percentages
              and determines the patient's dominant constitution automatically.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Ashtavidha & Agni Pariksha</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Rapid clinical selection for Nadi (Pulse), Jihva (Tongue), Mala, Mutra, Sparsha, Druk, Shabda,
              and Aakriti with classical signs and modern descriptors.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Dual Diagnosis & Prescription</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Maps traditional Ayurvedic Rogas (e.g., Amavata, Amlapitta, Sandhigatavata) alongside modern ICD-11
              codes with integrated classical herbal formulary and Pathya-Apathya rules.
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
