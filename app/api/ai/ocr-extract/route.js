import { NextResponse } from 'next/server';
import {
  extractPrescriptionFromOcr,
  validateAndNormalizePrescription
} from '@/lib/prescription-extractor';

export const dynamic = 'force-dynamic';

// High-fidelity AYUSH sample document presets for instant demonstrations & evaluation
export const SAMPLE_OCR_PRESETS = [
  {
    id: 'sample_ayush_rx_1',
    title: 'Sanjeevani Ayurvedic Chikitsalaya - Prescription OPD',
    docType: 'Prescription',
    docDate: '2026-02-15',
    fileUrl: '/samples/prescription_ayush.png',
    ocrText: `SANJEEVANI AYURVEDIC CLINIC & PANCHAKARMA CENTRE
Reg. No: AYUSH/DL/2019/8492
Vaiddya Dr. Rajeshwar Sharma (BAMS, MD Ayu)
Date: 15-Feb-2026

Patient Name: Rajesh Kumar | Age: 46 Yrs / Male | Contact: 9811234567
Chief Complaints / Symptoms: Sandhigata Vata (Bilateral knee joint pain with severe morning stiffness for 3 months), Agnimandya (loss of appetite), Constipation.

Diagnosis / Roga: Sandhigata Vata (Osteoarthritis Knee) with Vata-Kapha Prakopa.

Chikitsa / Prescribed Medicines:
1. Yogaraj Guggulu (500mg) - 2 tablets Twice daily (BD) after food with lukewarm water (Anupana: Ushnodaka) x 30 days
2. Dashamularishta (450ml) - 20ml with equal water Twice daily after food x 30 days
3. Maharasnadi Kwatha Choorna - 15ml decoction twice daily before meals with warm water x 30 days
4. Mahanarayana Taila - Warm local Abhyanga (massage) followed by hot water fomentation (Nadi Sweda) daily.

Panchakarma / Treatment: Janu Basti with Ksheerabala Taila - 7 sessions advised.
Follow-up: After 15 days on 02-March-2026.
Pathya (Diet Advice): Avoid cold water, curd at night, fermented food, and heavy pulses. Drink warm ginger water.`,
    extractedData: {
      documentType: 'AYUSH_PRESCRIPTION',
      ayushSystem: 'Ayurveda',
      patientName: 'Rajesh Kumar',
      docDate: '2026-02-15',
      docType: 'Prescription',
      doctor: 'Dr. Rajeshwar Sharma (BAMS, MD Ayu)',
      hospitalClinic: 'Sanjeevani Ayurvedic Clinic & Panchakarma Centre',
      diagnosis: 'Sandhigata Vata (Osteoarthritis Knee) with Vata-Kapha Prakopa',
      symptoms: 'Bilateral knee joint pain with severe morning stiffness for 3 months, Agnimandya (loss of appetite), Constipation',
      medications: [
        {
          name: 'Yogaraj Guggulu',
          form: 'Guggulu / Vati',
          dose: '500mg (2 tabs)',
          frequency: 'Twice daily (BD)',
          duration: '30 days',
          timing: 'After food',
          anupana: 'Lukewarm water (Ushnodaka)',
          pathya: null,
          apathya: null,
          route: 'Oral',
          instructions: null
        },
        {
          name: 'Dashamularishta',
          form: 'Arishta',
          dose: '20ml',
          frequency: 'Twice daily (BD)',
          duration: '30 days',
          timing: 'After food',
          anupana: 'Equal quantity of water',
          pathya: null,
          apathya: null,
          route: 'Oral',
          instructions: null
        },
        {
          name: 'Maharasnadi Kwatha',
          form: 'Kwath / Churna',
          dose: '15ml decoction',
          frequency: 'Twice daily (BD)',
          duration: '30 days',
          timing: 'Before meals',
          anupana: 'Warm water',
          pathya: null,
          apathya: null,
          route: 'Oral',
          instructions: null
        },
        {
          name: 'Mahanarayana Taila',
          form: 'Taila',
          dose: 'Local application',
          frequency: 'Daily once/twice',
          duration: '30 days',
          timing: 'Daily',
          anupana: null,
          pathya: null,
          apathya: null,
          route: 'External application (Abhyanga with Nadi Sweda)',
          instructions: 'Followed by hot water fomentation'
        }
      ],
      medicines: [
        {
          name: 'Yogaraj Guggulu',
          form: 'Guggulu / Vati',
          dosage: '500mg (2 tabs)',
          dose: '500mg (2 tabs)',
          frequency: 'Twice daily (BD)',
          duration: '30 days',
          timing: 'After food',
          anupana: 'Lukewarm water (Ushnodaka)',
          route: 'Oral'
        },
        {
          name: 'Dashamularishta',
          form: 'Arishta',
          dosage: '20ml',
          dose: '20ml',
          frequency: 'Twice daily (BD)',
          duration: '30 days',
          timing: 'After food',
          anupana: 'Equal quantity of water',
          route: 'Oral'
        },
        {
          name: 'Maharasnadi Kwatha',
          form: 'Kwath / Churna',
          dosage: '15ml decoction',
          dose: '15ml decoction',
          frequency: 'Twice daily (BD)',
          duration: '30 days',
          timing: 'Before meals',
          anupana: 'Warm water',
          route: 'Oral'
        },
        {
          name: 'Mahanarayana Taila',
          form: 'Taila',
          dosage: 'Local application',
          dose: 'Local application',
          frequency: 'Daily once/twice',
          duration: '30 days',
          timing: 'Daily',
          anupana: null,
          route: 'External application (Abhyanga)'
        }
      ],
      treatment: 'Janu Basti with Ksheerabala Taila (7 sessions advised)',
      procedures: [{ name: 'Janu Basti', details: 'With Ksheerabala Taila (7 sessions advised)' }],
      followUp: 'After 15 days (02-March-2026)',
      pathya: 'Avoid cold water, curd at night, fermented food, and heavy pulses. Drink warm ginger water.',
      otherInfo: 'Diet Advice (Pathya): Avoid cold water, night curds, fermented food; take warm ginger water.',
      summary: 'Ayurvedic prescription for Sandhigata Vata with classical Guggulu, Arishta, Kwatha formulations and Janu Basti treatment advised.'
    }
  },
  {
    id: 'sample_rx_unani',
    title: 'National Institute of Unani Medicine - OPD Clinical Sheet',
    docType: 'Prescription',
    docDate: '2026-01-20',
    fileUrl: '/samples/prescription_unani.png',
    ocrText: `NATIONAL INSTITUTE OF UNANI MEDICINE (NIUM)
Moalajat (Medicine) OPD | Date: 20-Jan-2026
Hakim Dr. M. A. Qasmi | Reg No: U-4412
Patient: Rajesh Kumar | Age: 46 / Male

Diagnosis (Tashkhees): Waja-ul-Mafasil (Arthritis / Joint Pain) with Balghami Mizaj (Phlegmatic derangement).
Symptoms: Pain in knees, cold aggravation, morning stiffness, sluggish digestion.

Nuskha (Rx / Medicines):
1. Majun Suranjan - 5g at bedtime with Arq Badiyan (Aniseed distillate) x 21 days
2. Habb-e-Suranjan - 2 pills Twice daily after meals x 21 days
3. Roghan Suranjan - External massage over painful joints twice daily.
4. Sharbat Deenar - 20ml in morning before breakfast x 21 days.

Ilaj-bit-Tadbeer (Regimenal Therapy): Hijama (Wet Cupping) over knee joint advised in next visit.
Tadbeer: Avoid cold/sour foods; use ginger and cumin in diet.`,
    extractedData: {
      documentType: 'AYUSH_PRESCRIPTION',
      ayushSystem: 'Unani',
      patientName: 'Rajesh Kumar',
      docDate: '2026-01-20',
      docType: 'Prescription',
      doctor: 'Hakim Dr. M. A. Qasmi',
      hospitalClinic: 'National Institute of Unani Medicine (NIUM)',
      diagnosis: 'Waja-ul-Mafasil (Joint Pain/Arthritis) due to Balghami Mizaj',
      symptoms: 'Pain in knee joints, cold aggravation, morning stiffness, sluggish digestion',
      medications: [
        {
          name: 'Majun Suranjan',
          form: 'Majun',
          dose: '5 grams',
          frequency: 'Once daily at bedtime',
          duration: '21 days',
          timing: 'Bedtime',
          anupana: 'Arq Badiyan (Aniseed distillate)',
          pathya: null,
          apathya: null,
          route: 'Oral',
          instructions: null
        },
        {
          name: 'Habb-e-Suranjan',
          form: 'Habb',
          dose: '2 pills',
          frequency: 'Twice daily',
          duration: '21 days',
          timing: 'After meals',
          anupana: 'Water',
          pathya: null,
          apathya: null,
          route: 'Oral',
          instructions: null
        },
        {
          name: 'Roghan Suranjan',
          form: 'Roghan',
          dose: 'External application',
          frequency: 'Twice daily',
          duration: '21 days',
          timing: 'Twice daily',
          anupana: null,
          pathya: null,
          apathya: null,
          route: 'External application (Local massage over joints)',
          instructions: null
        },
        {
          name: 'Sharbat Deenar',
          form: 'Sharbat',
          dose: '20ml',
          frequency: 'Once daily (OD)',
          duration: '21 days',
          timing: 'Morning before breakfast',
          anupana: 'Lukewarm water',
          pathya: null,
          apathya: null,
          route: 'Oral',
          instructions: null
        }
      ],
      medicines: [
        {
          name: 'Majun Suranjan',
          form: 'Majun',
          dosage: '5 grams',
          dose: '5 grams',
          frequency: 'Once daily at bedtime',
          duration: '21 days',
          timing: 'Bedtime',
          anupana: 'Arq Badiyan (Aniseed distillate)',
          route: 'Oral'
        },
        {
          name: 'Habb-e-Suranjan',
          form: 'Habb',
          dosage: '2 pills',
          dose: '2 pills',
          frequency: 'Twice daily',
          duration: '21 days',
          timing: 'After meals',
          anupana: 'Water',
          route: 'Oral'
        },
        {
          name: 'Roghan Suranjan',
          form: 'Roghan',
          dosage: 'External application',
          dose: 'External application',
          frequency: 'Twice daily',
          duration: '21 days',
          timing: 'Twice daily',
          anupana: null,
          route: 'External application'
        },
        {
          name: 'Sharbat Deenar',
          form: 'Sharbat',
          dosage: '20ml',
          dose: '20ml',
          frequency: 'Once daily (OD)',
          duration: '21 days',
          timing: 'Morning before breakfast',
          anupana: 'Lukewarm water',
          route: 'Oral'
        }
      ],
      treatment: 'Ilaj-bit-Tadbeer: Hijama (Cupping Therapy) planned for next visit',
      procedures: [{ name: 'Hijama (Wet Cupping)', details: 'Over knee joint advised in next visit' }],
      followUp: 'After 3 weeks on 10-Feb-2026',
      pathya: 'Use ginger and cumin in diet.',
      apathya: 'Avoid cold and sour foods.',
      otherInfo: 'Diet advice: Avoid cold and sour foods; include ginger and cumin in daily meals.',
      summary: 'Unani prescription for Waja-ul-Mafasil with classical Suranjan formulations and Hijama therapy planned.'
    }
  },
  {
    id: 'sample_discharge_1',
    title: 'Max Healthcare - Inpatient Discharge Summary',
    docType: 'Discharge Summary',
    docDate: '2025-11-20',
    fileUrl: '/samples/discharge_summary.png',
    ocrText: `MAX HEALTHCARE HOSPITAL
DISCHARGE SUMMARY
Patient: Rajesh Kumar | IPD No: 982341 | Admission: 18-Nov-2025 | Discharge: 20-Nov-2025
Chief Complaint: Acute lumbar spasm and severe lower back pain radiating to left thigh.
Diagnosis: Acute Lumbar Radiculopathy (L4-L5 disc bulge on MRI).
Procedures: Conservative medical stabilization, epidural analgesic trigger point infiltration.
Discharge Medications:
- Tab Pregabalin 75mg at night x 14 days
- Tab Methylcobalamin 1500 mcg OD x 30 days
- Lumbar belt support while walking.`,
    extractedData: {
      documentType: 'CONVENTIONAL_PRESCRIPTION',
      ayushSystem: 'Allopathy',
      patientName: 'Rajesh Kumar',
      docDate: '2025-11-20',
      docType: 'Discharge Summary',
      doctor: 'Dr. V. K. Mehta',
      hospitalClinic: 'Max Healthcare Hospital',
      diagnosis: 'Acute Lumbar Radiculopathy (L4-L5 disc bulge on MRI)',
      symptoms: 'Acute lumbar spasm and severe lower back pain radiating to left thigh',
      medications: [
        {
          name: 'Pregabalin',
          form: 'Tablet',
          dose: '75mg',
          frequency: 'Once daily at bedtime',
          duration: '14 days',
          timing: 'Bedtime',
          anupana: null,
          pathya: null,
          apathya: null,
          route: 'Oral',
          instructions: null
        },
        {
          name: 'Methylcobalamin',
          form: 'Tablet',
          dose: '1500 mcg',
          frequency: 'Once daily (OD)',
          duration: '30 days',
          timing: 'Morning',
          anupana: null,
          pathya: null,
          apathya: null,
          route: 'Oral',
          instructions: null
        }
      ],
      medicines: [
        {
          name: 'Pregabalin',
          form: 'Tablet',
          dosage: '75mg',
          dose: '75mg',
          frequency: 'Once daily at bedtime',
          duration: '14 days',
          timing: 'Bedtime',
          anupana: null,
          route: 'Oral'
        },
        {
          name: 'Methylcobalamin',
          form: 'Tablet',
          dosage: '1500 mcg',
          dose: '1500 mcg',
          frequency: 'Once daily (OD)',
          duration: '30 days',
          timing: 'Morning',
          anupana: null,
          route: 'Oral'
        }
      ],
      treatment: 'Epidural Analgesic Trigger Point Infiltration, Lumbar MRI',
      procedures: [{ name: 'Epidural Analgesic Trigger Point Infiltration', details: 'L4-L5 stabilization' }],
      followUp: 'Orthopedic OPD review after 2 weeks',
      otherInfo: 'Lumbar belt support recommended while walking. Avoid forward bending.',
      summary: 'Hospitalization for acute L4-L5 lumbar disc radiculopathy managed conservatively with neural stabilizers and physiotherapy.'
    }
  }
];

export async function GET(request) {
  return NextResponse.json({ presets: SAMPLE_OCR_PRESETS });
}

/**
 * Call OCR.Space API securely with server-side environment key
 */
async function callOcrSpaceApi({ base64Image, buffer, mimeType, fileName }) {
  const apiKey = (process.env.OCR_SPACE_API_KEY || process.env.OCR_API_KEY || 'helloworld').trim();
  const ocrApiUrl = 'https://api.ocr.space/parse/image';

  const formData = new FormData();
  formData.append('apikey', apiKey);
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('OCREngine', '2'); // Engine 2 is best for tables, digits, and prescriptions
  formData.append('scale', 'true');
  formData.append('isTable', 'true');
  formData.append('detectOrientation', 'true');

  let detectedType = 'JPG';
  const nameLower = (fileName || '').toLowerCase();
  const mimeLower = (mimeType || '').toLowerCase();
  if (nameLower.endsWith('.png') || mimeLower.includes('png')) detectedType = 'PNG';
  else if (nameLower.endsWith('.pdf') || mimeLower.includes('pdf')) detectedType = 'PDF';
  else if (nameLower.endsWith('.webp') || mimeLower.includes('webp')) detectedType = 'WEBP';
  else if (nameLower.endsWith('.gif') || mimeLower.includes('gif')) detectedType = 'GIF';
  formData.append('filetype', detectedType);

  if (buffer) {
    const blob = new Blob([buffer], { type: mimeType || 'image/jpeg' });
    formData.append('file', blob, fileName || 'document.jpg');
  } else if (base64Image) {
    formData.append('base64Image', base64Image);
  } else {
    throw new Error('No image or document payload provided for OCR processing.');
  }

  const res = await fetch(ocrApiUrl, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    throw new Error(`OCR.Space API request failed with status: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.IsErroredOnProcessing) {
    const errorDetails = data.ErrorMessage ? data.ErrorMessage.join(' ') : (data.ErrorDetails || 'OCR Processing failed');
    throw new Error(`OCR.Space processing error: ${errorDetails}`);
  }

  if (!data.ParsedResults || data.ParsedResults.length === 0) {
    throw new Error('OCR completed but returned no parsed results.');
  }

  const extractedText = data.ParsedResults
    .map(result => result.ParsedText || '')
    .filter(Boolean)
    .join('\n\n')
    .trim();

  if (!extractedText) {
    throw new Error('Document is empty or unreadable. No text could be detected.');
  }

  return {
    rawText: extractedText,
    processingTime: data.ProcessingTimeInMilliseconds,
    exitCode: data.OCRExitCode
  };
}

export async function POST(request) {
  try {
    let body = {};
    let isFormData = false;
    let fileBuffer = null;
    let mimeType = 'image/jpeg';
    let fileName = '';
    let base64Image = null;
    let presetId = null;
    let rawTextInput = null;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      isFormData = true;
      const formData = await request.formData();
      const file = formData.get('file');
      presetId = formData.get('presetId');
      rawTextInput = formData.get('rawText');

      if (file && typeof file === 'object') {
        fileName = file.name || 'medical_document.jpg';
        mimeType = file.type || 'image/jpeg';
        const bytes = await file.arrayBuffer();
        fileBuffer = Buffer.from(bytes);
      }
    } else {
      body = await request.json().catch(() => ({}));
      presetId = body.presetId;
      rawTextInput = body.rawText;
      fileName = body.fileName || '';
      base64Image = body.fileDataUrl || body.base64Image || null;
    }

    // 1. Instant Preset Load (For immediate high-fidelity testing & Hackathon demos)
    if (presetId) {
      const match = SAMPLE_OCR_PRESETS.find(p => p.id === presetId);
      if (match) {
        return NextResponse.json({
          success: true,
          document: match,
          ocrEngine: 'Instant High-Fidelity Preset',
          aiProvider: 'AyushCase AYUSH Knowledge Engine'
        });
      }
    }

    // 2. OCR Text Extraction via OCR.Space
    let extractedOcrText = '';
    let ocrEngineUsed = 'OCR.Space (Engine 2)';

    if (rawTextInput && rawTextInput.trim()) {
      extractedOcrText = rawTextInput.trim();
      ocrEngineUsed = 'Provided Document Text';
    } else if (fileBuffer || base64Image) {
      try {
        const ocrResponse = await callOcrSpaceApi({
          buffer: fileBuffer,
          base64Image,
          mimeType,
          fileName
        });
        extractedOcrText = ocrResponse.rawText;
      } catch (ocrError) {
        console.error('OCR.Space API failed:', ocrError.message);
        return NextResponse.json(
          {
            success: false,
            error: ocrError.message || 'Failed to extract text from document using OCR.Space',
            details: 'Please ensure the image is clear, under 10MB, and in supported format (JPG, PNG, PDF).'
          },
          { status: 422 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'No document file, image, or text provided for digitization.',
          details: 'Please attach a medical document (prescription, lab report, or treatment record).'
        },
        { status: 400 }
      );
    }

    if (!extractedOcrText || extractedOcrText.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No text could be extracted from this document.',
          details: 'The uploaded file appears to be blank, unreadable, or corrupted. Please try a clearer scan.'
        },
        { status: 422 }
      );
    }

    // 3. AI Structuring of OCR Text into AYUSH & Conventional Prescription Record
    const extractionResult = await extractPrescriptionFromOcr(extractedOcrText, fileName);
    const parsedRx = extractionResult.prescription;

    const docType = parsedRx.documentType === 'LAB_REPORT'
      ? 'Lab Report'
      : parsedRx.documentType === 'DISCHARGE_SUMMARY'
      ? 'Discharge Summary'
      : parsedRx.documentType === 'TREATMENT_RECORD'
      ? 'Treatment Record'
      : 'Prescription';

    const extractedDate = parsedRx.prescriptionDate || new Date().toISOString().slice(0, 10);
    const documentTitle = fileName
      ? `Uploaded: ${fileName}`
      : `${parsedRx.ayushSystem || 'AYUSH'} ${docType} - ${extractedDate}`;

    // Format medicines to guarantee both `medications` and legacy `medicines` arrays
    const formattedMedicines = parsedRx.medications.map(m => ({
      name: m.name,
      form: m.form || null,
      dose: m.dose || null,
      dosage: m.dose || null,
      frequency: m.frequency || null,
      duration: m.duration || null,
      timing: m.timing || null,
      anupana: m.anupana || null,
      pathya: m.pathya || null,
      apathya: m.apathya || null,
      route: m.route || null,
      instructions: m.instructions || null
    }));

    const structuredExtractedData = {
      ...parsedRx,
      patientName: parsedRx.patientInfo?.name || null,
      docDate: extractedDate,
      docType,
      ayushSystem: parsedRx.ayushSystem || 'Ayurveda',
      doctor: parsedRx.doctor?.name || null,
      hospitalClinic: parsedRx.doctor?.clinicOrHospital || null,
      diagnosis: parsedRx.diagnosis || null,
      symptoms: parsedRx.symptoms || null,
      medications: formattedMedicines,
      medicines: formattedMedicines,
      treatment: parsedRx.procedures?.map(p => p.name).join('; ') || null,
      followUp: parsedRx.followUp || null,
      otherInfo: parsedRx.generalInstructions || (parsedRx.pathya ? `Pathya: ${parsedRx.pathya}` : null),
      summary: `Digitized ${parsedRx.ayushSystem || 'AYUSH'} ${docType} dated ${extractedDate} containing ${formattedMedicines.length} medicine(s).`
    };

    const structuredDocument = {
      id: `doc_${Date.now()}`,
      title: documentTitle,
      docType,
      docDate: extractedDate,
      fileUrl: base64Image || null,
      ocrText: extractedOcrText,
      extractedData: structuredExtractedData,
      summary: structuredExtractedData.summary
    };

    return NextResponse.json({
      success: true,
      document: structuredDocument,
      prescription: parsedRx,
      ocrEngine: ocrEngineUsed,
      aiProvider: extractionResult.provider
    });

  } catch (error) {
    console.error('Error in Smart Record Digitization OCR route:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during document digitization.',
        details: error.message
      },
      { status: 500 }
    );
  }
}
