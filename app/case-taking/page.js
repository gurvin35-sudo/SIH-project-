'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FilePlus2,
  Users,
  Search,
  UserPlus,
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { formatABHA, getDoshaColor } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageContext';

export default function CaseTakingLauncherPage() {
  const router = useRouter();
  const { language, t } = useLanguage();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await fetch(`/api/patients?q=${encodeURIComponent(search)}`);
        if (res.ok) {
          const data = await res.json();
          setPatients(data.patients || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, [search]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="text-center space-y-2 py-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <FilePlus2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          {language === 'hi' ? 'नया केस रिकॉर्ड शुरू करें' : 'Start New Clinical Case Record'}
        </h1>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          Select an existing patient from your clinic or register a new patient to begin case-taking.
        </p>
      </div>

      {/* Action Choice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/patients/new"
          className="p-5 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-extrabold uppercase text-emerald-300 block mb-1">
              New Patient
            </span>
            <h3 className="font-bold text-sm">Register & Start Case</h3>
            <p className="text-[11px] text-emerald-200/80 mt-1">
              Create a new patient with ABHA ID
            </p>
          </div>
          <UserPlus className="w-6 h-6 text-emerald-300 group-hover:scale-110 transition" />
        </Link>

        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase block mb-1">
              Existing Patient
            </span>
            <h3 className="font-bold text-sm text-stone-900">Choose from Directory</h3>
            <p className="text-[11px] text-stone-500 mt-1">
              Search by name, phone or ABHA ID below
            </p>
          </div>
        </div>
      </div>

      {/* Patient Search & Selection List */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient by name, phone, or ABHA ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="text-center py-10">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-1" />
            <p className="text-xs text-stone-400">Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 text-xs text-stone-500">
            No matching patients found.
          </div>
        ) : (
          <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto">
            {patients.map((p) => {
              const doshaStyle = getDoshaColor(p.prakritiType);
              return (
                <div
                  key={p.id}
                  className="py-3 px-2 flex items-center justify-between hover:bg-stone-50 rounded-xl transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-900">{p.name}</span>
                      <span className="text-[11px] text-stone-500">
                        ({p.age}y / {p.gender})
                      </span>
                      {p.prakritiType && (
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${doshaStyle.bg} ${doshaStyle.text} ${doshaStyle.border}`}
                        >
                          {p.prakritiType}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      📞 {p.contact} {p.abhaId && `• ABHA: ${formatABHA(p.abhaId)}`}
                    </div>
                  </div>

                  <Link
                    href={`/patients/${p.id}/case-taking`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                  >
                    <span>Start Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
