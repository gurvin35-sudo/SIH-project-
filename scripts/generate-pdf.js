const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'pt',
  format: 'a4'
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 40;
const contentWidth = pageWidth - margin * 2;

let y = margin;

function checkPageBreak(spaceNeeded = 40) {
  if (y + spaceNeeded > pageHeight - margin) {
    doc.addPage();
    y = margin;
    drawHeaderFooter();
  }
}

function drawHeaderFooter() {
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text('AyushCase — SIH 2026 Technical Cross-Questioning Guide', margin, 25);
  doc.text(`Page ${pageCount}`, pageWidth - margin - 30, 25);
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, 30, pageWidth - margin, 30);
}

function addTitle(text) {
  checkPageBreak(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(16, 90, 50); // Emerald color
  doc.text(text, margin, y);
  y += 24;
}

function addSubtitle(text) {
  checkPageBreak(30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(text, margin, y);
  y += 18;
}

function addSectionHeader(title) {
  checkPageBreak(40);
  y += 10;
  doc.setFillColor(240, 248, 243);
  doc.roundedRect(margin, y - 14, contentWidth, 22, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(16, 90, 50);
  doc.text(title, margin + 8, y + 1);
  y += 20;
}

function addQuestion(qNum, qText) {
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 30, 30);
  const splitQ = doc.splitTextToSize(`Q${qNum}: ${qText}`, contentWidth);
  doc.text(splitQ, margin, y);
  y += splitQ.length * 13 + 3;
}

function addAnswer(label, text, codeRef = null) {
  checkPageBreak(50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  const fullText = `${label}: ${text}`;
  const splitA = doc.splitTextToSize(fullText, contentWidth - 10);
  
  // Left border bar
  doc.setDrawColor(16, 120, 70);
  doc.setLineWidth(1.5);
  doc.line(margin + 2, y - 2, margin + 2, y + splitA.length * 11);
  
  doc.text(splitA, margin + 8, y + 7);
  y += splitA.length * 11 + 10;

  if (codeRef) {
    checkPageBreak(25);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(40, 80, 140);
    doc.text(`[Code Ref: ${codeRef}]`, margin + 8, y - 2);
    y += 12;
  }
}

// ================= BUILD DOCUMENT =================

drawHeaderFooter();

// Title Cover
addTitle('Smart India Hackathon (SIH 2026) — Technical Q&A Defense');
addSubtitle('Comprehensive Coding, Architecture & AI Cross-Questioning Guide for AyushCase');
y += 5;

// SECTION 1: AI SAFETY & CLINICAL GUARDRAILS
addSectionHeader('1. AI Safety, Clinical Liability & Hallucination Prevention');

addQuestion(1, 'How do you guarantee the AI will not hallucinate a wrong diagnosis or dangerous dosage for a patient?');
addAnswer(
  'Technical Defense',
  'We follow a strict Architectural Decoupling between History Collection and Clinical Decision. The AI in the Patient Portal is strictly programmed as a Conversational Intake Engine, NOT a Diagnostic Engine. The system prompt explicitly forbids the AI from prescribing drugs or issuing clinical diagnoses. Furthermore, all AI-generated drafts are stamped with a mandatory disclaimer ("⚠️ AI-generated draft — Doctor verification required") and require explicit doctor verification before any case record or prescription can be finalized.',
  'app/api/ai/history-interview/route.js, app/api/patient-assessment/route.js'
);

addQuestion(2, 'What happens if a patient enters life-threatening emergency symptoms (e.g., chest pain, stroke)?');
addAnswer(
  'Technical Defense',
  'We implemented an automated, synchronous Red-Flag Rule Engine (detectRedFlags) that inspects every user message via regular expression and semantic token matching across critical categories (cardiovascular, acute respiratory, neurological stroke, severe hemorrhage). If triggered, the conversational intake instantly breaks out of the standard interview, flashes an emergency triage banner, and instructs the patient to seek emergency hospital care.',
  'app/api/ai/history-interview/route.js:detectRedFlags()'
);

addQuestion(3, 'How do you restrict the AI from answering out-of-domain questions (e.g., coding, politics)?');
addAnswer(
  'Technical Defense',
  'We enforce a Two-Tier Guardrail. First, our isQueryInDomain() lexical filter validates the presence of AYUSH and clinical entities while rejecting non-domain tokens. Second, our LLM system prompt uses a locked Persona definition that strictly refuses non-AYUSH inquiries with a polite standard refusal message.',
  'app/api/ai/multi-agents/route.js:isQueryInDomain()'
);

// SECTION 2: DOCUMENT OCR & ENTITY EXTRACTION
addSectionHeader('2. Medical Document Digitization & OCR Pipeline');

addQuestion(4, 'How does your OCR pipeline extract structured data from unstructured or handwritten lab reports?');
addAnswer(
  'Technical Defense',
  'The OCR pipeline combines image text extraction with a Clinical Named-Entity Recognition (NER) parser. It identifies document types (Prescriptions, Lab Panels, Discharge Summaries), maps recognized text into structured JSON schemas (Medicines, Dosages, Lab Parameters), and compares lab values against standard reference ranges to attach HIGH/LOW abnormality flags.',
  'app/api/ai/ocr-extract/route.js'
);

addQuestion(5, 'How is the Chronological Medical Timeline generated from uploaded documents and past visits?');
addAnswer(
  'Technical Defense',
  'We perform an interleaved chronological merge in the patient profile controller. We fetch the MedicalDocument records and CaseRecord historical visits for the patient, sort them descending by timestamp, and render unified milestone cards showing the patient journey across lab reports, OPD visits, and pre-consultation intakes.',
  'app/patients/[id]/page.js'
);

// SECTION 3: SYSTEM ARCHITECTURE & DATABASE
addSectionHeader('3. Database Architecture, Scaling & Performance');

addQuestion(6, 'Why did you choose SQLite with Prisma ORM, and how will this scale to large hospitals?');
addAnswer(
  'Technical Defense',
  'SQLite with Prisma ORM was chosen for lightweight zero-config hackathon execution and Vercel serverless auto-seeding. However, because our schema is fully abstract with Prisma ORM, switching to enterprise PostgreSQL, CockroachDB, or Supabase only requires changing the DATABASE_URL connection string with zero changes to business logic. Our schema includes foreign-key indexes on doctorId, patientId, and visitDate.',
  'prisma/schema.prisma, lib/prisma.js'
);

addQuestion(7, 'How does the doctor save time using the 1-Click Pre-fill feature?');
addAnswer(
  'Technical Defense',
  'When the doctor launches consultation from /patients/[id]/case-taking?fromAi=1, the client useEffect loads the pre-consultation state and auto-populates Chief Complaint, Duration, HPI, Past History, Family History, Prakriti, Agni, and Koshta into the case-taking form, eliminating 10-15 minutes of repetitive questioning per patient.',
  'app/patients/[id]/case-taking/page.js'
);

// SECTION 4: SECURITY & ABDM COMPLIANCE
addSectionHeader('4. Security, NextAuth & ABDM (ABHA) Integration');

addQuestion(8, 'How do you secure patient medical records and prevent unauthorized doctor access?');
addAnswer(
  'Technical Defense',
  'We use NextAuth.js JWT session verification in our Next.js App Router API endpoints. Each CaseRecord and Patient is scoped to the authenticated doctorId. When a doctor queries the API, the session is validated server-side to prevent horizontal privilege escalation (IDOR).',
  'app/api/cases/route.js, app/api/patients/route.js'
);

addQuestion(9, 'How is the ABHA ID (Ayushman Bharat) validated and formatted in your application?');
addAnswer(
  'Technical Defense',
  'We format and validate ABHA numbers against the official 14-digit ABDM standard (XX-XXXX-XXXX-XXXX) using clean utility regex formatters (formatABHA) in lib/utils.js, providing visual ABHA verification badges on both Patient Portal and Doctor Case Sheets.',
  'lib/utils.js:formatABHA()'
);

// SECTION 5: VOICE & SPEECH PIPELINE
addSectionHeader('5. Voice Dictation & Multilingual Processing');

addQuestion(10, 'How does voice intake work in Hindi and English simultaneously without third-party audio costs?');
addAnswer(
  'Technical Defense',
  'We leverage the native Web Speech Recognition API (webkitSpeechRecognition) directly in the browser via VoiceInputButton.js with dynamic language toggling (hi-IN for Hindi, en-IN for Indian English). This provides real-time, zero-latency speech-to-text with zero API cost and full privacy because audio is converted on-device.',
  'components/VoiceInputButton.js'
);

// SECTION 6: MULTI-MODEL LLM & OFFLINE RESILIENCE
addSectionHeader('6. Multi-Model LLM Provider & Offline Fallback');

addQuestion(11, 'What happens if the internet goes down or your OpenAI / Gemini API key expires during evaluation?');
addAnswer(
  'Technical Defense',
  'We engineered a Hybrid AI Provider (lib/ai-provider.js). It dynamically tries live LLM endpoints (Gemini 1.5 Flash / OpenAI GPT-4o-mini) when API keys are configured, but automatically falls back to our embedded Classical AYUSH Knowledge Engine with zero latency if offline. This ensures the app never crashes or returns blank screens during live demos.',
  'lib/ai-provider.js, app/api/ai/multi-agents/route.js'
);

// SECTION 7: AYUSH CLASSICAL CLINICAL DOMAIN
addSectionHeader('7. Classical AYUSH Domain Integration');

addQuestion(12, 'How do you calculate Prakriti percentages and map classical diagnoses to modern ICD-11?');
addAnswer(
  'Technical Defense',
  'Our Prakriti algorithm evaluates an 8-parameter tridoshic questionnaire, calculating real-time Vata, Pitta, and Kapha percentages to determine dominant constitution. In the diagnostic step, we support dual-coding: classical Ayurvedic terminology (e.g. Sandhigatavata) alongside WHO ICD-11 codes (e.g. FA00 Knee Osteoarthritis) for ABDM interoperability.',
  'app/patients/[id]/case-taking/page.js, app/api/cases/route.js'
);

// FINAL SUMMARY BOX
checkPageBreak(70);
y += 10;
doc.setFillColor(245, 245, 245);
doc.roundedRect(margin, y, contentWidth, 55, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(16, 90, 50);
doc.text('💡 Golden Rules for Answering SIH Judges:', margin + 8, y + 14);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(60, 60, 60);
doc.text('1. Emphasize that AI assists history-taking — the DOCTOR always retains diagnostic authority.', margin + 8, y + 26);
doc.text('2. Highlight ABDM/ABHA compliance and dual classical Ayurvedic + ICD-11 interoperability.', margin + 8, y + 36);
doc.text('3. Mention your multi-model architecture with offline knowledge fallback for 100% reliability.', margin + 8, y + 46);

// Save PDF
const outputPath = path.join(__dirname, '..', 'SIH_Judge_Coding_Cross_Questions.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

console.log('✅ PDF generated successfully at:', outputPath);
