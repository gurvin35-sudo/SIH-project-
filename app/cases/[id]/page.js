'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Printer,
  Calendar,
  User,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Activity,
  Sparkles,
  Pill,
  Trash2
} from 'lucide-react';
import { formatDate, formatABHA } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageContext';
import CasePrintView from '@/components/CasePrintView';

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();

  const [caseRecord, setCaseRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadCase() {
      try {
        setLoading(true);
        const res = await fetch(`/api/cases/${params.id}`);
        if (!res.ok) {
          setError('Case record not found');
          return;
        }
        const data = await res.json();
        setCaseRecord(data.caseRecord);
      } catch (err) {
        setError('Failed to load case record');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      loadCase();
    }
  }, [params.id]);

  const handleDeleteCase = async () => {
    if (!confirm('Are you sure you want to delete this case record? This cannot be undone.')) {
      return;
    }
    try {
      setDeleting(true);
      const res = await fetch(`/api/cases/${params.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push(`/patients/${caseRecord.patientId}`);
      } else {
        alert('Failed to delete case record');
        setDeleting(false);
      }
    } catch (e) {
      alert('Error deleting case record');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-stone-500">Loading case record...</p>
      </div>
    );
  }

  if (error || !caseRecord) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-stone-900">{error || 'Case record not found'}</h2>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patients</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Controls */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href={`/patients/${caseRecord.patientId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to {caseRecord.patient?.name}'s Case History</span>
        </Link>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleDeleteCase}
            disabled={deleting}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Case</span>
          </button>
        </div>
      </div>

      {/* Render the full Official AYUSH Printable & PDF Case Sheet */}
      <CasePrintView
        caseData={caseRecord}
        patient={caseRecord.patient}
        doctor={caseRecord.doctor}
      />
    </div>
  );
}
