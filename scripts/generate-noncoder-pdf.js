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
const margin = 38;
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
  doc.text('AyushCase — Simple Non-Coder Tech Guide (SIH 2026)', margin, 25);
  doc.text(`Page ${pageCount}`, pageWidth - margin - 30, 25);
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, 30, pageWidth - margin, 30);
}

function addTitle(text) {
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
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

function addConceptCard(techName, simpleAnalogy, whatItDoes, whyItMatters) {
  checkPageBreak(75);
  doc.setFillColor(252, 253, 252);
  doc.setDrawColor(215, 235, 222);
  
  // Calculate heights
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const titleText = `🛠️ ${techName}`;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  const analogyLines = doc.splitTextToSize(`Simple Analogy: "${simpleAnalogy}"`, contentWidth - 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const whatLines = doc.splitTextToSize(`• What it actually does: ${whatItDoes}`, contentWidth - 16);
  const whyLines = doc.splitTextToSize(`• Why we used it: ${whyItMatters}`, contentWidth - 16);

  const cardHeight = analogyLines.length * 10 + whatLines.length * 9.5 + whyLines.length * 9.5 + 32;

  checkPageBreak(cardHeight + 10);

  doc.setFillColor(252, 253, 252);
  doc.setDrawColor(210, 235, 220);
  doc.roundedRect(margin, y, contentWidth, cardHeight, 4, 4, 'FD');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(16, 90, 50);
  doc.text(titleText, margin + 8, y + 13);

  let currentY = y + 25;

  // Analogy
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 100, 20); // Warm Amber
  doc.text(analogyLines, margin + 8, currentY);
  currentY += analogyLines.length * 10 + 4;

  // What it does
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text(whatLines, margin + 8, currentY);
  currentY += whatLines.length * 9.5 + 4;

  // Why it matters
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 90, 70);
  doc.text(whyLines, margin + 8, currentY);

  y += cardHeight + 8;
}

function addStepBox(stepNum, stepTitle, stepExplanation) {
  checkPageBreak(40);
  doc.setFillColor(245, 248, 246);
  doc.setDrawColor(220, 230, 225);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const expLines = doc.splitTextToSize(stepExplanation, contentWidth - 25);
  const boxHeight = expLines.length * 9.5 + 24;

  checkPageBreak(boxHeight + 5);

  doc.roundedRect(margin, y, contentWidth, boxHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(16, 90, 50);
  doc.text(`Step ${stepNum}: ${stepTitle}`, margin + 8, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text(expLines, margin + 12, y + 23);

  y += boxHeight + 6;
}

// ================= BUILD PDF =================

drawHeaderFooter();

// Title Cover
addTitle('AyushCase — Non-Coder\'s Guide to Our Technology');
addSubtitle('A Clear, Simple & Analogy-Based Guide to Everything in Our Healthcare System');
y += 4;

// SECTION 1: THE BIG PICTURE
addSectionHeader('1. The Big Picture: How a Web App Works (Restaurant Analogy)');

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(50, 50, 50);
const introText = doc.splitTextToSize(
  'Think of AyushCase like a high-tech modern hospital clinic or restaurant:\n' +
  '1. Frontend (The Dining Hall & Menu): Everything the patient and doctor see, touch, click, and speak to on their screens.\n' +
  '2. Backend (The Kitchen & Chefs): The invisible brain that takes requests, cooks the data, checks rules, and talks to the AI.\n' +
  '3. Database (The Master Filing Cabinet): The ultra-secure digital vault where patient medical records, ABHA IDs, and prescriptions are stored forever.\n' +
  '4. AI Engine (The Expert Medical Assistant): The intelligent assistant that asks health questions, extracts lab numbers, and prepares summaries for the doctor.',
  contentWidth
);
doc.text(introText, margin, y);
y += introText.length * 10 + 10;

// SECTION 2: EVERY TECH COMPONENT EXPLAINED IN SIMPLE WORDS
addSectionHeader('2. Every Technology Used — Explained Simply');

addConceptCard(
  'Next.js 14 & React (The Frontend & Backend Engine)',
  'A super-fast, modular Lego building set for websites that pre-cooks pages before you even open them.',
  'It renders all web pages (Patient Portal, Case Sheets, Dashboard) and handles server requests in one unified framework.',
  'It makes the website load in milliseconds on mobile phones and computers without any lag.'
);

addConceptCard(
  'Prisma ORM & Database (The Digital Filing Cabinet)',
  'An ultra-organized librarian that files every patient record with color-coded labels so nothing is ever lost.',
  'It organizes and links Doctors, Patients, Case History, and Uploaded Documents through strict relationships.',
  'It protects data integrity and allows us to easily switch from SQLite to massive hospital databases (like PostgreSQL) with zero code rewrite.'
);

addConceptCard(
  'NextAuth.js & Bcrypt (The Security Guard & Vault)',
  'A biometric security guard at the hospital door who checks doctor badges and encrypts all passwords into unbreakable codes.',
  'It manages login sessions securely with encrypted JWT tokens and makes sure Doctor A cannot peek into Doctor B\'s patients.',
  'It keeps sensitive patient medical data private, secure, and legally protected.'
);

addConceptCard(
  'Web Speech API (The Built-In Stenographer)',
  'A voice typist built right inside your phone/laptop that listens to Hindi and English without charging any fee.',
  'It converts patient speech into text in real time right in the browser (supporting Hindi hi-IN and English en-IN).',
  'It is 100% free, has zero audio delay, and keeps audio strictly on the patient\'s device without sending private voices to foreign cloud servers.'
);

addConceptCard(
  'OCR & Entity Extraction (The Intelligent Medical Scanner)',
  'A smart assistant who reads messy doctor prescriptions and lab reports and highlights abnormal test results in bright red.',
  'It scans uploaded images or PDFs, extracts medicine names, dosages, and compares lab numbers against standard healthy limits.',
  'Patients don\'t have to manually type long medicine names, and doctors instantly spot HIGH/LOW abnormal test values.'
);

addConceptCard(
  'Hybrid Multi-Model AI (Gemini + OpenAI + Offline Knowledge Fallback)',
  'A team of expert AI consultants backed by an encyclopedia book that works even if the hospital internet cables are cut.',
  'It talks to Google Gemini or ChatGPT when internet is live, but automatically switches to our built-in Ayurvedic knowledge engine if offline.',
  'The website never crashes, never shows empty screens, and works 100% reliably during live hackathon presentations.'
);

addConceptCard(
  'Red Flag Emergency Classifier (The Ambulance Alarm)',
  'An automated hospital alarm that rings immediately if a patient reports life-threatening symptoms.',
  'It scans patient messages for emergency keywords (chest pain, stroke signs, severe breathlessness) and flashes an emergency banner.',
  'It ensures AI never delays emergency care for critical patients, meeting the highest medical safety standards.'
);

addConceptCard(
  'jsPDF (The 1-Click Prescription Printing Press)',
  'An automated digital printer that turns clinical case sheets into official, stamp-ready PDF documents instantly.',
  'It formats patient history, Prakriti scores, Nadi findings, and medicines into a clean, printable Ayurvedic prescription.',
  'Patients and doctors can download, print, or share medical passports with other clinics immediately.'
);

addConceptCard(
  'Vercel & GitHub (The Worldwide Cloud Network)',
  'A 24/7 global delivery network that keeps the website running across the world and updates it automatically whenever code changes.',
  'It hosts the entire website on serverless cloud infrastructure with automated database self-healing on cold starts.',
  'Anyone anywhere can access AyushCase from their mobile or laptop with zero installation required.'
);

// SECTION 3: THE 6-STEP PATIENT-TO-DOCTOR WORKFLOW
addSectionHeader('3. The Entire 6-Step Clinical Flow in Simple Words');

addStepBox(
  1,
  'Patient Signs Up & Gives Consent',
  'Patient enters basic info (Name, Age, ABHA ID), chooses Hindi or English, and clicks 1-Click Auto-Fill Demo.'
);

addStepBox(
  2,
  'AI Conversational Health Interview',
  'Patient speaks or types their problem. The AI asks helpful follow-ups (duration, pain triggers, digestion) while watching for emergency red flags.'
);

addStepBox(
  3,
  'Upload Old Medical Records (OCR)',
  'Patient snaps photos of past prescriptions or blood tests. The system automatically extracts all medicines and highlights abnormal lab numbers.'
);

addStepBox(
  4,
  'Visual Timeline & AI Clinical Summary',
  'The system arranges past visits and lab reports into a neat timeline and creates a doctor-ready summary with a verification warning.'
);

addStepBox(
  5,
  '1-Click Handover to Doctor',
  'Patient clicks "Send to Doctor". The doctor opens the patient profile and sees the full history, saving ~15 minutes of repetitive questioning.'
);

addStepBox(
  6,
  'Doctor Consultation & Official Prescription',
  'Doctor performs physical examination (Pulse/Tongue), reviews the pre-filled case sheet, confirms diagnosis, and prints the official prescription!'
);

// SUMMARY CALLOUT
checkPageBreak(40);
y += 8;
doc.setFillColor(16, 90, 50);
doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(255, 255, 255);
doc.text('AyushCase — Simple, Safe, Scalable & 100% ABDM Compliant Healthcare AI', margin + 12, y + 15);

// Output PDF
const outputPath = path.join(__dirname, '..', 'AyushCase_Non_Coder_Tech_Guide.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

console.log('✅ Non-Coder Tech Guide PDF generated successfully at:', outputPath);
