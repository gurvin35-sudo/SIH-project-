const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AyushCase database with realistic AYUSH clinical data...');

  // 1. Create Default Doctor
  const hashedPassword = await bcrypt.hash('Password123', 10);
  const doctor = await prisma.doctor.upsert({
    where: { email: 'dr.sharma@ayushcase.in' },
    update: {},
    create: {
      email: 'dr.sharma@ayushcase.in',
      password: hashedPassword,
      name: 'Dr. Ananya Sharma',
      regNumber: 'AYUSH-DEL-2018-7742',
      clinicName: 'Sanjeevani Ayurvedic Wellness & Research Clinic',
      specialty: 'Kayachikitsa & Panchakarma',
      phone: '+91 98765 43210',
    },
  });

  console.log(`✅ Doctor created: ${doctor.name} (${doctor.email})`);

  // 2. Create Sample Patients
  const patientsData = [
    {
      abhaId: '91-4523-8891-2304',
      name: 'Rajesh Kumar',
      age: 46,
      gender: 'Male',
      contact: '+91 98112 34567',
      email: 'rajesh.kumar@example.com',
      address: 'Sector 14, Rohini, New Delhi',
      bloodGroup: 'B+',
      allergies: 'None reported',
      prakritiType: 'Vata-Pitta dominant',
      preConsultationStatus: 'SENT_TO_DOCTOR',
      language: 'en',
      consentGiven: true,
      chiefComplaint: 'Bilateral knee joint pain and morning stiffness for 6 months.',
      duration: '6 months',
      hpi: 'Pain is worse on climbing stairs and during cold weather; relieved with warm fomentation. Walking tolerance reduced to 15 minutes.',
      pastMedicalHistory: 'No diabetes or hypertension. Mild hyperacidity 2 years ago.',
      pastSurgicalHistory: 'None',
      currentMedicines: 'Zerodol-P SOS, Pan-40 OD',
      familyHistory: 'Father had severe knee osteoarthritis.',
      personalHistory: 'Vegetarian, tea twice daily, mild disturbed sleep due to joint stiffness.',
      reviewOfSystems: 'Appetite erratic, bowel tendency to hard stools.',
      ayushAgni: 'Vishamagni',
      ayushKoshta: 'Krura',
      aiSummary: JSON.stringify({
        disclaimer: '⚠️ AI-Generated Clinical Draft — Doctor Verification & Confirmation Required.',
        patientHeader: {
          name: 'Rajesh Kumar',
          age: 46,
          gender: 'Male',
          contact: '+91 98112 34567',
          abhaId: '91-4523-8891-2304',
          bloodGroup: 'B+',
          language: 'English',
          consentGiven: true
        },
        clinicalHistory: {
          chiefComplaint: 'Bilateral knee joint pain, crepitus, and morning stiffness for 6 months.',
          duration: '6 months',
          hpi: 'Progressive stiffness and dull aching pain in both knees, worse in cold weather. Relieved by warm fomentation.',
          pastMedicalHistory: 'Mild hyperacidity 2 years ago. No diabetes or hypertension.',
          currentMedicines: 'Aceclofenac + Paracetamol (SOS), Pantoprazole 40mg',
          allergies: 'None reported (NKDA)',
          familyHistory: 'Father had severe knee osteoarthritis.',
          personalHistory: 'Vegetarian diet, tea 2x daily, sleep occasionally disturbed by pain.',
          reviewOfSystems: 'Vishamagni (variable appetite), Krura Koshta (hard stool tendency)'
        },
        ayushParameters: {
          prakritiTendency: 'Vata-Pitta dominant',
          agni: 'Vishamagni (Variable / Vata)',
          koshta: 'Krura (Hard / Constipated)',
          lifestyleDiet: 'Vegetarian'
        },
        digitizedRecordsSummary: {
          totalDocumentsUploaded: 2,
          extractedPriorMedicines: ['Aceclofenac + Paracetamol 100/325mg', 'Pantoprazole 40mg', 'Diacerein + Glucosamine'],
          extractedLabParameters: ['HbA1c: 6.2% [HIGH]', 'Serum Uric Acid: 7.8 mg/dL [HIGH]', 'ESR: 32 mm/hr [HIGH]']
        },
        physicianBrief: 'Rajesh Kumar (46 Yrs, Male) completed AI pre-consultation intake. Chief complaint of bilateral knee pain for 6 months with early morning stiffness. 2 previous medical records digitized via OCR showing elevated inflammatory markers (ESR 32) and uric acid (7.8 mg/dL). Agni is Vishamagni and Koshta is Krura.'
      }),
      documents: [
        {
          title: 'Dr. Lal PathLabs - Comprehensive Metabolic Panel',
          docType: 'Lab Report',
          docDate: new Date('2026-02-18'),
          ocrText: 'TEST PARAMETERS: Fasting Blood Sugar: 108 mg/dL (HIGH), HbA1c: 6.2% (HIGH), Serum Uric Acid: 7.8 mg/dL (HIGH), ESR: 32 mm/hr (HIGH), CRP: 8.4 mg/L (HIGH).',
          extractedData: JSON.stringify({
            docType: 'Lab Report',
            date: '2026-02-18',
            laboratory: 'Dr. Lal PathLabs',
            diagnoses: ['Hyperuricemia', 'Impaired Fasting Glucose', 'Elevated Inflammatory Markers'],
            labValues: [
              { parameter: 'Serum Uric Acid', value: '7.8', unit: 'mg/dL', normalRange: '3.4 - 7.0', status: 'HIGH' },
              { parameter: 'HbA1c', value: '6.2', unit: '%', normalRange: '< 5.7', status: 'HIGH' },
              { parameter: 'ESR (1st Hour)', value: '32', unit: 'mm/hr', normalRange: '0 - 15', status: 'HIGH' },
              { parameter: 'C-Reactive Protein (CRP)', value: '8.4', unit: 'mg/L', normalRange: '< 5.0', status: 'HIGH' },
              { parameter: 'Fasting Blood Sugar', value: '108', unit: 'mg/dL', normalRange: '70 - 99', status: 'HIGH' }
            ],
            medicines: [],
            summary: 'High Uric acid (7.8 mg/dL) and elevated inflammatory markers (ESR 32, CRP 8.4) indicating joint inflammation.'
          }),
          summary: 'Lab report indicating joint inflammation with elevated ESR, CRP and Uric acid.'
        },
        {
          title: 'Apollo Hospitals - Orthopedics OPD Prescription',
          docType: 'Prescription',
          docDate: new Date('2026-01-10'),
          ocrText: 'Apollo Hospitals OPD: Bilateral Knee Osteoarthritis (Grade II). Rx: Aceclofenac + Paracetamol 100/325 BD, Pan-40 OD, Diacerein + Glucosamine BD.',
          extractedData: JSON.stringify({
            docType: 'Prescription',
            date: '2026-01-10',
            doctor: 'Dr. V. K. Mehta (MS Ortho)',
            diagnoses: ['Bilateral Knee Osteoarthritis (Grade II)', 'Pes Anserine Tendinitis'],
            medicines: [
              { name: 'Aceclofenac + Paracetamol', dose: '100mg + 325mg', timing: 'Twice daily after food', duration: '7 days SOS' },
              { name: 'Pantoprazole (Pan-40)', dose: '40mg', timing: 'Once daily before breakfast', duration: '7 days' },
              { name: 'Diacerein + Glucosamine', dose: '50mg / 750mg', timing: 'Twice daily', duration: '30 days' }
            ],
            labValues: [],
            summary: 'Prescription for Grade II Knee OA with NSAIDs, gastroprotective agent and cartilage supplements.'
          }),
          summary: 'Orthopedic prescription for bilateral knee osteoarthritis.'
        }
      ],
      cases: [
        {
          visitDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
          chiefComplaint: 'Bilateral knee joint pain, crepitus on climbing stairs, morning stiffness for 20 minutes.',
          duration: '6 months',
          hpi: 'Patient reports progressive stiffness and dull aching pain in both knees, worse in cold weather and after sitting for long periods. Relieved by warm fomentation.',
          pastMedicalHistory: 'No history of diabetes or hypertension. Mild hyperacidity 2 years ago.',
          familyHistory: 'Father had severe knee osteoarthritis.',
          vataScore: 6,
          pittaScore: 3,
          kaphaScore: 1,
          prakritiResult: 'Vata-Pitta dominant',
          nadiPariksha: 'Sarpa Gati (Fast, irregular, Vata dominant) - 78 bpm',
          jihvaPariksha: 'Ruksha / Sphutita (Dry, faint white coat on posterior third)',
          malaPariksha: 'Vibandha / Grathita (Tendency to hard dry stool, once every 2 days)',
          mutraPariksha: 'Prakruta (Normal straw yellow, 4-5 times/day)',
          sparshaPariksha: 'Ruksha & Sheeta (Cool touch over extremities, dryness on skin)',
          drukPariksha: 'Ruksha / Alpa (Mild dry eyes, no scleral discoloration)',
          shabdaPariksha: 'Ksheena / Sphutita (Clear, normal pitch)',
          aakritiPariksha: 'Krisha / Chala (Slender build, mild antalgic gait)',
          agniType: 'Vishamagni',
          koshtaType: 'Krura',
          ayurvedicDiagnosis: 'Sandhigatavata (Janu Sandhi)',
          modernDiagnosis: 'Bilateral Knee Osteoarthritis (ICD-11: FA00)',
          prognosis: 'Krichra Sadhya (Manageable with rasayana & local therapies)',
          prescription: JSON.stringify([
            { name: 'Yograj Guggulu', form: 'Vati', dose: '2 tablets (500mg)', anupana: 'Warm water / Rasnadi Kwath', timing: 'Twice daily after meals' },
            { name: 'Ksheerabala 101 Taila', form: 'Capsule', dose: '1 capsule', anupana: 'Warm milk', timing: 'Bedtime' },
            { name: 'Mahanarayana Taila', form: 'Taila (External)', dose: '15 ml', anupana: 'Gentle local massage followed by warm compress', timing: 'Twice daily' },
            { name: 'Triphala Churna', form: 'Churna', dose: '3g', anupana: 'Warm water', timing: 'Bedtime for Koshta Shuddhi' },
          ]),
          panchakarmaAdvice: 'Janu Basti (with Murivenna & Mahanarayana Taila) for 7 sessions; Patra Pinda Sweda.',
          pathyaDiet: 'Fresh warm cooked meals, cow ghee (1 tsp/meal), moong dal, ginger tea, garlic, soaked almonds, boiled warm milk at bedtime.',
          apathyaDiet: 'Cold foods, carbonated drinks, curd at night, raw sprouts, dry snacks/namkeen, excessive fasting, air-conditioned cold exposure.',
          lifestyleAdvice: 'Gentle knee isometric exercises, avoid squatting on floor, daily warm oil self-abhyanga before shower.',
          followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      abhaId: '91-6712-9023-4511',
      name: 'Priya S. Nair',
      age: 32,
      gender: 'Female',
      contact: '+91 97456 12389',
      email: 'priya.nair@example.com',
      address: 'Indiranagar, Bangalore, Karnataka',
      bloodGroup: 'O+',
      allergies: 'Penicillin allergy',
      prakritiType: 'Pitta-Kapha dominant',
      cases: [
        {
          visitDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          chiefComplaint: 'Severe retrosternal burning (heartburn), sour eructations (Tiklodgara), epigastric discomfort after spicy meals.',
          duration: '3 months',
          hpi: 'Patient works late IT shifts with erratic meal timing and high caffeine intake. Symptoms worsen 1-2 hours after food and at night.',
          pastMedicalHistory: 'No major illnesses. Occasional tension headaches.',
          familyHistory: 'Mother has gallstone disease.',
          vataScore: 2,
          pittaScore: 6,
          kaphaScore: 2,
          prakritiResult: 'Pitta dominant',
          nadiPariksha: 'Manduka Gati (Frog-like, leaping, warm - Pitta dominant) - 84 bpm',
          jihvaPariksha: 'Rakta / Ushna (Red tip, yellowish coat at center, burning sensation)',
          malaPariksha: 'Drava / Pitabh (Soft, semi-formed, burning sensation during defecation)',
          mutraPariksha: 'Pitabha / Daha (Slightly dark yellow, mild burning on urination)',
          sparshaPariksha: 'Ushna & Swedayukta (Warm palms, easily sweats)',
          drukPariksha: 'Rakta / Haridra (Mild conjunctival hyperemia, sensitive to bright screen)',
          shabdaPariksha: 'Teekshna / Spashta (Clear, sharp, assertive speech)',
          aakritiPariksha: 'Madhyama / Tejasvi (Medium build, good posture)',
          agniType: 'Tikshnagni',
          koshtaType: 'Mridu',
          ayurvedicDiagnosis: 'Amlapitta (Urdhwaga)',
          modernDiagnosis: 'Gastroesophageal Reflux Disease (GERD) & Hyperacidity (ICD-11: DA40)',
          prognosis: 'Sukha Sadhya (Easily curable with Pitta-samana & dietary discipline)',
          prescription: JSON.stringify([
            { name: 'Avipattikar Churna', form: 'Churna', dose: '3g', anupana: 'Coconut water or lukewarm water', timing: 'Before meals twice daily' },
            { name: 'Kamadudha Rasa (Mukta Yukta)', form: 'Vati', dose: '1 tablet (250mg)', anupana: 'Honey and Ghee', timing: 'Twice daily after meals' },
            { name: 'Sutashekhara Rasa', form: 'Vati', dose: '1 tablet (125mg)', anupana: 'Milk / Warm water', timing: 'Morning and Evening' },
            { name: 'Drakshadi Kashayam', form: 'Kwath', dose: '15 ml with 45 ml warm water', anupana: 'Warm water', timing: 'Morning empty stomach' },
          ]),
          panchakarmaAdvice: 'Virechana therapy (Therapeutic purgation with Trivrit Leha) planned after Agni deepana; Takradhara if stress persists.',
          pathyaDiet: 'Sweet pomegranate, coconut water, coriander/fennel infusion, old barley, moong dal khichdi, soaked raisins, cucumber, sweet melons.',
          apathyaDiet: 'Green chilli, pickles, deep fried food, tea/coffee on empty stomach, vinegar, fermented batters (dosa/idli overnight sour), late night dinner.',
          lifestyleAdvice: 'Sheetali & Sheetkari Pranayama, Vajrasana for 10 minutes post meals, dinner strictly by 7:30 PM.',
          followUpDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      abhaId: '91-3829-1029-7712',
      name: 'Vikramaditya Verma',
      age: 58,
      gender: 'Male',
      contact: '+91 94150 99887',
      email: 'v.verma@example.com',
      address: 'Civil Lines, Lucknow, Uttar Pradesh',
      bloodGroup: 'A+',
      allergies: 'Sulfa drugs',
      prakritiType: 'Kapha-Vata dominant',
      cases: [
        {
          visitDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          chiefComplaint: 'General fatigue, polyuria (frequent urination at night), sweet taste in mouth, numbness in feet.',
          duration: '1 year',
          hpi: 'Patient was diagnosed with elevated fasting glucose (HbA1c 7.8%) 6 months ago. Seeking holistic Ayurvedic management alongside lifestyle therapy.',
          pastMedicalHistory: 'Hypertension (mild, on low dose medication for 3 years).',
          familyHistory: 'Strong maternal history of Diabetes Mellitus.',
          vataScore: 3,
          pittaScore: 2,
          kaphaScore: 5,
          prakritiResult: 'Kapha dominant',
          nadiPariksha: 'Hamsa / Gaja Gati (Slow, heavy, deep pulse) - 68 bpm',
          jihvaPariksha: 'Sama Jihva (Coated thick white layer, sticky saliva in morning)',
          malaPariksha: 'Ama Yukta / Guru (Sluggish evacuation, sensation of incomplete emptying)',
          mutraPariksha: 'Avila / Shwetavarna (Turbid, sweet odor, increased nocturnal frequency)',
          sparshaPariksha: 'Snigdha & Sheeta (Moist skin, cool peripheries)',
          drukPariksha: 'Shweta / Snigdha (Normal sclera, mild morning puffiness)',
          shabdaPariksha: 'Gambhira / Mandra (Heavy, slow, deep pitch)',
          aakritiPariksha: 'Sthula / Sthira (Overweight BMI 28.5, central adiposity)',
          agniType: 'Mandagni',
          koshtaType: 'Madhyama',
          ayurvedicDiagnosis: 'Prameha (Kaphaja / Madhumeha)',
          modernDiagnosis: 'Type 2 Diabetes Mellitus with early neuropathy (ICD-11: 5A11)',
          prognosis: 'Yapya (Manageable with continuous Ahara-Vihara & Rasayana)',
          prescription: JSON.stringify([
            { name: 'Nisha Amalaki Churna', form: 'Churna', dose: '3g', anupana: 'Warm water / Honey', timing: 'Empty stomach morning & evening' },
            { name: 'Mehamudgara Vati', form: 'Vati', dose: '2 tablets', anupana: 'Warm water', timing: 'Twice daily after food' },
            { name: 'Vasant Kusumakar Rasa', form: 'Vati', dose: '1 tablet (125mg)', anupana: 'Cow milk with a pinch of turmeric', timing: 'Morning' },
            { name: 'Triphala Kwath', form: 'Kwath', dose: '30 ml', anupana: 'Warm water', timing: 'Early morning' },
          ]),
          panchakarmaAdvice: 'Udwarthana (Herbal dry powder scrub with Kolakulathadi Churna) for 7 days to reduce Medo Dhatu.',
          pathyaDiet: 'Yava (Barley), Jowar, Ragi, Karela (Bitter gourd), Methi (Fenugreek seeds soaked overnight), Jamun seed powder, warm water with cinnamon.',
          apathyaDiet: 'Refined sugar, sweets, white rice, daytime sleep (Divaswapna), curd, excessive heavy bakery items, potato, sweet fruits in excess.',
          lifestyleAdvice: 'Brisk walking for 45 minutes daily, Surya Namaskar (6 cycles), Kapalabhati & Anulom Vilom Pranayama (15 min).',
          followUpDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        },
      ],
    },
  ];

  for (const pData of patientsData) {
    const { cases, documents, ...patientInfo } = pData;
    const patient = await prisma.patient.upsert({
      where: { abhaId: patientInfo.abhaId },
      update: {
        ...patientInfo,
      },
      create: {
        ...patientInfo,
        doctorId: doctor.id,
      },
    });

    console.log(`✅ Patient created/updated: ${patient.name} (${patient.abhaId})`);

    // Seed cases
    for (const cData of cases) {
      await prisma.caseRecord.create({
        data: {
          ...cData,
          patientId: patient.id,
          doctorId: doctor.id,
        },
      });
    }

    // Seed medical documents if present
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        await prisma.medicalDocument.create({
          data: {
            ...doc,
            patientId: patient.id,
          },
        });
      }
      console.log(`   📄 Added ${documents.length} digitized OCR medical records`);
    }
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
