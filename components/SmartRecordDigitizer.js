'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  Edit3,
  Check,
  ShieldCheck,
  Plus,
  Clock,
  Pill,
  Stethoscope,
  Building2,
  Calendar,
  Layers,
  RotateCcw,
  FileCheck,
  File
} from 'lucide-react';
import PrescriptionReviewCard from './PrescriptionReviewCard';

export default function SmartRecordDigitizer({
  patientId = null,
  patientName = '',
  onDocumentSaved = null,
  isWizardMode = false,
}) {
  const fileInputRef = useRef(null);

  // Upload & File State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(''); // 'uploading' | 'ocr' | 'ai'
  const [errorMessage, setErrorMessage] = useState(null);

  // Extracted Data State
  const [digitizedDoc, setDigitizedDoc] = useState(null);

  // Saving State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle File Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  // Validate and select file
  const processSelectedFile = (file) => {
    setErrorMessage(null);
    setSaveSuccess(false);

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit. Please upload a smaller document image or PDF.');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) {
      setErrorMessage('Unsupported file type. Please upload a PNG, JPG, JPEG, WEBP image or PDF document.');
      return;
    }

    setSelectedFile(file);

    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  // Clear current upload
  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDigitizedDoc(null);
    setErrorMessage(null);
    setSaveSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger OCR & AI Extraction
  const handleStartDigitization = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSaveSuccess(false);
    setProcessingStage('uploading');

    try {
      // Step 1: Prepare FormData
      setProcessingStage('ocr');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileName', selectedFile.name);

      // Step 2: Call secure server-side OCR.Space endpoint
      const res = await fetch('/api/ai/ocr-extract', {
        method: 'POST',
        body: formData,
      });

      setProcessingStage('ai');
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to digitize document.');
      }

      setDigitizedDoc(data.document);
    } catch (err) {
      console.error('Smart Record Digitization Error:', err);
      setErrorMessage(err.message || 'An error occurred during OCR or AI processing.');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  // Quick Preset Loader (For Demos & Evaluation)
  const handleLoadDemoPreset = async (presetId) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSaveSuccess(false);
    setProcessingStage('ocr');

    try {
      const res = await fetch('/api/ai/ocr-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load demo preset');
      }

      setDigitizedDoc(data.document);
      setSelectedFile({ name: `${data.document.title}.png`, size: 245000 });
      setPreviewUrl(null);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load sample preset.');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  // Confirm and Save Record
  const handleConfirmAndSave = async (updatedPrescriptionData) => {
    if (!digitizedDoc) return;

    setIsSaving(true);
    setErrorMessage(null);

    const dataToSave = updatedPrescriptionData || digitizedDoc.extractedData;
    const finalDoc = {
      ...digitizedDoc,
      title: `${dataToSave.ayushSystem || 'AYUSH'} ${dataToSave.docType || digitizedDoc.docType || 'Prescription'} - ${dataToSave.docDate || digitizedDoc.docDate || new Date().toISOString().slice(0, 10)}`,
      docType: dataToSave.docType || digitizedDoc.docType || 'Prescription',
      docDate: dataToSave.docDate || digitizedDoc.docDate || new Date().toISOString().slice(0, 10),
      extractedData: dataToSave,
      summary: dataToSave.summary || `Digitized ${dataToSave.ayushSystem || 'AYUSH'} prescription with ${dataToSave.medications?.length || dataToSave.medicines?.length || 0} formulation(s).`
    };

    try {
      if (patientId) {
        const res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId,
            title: finalDoc.title,
            docType: finalDoc.docType,
            docDate: finalDoc.docDate,
            fileUrl: finalDoc.fileUrl || null,
            ocrText: finalDoc.ocrText || '',
            extractedData: finalDoc.extractedData,
            summary: finalDoc.summary,
            uploadedBy: 'patient'
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to save document to health records.');
        }

        setSaveSuccess(true);
        if (onDocumentSaved) {
          onDocumentSaved(data.document || finalDoc);
        }
      } else {
        // Wizard Mode (Step 3 of /patient-portal)
        setSaveSuccess(true);
        if (onDocumentSaved) {
          onDocumentSaved(finalDoc);
        }
      }
    } catch (err) {
      console.error('Save Error:', err);
      setErrorMessage(err.message || 'Failed to save record into health history.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Box (Only shown if no document digitized yet or after reset) */}
      {!digitizedDoc && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Feature Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-herb text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                </div>
                <h2 className="text-lg font-black text-stone-900 tracking-tight">
                  Smart Record Digitization
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  OCR.Space + AI Structuring
                </span>
              </div>
              <p className="text-xs text-stone-500 max-w-2xl">
                Upload your AYUSH or conventional prescription to extract medicines, formulation types, doses, Kala (timing), and Anupana into a digital record.
              </p>
            </div>

            {/* Demo Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[10px] uppercase font-bold text-stone-400 mr-1">Demo Presets:</span>
              <button
                type="button"
                onClick={() => handleLoadDemoPreset('sample_ayush_rx_1')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition"
                title="Load Sample Ayurvedic Prescription"
              >
                🌿 Ayurveda Rx
              </button>
              <button
                type="button"
                onClick={() => handleLoadDemoPreset('sample_rx_unani')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition"
                title="Load Sample Unani Prescription"
              >
                📜 Unani Rx
              </button>
              <button
                type="button"
                onClick={() => handleLoadDemoPreset('sample_discharge_1')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition"
                title="Load Sample Conventional Prescription"
              >
                💊 Conventional Rx
              </button>
            </div>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <span className="font-bold block">Digitization Issue Encountered</span>
                <p className="text-stone-700">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Upload & Drag-and-Drop Area */}
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-300 bg-stone-50/60'
                  : 'border-stone-300 hover:border-emerald-400 bg-stone-50/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFile ? (
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
                    <Upload className="w-7 h-7" />
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-stone-900">
                      Drag & drop your prescription or browse from device
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Ayurvedic, Unani, Siddha, or Conventional prescriptions, OPD slips, or medical records
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition transform hover:-translate-y-0.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Select Document / Photo</span>
                    </button>
                  </div>

                  <div className="pt-2 text-[10px] text-stone-400 flex items-center justify-center gap-2">
                    <span>Supported: PNG, JPG, JPEG, WEBP, PDF</span>
                    <span>•</span>
                    <span>Max file size: 10MB</span>
                  </div>
                </div>
              ) : (
                /* Selected File Preview Box */
                <div className="max-w-lg mx-auto space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-stone-200 flex items-center gap-4 text-left shadow-xs">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Document Preview"
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black shrink-0 border border-emerald-200">
                        <FileText className="w-8 h-8" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        Ready for Digitization
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 truncate mt-1">
                        {selectedFile.name}
                      </h4>
                      <span className="text-[10px] text-stone-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Document'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Remove selected file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Digitization Trigger Button */}
                  {!isProcessing && (
                    <button
                      type="button"
                      onClick={handleStartDigitization}
                      className="w-full py-3.5 rounded-2xl text-xs font-black bg-gradient-to-r from-emerald-700 to-herb hover:from-emerald-800 hover:to-emerald-900 text-white shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                      <span>Extract Medicines & Prescription Data</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Processing Progress Display */}
            {isProcessing && (
              <div className="p-6 rounded-3xl bg-emerald-50/80 border border-emerald-200 text-center space-y-4 animate-in fade-in">
                <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-emerald-950">
                    {processingStage === 'uploading' && '1. Uploading Medical Document...'}
                    {processingStage === 'ocr' && '2. OCR.Space Reading Text & Handwritten Notes...'}
                    {processingStage === 'ai' && '3. AI Extracting Formulation Types, Doses & Anupana...'}
                  </h4>
                  <p className="text-xs text-stone-600 max-w-md mx-auto">
                    Extracting Churna, Vati, Kwath, Taila, dosages, Kala (timing), and Anupana with medical safety guardrails.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 max-w-sm mx-auto text-[10px] font-bold">
                  <span className={`px-2.5 py-1 rounded-full ${processingStage === 'uploading' ? 'bg-emerald-700 text-white' : 'bg-emerald-200 text-emerald-900'}`}>
                    1. Upload
                  </span>
                  <span className="text-stone-400">→</span>
                  <span className={`px-2.5 py-1 rounded-full ${processingStage === 'ocr' ? 'bg-emerald-700 text-white' : processingStage === 'ai' ? 'bg-emerald-200 text-emerald-900' : 'bg-stone-200 text-stone-500'}`}>
                    2. OCR.Space
                  </span>
                  <span className="text-stone-400">→</span>
                  <span className={`px-2.5 py-1 rounded-full ${processingStage === 'ai' ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-500'}`}>
                    3. AI Extraction
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block">Prescription Successfully Digitized & Confirmed!</span>
              <p className="text-emerald-800 text-[11px]">
                The structured formulations and clinical findings have been added to your Digital Health Record.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearSelection}
            className="px-3 py-1.5 bg-white text-emerald-900 rounded-xl border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition shrink-0"
          >
            + Digitize Another Prescription
          </button>
        </div>
      )}

      {/* Structured Prescription Review Card Component */}
      {digitizedDoc && (
        <PrescriptionReviewCard
          prescription={digitizedDoc.extractedData}
          rawOcrText={digitizedDoc.ocrText}
          documentPreviewUrl={previewUrl || digitizedDoc.fileUrl}
          fileName={selectedFile?.name || digitizedDoc.title}
          onConfirm={handleConfirmAndSave}
          onCancel={handleClearSelection}
        />
      )}
    </div>
  );
}
