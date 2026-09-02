import bcrypt from 'bcryptjs';

let isSeeding = false;

export async function ensureDatabaseSeeded(prisma) {
  if (isSeeding) return;
  try {
    const patientCount = await prisma.patient.count();
    if (patientCount > 0) return; // already seeded

    isSeeding = true;
    console.log('🌱 Database is empty! Auto-seeding default Doctor & Patient records...');

    // 1. Ensure Doctor
    let doctor = await prisma.doctor.findFirst({
      where: { email: 'dr.sharma@ayushcase.in' },
    });

    if (!doctor) {
      const hashedPassword = await bcrypt.hash('Password123', 10);
      doctor = await prisma.doctor.create({
        data: {
          email: 'dr.sharma@ayushcase.in',
          password: hashedPassword,
          name: 'Dr. Ananya Sharma',
          regNumber: 'AYUSH-DEL-2018-7742',
          clinicName: 'Sanjeevani Ayurvedic Wellness & Research Clinic',
          specialty: 'Kayachikitsa & Panchakarma',
          phone: '+91 98765 43210',
        },
      });
    }

    // 2. Patients & Multi-Visit Cases Data
    const patientsData = [
      {
        abhaId: '91-5521-4432-8819',
        name: 'Anita Sharma',
        age: 38,
        gender: 'Female',
        contact: '+91 98234 56789',
        email: 'anita.sharma@example.com',
        address: 'Model Town, Jaipur, Rajasthan',
        bloodGroup: 'B+',
        allergies: 'Severe sensitivity to Aspirin & NSAIDs (Gastritis trigger)',
        prakritiType: 'Pitta-Vata dominant',
        cases: [
          {
            visitDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
            chiefComplaint: 'Throbbing hemicranial headache (Ardhavabhedaka), nausea, photophobia triggered by sunlight and skipped meals.',
            duration: '2 years',
            hpi: 'Recurrent severe one-sided headaches 2-3 times a week. NSAIDs cause severe gastric distress. Patient seeking root-cause Ayurvedic therapy before relocating.',
            pastMedicalHistory: 'Gastritis induced by analgesics.',
            familyHistory: 'Mother had migraine.',
            vataScore: 5,
            pittaScore: 6,
            kaphaScore: 1,
            prakritiResult: 'Pitta-Vata dominant',
            nadiPariksha: 'Teekshna-Chala Gati - 86 bpm',
            jihvaPariksha: 'Rakta / Ushna (Red edges)',
            malaPariksha: 'Vibandha with burning sensation',
            mutraPariksha: 'Peeta Varna (Concentrated yellow)',
            sparshaPariksha: 'Ushna (Warm forehead during attack)',
            drukPariksha: 'Photophobic (Sensitive to glare)',
            shabdaPariksha: 'Phonophobic',
            aakritiPariksha: 'Madhyama',
            agniType: 'Vishamagni / Tikshnagni',
            koshtaType: 'Krura',
            ayurvedicDiagnosis: 'Ardhavabhedaka (Pitta-Vataja Shirahshoola)',
            modernDiagnosis: 'Migraine without Aura (ICD-11: 8A80.0) with Analgesic-induced Gastropathy',
            prognosis: 'Krichra Sadhya (Chronic but manageable)',
            prescription: JSON.stringify([
              { name: 'Pathyadi Kwath', form: 'Kwath', dose: '20ml with 40ml warm water', anupana: 'Warm water', timing: 'Empty stomach morning and evening' },
              { name: 'Shirashooladivajra Rasa', form: 'Vati', dose: '1 tablet (250mg)', anupana: 'Dashamoola Kwath / Water', timing: 'Twice daily after meals' },
              { name: 'Brahmi Ghrita (Nasya)', form: 'Ghrita', dose: '4 drops in each nostril', anupana: 'Instillation', timing: 'Morning after sunrise' },
              { name: 'Kamadudha Rasa (Mukta Yukta)', form: 'Vati', dose: '1 tablet (250mg)', anupana: 'Milk / Ghee', timing: 'Twice daily' },
            ]),
            panchakarmaAdvice: 'Shirodhara with Ksheerabala Taila (7 sessions) and Pratimarsha Nasya with Anutaila.',
            pathyaDiet: 'Sweet fruits (pomegranate, sweet grapes), soaked raisins, almond milk, cooling coconut water, cumin water.',
            apathyaDiet: 'Skipping breakfast, sour curd, fermented foods, direct midday sun exposure, loud screens at bedtime.',
            lifestyleAdvice: 'Trataka, Anulom Vilom Pranayama, blue-light blocking glasses, strictly 7-8 hours sleep.',
            followUpDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            visitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            chiefComplaint: 'Follow-up: Migraine attack frequency reduced from 3/week to 1 every 2 weeks. Mild evening headache if screen time exceeds 6 hours.',
            duration: 'Improved',
            hpi: 'Nasya and Pathyadi Kwath provided 70% relief. Patient is transferring care due to city relocation.',
            pastMedicalHistory: 'Gastritis resolved on Kamadudha Rasa.',
            familyHistory: 'Mother had migraine.',
            vataScore: 3,
            pittaScore: 4,
            kaphaScore: 2,
            prakritiResult: 'Pitta-Vata (Stabilizing)',
            nadiPariksha: 'Sama Gati - 76 bpm',
            jihvaPariksha: 'Niram / Samanya',
            malaPariksha: 'Prakruta (Regular once daily)',
            mutraPariksha: 'Prakruta',
            sparshaPariksha: 'Sama Sheeta',
            drukPariksha: 'Mild fatigue with screens',
            shabdaPariksha: 'Prakruta',
            aakritiPariksha: 'Madhyama',
            agniType: 'Samagni',
            koshtaType: 'Madhyama',
            ayurvedicDiagnosis: 'Ardhavabhedaka (Controlled / Shamana Phase)',
            modernDiagnosis: 'Chronic Migraine in Remission (ICD-11: 8A80.0)',
            prognosis: 'Sukha Sadhya with lifestyle adherence',
            prescription: JSON.stringify([
              { name: 'Pathyadi Kwath Tablets', form: 'Tablet', dose: '2 tablets', anupana: 'Lukewarm water', timing: 'Morning and evening before food' },
              { name: 'Brahmi Vati (Gold)', form: 'Vati', dose: '1 tablet (125mg)', anupana: 'Warm milk with pinch of cardamom', timing: 'Bedtime' },
              { name: 'Anu Taila', form: 'Taila', dose: '2 drops in each nostril', anupana: 'Pratimarsha Nasya', timing: 'Daily morning' },
            ]),
            panchakarmaAdvice: 'Advised periodic Shirodhara every change of season (Ritu Sandhi).',
            pathyaDiet: 'Maintain Pitta-shamak diet, avoid fasting beyond 4 hours, hydration with fennel/coriander water.',
            apathyaDiet: 'Direct midday sun exposure, sour fermented foods, alcohol, irregular sleep.',
            lifestyleAdvice: 'Continue Anulom Vilom and Shavasana before sleep.',
            followUpDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          },
        ],
      },
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
        cases: [
          {
            visitDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
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
          {
            visitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            chiefComplaint: 'Follow-up for Sandhigatavata: Joint stiffness reduced by 50%, walking comfortably without morning crepitus.',
            duration: '6.5 months (improved)',
            hpi: 'Patient completed 7 sessions of Janu Basti and took Yograj Guggulu regularly. Reports marked reduction in morning stiffness.',
            pastMedicalHistory: 'Known Sandhigatavata (Bilateral OA knee).',
            familyHistory: 'Father had OA knee.',
            vataScore: 4,
            pittaScore: 3,
            kaphaScore: 2,
            prakritiResult: 'Vata-Pitta dominant (Stabilizing)',
            nadiPariksha: 'Mando-Vata Gati - 74 bpm (Balanced)',
            jihvaPariksha: 'Niram (Clean tongue, clear taste sensation)',
            malaPariksha: 'Prakruta (Regular soft bowel movement daily)',
            mutraPariksha: 'Prakruta (Normal)',
            sparshaPariksha: 'Sama-Sheeta (Warmth restored to joints)',
            drukPariksha: 'Prakruta',
            shabdaPariksha: 'Prakruta',
            aakritiPariksha: 'Normal gait',
            agniType: 'Samagni (Normalized)',
            koshtaType: 'Madhyama',
            ayurvedicDiagnosis: 'Sandhigatavata (In Remission / Upashaya Phase)',
            modernDiagnosis: 'Bilateral Knee Osteoarthritis (ICD-11: FA00) - Post-Therapy Follow-up',
            prognosis: 'Sukha Sadhya (Significant relief)',
            prescription: JSON.stringify([
              { name: 'Shallaki MR Tablet', form: 'Tablet', dose: '1 tablet (500mg)', anupana: 'Warm water', timing: 'Twice daily after food' },
              { name: 'Ksheerabala 101 Taila', form: 'Capsule', dose: '1 capsule', anupana: 'Warm milk', timing: 'Bedtime' },
              { name: 'Ashwagandhadhi Lehya', form: 'Avaleha', dose: '1 tsp (10g)', anupana: 'Warm milk', timing: 'Morning empty stomach (Rasayana)' },
            ]),
            panchakarmaAdvice: 'Janu Basti course completed successfully. Advised monthly single-session maintenance.',
            pathyaDiet: 'Warm cooked nutritious diet with desi cow ghee, sesame seeds, drumstick soup.',
            apathyaDiet: 'Excess cold drinks, heavy lentils at night, irregular sleep.',
            lifestyleAdvice: 'Continue isometric quad strengthening and warm water fomentation.',
            followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
    ];

    for (const pData of patientsData) {
      const { cases, ...patientInfo } = pData;
      const createdPatient = await prisma.patient.create({
        data: {
          ...patientInfo,
          doctorId: doctor.id,
        },
      });

      for (const cData of cases) {
        await prisma.caseRecord.create({
          data: {
            ...cData,
            patientId: createdPatient.id,
            doctorId: doctor.id,
          },
        });
      }
    }

    console.log('✅ Auto-seed completed successfully!');
  } catch (err) {
    console.error('Auto-seed error:', err);
  } finally {
    isSeeding = false;
  }
}
