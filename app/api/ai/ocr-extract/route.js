import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Sample document templates for instant Hackathon presentation demos
export const SAMPLE_OCR_PRESETS = [
  {
    id: 'sample_lab_1',
    title: 'Dr. Lal PathLabs - Comprehensive Metabolic & Lipid Panel',
    docType: 'Lab Report',
    docDate: '2026-02-18',
    fileUrl: '/samples/lab_report_metabolic.png',
    ocrText: `DR. LAL PATHLABS CLINICAL BIOCHEMISTRY
Patient: Rajesh Kumar | Age: 46 Yrs / Male | Ref Dr: Dr. Sharma
Date of Collection: 18-Feb-2026

TEST PARAMETERS                      VALUE    UNIT     REFERENCE RANGE   FLAG
Fasting Blood Sugar (FBS)            108      mg/dL    70 - 99           HIGH
HbA1c (Glycated Hemoglobin)          6.2      %        < 5.7             HIGH (Prediabetes)
Serum Uric Acid                      7.8      mg/dL    3.4 - 7.0         HIGH (Hyperuricemia)
Serum Calcium                        9.2      mg/dL    8.5 - 10.2        NORMAL
Total Cholesterol                    218      mg/dL    < 200             HIGH
Serum Triglycerides                  185      mg/dL    < 150             HIGH
HDL Cholesterol                      42       mg/dL    > 40              NORMAL
LDL Cholesterol                      139      mg/dL    < 100             HIGH
ESR (Westergren)                     32       mm/hr    0 - 15            HIGH (Inflammatory marker)
C-Reactive Protein (CRP)             8.4      mg/L     < 5.0             HIGH

Impression: Mild Hyperuricemia, Prediabetic range dysglycemia, elevated inflammatory markers (ESR, CRP) consistent with joint inflammation / arthritis.`,
    extractedData: {
      docType: 'Lab Report',
      date: '2026-02-18',
      laboratory: 'Dr. Lal PathLabs',
      diagnoses: ['Hyperuricemia', 'Impaired Fasting Glucose (Prediabetes)', 'Mild Dyslipidemia', 'Elevated Inflammatory Markers'],
      labValues: [
        { parameter: 'Fasting Blood Sugar', value: '108', unit: 'mg/dL', normalRange: '70 - 99', status: 'HIGH' },
        { parameter: 'HbA1c', value: '6.2', unit: '%', normalRange: '< 5.7', status: 'HIGH' },
        { parameter: 'Serum Uric Acid', value: '7.8', unit: 'mg/dL', normalRange: '3.4 - 7.0', status: 'HIGH' },
        { parameter: 'Total Cholesterol', value: '218', unit: 'mg/dL', normalRange: '< 200', status: 'HIGH' },
        { parameter: 'Serum Triglycerides', value: '185', unit: 'mg/dL', normalRange: '< 150', status: 'HIGH' },
        { parameter: 'ESR (1st Hour)', value: '32', unit: 'mm/hr', normalRange: '0 - 15', status: 'HIGH' },
        { parameter: 'C-Reactive Protein (CRP)', value: '8.4', unit: 'mg/L', normalRange: '< 5.0', status: 'HIGH' },
        { parameter: 'Serum Calcium', value: '9.2', unit: 'mg/dL', normalRange: '8.5 - 10.2', status: 'NORMAL' },
      ],
      medicines: [],
      procedures: ['Venipuncture Bio-Chemical Panel'],
      summary: 'Elevated Uric acid (7.8 mg/dL) and high inflammatory markers (ESR 32, CRP 8.4) indicating joint inflammation; early metabolic dysregulation with HbA1c 6.2%.'
    }
  },
  {
    id: 'sample_rx_1',
    title: 'Apollo Hospitals - Orthopedic OPD Prescription',
    docType: 'Prescription',
    docDate: '2026-01-10',
    fileUrl: '/samples/prescription_ortho.png',
    ocrText: `APOLLO HOSPITALS ORTHOPEDICS OPD
Dr. V. K. Mehta (MS Ortho) | Date: 10-Jan-2026
Patient: Rajesh Kumar | Age: 46 M | Weight: 74 kg

Diagnosis: Bilateral Knee Osteoarthritis (Grade II) with Pes Anserine Tendinitis.
Advise / Rx:
1. Tab Aceclofenac 100mg + Paracetamol 325mg (Zerodol-P) - 1 tab BD x 7 days after food (SOS pain)
2. Tab Pantoprazole 40mg (Pan-40) - 1 tab OD before breakfast x 7 days
3. Cap Diacerein 50mg + Glucosamine 750mg - 1 cap BD x 30 days
4. Gel Diclofenac (Volini) - Local application BD
5. Quadriceps strengthening exercises, avoid squatting/cross-legged sitting.`,
    extractedData: {
      docType: 'Prescription',
      date: '2026-01-10',
      doctor: 'Dr. V. K. Mehta (MS Ortho)',
      hospital: 'Apollo Hospitals',
      diagnoses: ['Bilateral Knee Osteoarthritis (Grade II)', 'Pes Anserine Tendinitis'],
      medicines: [
        { name: 'Aceclofenac + Paracetamol (Zerodol-P)', dose: '100mg + 325mg', timing: 'Twice daily after food', duration: '7 days SOS' },
        { name: 'Pantoprazole (Pan-40)', dose: '40mg', timing: 'Once daily before breakfast', duration: '7 days' },
        { name: 'Diacerein + Glucosamine', dose: '50mg / 750mg', timing: 'Twice daily', duration: '30 days' },
        { name: 'Diclofenac Topical Gel', dose: 'Local application', timing: 'Twice daily', duration: 'As needed' },
      ],
      labValues: [],
      procedures: ['Quadriceps Physical Therapy Advised'],
      summary: 'Prescription for Grade II Knee OA with NSAIDs, gastroprotective agent, cartilage supplements, and physical therapy advice.'
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
      docType: 'Discharge Summary',
      date: '2025-11-20',
      hospital: 'Max Healthcare',
      diagnoses: ['Acute Lumbar Radiculopathy (L4-L5 disc bulge)'],
      medicines: [
        { name: 'Pregabalin', dose: '75mg', timing: 'Bedtime', duration: '14 days' },
        { name: 'Methylcobalamin', dose: '1500 mcg', timing: 'Once daily', duration: '30 days' },
      ],
      labValues: [],
      procedures: ['Epidural Analgesic Trigger Point Infiltration', 'Lumbar MRI'],
      summary: 'Hospitalization for acute L4-L5 lumbar disc radiculopathy managed conservatively with nerve pain stabilizers and physiotherapy.'
    }
  }
];

export async function GET(request) {
  return NextResponse.json({ presets: SAMPLE_OCR_PRESETS });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { presetId, rawText, fileName, fileDataUrl } = body;

    // If presetId is provided, return that high-fidelity structured preset
    if (presetId) {
      const match = SAMPLE_OCR_PRESETS.find(p => p.id === presetId);
      if (match) {
        return NextResponse.json({
          success: true,
          document: match
        });
      }
    }

    // Dynamic OCR parser for uploaded documents
    const textToParse = rawText || `Uploaded Medical Document: ${fileName || 'Patient_Record.pdf'}`;
    
    // Extract document type
    let docType = 'Medical Report';
    if (/prescription|rx|tab\.|cap\./i.test(textToParse)) docType = 'Prescription';
    else if (/lab|pathology|blood|serum|test|fbs|hba1c|cholesterol|esr/i.test(textToParse)) docType = 'Lab Report';
    else if (/discharge|ipd|admission|hospital|surgery/i.test(textToParse)) docType = 'Discharge Summary';
    else if (/mri|x-ray|usg|ultrasound|ct scan/i.test(textToParse)) docType = 'Imaging Report';

    // Extract Date
    const dateMatch = textToParse.match(/(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})|(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i);
    const extractedDate = dateMatch ? dateMatch[0] : new Date().toISOString().slice(0, 10);

    // Extract Diagnoses
    const diagnoses = [];
    const diagMatch = textToParse.match(/(?:diagnosis|impression|findings)[:\s]+([^\n\r.]+)/i);
    if (diagMatch && diagMatch[1]) {
      diagnoses.push(diagMatch[1].trim());
    } else {
      diagnoses.push(`${docType} recorded clinical assessment`);
    }

    // Extract Medicines
    const medicines = [];
    const medRegex = /(?:tab|cap|syp|inj|ointment|gel)\.?\s+([A-Za-z0-9\s+-]+?)(?:\s+(\d+\s*(?:mg|ml|mcg|g)))?(?:\s+[-x]\s*([^\n\r]+))?/gi;
    let m;
    while ((m = medRegex.exec(textToParse)) !== null && medicines.length < 5) {
      medicines.push({
        name: m[1].trim(),
        dose: m[2] ? m[2].trim() : 'As directed',
        timing: m[3] ? m[3].trim() : 'Oral / Standard dosing'
      });
    }

    // Extract Lab Values
    const labValues = [];
    const labPatterns = [
      { name: 'Blood Sugar / Glucose', regex: /(?:blood sugar|glucose|fbs|rbs)[:\s]+(\d+)/i, unit: 'mg/dL', normal: '70 - 99' },
      { name: 'HbA1c', regex: /hba1c[:\s]+(\d+\.?\d*)/i, unit: '%', normal: '< 5.7' },
      { name: 'Serum Uric Acid', regex: /uric acid[:\s]+(\d+\.?\d*)/i, unit: 'mg/dL', normal: '3.4 - 7.0' },
      { name: 'Cholesterol', regex: /cholesterol[:\s]+(\d+)/i, unit: 'mg/dL', normal: '< 200' },
      { name: 'ESR', regex: /esr[:\s]+(\d+)/i, unit: 'mm/hr', normal: '0 - 15' },
      { name: 'Hemoglobin (Hb)', regex: /(?:hemoglobin|hb)[:\s]+(\d+\.?\d*)/i, unit: 'g/dL', normal: '13.0 - 17.0' },
      { name: 'Blood Pressure', regex: /(?:bp|blood pressure)[:\s]+(\d{2,3}\/\d{2,3})/i, unit: 'mmHg', normal: '120/80' }
    ];

    for (const pat of labPatterns) {
      const match = textToParse.match(pat.regex);
      if (match && match[1]) {
        const valNum = parseFloat(match[1]);
        let status = 'NORMAL';
        if (pat.name === 'HbA1c' && valNum >= 5.7) status = 'HIGH';
        if (pat.name === 'Serum Uric Acid' && valNum > 7.0) status = 'HIGH';
        if (pat.name === 'Cholesterol' && valNum > 200) status = 'HIGH';
        if (pat.name === 'ESR' && valNum > 15) status = 'HIGH';

        labValues.push({
          parameter: pat.name,
          value: match[1],
          unit: pat.unit,
          normalRange: pat.normal,
          status
        });
      }
    }

    const title = fileName ? `Uploaded: ${fileName}` : `${docType} - ${extractedDate}`;

    const parsedResult = {
      id: `ocr_${Date.now()}`,
      title,
      docType,
      docDate: extractedDate,
      fileUrl: fileDataUrl || null,
      ocrText: textToParse,
      extractedData: {
        docType,
        date: extractedDate,
        diagnoses,
        medicines,
        labValues,
        procedures: docType === 'Discharge Summary' ? ['Hospital Clinical Care'] : [],
        summary: `Digitized ${docType} dated ${extractedDate} containing ${medicines.length} medicine(s) and ${labValues.length} lab parameter(s).`
      }
    };

    return NextResponse.json({
      success: true,
      document: parsedResult
    });
  } catch (error) {
    console.error('Error in OCR extraction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to extract text from document', details: error.message },
      { status: 500 }
    );
  }
}
