const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doctor = await prisma.doctor.findFirst();
  if (!doctor) {
    console.log('No doctor found');
    return;
  }

  // 1. Enrich Rajesh Kumar with a second follow-up visit to show longitudinal trajectory
  const rajesh = await prisma.patient.findFirst({ where: { name: 'Rajesh Kumar' } });
  if (rajesh) {
    const existingCases = await prisma.caseRecord.findMany({ where: { patientId: rajesh.id } });
    if (existingCases.length === 1) {
      await prisma.caseRecord.create({
        data: {
          patientId: rajesh.id,
          doctorId: doctor.id,
          visitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
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
      });
      console.log('✅ Added 2nd longitudinal follow-up visit for Rajesh Kumar');
    }
  }

  // 2. Add an additional transfer patient: Anita Sharma (Chronic Migraine / Shirahshoola transferring doctors)
  let anita = await prisma.patient.findFirst({ where: { contact: '+91 98234 56789' } });
  if (!anita) {
    anita = await prisma.patient.create({
      data: {
        doctorId: doctor.id,
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
      },
    });

    // Visit 1
    await prisma.caseRecord.create({
      data: {
        patientId: anita.id,
        doctorId: doctor.id,
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
    });

    // Visit 2 (Recent Transfer Evaluation)
    await prisma.caseRecord.create({
      data: {
        patientId: anita.id,
        doctorId: doctor.id,
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
    });
    console.log('✅ Added Anita Sharma (Relocating Patient with 2 detailed consultations & NSAID allergy)');
  }

  const allPatients = await prisma.patient.findMany({
    include: { cases: true }
  });
  console.log(`\n🎉 Total Patients in Database: ${allPatients.length}`);
  allPatients.forEach(p => {
    console.log(`- ${p.name} (Age: ${p.age}, Prakriti: ${p.prakritiType}, Visits: ${p.cases.length}, Allergies: ${p.allergies})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
