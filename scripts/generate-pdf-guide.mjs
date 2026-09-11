import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

function createProjectGuidePdf() {
  console.log('📄 Generating AyushCase SIH26047 Complete Project Guide PDF...');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function checkPageBreak(requiredSpace = 20) {
    if (y + requiredSpace > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeaderFooter();
    }
  }

  function drawHeaderFooter() {
    doc.setFontSize(8);
    doc.setTextColor(120, 113, 108);
    doc.text('AyushCase (SIH26047) • Ministry of AYUSH Patient Case-Taking Software', margin, 10);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - margin - 15, pageHeight - 8);
  }

  // Cover / Header Banner
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.roundedRect(margin, y, contentWidth, 38, 3, 3, 'F');

  doc.setTextColor(254, 243, 199); // Gold
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('SMART INDIA HACKATHON 2026 • MINISTRY OF AYUSH', margin + 6, y + 8);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('AyushCase', margin + 6, y + 17);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(209, 250, 229);
  doc.text('Smart Automation & AI Clinical Decision Support System for AYUSH Case-Taking', margin + 6, y + 23);

  doc.setFontSize(8);
  doc.setTextColor(167, 243, 208);
  doc.text('Problem Statement: SIH26047 | Full-Stack EHR & Clinical Decision Support System', margin + 6, y + 31);

  y += 44;

  // Section 1: Executive Summary
  doc.setTextColor(6, 78, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Executive Summary & Core Mission', margin, y);
  y += 6;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(28, 25, 23);
  const summaryText = 'AyushCase is an intelligent clinical case-taking and decision-support web software engineered for the Ministry of AYUSH under Smart India Hackathon 2026 (SIH26047). It bridges the critical gap between classical holistic diagnosis and modern digital healthcare standards by providing an automated, bidirectional ecosystem for patients and clinicians.';
  const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(splitSummary, margin, y);
  y += splitSummary.length * 5 + 4;

  // Section 2: Clinical Problem vs Solution Box
  checkPageBreak(50);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  doc.text('Why AyushCase is Needed (The Clinical Gap):', margin + 4, y + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text('• Lengthy Consultations: Evaluating Ashtavidha Pariksha, Prakriti & Agni takes 35-45 mins manually.', margin + 4, y + 13);
  doc.text('• Paper Prescriptions: Handwritten formulations, lost follow-ups, and unreadable classical scripts.', margin + 4, y + 19);
  doc.text('• Missing Dual Coding: No easy mapping between Ayurvedic Rogas and modern WHO ICD-11 codes.', margin + 4, y + 25);
  doc.text('• Herb-Drug Hazards: Unmonitored interactions when taking herbs alongside allopathic drugs.', margin + 4, y + 31);
  doc.text('• Pre-Consultation Solution: Patients complete pre-intake before meeting doctor, cutting time by 70%.', margin + 4, y + 37);

  y += 48;

  // Section 3: End-to-End Features Breakdown
  checkPageBreak(30);
  doc.setTextColor(6, 78, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Core Features Breakdown', margin, y);
  y += 7;

  const features = [
    {
      title: '1. Pre-Consultation AI Interview (Groq AI / Qwen / Llama)',
      desc: 'Guided 5-step conversational health history intake. Gathers chief complaints, duration, HPI, past illness, and allergies before the patient meets the doctor. Remembers previous answers to prevent repetitive questions.'
    },
    {
      title: '2. Smart Record Digitization (OCR.Space Engine 2)',
      desc: 'Patients take a photo or upload old prescriptions, lab reports, and treatment notes. Secure server-side OCR extracts raw text without exposing API keys.'
    },
    {
      title: '3. Prescription & Medicine Extraction Engine',
      desc: 'Converts raw OCR text into structured medicines with formulation forms (Churna, Vati, Kwath, Taila, Majun, Habb), exact dose, timing (Kala), Anupana (warm water, milk, honey), and duration with strict zero-hallucination safety.'
    },
    {
      title: '4. Patient Digital Health Passport & Popup',
      desc: 'Instant celebratory popup modal on submission with full summary, ABHA compliance card, printable health slip, and raw OCR audit trail.'
    },
    {
      title: '5. Doctor 1-Click Digitized Record Import',
      desc: 'In Tab 5 (Prescription) of Case-Taking, doctors click "Import from Digitized Records" to populate verified medicines, Pathya diet, and Panchakarma therapies directly into the clinical case record in 1 click.'
    },
    {
      title: '6. Dual Diagnostic ICD-11 Mapping',
      desc: 'Dual-coding engine allowing clinicians to formulate classical Ayurvedic diagnoses (Sandhigatavata, Amavata, Amlapitta, Prameha) alongside official WHO ICD-11 diagnostic terminology.'
    },
    {
      title: '7. Multi-Agent AI Clinical Assistant (Ayush AI)',
      desc: '4 specialized AI personas: AyurVaidya (Tridosha & Diet), Clinical Pariksha (Pulse & Tongue guide), AyushGuard (Herb-Drug Interactions), and AyushCare (Patient Companion) powered by Groq Cloud AI.'
    }
  ];

  features.forEach((f) => {
    checkPageBreak(22);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 78, 59);
    doc.text(f.title, margin, y);
    y += 4.5;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const splitDesc = doc.splitTextToSize(f.desc, contentWidth);
    doc.text(splitDesc, margin, y);
    y += splitDesc.length * 4 + 3;
  });

  // Section 4: Slide-by-Slide PPT Guide
  checkPageBreak(40);
  doc.setTextColor(6, 78, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Slide-by-Slide PPT Presentation Structure', margin, y);
  y += 7;

  const slides = [
    { num: 'Slide 1', title: 'Title & Team', points: 'Project Name: AyushCase | SIH26047 | Ministry of AYUSH | Team Members' },
    { num: 'Slide 2', title: 'Problem & Clinical Gap', points: '35-45 min consultation bottleneck, lost paper records, missing ICD-11 dual codes, herb-drug risks.' },
    { num: 'Slide 3', title: 'Our Proposed Solution', points: 'Two-sided architecture: Patient Pre-Intake Portal + Doctor Case-Taking Console with 1-click import.' },
    { num: 'Slide 4', title: 'Smart OCR & Medicine Extraction', points: 'OCR.Space Engine 2 + AI extraction of classical forms (Churna, Vati, Kwath) with Anupana & Kala.' },
    { num: 'Slide 5', title: 'Doctor Clinical Workflow', points: 'Ashtavidha Pariksha, Dual ICD-11 Diagnosis, 1-Click Digitized Import into Prescription Builder.' },
    { num: 'Slide 6', title: 'Multi-Agent Clinical AI', points: 'AyurVaidya AI, Clinical Pariksha, AyushGuard (Drug safety), AyushCare (Patient companion).' },
    { num: 'Slide 7', title: 'Tech Stack & Compliance', points: 'Next.js 14 App Router, SQLite/Prisma, Groq AI (Qwen/Llama), ABHA ID & ABDM readiness.' },
    { num: 'Slide 8', title: 'Impact & Future Scope', points: '70% consultation time reduction, 100% digitized history, zero medical hallucinations.' }
  ];

  slides.forEach((s) => {
    checkPageBreak(14);
    doc.setFillColor(250, 250, 249);
    doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'S');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 95, 70);
    doc.text(`${s.num}: ${s.title}`, margin + 3, y + 4.5);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    doc.text(s.points, margin + 3, y + 9);

    y += 14;
  });

  // Section 5: Technical Stack Summary
  checkPageBreak(35);
  doc.setTextColor(6, 78, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Technology Stack & Architecture', margin, y);
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text('• Frontend & Full-Stack: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons', margin, y);
  doc.text('• Database & ORM: SQLite with Prisma ORM (Patients, Cases, MedicalDocuments)', margin, y + 5);
  doc.text('• AI / LLM Engine: Groq Cloud AI (qwen/qwen3.8-27b, openai/gpt-oss-120b) + Fallback Knowledge Engine', margin, y + 10);
  doc.text('• OCR Service: OCR.Space Engine 2 (Multi-lingual & handwritten document support)', margin, y + 15);
  doc.text('• Health Standards: ABHA ID format validation, WHO ICD-11 Dual Diagnostic Coding, Ministry of Ayush Formulary', margin, y + 20);

  y += 28;

  // Add headers and footers to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawHeaderFooter();
  }

  const outputPath = path.resolve(process.cwd(), 'AyushCase_SIH26047_Complete_Project_Guide.pdf');
  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

  console.log(`✅ PDF successfully generated at: ${outputPath}`);
  console.log(`📊 Total Pages: ${totalPages}`);
}

createProjectGuidePdf();
