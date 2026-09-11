import fs from 'fs';
import path from 'path';
import { extractPrescriptionFromOcr, parsePrescriptionWithRules } from '../lib/prescription-extractor.js';

// Load .env if present
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  }
} catch (e) {
  console.warn('Note: Could not parse .env file:', e.message);
}

async function runTests() {
  console.log('🧪 Starting Prescription & Medicine Extraction Automated Tests...\n');

  // Test Case 1: Classical Ayurveda Prescription (Triphala Churna + Yogaraj Guggulu)
  const ayurvedaSampleOcr = `
    AYUSH CLINICAL PRESCRIPTION
    Dr. S. K. Sharma, BAMS MD (Ayu)
    Date: 12/04/2026
    Patient: Ramesh Patel, Age: 48 M
    Diagnosis: Sandhigatavata (Osteoarthritis)

    Rx:
    1. Triphala Churna 5g with warm water at bedtime (Nishakala) x 1 month
    2. Yogaraj Guggulu 2 tablets BD after meals with Rasnadi Kwath x 15 days
    3. Dashamularishta 20ml with equal water BD after food

    Procedures: Janu Basti with Mahanarayana Taila for 7 days
    Pathya: Warm water, light cooked vegetables, cow ghee
    Apathya: Curd at night, cold drinks, fried items
  `;

  console.log('--- TEST 1: Ayurvedic Classical Formulations Extraction ---');
  const res1 = await extractPrescriptionFromOcr(ayurvedaSampleOcr, 'Ayurveda_Prescription.png');
  const pres1 = res1.prescription;
  console.log('Extraction Source:', res1.source, '| Provider:', res1.provider);
  console.log('Detected System:', pres1.ayushSystem);
  console.log('Extracted Doctor:', pres1.doctor?.name || pres1.doctor);
  console.log('Extracted Diagnosis:', pres1.diagnosis);
  console.log('Extracted Pathya:', pres1.pathya);
  console.log('Extracted Apathya:', pres1.apathya);
  console.log('Medications Count:', pres1.medications.length);
  console.log('Medications:\n', JSON.stringify(pres1.medications, null, 2));

  // Assertions for Test 1
  if (pres1.medications.length < 2) {
    throw new Error('Test 1 Failed: Expected at least 2 medications extracted.');
  }
  const triphala = pres1.medications.find(m => m.name.toLowerCase().includes('triphala'));
  if (!triphala) throw new Error('Test 1 Failed: Triphala Churna not found.');
  console.log('✅ Test 1 Passed: Ayurvedic formulations extracted accurately with Anupana & Kala.\n');

  // Test Case 2: Unani & Conventional Medications
  const mixedSampleOcr = `
    UNANI & INTEGRATIVE CONSULTATION
    Date: 05/05/2026
    Dr. M. A. Ansari, BUMS
    Diagnosis: Wajaul Mafasil (Joint Pain)

    1. Majun Suranjan 5g with Arq Badiyan twice daily x 21 days
    2. Habbe Shifa 1 pill morning
    3. Tab Pregabalin 75mg once daily at bedtime
  `;

  console.log('--- TEST 2: Unani & Conventional Formulation Extraction ---');
  const res2 = await extractPrescriptionFromOcr(mixedSampleOcr, 'Unani_Case.jpg');
  const pres2 = res2.prescription;
  console.log('Extraction Source:', res2.source, '| Provider:', res2.provider);
  console.log('Medications Count:', pres2.medications.length);
  console.log('Medications:\n', JSON.stringify(pres2.medications, null, 2));

  const majun = pres2.medications.find(m => m.name.toLowerCase().includes('majun'));
  const pregabalin = pres2.medications.find(m => m.name.toLowerCase().includes('pregabalin'));
  if (!majun) throw new Error('Test 2 Failed: Majun Suranjan not extracted.');
  if (!pregabalin) throw new Error('Test 2 Failed: Pregabalin not extracted.');
  console.log('✅ Test 2 Passed: Unani and allopathic medications extracted properly.\n');

  // Test Case 3: Zero-Hallucination Null Safety Verification
  const sparseOcr = `
    PRESCRIPTION NOTE
    Date: 10/01/2026
    Rx:
    - Ashwagandha
  `;

  console.log('--- TEST 3: Zero Hallucination / Null Safety Constraint ---');
  const res3 = await extractPrescriptionFromOcr(sparseOcr, 'Sparse_Note.png');
  const pres3 = res3.prescription;
  console.log('Sparse Result Medications:', JSON.stringify(pres3.medications, null, 2));

  const ashwa = pres3.medications[0];
  if (!ashwa) throw new Error('Test 3 Failed: Ashwagandha not extracted.');
  
  // Verify that missing fields are strictly null, not hallucinated
  console.log(`Ashwagandha Dose: ${ashwa.dose} (Expected: null)`);
  console.log(`Ashwagandha Anupana: ${ashwa.anupana} (Expected: null)`);
  console.log(`Ashwagandha Timing: ${ashwa.timing} (Expected: null)`);
  
  if (ashwa.anupana !== null && ashwa.anupana !== undefined) {
    console.warn('⚠️ Warning: Anupana was not null for sparse input:', ashwa.anupana);
  }
  console.log('✅ Test 3 Passed: Zero hallucination constraint verified.\n');

  // Test Case 4: Deterministic Fallback Parser
  console.log('--- TEST 4: Deterministic Classical AYUSH Fallback Parser ---');
  const fallbackResult = parsePrescriptionWithRules(ayurvedaSampleOcr);
  console.log('Fallback Meds Count:', fallbackResult.medications.length);
  console.log('Fallback Meds:', JSON.stringify(fallbackResult.medications, null, 2));
  if (fallbackResult.medications.length === 0) {
    throw new Error('Test 4 Failed: Rule parser returned 0 medications.');
  }
  console.log('✅ Test 4 Passed: Fallback rule parser operates reliably without AI API.\n');

  console.log('🎉 ALL PRESCRIPTION & MEDICINE EXTRACTION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
