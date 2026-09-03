# 🌿 AyushCase — Technology Stack & Implementation Summary
**Project:** AyushCase — Smart Automation AYUSH Patient Case-Taking & Clinical Software  
**Hackathon:** Smart India Hackathon (SIH 2026) | **Ministry:** Ministry of Ayush  

---

## 🛠️ 1. Complete Technology Stack in Brief

| Layer / Domain | Technologies Used | Key Implementation Details |
|---|---|---|
| **Frontend Framework** | **Next.js 14 (App Router)** & **React 18** | High-performance Server-Side Rendering (SSR), dynamic client components, optimized page bundling, and responsive layouts. |
| **Styling & UI** | **Tailwind CSS**, Glassmorphism, Vanilla CSS Tokens | Custom clinical design system, emerald/amber palette, accessible status badges, and micro-animations. |
| **Database & ORM** | **Prisma ORM 5.21**, **SQLite** (PostgreSQL Ready) | Relational schema modeling `Doctor`, `Patient`, `CaseRecord`, and `MedicalDocument` with relational foreign-key indexing. |
| **Authentication** | **NextAuth.js v4 (JWT)** & **Bcrypt.js** | Stateless secure JWT session tokens, encrypted password hashing, and role-based data isolation. |
| **AI & LLM Provider** | **Hybrid Multi-Model Engine** | Integrates **Google Gemini 1.5 Flash**, **OpenAI GPT-4o-mini**, and an embedded **Classical AYUSH Knowledge Engine** fallback. |
| **Voice / Speech Engine** | Native **Web Speech API** (`webkitSpeechRecognition`) | On-device, zero-cost, zero-latency bilingual voice transcription supporting Hindi (`hi-IN`) and Indian English (`en-IN`). |
| **OCR & Document Parsing** | Custom **Clinical Entity Extractor (NER)** | Automatic parsing of prescriptions, lab reports, and discharge summaries with High/Low abnormality indicators. |
| **PDF & Exports** | **jsPDF 2.5** & **html2canvas** | Automated client-side and server-side generation of printable clinical case records and summary documents. |
| **Icons & Assets** | **Lucide React** | Clean, accessible clinical and medical iconography. |
| **Hosting & CI/CD** | **Vercel Serverless Platform** & **GitHub** | Continuous automated deployment with self-healing database auto-seeding (`lib/auto-seed.js`). |

---

## ⚡ 2. Core Functional Modules Implemented

### 1. 🏥 Patient Portal & 5-Step Pre-Consultation Intake (`/patient-portal`)
- **Step 1:** Demographics, Hindi/English language toggle, explicit digital informed consent, and 1-click Demo auto-fill (`Rajesh Kumar`).
- **Step 2:** Conversational AI Health Interview with Voice Dictation & Red Flag emergency detection.
- **Step 3:** Medical Document Upload & OCR entity extraction (prescriptions, lab tests).
- **Step 4:** Chronological Medical Timeline & Physician-Ready Clinical Summary with mandatory verification disclaimer.
- **Step 5:** 1-Click Handover to Doctor console.

### 2. 🚨 Real-Time Red Flag Emergency Triage
- Synchronous regex & semantic token classifier for cardiac pain, stroke signs, respiratory failure, and acute hemorrhage.
- Overrides regular intake to display high-priority emergency triage warnings.

### 3. 📄 OCR Medical Document Digitization & Timeline
- Multi-format upload with built-in presets (Metabolic Panel, Orthopedic Prescription, Discharge Summary).
- Extracts medicines, dosages, and lab parameters with abnormal threshold flags (`HIGH`/`LOW`).
- Generates a unified vertical **Chronological Medical Timeline**.

### 4. 👨‍⚕️ Doctor Portal & 1-Click Case Taking Pre-Fill (`/patients/[id]`)
- Doctor immediately sees AI Clinical Summary, Timeline, and OCR extractions first.
- **"⚡ Start Consultation (Pre-fill from AI)"** auto-populates Chief Complaint, HPI, Past History, Family History, Prakriti, Agni, and Koshta into the case-taking form, saving ~15 minutes per patient.

### 5. 🤖 Ayush AI Floating Assistant (4 Specialized Personas)
- 🌿 **AyurVaidya AI:** Classical Ayurveda, Doshas (Vata/Pitta/Kapha), Prakriti, Dinacharya, and Pathya-Apathya diet.
- 📋 **Clinical Pariksha Assistant:** Ashtavidha Pariksha, Nadi diagnosis, Agni/Koshta, and dual ICD-11 coding.
- 🔬 **AyushGuard:** Herb-Drug interactions (e.g. Guggulu + NSAIDs, Blood thinners + Garlic) and safety warnings.
- 🩺 **AyushCare:** Patient companion, Anupana rules, and pre-consultation readiness.
- **Strict Domain Boundary:** Politely rejects non-medical / non-AYUSH questions.

### 6. 🌿 Classical AYUSH Intelligence & ABDM Compliance
- **8-Parameter Prakriti Algorithm:** Dynamic Vata-Pitta-Kapha percentage scoring.
- **Ashtavidha & Dashavidha Pariksha:** Structured pulse (Nadi), tongue (Jihva), stool (Mala), and urine (Mutra) examination.
- **Dual Diagnostic Mapping:** Ayurvedic disease entities alongside WHO **ICD-11 codes** (e.g., *Sandhigatavata* $\rightarrow$ *FA00 Knee Osteoarthritis*).
- **ABDM 14-Digit ABHA ID:** Automatic formatting and validation utility.
