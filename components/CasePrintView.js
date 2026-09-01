'use client';

import React, { useRef, useState } from 'react';
import { Printer, Download, Leaf, FileText, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { formatDate, formatABHA } from '@/lib/utils';
import { useLanguage } from './LanguageContext';

export default function CasePrintView({ caseData, patient, doctor }) {
  const { language } = useLanguage();
  const printRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  let medicines = [];
  try {
    if (caseData?.prescription) {
      medicines = typeof caseData.prescription === 'string'
        ? JSON.parse(caseData.prescription)
        : caseData.prescription;
    }
  } catch (e) {
    medicines = [];
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      setIsExporting(true);
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `AyushCase_${(patient?.name || 'Record').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Could not generate PDF. You can use Print -> Save as PDF instead.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Buttons (Hidden when printing) */}
      <div className="no-print flex items-center justify-between bg-stone-100 p-3 rounded-xl border border-stone-200">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-bold text-stone-700">Official AYUSH Clinical Record & Prescription</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" />
            <span>Print Slip</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable Paper Container */}
      <div
        ref={printRef}
        className="print-page bg-white text-stone-900 p-8 sm:p-10 rounded-2xl shadow-md border border-stone-200 max-w-4xl mx-auto space-y-6 text-xs"
      >
        {/* Header Block */}
        <div className="border-b-2 border-emerald-800 pb-5">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-emerald-950 tracking-tight uppercase">
                    {doctor?.clinicName || 'AYUSH Holistic Healthcare Centre'}
                  </h1>
                  <p className="text-[11px] text-stone-600 font-medium">
                    Department of {doctor?.specialty || 'Ayurvedic Medicine & Panchakarma'}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-0.5">
              <div className="font-bold text-sm text-stone-900">{doctor?.name || 'Dr. Ananya Sharma'}</div>
              <div className="text-[11px] text-emerald-800 font-semibold">
                Reg No: {doctor?.regNumber || 'AYUSH-DEL-2018-7742'}
              </div>
              <div className="text-[10px] text-stone-500">{doctor?.phone || '+91 98765 43210'}</div>
            </div>
          </div>
        </div>

        {/* Patient Demographics Card */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-[10px] text-stone-500 uppercase font-semibold block">Patient Name</span>
            <span className="font-bold text-stone-900 text-xs">{patient?.name || '—'}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 uppercase font-semibold block">Age / Gender</span>
            <span className="font-bold text-stone-900 text-xs">
              {patient?.age ? `${patient.age} Yrs` : '—'} / {patient?.gender || '—'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 uppercase font-semibold block">ABHA ID (Ayushman)</span>
            <span className="font-bold text-emerald-800 text-xs font-mono">
              {patient?.abhaId ? formatABHA(patient.abhaId) : 'Not registered'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 uppercase font-semibold block">Visit Date</span>
            <span className="font-bold text-stone-900 text-xs">{formatDate(caseData?.visitDate || new Date())}</span>
          </div>
        </div>

        {/* Chief Complaint & Prakriti */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-3.5 bg-white border border-stone-200 rounded-xl space-y-1.5">
            <h3 className="font-bold text-emerald-950 text-xs uppercase flex items-center gap-1.5">
              <span>Chief Complaint & Clinical Summary</span>
            </h3>
            <p className="text-stone-800 leading-relaxed font-medium">
              {caseData?.chiefComplaint || 'No complaints noted.'}
            </p>
            {caseData?.duration && (
              <p className="text-[11px] text-stone-500">
                <strong>Duration:</strong> {caseData.duration}
              </p>
            )}
            {caseData?.hpi && (
              <p className="text-[11px] text-stone-600">
                <strong>HPI:</strong> {caseData.hpi}
              </p>
            )}
          </div>

          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
            <h3 className="font-bold text-emerald-900 text-xs uppercase">Prakriti (Constitution)</h3>
            <div className="text-xs font-extrabold text-emerald-950">
              {caseData?.prakritiResult || patient?.prakritiType || 'Tridoshic (Balanced)'}
            </div>
            <div className="space-y-1 pt-1 text-[11px] text-stone-700">
              <div className="flex justify-between">
                <span>Vata (वात):</span> <span className="font-bold">{caseData?.vataScore || 0} pts</span>
              </div>
              <div className="flex justify-between">
                <span>Pitta (पित्त):</span> <span className="font-bold">{caseData?.pittaScore || 0} pts</span>
              </div>
              <div className="flex justify-between">
                <span>Kapha (कफ):</span> <span className="font-bold">{caseData?.kaphaScore || 0} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ashtavidha Pariksha Table */}
        <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
          <h3 className="font-bold text-stone-900 text-xs uppercase">
            Ashtavidha Pariksha (Eight-Fold Clinical Examination)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[10px]">Nadi (Pulse):</span>
              <span className="font-semibold text-stone-800">{caseData?.nadiPariksha || 'Prakruta'}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[10px]">Jihva (Tongue):</span>
              <span className="font-semibold text-stone-800">{caseData?.jihvaPariksha || 'Nirama'}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[10px]">Mala (Bowel):</span>
              <span className="font-semibold text-stone-800">{caseData?.malaPariksha || 'Prakruta'}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[10px]">Mutra (Urine):</span>
              <span className="font-semibold text-stone-800">{caseData?.mutraPariksha || 'Prakruta'}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[10px]">Sparsha (Touch):</span>
              <span className="font-semibold text-stone-800">{caseData?.sparshaPariksha || 'Sama'}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[10px]">Druk (Eyes):</span>
              <span className="font-semibold text-stone-800">{caseData?.drukPariksha || 'Prakruta'}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[10px]">Shabda (Voice):</span>
              <span className="font-semibold text-stone-800">{caseData?.shabdaPariksha || 'Prakruta'}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-stone-200">
              <span className="text-stone-500 block text-[10px]">Agni / Koshta:</span>
              <span className="font-semibold text-stone-800">
                {caseData?.agniType || 'Samagni'} / {caseData?.koshtaType || 'Madhyama'}
              </span>
            </div>
          </div>
        </div>

        {/* Dual Diagnosis Block */}
        <div className="p-3.5 bg-emerald-950 text-white rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider block">
              Ayurvedic Diagnosis (रोग निदान)
            </span>
            <span className="text-sm font-black text-white block mt-0.5">
              {caseData?.ayurvedicDiagnosis || 'Not specified'}
            </span>
            {caseData?.prognosis && (
              <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                Prognosis: {caseData.prognosis}
              </span>
            )}
          </div>
          <div>
            <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider block">
              Modern / ICD-11 Diagnosis
            </span>
            <span className="text-xs font-bold text-amber-100 block mt-0.5">
              {caseData?.modernDiagnosis || 'Correlative diagnosis not specified'}
            </span>
          </div>
        </div>

        {/* Prescription Table (Rx) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-stone-300 pb-1.5">
            <span className="text-base font-black text-emerald-950 font-serif">℞</span>
            <h3 className="font-bold text-emerald-950 text-xs uppercase">
              Chikitsa & Prescription (औषध योग)
            </h3>
          </div>

          {medicines.length > 0 ? (
            <table className="w-full border-collapse border border-stone-300 text-left text-xs">
              <thead>
                <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-300">
                  <th className="p-2 w-8">#</th>
                  <th className="p-2">Medicine / Form</th>
                  <th className="p-2">Dose (Matra)</th>
                  <th className="p-2">Anupana (Vehicle)</th>
                  <th className="p-2">Timing (Kala)</th>
                  <th className="p-2">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {medicines.map((m, i) => (
                  <tr key={i} className="hover:bg-stone-50">
                    <td className="p-2 font-bold text-stone-500">{i + 1}</td>
                    <td className="p-2 font-bold text-stone-900">
                      {m.name} {m.form ? <span className="font-normal text-stone-500">({m.form})</span> : ''}
                    </td>
                    <td className="p-2 text-stone-800">{m.dose || '—'}</td>
                    <td className="p-2 text-stone-800">{m.anupana || 'Warm water'}</td>
                    <td className="p-2 text-stone-800">{m.timing || 'After meals'}</td>
                    <td className="p-2 text-stone-800">{m.duration || '14 days'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-stone-500 italic p-2">No medications prescribed.</p>
          )}
        </div>

        {/* Panchakarma Therapies */}
        {caseData?.panchakarmaAdvice && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
            <h4 className="font-bold text-amber-900 text-xs uppercase">Panchakarma / External Therapies Recommended</h4>
            <p className="text-stone-800">{caseData.panchakarmaAdvice}</p>
          </div>
        )}

        {/* Pathya (DOs) and Apathya (DONTs) */}
        {(caseData?.pathyaDiet || caseData?.apathyaDiet) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {caseData?.pathyaDiet && (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
                <h4 className="font-bold text-emerald-900 text-[11px] uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pathya (Diet & Habits - DOs)</span>
                </h4>
                <p className="text-stone-700 text-[11px]">{caseData.pathyaDiet}</p>
              </div>
            )}
            {caseData?.apathyaDiet && (
              <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl space-y-1">
                <h4 className="font-bold text-rose-900 text-[11px] uppercase flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] font-bold">
                    ✕
                  </span>
                  <span>Apathya (Diet & Habits - DONTs)</span>
                </h4>
                <p className="text-stone-700 text-[11px]">{caseData.apathyaDiet}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer & Doctor Signature */}
        <div className="pt-6 border-t border-stone-300 flex justify-between items-end">
          <div>
            {caseData?.followUpDate && (
              <div className="text-xs font-bold text-emerald-900">
                Next Follow-up Visit: {formatDate(caseData.followUpDate)}
              </div>
            )}
            <p className="text-[10px] text-stone-400 mt-1">
              Generated securely via AyushCase Smart Automation Software
            </p>
          </div>
          <div className="text-right">
            <div className="w-40 border-b border-stone-400 mb-1" />
            <div className="font-bold text-xs text-stone-900">{doctor?.name || 'Vaidya Signature'}</div>
            <div className="text-[10px] text-stone-500">Registered AYUSH Practitioner</div>
          </div>
        </div>
      </div>
    </div>
  );
}
