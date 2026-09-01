'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Users,
  FilePlus2,
  Calendar,
  Activity,
  ChevronRight,
  Sparkles,
  Search,
  UserPlus,
  Clock,
  CheckCircle2,
  TrendingUp,
  FileText,
  ShieldCheck,
  Stethoscope,
  HeartPulse
} from 'lucide-react';
import { formatDate, formatABHA, getDoshaColor } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageContext';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { language, t } = useLanguage();

  const [stats, setStats] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentCases(data.recentCases || []);
          setRecentPatients(data.recentPatients || []);
          setUpcomingFollowUps(data.upcomingFollowUps || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome & Doctor Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-herb to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-emerald-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-amber-950">
              AYUSH Clinical Console
            </span>
            <span className="text-xs text-emerald-300 font-medium">
              {session?.user?.clinicName || 'Ayurvedic Wellness & Research Clinic'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {session?.user?.name || 'Dr. Ananya Sharma'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
            Streamlined clinical case-taking, real-time Prakriti intelligence, and ABHA-linked patient records.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/patients"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-emerald-950 shadow-md shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>{t('startCaseNow')}</span>
          </Link>
          <Link
            href="/patients/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-800/90 hover:bg-emerald-800 text-white border border-emerald-600/60 shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('addPatient')}</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase">{t('totalPatients')}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-900">
              {loading ? '—' : stats?.totalPatients ?? 0}
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Registered
            </span>
          </div>
        </div>

        {/* Total Cases */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase">Total Case Records</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-900">
              {loading ? '—' : stats?.totalCases ?? 0}
            </span>
            <span className="text-xs text-sky-600 font-semibold">Logged</span>
          </div>
        </div>

        {/* Cases Today */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase">{t('casesToday')}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-900">
              {loading ? '—' : stats?.casesToday ?? 0}
            </span>
            <span className="text-xs text-stone-500">Consultations today</span>
          </div>
        </div>

        {/* Upcoming Followups */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase">{t('activeFollowups')}</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-900">
              {loading ? '—' : stats?.upcomingFollowUpsCount ?? 0}
            </span>
            <span className="text-xs text-purple-600 font-semibold">Next 14 Days</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Prakriti Breakdown & Upcoming Followups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prakriti Distribution Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-sm text-stone-900 uppercase tracking-wide">
                {t('prakritiDistribution')} ({language === 'hi' ? 'रोगी प्रकृति विश्लेषण' : 'Patient Constitution Analytics'})
              </h2>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">Auto-calculated</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats?.prakritiCounts &&
              Object.entries(stats.prakritiCounts)
                .filter(([key]) => key !== 'Unassessed')
                .map(([name, count]) => {
                  const style = getDoshaColor(name);
                  return (
                    <div
                      key={name}
                      className={`p-3 rounded-xl border ${style.bg} ${style.border} flex flex-col justify-between`}
                    >
                      <span className="text-[11px] font-bold text-stone-700 truncate">{name}</span>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className={`text-xl font-extrabold ${style.text}`}>{count}</span>
                        <span className="text-[10px] text-stone-500">patients</span>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Upcoming Followups Box */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <h2 className="font-bold text-sm text-stone-900 uppercase tracking-wide">
                {t('activeFollowups')}
              </h2>
            </div>
            <span className="text-[11px] text-purple-700 font-bold">14 Days</span>
          </div>

          {upcomingFollowUps.length === 0 ? (
            <div className="text-center py-8 text-xs text-stone-400 italic">
              No follow-ups scheduled for the upcoming 14 days.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingFollowUps.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-stone-50 hover:bg-emerald-50/50 rounded-xl border border-stone-200 transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-stone-900">{item.patient?.name}</div>
                    <div className="text-[11px] text-stone-500">
                      📅 {formatDate(item.followUpDate)}
                    </div>
                  </div>
                  <Link
                    href={`/patients/${item.patientId}`}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-stone-200"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Case Records & Quick Patient List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-700" />
              <h2 className="font-bold text-sm text-stone-900 uppercase tracking-wide">
                {t('recentCases')}
              </h2>
            </div>
            <Link
              href="/patients"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>{t('viewAllPatients')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentCases.length === 0 ? (
            <div className="text-center py-10 text-xs text-stone-400 italic">
              {t('noCasesYet')}
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {recentCases.map((c) => {
                const doshaStyle = getDoshaColor(c.prakritiResult || c.patient?.prakritiType);
                return (
                  <div
                    key={c.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/70 rounded-xl px-2 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-stone-900">{c.patient?.name}</span>
                        <span className="text-[11px] text-stone-500">
                          ({c.patient?.age}y / {c.patient?.gender})
                        </span>
                        {c.patient?.abhaId && (
                          <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                            ABHA: {formatABHA(c.patient.abhaId)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-900">
                          {c.ayurvedicDiagnosis}
                        </span>
                        {c.modernDiagnosis && (
                          <span className="text-[11px] text-stone-500">
                            • {c.modernDiagnosis}
                          </span>
                        )}
                        {(c.prakritiResult || c.patient?.prakritiType) && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${doshaStyle.bg} ${doshaStyle.text} ${doshaStyle.border}`}
                          >
                            {c.prakritiResult || c.patient?.prakritiType}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-stone-400">{formatDate(c.visitDate)}</span>
                      <Link
                        href={`/cases/${c.id}`}
                        className="px-3 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition"
                      >
                        {t('viewDetails')}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Recent Patients Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-stone-700" />
              <h2 className="font-bold text-sm text-stone-900 uppercase tracking-wide">
                {t('recentPatients')}
              </h2>
            </div>
            <Link
              href="/patients/new"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              + Add
            </Link>
          </div>

          {recentPatients.length === 0 ? (
            <div className="text-center py-8 text-xs text-stone-400 italic">
              {t('noPatientsYet')}
            </div>
          ) : (
            <div className="space-y-3">
              {recentPatients.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-stone-50 hover:bg-stone-100/80 rounded-xl border border-stone-200 transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-stone-900">{p.name}</div>
                    <div className="text-[11px] text-stone-500">
                      {p.gender}, {p.age} Yrs • {p.contact}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/patients/${p.id}/case-taking`}
                      className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition"
                      title="Take New Case"
                    >
                      + Case
                    </Link>
                    <Link
                      href={`/patients/${p.id}`}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white text-stone-700 hover:bg-stone-50 rounded-lg border border-stone-300 transition"
                    >
                      History
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
