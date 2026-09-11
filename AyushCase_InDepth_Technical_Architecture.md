# 🌿 AyushCase — Complete In-Depth Technical Architecture & System Specifications

**Project Name:** AyushCase — Smart Automation AYUSH Patient Case-Taking & EHR System  
**Event:** Smart India Hackathon (SIH) | **Theme:** Smart Automation (Ministry of Ayush)  
**Document Type:** Full In-Depth Technical Architecture, Frontend, Backend, Database & AI Pipeline Specification  

---

## 🏛️ 1. High-Level System Architecture & Overview

AyushCase is architected as a **Full-Stack Modular Clinical Platform** built on top of the **Next.js 14 App Router** paradigm. It unifies client-side presentation, serverless RESTful API endpoints, relational database persistence, and an intelligent multi-tier AI/LLM orchestration pipeline into a single, cohesive, high-performance web application.

```
+---------------------------------------------------------------------------------------------------+
|                                      CLIENT LAYER (Browser)                                       |
|  - Next.js 14 React 18 UI Components (Doctor Portal, Patient Portal, Fast Case-Taking)            |
|  - Web Speech API (Hands-Free Voice-to-Text Dictation in Hindi & English)                         |
|  - LanguageContext (Live Hindi/English I18n Toggle) & NextAuth Session Provider                   |
|  - Client-Side Vector/Raster PDF Generation (html2canvas + jsPDF)                                 |
+---------------------------------------------------------------------------------------------------+
                                                │  ▲
                                 HTTPS / REST   │  │  JSON Payloads / JWT
                                                ▼  │
+---------------------------------------------------------------------------------------------------+
|                                APPLICATION & API GATEWAY LAYER                                    |
|  - Next.js Serverless Route Handlers (/api/patients, /api/cases, /api/ai, /api/documents)        |
|  - NextAuth.js v4 Middleware & JWT Token Validation                                               |
|  - Bcrypt.js Salted Password Hashing & Role-Based Access Isolation                                |
|  - Self-Healing Serverless Auto-Seed Orchestrator (lib/auto-seed.js)                              |
+---------------------------------------------------------------------------------------------------+
                                                │  ▲
                                                │  │
                ┌───────────────────────────────┴──┴───────────────────────────────┐
                ▼                                                                  ▼
+-----------------------------------------------+  +-----------------------------------------------+
|         AI & INTELLIGENCE ENGINE              |  |         DATA PERSISTENCE & ORM LAYER          |
|  - Multi-LLM Gateway (Groq, Gemini, GPT-4o)   |  |  - Prisma ORM 5.21 Client Singleton           |
|  - 7-Stage Conversational State Machine       |  |  - SQLite Database Engine (dev.db)            |
|  - Real-Time Emergency Red-Flag Triage Engine |  |  - Relational Schema (Doctor, Patient,        |
|  - Clinical NER Document OCR & Lab Extractor  |  |    CaseRecord, MedicalDocument)               |
|  - Longitudinal Clinical Handover Generator   |  |  - Foreign Key Constraints & Cascade Deletes  |
|  - 4 Persona Multi-Agent Floating Chatbot     |  |  - PostgreSQL / Supabase Migration Ready      |
+-----------------------------------------------+  +-----------------------------------------------+
```

---

## 🎨 2. Frontend Architecture & Technical Components

### 2.1 Core Framework & Rendering Model
- **Next.js 14 (App Router Architecture)**: Utilizes the `app/` directory hierarchy with nested layouts (`app/layout.js`), loading states, and error boundaries.
- **React 18**: Employs React Server Components (RSC) for zero-bundle-size server rendering alongside dynamic Client Components (`'use client'`) for reactive state management.
- **Zero TypeScript Policy**: Built entirely with pure, standardized **Modern JavaScript (ES2023 / JSX)** for maximum developer velocity and straightforward maintainability.

### 2.2 Styling & Clinical Design System
- **Tailwind CSS 3.4**: Configured with an authentic AYUSH herbal color palette:
  - Deep Forest Emeralds (`#0f4c3a`, `#137547`)
  - Warm Sand / Cream Neutrals (`#fbfbfa`, `#f3f4f1`)
  - Ayurvedic Herbal Ochre / Amber (`#d97706`, `#b45309`)
- **Glassmorphism & Micro-Interactions**: Backdrop-blur filters (`backdrop-blur-md`), subtle translucent borders, dynamic focus rings, and animated state transitions.
- **Print Optimization Media Queries**: Specialized `@media print` CSS rules in `app/globals.css` ensuring clean, multi-page paper prescription printing without UI clutter.

### 2.3 State Management & React Contexts
- **`AuthProvider.js`**: Wraps the root layout with NextAuth's `SessionProvider`, managing authenticated doctor session state across page navigation.
- **`LanguageContext.js`**: Custom lightweight React Context providing real-time internationalization (**English $\leftrightarrow$ हिन्दी**) across the entire application without external heavyweight dependencies.

### 2.4 Browser-Native Voice-to-Text Dictation
- **`VoiceInputButton.js`**: Integrates browser-native **Web Speech API** (`webkitSpeechRecognition` / `SpeechRecognition`).
- Features real-time continuous voice streaming, interim transcription feedback, microphone status animations, and automatic language code switching (`hi-IN` for Hindi, `en-IN` for Indian English).
- **Zero Cost & Zero Latency**: Executes on-device without incurring any third-party audio API fees.

### 2.5 Clinical PDF & Export Engine
- **`CasePrintView.js`**: Generates high-fidelity clinical prescriptions and patient summary sheets.
- **`jsPDF 2.5` & `html2canvas`**: Converts DOM nodes into rasterized canvases and vectors, compiling multi-page downloadable PDF case reports with clinic letterheads, ABHA badges, and doctor signatures.

---

## ⚙️ 3. Backend Architecture & Serverless API Routes

### 3.1 Next.js Route Handlers
The backend is completely serverless, utilizing Next.js 14 Route Handlers located under `app/api/`.

| Endpoint Route | HTTP Method(s) | Description / Technical Responsibility |
|---|---|---|
| `/api/auth/[...nextauth]` | `GET`, `POST` | NextAuth callback and session token issuer |
| `/api/auth/register` | `POST` | Doctor signup, unique email verification, password bcrypt hashing |
| `/api/patient-auth/login` | `POST` | Patient portal authentication via Contact / ABHA ID |
| `/api/patient-auth/register` | `POST` | New patient self-registration and intake creation |
| `/api/patients` | `GET`, `POST` | Doctor patient directory, search, multi-field filter, and registration |
| `/api/patients/[id]` | `GET`, `PUT`, `DELETE` | Single patient CRUD, case timeline retrieval, profile updates |
| `/api/cases` | `GET`, `POST` | Clinical consultation record creation and case listing |
| `/api/cases/[id]` | `GET`, `PUT`, `DELETE` | Individual case sheet retrieval, modification, and history review |
| `/api/dashboard/stats` | `GET` | Aggregated clinic KPIs (Total patients, cases today, Prakriti breakdown) |
| `/api/ai/chat` | `POST` | Multi-persona clinical AI assistant orchestration |
| `/api/ai/pre-consult-intake` | `POST` | Conversational AI intake engine with 7-stage state machine |
| `/api/documents/extract` | `POST` | OCR clinical named-entity recognition and lab test analyzer |
| `/api/patient-assessment/[id]/summary` | `GET`, `POST` | Physician-ready clinical handover summary generator |

### 3.2 Security & Authentication Pipeline
- **NextAuth.js v4**: Configured with a stateless **JWT session strategy**. Session tokens are signed, serialized into secure HTTP cookies, and verified on protected routes.
- **Password Encryption**: Employs `bcryptjs` with a cost factor of 10 salt rounds (`bcrypt.hash(password, 10)`).
- **Route Protection Middleware (`middleware.js`)**: Intercepts incoming requests to `/dashboard`, `/patients`, `/cases`, and `/case-taking`, validating doctor session presence and redirecting unauthenticated users to `/login`.

---

## 🗄️ 4. Database Architecture & Relational Schema (Prisma ORM)

### 4.1 Database Engine & ORM
- **Database**: SQLite (`prisma/dev.db`), offering zero-configuration, file-based persistence for local development and rapid hackathon execution.
- **ORM**: **Prisma ORM 5.21** (`@prisma/client`), utilizing declarative schema modeling, type-safe queries, relational joins, and automated migration management.
- **PostgreSQL / Enterprise Ready**: The schema is 100% ANSI SQL compatible; changing `provider = "sqlite"` to `provider = "postgresql"` enables instant cloud deployment to AWS RDS, Supabase, or Neon.

### 4.2 Entity Relationship Model

#### 1. `Doctor` Model
- Primary key `id` (UUID), `name`, `email` (unique), `password` (bcrypt hash), `regNumber`, `clinicName`, `specialty`, `phone`.
- Relations: 1-to-many with `Patient` and 1-to-many with `CaseRecord`.

#### 2. `Patient` Model
- Primary key `id` (UUID), `doctorId` (foreign key), `abhaId` (unique 14-digit ABHA ID), `name`, `age`, `gender`, `contact`, `email`, `bloodGroup`, `allergies`, `prakritiType`.
- **Pre-Consultation & AI Intake Fields**: `preConsultationStatus` (`PENDING`, `IN_PROGRESS`, `SENT_TO_DOCTOR`, `REVIEWED`), `consentGiven`, `consentTimestamp`, `chiefComplaint`, `duration`, `hpi`, `pastMedicalHistory`, `pastSurgicalHistory`, `currentMedicines`, `familyHistory`, `personalHistory`, `ayushAgni`, `ayushKoshta`, `aiSummary` (JSON), `aiInterviewData` (Full chat transcript), `redFlags` (JSON).
- Relations: 1-to-many with `CaseRecord` and 1-to-many with `MedicalDocument`. Cascade deletion configured.

#### 3. `CaseRecord` Model (Ayurvedic Consultation)
- Primary key `id` (UUID), `patientId` (foreign key), `doctorId` (foreign key), `visitDate`.
- **Clinical History**: `chiefComplaint`, `duration`, `hpi`, `pastMedicalHistory`, `familyHistory`.
- **Prakriti Assessment**: `vataScore`, `pittaScore`, `kaphaScore`, `prakritiResult`, `prakritiAnswers` (JSON).
- **Ashtavidha Pariksha**: `nadiPariksha` (Pulse), `jihvaPariksha` (Tongue), `malaPariksha` (Stool), `mutraPariksha` (Urine), `sparshaPariksha` (Touch), `drukPariksha` (Eyes), `shabdaPariksha` (Voice), `aakritiPariksha` (Build).
- **Digestive & Metabolic**: `agniType` (Samagni, Vishamagni, Tikshnagni, Mandagni), `koshtaType` (Mridu, Madhyama, Krura).
- **Dual Diagnosis**: `ayurvedicDiagnosis` (Classical Sanskrit name), `modernDiagnosis` (WHO ICD-11 code), `prognosis` (Sukha Sadhya, Krichra Sadhya, Asadhya, Yapya).
- **Chikitsa & Prescription**: `prescription` (JSON array: formulation name, form, dose, anupana vehicle, timing), `panchakarmaAdvice`, `pathyaDiet` (DOs), `apathyaDiet` (DONTs), `lifestyleAdvice`, `followUpDate`.

#### 4. `MedicalDocument` Model
- Primary key `id` (UUID), `patientId` (foreign key), `title`, `docType` (Prescription, Lab Report, Discharge Summary, Imaging), `docDate`, `ocrText`, `extractedData` (JSON), `summary`, `uploadedBy`.

---

## 🤖 5. AI & Intelligent Systems Architecture

### 5.1 Multi-LLM Provider Architecture (`lib/ai-provider.js`)
AyushCase implements a resilient, multi-tiered AI fallback architecture:
1. **Tier 1 — Groq Cloud API**: Ultra-high-speed inference executing `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, or `qwen-2.5-32b`.
2. **Tier 2 — Google Gemini API**: High-context reasoning via `gemini-1.5-flash`.
3. **Tier 3 — OpenAI API**: General clinical synthesis via `gpt-4o-mini`.
4. **Tier 4 — Classical AYUSH Clinical Fallback Engine**: On-device, offline, zero-latency rule-based Ayurvedic knowledge base derived from classical texts (*Charaka Samhita*, *Sushruta Samhita*, *Ashtanga Hridaya*).

### 5.2 7-Stage Conversational History Intake State Machine
The AI Pre-consultation chatbot progressively collects structured clinical data across 7 distinct states:
1. `CHIEF_COMPLAINT` — Primary presenting symptom and onset.
2. `DURATION_SEVERITY` — Chronicity and severity progression.
3. `HPI` — Modulating factors, triggers, and diurnal variations.
4. `PAST_MEDICAL_SURGICAL` — Previous illnesses, surgeries, and chronic conditions.
5. `CURRENT_MEDICATIONS_ALLERGIES` — Allopathic/Ayurvedic drugs and known hypersensitivities.
6. `FAMILY_LIFESTYLE` — Hereditary diseases, occupational stress, sleep habits.
7. `AYUSH_AGNI_KOSHTA` — Appetite nature (*Agni*) and bowel movement frequency (*Koshta*).

### 5.3 Real-Time Emergency Red-Flag Triage Engine
Synchronous regex and semantic token classifier actively scans patient inputs for life-threatening acute emergencies:
- **Cardiovascular**: Severe crushing chest pain, left arm radiation, profuse diaphoresis.
- **Neurological**: Sudden facial drooping, unilateral arm weakness, slurred speech (FAST criteria).
- **Respiratory**: Severe dyspnea, stridor, cyanosis.
- **Hemorrhagic**: Profuse bleeding, hematemesis, melena.
- When triggered, regular intake is immediately overridden with high-visibility emergency red banners advising immediate hospital emergency admission.

### 5.4 Clinical OCR & Named Entity Recognition (NER) (`lib/prescription-extractor.js`)
- Parses unstructured medical text from uploaded prescriptions and lab reports.
- **Medicine Entity Extraction**: Identifies Ayurvedic forms (Vati, Churna, Kwath, Asava, Bhasma, Taila) and Allopathic forms (Tab, Cap, Syp), extracting strength, dosage schedule (OD, BD, TDS, QID), and anupana (Warm water, Honey, Milk).
- **Laboratory Panel Extraction**: Extracts biochemical markers (HbA1c, Fasting Blood Sugar, Serum Creatinine, Lipid Profile, Liver Enzymes), compares them against clinical reference ranges, and flags abnormalities (`HIGH` / `LOW`).

### 5.5 Longitudinal AI Handover Synthesis Engine (`lib/ai-summary.js`)
- Synthesizes multi-visit clinical trajectories into a concise, physician-ready briefing.
- Generates constitution-based drug safety warnings (e.g., Pitta aggravation warnings for Ushna/heating formulations, Vata warnings for Ruksha/drying herbs).
- Formulates transfer-of-care recommendations for incoming doctors.

### 5.6 4 Specialized Multi-Persona Floating Clinical Agents
1. 🌿 **AyurVaidya AI**: Expert in classical Ayurveda, Tridosha balancing, Prakriti consultation, and Pathya-Apathya dietary regimens.
2. 📋 **Clinical Pariksha Assistant**: Dedicated doctor companion for Ashtavidha Pariksha, Nadi diagnosis, and dual ICD-11 coding.
3. 🔬 **AyushGuard**: Pharmacovigilance agent specialized in Herb-Drug interactions (e.g., Guggulu + NSAIDs, Garlic + Warfarin/Aspirin, Ashwagandha + Sedatives).
4. 🩺 **AyushCare**: Compassionate patient intake guide explaining Ayurvedic concepts, Anupana rules, and consultation readiness.
- **Domain Guardrails**: Strict boundary filtering that politely rejects non-medical and non-AYUSH inquiries.

---

## 🌿 6. Classical AYUSH Clinical Domain Intelligence & ABDM Compliance

### 6.1 Ashtavidha & Dashavidha Pariksha
Structured 8-fold examination engine covering:
- **Nadi** (Pulse examination)
- **Jihva** (Tongue examination — Sama vs Nirama)
- **Mala** (Stool nature)
- **Mutra** (Urine characteristics)
- **Sparsha** (Skin temperature, texture, touch)
- **Druk** (Eyes and vision)
- **Shabda** (Voice, articulation, breath sounds)
- **Aakriti** (Physical constitution, build, gait)

### 6.2 8-Parameter Prakriti Assessment Scoring Algorithm
Calculates real-time quantitative scores and relative percentages for **Vata, Pitta, and Kapha**:
$$\text{Vata \%} = \frac{\text{Vata Score}}{\text{Total Score}} \times 100, \quad \text{Pitta \%} = \frac{\text{Pitta Score}}{\text{Total Score}} \times 100, \quad \text{Kapha \%} = \frac{\text{Kapha Score}}{\text{Total Score}} \times 100$$
Dynamically determines constitutional dominance (e.g., *Vata-Pitta*, *Pitta-Kapha*, *Tridoshic*).

### 6.3 Dual Diagnostic Mapping & ICD-11 Integration
Bridges traditional Indian medicine with global health data standards by pairing classical Ayurvedic disease entities with **WHO ICD-11** classifications:
- *Amavata* $\longrightarrow$ **ICD-11: FA20 (Rheumatoid Arthritis)**
- *Sandhigatavata* $\longrightarrow$ **ICD-11: FA00 (Osteoarthritis of Knee)**
- *Amlapitta* $\longrightarrow$ **ICD-11: DA40 (Gastroesophageal Reflux Disease)**
- *Prameha / Madhumeha* $\longrightarrow$ **ICD-11: 5A11 (Type 2 Diabetes Mellitus)**
- *Tamaka Shwasa* $\longrightarrow$ **ICD-11: CA23 (Bronchial Asthma)**

### 6.4 Ayushman Bharat Digital Mission (ABDM) & ABHA ID
- Implements validation, canonical formatting (`XX-XXXX-XXXX-XXXX`), and badge rendering for the **14-digit Ayushman Bharat Health Account (ABHA ID)** to ensure national EHR interoperability.

---

## 🔄 7. End-to-End Clinical Data Flow

```
[ Patient at Home / Kiosk ]
        │
        ▼
1. /patient-portal (Step 1: Consent & Demographics)
        │
        ▼
2. Conversational AI Intake & Voice Dictation (Step 2: 7-Stage History + Red-Flag Check)
        │
        ▼
3. Medical Document Digitizer (Step 3: Upload Prescriptions & Lab Reports -> OCR NER)
        │
        ▼
4. Synthesis & Timeline (Step 4: Chronological Medical Timeline + AI Summary)
        │
        ▼
5. Handover to Doctor (Step 5: Pre-consultation Status -> "SENT_TO_DOCTOR")
        │
        ▼
[ Doctor in Clinic Console ]
        │
        ▼
6. /patients/[id] (Doctor reviews AI Summary, OCR Reports & Red Flags)
        │
        ▼
7. "⚡ Start Consultation (Pre-fill from AI)" -> Auto-populates 15+ fields in Case Sheet
        │
        ▼
8. Case Taking Engine: Ashtavidha Pariksha, Prakriti Scores, Dual Diagnosis (ICD-11)
        │
        ▼
9. Interactive Prescription Builder: Ayurvedic Formulary, Anupana, Panchakarma, Pathya
        │
        ▼
10. Save & Export: SQLite Persistence + 1-Click Printable PDF Prescription with ABHA Badge
```

---

## 📋 8. Technical Summary Table for Quick Reference

| Dimension | Specification |
|---|---|
| **Frontend Framework** | Next.js 14.2 (App Router), React 18.3 (Server & Client Components) |
| **Language** | JavaScript (ES2023, JSX) — Zero TypeScript for frictionless development |
| **Styling** | Tailwind CSS 3.4, Vanilla CSS Custom Tokens, Print CSS Media Queries |
| **Database** | SQLite (`dev.db`), Zero-config file persistence, PostgreSQL ready |
| **ORM** | Prisma ORM 5.21 with relational foreign keys and cascade deletions |
| **Authentication** | NextAuth.js v4 (JWT session strategy), Bcrypt.js password hashing |
| **AI LLM Gateway** | Groq (Llama 3.3/3.1), Google Gemini 1.5 Flash, OpenAI GPT-4o-mini, Offline Classical AYUSH Knowledge Engine |
| **Voice Engine** | Native Web Speech API (`webkitSpeechRecognition`), Hindi (`hi-IN`) & English (`en-IN`) |
| **OCR & NER** | Custom Clinical Named Entity Recognition & Lab Reference Range Analyzer |
| **PDF & Export** | jsPDF 2.5, html2canvas, Native Browser Print API (`window.print`) |
| **Internationalization** | English and Hindi (हिन्दी) dynamic switching via React Context |
| **Standards Compliance** | ABDM 14-Digit ABHA ID, WHO ICD-11 Dual Diagnostic Coding |
| **Icons** | Lucide React |
