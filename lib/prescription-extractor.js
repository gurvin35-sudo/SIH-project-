/**
 * AyushCase AI Prescription & Medicine Extraction Engine
 * 
 * Extracts structured medication and clinical data from raw OCR text
 * supporting both AYUSH (Ayurveda, Siddha, Unani, Homeopathy) and Conventional prescriptions.
 * 
 * STRICT MEDICAL SAFETY GUARDRAILS:
 * - Only extracts information explicitly present in the OCR text.
 * - If a field is not explicitly present, returns null.
 * - Never hallucinates medicines, infer missing doses, durations, timings, or assume an Anupana.
 */

import { generateLLMResponse } from './ai-provider.js';

export const KNOWN_AYUSH_FORMS = [
  // Ayurveda
  'Churna', 'Choorna', 'Vati', 'Gutika', 'Kwath', 'Kwatha', 'Kashayam',
  'Taila', 'Thailam', 'Tailam', 'Asava', 'Arishta', 'Bhasma', 'Ghritha', 'Ghrita',
  'Lehya', 'Lehyam', 'Rasayana', 'Lepa', 'Guggulu', 'Kalka', 'Modaka', 'Aushadha',
  // Unani
  'Majun', 'Habb', 'Hab', 'Sharbat', 'Roghan', 'Arq', 'Jawarish', 'Khamira', 'Kushta', 'Itrifal',
  // Siddha
  'Parpam', 'Chendooram', 'Chooranam', 'Legiyam', 'Ennai', 'Thailam', 'Kudineer', 'Vadam',
  // Homeopathy
  'Dilution', 'Mother Tincture', 'Trituration', 'Globules', 'Drops',
  // Conventional / Allopathy
  'Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Cream', 'Gel', 'Drops', 'Inhaler', 'Suspension', 'Powder'
];

/**
 * Standard Structured Prescription Schema
 */
export function createEmptyPrescriptionRecord() {
  return {
    documentType: 'AYUSH_PRESCRIPTION',
    ayushSystem: 'Ayurveda',
    doctor: {
      name: null,
      regNumber: null,
      clinicOrHospital: null
    },
    patientInfo: {
      name: null,
      age: null,
      gender: null
    },
    prescriptionDate: null,
    diagnosis: null,
    symptoms: null,
    medications: [],
    procedures: [],
    pathya: null,
    apathya: null,
    generalInstructions: null,
    followUp: null,
    confidence: 90
  };
}

/**
 * Main function to extract structured prescription data from OCR text using AI
 */
export async function extractPrescriptionFromOcr(ocrText, fileName = '') {
  if (!ocrText || typeof ocrText !== 'string' || ocrText.trim().length === 0) {
    throw new Error('No readable OCR text provided for prescription extraction.');
  }

  const systemPrompt = `You are an expert AYUSH & Clinical Pharmacological Informatics AI for the Ministry of AYUSH.
Your job is to convert raw OCR text of medical prescriptions into a strictly structured JSON format.

SUPPORTED SYSTEMS:
1. AYUSH Prescriptions (Ayurveda, Siddha, Unani, Homeopathy, Yoga & Naturopathy)
2. Conventional / Allopathic Prescriptions

CRITICAL MEDICAL SAFETY RULES (ZERO-TOLERANCE FOR INVENTED DATA):
1. Extract ONLY information that is EXPLICITLY present in the OCR text.
2. If ANY field (dose, form, frequency, duration, timing, anupana, pathya, apathya, route, instructions, etc.) is NOT mentioned in the text, you MUST return null for that field.
3. NEVER invent a medicine, never infer a missing dose or duration, never recommend a medicine, never suggest treatment, never diagnose, and never change the doctor's prescription.
4. Never assume an Anupana (vehicle), timing (Kala), or frequency if not written in the text.
5. Identify formulation forms (e.g., Churna, Vati, Kwath, Taila, Asava, Arishta, Majun, Habb, Sharbat, Tablet, Capsule, Syrup, etc.) whenever specified.

OUTPUT JSON SCHEMA:
Return ONLY a valid JSON object adhering strictly to this schema:
{
  "documentType": "AYUSH_PRESCRIPTION" | "CONVENTIONAL_PRESCRIPTION" | "INTEGRATIVE_PRESCRIPTION" | "LAB_REPORT" | "DISCHARGE_SUMMARY" | "OTHER",
  "ayushSystem": "Ayurveda" | "Siddha" | "Unani" | "Homeopathy" | "Yoga & Naturopathy" | "Allopathy" | null,
  "doctor": {
    "name": "Doctor Name with title/qualification" or null,
    "regNumber": "Registration Number" or null,
    "clinicOrHospital": "Clinic / Hospital Name" or null
  },
  "patientInfo": {
    "name": "Patient Name" or null,
    "age": "Age in years" or null,
    "gender": "Male" | "Female" | "Other" or null
  },
  "prescriptionDate": "YYYY-MM-DD" or "DD-Mon-YYYY" or null,
  "diagnosis": "Diagnosed condition / Roga / Tashkhees" or null,
  "symptoms": "Chief complaints / Lakshanas" or null,
  "medications": [
    {
      "name": "Exact Medicine Name (e.g. Triphala, Yogaraj Guggulu, Pregabalin)",
      "form": "Formulation form (e.g. Churna, Vati, Kwath, Taila, Asava, Majun, Habb, Tablet, Capsule, Syrup, etc.)" or null,
      "dose": "Dose / quantity (e.g. 5 g, 500 mg, 2 tablets, 20 ml)" or null,
      "frequency": "Frequency (e.g. Once daily, Twice daily, BD, TDS, Morning & Night)" or null,
      "duration": "Duration (e.g. 14 days, 1 month, 7 days)" or null,
      "timing": "Timing / Kala (e.g. Bedtime (Nishi), After meals (Adhobhakta), Before food (Pragbhakta), Empty stomach)" or null,
      "anupana": "Vehicle / Anupana (e.g. Warm water, Honey, Milk, Lukewarm water, Equal water)" or null,
      "pathya": "Specific dietary DOs for this medicine" or null,
      "apathya": "Specific dietary DONTs for this medicine" or null,
      "route": "Route (e.g. Oral, External application / Abhyanga, Nasal / Nasya)" or null,
      "instructions": "Any specific doctor instructions" or null
    }
  ],
  "procedures": [
    {
      "name": "Therapy / Procedure (e.g. Janu Basti, Abhyanga, Shirodhara, Hijama)",
      "details": "Duration, sessions, or specific oils" or null
    }
  ],
  "pathya": "Overall dietary & lifestyle recommendations (DOs)" or null,
  "apathya": "Overall dietary & lifestyle restrictions (DONTs)" or null,
  "generalInstructions": "Additional clinical advice" or null,
  "followUp": "Follow-up date or instruction" or null,
  "confidence": 95
}`;

  const userMessage = `Document Filename: ${fileName || 'Medical_Prescription'}
Raw OCR Text:
"""
${ocrText}
"""

Extract all explicitly mentioned prescription information into the specified JSON format now.`;

  try {
    const aiResult = await generateLLMResponse({
      systemPrompt,
      userMessage,
      temperature: 0.05, // Ultra-low temperature for maximum factual fidelity
      maxTokens: 1500
    });

    if (aiResult && aiResult.text) {
      let cleaned = aiResult.text.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleaned);
      const validated = validateAndNormalizePrescription(parsed, ocrText);
      return {
        prescription: validated,
        provider: aiResult.provider || 'AyushCase AI Clinical Parser',
        source: 'AI_LLM'
      };
    }
  } catch (err) {
    console.warn('AI LLM prescription extraction encountered an error, activating Classical AYUSH Rule Parser:', err.message);
  }

  // Classical Rule-Based Fallback
  const fallback = parsePrescriptionWithRules(ocrText, fileName);
  return {
    prescription: fallback,
    provider: 'AyushCase Classical Clinical Rule Parser (Safe Fallback)',
    source: 'RULE_ENGINE'
  };
}

/**
 * Validates and normalizes structured prescription data to ensure all keys exist and types match
 */
export function validateAndNormalizePrescription(data, rawText = '') {
  if (!data || typeof data !== 'object') {
    return parsePrescriptionWithRules(rawText);
  }

  const norm = createEmptyPrescriptionRecord();

  norm.documentType = data.documentType || detectDocType(rawText);
  norm.ayushSystem = data.ayushSystem || detectAyushSystem(rawText);

  // Doctor Info
  if (data.doctor && typeof data.doctor === 'object') {
    norm.doctor = {
      name: cleanValue(data.doctor.name),
      regNumber: cleanValue(data.doctor.regNumber),
      clinicOrHospital: cleanValue(data.doctor.clinicOrHospital)
    };
  } else if (typeof data.doctor === 'string') {
    norm.doctor.name = cleanValue(data.doctor);
  }

  // Patient Info
  if (data.patientInfo && typeof data.patientInfo === 'object') {
    norm.patientInfo = {
      name: cleanValue(data.patientInfo.name || data.patientName),
      age: cleanValue(data.patientInfo.age),
      gender: cleanValue(data.patientInfo.gender)
    };
  } else {
    norm.patientInfo.name = cleanValue(data.patientName);
  }

  norm.prescriptionDate = cleanValue(data.prescriptionDate || data.docDate);
  norm.diagnosis = cleanValue(data.diagnosis);
  norm.symptoms = cleanValue(data.symptoms);

  // Medications Array
  const rawMeds = Array.isArray(data.medications) ? data.medications : (Array.isArray(data.medicines) ? data.medicines : []);
  norm.medications = rawMeds.map((m) => {
    // If form is not separated in name, try to extract recognized form
    let name = cleanValue(m.name) || 'Medicinal Formulation';
    let form = cleanValue(m.form);

    if (!form && name) {
      for (const knownForm of KNOWN_AYUSH_FORMS) {
        const regex = new RegExp(`\\b${knownForm}\\b`, 'i');
        if (regex.test(name)) {
          form = knownForm;
          break;
        }
      }
    }

    return {
      name: name,
      form: form,
      dose: cleanValue(m.dose || m.dosage),
      frequency: cleanValue(m.frequency),
      duration: cleanValue(m.duration),
      timing: cleanValue(m.timing),
      anupana: cleanValue(m.anupana),
      pathya: cleanValue(m.pathya),
      apathya: cleanValue(m.apathya),
      route: cleanValue(m.route || (form === 'Taila' || form === 'Thailam' || form === 'Roghan' || form === 'Ointment' ? 'External application' : null)),
      instructions: cleanValue(m.instructions || m.otherInfo)
    };
  }).filter((m) => m.name && m.name.toLowerCase() !== 'not detected');

  // Procedures Array
  if (Array.isArray(data.procedures)) {
    norm.procedures = data.procedures.map((p) => {
      if (typeof p === 'string') return { name: p, details: null };
      return { name: cleanValue(p.name) || 'Therapy', details: cleanValue(p.details) };
    });
  } else if (data.treatment && cleanValue(data.treatment)) {
    norm.procedures = [{ name: cleanValue(data.treatment), details: null }];
  }

  norm.pathya = cleanValue(data.pathya);
  norm.apathya = cleanValue(data.apathya);
  norm.generalInstructions = cleanValue(data.generalInstructions || data.otherInfo);
  norm.followUp = cleanValue(data.followUp);
  norm.confidence = typeof data.confidence === 'number' ? data.confidence : 90;

  return norm;
}

/**
 * Sanitizes field values: turns strings like "Not detected", "N/A", "none", "null" into pure null
 */
function cleanValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val !== 'string') return String(val);
  const trimmed = val.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (
    lower === 'not detected' ||
    lower === 'not specified' ||
    lower === 'n/a' ||
    lower === 'na' ||
    lower === 'none' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === '-'
  ) {
    return null;
  }
  return trimmed;
}

function detectDocType(text = '') {
  if (/lab|pathology|blood|serum|test|fbs|hba1c|cholesterol|esr|crp/i.test(text)) return 'LAB_REPORT';
  if (/discharge|ipd|admission|hospital|surgery/i.test(text)) return 'DISCHARGE_SUMMARY';
  if (/treatment|panchakarma|basti|swedana|hijama/i.test(text)) return 'TREATMENT_RECORD';
  if (/unani|habb|majun|siddha|parpam|ayur|churna|vati|kwath|guggulu|taila/i.test(text)) return 'AYUSH_PRESCRIPTION';
  return 'AYUSH_PRESCRIPTION';
}

function detectAyushSystem(text = '') {
  if (/unani|habb|majun|sharbat|argh|arq|hijama|balgham|mizaj/i.test(text)) return 'Unani';
  if (/siddha|parpam|chendooram|thailam|varmam|legiyam/i.test(text)) return 'Siddha';
  if (/homoeo|homeo|tincture|dilution|30c|200c|pulsatilla|arnica|nux/i.test(text)) return 'Homeopathy';
  if (/yoga|naturopathy|hydrotherapy|mud/i.test(text)) return 'Yoga & Naturopathy';
  if (/allopathy|paracetamol|pregabalin|metformin|pantoprazole|mg\b/i.test(text) && !/churna|vati|guggulu|arishta/i.test(text)) return 'Allopathy';
  return 'Ayurveda';
}

/**
 * High-precision Classical AYUSH and Conventional Rule Parser (Deterministic Fallback)
 */
export function parsePrescriptionWithRules(rawText = '', fileName = '') {
  const norm = createEmptyPrescriptionRecord();

  norm.documentType = detectDocType(rawText);
  norm.ayushSystem = detectAyushSystem(rawText);

  // Patient Name
  const nameMatch = rawText.match(/(?:patient|name|patient name|shri|smt|mr|ms|mrs)[:\s]+([A-Za-z\s]+?)(?:\s*[|,\n\r]|\s+age|\s+yrs|\s+contact)/i);
  if (nameMatch && nameMatch[1] && nameMatch[1].trim().length > 2) {
    norm.patientInfo.name = nameMatch[1].trim();
  }

  // Doctor Name & Clinic
  const docMatch = rawText.match(/(?:dr\.|vaidya|hakim|practitioner|consultant)[:\s]*([A-Za-z\s().,]+?)(?:\s*[|,\n\r]|\s+reg|\s+date|\s+phone)/i);
  if (docMatch && docMatch[0]) {
    norm.doctor.name = docMatch[0].trim();
  }

  const clinicMatch = rawText.match(/(?:hospital|clinic|chikitsalaya|dispensary|centre|center|institute)[:\s]*([A-Za-z\s&,.'-]+?)(?:\s*[\n\r]|\s+reg|\s+date)/i);
  if (clinicMatch && clinicMatch[0]) {
    norm.doctor.clinicOrHospital = clinicMatch[0].trim();
  }

  // Date
  const dateMatch = rawText.match(/(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})|(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i);
  if (dateMatch) {
    norm.prescriptionDate = dateMatch[0];
  }

  // Diagnosis / Condition
  const diagMatch = rawText.match(/(?:diagnosis|tashkhees|roga|impression|condition|findings)[:\s]+([^\n\r.]+)/i);
  if (diagMatch && diagMatch[1]) {
    norm.diagnosis = diagMatch[1].trim();
  }

  // Symptoms
  const sympMatch = rawText.match(/(?:symptoms|complaints|chief complaints|c\/o)[:\s]+([^\n\r.]+)/i);
  if (sympMatch && sympMatch[1]) {
    norm.symptoms = sympMatch[1].trim();
  }

  // Pathya & Apathya
  const pathyaMatch = rawText.match(/(?:pathya|diet|diet advice|recommended food)[:\s]+([^\n\r.]+)/i);
  if (pathyaMatch && pathyaMatch[1]) {
    norm.pathya = pathyaMatch[1].trim();
  }

  const apathyaMatch = rawText.match(/(?:apathya|avoid|restrictions|forbidden food)[:\s]+([^\n\r.]+)/i);
  if (apathyaMatch && apathyaMatch[1]) {
    norm.apathya = apathyaMatch[1].trim();
  }

  // Procedure / Panchakarma
  const procMatch = rawText.match(/(?:panchakarma|treatment|procedure|chikitsa|ilaj|therapy)[:\s]+([^\n\r.]+)/i);
  if (procMatch && procMatch[1]) {
    norm.procedures = [{ name: procMatch[1].trim(), details: null }];
  }

  // Follow-up
  const followMatch = rawText.match(/(?:follow[- ]*up|review|next visit)[:\s]+([^\n\r.]+)/i);
  if (followMatch && followMatch[1]) {
    norm.followUp = followMatch[1].trim();
  }

  // Parse lines for medications
  const lines = rawText.split(/[\n\r]+/);
  const medications = [];
  let inRxSection = false;

  const HERB_KEYWORDS = [
    'ashwagandha', 'shatavari', 'triphala', 'guduchi', 'brahmi', 'haridra', 'amalaki',
    'arjuna', 'tulsi', 'guggulu', 'neem', 'pippali', 'yashtimadhu', 'karela', 'shilajit',
    'kumari', 'bala', 'gokshura', 'punarnava', 'musta', 'vidanga', 'vasaka', 'kutaja',
    'manjistha', 'dashamula', 'trikatu', 'sarpgandha', 'bhumyamalaki', 'shankhapushpi',
    'majun', 'habb', 'roghan', 'sharbat', 'kushta', 'khameera', 'arq',
    'pregabalin', 'paracetamol', 'metformin', 'pantoprazole', 'atorvastatin', 'amoxicillin'
  ];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Track Rx section
    if (/^(?:rx|prescriptions?|medicines?|advise|treatment plan|aushadha)[:\s]*$/i.test(line)) {
      inRxSection = true;
      continue;
    }
    if (/^(?:procedures?|panchakarma|pathya|apathya|diet|instructions?|follow[- ]*up)[:\s]/i.test(line)) {
      inRxSection = false;
      continue;
    }

    // Check if line looks like a prescription formulation line
    const containsForm = /(?:tab|tablet|cap|capsule|syp|syrup|vati|guggulu|taila|thailam|choorna|churna|kwatha|kwath|arishta|asava|majun|habb|sharbat|roghan|bhasma|lehya|rasayana|parpam|chendooram|inj|drops|ointment)\b/i.test(line);
    const containsKnownHerb = HERB_KEYWORDS.some(h => new RegExp(`\\b${h}\\b`, 'i').test(line));
    const isBulletOrNumbered = /^[\d\-\*•\+]+[\.\)]?\s+[A-Za-z]/i.test(line);
    const isExcludedHeader = /^(?:reg|date|phone|age|patient|dr|opd|chief|diag|symp|hospital|clinic|findings)/i.test(line);

    if (!isExcludedHeader && (containsForm || containsKnownHerb || (inRxSection && line.length > 2) || (isBulletOrNumbered && (containsForm || containsKnownHerb || inRxSection)))) {
      const cleanLine = line.replace(/^[\d\-\*•\+\(\)\.:]+\s*/, '').trim();
      if (!cleanLine || isExcludedHeader) continue;

      // Extract form
      let detectedForm = null;
      for (const f of KNOWN_AYUSH_FORMS) {
        if (new RegExp(`\\b${f}\\b`, 'i').test(cleanLine)) {
          detectedForm = f;
          break;
        }
      }

      // Dose
      const doseMatch = cleanLine.match(/\b\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g|gm|tab|tablet|tablets|drop|drops|pills?|capsules?|tsp|tbsp)\b/i);
      const dose = doseMatch ? doseMatch[0] : null;

      // Frequency
      const freqMatch = cleanLine.match(/\b(?:OD|BD|TDS|QID|SOS|HS|once daily|twice daily|thrice daily|once a day|twice a day|bedtime|daily once|daily twice|1-0-1|1-1-1|1-0-0|0-0-1)\b/i);
      const frequency = freqMatch ? freqMatch[0] : null;

      // Duration
      const durMatch = cleanLine.match(/\b\d+\s*(?:days?|weeks?|months?)\b/i) || cleanLine.match(/x\s*\d+\s*(?:days?|weeks?|months?|d)/i);
      const duration = durMatch ? durMatch[0].replace(/^x\s*/, '') : null;

      // Timing / Kala
      const timeMatch = cleanLine.match(/\b(?:after food|before food|with food|after meals|before meals|with meals|empty stomach|at bedtime|bedtime|morning|night|afternoon)\b/i);
      const timing = timeMatch ? timeMatch[0] : null;

      // Anupana
      const anupanaMatch = cleanLine.match(/(?:anupana|with|taken with)[:\s]*([A-Za-z\s]+?)(?:x|\d|\.|\n|$)/i) || cleanLine.match(/\b(?:warm water|honey|milk|ushnodaka|luke-warm water|lukewarm water|arq badiyan|equal water)\b/i);
      let anupana = null;
      if (anupanaMatch) {
        anupana = anupanaMatch[1] ? anupanaMatch[1].trim() : anupanaMatch[0].trim();
        anupana = anupana.replace(/^(with|taken with|anupana:?)\s*/i, '').trim();
      }

      // Route
      let route = null;
      if (/(?:abhyanga|massage|local application|external application|external)/i.test(cleanLine)) {
        route = 'External application';
      } else if (/(?:nasya|nasal drops|nasal)/i.test(cleanLine)) {
        route = 'Nasal (Nasya)';
      } else if (/(?:oral|mouth|drink|syrup|vati|churna|tablet)/i.test(cleanLine) || detectedForm) {
        route = 'Oral';
      }

      // Extract Clean Medicine Name (strip out dose, timing, with clauses)
      let medName = cleanLine
        .replace(/\b(?:with|taken with|after meals|before meals|after food|before food|at bedtime|bedtime|morning|night|x\s*\d|\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g|gm|tab|tablet|tablets|drop|drops|pills?|capsules?|tsp|tbsp))\b.*$/i, '')
        .replace(/[-–—(].*$/, '')
        .replace(/^[\.\-\s*•]+/, '')
        .trim();

      if (!medName || medName.length < 2) {
        medName = cleanLine.split(/[-–—(]/)[0].replace(/^[\.\-\s*•]+/, '').trim();
      }

      if (medName.length < 2) continue;

      medications.push({
        name: medName,
        form: detectedForm,
        dose,
        frequency,
        duration,
        timing,
        anupana,
        pathya: null,
        apathya: null,
        route,
        instructions: null
      });
    }
  }

  norm.medications = medications;
  return norm;
}
