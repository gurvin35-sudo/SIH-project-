# 🌿 AyushCase — AYUSH Patient Case-Taking Software

**Smart Automation for AYUSH Practitioners**  
*Built for Smart India Hackathon (Ministry of Ayush • Theme: Smart Automation)*

---

## 📖 Overview

**AyushCase** is a modern full-stack clinical case-taking and electronic health record (EHR) software designed specifically for AYUSH (Ayurveda, Yoga & Naturopathy, Unani, Siddha, and Homeopathy) practitioners. It automates traditional clinical workflows while capturing rich classical parameters alongside modern ICD-11 standards.

### ✨ Key Features

1. **🔐 Authentication & Doctor Console**:
   - Secure registration and login using NextAuth with JWT session strategy.
   - Route protection for patient data and clinical records.
   - 1-click **Demo Auto-Fill** for rapid hackathon evaluation.

2. **👥 Patient Management**:
   - Patient registration with demographics, contact, blood group, allergies, and **14-digit ABHA ID** (Ayushman Bharat Health Account).
   - Searchable and filterable patient directory (by name, phone, ABHA ID, gender, and Prakriti type).
   - Longitudinal patient profile and clinical case history timeline.

3. **🌿 Ayurvedic Case-Taking Engine (Core Feature)**:
   - **Chief Complaint & Clinical History**: Presenting symptoms, duration, History of Present Illness (HPI), past medical and family history.
   - **🎙️ Hands-Free Voice-to-Text Dictation**: Native Web Speech API integration with real-time speech transcription into clinical notes.
   - **🧭 Automated Prakriti Assessment Engine**: 8-parameter structured questionnaire that calculates real-time **Vata, Pitta, and Kapha** scores & percentages, with dynamic Dosha meter and auto-identified dominant constitution.
   - **🩺 Ashtavidha Pariksha**: 8-fold classical examination covering *Nadi* (Pulse), *Jihva* (Tongue), *Mala* (Stool), *Mutra* (Urine), *Sparsha* (Touch), *Druk* (Eyes), *Shabda* (Voice), and *Aakriti* (Build), plus *Agni* & *Koshta* assessment.
   - **🔬 Dual Diagnosis**: Classical Ayurvedic *Roga* mapped side-by-side with modern *ICD-11* codes.
   - **💊 Chikitsa & Prescription Builder**: Interactive prescription table with built-in classical Ayurvedic formulary (Vati, Churna, Kwath, Asava, Taila), *Anupana* (vehicle/medium), *Kala* (timing), *Panchakarma* therapy selector, and *Pathya/Apathya* (dietary DOs and DONTs).

4. **📜 Official AYUSH Prescription & Case Sheet**:
   - Clean, professional clinical prescription format with clinic header, ABHA badge, Pariksha grid, and doctor signature block.
   - **1-Click Print** (`window.print`) and **1-Click PDF Download** (using `html2canvas` + `jspdf`).

5. **🌐 Bilingual Support**:
   - Seamless **English / Hindi (हिन्दी)** toggle in the top navigation banner for all UI labels, clinical terminology, and Prakriti questions.

6. **📊 Analytics Dashboard**:
   - KPI metrics: Total Patients, Cases Today, Upcoming 14-day Follow-ups, and Prakriti Distribution breakdown across clinic patients.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) — frontend & backend API routes in one unified project.
- **Language**: JavaScript ONLY (`.js` and `.jsx`, zero TypeScript).
- **Styling**: Tailwind CSS with custom AYUSH herbal palette (Emeralds, Forest green, warm Ochre/Amber, Sand).
- **Database**: SQLite with Prisma ORM (zero-config, file-based `dev.db`, runs anywhere locally out of the box).
- **Authentication**: NextAuth.js (Credentials Provider with `bcryptjs` password hashing).
- **Icons**: Lucide React.
- **Voice Dictation**: Web Speech API.
- **PDF Export**: jsPDF + html2canvas.

---

## 🚀 Quick Start Guide (Step-by-Step for Beginners)

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Run Seed Data
```bash
# Push database schema to SQLite (dev.db)
npx prisma db push

# Seed realistic AYUSH clinic test data
npm run db:seed
```

### 3. Start Development Server
```bash
npm run dev
```

Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Demo Login Credentials

The database is pre-seeded with realistic doctor and patient records:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Doctor** | `dr.sharma@ayushcase.in` | `Password123` | Dr. Ananya Sharma (BAMS, MD Ayu) |

*(You can also simply click the **⚡ Auto Fill** button on the `/login` page to sign in with one click!)*

---

## 📂 Project Structure

```
sih-project/
├── app/
│   ├── layout.js                     # Root layout with Auth & Language providers
│   ├── globals.css                   # Tailwind styles and print CSS
│   ├── page.js                       # Landing page with SIH branding
│   ├── login/page.js                 # Doctor Login (with 1-click Demo Fill)
│   ├── signup/page.js                # Doctor Registration
│   ├── dashboard/page.js             # Doctor Home Dashboard & Prakriti Analytics
│   ├── patients/
│   │   ├── page.js                   # Patient Directory (Search, Filter, Modal)
│   │   ├── new/page.js               # Dedicated Add Patient page
│   │   └── [id]/
│   │       ├── page.js               # Patient Profile & Case History Timeline
│   │       └── case-taking/page.js   # 5-Tab Ayurvedic Case-Taking Engine
│   ├── case-taking/page.js           # Fast Case-Taking Launcher
│   ├── cases/[id]/page.js            # Official Case Record View & PDF Export
│   └── api/
│       ├── auth/[...nextauth]/route.js # NextAuth Handler
│       ├── auth/register/route.js      # Doctor Registration API
│       ├── patients/route.js           # Patients List & Create API
│       ├── patients/[id]/route.js      # Single Patient CRUD API
│       ├── cases/route.js              # Cases List & Create API
│       ├── cases/[id]/route.js         # Single Case CRUD API
│       └── dashboard/stats/route.js    # Dashboard Statistics API
├── components/
│   ├── AuthProvider.js               # SessionProvider client wrapper
│   ├── LanguageContext.js            # English / Hindi (हिन्दी) translation context
│   ├── Navbar.js                     # Header with SIH banner, nav, lang toggle
│   ├── VoiceInputButton.js           # Web Speech API voice-to-text mic component
│   ├── DoshaMeter.js                 # Live Vata/Pitta/Kapha score & progress meter
│   ├── PrescriptionBuilder.js        # Interactive Ayurvedic medicine builder
│   └── CasePrintView.js              # Official AYUSH Case Sheet & PDF generator
├── lib/
│   ├── prisma.js                     # Prisma client singleton
│   ├── auth.js                       # NextAuth options configuration
│   ├── utils.js                      # Helpers (cn, formatDate, ABHA format, dosha colors)
│   └── ayush-data.js                 # Comprehensive Ayurvedic knowledge base
├── prisma/
│   ├── schema.prisma                 # SQLite database schema
│   ├── seed.js                       # Realistic sample data seed script
│   └── test-e2e.js                   # End-to-end database validation test
├── package.json
├── tailwind.config.js
└── jsconfig.json
```

---

## 🏆 Smart India Hackathon Criteria Alignment

- **Smart Automation**: Automates Prakriti calculation from symptoms, links dual Ayurvedic/modern diagnoses, and provides instant voice-to-text dictation.
- **National Standards**: Supports **ABHA ID** (Ayushman Bharat) and **ICD-11** mappings.
- **Ease of Deployment**: Single command setup with zero external cloud dependencies or paid APIs.
