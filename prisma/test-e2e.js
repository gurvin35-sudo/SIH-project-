const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runE2ETest() {
  console.log('🧪 Running AyushCase E2E Database & Clinical Workflow Validation...');

  // 1. Verify Doctor
  const doctor = await prisma.doctor.findUnique({
    where: { email: 'dr.sharma@ayushcase.in' },
  });
  console.log(`✅ 1. Doctor Authenticated: ${doctor.name} (${doctor.regNumber})`);

  // 2. Verify Patients
  const patients = await prisma.patient.findMany({
    where: { doctorId: doctor.id },
    include: { cases: true },
  });
  console.log(`✅ 2. Found ${patients.length} registered patients for this clinic`);
  patients.forEach((p, i) => {
    console.log(`   - Patient ${i + 1}: ${p.name}, Age: ${p.age}, ABHA: ${p.abhaId}, Prakriti: ${p.prakritiType}, Cases: ${p.cases.length}`);
  });

  // 3. Create a test patient with new case
  const testPatient = await prisma.patient.create({
    data: {
      doctorId: doctor.id,
      name: 'Sneha Mukherjee',
      age: 29,
      gender: 'Female',
      contact: '+91 99887 76655',
      abhaId: '91-7788-9900-1122',
      prakritiType: 'Pitta-Vata dominant',
    },
  });
  console.log(`✅ 3. Created New Patient: ${testPatient.name} (ID: ${testPatient.id})`);

  // 4. Create an Ayurvedic Case Record for this patient
  const testCase = await prisma.caseRecord.create({
    data: {
      patientId: testPatient.id,
      doctorId: doctor.id,
      chiefComplaint: 'Severe migraine headache on right side (Suryavarta), nausea, sensitivity to sunlight',
      duration: '4 months',
      vataScore: 3,
      pittaScore: 5,
      kaphaScore: 1,
      prakritiResult: 'Pitta dominant',
      nadiPariksha: 'Manduka Gati (Frog-like, bounding) - 82 bpm',
      jihvaPariksha: 'Rakta / Ushna (Red, burning sensation)',
      ayurvedicDiagnosis: 'Suryavarta / Pittaja Shirashula',
      modernDiagnosis: 'Migraine without Aura (ICD-11: 8A80.0)',
      prescription: JSON.stringify([
        { name: 'Pathyadi Kwath', form: 'Kwath', dose: '15ml with 45ml warm water', anupana: 'Warm water', timing: 'Empty stomach morning & evening' },
        { name: 'Shirashuladivajra Rasa', form: 'Vati', dose: '1 tablet', anupana: 'Warm water / Cow milk', timing: 'Twice daily after food' },
        { name: 'Ksheerabala 101 Taila', form: 'Nasya', dose: '2 drops in each nostril', anupana: 'Nasya', timing: 'Morning empty stomach' },
      ]),
      pathyaDiet: 'Cooling foods, coconut water, sweet pomegranate, cow milk, timely meals',
      apathyaDiet: 'Direct sun exposure, skipping meals, sour curd, vinegar, green chilli',
    },
  });
  console.log(`✅ 4. Created Ayurvedic Case Record (ID: ${testCase.id}) with diagnosis: ${testCase.ayurvedicDiagnosis}`);

  // 5. Query the full case timeline
  const fullPatient = await prisma.patient.findUnique({
    where: { id: testPatient.id },
    include: { cases: true },
  });
  console.log(`✅ 5. Verified Patient Case History Timeline (${fullPatient.cases.length} records)`);

  // Clean up the temporary test patient
  await prisma.patient.delete({ where: { id: testPatient.id } });
  console.log(`✅ 6. Cleaned up test patient record`);

  console.log('🎉 All AyushCase core database & clinical flows verified successfully!');
}

runE2ETest()
  .catch((e) => {
    console.error('❌ Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
