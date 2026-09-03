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
  doc.text('AyushCase — Technical Architecture & Technology Stack Summary', margin, 25);
  doc.text(`Page ${pageCount}`, pageWidth - margin - 30, 25);
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, 30, pageWidth - margin, 30);
}

function addTitle(text) {
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(16, 90, 50); // Deep Emerald
  doc.text(text, margin, y);
  y += 22;
}

function addSubtitle(text) {
  checkPageBreak(25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(90, 90, 90);
  doc.text(text, margin, y);
  y += 16;
}

function addSectionHeader(title) {
  checkPageBreak(35);
  y += 8;
  doc.setFillColor(240, 248, 243);
  doc.roundedRect(margin, y - 13, contentWidth, 20, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(16, 90, 50);
  doc.text(title, margin + 8, y + 1);
  y += 18;
}

function addTechRow(category, techList, description) {
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 20);
  doc.text(`• ${category}: `, margin + 5, y);
  
  const catWidth = doc.getTextWidth(`• ${category}: `);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 120, 70);
  doc.text(techList, margin + 5 + catWidth, y);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  const splitDesc = doc.splitTextToSize(description, contentWidth - 15);
  doc.text(splitDesc, margin + 15, y);
  y += splitDesc.length * 10 + 6;
}

function addModuleCard(title, points) {
  checkPageBreak(points.length * 12 + 25);
  doc.setFillColor(250, 252, 251);
  doc.setDrawColor(220, 235, 225);
  doc.roundedRect(margin, y, contentWidth, points.length * 11 + 22, 4, 4, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(16, 90, 50);
  doc.text(`⚡ ${title}`, margin + 8, y + 13);
  
  let itemY = y + 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  
  points.forEach((pt) => {
    doc.text(`- ${pt}`, margin + 12, itemY);
    itemY += 11;
  });

  y += points.length * 11 + 28;
}

// ================= BUILD PDF =================

drawHeaderFooter();

// Title & Meta
addTitle('AyushCase — Technology Stack & Implementation Summary');
addSubtitle('Smart India Hackathon 2026 | Ministry of Ayush Problem Statement');
y += 4;

// SECTION 1: CORE TECH STACK
addSectionHeader('1. Complete Technology Stack in Brief');

addTechRow(
  'Frontend Framework',
  'Next.js 14 (App Router), React 18',
  'Server-side rendering (SSR) and dynamic client components with seamless routing, React hooks, and context state.'
);

addTechRow(
  'Styling & Design System',
  'Tailwind CSS, Glassmorphism, Vanilla CSS Tokens',
  'Modern clinical responsive layout, dark/light emerald accents, accessible UI badges, and animated feedback states.'
);

addTechRow(
  'Database & ORM',
  'Prisma ORM 5.21, SQLite (PostgreSQL Ready)',
  'Declarative schema management with relations for Doctor, Patient, CaseRecord, and MedicalDocument models.'
);

addTechRow(
  'Authentication & Security',
  'NextAuth.js v4 (JWT Strategy), Bcrypt.js',
  'Secure session cookies, encrypted password hashing, and role-based doctor/patient access control.'
);

addTechRow(
  'AI & LLM Architecture',
  'Hybrid Multi-Model (Gemini 1.5 Flash, GPT-4o, Classical Fallback)',
  'Dynamic model orchestration with strict domain guardrails, structured JSON output parsers, and zero-latency offline knowledge fallback.'
);

addTechRow(
  'Voice & Speech Engine',
  'Native Browser Web Speech API (webkitSpeechRecognition)',
  'Real-time bilingual voice dictation (Hindi & English), on-device speech processing, and zero audio API cost.'
);

addTechRow(
  'OCR & Document Extraction',
  'Custom Clinical Named-Entity Recognition (NER)',
  'Multi-entity parser for prescriptions, lab tests, reference range comparisons, and HIGH/LOW abnormality flags.'
);

addTechRow(
  'PDF Generation & Export',
  'jsPDF 2.5, html2canvas',
  'Automated client/server PDF generation for printable Ayurvedic clinical case sheets, medical passports, and reports.'
);

addTechRow(
  'Deployment & Cloud',
  'Vercel Serverless Platform, Git CI/CD',
  'Continuous deployment with automated prisma client generation and self-healing serverless database auto-seeding.'
);

// SECTION 2: ARCHITECTURAL MODULES
addSectionHeader('2. Key Functional Modules Implemented');

addModuleCard('Patient Portal & AI Pre-Consultation Intake', [
  'Bilingual interface (English & Hindi) with explicit digital informed consent.',
  '1-Click Demo Auto-fill (Rajesh Kumar) for instant presentation flow.',
  'Captures demographics, blood group, contact, and official 14-digit ABHA ID.'
]);

addModuleCard('Conversational AI History-Taking & Emergency Triage', [
  'Voice & typed conversation progressively covering 7 clinical stages (Complaint, HPI, Past, Meds, Family, Lifestyle, Agni).',
  'Strict scope constraint: Collects history only without issuing autonomous diagnoses.',
  'Synchronous Red-Flag Emergency detection for cardiac, stroke, respiratory, and acute hemorrhage symptoms.'
]);

addModuleCard('OCR Document Digitization & Medical Timeline', [
  'Uploads prescriptions, lab panels, and discharge summaries with 1-click sample presets.',
  'Extracts medicines, dosages, and lab parameters with abnormal threshold indicators.',
  'Chronological Medical Timeline interleaving historical visits and external OCR records.'
]);

addModuleCard('Physician-Ready Summary & 1-Click Doctor Pre-fill', [
  'Synthesizes conversational history + OCR records with mandatory "Doctor verification required" disclaimer.',
  '1-Click "⚡ Start Consultation" pre-populates case sheet, saving ~15 minutes of doctor documentation time.'
]);

addModuleCard('Ayush AI Floating Assistant (4 Specialized Personas)', [
  'AyurVaidya (Classical Ayurveda & Doshas), Clinical Pariksha (Doctor Guide), AyushGuard (Herb-Drug Safety), AyushCare (Patient Companion).',
  'Strict Domain Boundary: Filters out non-medical and non-AYUSH questions with polite redirection.',
  'Strict Project Identity: Identifies exclusively as the AyushCase Clinical AI Assistant.'
]);

addModuleCard('AYUSH Clinical Intelligence & ABDM Interoperability', [
  '8-Parameter Prakriti algorithm with dynamic Vata-Pitta-Kapha scoring.',
  'Ashtavidha & Dashavidha Pariksha structured physical examination matrices (Nadi, Jihva, Mala, Mutra).',
  'Dual Diagnostic Mapping linking classical Sanskrit terms with WHO ICD-11 codes for ABDM interoperability.'
]);

// FOOTER BADGE
checkPageBreak(40);
y += 10;
doc.setFillColor(16, 90, 50);
doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(255, 255, 255);
doc.text('AyushCase — Built for Smart India Hackathon 2026 | Ministry of Ayush', margin + 12, y + 15);

// Output PDF
const outputPath = path.join(__dirname, '..', 'AyushCase_Technical_Summary.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

console.log('✅ Technical Summary PDF generated successfully at:', outputPath);
